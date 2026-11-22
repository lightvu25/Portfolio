"use client";

import { PxlKitIcon } from "@pxlkit/core";
import { ArrowRight } from "@pxlkit/ui";
import { PixelButton } from "@pxlkit/ui-kit/actions";
import { useToast } from "@pxlkit/ui-kit/toast";
import { useState } from "react";

import { gameProfile } from "@/content/profile";
import { AsciiQuangStage } from "./AsciiQuangStage";
import {
  CvFileAssetIcon,
  EmailAssetIcon,
  FacebookAssetIcon,
  GitHubAssetIcon,
  LinkedInAssetIcon,
  ZaloAssetIcon,
} from "./AssetLinkIcons";
import { HeroIntroPixelBackdrop } from "./HeroIntroPixelBackdrop";
import { RoleWithInvaders, SparkleNameHeading } from "./HeroPixelEffects";
import { HeroSpaceBackdrop } from "./HeroSpaceBackdrop";
import { useMagneticScroll } from "./MagneticScroller";

function normalizeLocalAssetUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return encodeURI(withLeadingSlash);
}

function normalizePdfHref(rawUrl: string): string {
  const normalized = normalizeLocalAssetUrl(rawUrl);
  if (!normalized || /^https?:\/\//i.test(normalized)) return normalized;
  return normalized.toLowerCase().endsWith(".pdf")
    ? normalized
    : `${normalized}.pdf`;
}

function normalizePdfFileName(rawName: string): string {
  const trimmed = rawName.trim() || "CV.pdf";
  return trimmed.toLowerCase().endsWith(".pdf") ? trimmed : `${trimmed}.pdf`;
}

export function GameHero({
  onWebglState,
}: {
  onWebglState?: (state: "ready" | "fallback") => void;
}) {
  const { toast } = useToast();
  const { goToSection } = useMagneticScroll();
  const [copiedKey, setCopiedKey] = useState<"zalo" | "email" | null>(null);

  const { avatarConfig } = gameProfile;
  const resolvedAvatarSrc = normalizeLocalAssetUrl(gameProfile.avatarSrc);
  const resolvedCvUrl = normalizePdfHref(gameProfile.cvUrl);
  const resolvedCvFileName = normalizePdfFileName(gameProfile.cvFileName);

  const handleCopy = async (kind: "zalo" | "email", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(kind);
      window.setTimeout(() => setCopiedKey(null), 1800);
      toast.success(
        kind === "zalo" ? "Zalo number copied!" : "Email copied!",
        value
      );
    } catch {
      toast.info(
        kind === "zalo" ? "Contact Zalo:" : "Contact Email:",
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

      {/* ── BOTTOM 50%: AVATAR + 6 SYMMETRIC BUTTONS ON AVATAR ROW, TITLE BELOW ── */}
      <div className="relative z-20 flex flex-1 flex-col justify-between bg-[#060911]/95 px-3.5 pt-0 pb-3 sm:px-6 sm:pb-4 lg:px-10 lg:pb-5">
        <HeroIntroPixelBackdrop />

        <div className="relative z-20 mx-auto grid w-full max-w-[1380px] flex-1 grid-cols-1 content-evenly gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-center lg:gap-x-8 lg:gap-y-2">
          {/* 1. Centered Pixel-Bordered Avatar straddling the 50% horizon line (Row 1, Center) */}
          <div
            className="hero-avatar-stage relative z-30 order-1 flex flex-col items-center lg:col-start-2 lg:row-start-1"
            style={
              {
                "--ava-size-mobile": `${avatarConfig.mobileSizePx}px`,
                "--ava-size-tablet": `${avatarConfig.tabletSizePx}px`,
                "--ava-size-desktop": `${avatarConfig.desktopSizePx}px`,
              } as React.CSSProperties
            }
          >
            <div className="pxl-corner-md relative border-2 border-[#00F0FF] bg-[#04060A] p-1.5 shadow-[0_0_28px_rgba(0,240,255,0.45)]">
              <div className="hero-avatar-box relative overflow-hidden bg-[#080E1A]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvedAvatarSrc}
                  alt={gameProfile.avatarAlt}
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: avatarConfig.objectPosition,
                    transformOrigin: avatarConfig.objectPosition,
                    transform: `scale(${avatarConfig.zoom})`,
                  }}
                />
              </div>
              {/* Decorative Glowing Corner Pixels */}
              <span
                aria-hidden="true"
                className="absolute -top-1 -left-1 h-2.5 w-2.5 bg-[#00FF88] shadow-[0_0_8px_#00FF88]"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-[#FFB800] shadow-[0_0_8px_#FFB800]"
              />
            </div>
          </div>

          {/* 2. Left 3 Action Buttons — aligned on the Avatar row on desktop (Row 1, Left) */}
          <div
            data-hero-links-left=""
            className="order-3 flex w-full items-center lg:col-start-1 lg:row-start-1 lg:max-w-[460px] lg:justify-self-end"
          >
            <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
              <PixelButton
                asChild
                tone="cyan"
                variant="soft"
                size="md"
                className="hero-action-btn hero-action-cyan w-full font-semibold tracking-wide"
              >
                <a
                  href={gameProfile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook (opens GitHub)"
                >
                  <span aria-hidden="true" className="inline-flex shrink-0">
                    <FacebookAssetIcon size={18} />
                  </span>
                  <span>FB</span>
                </a>
              </PixelButton>

              <PixelButton
                asChild
                tone="cyan"
                variant="soft"
                size="md"
                className="hero-action-btn hero-action-cyan w-full font-semibold tracking-wide"
              >
                <a
                  href={gameProfile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn (opens GitHub)"
                >
                  <span aria-hidden="true" className="inline-flex shrink-0">
                    <LinkedInAssetIcon size={18} />
                  </span>
                  <span>LinkedIn</span>
                </a>
              </PixelButton>

              <PixelButton
                asChild
                tone="green"
                variant="solid"
                size="md"
                className="hero-action-btn hero-action-green w-full font-bold tracking-wide"
              >
                <a
                  href={gameProfile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                >
                  <span aria-hidden="true" className="inline-flex shrink-0">
                    <GitHubAssetIcon size={18} />
                  </span>
                  <span>GitHub</span>
                </a>
              </PixelButton>
            </div>
          </div>

          {/* 3. Right 3 Action Buttons — aligned on the Avatar row on desktop (Row 1, Right) */}
          <div
            data-hero-links-right=""
            className="order-4 flex w-full items-center lg:col-start-3 lg:row-start-1 lg:max-w-[460px] lg:justify-self-start"
          >
            <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
              <PixelButton
                type="button"
                tone="pink"
                variant="soft"
                size="md"
                className="hero-action-btn hero-action-pink w-full font-semibold tracking-wide"
                iconLeft={
                  <span aria-hidden="true" className="inline-flex shrink-0">
                    <ZaloAssetIcon size={18} />
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
                size="md"
                className="hero-action-btn hero-action-gold w-full font-semibold tracking-wide"
                iconLeft={
                  <span aria-hidden="true" className="inline-flex shrink-0">
                    <EmailAssetIcon size={18} />
                  </span>
                }
                onClick={() => void handleCopy("email", gameProfile.emailValue)}
              >
                {copiedKey === "email" ? "Copied!" : "Email"}
              </PixelButton>

              <PixelButton
                asChild
                tone="green"
                variant="outline"
                size="md"
                className="hero-action-btn hero-action-mint w-full font-semibold tracking-wide"
              >
                <a
                  href={resolvedCvUrl}
                  download={resolvedCvFileName}
                  type="application/pdf"
                  aria-label="Download Vũ Minh Quang's CV"
                >
                  <span aria-hidden="true" className="inline-flex shrink-0">
                    <CvFileAssetIcon size={18} />
                  </span>
                  <span>CV</span>
                </a>
              </PixelButton>
            </div>
          </div>

          {/* 4. Centered Name & Role Stack tucked close beneath the Avatar + Buttons row */}
          <div className="order-2 flex flex-col items-center justify-center space-y-2 text-center sm:space-y-2.5 lg:col-span-3 lg:row-start-2 lg:self-start lg:pt-2">
            <SparkleNameHeading fullName={gameProfile.fullName} />

            <RoleWithInvaders role={gameProfile.role} />
          </div>
        </div>

        {/* Bottom Magnetic Scroll Prompt */}
        <div className="relative z-10 mt-2 flex justify-center">
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
