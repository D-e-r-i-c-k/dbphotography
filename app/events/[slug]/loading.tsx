export default function LoadingEventSlug() {
  return (
    <div className="animate-fade-in-up pt-[72px]">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 block text-[0.8rem]">
          <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        </div>

        <article>
          <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#181A20] animate-pulse" />
          
          <header className="mt-8">
            <div className="mb-4 h-10 w-3/4 animate-pulse rounded bg-white/20 sm:h-12" />
            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-3 w-48 animate-pulse rounded bg-white/5" />
          </header>

          <div className="mt-6 flex flex-col gap-3">
            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            <div className="h-4 w-[95%] animate-pulse rounded bg-white/10" />
            <div className="h-4 w-[90%] animate-pulse rounded bg-white/10" />
            <div className="h-4 w-[75%] animate-pulse rounded bg-white/10" />
            <div className="h-4 w-[85%] animate-pulse rounded bg-white/10" />
          </div>

          <div className="mt-10">
            <div className="h-12 w-40 animate-pulse rounded-md bg-[#94B8D0]/30" />
          </div>
        </article>
      </div>
    </div>
  );
}
