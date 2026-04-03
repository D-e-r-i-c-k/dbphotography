export default function LoadingEvents() {
  return (
    <div className="animate-fade-in-up pt-[72px]">
      {/* Page header */}
      <div className="border-b border-[rgba(255,255,255,0.05)] py-14 bg-[#0C0E15]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="mb-3 h-3 w-16 animate-pulse rounded bg-white/10" />
          <div className="mb-4 h-10 w-40 animate-pulse rounded bg-white/20 sm:h-12 sm:w-56" />
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <li key={i}>
              <div className="group glass-card block overflow-hidden border border-white/5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-[#181A20] animate-pulse" />
                <div className="p-4">
                  <div className="mb-2 h-5 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
