"use client";

import Image from "next/image";
import { useCallback } from "react";

interface ProtectedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Preview image with watermark overlay and disabled right-click/drag to deter casual saving.
 * Does not prevent screenshots; full-res is only delivered after purchase.
 */
export function ProtectedImage({
  src,
  alt,
  fill = true,
  className = "",
  sizes,
  priority,
}: ProtectedImageProps) {
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={`object-cover ${className}`}
        sizes={sizes}
        priority={priority}
        draggable={false}
        onContextMenu={handleContextMenu}
        style={{ userSelect: "none" }}
      />

    </div>
  );
}
