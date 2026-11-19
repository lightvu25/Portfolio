"use client";

import { AnimatedPxlKitIcon, PxlKitIcon } from "@pxlkit/core";
import { GlowPulse, SparkBurst } from "@pxlkit/effects";
import { Copy } from "@pxlkit/ui";
import { PixelButton } from "@pxlkit/ui-kit/actions";
import { useToast } from "@pxlkit/ui-kit/toast";
import { useState } from "react";

import { gameProfile } from "@/content/profile";
import { FluidPixelBackdrop } from "./FluidPixelBackdrop";
import { useMagneticScroll } from "./MagneticScroller";

export function GameOutroFooter({ stageIndex }: { stageIndex: number }) {
  const { sections, goToSection } = useMagneticScroll();
  const { toast } = useToast();
  const [copied, setCopied] = useState<"email" | "zalo" | null>(null);

  const handleCopy = async (kind: "email" | "zalo", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
      toast.success(
        kind === "email" ? "Đã copy Email!" : "Đã copy số Zalo!",
        value
      );
    } catch {
      toast.info(
        kind === "email" ? "Email liên hệ:" : "Zalo liên hệ:",
        value
      );
    }
  };

  return (
    <section
      id="outro"
      data-snap-section={stageIndex}
      className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-[#04060A] lg:h-[100dvh]"
    >
      {/* Exclusive Fluid-Pixel Interactive Cursor Background */}
      <FluidPixelBackdrop />

      {/* ── CENTER OUTRO: THANK YOU FOR WATCHING + HIRE ME ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1160px] flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-8">
        <div className="mb-4 flex items-center gap-3">
          <AnimatedPxlKitIcon icon={SparkBurst} size={26} fps={8} />
          <span className="border border-retro-cyan/40 bg-retro-surface/80 px-3 py-1 font-mono text-xs tracking-[0.22em] text-retro-cyan uppercase">
            END OF REEL // STAGE CLEAR
          </span>
          <AnimatedPxlKitIcon icon={GlowPulse} size={26} fps={6} />
        </div>

        <p className="font-pixel-grid text-4xl leading-none font-bold tracking-[0.08em] text-[#ECF4FF] drop-shadow-[0_0_20px_rgba(0,240,255,0.55)] sm:text-6xl lg:text-7xl">
          THANK YOU FOR WATCHING
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 border-2 border-retro-border-strong bg-[#070B13]/85 px-6 py-6 backdrop-blur-sm sm:px-10 sm:py-8">
          <h2 className="font-display text-3xl font-bold tracking-wider text-[#00FF88] drop-shadow-[0_0_14px_rgba(0,255,136,0.45)] sm:text-5xl">
            Hire Me
          </h2>
          <p className="max-w-md text-xs leading-relaxed text-retro-muted sm:text-sm">
            Sẵn sàng hợp tác phát triển game 2D/3D, hệ thống gameplay, shader
            hoặc các dự án tương tác thời gian thực.
          </p>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-3.5">
            <PixelButton
              type="button"
              tone="cyan"
              variant="solid"
              size="lg"
              iconLeft={
                <span aria-hidden="true" className="inline-flex">
                  <PxlKitIcon icon={Copy} size={16} />
                </span>
              }
              onClick={() => void handleCopy("email", gameProfile.emailValue)}
            >
              {copied === "email" ? "Email Copied!" : "Copy Email"}
            </PixelButton>

            <PixelButton
              type="button"
              tone="green"
              variant="outline"
              size="lg"
              iconLeft={
                <span aria-hidden="true" className="inline-flex">
                  <PxlKitIcon icon={Copy} size={16} />
                </span>
              }
              onClick={() => void handleCopy("zalo", gameProfile.zaloValue)}
            >
              {copied === "zalo" ? "Zalo Copied!" : "Copy Zalo"}
            </PixelButton>
          </div>
        </div>
      </div>

      {/* ── 2-TIER FOOTER (Upper: Name + Section Nav | Lower: Copyright + Contacts) ── */}
      <footer className="relative z-10 w-full border-t-2 border-retro-border-strong bg-[#04060A]/90 backdrop-blur-md">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
          {/* Upper Tier: Pixel Name Left + Page Section Navigation Right */}
          <div className="flex flex-col items-start justify-between gap-4 border-b border-retro-border/80 py-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-3 w-3 bg-[#00FF88] shadow-[0_0_10px_#00FF88]"
              />
              <span className="font-pixel-grid text-2xl font-bold tracking-wider text-[#ECF4FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.4)] sm:text-3xl">
                {gameProfile.fullName}
              </span>
            </div>

            <nav
              aria-label="Điều hướng phần trang"
              className="flex flex-wrap items-center gap-2"
            >
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => goToSection(sec.index)}
                  className="border border-retro-border bg-retro-surface/70 px-2.5 py-1 font-mono text-xs text-retro-muted transition-colors hover:border-retro-cyan hover:text-retro-cyan"
                >
                  {sec.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Lower Tier: Copyright Left + Contact Details Right (No link to /web-service) */}
          <div className="flex flex-col items-start justify-between gap-2 py-4 font-mono text-xs text-retro-muted sm:flex-row sm:items-center">
            <p>{gameProfile.copyrightNotice}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Email: {gameProfile.emailValue}</span>
              <span>Zalo: {gameProfile.zaloValue}</span>
              <a
                href={gameProfile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-retro-cyan underline underline-offset-4 hover:text-white"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
