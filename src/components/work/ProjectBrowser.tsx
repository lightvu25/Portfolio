"use client";

import { useState } from "react";

import type { Project } from "@/types/content";
import { ProjectCard } from "./ProjectCard";

interface ProjectBrowserProps {
  projects: Project[];
}

export function ProjectBrowser({ projects }: ProjectBrowserProps) {
  const categories = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.category))),
  ];
  const [selected, setSelected] = useState<string>("All");

  const filtered =
    selected === "All"
      ? projects
      : projects.filter((p) => p.category === selected);

  return (
    <div className="space-y-8">
      {/* Accessible category filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
        <div
          role="group"
          aria-label="Filter projects by category"
          className="flex flex-wrap items-center gap-2"
        >
          {categories.map((category) => {
            const active = selected === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(category)}
                className={`inline-flex min-h-10 items-center gap-2 border px-3.5 py-1.5 font-mono text-xs font-medium transition-colors ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper-card text-ink-muted hover:border-ink hover:text-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 ${
                    active ? "bg-pixel" : "bg-line-strong"
                  }`}
                />
                <span>{category}</span>
              </button>
            );
          })}
        </div>

        <p className="font-mono text-xs text-ink-subtle">
          Showing {filtered.length}{" "}
          {filtered.length === 1 ? "featured project" : "projects"}
        </p>
      </div>

      {/* Responsive Project Showcase */}
      {filtered.length === 1 ? (
        <ProjectCard project={filtered[0]} spotlight />
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {filtered.map((project, index) => (
            <div
              key={project.slug}
              className={index === 0 && project.featured ? "md:col-span-2" : ""}
            >
              <ProjectCard
                project={project}
                spotlight={index === 0 && project.featured}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
