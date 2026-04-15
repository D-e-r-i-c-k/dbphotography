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
  publicId?: string;
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
        publicId: img.publicId,
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
              className="group block overflow-hidden transition-all w-fit h-fit rounded-none"
              onClick={() => openLightbox(i)}
              onMouseEnter={() => {
                const img = new window.Image();
                img.src = item.previewUrl;
              }}
              aria-label={`View ${item.alt ?? item.caption ?? `Photo ${i + 1}`} full size`}
            >
              <div className="relative w-fit h-fit overflow-hidden flex justify-center items-center">
                <ProtectedCoverImage
                  src={item.thumbnailUrl}
                  alt={item.alt ?? item.caption ?? `Photo ${i + 1}`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="!w-auto !h-auto max-w-full max-h-[60vh]"
                  containerClassName="w-fit h-fit flex justify-center items-center"
                  fill={false}
                  blurDataURL={item.blurDataURL}
                />

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
