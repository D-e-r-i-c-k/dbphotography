export default function LoadingGallerySlug() {
  return (
    <div className="animate-fade-in-up pt-[72px]">
      {/* Page header */}
      <div className="border-b border-[rgba(255,255,255,0.05)] py-14 bg-[#0C0E15]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="mb-3 h-3 w-20 animate-pulse rounded bg-white/10" />
          <div className="mb-4 h-10 w-64 md:w-96 animate-pulse rounded bg-white/20 md:h-12" />
        </div>
      </div>

      {/* Masonry Skeleton */}
      <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
        <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`w-full overflow-hidden rounded-none border border-white/5 bg-[#181A20] animate-pulse ${
                i % 3 === 0 ? "h-64" : i % 2 === 0 ? "h-96" : "h-72"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
