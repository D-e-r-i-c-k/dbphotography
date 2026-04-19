"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export function HeaderCartLink() {
  const { items } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const count = items.length;

  return (
    <Link
      href="/cart"
      className="flex items-center gap-1.5 transition-colors hover:text-foreground"
    >
      <ShoppingBag className="h-4 w-4" />
      <span>Cart</span>
      {isHydrated && count > 0 && (
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
