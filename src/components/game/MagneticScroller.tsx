"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

gsap.registerPlugin(ScrollToPlugin, useGSAP);

export interface SectionDescriptor {
  index: number;
  id: string;
  label: string;
  accentHex: string;
}

interface MagneticScrollContextValue {
  activeIndex: number;
  bootComplete: boolean;
  setBootComplete: (ready: boolean) => void;
  sections: SectionDescriptor[];
  goToSection: (index: number) => void;
}

const MagneticScrollContext = createContext<MagneticScrollContextValue | null>(
  null
);

export function useMagneticScroll(): MagneticScrollContextValue {
  const ctx = useContext(MagneticScrollContext);
  if (!ctx) {
    throw new Error(
      "useMagneticScroll must be used inside <MagneticScrollProvider>."
    );
  }
  return ctx;
}

const COOLDOWN_MS = 500;

function shouldYieldToInnerScroll(
  target: EventTarget | null,
  direction: 1 | -1
): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const scrollBox = target.closest<HTMLElement>("[data-inner-scroll]");
  if (!scrollBox) return false;

  const canScroll = scrollBox.scrollHeight > scrollBox.clientHeight + 2;
  if (!canScroll) return false;

  if (direction === 1) {
    return (
      scrollBox.scrollTop + scrollBox.clientHeight < scrollBox.scrollHeight - 2
    );
  }
  return scrollBox.scrollTop > 2;
}

export function MagneticScrollProvider({
  sections,
  children,
}: {
  sections: SectionDescriptor[];
  children: ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);

  const activeRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const touchHandledRef = useRef(false);
  const activeTweenRef = useRef<gsap.core.Tween | null>(null);

  const sectionCount = sections.length;

  const goToSection = useCallback(
    (targetIndex: number, bypassCooldown = false) => {
      const clamped = Math.max(0, Math.min(sectionCount - 1, targetIndex));
      const now = performance.now();

      if (!bypassCooldown && now < cooldownUntilRef.current) {
        return;
      }

      const targetEl = document.querySelector<HTMLElement>(
        `[data-snap-section="${clamped}"]`
      );
      if (!targetEl) return;

      cooldownUntilRef.current = now + COOLDOWN_MS;
      activeRef.current = clamped;
      setActiveIndex(clamped);

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      activeTweenRef.current?.kill();

      if (reduced) {
        window.scrollTo({ top: targetEl.offsetTop, behavior: "auto" });
        isAnimatingRef.current = false;
        return;
      }

      isAnimatingRef.current = true;
      activeTweenRef.current = gsap.to(window, {
        scrollTo: { y: targetEl.offsetTop, autoKill: false },
        duration: 0.56,
        ease: "power3.out",
        onComplete: () => {
          isAnimatingRef.current = false;
        },
      });
    },
    [sectionCount]
  );

  // Sync activeIndex if scroll position changes via native anchor or resize
  useEffect(() => {
    const onResize = () => {
      const currentEl = document.querySelector<HTMLElement>(
        `[data-snap-section="${activeRef.current}"]`
      );
      if (currentEl) {
        window.scrollTo({ top: currentEl.offsetTop, behavior: "auto" });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock page scroll during boot scan, then enable magnetic scroll listeners
  useEffect(() => {
    if (!bootComplete) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 3) return;
      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;

      if (shouldYieldToInnerScroll(e.target, dir)) {
        return;
      }

      e.preventDefault();

      const now = performance.now();
      if (now < cooldownUntilRef.current || isAnimatingRef.current) {
        return;
      }

      const next = activeRef.current + dir;
      if (next >= 0 && next < sectionCount) {
        goToSection(next);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartYRef.current = e.touches[0].clientY;
      touchHandledRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current === null || touchHandledRef.current) return;
      const currentY = e.touches[0].clientY;
      const delta = touchStartYRef.current - currentY;

      if (Math.abs(delta) < 18) return;
      const dir: 1 | -1 = delta > 0 ? 1 : -1;

      if (shouldYieldToInnerScroll(e.target, dir)) {
        return;
      }

      if (e.cancelable) {
        e.preventDefault();
      }

      const now = performance.now();
      if (now < cooldownUntilRef.current || isAnimatingRef.current) {
        return;
      }

      touchHandledRef.current = true;
      const next = activeRef.current + dir;
      if (next >= 0 && next < sectionCount) {
        goToSection(next);
      }
    };

    const onTouchEnd = () => {
      touchStartYRef.current = null;
      touchHandledRef.current = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.closest("ascii-quang"))
      ) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (shouldYieldToInnerScroll(e.target, 1)) return;
        e.preventDefault();
        goToSection(activeRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (shouldYieldToInnerScroll(e.target, -1)) return;
        e.preventDefault();
        goToSection(activeRef.current - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSection(0, true);
      } else if (e.key === "End") {
        e.preventDefault();
        goToSection(sectionCount - 1, true);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      activeTweenRef.current?.kill();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [bootComplete, goToSection, sectionCount]);

  const value = useMemo<MagneticScrollContextValue>(
    () => ({
      activeIndex,
      bootComplete,
      setBootComplete,
      sections,
      goToSection: (idx: number) => goToSection(idx, true),
    }),
    [activeIndex, bootComplete, sections, goToSection]
  );

  return (
    <MagneticScrollContext.Provider value={value}>
      {children}
    </MagneticScrollContext.Provider>
  );
}
