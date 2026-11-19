import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { PixelIcon } from "@/components/pixel/PixelIcon";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homeServicesPreviewIds, serviceCategories } from "@/content/services";

export function ServicesPreview() {
  const previewServices = serviceCategories.filter((item) =>
    homeServicesPreviewIds.includes(item.id)
  );

  return (
    <section className="border-b border-line bg-paper-2/55 py-16 sm:py-24">
      <Container className="space-y-10 sm:space-y-12">
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="Services"
            title="Practical web development tailored to what your business actually needs."
            description="Whether you need a single high-clarity landing page, a photography portfolio with booking, or a multi-page company website, scope is matched to your goals—without bloated add-ons."
            align="split"
          />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {previewServices.map((service, idx) => (
            <Reveal key={service.id} delayMs={idx * 60}>
              <article className="group flex h-full flex-col justify-between border border-ink bg-paper-card p-6 transition-colors hover:border-accent sm:p-7">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center border border-ink bg-paper text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                      <PixelIcon name={service.icon} size={18} />
                    </span>
                    <span className="font-mono text-xs text-ink-subtle">
                      {service.code}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                    {service.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-ink-muted sm:text-base">
                    {service.shortSummary}
                  </p>
                </div>

                <div className="mt-6 border-t border-line pt-4">
                  <p className="font-mono text-xs text-ink-subtle">
                    Best for:{" "}
                    <span className="text-ink-muted">{service.idealFor}</span>
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="flex flex-col items-start justify-between gap-4 border border-ink bg-paper-card p-6 sm:flex-row sm:items-center sm:p-7">
          <div className="space-y-1">
            <p className="font-display text-lg font-semibold text-ink">
              Need CMS editing, e-commerce checkout, or custom backend logic?
            </p>
            <p className="text-sm text-ink-muted">
              Explore all 7 service categories, starting-price packages, and
              scope comparisons on the Services page.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <ButtonLink href="/web-service/services/" variant="primary" icon="arrow-right">
              Compare Packages
            </ButtonLink>
            <Link
              href="/web-service/services/#pricing"
              className="inline-flex min-h-11 items-center px-3 font-mono text-xs font-medium text-ink underline underline-offset-4 hover:text-accent"
            >
              Starting prices
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
