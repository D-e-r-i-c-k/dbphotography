"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { HeaderCartLink } from "./HeaderCartLink";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/galleries", label: "Galleries" },
    { href: "/contact", label: "Contact" },
];

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const toggle = useCallback(() => setOpen((prev) => !prev), []);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
                onClick={toggle}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
            >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-[#08090D]/60 backdrop-blur-sm md:hidden"
                    onClick={() => setOpen(false)}
                    aria-hidden
                />
            )}

            {/* Slide-out panel */}
            <nav
                className={`fixed top-0 right-0 z-50 flex h-full w-64 flex-col bg-[#0C0E15] border-l border-border shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex h-[72px] items-center justify-end px-6">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <ul className="flex flex-col gap-1 px-4">
                    {NAV_LINKS.map(({ href, label }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                onClick={() => setOpen(false)}
                                className={`block rounded-md px-4 py-3 text-sm font-medium uppercase tracking-wide transition-colors ${pathname === href
                                        ? "bg-[#191C26] text-ice"
                                        : "text-muted-foreground hover:bg-[#191C26] hover:text-foreground"
                                    }`}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                    <li className="mt-2 border-t border-border pt-3 px-4">
                        <HeaderCartLink />
                    </li>
                </ul>
            </nav>
        </>
    );
}
