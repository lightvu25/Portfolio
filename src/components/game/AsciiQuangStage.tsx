"use client";

import { createElement, useEffect, useRef, useState } from "react";

import { useMagneticScroll } from "./MagneticScroller";

function supportsWebGL2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2"));
  } catch {
    return false;
  }
}

const FALLBACK_LETTERS: { char: string; rows: string[] }[] = [
  {
    char: "Q",
    rows: [
      " .@@@. ",
      "@@   @@",
      "@@   @@",
      "@@  .@@",
      "@@  @@@",
      " @@@@@.",
      "     @@",
    ],
  },
  {
    char: "U",
    rows: [
      "@@   @@",
      "@@   @@",
      "@@   @@",
      "@@   @@",
      "@@   @@",
      "@@   @@",
      " @@@@@ ",
    ],
  },
  {
    char: "A",
    rows: [
      "  @@@  ",
      " @@ @@ ",
      "@@   @@",
      "@@@@@@@",
      "@@   @@",
      "@@   @@",
      "@@   @@",
    ],
  },
  {
    char: "N",
    rows: [
      "@@   @@",
      "@@@  @@",
      "@@@@ @@",
      "@@ @@@@",
      "@@  @@@",
      "@@   @@",
      "@@   @@",
    ],
  },
  {
    char: "G",
    rows: [
      " .@@@@.",
      "@@   @@",
      "@@     ",
      "@@  @@@",
      "@@   @@",
      "@@   @@",
      " .@@@@.",
    ],
  },
];

export function AsciiQuangStage({
  onWebglState,
}: {
  onWebglState?: (state: "ready" | "fallback") => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const { bootComplete } = useMagneticScroll();
  const [mountedElement, setMountedElement] = useState(false);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    if (!supportsWebGL2()) {
      onWebglState?.("fallback");
      return;
    }

    let cancelled = false;
    import("@/lib/ascii-logo")
      .then(({ registerAsciiQuangElement }) => {
        if (cancelled) return;
        registerAsciiQuangElement();
        setMountedElement(true);
      })
      .catch(() => {
        if (!cancelled) onWebglState?.("fallback");
      });

    return () => {
      cancelled = true;
    };
  }, [onWebglState]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !mountedElement) return;

    const el = host.querySelector("ascii-quang") as
      | (HTMLElement & { revealWord?: () => void })
      | null;

    if (el?.getAttribute("data-ready") === "true") {
      setWebglReady(true);
      onWebglState?.("ready");
    }

    const onReady = () => {
      setWebglReady(true);
      onWebglState?.("ready");
    };
    const onFallback = () => {
      setWebglReady(false);
      onWebglState?.("fallback");
    };

    host.addEventListener("ascii-quang-ready", onReady);
    host.addEventListener("ascii-quang-fallback", onFallback);

    return () => {
      host.removeEventListener("ascii-quang-ready", onReady);
      host.removeEventListener("ascii-quang-fallback", onFallback);
    };
  }, [mountedElement, onWebglState]);

  useEffect(() => {
    if (!bootComplete || !hostRef.current) return;
    const el = hostRef.current.querySelector("ascii-quang") as
      | (HTMLElement & { revealWord?: () => void })
      | null;
    if (el) {
      el.setAttribute("revealed", "true");
      el.revealWord?.();
    }
  }, [bootComplete]);

  return (
    <div
      ref={hostRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      {/* Hidden exact Q position anchor used by BootSequence Q->QUANG flight */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative flex h-[62%] w-[82%] max-w-[1120px] items-center justify-between"
      >
        <div
          data-quang-q-anchor
          className="aspect-[9/11] h-full max-h-[210px] w-[17%]"
        />
      </div>

      {/* Crisp static SVG ASCII fallback when WebGL2 is absent or before WebGL paints */}
      <div
        aria-hidden={webglReady ? "true" : undefined}
        className={`pointer-events-none absolute inset-0 flex items-center justify-center px-4 transition-opacity duration-300 ${
          webglReady ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="grid w-full max-w-[1080px] grid-cols-5 gap-2 sm:gap-5">
          {FALLBACK_LETTERS.map((item) => (
            <pre
              key={item.char}
              aria-hidden="true"
              className="text-center font-mono text-[8px] leading-[1.05] font-bold text-[#00F0FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.6)] sm:text-[13px] md:text-[16px] lg:text-[20px]"
            >
              {item.rows.join("\n")}
            </pre>
          ))}
        </div>
      </div>

      {/* Full-width WebGL2 GPU ASCII 3D Word "QUANG" */}
      {mountedElement &&
        createElement(
          "ascii-quang",
          {
            role: "img",
            revealed: bootComplete ? "true" : "false",
            "aria-label":
              "Chữ QUANG 3D bằng ký tự ASCII phát sáng neon — di chuột để nghiêng và làm nổi bật từng chữ cái",
            className: "absolute inset-0 h-full w-full",
          },
          createElement("canvas", {
            "data-quang-canvas": "",
            className: "is-hidden",
          })
        )}
    </div>
  );
}
