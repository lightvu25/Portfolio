"use client";

import { domAnimation, LazyMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal-item")
    );

    if (reduced) {
      for (const el of nodes) {
        el.dataset.revealed = "true";
      }
      return;
    }

    const viewportCutoff = window.innerHeight * 0.94;
    const belowFold: HTMLElement[] = [];

    for (const el of nodes) {
      if (el.dataset.revealed === "true") continue;
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportCutoff && rect.bottom > 0) {
        el.dataset.revealed = "true";
      } else {
        belowFold.push(el);
      }
    }

    document.documentElement.classList.add("js-enabled");

    if (belowFold.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.dataset.revealed = "true";
            observer.unobserve(target);
          }
        }
      },
      { rootMargin: "0px 0px -32px 0px", threshold: 0.01 }
    );

    for (const el of belowFold) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
