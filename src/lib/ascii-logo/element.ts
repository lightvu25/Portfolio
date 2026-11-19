import { Color, LinearSRGBColorSpace } from "three";

import { loadGlyphAtlas } from "./glyph-atlas";
import { AsciiLogoRenderer, type AsciiPose } from "./renderer";

const damp = (current: number, target: number, tau: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-dt / tau));

const FRAME_SLACK_MS = 8;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CONFIG = {
  cellW: 6,
  lineRatio: 1.6,
  maxDpr: 2,
  maxCells: 4200,
  frameHz: 60,
  floatSpeed: 1.75,
  floatIntensity: 1.15,
  rotationIntensity: 0.9,
  dragScale: 0.007,
  keyStep: 0.18,
  orbitTau: 70,
  maxElevation: 0.85,
};

const REST_AZIMUTH = -0.32;
const REST_ELEVATION = -0.18;
const RESIZE_SETTLE_MS = 220;
const CELL_ASPECT = 1 / CONFIG.lineRatio;

function resolveCssColor(element: Element, property: "color" | "accentColor", fallback: [number, number, number]): Color {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return new Color().setRGB(fallback[0], fallback[1], fallback[2], LinearSRGBColorSpace);
  }
  const computed = getComputedStyle(element);
  const raw = property === "accentColor" ? computed.accentColor : computed.color;
  ctx.fillStyle = raw && raw !== "auto" ? raw : "#2B3AE8";
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return new Color().setRGB(r / 255, g / 255, b / 255, LinearSRGBColorSpace);
}

export class AsciiLogoElement extends HTMLElement {
  static observedAttributes = ["dark"];

  #canvas: HTMLCanvasElement | null = null;
  #renderer: AsciiLogoRenderer | null = null;
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

  #azimuth = REST_AZIMUTH;
  #elevation = REST_ELEVATION;
  #aimAzimuth = REST_AZIMUTH;
  #aimElevation = REST_ELEVATION;

  #pointer = -1;
  #pointerType = "";
  #dragCommitted = false;
  #pointerX = 0;
  #pointerY = 0;

  connectedCallback(): void {
    this.#canvas = this.querySelector<HTMLCanvasElement>("[data-logo-canvas]");
    if (!this.#canvas) {
      return;
    }

    this.#reduced = prefersReducedMotion();
    this.#motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.#motionMedia.addEventListener("change", this.#onMotionPrefChange);

    this.#elapsed = Math.PI * 0.75;
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
    this.removeEventListener("keydown", this.#onKeyDown);
    this.#releasePointer();
    this.#renderer?.destroy();
    this.#renderer = null;
  }

  async #build(): Promise<void> {
    const canvas = this.#canvas;
    if (!canvas) return;

    const style = getComputedStyle(canvas);
    const atlas = await loadGlyphAtlas(
      style.fontFamily,
      style.fontWeight || "400",
      CELL_ASPECT
    );

    if (!this.isConnected) return;

    const renderer = AsciiLogoRenderer.create(canvas, atlas);
    if (!renderer) {
      this.dispatchEvent(new CustomEvent("ascii-logo-fallback", { bubbles: true }));
      return;
    }

    try {
      renderer.setInk(
        resolveCssColor(this, "color", [0.08, 0.08, 0.075]),
        resolveCssColor(this, "accentColor", [0.17, 0.23, 0.91])
      );
      renderer.setPaper(!this.hasAttribute("dark"));
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
      this.dispatchEvent(new CustomEvent("ascii-logo-fallback", { bubbles: true }));
      return;
    }

    this.#renderer = renderer;
    canvas.classList.remove("is-hidden");
    this.setAttribute("data-ready", "true");

    this.addEventListener("pointerdown", this.#onPointerDown);
    this.addEventListener("keydown", this.#onKeyDown);

    this.#applyMotion();
    this.dispatchEvent(new CustomEvent("ascii-logo-ready", { bubbles: true }));
  }

  attributeChangedCallback(): void {
    if (!this.#renderer || !this.#canvas) return;
    this.#renderer.setInk(
      resolveCssColor(this, "color", [0.08, 0.08, 0.075]),
      resolveCssColor(this, "accentColor", [0.17, 0.23, 0.91])
    );
    this.#renderer.setPaper(!this.hasAttribute("dark"));
    this.#draw();
  }

  #onMotionPrefChange = (e: MediaQueryListEvent) => {
    this.#reduced = e.matches;
    this.#draw();
    this.#applyMotion();
  };

  #onContextLost = (event: Event) => {
    event.preventDefault();
    this.#stop();
    this.#canvas?.classList.add("is-hidden");
    this.removeAttribute("data-ready");
    this.dispatchEvent(new CustomEvent("ascii-logo-fallback", { bubbles: true }));
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

  #onKeyDown = (event: KeyboardEvent) => {
    let handled = true;
    switch (event.key) {
      case "ArrowLeft":
        this.#aimAzimuth += CONFIG.keyStep;
        break;
      case "ArrowRight":
        this.#aimAzimuth -= CONFIG.keyStep;
        break;
      case "ArrowUp":
        this.#aimElevation = Math.min(
          CONFIG.maxElevation,
          this.#aimElevation + CONFIG.keyStep
        );
        break;
      case "ArrowDown":
        this.#aimElevation = Math.max(
          -CONFIG.maxElevation,
          this.#aimElevation - CONFIG.keyStep
        );
        break;
      case "r":
      case "R":
      case "Home":
        this.#aimAzimuth = REST_AZIMUTH;
        this.#aimElevation = REST_ELEVATION;
        break;
      default:
        handled = false;
    }

    if (handled) {
      event.preventDefault();
      if (this.#reduced) {
        this.#azimuth = this.#aimAzimuth;
        this.#elevation = this.#aimElevation;
        this.#draw();
      } else {
        this.#play();
      }
    }
  };

  #onPointerDown = (event: PointerEvent) => {
    if (this.#pointer !== -1 || !event.isPrimary) return;

    this.#pointer = event.pointerId;
    this.#pointerType = event.pointerType;
    this.#pointerX = event.clientX;
    this.#pointerY = event.clientY;
    // On mouse/pen commit immediately; on touch wait for horizontal intent so vertical page scroll stays native
    this.#dragCommitted = event.pointerType !== "touch";

    if (this.#dragCommitted) {
      this.setPointerCapture(event.pointerId);
      this.classList.add("is-grabbing");
    }

    this.addEventListener("pointermove", this.#onPointerMove);
    this.addEventListener("pointerup", this.#onPointerUp);
    this.addEventListener("pointercancel", this.#onPointerUp);
    this.#applyMotion();
  };

  #onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== this.#pointer) return;

    const dx = event.clientX - this.#pointerX;
    const dy = event.clientY - this.#pointerY;

    if (!this.#dragCommitted) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        // User is scrolling vertically on touch
        this.#releasePointer();
        return;
      }
      if (Math.abs(dx) > 6) {
        this.#dragCommitted = true;
        try {
          this.setPointerCapture(event.pointerId);
        } catch {
          // Ignore if pointer already released by browser scroll gesture
        }
        this.classList.add("is-grabbing");
      } else {
        return;
      }
    }

    this.#aimAzimuth -= dx * CONFIG.dragScale;
    if (this.#pointerType !== "touch") {
      this.#aimElevation = Math.max(
        -CONFIG.maxElevation,
        Math.min(CONFIG.maxElevation, this.#aimElevation + dy * CONFIG.dragScale)
      );
    }
    this.#pointerX = event.clientX;
    this.#pointerY = event.clientY;
  };

  #onPointerUp = (event: PointerEvent) => {
    if (event.pointerId === this.#pointer) {
      this.#releasePointer();
      this.#applyMotion();
    }
  };

  #releasePointer(): void {
    if (this.#pointer !== -1 && this.hasPointerCapture(this.#pointer)) {
      try {
        this.releasePointerCapture(this.#pointer);
      } catch {
        // Safe ignore
      }
    }
    this.#pointer = -1;
    this.#dragCommitted = false;
    this.classList.remove("is-grabbing");
    this.removeEventListener("pointermove", this.#onPointerMove);
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
      this.#elapsed += (step / 1000) * CONFIG.floatSpeed;
    }

    this.#azimuth = damp(this.#azimuth, this.#aimAzimuth, CONFIG.orbitTau, step);
    this.#elevation = damp(
      this.#elevation,
      this.#aimElevation,
      CONFIG.orbitTau,
      step
    );

    this.#draw();

    if (
      this.#reduced &&
      this.#pointer === -1 &&
      Math.abs(this.#azimuth - this.#aimAzimuth) < 0.001 &&
      Math.abs(this.#elevation - this.#aimElevation) < 0.001
    ) {
      this.#stop();
    }
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

  #pose(): AsciiPose {
    const wave = this.#elapsed / 4;
    const motionFactor = this.#reduced ? 0 : 1;

    return {
      azimuth: this.#azimuth,
      elevation: this.#elevation,
      rotateX: (Math.cos(wave) / 8) * CONFIG.rotationIntensity * motionFactor,
      rotateY: (Math.sin(wave) / 8) * CONFIG.rotationIntensity * motionFactor,
      rotateZ: (Math.sin(wave) / 20) * CONFIG.rotationIntensity * motionFactor,
      bob:
        (Math.sin(this.#elapsed / 1.5) / 10) *
        CONFIG.floatIntensity *
        motionFactor,
    };
  }

  #draw(): void {
    this.#renderer?.render(this.#pose());
  }
}

export function registerAsciiLogoElement(): void {
  if (typeof window === "undefined") return;
  if (!customElements.get("ascii-logo")) {
    customElements.define("ascii-logo", AsciiLogoElement);
  }
}
