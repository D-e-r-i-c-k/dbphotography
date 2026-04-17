import { createImageUrlBuilder } from "@sanity/image-url";
import { getCldImageUrl } from "next-cloudinary";
import type { SanityImageAsset, CloudinaryImage } from "./types";

const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const sanityBuilder = createImageUrlBuilder({
  projectId: sanityProjectId,
  dataset: sanityDataset,
});

type CloudinaryFit = "fill" | "scale" | "crop" | "pad";
type ImageOptions = {
  w?: number;
  h?: number;
  q?: number;
  fit?: CloudinaryFit;
  format?: "auto" | "jpg" | "png" | "webp" | "avif";
};

function hasSanityImageAsset(source: SanityImageAsset | undefined): source is SanityImageAsset {
  return Boolean(source?.asset?._ref);
}

function hasCloudinaryPublicId(source: CloudinaryImage | undefined): source is CloudinaryImage {
  return Boolean(source?.public_id);
}

async function fetchBlurDataUrl(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return "";
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${base64}`;
  } catch {
    return "";
  }
}

export function sanityImageUrlFor(source: SanityImageAsset | undefined, options?: ImageOptions): string {
  if (!hasSanityImageAsset(source)) {
    return "";
  }

  let image = sanityBuilder.image(source).auto("format").quality(options?.q ?? 80).fit("max");

  if (options?.w) {
    image = image.width(options.w);
  }

  if (options?.h) {
    image = image.height(options.h);
  }

  return image.url();
}

export function cloudinaryImageUrlFor(source: CloudinaryImage | undefined, options?: ImageOptions): string {
  if (!hasCloudinaryPublicId(source)) {
    return "";
  }

  return getCldImageUrl({
    src: source.public_id,
    width: options?.w,
    height: options?.h,
    quality: options?.q ?? "auto",
    format: options?.format ?? "auto",
    crop: options?.fit ?? "scale",
  });
}

export function galleryThumbnailUrlFor(source: CloudinaryImage | undefined): string {
  return cloudinaryImageUrlFor(source, { w: 900, q: 75, fit: "scale", format: "auto" });
}

export function galleryPreviewUrlFor(source: CloudinaryImage | undefined): string {
  return cloudinaryImageUrlFor(source, { w: 1800, q: 82, fit: "scale", format: "auto" });
}

export function protectedCloudinaryUrlFor(source: CloudinaryImage | undefined, options?: ImageOptions): string {
  return cloudinaryImageUrlFor(source, options);
}

export async function sanityBlurDataUrlFor(source: SanityImageAsset | undefined): Promise<string> {
  const url = sanityImageUrlFor(source, { w: 40, q: 20, format: "jpg" });
  return url ? fetchBlurDataUrl(url) : "";
}

export async function cloudinaryBlurDataUrlFor(source: CloudinaryImage | undefined): Promise<string> {
  if (!hasCloudinaryPublicId(source)) {
    return "";
  }

  const url = getCldImageUrl({
    src: source.public_id,
    width: 40,
    quality: 10,
    blur: "1000",
    format: "jpg",
  });

  return (await fetchBlurDataUrl(url)) || url;
}
