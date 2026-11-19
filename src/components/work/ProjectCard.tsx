"use client";

import { m, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { PointerEvent } from "react";

import { useFinePointer, useReducedMotionPref } from "@/components/motion/hooks";
import { PixelCluster } from "@/components/pixel/PixelCluster";
import { PixelIcon } from "@/components/pixel/PixelIcon";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { Tag } from "@/components/ui/Tag";
import type { Project } from "@/types/content";

interface ProjectCardProps {
  project: Project;
  spotlight?: boolean;
}

export function ProjectCard({ project, spotlight = false }: ProjectCardProps) {
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotionPref();
  const enableTilt = finePointer && !reducedMotion;

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 260, damping: 26 });
  const rotateY = useSpring(rawRotateY, { stiffness: 260, damping: 26 });

  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!enableTilt || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rawRotateX.set(-ny * 3.5);
    rawRotateY.set(nx * 3.5);
  };

  const handlePointerLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  const href = `/web-service/work/${project.slug}/`;

  return (
    <m.article
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        enableTilt
          ? {
              rotateX,
              rotateY,
              transformPerspective: 1100,
            }
          : undefined
      }
      className={`group relative border border-ink bg-paper-card transition-colors focus-within:border-accent hover:border-ink ${
        spotlight ? "grid lg:grid-cols-12" : "flex flex-col"
      }`}
    >
      {/* Media Column */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className={`relative block overflow-hidden bg-paper-2 ${
          spotlight
            ? "border-b border-line lg:col-span-7 lg:border-r lg:border-b-0"
            : "border-b border-line"
        }`}
      >
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] group-focus-within:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>

        {/* Stepped pixel corner indicator */}
        <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 border border-ink bg-paper-card/95 px-2.5 py-1 font-mono text-[11px] font-medium text-ink">
          <span className="font-pixel text-[10px] text-accent">
            {project.index}
          </span>
          <span>{project.category}</span>
        </div>

        {project.cover.isPlaceholder && (
          <div className="pointer-events-none absolute right-3 bottom-3 border border-dashed border-demo/70 bg-demo-bg/95 px-2 py-0.5 font-mono text-[10px] text-demo">
            UI Schematic Placeholder
          </div>
        )}
      </Link>

      {/* Details Column */}
      <div
        className={`flex flex-col justify-between p-5 sm:p-7 lg:p-8 ${
          spotlight ? "lg:col-span-5" : "flex-1"
        }`}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-ink-muted">
            <span>{project.projectType}</span>
            <span>
              Year: <PlaceholderText text={project.year} compact />
            </span>
          </div>

          <div>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              <Link
                href={href}
                className="inline-flex items-baseline gap-2.5 hover:text-accent focus-visible:text-accent"
              >
                <span>{project.title}</span>
              </Link>
            </h3>
            <p className="mt-1 font-mono text-xs text-accent">
              {project.subtitle}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-ink-muted sm:text-base">
            {project.summary}
          </p>

          {spotlight && project.highlights.length > 0 && (
            <ul className="space-y-2 border-t border-line pt-4 text-sm text-ink-muted">
              {project.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Role & Technology Labels */}
          <div className="space-y-3 border-t border-line pt-4">
            <div>
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                Role
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.role.map((roleItem) => (
                  <Tag key={roleItem} label={roleItem} />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                Focus &amp; Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <Tag key={tech} label={tech} tone="accent" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
          <Link
            href={href}
            className="pixel-btn inline-flex min-h-11 items-center gap-2.5 border border-ink bg-ink px-4 py-2 font-mono text-xs font-medium text-paper hover:bg-accent hover:text-white"
          >
            <span>Read Case Study</span>
            <PixelIcon
              name="arrow-right"
              size={14}
              className="transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none"
            />
          </Link>

          <PixelCluster variant="spark" className="hidden sm:block" />
        </div>
      </div>
    </m.article>
  );
}
