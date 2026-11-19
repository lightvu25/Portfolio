import Link from "next/link";
import type { ReactNode } from "react";

import { PixelIcon, type PixelIconName } from "@/components/pixel/PixelIcon";

interface ButtonLinkProps {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  icon?: PixelIconName;
  children: ReactNode;
  className?: string;
}

export function ButtonLink({
  href,
  variant = "primary",
  icon,
  children,
  className = "",
}: ButtonLinkProps) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2.5 px-5 py-2.5 font-mono text-xs sm:text-sm font-medium tracking-wide border transition-colors";

  const styles =
    variant === "primary"
      ? "pixel-btn border-ink bg-accent text-white hover:bg-accent-hover"
      : variant === "secondary"
        ? "pixel-btn pixel-btn-secondary border-ink bg-paper-card text-ink hover:bg-paper-2"
        : "border-transparent text-ink hover:text-accent underline underline-offset-4";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`.trim()}>
      <span>{children}</span>
      {icon && <PixelIcon name={icon} size={14} />}
    </Link>
  );
}
