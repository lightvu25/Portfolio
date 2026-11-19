import { Fragment } from "react";

import { PLACEHOLDER_PREFIX, PLACEHOLDER_SUFFIX } from "@/types/content";

interface PlaceholderTextProps {
  text: string;
  className?: string;
  compact?: boolean;
}

const TOKEN_REGEX = /⟨PLACEHOLDER:\s*([^⟩]+)⟩/g;

/**
 * Renders strings from `src/content/*` safely: plain strings render verbatim,
 * while any `⟨PLACEHOLDER: ...⟩` token renders as a clearly marked editable badge.
 */
export function PlaceholderText({
  text,
  className = "",
  compact = false,
}: PlaceholderTextProps) {
  if (!text.includes(PLACEHOLDER_PREFIX) || !text.includes(PLACEHOLDER_SUFFIX)) {
    return className ? <span className={className}>{text}</span> : <>{text}</>;
  }

  const parts: { type: "text" | "placeholder"; value: string }[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TOKEN_REGEX)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, idx) });
    }
    parts.push({ type: "placeholder", value: match[1].trim() });
    lastIndex = idx + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.type === "text" ? (
          <Fragment key={i}>{part.value}</Fragment>
        ) : (
          <span
            key={i}
            title="Editable content placeholder — update in src/content/"
            className={
              compact
                ? "inline-block border border-dashed border-demo/60 bg-demo-bg px-1.5 py-0.5 font-mono text-[0.78em] font-medium text-demo align-baseline"
                : "inline-flex items-center gap-1 border border-dashed border-demo/60 bg-demo-bg px-2 py-0.5 font-mono text-[0.82em] font-medium text-demo align-baseline"
            }
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-pixel shrink-0" />
            <span>[{part.value}]</span>
          </span>
        )
      )}
    </span>
  );
}
