import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/work/ProjectCard";
import { projects } from "@/content/projects";

export function SelectedWork() {
  const featuredProjects = projects.filter((p) => p.featured);

  return (
    <section className="border-b border-line py-16 sm:py-24">
      <Container className="space-y-10 sm:space-y-12">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow="Selected Work"
            title="Real-world web interfaces built around clarity and conversion."
            description="A closer look at how visual storytelling, responsive layout architecture, and practical user flows come together in production."
            align="split"
          />
        </Reveal>

        <div className="space-y-10">
          {featuredProjects.map((project, idx) => (
            <Reveal key={project.slug} delayMs={idx * 80}>
              <ProjectCard
                project={project}
                spotlight={featuredProjects.length === 1 || idx === 0}
              />
            </Reveal>
          ))}
        </div>

        <Reveal className="flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-ink-muted">
            Detailed architecture, problem breakdown, and booking UX walkthrough inside.
          </p>
          <ButtonLink href="/web-service/work/" variant="secondary" icon="arrow-right">
            View Work Archive
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
