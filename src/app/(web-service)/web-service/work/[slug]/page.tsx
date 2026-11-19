import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContactSection } from "@/components/inquiry/ContactSection";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { PixelCluster, PixelDivider } from "@/components/pixel/PixelCluster";
import { PixelField } from "@/components/pixel/PixelField";
import { PixelIcon } from "@/components/pixel/PixelIcon";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { getProjectBySlug, projects } from "@/content/projects";
import { isPlaceholder } from "@/types/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: "Project Not Found" };
  }
  return {
    title: `${project.title} — Case Study`,
    description: project.summary,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  const { caseStudy } = project;
  const liveUrlIsPlaceholder = !project.liveUrl || isPlaceholder(project.liveUrl);

  return (
    <>
      {/* Case Study Hero */}
      <section
        data-pixel-stage
        className="relative overflow-hidden border-b border-line py-12 sm:py-16 lg:py-20"
      >
        <PixelField />
        <Container className="relative z-10 space-y-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 font-mono text-xs text-ink-muted"
          >
            <Link
              href="/web-service/work/"
              className="underline underline-offset-4 hover:text-accent"
            >
              Work
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-ink">{project.title}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="space-y-4 lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="border border-ink bg-ink px-2 py-0.5 font-pixel text-[10px] text-paper">
                  CASE {project.index}
                </span>
                <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent">
                  {project.category}
                </span>
              </div>

              <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-[3.5rem] lg:leading-[1.06]">
                {project.title}
              </h1>

              <p className="font-display text-lg text-ink-muted sm:text-xl">
                {project.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              {liveUrlIsPlaceholder ? (
                <div className="border border-dashed border-demo/60 bg-demo-bg px-3.5 py-2 font-mono text-xs text-demo">
                  Live URL:{" "}
                  <PlaceholderText text={project.liveUrl ?? ""} compact />
                </div>
              ) : (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pixel-btn inline-flex min-h-11 items-center gap-2 border border-ink bg-accent px-5 py-2.5 font-mono text-xs font-medium text-white hover:bg-accent-hover"
                >
                  <span>Visit Live Website</span>
                  <PixelIcon name="arrow-up-right" size={14} />
                </a>
              )}
            </div>
          </div>

          <dl className="grid gap-5 border-y border-ink bg-paper-card p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                Project Type
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {project.projectType}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                Client Domain
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {project.clientType}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                Year
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                <PlaceholderText text={project.year} compact />
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                Scope Focus
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                Portfolio Showcase + Booking UX
              </dd>
            </div>
          </dl>

          <figure className="space-y-2.5">
            <div className="overflow-hidden border border-ink bg-paper-card">
              <Image
                src={project.cover.src}
                alt={project.cover.alt}
                width={project.cover.width}
                height={project.cover.height}
                priority
                className="h-auto w-full"
              />
            </div>
            {project.cover.caption && (
              <figcaption className="font-mono text-xs text-ink-subtle">
                <PlaceholderText text={project.cover.caption} compact />
              </figcaption>
            )}
          </figure>
        </Container>
      </section>

      {/* Overview, Problem/Goal & Role/Stack */}
      <section className="border-b border-line py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-7">
            <Reveal className="space-y-4">
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                Project Overview
              </h2>
              <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
                {caseStudy.overview}
              </p>
            </Reveal>

            <PixelDivider />

            <Reveal className="space-y-4">
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                Problem &amp; Goals
              </h2>
              <ul className="space-y-3.5 text-base leading-relaxed text-ink-muted">
                {caseStudy.problemAndGoal.map((goal) => (
                  <li key={goal} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-2 w-2 shrink-0 bg-accent"
                    />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <Reveal className="space-y-5 border border-ink bg-paper-card p-6">
              <div>
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  Developer&apos;s Role
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {caseStudy.roleSummary}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.role.map((item) => (
                    <Tag key={item} label={item} />
                  ))}
                </div>
              </div>

              <div className="border-t border-line pt-4">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                  Deliverables
                </h3>
                <ul className="mt-2.5 space-y-2 text-sm text-ink-muted">
                  {caseStudy.deliverables.map((deliv) => (
                    <li key={deliv} className="flex items-start gap-2">
                      <PixelIcon
                        name="check"
                        size={14}
                        className="mt-1 text-success"
                      />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-line pt-4">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                  Technology Stack
                </h3>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <Tag key={tech} label={tech} tone="accent" />
                  ))}
                </div>
                {!project.stackConfirmed && (
                  <p className="mt-2 font-mono text-[11px] text-ink-subtle">
                    Update exact production packages in{" "}
                    <code>src/content/projects.ts</code>.
                  </p>
                )}
              </div>
            </Reveal>
          </aside>
        </Container>
      </section>

      {/* Design & Implementation Approach */}
      <section className="border-b border-line bg-paper-2/55 py-16 sm:py-24">
        <Container className="space-y-10">
          <Reveal>
            <SectionHeading
              index="01"
              eyebrow="Design & Implementation Approach"
              title="Structuring visual storytelling alongside effortless shoot booking."
            />
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {caseStudy.approach.map((item, idx) => (
              <Reveal key={item.step} delayMs={idx * 70}>
                <div className="h-full space-y-3 border border-ink bg-paper-card p-6">
                  <span className="inline-block border border-ink bg-ink px-2 py-0.5 font-pixel text-[10px] text-paper">
                    {item.step}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    {item.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Visual Demonstrations Gallery */}
      <section className="border-b border-line py-16 sm:py-24">
        <Container className="space-y-10">
          <Reveal>
            <SectionHeading
              index="02"
              eyebrow="Visual Walkthrough"
              title="Selected interface views & responsive workflows."
              description="Schematic previews illustrating gallery filtering, session slot selection, and mobile booking ergonomics. Replace with production screenshots in public/projects/bau-chup-choet/."
              align="split"
            />
          </Reveal>

          <div className="space-y-10">
            {caseStudy.gallery.map((shot, idx) => (
              <Reveal key={shot.src} delayMs={idx * 60}>
                <figure className="space-y-2.5">
                  <div className="overflow-hidden border border-ink bg-paper-card">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={shot.width}
                      height={shot.height}
                      loading="lazy"
                      className="h-auto w-full"
                    />
                  </div>
                  {shot.caption && (
                    <figcaption className="font-mono text-xs text-ink-subtle">
                      <PlaceholderText text={shot.caption} compact />
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Key Technical Challenges & Solutions */}
      <section className="border-b border-line bg-paper-2/55 py-16 sm:py-24">
        <Container className="space-y-10">
          <Reveal>
            <SectionHeading
              index="03"
              eyebrow="Engineering Decisions"
              title="Key technical challenges & solutions."
            />
          </Reveal>

          <div className="space-y-5">
            {caseStudy.challenges.map((challenge, idx) => (
              <Reveal key={idx} delayMs={idx * 60}>
                <div className="grid gap-6 border border-ink bg-paper-card p-6 sm:p-7 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <span className="font-mono text-xs text-accent">
                      CHALLENGE 0{idx + 1}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-semibold text-ink sm:text-xl">
                      <PlaceholderText text={challenge.title} />
                    </h3>
                  </div>
                  <div className="space-y-4 lg:col-span-8">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                        Constraint
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted sm:text-base">
                        <PlaceholderText text={challenge.problem} />
                      </p>
                    </div>
                    <div className="border-t border-line pt-3">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-success">
                        Resolution
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink sm:text-base">
                        <PlaceholderText text={challenge.solution} />
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Project Outcome */}
      <section className="border-b border-line py-16 sm:py-20">
        <Container>
          <Reveal className="space-y-5 border border-ink bg-paper-card p-6 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                04 // Project Outcome
              </span>
              <PixelCluster variant="spark" />
            </div>

            <p className="max-w-3xl font-display text-xl font-medium leading-relaxed text-ink sm:text-2xl">
              {caseStudy.outcome}
            </p>

            {caseStudy.outcomeNotes && (
              <div className="border-t border-line pt-4 text-sm text-ink-muted">
                <PlaceholderText text={caseStudy.outcomeNotes} />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <ButtonLink
                href="/web-service/work/"
                variant="secondary"
                icon="arrow-right"
              >
                Back to All Work
              </ButtonLink>
              <ButtonLink
                href="/web-service/services/"
                variant="primary"
                icon="spark"
              >
                Build a Similar Website
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>

      <ContactSection
        index="05"
        heading="Need a portfolio or booking experience like Bấu Chụp Choẹt?"
        subheading="Share your studio, creative practice, or service workflow below and we can plan a custom website around how your clients book."
      />
    </>
  );
}
