"use client";

import { AnimatedPxlKitIcon } from "@pxlkit/core";
import { ScanSweep } from "@pxlkit/effects";

interface PixelScanLoaderProps {
  progress: number;
  statusLabel: string;
}

/**
 * Retro pixel-scan preloader widget inspired by `LOADER-SCAN_PREVIEW.TSX`
 * paired with `@pxlkit/effects` `ScanSweep`.
 */
export function PixelScanLoader({
  progress,
  statusLabel,
}: PixelScanLoaderProps) {
  return (
    <div
      data-testid="pixel-scan-loader"
      className="flex flex-col items-center gap-4 select-none"
    >
      {/* Scan Card (matching reference LOADER-SCAN box) */}
      <div className="pxl-corner-sm relative flex h-24 w-44 items-center justify-center overflow-hidden border-2 border-[#3A4358] bg-[#0B0E14] shadow-[0_0_28px_rgba(0,240,255,0.16)] sm:h-28 sm:w-52">
        {/* Horizontal CRT scanline stripes inside loader */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 5px)",
          }}
        />

        {/* Animated Pixel Scan Beam */}
        <div
          aria-hidden="true"
          data-scan-beam
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[#FFB800] shadow-[0_0_12px_#FFB800,0_2px_16px_rgba(0,255,136,0.55)]"
        />

        <div className="relative z-10 flex items-center gap-2.5 px-3">
          <AnimatedPxlKitIcon icon={ScanSweep} size={22} fps={10} />
          <span className="font-mono text-sm font-bold tracking-[0.28em] text-[#ECF4FF]">
            LOAD
          </span>
        </div>
      </div>

      {/* Pixel Progress Meter + Status */}
      <div className="flex w-44 flex-col items-center gap-1.5 sm:w-52">
        <div className="flex w-full items-center justify-between font-mono text-[11px] tracking-widest text-retro-muted">
          <span>{statusLabel}</span>
          <span className="text-retro-cyan">{Math.round(progress)}%</span>
        </div>
        <div className="flex h-2.5 w-full gap-0.5 border border-retro-border-strong bg-retro-surface p-0.5">
          {Array.from({ length: 12 }).map((_, idx) => {
            const threshold = ((idx + 1) / 12) * 100;
            const active = progress >= threshold - 4;
            return (
              <span
                key={idx}
                className="flex-1 transition-colors duration-75"
                style={{
                  backgroundColor: active
                    ? idx >= 9
                      ? "#00FF88"
                      : "#00F0FF"
                    : "#161E31",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
