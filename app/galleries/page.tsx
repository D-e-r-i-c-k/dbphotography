import { client, hasSanityProject } from "@/lib/sanity/client";
import { allGalleriesQuery } from "@/lib/sanity/queries";
import type { RecentGallery } from "@/lib/sanity/types";
import Link from "next/link";
import { cloudinaryBlurDataUrlFor, cloudinaryImageUrlFor } from "@/lib/sanity/image";
import { ProtectedCoverImage } from "@/components/gallery/ProtectedCoverImage";
import { HorizontalMasonry } from "@/components/gallery/HorizontalMasonry";

export const metadata = {
  title: "Galleries | DB Photography",
  description: "Browse photo galleries from events and sessions.",
};

export default async function GalleriesPage() {
  const galleries =
    hasSanityProject
      ? await client.fetch<RecentGallery[]>(allGalleriesQuery)
      : ([] as RecentGallery[]);

  // Generate blur placeholders for all gallery covers in parallel
  const blurMap = new Map<string, string>();
  const blurResults = await Promise.allSettled(
    (galleries ?? []).map(async (g) => {
      if (!g.coverImage?.public_id) return null;
      const dataUrl = await cloudinaryBlurDataUrlFor(g.coverImage);
      return { id: g.coverImage.public_id, dataUrl };
    })
  );
  for (const result of blurResults) {
    if (result.status === "fulfilled" && result.value?.dataUrl) {
      blurMap.set(result.value.id, result.value.dataUrl);
    }
  }

  return (
    <div className="animate-fade-in-up pt-[72px]">
      {/* Page header */}
      <div className="border-b border-[rgba(255,255,255,0.05)] py-14 bg-[#0C0E15]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <p className="text-[0.65rem] font-semibold tracking-[0.3em] uppercase text-[#94B8D0] mb-3">Portfolio</p>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            Galleries
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
        {galleries && galleries.length > 0 ? (
          <HorizontalMasonry
            items={galleries}
            renderItem={(gallery) => {
              const slug = gallery.slug?.current;
              return (
                <div key={gallery._id} className="break-inside-avoid flex w-full justify-center">
                  {slug ? (
                    <Link
                      href={`/galleries/${slug}`}
                      className="group block overflow-hidden w-fit h-fit rounded-none"
                    >
                      <div className="relative w-fit h-fit overflow-hidden flex justify-center items-center">
                        {gallery.coverImage?.public_id && (
                          <ProtectedCoverImage
                            src={cloudinaryImageUrlFor(gallery.coverImage, { w: 900, q: 80 })}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="!w-auto !h-auto max-w-full max-h-[60vh]"
                            containerClassName="w-fit h-fit img-desat group-hover:saturate-100 transition-all duration-700 flex justify-center items-center"
                            fill={false}
                            blurDataURL={gallery.coverImage?.public_id ? blurMap.get(gallery.coverImage.public_id) : undefined}
                          />
                        )}
                        {/* Hover info overlay */}
                        <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ background: "linear-gradient(to top, rgba(8, 9, 13, 0.85) 0%, transparent 55%)" }}>
                          <p className="font-display text-[1.05rem] text-foreground translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                            {gallery.title ?? "Untitled gallery"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="group block overflow-hidden w-fit h-fit rounded-none">
                      <div className="relative w-fit h-fit overflow-hidden flex justify-center items-center">
                        {gallery.coverImage?.public_id && (
                          <ProtectedCoverImage
                            src={cloudinaryImageUrlFor(gallery.coverImage, { w: 900, q: 80 })}
                            sizes="33vw"
                            className="!w-auto !h-auto max-w-full max-h-[60vh]"
                            containerClassName="w-fit h-fit img-desat group-hover:saturate-100 transition-all duration-700 flex justify-center items-center"
                            fill={false}
                            blurDataURL={gallery.coverImage?.public_id ? blurMap.get(gallery.coverImage.public_id) : undefined}
                          />
                        )}
                        {/* Hover info overlay */}
                        <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ background: "linear-gradient(to top, rgba(8, 9, 13, 0.85) 0%, transparent 55%)" }}>
                          <p className="font-display text-[1.05rem] text-foreground translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                            {gallery.title ?? "Untitled gallery"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          />
        ) : (
          <p className="text-muted-foreground">
            No galleries yet. Add galleries in Sanity Studio.
          </p>
        )}
      </div>
    </div>
  );
}
