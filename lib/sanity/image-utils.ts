import type { SanityImage } from "./types";

export function getImageDimensions(image?: SanityImage | null) {
  if (!image?.asset?._ref) return null;
  // Format: image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg
  const dimensions = image.asset._ref.split("-")[2];
  if (!dimensions) return null;
  const [widthStr, heightStr] = dimensions.split("x");
  const width = parseInt(widthStr, 10);
  const height = parseInt(heightStr, 10);
  if (isNaN(width) || isNaN(height)) return null;
  return { width, height };
}

export function getImageOrientation(image?: SanityImage | null): "landscape" | "portrait" | "square" {
  const dims = getImageDimensions(image);
  if (!dims) return "square"; // default fallback
  const ratio = dims.width / dims.height;
  if (ratio > 1.1) return "landscape";
  if (ratio < 0.9) return "portrait";
  return "square";
}
