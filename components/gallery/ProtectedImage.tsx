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
      {/* Watermark in bottom half */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-80"
        aria-hidden
      >
        <img
          src="/watermark-logo.png"
          alt=""
          className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
