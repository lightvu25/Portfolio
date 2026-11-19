import type { Metadata } from "next";

import { ContactSection } from "@/components/inquiry/ContactSection";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { PixelCluster } from "@/components/pixel/PixelCluster";
import { PixelField } from "@/components/pixel/PixelField";
import { AddOnsSection } from "@/components/services/AddOnsSection";
import { FaqSection } from "@/components/services/FaqSection";
import { PricingSection } from "@/components/services/PricingSection";
import { ProcessSection } from "@/components/services/ProcessSection";
import { ServiceCategoryGrid } from "@/components/services/ServiceCategoryGrid";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Web Development Services & Pricing",
  description:
    "Custom web development services, starting-price packages, development process, and project inquiry for individuals, studios, small shops, and SMEs.",
};

export default function ServicesPage() {
  return (
    <>
      <section
        data-pixel-stage
        className="relative overflow-hidden border-b border-line py-14 sm:py-20"
      >
        <PixelField />
        <Container className="relative z-10 space-y-8">
          <SectionHeading
            index="SERVICES"
            eyebrow="Web Development for Creators, Shops & SMEs"
            as="h1"
            title="Clear scopes, modern engineering, and websites built to earn inquiries."
            description="From single-page launches and photography portfolios to appointment booking flows, CMS-managed sites, and custom web applications—choose a starting structure that matches your stage."
          />

          <div className="flex flex-wrap items-center gap-3.5">
            <ButtonLink href="#pricing" variant="primary" icon="arrow-right">
              View Starting Packages
            </ButtonLink>
            <ButtonLink href="#project-inquiry" variant="secondary" icon="spark">
              Request a Custom Quote
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="border-b border-line py-16 sm:py-24">
        <Container className="space-y-10 sm:space-y-12">
          <Reveal>
            <SectionHeading
              index="01"
              eyebrow="Capabilities"
              title="What I can build for your business or practice."
              description="Each website is tailored around what your visitors need to understand and do—avoiding one-size-fits-all templates."
              align="split"
            />
          </Reveal>

          <ServiceCategoryGrid />
        </Container>
      </section>

      <section
        id="pricing"
        className="scroll-mt-20 border-b border-line bg-paper-2/55 py-16 sm:py-24"
      >
        <Container className="space-y-10 sm:space-y-12">
          <Reveal>
            <SectionHeading
              index="02"
              eyebrow="Starting Packages"
              title="Three starting tiers structured around real project complexity."
              description="Compare what is included in a focused landing page versus a multi-page business site or a custom booking/e-commerce build."
              align="split"
            />
          </Reveal>

          <Reveal>
            <PricingSection />
          </Reveal>
        </Container>
      </section>

      <section className="border-b border-line py-16 sm:py-24">
        <Container className="space-y-10 sm:space-y-12">
          <Reveal>
            <SectionHeading
              index="03"
              eyebrow="Optional Modules"
              title="Add-ons & custom extensions."
              description="Need self-service CMS editing, bilingual pages, or a session booking module added to a project? Modules can be scoped alongside your core build or added in a later phase."
              align="split"
            />
          </Reveal>

          <AddOnsSection />
        </Container>
      </section>

      <section className="border-b border-line bg-paper-2/55 py-16 sm:py-24">
        <Container className="space-y-10 sm:space-y-12">
          <Reveal>
            <SectionHeading
              index="04"
              eyebrow="How Projects Run"
              title="A calm, predictable five-step process."
              description="No mystery timelines—every milestone ends with something concrete you can review in your own browser."
              align="split"
            />
          </Reveal>

          <ProcessSection />
        </Container>
      </section>

      <section className="border-b border-line py-16 sm:py-24">
        <Container className="space-y-10 sm:space-y-12">
          <Reveal>
            <SectionHeading
              index="05"
              eyebrow="FAQ"
              title="Common questions before starting."
              description="Straightforward answers on scope, mobile support, content preparation, and ownership."
            />
          </Reveal>

          <Reveal>
            <FaqSection />
          </Reveal>
        </Container>
      </section>

      <ContactSection
        index="06"
        heading="Tell me about your project."
        subheading="Select a website type above or fill out the brief directly. Even rough notes are plenty to start an honest scope conversation."
      />

      <section className="border-t border-line bg-paper-card py-14 sm:py-16">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-6 border border-ink bg-paper p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-accent">
                <PixelCluster variant="spark" />
                <span>SEE THE CRAFT FIRST</span>
              </div>
              <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                Want to inspect a real case study before reaching out?
              </h2>
              <p className="text-sm text-ink-muted sm:text-base">
                Explore how photography galleries and session booking come
                together in the Bấu Chụp Choẹt project walkthrough.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <ButtonLink
                href="/web-service/work/bau-chup-choet/"
                variant="secondary"
                icon="arrow-right"
              >
                Read Bấu Chụp Choẹt Case Study
              </ButtonLink>
              <ButtonLink
                href="#project-inquiry"
                variant="primary"
                icon="arrow-right"
              >
                Start Inquiry Above
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
