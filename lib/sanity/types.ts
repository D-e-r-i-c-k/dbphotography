/** Minimal types for Sanity responses used on the frontend. */

export interface SanityImage {
  _type: "image";
  asset?: { _ref: string; _type: "reference" };
}

export interface SiteConfig {
  siteTitle?: string;
  heroImage?: SanityImage;
  heroHeadline?: string;
  heroSubheadline?: string;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  testimonialDetail?: string;
  featuredGallery?: {
    _id: string;
    title?: string;
    slug?: { current: string };
    imageCount?: number;
    coverImage?: SanityImage;
  } | null;
}

export interface UpcomingEvent {
  _id: string;
  title?: string;
  slug?: { current: string };
  date?: string;
  venue?: string;
  description?: string;
  coverImage?: SanityImage;
  gallery?: { _id: string; slug?: { current: string }; title?: string } | null;
}

export interface RecentGallery {
  _id: string;
  title?: string;
  slug?: { current: string };
  event?: { title?: string; slug?: { current: string } } | null;
  imageCount?: number;
  coverImage?: SanityImage;
}

export interface GalleryImage {
  image?: SanityImage;
  caption?: string;
  alt?: string;
  price?: number;
}
