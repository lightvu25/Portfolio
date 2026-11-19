import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  delayMs?: number;
  className?: string;
  children: ReactNode;
}

export function Reveal({
  as: Component = "div",
  delayMs = 0,
  className = "",
  children,
}: RevealProps) {
  const style =
    delayMs > 0
      ? ({ "--reveal-delay": `${delayMs}ms` } as CSSProperties)
      : undefined;

  return (
    <Component
      className={`reveal-item ${className}`.trim()}
      style={style}
    >
      {children}
    </Component>
  );
}
