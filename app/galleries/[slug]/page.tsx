import { client, hasSanityProject } from "@/lib/sanity/client";
import { galleryBySlugQuery } from "@/lib/sanity/queries";
import { thumbnailUrlFor, previewUrlFor, blurUrlFor } from "@/lib/sanity/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryView } from "@/components/gallery/GalleryView";

interface GalleryImage {
  asset?: { _ref: string };
  hotspot?: { x: number; y: number; width: number; height: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  caption?: string;
  alt?: string;
  price?: number;
}

interface Gallery {
  _id: string;
  title?: string;
  slug?: { current: string };
  event?: { _id: string; title?: string; slug?: { current: string } } | null;
  defaultPrice?: number;
  images?: GalleryImage[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!hasSanityProject)
    return { title: "Gallery | DB Photography" };
  const { slug } = await params;
  const gallery = await client.fetch<Gallery | null>(galleryBySlugQuery, {
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!hasSanityProject) notFound();
  const gallery = await client.fetch<Gallery | null>(galleryBySlugQuery, {
    slug,
  });
  if (!gallery) notFound();

  const defaultPrice = gallery.defaultPrice;
  const rawImages = (gallery.images ?? []).filter((item) => item.asset);

  // Generate blur placeholders for all images in parallel (tiny 20px fetches)
  const blurResults = await Promise.allSettled(
    rawImages.map((item) => blurUrlFor(item))
  );

  const images = rawImages.map((item, i) => ({
    thumbnailUrl: thumbnailUrlFor(item),
    previewUrl: previewUrlFor(item),
    blurDataURL:
      blurResults[i]?.status === "fulfilled" ? blurResults[i].value : "",
    caption: item.caption,
    alt: item.alt,
    price: item.price ?? defaultPrice,
  }));

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
      </div>
    </div>
  );
}
