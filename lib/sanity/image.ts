import { getCldImageUrl } from "next-cloudinary";
import type { CloudinaryImage } from "./types";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;

/**
 * Build a Cloudinary URL with optimal defaults.
 * Uses auto-format and auto-quality.
 */
export function urlFor(
  source: CloudinaryImage | undefined,
  options?: { w?: number; h?: number; q?: number; fit?: "fill" | "scale" | "crop" | "pad"; format?: string }
): string {
  if (!source?.public_id) return "";

  return getCldImageUrl({
    src: source.public_id,
    width: options?.w,
    height: options?.h,
    quality: options?.q || "auto",
    format: (options?.format as any) || "auto",
    crop: options?.fit || "scale",
  });
}

/**
 * Build a URL for thumbnails (gallery grid).
 * Small, fast, optimized.
 */
export function thumbnailUrlFor(source: CloudinaryImage | undefined): string {
  return urlFor(source, { w: 600, q: 70, fit: "scale" });
}

/**
 * Build a URL for high-quality lightbox previews.
 */
export function previewUrlFor(source: CloudinaryImage | undefined): string {
  // In the future, you can add a watermark overlay here:
  // overlays: [{ publicId: 'watermark_logo', ... }]
  return urlFor(source, { w: 1600, q: 80, fit: "scale" });
}

/**
 * Protected URL for downloads or specific views.
 * Currently just an alias for urlFor, but can be updated with signed URLs if needed.
 */
export function protectedUrlFor(source: CloudinaryImage | undefined, options?: any): string {
  return urlFor(source, options);
}

/**
 * Generate a tiny blur data URL for use as placeholder.
 * Cloudinary can do this with e_blur:1000 and very low quality/size.
 * We fetch it once to return a data URL or just return the remote URL if the component supports it.
 */
export async function blurUrlFor(source: CloudinaryImage | undefined): Promise<string> {
  if (!source?.public_id) return "";

  const url = getCldImageUrl({
    src: source.public_id,
    width: 40,
    quality: 10,
    blur: "1000",
    format: "jpg",
  });

  try {
    const res = await fetch(url);
    if (!res.ok) return "";
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${base64}`;
  } catch {
    return url; // Fallback to remote URL
  }
}

