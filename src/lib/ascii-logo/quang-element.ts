import { Color, LinearSRGBColorSpace } from "three";

import { loadGlyphAtlas } from "./glyph-atlas";
import { AsciiQuangRenderer, type QuangPose } from "./quang-renderer";

const damp = (current: number, target: number, tau: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-dt / tau));

const FRAME_SLACK_MS = 8;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CONFIG = {
  cellW: 5,
  lineRatio: 1.55,
  maxDpr: 2,
  maxCells: 6200,
  frameHz: 60,
  dragScale: 0.0045,
  maxDragAzimuth: 0.44,
  maxDragElevation: 0.28,
  orbitTau: 95,
  springTau: 110,
};

const REST_ELEVATION = -0.05;
const RESIZE_SETTLE_MS = 200;
const CELL_ASPECT = 1 / CONFIG.lineRatio;

export class AsciiQuangElement extends HTMLElement {
  static observedAttributes = ["revealed"];

  #canvas: HTMLCanvasElement | null = null;
  #renderer: AsciiQuangRenderer | null = null;
  #resizeObserver: ResizeObserver | null = null;
  #visibilityObserver: IntersectionObserver | null = null;
  #motionMedia: MediaQueryList | null = null;

  #width = 0;
  #height = 0;
  #dpr = 1;
  #cellW = 0;
  #cellH = 0;

  #raf = 0;
  #last = 0;
  #settle = 0;
  #elapsed = 0;
  #visible = false;
  #reduced = false;

  // Combined hover + spring-back drag orbit (never flips text backwards)
  #azimuth = 0;
  #elevation = REST_ELEVATION;
  #hoverAzimuth = 0;
  #hoverElevation = REST_ELEVATION;
  #dragAzimuth = 0;
  #dragElevation = 0;

  // Per-letter hover proximity + reveal stagger [Q, U, A, N, G]
  #hoverNormX: number | null = null;
  #letterBoosts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  #letterReveals: [number, number, number, number, number] = [1, 1, 1, 1, 1];
  #targetReveals: [number, number, number, number, number] = [1, 1, 1, 1, 1];

  #pointer = -1;
  #pointerType = "";
  #dragCommitted = false;
  #pointerX = 0;
  #pointerY = 0;

  connectedCallback(): void {
    this.#canvas = this.querySelector<HTMLCanvasElement>("[data-quang-canvas]");
    if (!this.#canvas) return;

    this.#reduced = prefersReducedMotion();
    this.#motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.#motionMedia.addEventListener("change", this.#onMotionPrefChange);

    if (this.getAttribute("revealed") === "false") {
      this.#letterReveals = [0, 0, 0, 0, 0];
      this.#targetReveals = [0, 0, 0, 0, 0];
    }

    this.#measure();

    this.#resizeObserver = new ResizeObserver(this.#onResize);
    this.#resizeObserver.observe(this);

    this.#visibilityObserver = new IntersectionObserver(this.#onVisibility);
    this.#visibilityObserver.observe(this);

    this.#canvas.addEventListener("webglcontextlost", this.#onContextLost);

    void this.#build();
  }

  disconnectedCallback(): void {
    this.#stop();
    window.clearTimeout(this.#settle);
    this.#resizeObserver?.disconnect();
    this.#visibilityObserver?.disconnect();
    this.#motionMedia?.removeEventListener("change", this.#onMotionPrefChange);
    this.#resizeObserver = null;
    this.#visibilityObserver = null;
    this.#motionMedia = null;

    this.#canvas?.removeEventListener("webglcontextlost", this.#onContextLost);
    this.removeEventListener("pointerdown", this.#onPointerDown);
    window.removeEventListener("pointermove", this.#onWindowHoverMove);
    this.removeEventListener("pointerleave", this.#onPointerLeave);
    this.#releasePointer();
    this.#renderer?.destroy();
    this.#renderer = null;
  }

  attributeChangedCallback(name: string, _old: string | null, val: string | null): void {
    if (name !== "revealed") return;
    if (val === "true") {
      this.revealWord();
    }
  }

  /** Called by BootSequence once 'Q' lands into slot: snaps Q to 1 and cascades U-A-N-G. */
  revealWord(): void {
    this.#letterReveals[0] = 1;
    this.#targetReveals = [1, 1, 1, 1, 1];
    this.#play();
  }

  setQReady(): void {
    this.#letterReveals[0] = 1;
    this.#targetReveals[0] = 1;
    this.#draw();
  }

  async #build(): Promise<void> {
    const canvas = this.#canvas;
    if (!canvas) return;

    const style = getComputedStyle(canvas);
    const atlas = await loadGlyphAtlas(
      style.fontFamily,
      style.fontWeight || "600",
      CELL_ASPECT
    );

    if (!this.isConnected) return;

    const renderer = AsciiQuangRenderer.create(canvas, atlas);
    if (!renderer) {
      this.dispatchEvent(new CustomEvent("ascii-quang-fallback", { bubbles: true }));
      return;
    }

    try {
      renderer.setInk(
        new Color().setRGB(0.0, 0.94, 1.0, LinearSRGBColorSpace),
        new Color().setRGB(0.0, 1.0, 0.53, LinearSRGBColorSpace)
      );
      renderer.resize(
        this.#width,
        this.#height,
        this.#dpr,
        this.#cellW,
        this.#cellH
      );
      renderer.render(this.#pose());
    } catch (error) {
      console.warn(error);
      renderer.destroy();
      this.dispatchEvent(new CustomEvent("ascii-quang-fallback", { bubbles: true }));
      return;
    }

    this.#renderer = renderer;
    canvas.classList.remove("is-hidden");
    this.setAttribute("data-ready", "true");

    this.addEventListener("pointerdown", this.#onPointerDown);
    window.addEventListener("pointermove", this.#onWindowHoverMove, { passive: true });
    this.addEventListener("pointerleave", this.#onPointerLeave);

    this.#applyMotion();
    this.dispatchEvent(new CustomEvent("ascii-quang-ready", { bubbles: true }));
  }

  #onMotionPrefChange = (e: MediaQueryListEvent) => {
    this.#reduced = e.matches;
    if (this.#reduced) {
      this.#letterReveals = [1, 1, 1, 1, 1];
      this.#targetReveals = [1, 1, 1, 1, 1];
      this.#letterBoosts = [0, 0, 0, 0, 0];
      this.#azimuth = 0;
      this.#elevation = REST_ELEVATION;
    }
    this.#draw();
    this.#applyMotion();
  };

  #onContextLost = (event: Event) => {
    event.preventDefault();
    this.#stop();
    this.#canvas?.classList.add("is-hidden");
    this.removeAttribute("data-ready");
    this.dispatchEvent(new CustomEvent("ascii-quang-fallback", { bubbles: true }));
  };

  #onVisibility = (entries: IntersectionObserverEntry[]) => {
    this.#visible = entries.some((entry) => entry.isIntersecting);
    this.#applyMotion();
  };

  #onResize = () => {
    window.clearTimeout(this.#settle);
    this.#settle = window.setTimeout(this.#remeasure, RESIZE_SETTLE_MS);
  };

  #remeasure = () => {
    const rect = this.getBoundingClientRect();
    if (
      Math.abs(rect.width - this.#width) < 1 &&
      Math.abs(rect.height - this.#height) < 1
    ) {
      return;
    }
    this.#measure();
    this.#draw();
  };

  #onWindowHoverMove = (event: PointerEvent) => {
    if (this.#reduced || event.pointerType === "touch") return;
    const rect = this.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;

    // Gentle 3D tilt across hero
    const clampedX = Math.max(-1, Math.min(1, nx));
    const clampedY = Math.max(-1, Math.min(1, ny));
    this.#hoverAzimuth = clampedX * 0.24;
    this.#hoverElevation = REST_ELEVATION - clampedY * 0.14;

    if (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    ) {
      this.#hoverNormX = (event.clientX - rect.left) / rect.width;
    } else {
      this.#hoverNormX = null;
    }
  };

  #onPointerLeave = () => {
    this.#hoverNormX = null;
    this.#hoverAzimuth = 0;
    this.#hoverElevation = REST_ELEVATION;
  };

  #onPointerDown = (event: PointerEvent) => {
    if (this.#pointer !== -1 || !event.isPrimary) return;

    this.#pointer = event.pointerId;
    this.#pointerType = event.pointerType;
    this.#pointerX = event.clientX;
    this.#pointerY = event.clientY;
    this.#dragCommitted = event.pointerType !== "touch";

    if (this.#dragCommitted) {
      this.setPointerCapture(event.pointerId);
    }

    this.addEventListener("pointermove", this.#onPointerDragMove);
    this.addEventListener("pointerup", this.#onPointerUp);
    this.addEventListener("pointercancel", this.#onPointerUp);
    this.#applyMotion();
  };

  #onPointerDragMove = (event: PointerEvent) => {
    if (event.pointerId !== this.#pointer) return;
    const dx = event.clientX - this.#pointerX;
    const dy = event.clientY - this.#pointerY;

    if (!this.#dragCommitted) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        this.#releasePointer();
        return;
      }
      if (Math.abs(dx) > 6) {
        this.#dragCommitted = true;
        try {
          this.setPointerCapture(event.pointerId);
        } catch {
          // Ignore
        }
      } else {
        return;
      }
    }

    // Bounded drag rotation so QUANG never turns backwards
    this.#dragAzimuth = Math.max(
      -CONFIG.maxDragAzimuth,
      Math.min(CONFIG.maxDragAzimuth, this.#dragAzimuth - dx * CONFIG.dragScale)
    );
    if (this.#pointerType !== "touch") {
      this.#dragElevation = Math.max(
        -CONFIG.maxDragElevation,
        Math.min(CONFIG.maxDragElevation, this.#dragElevation + dy * CONFIG.dragScale)
      );
    }
    this.#pointerX = event.clientX;
    this.#pointerY = event.clientY;
  };

  #onPointerUp = (event: PointerEvent) => {
    if (event.pointerId === this.#pointer) {
      this.#releasePointer();
      // Elastic spring-back to neutral heading on release
      this.#dragAzimuth = 0;
      this.#dragElevation = 0;
      this.#applyMotion();
    }
  };

  #releasePointer(): void {
    if (this.#pointer !== -1 && this.hasPointerCapture(this.#pointer)) {
      try {
        this.releasePointerCapture(this.#pointer);
      } catch {
        // Ignore
      }
    }
    this.#pointer = -1;
    this.#dragCommitted = false;
    this.removeEventListener("pointermove", this.#onPointerDragMove);
    this.removeEventListener("pointerup", this.#onPointerUp);
    this.removeEventListener("pointercancel", this.#onPointerUp);
  }

  #applyMotion = (): void => {
    if (!this.#renderer || !this.#visible) {
      this.#stop();
      return;
    }

    if (this.#reduced && this.#pointer === -1) {
      this.#stop();
      return;
    }

    this.#play();
  };

  #play(): void {
    if (this.#raf !== 0) return;
    this.#last = 0;
    this.#raf = requestAnimationFrame(this.#onFrame);
  }

  #stop(): void {
    cancelAnimationFrame(this.#raf);
    this.#raf = 0;
  }

  #onFrame = (now: number): void => {
    this.#raf = requestAnimationFrame(this.#onFrame);

    if (this.#last === 0) {
      this.#last = now;
    }

    const dt = now - this.#last;
    if (dt < 1000 / CONFIG.frameHz - FRAME_SLACK_MS) {
      return;
    }

    this.#last = now;
    const step = Math.min(48, dt);

    if (!this.#reduced) {
      this.#elapsed += step / 1000;
    }

    if (this.#pointer === -1) {
      this.#dragAzimuth = damp(this.#dragAzimuth, 0, CONFIG.springTau, step);
      this.#dragElevation = damp(this.#dragElevation, 0, CONFIG.springTau, step);
    }

    const targetAz = this.#hoverAzimuth + this.#dragAzimuth;
    const targetEl = this.#hoverElevation + this.#dragElevation;

    this.#azimuth = damp(this.#azimuth, targetAz, CONFIG.orbitTau, step);
    this.#elevation = damp(this.#elevation, targetEl, CONFIG.orbitTau, step);

    // Update per-letter hover glow & reveal progression
    for (let i = 0; i < 5; i++) {
      let targetBoost = 0;
      if (this.#hoverNormX !== null && !this.#reduced) {
        const letterNormCenter = 0.14 + i * 0.18;
        const dist = Math.abs(this.#hoverNormX - letterNormCenter);
        targetBoost = Math.max(0, 1 - dist / 0.16);
      }
      this.#letterBoosts[i] = damp(this.#letterBoosts[i], targetBoost, 75, step);

      // Cascade reveals sequentially (Q -> U -> A -> N -> G)
      const prevReady = i === 0 ? 1 : this.#letterReveals[i - 1];
      const goal = prevReady > 0.42 ? this.#targetReveals[i] : this.#letterReveals[i];
      this.#letterReveals[i] = damp(this.#letterReveals[i], goal, 65, step);
    }

    this.#draw();
  };

  #measure(): void {
    const rect = this.getBoundingClientRect();
    this.#width = Math.max(rect.width, 1);
    this.#height = Math.max(rect.height, 1);
    this.#dpr = Math.min(CONFIG.maxDpr, window.devicePixelRatio || 1);

    const raw =
      (this.#width / CONFIG.cellW) *
      (this.#height / (CONFIG.cellW * CONFIG.lineRatio));
    const growth = raw > CONFIG.maxCells ? Math.sqrt(raw / CONFIG.maxCells) : 1;

    this.#cellW = Math.round(CONFIG.cellW * growth);
    this.#cellH = Math.round(this.#cellW * CONFIG.lineRatio);

    this.#renderer?.resize(
      this.#width,
      this.#height,
      this.#dpr,
      this.#cellW,
      this.#cellH
    );
  }

  #pose(): QuangPose {
    const motion = this.#reduced ? 0 : 1;
    const waves: [number, number, number, number, number] = [
      Math.sin(this.#elapsed * 2.1 + 0.0) * motion,
      Math.sin(this.#elapsed * 2.1 + 0.7) * motion,
      Math.sin(this.#elapsed * 2.1 + 1.4) * motion,
      Math.sin(this.#elapsed * 2.1 + 2.1) * motion,
      Math.sin(this.#elapsed * 2.1 + 2.8) * motion,
    ];

    return {
      azimuth: this.#azimuth,
      elevation: this.#elevation,
      bob: Math.sin(this.#elapsed * 1.4) * 0.04 * motion,
      letterBoosts: this.#letterBoosts,
      letterReveals: this.#letterReveals,
      letterWaves: waves,
    };
  }

  #draw(): void {
    this.#renderer?.render(this.#pose());
  }
}

export function registerAsciiQuangElement(): void {
  if (typeof window === "undefined") return;
  if (!customElements.get("ascii-quang")) {
    customElements.define("ascii-quang", AsciiQuangElement);
  }
}
