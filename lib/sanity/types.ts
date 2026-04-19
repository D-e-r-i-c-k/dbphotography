/** Minimal types for Sanity responses used on the frontend. */

export interface CloudinaryImage {
  _type: "cloudinary.asset";
  public_id: string;
  secure_url?: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface SanityImageAsset {
  _type: "image";
  asset?: {
    _ref?: string;
    _type?: "reference";
  };
}

export interface SiteConfig {
  siteTitle?: string;
  heroImage?: SanityImageAsset;
  heroHeadline?: string;
  heroSubheadline?: string;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  testimonialDetail?: string;
  featuredGallery?: {
    _id: string;
    title?: string;
    slug?: { current: string };
    coverImage?: CloudinaryImage;
  } | null;
}

export interface UpcomingEvent {
  _id: string;
  title?: string;
  slug?: { current: string };
  date?: string;
  venue?: string;
  description?: string;
  coverImage?: SanityImageAsset;
  gallery?: { _id: string; slug?: { current: string }; title?: string } | null;
}

export interface RecentGallery {
  _id: string;
  title?: string;
  slug?: { current: string };
  event?: { title?: string; slug?: { current: string } } | null;
  coverImage?: CloudinaryImage;
  cloudinaryFolder?: string;
  defaultPrice?: number;
  coverIndex?: number;
}
