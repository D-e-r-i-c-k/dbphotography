/**
 * GROQ queries for photography site.
 * Events and galleries are ordered; featured and home content are filtered.
 */

export const siteConfigQuery = `
  *[_type == "siteConfig"][0] {
    siteTitle,
    heroImage,
    heroHeadline,
    heroSubheadline,
    testimonialQuote,
    testimonialAuthor,
    testimonialDetail,
    featuredGallery-> {
      _id,
      title,
      slug,
      "imageCount": count(images),
      "coverImage": images[0]
    }
  }
`;

export const upcomingEventsQuery = `
  *[_type == "event" && date >= now()] | order(date asc) [0...3] {
    _id,
    title,
    slug,
    date,
    venue,
    coverImage,
    "gallery": *[_type == "gallery" && references(^._id)][0] { _id, slug, title }
  }
`;

export const recentGalleriesQuery = `
  *[_type == "gallery"] | order(_updatedAt desc) [0...6] {
    _id,
    title,
    slug,
    event-> { title, slug },
    "imageCount": count(images),
    "coverImage": images[0]
  }
`;

export const eventBySlugQuery = `
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    date,
    venue,
    description,
    coverImage,
    "gallery": *[_type == "gallery" && references(^._id)][0] { _id, slug, title }
  }
`;

export const galleryBySlugQuery = `
  *[_type == "gallery" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    event-> { _id, title, slug },
    defaultPrice,
    images[] {
      asset,
      hotspot,
      crop,
      caption,
      alt,
      price
    }
  }
`;

export const allEventsQuery = `
  *[_type == "event"] | order(date desc) {
    _id,
    title,
    slug,
    date,
    venue,
    coverImage,
    "gallery": *[_type == "gallery" && references(^._id)][0] { _id, slug, title }
  }
`;

export const allGalleriesQuery = `
  *[_type == "gallery"] | order(_updatedAt desc) {
    _id,
    title,
    slug,
    event-> { title, slug },
    "imageCount": count(images),
    "coverImage": images[0]
  }
`;
