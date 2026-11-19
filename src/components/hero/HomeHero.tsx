import { Container } from "@/components/layout/Container";
import { PixelField } from "@/components/pixel/PixelField";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { siteConfig } from "@/content/site";
import { AsciiMark } from "./AsciiMark";

export function HomeHero() {
  return (
    <section
      data-pixel-stage
      className="relative overflow-hidden border-b border-line py-12 sm:py-16 lg:py-24"
    >
      <PixelField />

      <Container className="relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Copy Column */}
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex flex-wrap items-center gap-2 border border-line bg-paper-card/95 px-3 py-1.5 font-mono text-xs text-ink-muted">
              <span aria-hidden="true" className="h-2 w-2 bg-accent" />
              <span className="font-medium text-ink">
                <PlaceholderText text={siteConfig.personName} compact />
              </span>
              <span aria-hidden="true" className="text-line-strong">
                /
              </span>
              <span>{siteConfig.brandTitle}</span>
            </div>

            <h1 className="font-display text-[2.05rem] leading-[1.08] font-semibold tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]">
              Websites built with{" "}
              <span className="underline decoration-accent decoration-2 underline-offset-8">
                editorial clarity
              </span>{" "}
              and interactive craft.
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg sm:leading-relaxed">
              I design and engineer responsive websites for creators, independent
              shops, and small-to-medium businesses—from focused portfolios and
              landing pages to structured booking flows and custom web systems.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <ButtonLink href="/web-service/work/" variant="primary" icon="arrow-right">
                Explore Work
              </ButtonLink>
              <ButtonLink href="/web-service/services/" variant="secondary" icon="spark">
                View Services &amp; Pricing
              </ButtonLink>
            </div>

            {/* Concise capability strip */}
            <dl className="grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-3">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                  Focus
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  Portfolios, Business &amp; Booking Web
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                  Clients
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  Individuals, Studios &amp; SMEs
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                  Approach
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  Responsive, Accessible &amp; Fast
                </dd>
              </div>
            </dl>
          </div>

          {/* Signature 3D ASCII Voxel Cursor Column */}
          <div className="lg:col-span-5">
            <AsciiMark />
          </div>
        </div>
      </Container>
    </section>
  );
}
