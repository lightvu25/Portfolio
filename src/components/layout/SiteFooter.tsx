import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { PixelCluster } from "@/components/pixel/PixelCluster";
import { PixelIcon } from "@/components/pixel/PixelIcon";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { navLinks, siteConfig } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-2/70">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Column 1: Identity */}
          <div className="space-y-4 md:col-span-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center border border-ink bg-paper-card">
                <PixelIcon name="cursor" size={15} />
              </span>
              <div>
                <p className="font-display text-base font-semibold text-ink">
                  <PlaceholderText text={siteConfig.personName} compact />{" "}
                  <span className="font-normal text-ink-muted">
                    — {siteConfig.brandTitle}
                  </span>
                </p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-ink-muted">
              {siteConfig.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 font-mono text-xs text-ink-muted">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 bg-success" />
                <span>{siteConfig.availabilityLabel}</span>
              </span>
              <span>
                Base: <PlaceholderText text={siteConfig.locationLabel} compact />
              </span>
            </div>
          </div>

          {/* Column 2: Sitemap */}
          <div className="space-y-3 md:col-span-3">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              Pages
            </h2>
            <ul className="space-y-2 font-mono text-xs">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 py-1 text-ink-muted transition-colors hover:text-accent"
                  >
                    <span className="font-pixel text-[10px] text-ink-subtle">
                      {link.code}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/web-service/work/bau-chup-choet/"
                  className="inline-flex items-center gap-2 py-1 text-ink-muted transition-colors hover:text-accent"
                >
                  <span className="font-pixel text-[10px] text-ink-subtle">
                    CS
                  </span>
                  <span>Bấu Chụp Choẹt Case Study</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Direct Contact & Profiles */}
          <div className="space-y-3 md:col-span-3">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              Connect
            </h2>
            <div className="space-y-2 font-mono text-xs text-ink-muted">
              {siteConfig.contactEmail ? (
                <p>
                  <a
                    href={`mailto:${siteConfig.contactEmail}`}
                    className="underline underline-offset-4 hover:text-accent"
                  >
                    {siteConfig.contactEmail}
                  </a>
                </p>
              ) : (
                <p>
                  Email:{" "}
                  <span className="border border-dashed border-demo/60 bg-demo-bg px-1.5 py-0.5 text-[11px] text-demo">
                    [Set NEXT_PUBLIC_CONTACT_EMAIL]
                  </span>
                </p>
              )}

              <ul className="space-y-1.5 pt-1">
                {siteConfig.socialLinks.map((social) => (
                  <li key={social.label}>
                    {social.isPlaceholder ? (
                      <span className="inline-flex flex-wrap items-center gap-1.5 text-ink-subtle">
                        <span>{social.label}:</span>
                        <PlaceholderText text={social.href} compact />
                      </span>
                    ) : (
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-accent"
                      >
                        <span>{social.label}</span>
                        <PixelIcon name="arrow-up-right" size={12} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-ink-subtle">
            Built with semantic HTML, TypeScript &amp; restrained pixel craft.
          </p>
          <PixelCluster variant="spark" />
        </div>
      </Container>
    </footer>
  );
}
