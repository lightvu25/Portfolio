"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import { useReducedMotionPref } from "@/components/motion/hooks";
import { gameProfile } from "@/content/profile";
import { useMagneticScroll } from "./MagneticScroller";
import { PixelScanLoader } from "./PixelScanLoader";

const ASCII_Q_ROWS = [
  "  .@@@@@@@@.  ",
  " @@@      @@@ ",
  "@@          @@",
  "@@          @@",
  "@@    .@@   @@",
  "@@     @@@  @@",
  " @@@    @@@@@ ",
  "  .@@@@@@@@@@ ",
  "          @@@@",
];

/**
 * Preloader & Boot Transition:
 * 1. Scans & waits for fonts, avatar image, and WebGL2 `QUANG` pre-warm.
 * 2. Morphs loader box into glowing ASCII `Q` at center viewport.
 * 3. Flies `Q` smoothly into the exact `Q` slot of `QUANG` (Hero top 50%).
 * 4. Reveals `U-A-N-G` + Hero profile & unlocks Magnetic Scroll.
 */
export function BootSequence({
  webglState,
}: {
  webglState: "pending" | "ready" | "fallback";
}) {
  const { bootComplete, setBootComplete } = useMagneticScroll();
  const reducedMotion = useReducedMotionPref();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const loaderWrapRef = useRef<HTMLDivElement | null>(null);
  const qGlyphRef = useRef<HTMLDivElement | null>(null);
  const beamRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState(12);
  const [statusLabel, setStatusLabel] = useState("SCANNING ASSETS");
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Real resource preloading: local fonts, avatar image, and WebGL shader warm-up
  useEffect(() => {
    let cancelled = false;
    const minDurationPromise = new Promise<void>((r) =>
      window.setTimeout(r, reducedMotion ? 160 : 680)
    );

    const fontsPromise =
      typeof document !== "undefined" && document.fonts?.ready
        ? document.fonts.ready.then(() => undefined).catch(() => undefined)
        : Promise.resolve();

    const avatarPromise = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = gameProfile.avatarSrc;
      window.setTimeout(resolve, 900);
    });

    const timer = window.setInterval(() => {
      setProgress((prev) => (prev < 88 ? Math.min(88, prev + 9) : prev));
    }, 85);

    Promise.all([minDurationPromise, fontsPromise, avatarPromise]).then(() => {
      if (cancelled) return;
      setProgress(94);
      setStatusLabel("INIT ASCII GPU");
    });

    const maxWait = window.setTimeout(() => {
      if (!cancelled) {
        setProgress(100);
        setStatusLabel("READY");
        setAssetsLoaded(true);
      }
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearTimeout(maxWait);
    };
  }, [reducedMotion]);

  // Complete immediately once WebGL2 QUANG finishes pre-warming + min boot passed
  useEffect(() => {
    if (webglState === "pending") return;
    const timer = window.setTimeout(() => {
      setProgress(100);
      setStatusLabel("READY");
      setAssetsLoaded(true);
    }, 760);
    return () => window.clearTimeout(timer);
  }, [webglState]);

  // Continuous scan beam animation inside loader
  useGSAP(
    () => {
      if (reducedMotion || assetsLoaded) return;
      const beam = overlayRef.current?.querySelector("[data-scan-beam]");
      if (!beam) return;
      gsap.fromTo(
        beam,
        { y: 0 },
        {
          y: 104,
          duration: 0.72,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        }
      );
    },
    { scope: overlayRef, dependencies: [reducedMotion, assetsLoaded] }
  );

  // Orchestrated Q -> QUANG reveal timeline when 100% loaded
  useGSAP(
    () => {
      if (!assetsLoaded || bootComplete) return;

      const overlay = overlayRef.current;
      const loaderWrap = loaderWrapRef.current;
      const qGlyph = qGlyphRef.current;
      if (!overlay || !loaderWrap || !qGlyph) {
        setBootComplete(true);
        setHidden(true);
        return;
      }

      if (reducedMotion) {
        gsap.set(overlay, { autoAlpha: 0 });
        setBootComplete(true);
        setHidden(true);
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          setHidden(true);
        },
      });

      const anchor = document.querySelector<HTMLElement>(
        "[data-quang-q-anchor]"
      );
      const qRect = qGlyph.getBoundingClientRect();
      const targetRect = anchor?.getBoundingClientRect();

      const dx = targetRect
        ? targetRect.left +
          targetRect.width / 2 -
          (qRect.left + qRect.width / 2)
        : -220;
      const dy = targetRect
        ? targetRect.top +
          targetRect.height / 2 -
          (qRect.top + qRect.height / 2)
        : -180;
      const targetScale = targetRect
        ? Math.max(0.75, Math.min(1.55, targetRect.height / Math.max(qRect.height, 60)))
        : 1.05;

      // 1. Scan loader dissolves into glowing ASCII 'Q'
      tl.to(loaderWrap, {
        scale: 0.85,
        autoAlpha: 0,
        duration: 0.24,
        ease: "power2.in",
      })
        .fromTo(
          qGlyph,
          { autoAlpha: 0, scale: 0.72 },
          { autoAlpha: 1, scale: 1, duration: 0.28, ease: "back.out(1.6)" },
          "-=0.06"
        )
        // 2. Fly ASCII 'Q' smoothly to exact Q position in QUANG
        .to(qGlyph, {
          x: dx,
          y: dy,
          scale: targetScale,
          duration: 0.62,
          ease: "power3.inOut",
        })
        // 3. Hand off to pre-warmed QUANG 3D canvas & fade boot overlay out
        .add(() => {
          const quangEl = document.querySelector("ascii-quang") as
            | (HTMLElement & { revealWord?: () => void })
            | null;
          quangEl?.setAttribute("revealed", "true");
          quangEl?.revealWord?.();
          setBootComplete(true);
        }, "-=0.14")
        .to(qGlyph, {
          autoAlpha: 0,
          duration: 0.22,
          ease: "power2.out",
        })
        .to(
          overlay,
          {
            autoAlpha: 0,
            duration: 0.36,
            ease: "power2.out",
          },
          "<"
        );
    },
    { scope: overlayRef, dependencies: [assetsLoaded, reducedMotion] }
  );

  if (hidden) return null;

  return (
    <div
      ref={overlayRef}
      data-testid="boot-sequence-overlay"
      aria-live="polite"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#04060A]"
    >
      {/* Subtle scan backdrop grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0, 240, 255, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.14) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div ref={loaderWrapRef} className="relative z-10">
        <PixelScanLoader progress={progress} statusLabel={statusLabel} />
      </div>

      {/* Morph target: ASCII 'Q' that glides into QUANG */}
      <div
        ref={qGlyphRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-20 flex flex-col items-center opacity-0"
      >
        <div
          ref={beamRef}
          className="border border-[#00F0FF]/50 bg-[#04060A]/80 px-4 py-3 shadow-[0_0_24px_rgba(0,240,255,0.45)]"
        >
          <pre className="font-mono text-xs leading-[1.08] font-bold text-[#00F0FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.85)] sm:text-base">
            {ASCII_Q_ROWS.join("\n")}
          </pre>
        </div>
      </div>
    </div>
  );
}
