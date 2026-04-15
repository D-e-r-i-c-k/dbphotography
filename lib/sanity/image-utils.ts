import type { CloudinaryImage } from "./types";

export function getImageDimensions(image?: CloudinaryImage | null) {
  if (!image?.width || !image?.height) return null;
  return { width: image.width, height: image.height };
}

export function getImageOrientation(image?: CloudinaryImage | null): "landscape" | "portrait" | "square" {
  if (!image?.width || !image?.height) return "square"; // default fallback
  const ratio = image.width / image.height;
  if (ratio > 1.1) return "landscape";
  if (ratio < 0.9) return "portrait";
  return "square";
}
