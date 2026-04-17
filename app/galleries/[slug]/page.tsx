import { client, hasSanityProject } from "@/lib/sanity/client";
import { galleryBySlugQuery } from "@/lib/sanity/queries";
import {
  cloudinaryBlurDataUrlFor,
  galleryPreviewUrlFor,
  galleryThumbnailUrlFor,
} from "@/lib/sanity/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { GalleryView } from "@/components/gallery/GalleryView";
import type { CloudinaryImage, RecentGallery } from "@/lib/sanity/types";
import { fetchImagesPageFromFolder } from "@/lib/cloudinary";

const PHOTOS_PER_PAGE = 50;
type PaginationItem = number | "ellipsis";

// We can just use RecentGallery as the base, but we ensure event includes _id for linking
interface FullGallery extends RecentGallery {
  event?: { _id: string; title?: string; slug?: { current: string } } | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!hasSanityProject)
    return { title: "Gallery | DB Photography" };
  const { slug } = await params;
  const gallery = await client.fetch<FullGallery | null>(galleryBySlugQuery, {
    slug,
  });
  return {
    title: gallery?.title
      ? `${gallery.title} | Galleries | DB Photography`
      : "Gallery | DB Photography",
  };
}

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  if (!hasSanityProject) notFound();
  const gallery = await client.fetch<FullGallery | null>(galleryBySlugQuery, {
    slug,
  });
  if (!gallery) notFound();

  const defaultPrice = gallery.defaultPrice ?? 20;
  const currentPage = normalizePage(pageParam);

  let rawImages: CloudinaryImage[] = [];
  let totalImages = 0;
  if (gallery.cloudinaryFolder) {
    const result = await fetchImagesPageFromFolder(gallery.cloudinaryFolder, {
      page: currentPage,
      perPage: PHOTOS_PER_PAGE,
    });
    rawImages = result.images;
    totalImages = result.totalCount;
  }

  const totalPages = Math.max(1, Math.ceil(totalImages / PHOTOS_PER_PAGE));
  if (pageParam && currentPage > totalPages && totalImages > 0) notFound();

  // Generate blur placeholders for the first few images only (avoid heavy parallel fetches)
  const BLUR_FETCH_LIMIT = 12;
  const blurFetchCount = Math.min(rawImages.length, BLUR_FETCH_LIMIT);
  const blurResults = await Promise.allSettled(
    rawImages.slice(0, blurFetchCount).map((item) => cloudinaryBlurDataUrlFor(item))
  );

  const images = rawImages.map((item, i) => ({
    thumbnailUrl: galleryThumbnailUrlFor(item),
    previewUrl: galleryPreviewUrlFor(item),
    blurDataURL:
      i < blurFetchCount && blurResults[i]?.status === "fulfilled" ? blurResults[i].value : "",
    caption: "",
    alt: item.public_id.split("/").pop() || "Gallery photo",
    price: defaultPrice,
    publicId: item.public_id,
  }));

  const pageLinks = buildPageLinks(currentPage, totalPages);

  return (
    <div className="animate-fade-in-up pt-[72px]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
        <Link
          href="/galleries"
          className="mb-8 inline-block text-[0.8rem] text-muted-foreground transition-colors hover:text-[#94B8D0]"
        >
          ← All galleries
        </Link>
        <header className="mb-10">
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">
            {gallery.title ?? "Untitled gallery"}
          </h1>
          <p className="mt-2 text-[0.85rem] text-muted-foreground">
            {totalImages} photo{totalImages === 1 ? "" : "s"} • Page {Math.min(currentPage, totalPages)} of {totalPages}
          </p>
          {gallery.event?.slug?.current && (
            <Link
              href={`/events/${gallery.event.slug.current}`}
              className="mt-2 inline-block text-[0.85rem] text-muted-foreground transition-colors hover:text-ice"
            >
              Event: {gallery.event.title ?? "Untitled"}
            </Link>
          )}
        </header>
        <GalleryView
          gallerySlug={slug}
          galleryTitle={gallery.title ?? "Gallery"}
          images={images}
        />
        {totalPages > 1 && (
          <nav aria-label="Gallery pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <PaginationLink
              slug={slug}
              page={currentPage - 1}
              disabled={currentPage <= 1}
            >
              Previous
            </PaginationLink>
            {pageLinks.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  className="inline-flex min-w-10 items-center justify-center px-3 py-2 text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <PaginationLink
                  key={item}
                  slug={slug}
                  page={item}
                  active={item === currentPage}
                >
                  {item}
                </PaginationLink>
              )
            )}
            <PaginationLink
              slug={slug}
              page={currentPage + 1}
              disabled={currentPage >= totalPages}
            >
              Next
            </PaginationLink>
          </nav>
        )}
      </div>
    </div>
  );
}

function normalizePage(pageParam?: string): number {
  const parsed = Number.parseInt(pageParam ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildPageLinks(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sortedPages = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const items: PaginationItem[] = [];

  for (let index = 0; index < sortedPages.length; index += 1) {
    const page = sortedPages[index]!;
    const previousPage = sortedPages[index - 1];

    if (previousPage != null && page - previousPage > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  }

  return items;
}

function PaginationLink({
  slug,
  page,
  active = false,
  disabled = false,
  children,
}: {
  slug: string;
  page: number;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  const href = page <= 1 ? `/galleries/${slug}` : `/galleries/${slug}?page=${page}`;
  const className = [
    "inline-flex min-w-10 items-center justify-center border px-3 py-2 text-sm transition-colors",
    active ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:border-foreground",
    disabled ? "pointer-events-none opacity-40" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={className}>
      {children}
    </Link>
  );
}
