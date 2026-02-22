"use client";

import Image from "next/image";
import { useCallback } from "react";

interface ProtectedCoverImageProps {
    src: string;
    alt?: string;
    sizes?: string;
    priority?: boolean;
    className?: string;
    containerClassName?: string;
    fill?: boolean;
}

/**
 * Client component wrapper for cover images that prevents right-click, drag, and saving.
 * Use this for event/gallery cover images in Server Component pages.
 */
export function ProtectedCoverImage({
    src,
    alt = "",
    sizes,
    priority,
    className = "",
    containerClassName = "",
    fill = true,
}: ProtectedCoverImageProps) {
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);

    return (
        <div
            className={`relative select-none ${containerClassName}`}
            onContextMenu={handleContextMenu}
        >
            {fill ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className={`pointer-events-none object-cover ${className}`}
                    sizes={sizes}
                    priority={priority}
                    draggable={false}
                    style={{ userSelect: "none" }}
                />
            ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={src}
                    alt={alt}
                    className={`block w-full h-auto pointer-events-none object-cover ${className}`}
                    draggable={false}
                    style={{ userSelect: "none" }}
                    decoding="async"
                    loading={priority ? "eager" : "lazy"}
                />
            )}
        </div>
    );
}
