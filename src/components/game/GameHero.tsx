"use client";

import { AnimatedPxlKitIcon, PxlKitIcon } from "@pxlkit/core";
import { FireSword, Trophy } from "@pxlkit/gamification";
import { ArrowRight, ChainLink, Copy, Download, ExternalLink } from "@pxlkit/ui";
import { PixelButton } from "@pxlkit/ui-kit/actions";
import { PixelBadge, PixelCard } from "@pxlkit/ui-kit/data-display";
import { useToast } from "@pxlkit/ui-kit/toast";
import { useState } from "react";

import { gameProfile } from "@/content/profile";
import { AsciiQuangStage } from "./AsciiQuangStage";
import { HeroSpaceBackdrop } from "./HeroSpaceBackdrop";
import { useMagneticScroll } from "./MagneticScroller";

export function GameHero({
  onWebglState,
}: {
  onWebglState?: (state: "ready" | "fallback") => void;
}) {
  const { toast } = useToast();
  const { goToSection } = useMagneticScroll();
  const [copiedKey, setCopiedKey] = useState<"zalo" | "email" | null>(null);

  const handleCopy = async (kind: "zalo" | "email", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(kind);
      window.setTimeout(() => setCopiedKey(null), 1800);
      toast.success(
        kind === "zalo" ? "Đã copy số Zalo!" : "Đã copy Email!",
        value
      );
    } catch {
      toast.info(
        kind === "zalo" ? "Zalo liên hệ:" : "Email liên hệ:",
        value
      );
    }
  };

  return (
    <section
      id="hero"
      data-snap-section="0"
      className="relative z-10 flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#04060A] lg:h-[100dvh]"
    >
      {/* ── TOP 50%: FULL-WIDTH 3D ASCII "QUANG" STAGE ── */}
      <div className="relative h-[28dvh] w-full shrink-0 sm:h-[40dvh] lg:h-[50dvh]">
        <HeroSpaceBackdrop />
        <div className="relative z-10 h-full w-full">
          <AsciiQuangStage onWebglState={onWebglState} />
        </div>
      </div>

      {/* ── 50% NEON PIXEL HORIZON LINE ── */}
      <div
        aria-hidden="true"
        className="relative z-20 h-[2px] w-full bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_16px_#00F0FF]"
      />

      {/* ── BOTTOM 50%: PIXEL AVATAR AT CENTER + SYMMETRIC 2-SIDE PROFILE & LINKS ── */}
      <div className="relative z-20 flex flex-1 flex-col justify-between bg-[#060911]/95 px-3.5 pt-0 pb-3 sm:px-6 sm:pb-4 lg:px-10 lg:pb-5">
        {/* Centered Pixel-Bordered Avatar straddling the 50% horizon line */}
        <div className="relative z-30 -mt-9 flex flex-col items-center sm:-mt-13 lg:-mt-16">
          <div className="pxl-corner-md relative border-2 border-[#00F0FF] bg-[#04060A] p-1 shadow-[0_0_26px_rgba(0,240,255,0.42)]">
            <div className="relative h-16 w-16 overflow-hidden bg-[#080E1A] sm:h-24 sm:w-24 lg:h-28 lg:w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gameProfile.avatarSrc}
                alt={gameProfile.avatarAlt}
                className="h-full w-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            {/* Decorative Glowing Corner Pixels */}
            <span
              aria-hidden="true"
              className="absolute -top-1 -left-1 h-2 w-2 bg-[#00FF88] shadow-[0_0_8px_#00FF88]"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-1 -right-1 h-2 w-2 bg-[#FFB800] shadow-[0_0_8px_#FFB800]"
            />
          </div>
        </div>

        {/* Symmetric 3-Column HUD Grid */}
        <div className="mx-auto mt-1.5 grid w-full max-w-[1380px] flex-1 items-center gap-2.5 sm:mt-2 sm:gap-4 lg:-mt-6 lg:grid-cols-12 lg:gap-6">
          {/* Center Bio Column (First on mobile for natural reading, middle on desktop) */}
          <div className="order-1 flex flex-col items-center space-y-1 text-center sm:space-y-2 lg:order-2 lg:col-span-4 lg:pt-8">
            <PixelBadge
              tone="green"
              size="sm"
              iconLeft={
                <span aria-hidden="true" className="inline-flex">
                  <PxlKitIcon icon={Trophy} size={12} />
                </span>
              }
            >
              {gameProfile.role}
            </PixelBadge>

            <h1 className="font-display text-2xl font-bold tracking-wide text-[#ECF4FF] drop-shadow-[0_0_12px_rgba(0,240,255,0.35)] sm:text-4xl lg:text-[2.65rem]">
              {gameProfile.fullName}
            </h1>

            <p className="font-mono text-[11px] tracking-wider text-retro-cyan sm:text-xs">
              {gameProfile.tagline}
            </p>

            <p className="max-w-md text-[11px] leading-snug text-retro-muted sm:text-sm sm:leading-relaxed">
              {gameProfile.bio}
            </p>
          </div>

          {/* Left Column: FB / LinkedIn / GitHub (all open GitHub) + Engine HUD Card */}
          <div className="order-2 flex flex-col gap-3 lg:order-1 lg:col-span-4 lg:items-start">
            <div className="grid w-full grid-cols-3 gap-2">
              <PixelButton asChild tone="cyan" variant="soft" size="sm">
                <a
                  href={gameProfile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook (mở GitHub)"
                >
                  <span aria-hidden="true" className="inline-flex">
                    <PxlKitIcon icon={ChainLink} size={14} />
                  </span>
                  <span>FB</span>
                </a>
              </PixelButton>

              <PixelButton asChild tone="cyan" variant="soft" size="sm">
                <a
                  href={gameProfile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn (mở GitHub)"
                >
                  <span aria-hidden="true" className="inline-flex">
                    <PxlKitIcon icon={ExternalLink} size={14} />
                  </span>
                  <span>LinkedIn</span>
                </a>
              </PixelButton>

              <PixelButton asChild tone="green" variant="solid" size="sm">
                <a
                  href={gameProfile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                >
                  <span aria-hidden="true" className="inline-flex">
                    <PxlKitIcon icon={ExternalLink} size={14} />
                  </span>
                  <span>GitHub</span>
                </a>
              </PixelButton>
            </div>

            <PixelCard
              title={gameProfile.hudLeftTitle}
              tone="cyan"
              padding="sm"
              icon={
                <span aria-hidden="true" className="inline-flex">
                  <PxlKitIcon icon={Trophy} size={15} />
                </span>
              }
              className="w-full"
            >
              <dl className="space-y-1 font-mono text-xs">
                {gameProfile.hudLeftStats.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-baseline justify-between gap-2"
                  >
                    <dt className="shrink-0 text-retro-cyan">{item.label}:</dt>
                    <dd className="truncate text-right text-retro-text">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </PixelCard>
          </div>

          {/* Right Column: Zalo (copy) / Email (copy) / CV (download) + Systems HUD Card */}
          <div className="order-3 flex flex-col gap-3 lg:order-3 lg:col-span-4 lg:items-end">
            <div className="grid w-full grid-cols-3 gap-2">
              <PixelButton
                type="button"
                tone="pink"
                variant="soft"
                size="sm"
                iconLeft={
                  <span aria-hidden="true" className="inline-flex">
                    <PxlKitIcon icon={Copy} size={14} />
                  </span>
                }
                onClick={() => void handleCopy("zalo", gameProfile.zaloValue)}
              >
                {copiedKey === "zalo" ? "Copied!" : "Zalo"}
              </PixelButton>

              <PixelButton
                type="button"
                tone="gold"
                variant="soft"
                size="sm"
                iconLeft={
                  <span aria-hidden="true" className="inline-flex">
                    <PxlKitIcon icon={Copy} size={14} />
                  </span>
                }
                onClick={() => void handleCopy("email", gameProfile.emailValue)}
              >
                {copiedKey === "email" ? "Copied!" : "Email"}
              </PixelButton>

              <PixelButton asChild tone="green" variant="outline" size="sm">
                <a
                  href={gameProfile.cvUrl}
                  download={gameProfile.cvFileName}
                  aria-label="Tải xuống CV của Vũ Minh Quang"
                >
                  <span aria-hidden="true" className="inline-flex">
                    <PxlKitIcon icon={Download} size={14} />
                  </span>
                  <span>CV</span>
                </a>
              </PixelButton>
            </div>

            <PixelCard
              title={gameProfile.hudRightTitle}
              tone="green"
              padding="sm"
              icon={
                <span aria-hidden="true" className="inline-flex">
                  <AnimatedPxlKitIcon icon={FireSword} size={15} fps={6} />
                </span>
              }
              className="w-full"
            >
              <dl className="space-y-1 font-mono text-xs">
                {gameProfile.hudRightStats.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-baseline justify-between gap-2"
                  >
                    <dt className="shrink-0 text-retro-green">{item.label}:</dt>
                    <dd className="truncate text-right text-retro-text">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </PixelCard>
          </div>
        </div>

        {/* Bottom Magnetic Scroll Prompt */}
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => goToSection(1)}
            className="inline-flex items-center gap-2 border border-retro-border-strong bg-retro-surface/70 px-3 py-1 font-mono text-[11px] tracking-widest text-retro-cyan transition-colors hover:border-retro-cyan hover:text-white"
          >
            <span>SCROLL TO PROJECTS</span>
            <span aria-hidden="true" className="inline-flex">
              <PxlKitIcon
                icon={ArrowRight}
                size={12}
                className="rotate-90"
              />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
