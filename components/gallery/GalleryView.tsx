"use client";

import { useState, useMemo } from "react";
import { ProtectedCoverImage } from "./ProtectedCoverImage";
import { HorizontalMasonry } from "./HorizontalMasonry";
import { GalleryLightbox, type LightboxImage } from "./GalleryLightbox";

export interface GalleryImageItem {
  thumbnailUrl: string;
  previewUrl: string;
  blurDataURL?: string;
  caption?: string;
  alt?: string;
  price?: number;
}

interface GalleryViewProps {
  gallerySlug: string;
  galleryTitle: string;
  images: GalleryImageItem[];
}

export function GalleryView({
  gallerySlug,
  galleryTitle,
  images,
}: GalleryViewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lightboxImages: LightboxImage[] = useMemo(
    () =>
      images.map((img, i) => ({
        src: img.previewUrl,
        alt: img.alt ?? img.caption ?? `${galleryTitle} – Photo ${i + 1}`,
        caption: img.caption,
        price: img.price,
        gallerySlug,
        originalIndex: i,
        thumbnailUrl: img.thumbnailUrl,
      })),
    [images, galleryTitle, gallerySlug]
  );

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (images.length === 0) {
    return (
      <p className="text-muted-foreground">No photos in this gallery yet.</p>
    );
  }

  return (
    <>
      <HorizontalMasonry
        items={images}
        renderItem={(item, i) => (
          <div key={i} className="break-inside-avoid flex w-full justify-center">
            <button
              type="button"
              className="group block overflow-hidden transition-all hover:ring-2 hover:ring-primary/50 w-fit h-fit rounded-none"
              onClick={() => openLightbox(i)}
              aria-label={`View ${item.alt ?? item.caption ?? `Photo ${i + 1}`} full size`}
            >
              <div className="relative w-fit h-fit overflow-hidden flex justify-center items-center">
                <ProtectedCoverImage
                  src={item.thumbnailUrl}
                  alt={item.alt ?? item.caption ?? `Photo ${i + 1}`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="!w-auto !h-auto max-w-full max-h-[60vh] transition-transform duration-500 group-hover:scale-[1.02]"
                  containerClassName="w-fit h-fit flex justify-center items-center"
                  fill={false}
                  blurDataURL={item.blurDataURL}
                />
                {/* Repeating watermark overlay */}
                <div
                  className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-4 items-center justify-items-center overflow-hidden opacity-15"
                  aria-hidden
                >
                  {Array.from({ length: 12 }).map((_, w) => (
                    <span
                      key={w}
                      className="font-display -rotate-[25deg] whitespace-nowrap text-sm sm:text-base font-semibold tracking-[0.25em] text-white drop-shadow-md"
                    >
                      PREVIEW
                    </span>
                  ))}
                </div>
              </div>
            </button>
          </div>
        )}
      />

      <GalleryLightbox
        images={lightboxImages}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        initialIndex={lightboxIndex}
      />
    </>
  );
}
