import type { Metadata } from "next";

import { ContactSection } from "@/components/inquiry/ContactSection";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { PixelField } from "@/components/pixel/PixelField";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectBrowser } from "@/components/work/ProjectBrowser";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Work & Case Studies",
  description:
    "Selected web development projects and case studies, including Bấu Chụp Choẹt—a photography portfolio and session booking website.",
};

export default function WorkPage() {
  return (
    <>
      <section
        data-pixel-stage
        className="relative overflow-hidden border-b border-line py-14 sm:py-20"
      >
        <PixelField />
        <Container className="relative z-10 space-y-8">
          <SectionHeading
            index="WORK"
            eyebrow="Selected Projects & Case Studies"
            as="h1"
            title="Purposeful websites engineered around real client workflows."
            description="Each project balances editorial presentation, responsive implementation, and clear visitor paths—whether browsing photography series or booking a service."
          />

          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href="#project-inquiry" variant="primary" icon="arrow-right">
              Discuss a Project
            </ButtonLink>
            <ButtonLink href="/web-service/services/" variant="secondary" icon="spark">
              View Services &amp; Packages
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="border-b border-line py-14 sm:py-20">
        <Container>
          <Reveal>
            <ProjectBrowser projects={projects} />
          </Reveal>
        </Container>
      </section>

      <ContactSection
        index="02"
        heading="Planning a portfolio, studio site, or booking platform?"
        subheading="Tell me what your visitors need to see and do. We can scope a clean, responsive build tailored to your workflow."
      />
    </>
  );
}
