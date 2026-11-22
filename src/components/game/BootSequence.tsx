"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import { useReducedMotionPref } from "@/components/motion/hooks";
import { gameProfile } from "@/content/profile";
import { useMagneticScroll } from "./MagneticScroller";
import { PixelScanLoader } from "./PixelScanLoader";

interface CurtainBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  opacity: number;
}

const NEON_PALETTE = ["#00F0FF", "#00FF88", "#FFB800", "#B86BFF"];

function noiseHash(a: number, b: number, seed: number): number {
  let n = Math.imul(a + 11, 374761393) + Math.imul(b + 19, 668265263) + Math.imul(seed, 2147483647);
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function buildNoisyCurtainBlocks(seed: number): CurtainBlock[] {
  const blocks: CurtainBlock[] = [];
  const cols = 54;
  const colW = 36;

  for (let c = 0; c < cols; c++) {
    const h0 = noiseHash(c, 1, seed);
    const h1 = noiseHash(c, 2, seed);
    const h2 = noiseHash(c, 3, seed);
    const h3 = noiseHash(c, 4, seed);

    const depth = h0 < 0.28 ? 1 : h0 < 0.68 ? 2 : 3;
    const jitterX = Math.round((h1 - 0.5) * 2) * 8;
    const jitterY = Math.round(h2 * 2) * 6;
    const colBaseX = c * colW;

    // Solid dark shutter teeth blocks
    const solidH = depth * 32 + jitterY;
    blocks.push({
      x: colBaseX - 2,
      y: 0,
      w: colW + 6,
      h: solidH,
      fill: "#04060A",
      opacity: 1,
    });

    // Edge chunky dark-navy / neon highlight pixel attached near the tooth tip
    const tipSize = h3 > 0.5 ? 36 : 28;
    const tipColor =
      NEON_PALETTE[Math.floor(noiseHash(c, 5, seed) * NEON_PALETTE.length)];
    if (noiseHash(c, 6, seed) > 0.32) {
      blocks.push({
        x: colBaseX + jitterX,
        y: Math.max(8, solidH - tipSize + (h1 > 0.6 ? 12 : 0)),
        w: tipSize,
        h: tipSize,
        fill: noiseHash(c, 7, seed) > 0.45 ? tipColor : "#091326",
        opacity: 0.7 + noiseHash(c, 8, seed) * 0.3,
      });
    }

    // Detached floating noisy chunky pixels ahead of the split curtain seam
    if (noiseHash(c, 9, seed) > 0.35) {
      const floatSize = noiseHash(c, 10, seed) > 0.5 ? 32 : 24;
      const floatX = colBaseX + Math.round((noiseHash(c, 11, seed) - 0.5) * 4) * 8;
      const floatY = solidH + 8 + Math.round(noiseHash(c, 12, seed) * 4) * 8;
      const floatColor =
        NEON_PALETTE[Math.floor(noiseHash(c, 13, seed) * NEON_PALETTE.length)];
      if (floatY + floatSize <= 160) {
        blocks.push({
          x: floatX,
          y: floatY,
          w: floatSize,
          h: floatSize,
          fill: floatColor,
          opacity: 0.55 + noiseHash(c, 14, seed) * 0.45,
        });
      }
    }
  }

  return blocks;
}

const TOP_CURTAIN_BLOCKS = buildNoisyCurtainBlocks(17);
const BOTTOM_CURTAIN_BLOCKS = buildNoisyCurtainBlocks(53);

function PixelCurtainTeeth({ edge }: { edge: "bottom" | "top" }) {
  const isBottomOfTopCurtain = edge === "bottom";
  const blocks = isBottomOfTopCurtain
    ? TOP_CURTAIN_BLOCKS
    : BOTTOM_CURTAIN_BLOCKS;

  return (
    <svg
      data-curtain-teeth=""
      aria-hidden="true"
      viewBox="0 0 1920 160"
      preserveAspectRatio="xMidYMin slice"
      shapeRendering="crispEdges"
      className={`pointer-events-none absolute inset-x-0 h-[120px] w-full opacity-0 sm:h-[160px] ${
        isBottomOfTopCurtain
          ? "-bottom-[118px] sm:-bottom-[158px]"
          : "-top-[118px] rotate-180 sm:-top-[158px]"
      }`}
    >
      {blocks.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          fill={b.fill}
          fillOpacity={b.opacity}
        />
      ))}
    </svg>
  );
}

/**
 * Full-Screen Preloader & Noisy Chunky Pixel Split-Curtain Transition:
 * 1. Scans & waits for fonts, avatar image, and WebGL2 `QUANG` pre-warm with a
 *    full-viewport large noisy pixel scanline sweep while keeping status +
 *    progress bar centered.
 * 2. Ignites the center neon pixel seam (`top: 50%`) as loading hits 100%.
 * 3. Parts the top and bottom chunky noise-pixel shutters symmetrically outward
 *    to reveal `QUANG` + Hero profile seamlessly & unlocks Magnetic Scroll.
 */
export function BootSequence({
  webglState,
}: {
  webglState: "pending" | "ready" | "fallback";
}) {
  const { bootComplete, setBootComplete } = useMagneticScroll();
  const reducedMotion = useReducedMotionPref();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const topCurtainRef = useRef<HTMLDivElement | null>(null);
  const bottomCurtainRef = useRef<HTMLDivElement | null>(null);
  const seamRef = useRef<HTMLDivElement | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanBeamRef = useRef<HTMLDivElement | null>(null);
  const loaderWrapRef = useRef<HTMLDivElement | null>(null);

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

  // Full-viewport large noisy pixel scan canvas illuminated along the sweeping beam
  useEffect(() => {
    if (hidden || reducedMotion || assetsLoaded) return;
    const canvas = scanCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cell = 44;

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

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const hA = noiseHash(c, r, 101);
          const hB = noiseHash(c, r, 211);
          const hC = noiseHash(c, r, 307);

          const jx = Math.round((hA - 0.5) * 2) * 8;
          const jy = Math.round((hB - 0.5) * 2) * 8;
          const blockSize = hC > 0.65 ? 38 : hC > 0.3 ? 30 : 24;

          const px = c * cell + jx;
          const py = r * cell + jy;
          const distY = Math.abs(py + blockSize * 0.5 - beamY);
          const beamGlow = distY < 115 ? 1 - distY / 115 : 0;

          if (beamGlow > 0.05) {
            if (hA > 0.72 - beamGlow * 0.45) {
              const stepped = Math.ceil(beamGlow * 4) / 4;
              ctx.fillStyle =
                distY < 32
                  ? `rgba(255, 184, 0, ${(stepped * 0.48).toFixed(2)})`
                  : hB > 0.52
                    ? `rgba(0, 255, 136, ${(stepped * 0.36).toFixed(2)})`
                    : `rgba(0, 240, 255, ${(stepped * 0.36).toFixed(2)})`;
              ctx.fillRect(px, py, blockSize, blockSize);
            }
          } else if (hB < pctRatio * 0.24) {
            const flicker =
              Math.sin(elapsed * 4.5 + hC * 12) * 0.5 + 0.5;
            if (flicker > 0.58) {
              ctx.fillStyle =
                hC > 0.5
                  ? "rgba(0, 240, 255, 0.1)"
                  : "rgba(0, 255, 136, 0.08)";
              ctx.fillRect(px, py, blockSize, blockSize);
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

  // Orchestrated Top & Bottom Chunky Noisy Pixel Curtain Open reveal when 100% loaded
  useGSAP(
    () => {
      if (!assetsLoaded || bootComplete) return;

      const overlay = overlayRef.current;
      const topCurtain = topCurtainRef.current;
      const bottomCurtain = bottomCurtainRef.current;
      const seam = seamRef.current;
      const loaderWrap = loaderWrapRef.current;

      if (!overlay || !topCurtain || !bottomCurtain || !loaderWrap) {
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

      // 1. Fade out scan beam, pixel scan matrix & centered progress bar
      tl.to([scanBeamRef.current, scanCanvasRef.current], {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power2.out",
      })
        .to(
          loaderWrap,
          {
            scale: 0.94,
            autoAlpha: 0,
            duration: 0.2,
            ease: "power2.in",
          },
          "<"
        )
        // 2. Ignite horizontal center neon pixel seam & illuminate chunky noisy pixel blocks
        .to(
          overlay.querySelectorAll("[data-curtain-teeth]"),
          { autoAlpha: 1, duration: 0.14, ease: "power1.out" },
          "-=0.08"
        )
        .fromTo(
          seam,
          { scaleX: 0, autoAlpha: 0 },
          { scaleX: 1, autoAlpha: 1, duration: 0.24, ease: "power3.out" },
          "<"
        )
        // 3. Hand off to pre-warmed QUANG 3D canvas as top & bottom chunky pixel shutters part
        .add(() => {
          const quangEl = document.querySelector("ascii-quang") as
            | (HTMLElement & { revealWord?: () => void })
            | null;
          quangEl?.setAttribute("revealed", "true");
          quangEl?.revealWord?.();
          setBootComplete(true);
        })
        .to(
          seam,
          {
            autoAlpha: 0,
            duration: 0.18,
            ease: "power2.out",
          },
          "<"
        )
        .to(
          topCurtain,
          {
            yPercent: -155,
            duration: 0.78,
            ease: "power4.inOut",
          },
          "<"
        )
        .to(
          bottomCurtain,
          {
            yPercent: 155,
            duration: 0.78,
            ease: "power4.inOut",
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
      className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center overflow-hidden"
    >
      {/* Top Pixel Split-Curtain Shutter */}
      <div
        ref={topCurtainRef}
        data-pixel-curtain="top"
        aria-hidden="true"
        className="pointer-events-auto absolute inset-x-0 top-0 h-1/2 bg-[#04060A] will-change-transform"
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0, 240, 255, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.14) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 5px)",
          }}
        />
        <PixelCurtainTeeth edge="bottom" />
      </div>

      {/* Bottom Pixel Split-Curtain Shutter */}
      <div
        ref={bottomCurtainRef}
        data-pixel-curtain="bottom"
        aria-hidden="true"
        className="pointer-events-auto absolute inset-x-0 bottom-0 h-1/2 bg-[#04060A] will-change-transform"
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0, 240, 255, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.14) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 5px)",
          }}
        />
        <PixelCurtainTeeth edge="top" />
      </div>

      {/* Center Ignition Horizon Seam before shutters split open */}
      <div
        ref={seamRef}
        data-pixel-seam=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 z-[15] h-[2px] -translate-y-1/2 bg-[#00F0FF] opacity-0 shadow-[0_0_18px_#00F0FF,0_0_36px_#00FF88]"
      />

      {/* Full-screen dynamic large noisy pixel scan matrix */}
      <canvas
        ref={scanCanvasRef}
        data-boot-scan-canvas=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4] h-full w-full"
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
    </div>
  );
}
