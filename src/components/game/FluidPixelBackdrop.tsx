"use client";

import { useEffect, useRef } from "react";

import { useFinePointer, useReducedMotionPref } from "@/components/motion/hooks";
import { useMagneticScroll } from "./MagneticScroller";

/**
 * Interactive Fluid-Pixel Cursor background exclusive to the Outro & 2-Tier Footer.
 * Simulates a 2D shallow-water ripple field quantized onto a neon pixel matrix,
 * yielding a flowing liquid sensation distinct from the solid-grid project stages above.
 */
export function FluidPixelBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { activeIndex, sections } = useMagneticScroll();
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotionPref();

  const isOutroActive = activeIndex === sections.length - 1;

  useEffect(() => {
    if (!isOutroActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    if (!host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cell = 20;
    let cols = 0;
    let rows = 0;
    let prev = new Float32Array(0);
    let curr = new Float32Array(0);
    let next = new Float32Array(0);

    const setup = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(Math.floor(rect.width), 1);
      height = Math.max(Math.floor(rect.height), 1);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cell = width < 640 ? 18 : 22;
      cols = Math.ceil(width / cell) + 2;
      rows = Math.ceil(height / cell) + 2;
      const len = cols * rows;
      prev = new Float32Array(len);
      curr = new Float32Array(len);
      next = new Float32Array(len);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setup();

    let rafId = 0;
    let lastTime = 0;
    let elapsed = 0;

    const injectRipple = (gx: number, gy: number, strength: number) => {
      if (gx <= 1 || gx >= cols - 2 || gy <= 1 || gy >= rows - 2) return;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const dist = Math.hypot(dx, dy);
          const falloff = Math.max(0, 1 - dist * 0.55);
          curr[(gy + dy) * cols + (gx + dx)] += strength * falloff;
        }
      }
    };

    const tick = (now: number) => {
      const dt = lastTime === 0 ? 16 : Math.min(40, now - lastTime);
      lastTime = now;
      if (!reducedMotion) {
        elapsed += dt / 1000;
      }

      // Gentle ambient fluid drop every ~1.2s so footer feels alive even before cursor moves
      if (!reducedMotion && Math.floor((elapsed - dt / 1000) * 1.1) !== Math.floor(elapsed * 1.1)) {
        const ax = Math.floor(((Math.sin(elapsed * 1.7) * 0.35 + 0.5) * (cols - 4)) + 2);
        const ay = Math.floor(((Math.cos(elapsed * 1.3) * 0.35 + 0.5) * (rows - 4)) + 2);
        injectRipple(ax, ay, 0.9);
      }

      // 2D Wave propagation
      const damping = 0.945;
      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          const idx = r * cols + c;
          const avg =
            (curr[idx - 1] +
              curr[idx + 1] +
              curr[idx - cols] +
              curr[idx + cols]) *
              0.5 -
            prev[idx];
          next[idx] = avg * damping;
        }
      }

      // Swap wave buffers
      const tmp = prev;
      prev = curr;
      curr = next;
      next = tmp;

      ctx.fillStyle = "#04060A";
      ctx.fillRect(0, 0, width, height);

      const size = cell - 3;
      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          const val = curr[r * cols + c];
          const flow =
            Math.sin(c * 0.25 + elapsed * 1.1 + r * 0.18) * 0.5 + 0.5;
          const amp = Math.min(1, Math.abs(val) * 1.35 + flow * 0.12);
          if (amp < 0.08) continue;

          // Quantize fluid color between deep navy, neon cyan, and emerald/magenta crests
          const q = Math.ceil(amp * 5) / 5;
          let fill: string;
          if (val > 0.35) {
            fill = `rgba(0, 240, 255, ${(q * 0.65).toFixed(2)})`;
          } else if (val < -0.25) {
            fill = `rgba(184, 107, 255, ${(q * 0.55).toFixed(2)})`;
          } else {
            fill = `rgba(0, 255, 136, ${(q * 0.22).toFixed(2)})`;
          }

          const x = (c - 1) * cell + 1;
          const y = (r - 1) * cell + 1;
          ctx.fillStyle = fill;
          ctx.fillRect(x, y, size, size);
        }
      }

      if (!reducedMotion) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

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
      const gx = Math.floor((e.clientX - rect.left) / cell) + 1;
      const gy = Math.floor((e.clientY - rect.top) / cell) + 1;
      injectRipple(gx, gy, 1.45);
    };

    const ro = new ResizeObserver(setup);
    ro.observe(host);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [isOutroActive, finePointer, reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#04060A]"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(4, 6, 10, 0.35), rgba(4, 6, 10, 0.78) 90%)",
        }}
      />
    </div>
  );
}
