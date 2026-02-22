"use client";

import { useEffect, useState } from "react";

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${scrolled
                    ? "bg-[#08090D]/75 backdrop-blur-xl border-b border-[rgba(148,184,208,0.08)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
                    : "bg-transparent border-b border-transparent"
                }`}
        >
            {children}
        </header>
    );
}
