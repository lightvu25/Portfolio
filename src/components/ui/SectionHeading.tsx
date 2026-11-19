import type { ReactNode } from "react";

import { PixelCluster } from "@/components/pixel/PixelCluster";

interface SectionHeadingProps {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "split";
  as?: "h1" | "h2";
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  as: HeadingTag = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={
        align === "split"
          ? "grid gap-6 lg:grid-cols-12 lg:items-end"
          : "max-w-3xl space-y-4"
      }
    >
      <div className={align === "split" ? "space-y-4 lg:col-span-7" : "space-y-3"}>
        <div className="flex flex-wrap items-center gap-2.5">
          {index && (
            <span className="inline-flex items-center border border-ink bg-ink px-1.5 py-0.5 font-pixel text-[10px] leading-none text-paper tracking-wider">
              {index}
            </span>
          )}
          <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent">
            {eyebrow}
          </span>
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-pixel" />
        </div>

        <HeadingTag
          className={
            HeadingTag === "h1"
              ? "font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]"
              : "font-display text-2xl font-semibold tracking-tight text-ink sm:text-4xl lg:leading-[1.12]"
          }
        >
          {title}
        </HeadingTag>
      </div>

      {description && (
        <div
          className={
            align === "split"
              ? "lg:col-span-5 lg:pb-1"
              : "pt-1"
          }
        >
          <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
            {description}
          </p>
        </div>
      )}

      {align === "split" && (
        <div className="lg:col-span-12">
          <PixelCluster variant="step-bar" />
        </div>
      )}
    </div>
  );
}
