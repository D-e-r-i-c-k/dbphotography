"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

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
    const [loaded, setLoaded] = useState(false);

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
                    {/* Blur placeholder — shown instantly, fades out when real image loads */}
                    {blurDataURL && !loaded && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={blurDataURL}
                            alt=""
                            aria-hidden
                            className={`block w-full h-auto object-cover ${className}`}
                            style={{
                                filter: "blur(20px)",
                                transform: "scale(1.1)",
                            }}
                        />
                    )}
                    {/* Real image — loads in background, replaces blur when ready */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={src}
                        alt={alt}
                        className={`block w-full h-auto pointer-events-none object-cover transition-opacity duration-500 ${className} ${
                            blurDataURL && !loaded ? "absolute inset-0 opacity-0" : "opacity-100"
                        }`}
                        draggable={false}
                        style={{ userSelect: "none" }}
                        decoding="async"
                        loading={priority ? "eager" : "lazy"}
                        onLoad={() => setLoaded(true)}
                    />
                </div>
            )}
        </div>
    );
}
