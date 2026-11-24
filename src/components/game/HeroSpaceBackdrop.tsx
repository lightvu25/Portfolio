"use client";

import { useEffect, useRef } from "react";

import { useFinePointer, useReducedMotionPref } from "@/components/motion/hooks";
import { useMagneticScroll } from "./MagneticScroller";

interface SparkCell {
  gx: number;
  gy: number;
  life: number;
  maxLife: number;
  color: string;
}

const CELL = 24;

/**
 * Top-half Hero background behind the `QUANG` 3D ASCII stage: subtle retro pixel
 * grid with neon dust motes and cursor-reactive spark highlights.
 * Defers animation until boot curtains finish revealing & renders at 1x CSS resolution.
 */
export function HeroSpaceBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { activeIndex, bootComplete } = useMagneticScroll();
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotionPref();

  useEffect(() => {
    if (!bootComplete || activeIndex !== 0 || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    if (!host) return;
    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let rafId = 0;
    let last = 0;
    let elapsed = 0;
    let lastKey = "";
    const sparks = new Map<string, SparkCell>();

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(Math.floor(rect.width), 1);
      height = Math.max(Math.floor(rect.height), 1);
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = false;
    };
    resize();

    const draw = (now: number) => {
      const dt = last === 0 ? 16 : Math.min(48, now - last);
      last = now;
      elapsed += dt / 1000;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);

      // Ambient sparse twinkling pixel grid nodes
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const hash = ((r * 73856093) ^ (c * 19349663)) & 255;
          if (hash > 36) continue;
          const wave = Math.sin(elapsed * 1.4 + hash * 0.1) * 0.5 + 0.5;
          if (wave < 0.35) continue;
          const alpha = ((wave - 0.35) / 0.65) * 0.18;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = hash % 3 === 0 ? "#00FF88" : "#00F0FF";
          ctx.fillRect(c * CELL + 6, r * CELL + 6, CELL - 12, CELL - 12);
        }
      }

      // Cursor-lit neon sparks
      if (sparks.size > 0) {
        for (const [k, s] of sparks) {
          s.life -= dt;
          if (s.life <= 0) {
            sparks.delete(k);
            continue;
          }
          const alpha = Math.ceil((s.life / s.maxLife) * 4) / 4;
          ctx.globalAlpha = alpha * 0.42;
          ctx.fillStyle = s.color;
          ctx.fillRect(s.gx * CELL + 2, s.gy * CELL + 2, CELL - 4, CELL - 4);
        }
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    const onPointerMove = (e: PointerEvent) => {
      if (!finePointer || e.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }
      const gx = Math.floor((e.clientX - rect.left) / CELL);
      const gy = Math.floor((e.clientY - rect.top) / CELL);
      const key = `${gx}:${gy}`;
      if (key === lastKey) return;
      lastKey = key;

      sparks.set(key, {
        gx,
        gy,
        life: 520,
        maxLife: 520,
        color: (gx + gy) % 2 === 0 ? "#00F0FF" : "#00FF88",
      });
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [activeIndex, bootComplete, finePointer, reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#04070D]"
    >
      {/* Subtle blueprint pixel grid lines */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0, 240, 255, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.14) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ imageRendering: "pixelated" }}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
