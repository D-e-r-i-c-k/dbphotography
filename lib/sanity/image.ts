import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "./client";
import { encryptUrl } from "../obfuscate";

const builder = createImageUrlBuilder(client);

/**
 * Build a proxy URL that securely encrypts the Sanity CDN URL to prevent high-res leakage.
 */
function secureProxyUrl(sanityUrl: string): string {
  if (typeof window !== "undefined") {
    return sanityUrl;
  }
  return `/api/image-proxy/${encryptUrl(sanityUrl)}`;
}

/**
 * Build a DIRECT Sanity CDN URL (no proxy).
 * Use for cover images, hero images, and any non-purchasable content.
 * These load directly from Sanity's global CDN — much faster than proxying.
 */
export function urlFor(
  source: SanityImageSource,
  options?: { w?: number; h?: number; q?: number; fit?: "max" | "min" | "fill" | "clip"; format?: "webp" | "jpg" | "png" }
): string {
  let b = builder.image(source).auto("format"); // Auto format = WebP where supported
  if (options?.w) b = b.width(options.w);
  if (options?.h) b = b.height(options.h);
  if (options?.q) b = b.quality(options.q);
  if (options?.fit) b = b.fit(options.fit);
  if (options?.format) b = b.format(options.format);
  return b.url();
}

/**
 * Build a PROTECTED proxy URL for purchasable gallery images.
 * Routes through /api/image-proxy to hide the real Sanity asset URL,
 * preventing users from accessing full-res images without paying.
 */
export function protectedUrlFor(
  source: SanityImageSource,
  options?: { w?: number; h?: number; q?: number; fit?: "max" | "min" | "fill" | "clip" }
): string {
  let b = builder.image(source).auto("format");
  if (options?.w) b = b.width(options.w);
  if (options?.h) b = b.height(options.h);
  if (options?.q) b = b.quality(options.q);
  if (options?.fit) b = b.fit(options.fit);
  return secureProxyUrl(b.url());
}

/**
 * Thumbnail for gallery grid: 400px, 65% quality — DIRECT from CDN.
 * These are small previews with a CSS "PREVIEW" watermark overlay.
 * No security concern at this size — loads in ~50ms from Sanity's edge CDN
 * instead of ~1000ms through the proxy.
 */
export function thumbnailUrlFor(source: SanityImageSource): string {
  return urlFor(source, { w: 400, q: 65, fit: "max" });
}

/**
 * Preview for lightbox: 1200px, 75% quality — via proxy (protected).
 * These are the high-quality previews worth protecting behind the proxy.
 * The proxy hides the real Sanity URL so users can't access full-res.
 */
export function previewUrlFor(source: SanityImageSource): string {
  return protectedUrlFor(source, { w: 1200, q: 75, fit: "max" });
}

/**
 * Generate a tiny blur data URL for use as placeholder.
 * Returns a base64 data URL from a 20px wide Sanity image.
 * Goes direct to CDN — no security concern for a 20px blur.
 */
export async function blurUrlFor(source: SanityImageSource): Promise<string> {
  const url = urlFor(source, { w: 20, q: 20 });
  try {
    const res = await fetch(url);
    if (!res.ok) return "";
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${base64}`;
  } catch {
    return "";
  }
}
