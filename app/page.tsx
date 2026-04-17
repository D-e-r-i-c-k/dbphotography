import Image from "next/image";
import Link from "next/link";
import { client, hasSanityProject } from "@/lib/sanity/client";
import {
  siteConfigQuery,
  upcomingEventsQuery,
  recentGalleriesQuery,
} from "@/lib/sanity/queries";
import {
  cloudinaryBlurDataUrlFor,
  cloudinaryImageUrlFor,
  sanityBlurDataUrlFor,
  sanityImageUrlFor,
} from "@/lib/sanity/image";
import { ProtectedCoverImage } from "@/components/gallery/ProtectedCoverImage";
import { HorizontalMasonry } from "@/components/gallery/HorizontalMasonry";
import type {
  SiteConfig,
  UpcomingEvent,
  RecentGallery,
  CloudinaryImage,
  SanityImageAsset,
} from "@/lib/sanity/types";

/** Map of image _ref → base64 blur data URL */
type BlurMap = Map<string, string>;

async function getHomeData() {
  if (!hasSanityProject) {
    return {
      siteConfig: null,
      upcomingEvents: [] as UpcomingEvent[],
      recentGalleries: [] as RecentGallery[],
      blurMap: new Map() as BlurMap,
    };
  }
  try {
    const [siteConfig, upcomingEvents, recentGalleries] = await Promise.all([
      client.fetch<SiteConfig | null>(siteConfigQuery),
      client.fetch<UpcomingEvent[]>(upcomingEventsQuery),
      client.fetch<RecentGallery[]>(recentGalleriesQuery),
    ]);

    // Generate blur placeholders for all cover images in parallel
    const blurMap: BlurMap = new Map();
    const imageSources: Array<
      | { id: string; source: SanityImageAsset; kind: "sanity" }
      | { id: string; source: CloudinaryImage; kind: "cloudinary" }
    > = [];

    if (siteConfig?.heroImage?.asset?._ref) {
      imageSources.push({ id: siteConfig.heroImage.asset._ref, source: siteConfig.heroImage, kind: "sanity" });
    }
    for (const event of upcomingEvents ?? []) {
      if (event.coverImage?.asset?._ref) {
        imageSources.push({ id: event.coverImage.asset._ref, source: event.coverImage, kind: "sanity" });
      }
    }
    for (const gallery of recentGalleries ?? []) {
      if (gallery.coverImage?.public_id) {
        imageSources.push({ id: gallery.coverImage.public_id, source: gallery.coverImage, kind: "cloudinary" });
      }
    }

    const blurResults = await Promise.allSettled(
      imageSources.map(async ({ id, source, kind }) => {
        const dataUrl =
          kind === "sanity"
            ? await sanityBlurDataUrlFor(source)
            : await cloudinaryBlurDataUrlFor(source);
        return { id, dataUrl };
      })
    );
    for (const result of blurResults) {
      if (result.status === "fulfilled" && result.value.dataUrl) {
        blurMap.set(result.value.id, result.value.dataUrl);
      }
    }

    return { siteConfig, upcomingEvents, recentGalleries, blurMap };
  } catch {
    return {
      siteConfig: null,
      upcomingEvents: [] as UpcomingEvent[],
      recentGalleries: [] as RecentGallery[],
      blurMap: new Map() as BlurMap,
    };
  }
}

export default async function HomePage() {
  const { siteConfig, upcomingEvents, recentGalleries, blurMap } = await getHomeData();
  const heroImage = siteConfig?.heroImage;
  const heroHeadline = siteConfig?.heroHeadline ?? "Moments Frozen in Light";
  const heroSubheadline =
    siteConfig?.heroSubheadline ??
    "Events, portraits, and the quiet beauty between the moments.\nProfessional photography with secure delivery.";
  const testimonialQuote =
    siteConfig?.testimonialQuote ??
    "Every photograph Derick takes feels like a love letter to the moment — intimate, honest, and completely unforgettable.";
  const testimonialAuthor = siteConfig?.testimonialAuthor ?? "Lana M.";
  const testimonialDetail =
    siteConfig?.testimonialDetail ?? "Bride, Franschhoek Estate Wedding";

  return (
    <div className="flex flex-col">
      {/* ═══ Hero ═══ */}
      <section className="animate-hero-reveal relative min-h-[100vh] w-full overflow-hidden bg-[#08090D]">
        {/* Background image with slow zoom */}
        {heroImage?.asset?._ref && (
          <Image
            src={sanityImageUrlFor(heroImage, { w: 1920, q: 85 })}
            alt=""
            fill
            className="object-cover object-center animate-slow-zoom brightness-[0.35] contrast-[1.15] saturate-[0.7]"
            priority
            sizes="100vw"
          />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090D]/80 via-[#08090D]/50 to-[#08090D]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-transparent" />
        {/* Ice glow radial in bottom-left */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 80%, rgba(148, 184, 208, 0.10) 0%, transparent 50%)" }} />

        {/* Hero content */}
        <div className="animate-fade-in-up delay-3 relative z-10 flex min-h-[100vh] flex-col justify-end px-6 pb-20 lg:px-14">
          <div className="max-w-2xl">
            <p className="section-label mb-5 flex items-center gap-3 before:h-px before:w-[35px] before:bg-[#94B8D0]/30 text-[#94B8D0]">South Africa · Professional Photography</p>
            <h1 className="font-display text-[3.2rem] leading-[1.08] text-foreground sm:text-[4.2rem] md:text-[5rem]">
              {heroHeadline.split(" ").map((word, i, arr) =>
                i === arr.length - 1 ? (
                  <em key={i} className="not-italic text-[#94B8D0]">{word}</em>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </h1>
            <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
              {heroSubheadline}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/galleries"
                className="inline-flex h-12 items-center justify-center rounded-md px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] transition-all hover:translate-y-[-2px]"
                style={{ background: "#94B8D0", color: "#08090D", boxShadow: "none" }}
                onMouseEnter={undefined}
              >
                View Galleries
              </Link>
              <Link
                href="/events"
                className="inline-flex h-12 items-center justify-center rounded-md border px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-foreground backdrop-blur-sm transition-all hover:text-[#94B8D0]"
                style={{ background: "rgba(148, 184, 208, 0.06)", borderColor: "rgba(255,255,255,0.1)" }}
              >
                Upcoming Events
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-5 right-6 z-10 flex flex-col items-center gap-2 opacity-40">
          <span
            className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-foreground"
            style={{ writingMode: "vertical-rl" }}
          >
            Scroll
          </span>
          <div className="h-10 w-px bg-foreground/30" />
        </div>
      </section>

      {/* ═══ Upcoming Events ═══ */}
      <section className="animate-fade-in-up delay-2 py-20 bg-[#0C0E15] border-y border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <p className="section-label mb-3">What&apos;s Coming</p>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">
              Upcoming Events
            </h2>
            <Link
              href="/events"
              className="hidden text-[0.76rem] font-medium uppercase tracking-[0.1em] text-[#94B8D0] transition-colors hover:text-[#C2DAE8] sm:inline-flex items-center gap-2"
            >
              All Events →
            </Link>
          </div>
          <div className="mt-10">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event._id} event={event} blurMap={blurMap} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No upcoming events at the moment. Check back soon.
              </p>
            )}
          </div>
          <Link
            href="/events"
            className="mt-8 inline-block text-[0.76rem] font-medium uppercase tracking-[0.1em] text-[#94B8D0] transition-colors hover:text-[#C2DAE8] sm:hidden"
          >
            All Events →
          </Link>
        </div>
      </section>

      {/* ═══ Testimonial Ribbon ═══ */}
      <section className="py-20 border-y border-[rgba(255,255,255,0.05)] bg-[#0C0E15]">
        <div className="mx-auto max-w-3xl px-8 text-center">
          <blockquote className="font-display text-[1.6rem] leading-relaxed text-foreground sm:text-[2rem]">
            &ldquo;{testimonialQuote}&rdquo;
          </blockquote>
          <p className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {testimonialAuthor}
            {testimonialDetail && (
              <span className="font-normal"> — {testimonialDetail}</span>
            )}
          </p>
        </div>
      </section>

      {/* ═══ Recent Galleries ═══ */}
      <section className="animate-fade-in-up delay-3 py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <p className="section-label mb-3">Portfolio</p>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">
              Recent Galleries
            </h2>
            <Link
              href="/galleries"
              className="hidden text-[0.76rem] font-medium uppercase tracking-[0.1em] text-[#94B8D0] transition-colors hover:text-[#C2DAE8] sm:inline-flex items-center gap-2"
            >
              All Galleries →
            </Link>
          </div>
          <div className="mt-10">
            {recentGalleries && recentGalleries.length > 0 ? (
              <HorizontalMasonry
                items={recentGalleries}
                renderItem={(gallery) => <GalleryCard key={gallery._id} gallery={gallery} blurMap={blurMap} />}
              />
            ) : (
              <p className="text-muted-foreground">
                No galleries yet. Add content in Sanity Studio.
              </p>
            )}
          </div>
          <Link
            href="/galleries"
            className="mt-8 inline-block text-[0.76rem] font-medium uppercase tracking-[0.1em] text-[#94B8D0] transition-colors hover:text-[#C2DAE8] sm:hidden"
          >
            All Galleries →
          </Link>
        </div>
      </section>

      {/* ═══ Bottom CTA ═══ */}
      <section className="relative py-24 overflow-hidden bg-[#0C0E15] border-t border-[rgba(255,255,255,0.05)]">
        {/* Ice glow */}
        <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(148, 184, 208, 0.10) 0%, transparent 65%)" }} />
        <div className="relative mx-auto max-w-xl px-6 text-center">
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            Let&apos;s capture your <em className="not-italic text-[#94B8D0]">story</em>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Professional event photography. Enquire about upcoming events, private sessions, or prints.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] transition-all hover:translate-y-[-2px]"
            style={{ background: "#94B8D0", color: "#08090D" }}
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ─── Event Card ─── */
function EventCard({ event, blurMap }: { event: UpcomingEvent; blurMap: BlurMap }) {
  const slug = event.slug?.current;
  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "";

  const content = (
    <>
      <div className="relative aspect-[3/2] overflow-hidden rounded-t-xl bg-muted">
        {event.coverImage?.asset?._ref && (
          <ProtectedCoverImage
            src={sanityImageUrlFor(event.coverImage, { w: 600, q: 80 })}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            containerClassName="h-full w-full img-desat group-hover:saturate-100 transition-transform duration-700"
            blurDataURL={event.coverImage?.asset?._ref ? blurMap.get(event.coverImage.asset._ref) : undefined}
          />
        )}
        {/* Date badge */}
        {dateStr && (
          <div className="absolute top-3 left-3 rounded-lg backdrop-blur-[14px] px-3 py-1.5" style={{ background: "rgba(12, 14, 21, 0.6)", border: "1px solid rgba(148, 184, 208, 0.08)" }}>
            <span className="text-[0.68rem] font-medium text-[#94B8D0]">
              {dateStr}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-[1.15rem] text-foreground">
          {event.title ?? "Untitled event"}
        </h3>
        {event.venue && (
          <p className="mt-1 flex items-center gap-1.5 text-[0.8rem] text-muted-foreground">
            <span className="text-[0.5rem] text-[#94B8D0]">◇</span>
            {event.venue}
          </p>
        )}
      </div>
    </>
  );

  if (slug) {
    return (
      <Link
        href={`/events/${slug}`}
        className="group glass-card block overflow-hidden"
      >
        {content}
      </Link>
    );
  }
  return (
    <div className="group glass-card overflow-hidden">
      {content}
    </div>
  );
}

/* ─── Gallery Card ─── */
function GalleryCard({ gallery, className, blurMap }: { gallery: RecentGallery; className?: string; blurMap: BlurMap }) {
  const slug = gallery.slug?.current;
  const content = (
    <div className="relative w-fit h-fit overflow-hidden flex items-center justify-center">
      {gallery.coverImage?.public_id && (
        <ProtectedCoverImage
          src={cloudinaryImageUrlFor(gallery.coverImage, { w: 900, q: 80 })}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="!w-auto !h-auto max-w-full max-h-[60vh]"
          containerClassName="w-fit h-fit flex justify-center items-center img-desat group-hover:saturate-100 transition-all duration-700"
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
  );

  if (slug) {
    return (
      <div className={`w-full flex justify-center ${className ?? ""}`}>
        <Link
          href={`/galleries/${slug}`}
          className="group block overflow-hidden w-fit h-fit rounded-none"
        >
          {content}
        </Link>
      </div>
    );
  }
  return (
    <div className={`w-full flex justify-center ${className ?? ""}`}>
      <div className="group block overflow-hidden w-fit h-fit rounded-none">
        {content}
      </div>
    </div>
  );
}
