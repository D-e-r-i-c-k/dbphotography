"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  gallerySlug: string;
  publicId: string;
  title: string;
  price: number;
  previewImageUrl: string;
}

export function AddToCartButton({
  gallerySlug,
  publicId,
  title,
  price,
  previewImageUrl,
}: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const id = `${gallerySlug}-${publicId}`; // Using publicId to ensure uniqueness even if sorted differently
  const inCart = items.some((i) => i.id === id);

  const handleClick = () => {
    addItem({
      gallerySlug,
      publicId,
      title,
      price,
      previewImageUrl,
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      className="w-full gap-2"
      onClick={handleClick}
      disabled={inCart}
    >
      <ShoppingBag className="h-4 w-4" />
      {inCart ? "In cart" : `Add to cart · R ${price}`}
    </Button>
  );
}
