"use client";

import { AnimatedPxlKitIcon } from "@pxlkit/core";
import { ScanSweep } from "@pxlkit/effects";

interface PixelScanLoaderProps {
  progress: number;
  statusLabel: string;
}

/**
 * Centered HUD scan status + segmented pixel progress bar displayed over the
 * full-screen pixel scan animation during initial resource preload.
 */
export function PixelScanLoader({
  progress,
  statusLabel,
}: PixelScanLoaderProps) {
  return (
    <div
      data-testid="pixel-scan-loader"
      className="flex flex-col items-center gap-3 select-none"
    >
      <div
        aria-hidden="true"
        className="drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]"
      >
        <AnimatedPxlKitIcon icon={ScanSweep} size={28} fps={10} />
      </div>

      {/* Pixel Progress Meter + Status */}
      <div className="flex w-60 flex-col items-center gap-2 sm:w-72">
        <div className="flex w-full items-center justify-between font-mono text-xs tracking-widest text-retro-text">
          <span>{statusLabel}</span>
          <span className="font-semibold text-retro-cyan">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="flex h-3 w-full gap-0.5 border-2 border-retro-border-strong bg-[#080D18]/90 p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          {Array.from({ length: 14 }).map((_, idx) => {
            const threshold = ((idx + 1) / 14) * 100;
            const active = progress >= threshold - 4;
            return (
              <span
                key={idx}
                className="flex-1 transition-colors duration-75"
                style={{
                  backgroundColor: active
                    ? idx >= 10
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
