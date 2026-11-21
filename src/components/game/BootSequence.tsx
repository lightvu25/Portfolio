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
 * Full-Screen Preloader & Boot Transition:
 * 1. Scans & waits for fonts, avatar image, and WebGL2 `QUANG` pre-warm with a
 *    full-viewport pixel scanline + pixel grid sweep while keeping status +
 *    progress bar centered.
 * 2. Morphs centered loader into glowing ASCII `Q`.
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
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanBeamRef = useRef<HTMLDivElement | null>(null);
  const loaderWrapRef = useRef<HTMLDivElement | null>(null);
  const qGlyphRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState(12);
  const [statusLabel, setStatusLabel] = useState("SCANNING ASSETS");
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

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

  // Full-viewport pixel scan canvas illuminated along the sweeping full-screen beam
  useEffect(() => {
    if (hidden || reducedMotion || assetsLoaded) return;
    const canvas = scanCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cell = 24;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let rafId = 0;
    let startTime = 0;

    const tick = (now: number) => {
      if (startTime === 0) startTime = now;
      const elapsed = (now - startTime) / 1000;
      const beamEl = scanBeamRef.current;
      const beamY = beamEl
        ? beamEl.getBoundingClientRect().top
        : (Math.sin(elapsed * 2.8) * 0.5 + 0.5) * height;
      const pctRatio = Math.max(0.12, Math.min(1, progressRef.current / 100));

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      const block = cell - 4;

      for (let r = 0; r < rows; r++) {
        const py = r * cell + 2;
        const distY = Math.abs(py + block * 0.5 - beamY);
        const beamGlow = distY < 96 ? 1 - distY / 96 : 0;

        for (let c = 0; c < cols; c++) {
          const seed = ((r * 73 + c * 37) % 100) / 100;
          if (beamGlow > 0.05) {
            if (seed > 0.78 - beamGlow * 0.45) {
              const stepped = Math.ceil(beamGlow * 4) / 4;
              ctx.fillStyle =
                distY < 26
                  ? `rgba(255, 184, 0, ${(stepped * 0.45).toFixed(2)})`
                  : seed > 0.55
                    ? `rgba(0, 255, 136, ${(stepped * 0.34).toFixed(2)})`
                    : `rgba(0, 240, 255, ${(stepped * 0.34).toFixed(2)})`;
              ctx.fillRect(c * cell + 2, py, block, block);
            }
          } else if (seed < pctRatio * 0.22) {
            const flicker =
              Math.sin(elapsed * 5 + r * 0.7 + c * 0.9) * 0.5 + 0.5;
            if (flicker > 0.6) {
              ctx.fillStyle = "rgba(0, 240, 255, 0.09)";
              ctx.fillRect(c * cell + 2, py, block, block);
            }
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [hidden, reducedMotion, assetsLoaded]);

  // Continuous full-screen scan beam sweep across entire viewport height
  useGSAP(
    () => {
      if (reducedMotion || assetsLoaded) return;
      const beam = scanBeamRef.current;
      if (!beam) return;
      gsap.fromTo(
        beam,
        { y: 0 },
        {
          y: () => Math.max(window.innerHeight - 3, 200),
          duration: 1.05,
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

      // 1. Fade out full-screen beam + centered progress HUD into glowing ASCII 'Q'
      tl.to([loaderWrap, scanBeamRef.current, scanCanvasRef.current], {
        scale: 0.94,
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
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-[#04060A]"
    >
      {/* Full-screen subtle pixel grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0, 240, 255, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.14) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Full-screen horizontal CRT scanlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 5px)",
        }}
      />

      {/* Full-screen dynamic pixel scan matrix */}
      <canvas
        ref={scanCanvasRef}
        data-boot-scan-canvas=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* Full-width full-screen sweeping pixel scan beam */}
      <div
        ref={scanBeamRef}
        data-scan-beam=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[5]"
      >
        <div className="h-[3px] w-full bg-[#FFB800] shadow-[0_0_16px_#FFB800,0_0_28px_#00F0FF]" />
        <div
          className="h-20 w-full opacity-55"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0, 255, 136, 0.22), rgba(0, 240, 255, 0.08) 45%, transparent)",
          }}
        />
      </div>

      {/* Centered scan status + pixel progress bar */}
      <div ref={loaderWrapRef} className="relative z-10">
        <PixelScanLoader progress={progress} statusLabel={statusLabel} />
      </div>

      {/* Morph target: ASCII 'Q' that glides into QUANG */}
      <div
        ref={qGlyphRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-20 flex flex-col items-center opacity-0"
      >
        <div className="border border-[#00F0FF]/50 bg-[#04060A]/80 px-4 py-3 shadow-[0_0_24px_rgba(0,240,255,0.45)]">
          <pre className="font-mono text-xs leading-[1.08] font-bold text-[#00F0FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.85)] sm:text-base">
            {ASCII_Q_ROWS.join("\n")}
          </pre>
        </div>
      </div>
    </div>
  );
}
