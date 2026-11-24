"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import { useReducedMotionPref } from "@/components/motion/hooks";
import { gameProfile } from "@/content/profile";
import { useMagneticScroll } from "./MagneticScroller";
import { PixelScanLoader } from "./PixelScanLoader";

interface TrailPixel {
  x: number;
  y: number;
  size: number;
  colorIdx: 0 | 1 | 2 | 3;
  maxAlpha: number;
  age: number;
  hold: number;
  life: number;
}

const TRAIL_HEX = ["#00F0FF", "#00FFA3", "#0E5C80", "#B9FAFF"] as const;
const MAX_TRAIL_PIXELS = 400;

const SHUTTER_STYLE: React.CSSProperties = {
  backgroundColor: "#04060A",
  backgroundImage:
    "repeating-linear-gradient(to bottom, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 2px, transparent 2px, transparent 5px), linear-gradient(to right, rgba(0, 240, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.04) 1px, transparent 1px)",
  backgroundSize: "100% 5px, 36px 36px, 36px 36px",
};

function noiseHash(a: number, b: number, seed: number): number {
  let n =
    Math.imul(a + 11, 374761393) +
    Math.imul(b + 19, 668265263) +
    Math.imul(seed, 2147483647);
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

/**
 * Full-Screen Preloader & Lightweight Vertical Split-Curtain Pixel Trail:
 * 1. Waits for fonts, avatar image, and WebGL2 `QUANG` pre-warm over a sparse,
 *    1x-resolution cyan/mint scan sweep with zero layout reads inside `rAF`.
 * 2. Splits top & bottom shutters outward (`yPercent: ±102`) synced with a math
 *    progress ref, spawning sparse large stationary pixel blocks (`18–26px`)
 *    that stay pinned in screen space and fade out cleanly in place.
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
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanBeamRef = useRef<HTMLDivElement | null>(null);
  const loaderWrapRef = useRef<HTMLDivElement | null>(null);
  const openProgressRef = useRef({ value: 0 });

  const [progress, setProgress] = useState(12);
  const [statusLabel, setStatusLabel] = useState("SCANNING ASSETS");
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [trailActive, setTrailActive] = useState(false);
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

  // Complete once WebGL2 QUANG finishes pre-warming + min boot duration passed
  useEffect(() => {
    if (webglState === "pending") return;
    const timer = window.setTimeout(() => {
      setProgress(100);
      setStatusLabel("READY");
      setAssetsLoaded(true);
    }, 760);
    return () => window.clearTimeout(timer);
  }, [webglState]);

  // 1x CSS-resolution scan canvas + self-driven scan beam transform (zero layout reads)
  useEffect(() => {
    if (hidden || reducedMotion || assetsLoaded) return;
    const canvas = scanCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const cell = 44;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = false;
    };
    resize();

    let rafId = 0;
    let startTime = 0;
    const scanPeriod = 1.05;

    const tick = (now: number) => {
      if (startTime === 0) startTime = now;
      const elapsed = (now - startTime) / 1000;

      // Drive the full-width scan beam transform in pure math (matches power1.inOut yoyo)
      const cycle = (elapsed % (scanPeriod * 2)) / scanPeriod;
      const rawT = cycle <= 1 ? cycle : 2 - cycle;
      const easedT =
        rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;
      const beamY = easedT * Math.max(height - 3, 200);

      const beamEl = scanBeamRef.current;
      if (beamEl) {
        beamEl.style.transform = `translate3d(0, ${beamY.toFixed(1)}px, 0)`;
      }

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
          const blockSize = hC > 0.65 ? 20 : 16;

          const px = c * cell + jx;
          const py = r * cell + jy;
          const distY = Math.abs(py + blockSize * 0.5 - beamY);
          const beamGlow = distY < 105 ? 1 - distY / 105 : 0;

          if (beamGlow > 0.05) {
            if (hA > 0.8 - beamGlow * 0.32) {
              const stepped = Math.ceil(beamGlow * 4) / 4;
              if (hB > 0.52) {
                ctx.fillStyle = "#00FFA3";
                ctx.globalAlpha = stepped * 0.38;
              } else {
                ctx.fillStyle = "#00F0FF";
                ctx.globalAlpha = stepped * 0.42;
              }
              ctx.fillRect(px, py, blockSize, blockSize);
            }
          } else if (hB < pctRatio * 0.12) {
            const flicker = Math.sin(elapsed * 4.5 + hC * 12) * 0.5 + 0.5;
            if (flicker > 0.58) {
              if (hC > 0.5) {
                ctx.fillStyle = "#00F0FF";
                ctx.globalAlpha = 0.14;
              } else {
                ctx.fillStyle = "#00FFA3";
                ctx.globalAlpha = 0.1;
              }
              ctx.fillRect(px, py, blockSize, blockSize);
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [hidden, reducedMotion, assetsLoaded]);

  // Stationary sparse large pixel trail spawned behind both moving curtains (1x DPR, zero-GC)
  useEffect(() => {
    if (!trailActive || hidden || reducedMotion) return;
    const canvas = trailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let midY = height / 2;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      midY = height / 2;
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = false;
    };
    resize();

    const rowStep = width < 640 ? 28 : 36;
    let spawnedSteps = 0;

    const pixels: TrailPixel[] = [];

    const spawnSymmetricBand = (
      topCenterY: number,
      bottomCenterY: number,
      stepIdx: number
    ) => {
      if (pixels.length + 2 > MAX_TRAIL_PIXELS) return;
      const slotWidth = width < 640 ? 80 : 120;
      const numSlots = Math.max(4, Math.round(width / slotWidth));
      const actualSlotW = width / numSlots;
      const halfShift = Math.max(1, Math.floor(numSlots / 2));

      const getPixelVisuals = (slotKey: number) => {
        const hSize = noiseHash(slotKey, stepIdx, 53);
        const hColor = noiseHash(slotKey, stepIdx, 71);
        const hAlpha = noiseHash(slotKey, stepIdx, 83);
        const hHold = noiseHash(slotKey, stepIdx, 97);
        const hLife = noiseHash(slotKey, stepIdx, 113);

        const size =
          width < 640
            ? hSize > 0.68
              ? 20
              : hSize > 0.32
                ? 18
                : 14
            : hSize > 0.72
              ? 26
              : hSize > 0.34
                ? 22
                : 18;

        const colorIdx: 0 | 1 | 2 | 3 =
          hColor < 0.42 ? 0 : hColor < 0.72 ? 1 : hColor < 0.9 ? 2 : 3;

        return {
          size,
          colorIdx,
          maxAlpha: 0.58 + hAlpha * 0.32,
          hold: 0.03 + hHold * 0.03,
          life: 0.28 + hLife * 0.18,
        };
      };

      for (let s = 0; s < numSlots; s++) {
        if (pixels.length + 2 > MAX_TRAIL_PIXELS) break;

        const permS = (s + halfShift) % numSlots;
        const topVis = getPixelVisuals(s);
        const botVis = getPixelVisuals(permS);

        const padX = 4;
        const slotStart = s * actualSlotW + padX;
        const topRangeX = Math.max(0, actualSlotW - topVis.size - padX * 2);
        const botRangeX = Math.max(0, actualSlotW - botVis.size - padX * 2);

        const hXTop = noiseHash(s, stepIdx, 19);
        const hYTop = noiseHash(s, stepIdx, 37);
        const hXBot = noiseHash(s, stepIdx, 149);
        const hYBot = noiseHash(s, stepIdx, 173);

        const rawTopX = slotStart + hXTop * topRangeX;
        const jyTop = Math.round((hYTop - 0.5) * 2) * 8;
        const rawTopY = Math.max(
          0,
          Math.min(
            midY - topVis.size - 2,
            topCenterY - topVis.size * 0.5 + jyTop
          )
        );

        const rawBotX = slotStart + hXBot * botRangeX;
        const jyBot = Math.round((hYBot - 0.5) * 2) * 8;
        const rawBotY = Math.max(
          midY + 2,
          Math.min(
            height - botVis.size,
            bottomCenterY - botVis.size * 0.5 + jyBot
          )
        );

        pixels.push(
          {
            x: Math.round(rawTopX / 2) * 2,
            y: Math.round(rawTopY / 2) * 2,
            size: topVis.size,
            colorIdx: topVis.colorIdx,
            maxAlpha: topVis.maxAlpha,
            age: 0,
            hold: topVis.hold,
            life: topVis.life,
          },
          {
            x: Math.round(rawBotX / 2) * 2,
            y: Math.round(rawBotY / 2) * 2,
            size: botVis.size,
            colorIdx: botVis.colorIdx,
            maxAlpha: botVis.maxAlpha,
            age: 0,
            hold: botVis.hold,
            life: botVis.life,
          }
        );
      }
    };

    let lastNow = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      const pProgress = openProgressRef.current.value;
      const travel = pProgress * 1.02 * midY;

      while (
        (spawnedSteps + 0.5) * rowStep <= travel &&
        spawnedSteps * rowStep <= midY
      ) {
        const offsetFromMid = (spawnedSteps + 0.5) * rowStep;
        spawnSymmetricBand(midY - offsetFromMid, midY + offsetFromMid, spawnedSteps);
        spawnedSteps++;
      }

      ctx.clearRect(0, 0, width, height);

      let i = 0;
      while (i < pixels.length) {
        const p = pixels[i];
        p.age += dt;
        const total = p.hold + p.life;
        if (p.age >= total) {
          pixels[i] = pixels[pixels.length - 1];
          pixels.pop();
          continue;
        }

        const fadeT = p.age <= p.hold ? 0 : (p.age - p.hold) / p.life;
        const alpha = p.maxAlpha * Math.pow(1 - fadeT, 1.55);
        if (alpha > 0.015) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = TRAIL_HEX[p.colorIdx];
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        i++;
      }

      ctx.globalAlpha = 1;
      if (pProgress < 1 || pixels.length > 0) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [trailActive, hidden, reducedMotion]);

  // Orchestrated Vertical Split-Curtain Reveal when 100% loaded
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

      openProgressRef.current.value = 0;

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
        // 2. Ignite horizontal center neon pixel seam
        .fromTo(
          seam,
          { scaleX: 0, autoAlpha: 0 },
          { scaleX: 1, autoAlpha: 1, duration: 0.2, ease: "power3.out" },
          "-=0.06"
        )
        // 3. Hand off to pre-warmed QUANG 3D canvas & start vertical curtain + trail reveal
        .add(() => {
          const quangEl = document.querySelector("ascii-quang") as
            | (HTMLElement & { revealWord?: () => void })
            | null;
          quangEl?.setAttribute("revealed", "true");
          quangEl?.revealWord?.();
          setBootComplete(true);
          setTrailActive(true);
        })
        .to(
          seam,
          {
            autoAlpha: 0,
            duration: 0.16,
            ease: "power2.out",
          },
          "<"
        )
        .to(
          openProgressRef.current,
          {
            value: 1,
            duration: 0.74,
            ease: "power2.inOut",
          },
          "<"
        )
        .to(
          topCurtain,
          {
            yPercent: -102,
            duration: 0.74,
            ease: "power2.inOut",
          },
          "<"
        )
        .to(
          bottomCurtain,
          {
            yPercent: 102,
            duration: 0.74,
            ease: "power2.inOut",
          },
          "<"
        )
        // Allow last edge pixels to finish fading cleanly before unmounting overlay
        .to({}, { duration: 0.48 });
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
        style={SHUTTER_STYLE}
        className={`${
          bootComplete ? "pointer-events-none" : "pointer-events-auto"
        } absolute inset-x-0 top-0 z-[2] h-1/2 border-b border-[#00F0FF]/45 will-change-transform`}
      />

      {/* Bottom Pixel Split-Curtain Shutter */}
      <div
        ref={bottomCurtainRef}
        data-pixel-curtain="bottom"
        aria-hidden="true"
        style={SHUTTER_STYLE}
        className={`${
          bootComplete ? "pointer-events-none" : "pointer-events-auto"
        } absolute inset-x-0 bottom-0 z-[2] h-1/2 border-t border-[#00F0FF]/45 will-change-transform`}
      />

      {/* Stationary fading large pixel trail spawned behind both moving curtains */}
      <canvas
        ref={trailCanvasRef}
        data-curtain-trail-canvas=""
        aria-hidden="true"
        style={{ imageRendering: "pixelated" }}
        className="pointer-events-none absolute inset-0 z-[12] h-full w-full"
      />

      {/* Center Ignition Horizon Seam before shutters split open */}
      <div
        ref={seamRef}
        data-pixel-seam=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 z-[15] h-[2px] -translate-y-1/2 bg-[#00F0FF] opacity-0 shadow-[0_0_18px_#00F0FF,0_0_36px_#00FF88]"
      />

      {/* Full-screen dynamic subtle cyan/mint pixel scan matrix */}
      <canvas
        ref={scanCanvasRef}
        data-boot-scan-canvas=""
        aria-hidden="true"
        style={{ imageRendering: "pixelated" }}
        className="pointer-events-none absolute inset-0 z-[4] h-full w-full"
      />

      {/* Full-width full-screen sweeping pixel scan beam */}
      <div
        ref={scanBeamRef}
        data-scan-beam=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] will-change-transform"
      >
        <div className="h-[3px] w-full bg-[#00F0FF] shadow-[0_0_16px_#00F0FF,0_0_28px_#00FF88]" />
        <div
          className="h-20 w-full opacity-55"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0, 240, 255, 0.22), rgba(0, 255, 136, 0.08) 45%, transparent)",
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
