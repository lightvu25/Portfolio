interface PixelClusterProps {
  variant?: "corner-tl" | "corner-br" | "step-bar" | "spark";
  className?: string;
}

/**
 * Intentional, restrained pixel-art accents. Always marked `aria-hidden`
 * so assistive technology skips decorative geometry.
 */
export function PixelCluster({
  variant = "corner-tl",
  className = "",
}: PixelClusterProps) {
  if (variant === "step-bar") {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center gap-1 ${className}`.trim()}
      >
        <span className="h-1.5 w-6 bg-ink" />
        <span className="h-1.5 w-1.5 bg-accent" />
        <span className="h-1.5 w-1.5 bg-pixel animate-pixel-pulse" />
        <span className="h-px flex-1 bg-line" />
      </div>
    );
  }

  if (variant === "spark") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        shapeRendering="crispEdges"
        aria-hidden="true"
        className={className}
      >
        <rect x="8" y="0" width="4" height="4" fill="var(--accent)" />
        <rect
          x="16"
          y="8"
          width="4"
          height="4"
          fill="var(--pixel-amber)"
          className="animate-pixel-pulse"
        />
        <rect x="8" y="8" width="4" height="4" fill="var(--ink)" />
        <rect x="0" y="16" width="4" height="4" fill="var(--line-strong)" />
      </svg>
    );
  }

  if (variant === "corner-br") {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        shapeRendering="crispEdges"
        aria-hidden="true"
        className={className}
      >
        <rect x="18" y="18" width="6" height="6" fill="var(--ink)" />
        <rect x="12" y="18" width="6" height="6" fill="var(--line-strong)" />
        <rect x="18" y="12" width="6" height="6" fill="var(--accent)" />
        <rect
          x="6"
          y="18"
          width="4"
          height="4"
          fill="var(--pixel-amber)"
          className="animate-pixel-pulse"
        />
      </svg>
    );
  }

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      <rect x="0" y="0" width="6" height="6" fill="var(--ink)" />
      <rect x="6" y="0" width="6" height="6" fill="var(--accent)" />
      <rect x="0" y="6" width="6" height="6" fill="var(--line-strong)" />
      <rect
        x="14"
        y="0"
        width="4"
        height="4"
        fill="var(--pixel-amber)"
        className="animate-pixel-pulse"
      />
    </svg>
  );
}

export function PixelDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center gap-2 py-2 ${className}`.trim()}
    >
      <span className="h-2 w-2 bg-ink" />
      <span className="h-2 w-2 bg-accent" />
      <span className="h-px flex-1 bg-line" />
      <span className="h-1.5 w-1.5 bg-line-strong" />
      <span className="h-1.5 w-1.5 bg-pixel" />
    </div>
  );
}
