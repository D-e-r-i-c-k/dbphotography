import { client, hasSanityProject } from "@/lib/sanity/client";
import { eventBySlugQuery } from "@/lib/sanity/queries";
import type { UpcomingEvent } from "@/lib/sanity/types";
import Link from "next/link";
import { sanityImageUrlFor } from "@/lib/sanity/image";
import { ProtectedCoverImage } from "@/components/gallery/ProtectedCoverImage";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!hasSanityProject) return { title: "Event | DB Photography" };
  const { slug } = await params;
  const event = await client.fetch<UpcomingEvent | null>(eventBySlugQuery, {
    slug,
  });
  return {
    title: event?.title
      ? `${event.title} | Events | DB Photography`
      : "Event | DB Photography",
    description: event?.description ?? undefined,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!hasSanityProject) notFound();
  const event = await client.fetch<UpcomingEvent | null>(eventBySlugQuery, {
    slug,
  });
  if (!event) notFound();

  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString("en-ZA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "";
  const gallerySlug = event.gallery?.slug?.current;

  return (
    <div className="animate-fade-in-up pt-[72px]">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/events"
          className="mb-8 inline-block text-[0.8rem] text-muted-foreground transition-colors hover:text-[#94B8D0]"
        >
          ← All events
        </Link>
        <article>
          {event.coverImage?.asset?._ref && (
            <ProtectedCoverImage
              src={sanityImageUrlFor(event.coverImage, { w: 1200, q: 85 })}
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              containerClassName="aspect-[16/10] rounded-xl overflow-hidden"
            />
          )}
          <header className="mt-8">
            <h1 className="font-display text-3xl text-foreground sm:text-4xl">
              {event.title ?? "Untitled event"}
            </h1>
            {dateStr && (
              <p className="mt-3 text-[0.85rem] text-[#94B8D0]">{dateStr}</p>
            )}
            {event.venue && (
              <p className="mt-1 text-[0.85rem] text-muted-foreground">
                {event.venue}
              </p>
            )}
          </header>
          {event.description && (
            <div className="mt-6 text-[0.95rem] leading-relaxed text-foreground/85">
              {event.description}
            </div>
          )}
          {gallerySlug && (
            <div className="mt-10">
              <Link
                href={`/galleries/${gallerySlug}`}
                className="inline-flex h-12 items-center justify-center rounded-md px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] transition-all hover:translate-y-[-2px]"
                style={{ background: "#94B8D0", color: "#08090D" }}
              >
                View Gallery
              </Link>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
