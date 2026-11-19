"use client";

import { useEffect, useRef } from "react";

import { useFinePointer, useReducedMotionPref } from "@/components/motion/hooks";

interface CellState {
  gx: number;
  gy: number;
  life: number;
  maxLife: number;
  tone: "cobalt" | "ink" | "amber";
}

const CELL_SIZE = 20;
const MAX_ACTIVE_CELLS = 64;

/**
 * Subtle cursor-reactive pixel grid scoped strictly to its parent `[data-pixel-stage]`
 * section. Zero global window listeners, disabled automatically on touch/coarse
 * pointers and under `prefers-reduced-motion`, and halts its rAF loop completely
 * whenever all cells finish decaying.
 */
export function PixelField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotionPref();
  const finePointer = useFinePointer();

  const interactive = finePointer && !reducedMotion;

  useEffect(() => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const stage =
      canvas.closest<HTMLElement>("[data-pixel-stage]") ?? canvas.parentElement;
    if (!stage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cells = new Map<string, CellState>();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let lastTime = 0;
    let visible = true;
    let lastKey = "";
    let stepCounter = 0;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      width = Math.max(Math.floor(rect.width), 1);
      height = Math.max(Math.floor(rect.height), 1);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const draw = (now: number) => {
      if (!visible || cells.size === 0) {
        ctx.clearRect(0, 0, width, height);
        rafId = 0;
        return;
      }

      const dt = lastTime === 0 ? 16 : Math.min(48, now - lastTime);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (const [key, cell] of cells) {
        cell.life -= dt;
        if (cell.life <= 0) {
          cells.delete(key);
          continue;
        }

        // Quantize alpha in 4 discrete pixel steps for authentic pixel-art decay
        const progress = cell.life / cell.maxLife;
        const stepped = Math.ceil(progress * 4) / 4;

        if (cell.tone === "cobalt") {
          ctx.fillStyle = `rgba(43, 58, 232, ${(0.13 * stepped).toFixed(3)})`;
        } else if (cell.tone === "amber") {
          ctx.fillStyle = `rgba(242, 157, 24, ${(0.24 * stepped).toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(20, 20, 19, ${(0.075 * stepped).toFixed(3)})`;
        }

        const x = cell.gx * CELL_SIZE;
        const y = cell.gy * CELL_SIZE;
        ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }

      if (cells.size > 0) {
        rafId = requestAnimationFrame(draw);
      } else {
        rafId = 0;
      }
    };

    const startLoop = () => {
      if (rafId === 0 && visible && cells.size > 0) {
        lastTime = 0;
        rafId = requestAnimationFrame(draw);
      }
    };

    const spawnCell = (
      gx: number,
      gy: number,
      maxLife: number,
      tone: CellState["tone"]
    ) => {
      if (gx < 0 || gy < 0 || gx * CELL_SIZE >= width || gy * CELL_SIZE >= height) {
        return;
      }
      const key = `${gx}:${gy}`;
      if (!cells.has(key) && cells.size >= MAX_ACTIVE_CELLS) {
        const oldestKey = cells.keys().next().value;
        if (oldestKey !== undefined) {
          cells.delete(oldestKey);
        }
      }
      cells.set(key, { gx, gy, life: maxLife, maxLife, tone });
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = stage.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const gx = Math.floor(x / CELL_SIZE);
      const gy = Math.floor(y / CELL_SIZE);
      const key = `${gx}:${gy}`;

      if (key === lastKey) return;
      lastKey = key;
      stepCounter++;

      spawnCell(gx, gy, 580, stepCounter % 7 === 0 ? "amber" : "cobalt");

      if (stepCounter % 2 === 0) {
        const offsetX = stepCounter % 4 === 0 ? 1 : -1;
        const offsetY = stepCounter % 3 === 0 ? -1 : 1;
        spawnCell(gx + offsetX, gy + offsetY, 380, "ink");
      }

      startLoop();
    };

    const onPointerLeave = () => {
      lastKey = "";
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) {
        startLoop();
      } else if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    });
    io.observe(stage);

    stage.addEventListener("pointermove", onPointerMove, { passive: true });
    stage.addEventListener("pointerleave", onPointerLeave, { passive: true });

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      io.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [interactive]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
    >
      <div className="absolute inset-0 bg-pixel-dots opacity-55" />
      {interactive && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}
