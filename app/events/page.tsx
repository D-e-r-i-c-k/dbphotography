import { client, hasSanityProject } from "@/lib/sanity/client";
import { allEventsQuery } from "@/lib/sanity/queries";
import type { UpcomingEvent } from "@/lib/sanity/types";
import Link from "next/link";
import { sanityBlurDataUrlFor, sanityImageUrlFor } from "@/lib/sanity/image";
import { ProtectedCoverImage } from "@/components/gallery/ProtectedCoverImage";

export const metadata = {
  title: "Events | DB Photography",
  description: "Upcoming and past photography events.",
};

export default async function EventsPage() {
  const events =
    hasSanityProject
      ? await client.fetch<UpcomingEvent[]>(allEventsQuery)
      : ([] as UpcomingEvent[]);

  // Generate blur placeholders for all event covers in parallel
  const blurMap = new Map<string, string>();
  const blurResults = await Promise.allSettled(
    (events ?? []).map(async (e) => {
      if (!e.coverImage?.asset?._ref) return null;
      const dataUrl = await sanityBlurDataUrlFor(e.coverImage);
      return { id: e.coverImage.asset._ref, dataUrl };
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
          <p className="text-[0.65rem] font-semibold tracking-[0.3em] uppercase text-[#94B8D0] mb-3">Browse</p>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            Events
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
        {events && events.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const slug = event.slug?.current;
              const dateStr = event.date
                ? new Date(event.date).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
                : "";
              return (
                <li key={event._id}>
                  {slug ? (
                    <Link
                      href={`/events/${slug}`}
                      className="group glass-card block overflow-hidden"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
                        {event.coverImage?.asset?._ref && (
                          <ProtectedCoverImage
                            src={sanityImageUrlFor(event.coverImage, { w: 600, q: 80 })}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            containerClassName="h-full w-full img-desat"
                            blurDataURL={event.coverImage?.asset?._ref ? blurMap.get(event.coverImage.asset._ref) : undefined}
                          />
                        )}
                        {dateStr && (
                          <div className="absolute top-3 left-3 rounded-lg backdrop-blur-[14px] px-3 py-1.5" style={{ background: 'rgba(12, 14, 21, 0.6)', border: '1px solid rgba(148, 184, 208, 0.08)' }}>
                            <span className="text-[0.68rem] font-medium text-[#94B8D0]">
                              {dateStr}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h2 className="font-display text-[1.05rem] text-foreground">
                          {event.title ?? "Untitled event"}
                        </h2>
                        {event.venue && (
                          <p className="mt-1 text-[0.78rem] text-muted-foreground">
                            {event.venue}
                          </p>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="group glass-card overflow-hidden">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
                        {event.coverImage?.asset?._ref && (
                          <ProtectedCoverImage
                            src={sanityImageUrlFor(event.coverImage, { w: 600, q: 80 })}
                            sizes="(max-width: 640px) 100vw, 33vw"
                            containerClassName="h-full w-full img-desat"
                            blurDataURL={event.coverImage?.asset?._ref ? blurMap.get(event.coverImage.asset._ref) : undefined}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h2 className="font-display text-[1.05rem] text-foreground">
                          {event.title ?? "Untitled event"}
                        </h2>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            No events yet. Add events in Sanity Studio.
          </p>
        )}
      </div>
    </div>
  );
}
