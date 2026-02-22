import Link from "next/link";
import { HeaderCartLink } from "@/components/HeaderCartLink";
import { MobileNav } from "@/components/MobileNav";
import { HeaderWrapper } from "@/components/HeaderWrapper";

export function Header() {
  return (
    <HeaderWrapper>
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-10">
        <Link href="/" className="font-display text-[1.3rem] text-foreground">
          DB <span className="text-[#94B8D0]">Photography</span>
        </Link>
        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-[0.78rem] font-medium uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-ice-light"
          >
            Home
          </Link>
          <Link
            href="/events"
            className="text-[0.78rem] font-medium uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-ice-light"
          >
            Events
          </Link>
          <Link
            href="/galleries"
            className="text-[0.78rem] font-medium uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-ice-light"
          >
            Galleries
          </Link>
          <HeaderCartLink />
          <Link
            href="/contact"
            className="rounded-md border border-[rgba(148,184,208,0.3)] bg-[rgba(148,184,208,0.1)] px-5 py-2 text-[0.78rem] font-medium uppercase tracking-[0.1em] text-ice transition-all hover:bg-ice hover:text-[#08090D] hover:shadow-[0_4px_20px_rgba(148,184,208,0.1)]"
          >
            Contact
          </Link>
        </nav>
        {/* Mobile nav */}
        <MobileNav />
      </div>
    </HeaderWrapper>
  );
}
