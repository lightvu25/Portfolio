"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import { useFinePointer, useReducedMotionPref } from "@/components/motion/hooks";

interface TrailPixel {
  x: number;
  y: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

const TRAIL_COLORS = ["#00F0FF", "#00FF88", "#FF2E93", "#FFB800"];
const MAX_PARTICLES = 42;

/**
 * Custom glowing pixel pointer + stepped particle trail on pointer movement.
 * Driven via `gsap.quickTo()` for zero-overhead 60fps tracking, automatically
 * disabled on touch/coarse devices and under `prefers-reduced-motion`, and
 * stops the canvas `rAF` loop completely when the mouse is idle.
 */
export function PixelCursor() {
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotionPref();
  const enabled = finePointer && !reducedMotion;

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [hoverInteractive, setHoverInteractive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("pixel-cursor-active");
      return;
    }

    document.documentElement.classList.add("pixel-cursor-active");

    const cursorEl = cursorRef.current;
    const canvas = canvasRef.current;
    if (!cursorEl || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const xTo = gsap.quickTo(cursorEl, "x", { duration: 0.08, ease: "power3" });
    const yTo = gsap.quickTo(cursorEl, "y", { duration: 0.08, ease: "power3" });

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const particles: TrailPixel[] = [];
    let rafId = 0;
    let lastTime = 0;
    let lastSpawnX = -999;
    let lastSpawnY = -999;
    let colorIdx = 0;

    const tick = (now: number) => {
      if (particles.length === 0) {
        ctx.clearRect(0, 0, width, height);
        rafId = 0;
        return;
      }

      const dt = lastTime === 0 ? 16 : Math.min(40, now - lastTime);
      lastTime = now;
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const progress = p.life / p.maxLife;
        const stepped = Math.ceil(progress * 4) / 4;
        ctx.globalAlpha = stepped * 0.85;
        ctx.fillStyle = p.color;
        ctx.fillRect(
          Math.round(p.x / 4) * 4,
          Math.round(p.y / 4) * 4,
          p.size,
          p.size
        );
      }
      ctx.globalAlpha = 1;

      if (particles.length > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const startLoop = () => {
      if (rafId === 0 && particles.length > 0) {
        lastTime = 0;
        rafId = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setVisible(true);
      xTo(e.clientX);
      yTo(e.clientY);

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest(
          'a, button, [role="button"], video, input, select, textarea, ascii-quang'
        )
      );
      setHoverInteractive(isInteractive);

      const dist = Math.hypot(e.clientX - lastSpawnX, e.clientY - lastSpawnY);
      if (dist >= 14) {
        lastSpawnX = e.clientX;
        lastSpawnY = e.clientY;
        colorIdx = (colorIdx + 1) % TRAIL_COLORS.length;

        if (particles.length >= MAX_PARTICLES) {
          particles.shift();
        }

        particles.push({
          x: e.clientX + (colorIdx % 2 === 0 ? 4 : -6),
          y: e.clientY + (colorIdx % 3 === 0 ? 6 : -4),
          size: isInteractive ? 8 : 6,
          life: 360,
          maxLife: 360,
          color: TRAIL_COLORS[colorIdx],
        });
        startLoop();
      }
    };

    const onPointerLeave = () => {
      setVisible(false);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);

    return () => {
      document.documentElement.classList.remove("pixel-cursor-active");
      if (rafId !== 0) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[94]"
      />
      <div
        ref={cursorRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-[95] transition-opacity duration-150 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          marginLeft: -2,
          marginTop: -2,
          filter: hoverInteractive
            ? "drop-shadow(0 0 8px #00FF88)"
            : "drop-shadow(0 0 6px #00F0FF)",
        }}
      >
        {hoverInteractive ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 16 16"
            shapeRendering="crispEdges"
          >
            <path
              d="M6 1h4v2H6V1zM6 13h4v2H6v-2zM1 6h2v4H1V6zM13 6h2v4h-2V6z"
              fill="#00FF88"
            />
            <rect x="6" y="6" width="4" height="4" fill="#ECF4FF" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 16 16"
            shapeRendering="crispEdges"
          >
            <path
              d="M2 1h2v2h2v2h2v2h2v2h2v2H7v2h2v2H7v-2H5V9H3V1z"
              fill="#04060A"
            />
            <path
              d="M3 2h1v1h2v2h2v2h2v2h1v1H6v2h2v2H7v-2H5V9H3V2z"
              fill="#00F0FF"
            />
            <rect x="11" y="2" width="2" height="2" fill="#FFB800" />
          </svg>
        )}
      </div>
    </>
  );
}
