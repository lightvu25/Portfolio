"use client";

import { createElement, useEffect, useRef, useState } from "react";

import { PixelCluster } from "@/components/pixel/PixelCluster";
import { AsciiMarkFallback } from "./AsciiMarkFallback";

function supportsWebGL2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2"));
  } catch {
    return false;
  }
}

export function AsciiMark() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [mountedElement, setMountedElement] = useState(false);
  const [webglReady, setWebglReady] = useState(false);

  // Attach custom-element event & attribute observers on mount so ready state is never missed
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const syncReadyState = () => {
      const el = host.querySelector("ascii-logo");
      setWebglReady(el?.getAttribute("data-ready") === "true");
    };

    const onReady = () => setWebglReady(true);
    const onFallback = () => setWebglReady(false);

    host.addEventListener("ascii-logo-ready", onReady);
    host.addEventListener("ascii-logo-fallback", onFallback);

    const observer = new MutationObserver(syncReadyState);
    observer.observe(host, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-ready"],
    });

    syncReadyState();

    return () => {
      host.removeEventListener("ascii-logo-ready", onReady);
      host.removeEventListener("ascii-logo-fallback", onFallback);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!supportsWebGL2()) return;

    let cancelled = false;
    const load = () => {
      import("@/lib/ascii-logo")
        .then(({ registerAsciiLogoElement }) => {
          if (cancelled) return;
          registerAsciiLogoElement();
          setMountedElement(true);
        })
        .catch(() => {
          // Keep static SVG fallback silently on failure
        });
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 600 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    } else {
      const timer = globalThis.setTimeout(load, 80);
      return () => {
        cancelled = true;
        globalThis.clearTimeout(timer);
      };
    }
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[290px] sm:max-w-[360px] lg:max-w-[440px]">
      {/* Architectural frame around the signature 3D ASCII solid */}
      <div
        ref={hostRef}
        className="relative aspect-square w-full border border-ink bg-paper-card/90 p-3 sm:p-4"
      >
        <PixelCluster
          variant="corner-tl"
          className="pointer-events-none absolute top-2 left-2 z-10"
        />
        <PixelCluster
          variant="corner-br"
          className="pointer-events-none absolute right-2 bottom-2 z-10"
        />

        {/* Static zero-CLS fallback layer — fades out once first WebGL frame paints */}
        <div
          aria-hidden={webglReady ? "true" : undefined}
          className={`absolute inset-4 flex items-center justify-center transition-opacity duration-300 ${
            webglReady ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <AsciiMarkFallback />
        </div>

        {/* Ported GPU ASCII custom element */}
        {mountedElement &&
          createElement(
            "ascii-logo",
            {
              role: "img",
              tabIndex: 0,
              "aria-label":
                "Interactive 3D pixel cursor rendered in ASCII characters. Drag with pointer or use arrow keys to rotate, R to reset.",
              className:
                "h-full w-full focus-visible:outline-2 focus-visible:outline-accent",
            },
            createElement("canvas", {
              "data-logo-canvas": "",
              className: "is-hidden",
            })
          )}
      </div>

      {/* Subtle technical specimen bar */}
      <div className="mt-2.5 flex items-center justify-between gap-2 px-0.5 font-mono text-[11px] text-ink-subtle">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 ${webglReady ? "bg-accent" : "bg-line-strong"}`}
          />
          <span>FIG.01 // ASCII VOXEL CURSOR</span>
        </span>
        <span className="hidden sm:inline">DRAG OR ARROW KEYS</span>
        <span className="sm:hidden">SWIPE TO ORBIT</span>
      </div>
    </div>
  );
}
