import { PlaceholderText } from "./PlaceholderText";

interface TagProps {
  label: string;
  tone?: "default" | "accent";
}

export function Tag({ label, tone = "default" }: TagProps) {
  return (
    <span
      className={
        tone === "accent"
          ? "inline-flex items-center border border-accent/35 bg-accent-soft px-2.5 py-1 font-mono text-xs font-medium text-accent"
          : "inline-flex items-center border border-line bg-paper px-2.5 py-1 font-mono text-xs text-ink-muted"
      }
    >
      <PlaceholderText text={label} compact />
    </span>
  );
}
