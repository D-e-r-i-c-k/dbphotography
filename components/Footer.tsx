import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-12 pb-6">
        {/* Three-column layout */}
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-16">
          {/* Brand */}
          <div className="max-w-[260px]">
            <p className="font-display text-[1.4rem] text-foreground">
              DB <span className="text-[#94B8D0]">Photography</span>
            </p>
            <p className="mt-2 text-[0.82rem] text-muted-foreground">
              Professional event photography. Cape Town, South Africa.
            </p>
          </div>
          {/* Navigate */}
          <div>
            <h4 className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Navigate
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-[0.85rem] text-muted-foreground transition-colors hover:text-ice"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-[0.85rem] text-muted-foreground transition-colors hover:text-ice"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/galleries"
                  className="text-[0.85rem] text-muted-foreground transition-colors hover:text-ice"
                >
                  Galleries
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[0.85rem] text-muted-foreground transition-colors hover:text-ice"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          {/* Services */}
          <div>
            <h4 className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Services
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-[0.85rem] text-muted-foreground">
                  Event Coverage
                </span>
              </li>
              <li>
                <span className="text-[0.85rem] text-muted-foreground">
                  Photo Prints
                </span>
              </li>
              <li>
                <span className="text-[0.85rem] text-muted-foreground">
                  Digital Downloads
                </span>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-[0.72rem] text-muted-foreground">
            © {year} DB Photography · Derick Botha · South Africa
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-muted-foreground transition-colors hover:text-ice"
              aria-label="Instagram"
            >
              <svg
                className="h-[17px] w-[17px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1.5"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
            <a
              href="#"
              className="text-muted-foreground transition-colors hover:text-ice"
              aria-label="Facebook"
            >
              <svg
                className="h-[17px] w-[17px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
