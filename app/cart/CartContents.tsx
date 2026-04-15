"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ProtectedImage } from "@/components/gallery/ProtectedImage";
import { Loader2, ShoppingCart, Mail } from "lucide-react";

export function CartContents() {
  const { items, removeItem, clearCart, totalZAR } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleCheckout = useCallback(async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setCheckingOut(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map((item) => ({
            gallerySlug: item.gallerySlug,
            publicId: item.publicId,
            title: item.title,
            price: item.price,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      const { fields, actionUrl } = await res.json();

      // Clear cart before redirect
      clearCart();

      // Build and auto-submit a hidden form to PayFast
      const form = formRef.current;
      if (!form) return;

      form.action = actionUrl;
      form.innerHTML = "";

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      }

      form.submit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setCheckingOut(false);
    }
  }, [items, email, clearCart]);

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        Your cart is empty.{" "}
        <Link href="/galleries" className="text-primary underline-offset-4 hover:underline">
          Browse galleries
        </Link>{" "}
        to add photos.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 py-4 first:pt-0">
            <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              <ProtectedImage
                src={item.previewImageUrl}
                alt={item.title}
                sizes="96px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.title}
              </p>
              <p className="text-sm text-muted-foreground">R {item.price}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(item.id)}
              disabled={checkingOut}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>

      <div className="border-t border-border pt-4">
        <p className="flex justify-between text-lg font-semibold text-foreground">
          <span>Total (ZAR)</span>
          <span>R {totalZAR}</span>
        </p>

        {/* Email input for download link delivery */}
        <div className="mt-4">
          <label
            htmlFor="checkout-email"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Email for download link
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="checkout-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={checkingOut}
              className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Your full-resolution photos will be emailed here after payment.
          </p>
        </div>

        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}

        <Button
          type="button"
          className="mt-4 w-full gap-2"
          onClick={handleCheckout}
          disabled={checkingOut || !email}
        >
          {checkingOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to PayFast…
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Checkout — R {totalZAR}
            </>
          )}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Secure payment via PayFast. Cards, EFT, and SnapScan accepted.
        </p>
      </div>

      {/* Hidden form for PayFast redirect */}
      <form ref={formRef} method="POST" className="hidden" />
    </div>
  );
}
