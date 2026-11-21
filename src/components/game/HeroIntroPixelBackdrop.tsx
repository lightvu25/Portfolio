"use client";

import { useEffect, useRef } from "react";

import { useFinePointer, useReducedMotionPref } from "@/components/motion/hooks";
import { useMagneticScroll } from "./MagneticScroller";

interface IntroEmber {
  x: number;
  y: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

const EMBER_COLORS = ["#00F0FF", "#00FF88", "#B86BFF", "#FFB800"];

/**
 * Interactive & ambient stepped-pixel animation backdrop for the bottom Hero Intro section.
 * Renders subtle upward-drifting neon pixel embers + pointer-reactive pixel grid cells
 * while Section 0 is active, and halts its `rAF` loop automatically off-screen.
 */
export function HeroIntroPixelBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { activeIndex } = useMagneticScroll();
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotionPref();

  const isHeroActive = activeIndex === 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement?.parentElement;
    if (!host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const cell = 22;

    const setup = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(Math.floor(rect.width), 1);
      height = Math.max(Math.floor(rect.height), 1);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setup();

    if (reducedMotion || !isHeroActive) {
      ctx.clearRect(0, 0, width, height);
      if (reducedMotion) {
        const cols = Math.ceil(width / cell);
        const rows = Math.ceil(height / cell);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if ((r * 7 + c * 13) % 29 !== 0) continue;
            ctx.fillStyle = "rgba(0, 240, 255, 0.12)";
            ctx.fillRect(c * cell + 4, r * cell + 4, 6, 6);
          }
        }
      }
      return;
    }

    const createEmber = (randomY = false): IntroEmber => ({
      x: Math.floor((Math.random() * Math.max(width, 100)) / 4) * 4,
      y: randomY
        ? Math.floor(Math.random() * Math.max(height, 100))
        : Math.max(height, 100) + Math.random() * 24,
      vy: 14 + Math.random() * 22,
      size: Math.random() > 0.65 ? 6 : 4,
      life: Math.random() * 2600,
      maxLife: 2400 + Math.random() * 2200,
      color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
    });

    const embers: IntroEmber[] = Array.from({ length: 28 }, () =>
      createEmber(true)
    );

    const mouse = { x: -9999, y: -9999, active: false };
    let rafId = 0;
    let lastTime = 0;
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = lastTime === 0 ? 16 : Math.min(40, now - lastTime);
      lastTime = now;
      elapsed += dt / 1000;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / cell) + 1;
      const rows = Math.ceil(height / cell) + 1;
      const block = cell - 4;

      // Subtle stepped wave + pointer-reactive pixel grid cells
      for (let r = 0; r < rows; r++) {
        const py = r * cell + 2;
        for (let c = 0; c < cols; c++) {
          const px = c * cell + 2;
          const wave =
            (Math.sin(c * 0.45 + elapsed * 1.4 + r * 0.35) +
              Math.cos(c * 0.25 - elapsed * 0.9 + r * 0.55)) *
            0.25 +
            0.5;

          let hoverStrength = 0;
          if (mouse.active) {
            const dist = Math.hypot(
              px + block * 0.5 - mouse.x,
              py + block * 0.5 - mouse.y
            );
            if (dist < 110) {
              hoverStrength = 1 - dist / 110;
            }
          }

          if (hoverStrength > 0.04) {
            const qHover = Math.ceil(hoverStrength * 4) / 4;
            ctx.fillStyle = `rgba(0, 240, 255, ${(qHover * 0.22).toFixed(2)})`;
            ctx.fillRect(px, py, block, block);
          } else if (wave > 0.84) {
            ctx.fillStyle = "rgba(0, 255, 136, 0.06)";
            ctx.fillRect(px, py, block, block);
          }
        }
      }

      // Quantized rising neon pixel embers
      for (let i = 0; i < embers.length; i++) {
        const p = embers[i];
        p.life += dt;
        p.y -= (p.vy * dt) / 1000;
        if (p.life >= p.maxLife || p.y < -12) {
          embers[i] = createEmber(false);
          continue;
        }
        const progress = p.life / p.maxLife;
        const env = Math.sin(progress * Math.PI);
        const steppedAlpha = (Math.ceil(env * 4) / 4) * 0.42;
        if (steppedAlpha <= 0) continue;

        ctx.globalAlpha = steppedAlpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(
          Math.round(p.x / 4) * 4,
          Math.round(p.y / 4) * 4,
          p.size,
          p.size
        );
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(tick);
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
        mouse.active = false;
        return;
      }
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const onPointerLeave = () => {
      mouse.active = false;
    };

    const ro = new ResizeObserver(setup);
    ro.observe(host);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [isHeroActive, finePointer, reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <canvas data-hero-intro-canvas="" ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
