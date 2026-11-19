"use client";

import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useReducedMotionPref } from "@/components/motion/hooks";
import { PixelIcon } from "@/components/pixel/PixelIcon";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { navLinks, siteConfig } from "@/content/site";

function isActiveRoute(pathname: string, href: string): boolean {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const cleanHref = href.replace(/\/+$/, "") || "/";
  if (cleanHref === "/web-service") return cleanPath === "/web-service";
  return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotionPref();

  // Close mobile drawer when Escape is pressed and manage body scroll lock
  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        toggleBtnRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          toggleBtnRef.current?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          toggleBtnRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:px-6 lg:px-10">
        {/* Brand Identity */}
        <Link
          href="/web-service/"
          onClick={() => setMenuOpen(false)}
          className="group flex min-w-0 items-center gap-2.5 py-1"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink bg-paper-card transition-colors group-hover:bg-accent-soft">
            <PixelIcon name="cursor" size={16} className="text-ink" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-sm font-semibold tracking-tight text-ink sm:text-base">
              <PlaceholderText text={siteConfig.personName} compact />
            </span>
            <span className="block truncate font-mono text-[11px] text-ink-muted">
              {siteConfig.brandTitle}
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex md:items-center md:gap-1 lg:gap-2"
        >
          {navLinks.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex min-h-10 items-center gap-2 px-3.5 py-2 font-mono text-xs font-medium tracking-wide transition-colors ${
                  active
                    ? "text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 transition-colors ${
                    active ? "bg-accent" : "bg-transparent"
                  }`}
                />
                <span>{item.label}</span>
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute right-3.5 bottom-1 left-3.5 h-0.5 bg-ink"
                  />
                )}
              </Link>
            );
          })}

          <span aria-hidden="true" className="mx-2 h-4 w-px bg-line" />

          <a
            href="#project-inquiry"
            className="pixel-btn inline-flex min-h-10 items-center gap-2 border border-ink bg-accent px-4 py-2 font-mono text-xs font-medium text-white hover:bg-accent-hover"
          >
            <span>Start a Project</span>
            <PixelIcon name="arrow-right" size={12} />
          </a>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          ref={toggleBtnRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation-drawer"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-10 shrink-0 items-center gap-2 border border-ink bg-paper-card px-3 font-mono text-xs font-medium text-ink md:hidden"
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <span
            aria-hidden="true"
            className="grid grid-cols-2 gap-0.5"
          >
            <span className={`h-1.5 w-1.5 ${menuOpen ? "bg-accent" : "bg-ink"}`} />
            <span className="h-1.5 w-1.5 bg-ink" />
            <span className="h-1.5 w-1.5 bg-ink" />
            <span className={`h-1.5 w-1.5 ${menuOpen ? "bg-pixel" : "bg-accent"}`} />
          </span>
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <m.div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="border-b border-ink bg-paper px-4 pt-3 pb-6 shadow-sm sm:px-6 md:hidden"
          >
            <nav aria-label="Mobile navigation" className="space-y-1">
              {navLinks.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`flex min-h-12 items-center justify-between border px-4 py-3 font-mono text-sm font-medium ${
                      active
                        ? "border-ink bg-accent-soft text-ink"
                        : "border-line bg-paper-card text-ink-muted hover:border-ink hover:text-ink"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-pixel text-[10px] text-accent">
                        {item.code}
                      </span>
                      <span>{item.label}</span>
                    </span>
                    <PixelIcon name="arrow-right" size={14} />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 space-y-3 border-t border-line pt-4">
              <div className="flex items-center gap-2 font-mono text-xs text-ink-muted">
                <span aria-hidden="true" className="h-2 w-2 bg-success" />
                <span>{siteConfig.availabilityLabel}</span>
              </div>
              <a
                href="#project-inquiry"
                onClick={() => setMenuOpen(false)}
                className="pixel-btn flex min-h-12 w-full items-center justify-center gap-2 border border-ink bg-accent px-4 py-3 font-mono text-xs font-medium text-white"
              >
                <span>Start a Project</span>
                <PixelIcon name="arrow-right" size={14} />
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
