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
    /** Base64 data URL for blur placeholder */
    blurDataURL?: string;
}

/**
 * Client component wrapper for cover images that prevents right-click, drag, and saving.
 * Supports blur-up loading via blurDataURL for a premium feel.
 *
 * When fill=false and blurDataURL is provided, shows the blur image immediately
 * and fades it out once the real image has loaded — creating a smooth transition.
 */
export function ProtectedCoverImage({
    src,
    alt = "",
    sizes,
    priority,
    className = "",
    containerClassName = "",
    fill = true,
    blurDataURL,
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
                    placeholder={blurDataURL ? "blur" : "empty"}
                    blurDataURL={blurDataURL}
                />
            ) : (
                <div className="relative w-fit h-fit">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={src}
                        alt={alt}
                        className={`block w-full h-auto pointer-events-none object-cover ${className}`}
                        draggable={false}
                        style={{ userSelect: "none" }}
                        decoding="async"
                        loading={priority ? "eager" : "lazy"}
                    />
                </div>
            )}
        </div>
    );
}
