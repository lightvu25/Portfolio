"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

import { useFinePointer, useReducedMotionPref } from "@/components/motion/hooks";
import { gameProjects } from "@/content/games";
import { useMagneticScroll } from "./MagneticScroller";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Shared dynamic large-pixel background for Game Projects (Sections 1..4).
 * - Autonomous animated solid-pixel waves tuned to each project's color palette.
 * - Smooth GSAP color interpolation when scrolling between Game 01..04.
 * - Background-only interactive illumination: passing cursor brightens nearby
 *   large pixel blocks with neon glow without overlapping foreground content.
 */
export function ProjectPixelBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { activeIndex } = useMagneticScroll();
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotionPref();

  const isProjectActive = activeIndex >= 1 && activeIndex <= gameProjects.length;
  const projectTheme = isProjectActive
    ? gameProjects[activeIndex - 1].theme
    : gameProjects[0].theme;

  const paletteRef = useRef({
    bgR: 3,
    bgG: 10,
    bgB: 7,
    idleR: 7,
    idleG: 28,
    idleB: 19,
    waveR: 13,
    waveG: 56,
    waveB: 38,
    glowR: 0,
    glowG: 255,
    glowB: 136,
  });

  // Morph background palette smoothly whenever active project changes
  useEffect(() => {
    const bg = hexToRgb(projectTheme.bgBase);
    const idle = hexToRgb(projectTheme.pixelIdle);
    const wave = hexToRgb(projectTheme.pixelWave);
    const glow = hexToRgb(projectTheme.pixelGlow);

    gsap.to(paletteRef.current, {
      bgR: bg[0],
      bgG: bg[1],
      bgB: bg[2],
      idleR: idle[0],
      idleG: idle[1],
      idleB: idle[2],
      waveR: wave[0],
      waveG: wave[1],
      waveB: wave[2],
      glowR: glow[0],
      glowG: glow[1],
      glowB: glow[2],
      duration: reducedMotion ? 0 : 0.55,
      ease: "power2.out",
    });
  }, [projectTheme, reducedMotion]);

  useEffect(() => {
    if (!isProjectActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cellSize = width < 640 ? 26 : 36;
    let cols = 0;
    let rows = 0;
    let trailEnergies = new Float32Array(0);

    const setupGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cellSize = width < 640 ? 26 : 36;
      cols = Math.ceil(width / cellSize) + 1;
      rows = Math.ceil(height / cellSize) + 1;
      trailEnergies = new Float32Array(cols * rows);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setupGrid();

    let pointerX = -9999;
    let pointerY = -9999;
    let lastTime = 0;
    let elapsed = 0;
    let rafId = 0;

    const renderFrame = (now: number) => {
      const dt = lastTime === 0 ? 16 : Math.min(48, now - lastTime);
      lastTime = now;
      if (!reducedMotion) {
        elapsed += dt / 1000;
      }

      const pal = paletteRef.current;
      ctx.fillStyle = `rgb(${Math.round(pal.bgR)}, ${Math.round(pal.bgG)}, ${Math.round(pal.bgB)})`;
      ctx.fillRect(0, 0, width, height);

      const gap = 4;
      const box = cellSize - gap;
      const pointerCol = pointerX / cellSize;
      const pointerRow = pointerY / cellSize;

      // Decay stored cursor trail energies & inject light around active cursor
      const decay = Math.exp(-dt / 320);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          let energy = trailEnergies[idx] * decay;

          if (finePointer && pointerX > -500) {
            const dx = c + 0.5 - pointerCol;
            const dy = r + 0.5 - pointerRow;
            const distSq = dx * dx + dy * dy;
            if (distSq < 9.5) {
              const boost = Math.max(0, 1 - Math.sqrt(distSq) / 3.1);
              energy = Math.max(energy, boost);
            }
          }
          trailEnergies[idx] = energy < 0.01 ? 0 : energy;

          // Autonomous solid-pixel wave pattern
          const seed = ((c * 374761393) ^ (r * 668265263)) & 255;
          const waveVal =
            Math.sin(c * 0.34 - elapsed * 1.45 + Math.cos(r * 0.28 + elapsed * 0.8)) *
              0.5 +
            0.5;
          const solidPulse =
            seed < 74
              ? Math.sin(elapsed * 2.0 + seed * 0.08) * 0.5 + 0.5
              : waveVal * 0.45;

          const baseMix = Math.max(waveVal * 0.55, solidPulse);
          let rr = pal.idleR + (pal.waveR - pal.idleR) * baseMix;
          let gg = pal.idleG + (pal.waveG - pal.idleG) * baseMix;
          let bb = pal.idleB + (pal.waveB - pal.idleB) * baseMix;

          // Quantize hover illumination in crisp steps
          if (energy > 0.04) {
            const q = Math.ceil(energy * 4) / 4;
            rr = rr + (pal.glowR - rr) * (q * 0.72);
            gg = gg + (pal.glowG - gg) * (q * 0.72);
            bb = bb + (pal.glowB - bb) * (q * 0.72);
          }

          const x = c * cellSize + 2;
          const y = r * cellSize + 2;

          ctx.fillStyle = `rgb(${Math.round(rr)}, ${Math.round(gg)}, ${Math.round(bb)})`;
          ctx.fillRect(x, y, box, box);

          // Crisp inner highlight & bright rim on cursor-lit pixels
          if (energy > 0.28) {
            ctx.strokeStyle = `rgba(${Math.round(pal.glowR)}, ${Math.round(pal.glowG)}, ${Math.round(pal.glowB)}, ${(energy * 0.85).toFixed(2)})`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 0.5, y + 0.5, box - 1, box - 1);
          }
        }
      }

      if (!reducedMotion) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    rafId = requestAnimationFrame(renderFrame);

    const onPointerMove = (e: PointerEvent) => {
      if (!finePointer || e.pointerType === "touch") return;
      pointerX = e.clientX;
      pointerY = e.clientY;
    };

    const onPointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };

    window.addEventListener("resize", setupGrid);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", setupGrid);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [isProjectActive, finePointer, reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 ${
        isProjectActive ? "opacity-100" : "opacity-0"
      }`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Subtle center radial contrast veil so left description text stays effortlessly legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 28% 50%, rgba(4, 6, 10, 0.42), rgba(4, 6, 10, 0.72) 85%)",
        }}
      />
    </div>
  );
}
