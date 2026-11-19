"use client";

import { PxlKitIcon } from "@pxlkit/core";
import { ExternalLink, Play } from "@pxlkit/ui";
import { PixelButton } from "@pxlkit/ui-kit/actions";
import { PixelBadge } from "@pxlkit/ui-kit/data-display";
import { useEffect, useRef, useState } from "react";

import type { GameProject } from "@/content/games";
import { useMagneticScroll } from "./MagneticScroller";

function PixelBullet({ color }: { color: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="mt-1.5 shrink-0"
      style={{ filter: `drop-shadow(0 0 5px ${color})` }}
    >
      <rect x="2" y="1" width="4" height="6" fill={color} />
      <rect x="1" y="2" width="6" height="4" fill={color} />
      <rect x="3" y="3" width="2" height="2" fill="#FFFFFF" />
    </svg>
  );
}

export function GameProjectStage({
  game,
  stageIndex,
  totalGames,
}: {
  game: GameProject;
  stageIndex: number;
  totalGames: number;
}) {
  const { activeIndex } = useMagneticScroll();
  const isActive = activeIndex === stageIndex;

  const [mediaIdx, setMediaIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaContainerRef = useRef<HTMLDivElement | null>(null);

  const activeMedia = game.media[mediaIdx] ?? game.media[0];
  const hasVideoFile =
    activeMedia?.type === "video" && Boolean(activeMedia.src?.trim());

  // Auto-play gameplay demo ONLY while this stage is active; pause immediately on exit
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !hasVideoFile) return;

    if (isActive) {
      vid.play().catch(() => {
        // Ignore browser autoplay block if unmuted manually
      });
    } else {
      vid.pause();
    }
  }, [isActive, hasVideoFile, mediaIdx]);

  const handleFullscreen = () => {
    const el = mediaContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (el.requestFullscreen) {
      void el.requestFullscreen();
    }
  };

  return (
    <section
      id={game.id}
      data-snap-section={stageIndex}
      style={
        {
          "--game-accent": game.theme.accentHex,
        } as React.CSSProperties
      }
      className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-between px-4 py-6 sm:px-8 sm:py-8 lg:h-[100dvh] lg:px-12 lg:py-9"
    >
      {/* Top Status Bar (padded right on desktop/mobile so [CRT: ON/OFF] never collides) */}
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="flex items-center justify-between gap-4 border-b border-white/15 pr-24 pb-2.5 font-mono text-xs tracking-wider text-retro-muted sm:pr-28">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5"
              style={{
                backgroundColor: game.theme.accentHex,
                boxShadow: `0 0 8px ${game.theme.accentHex}`,
              }}
            />
            <span className="text-retro-text">
              Game Projects // {game.index} — 0{totalGames}
            </span>
          </div>
          <span className="hidden sm:inline">
            {game.engine} · {game.year}
          </span>
        </div>
      </div>

      {/* Main Two-Column Showcase (Left: Title + Pixel-bullet Description + CTAs | Right: Video Demo + Thumbs) */}
      <div className="mx-auto my-auto grid w-full max-w-[1440px] items-center gap-6 py-4 lg:grid-cols-12 lg:gap-10">
        {/* LEFT COLUMN: Title, Badges, Long Scrollable Bullet Description, Buttons */}
        <div className="flex min-h-0 flex-col justify-between space-y-4 lg:col-span-5 lg:max-h-[76dvh]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <PixelBadge tone={game.theme.pxlTone} size="sm">
                {game.genre}
              </PixelBadge>
              <PixelBadge tone="neutral" size="sm">
                {game.engine}
              </PixelBadge>
            </div>

            <h2
              className="font-display text-3xl leading-[1.02] font-bold tracking-wide text-white sm:text-4xl lg:text-5xl"
              style={{
                textShadow: `0 0 18px ${game.theme.accentHex}55`,
              }}
            >
              {game.title}
            </h2>

            <p
              className="font-mono text-xs tracking-wider uppercase"
              style={{ color: game.theme.accentHex }}
            >
              {game.subtitle} — {game.role}
            </p>
          </div>

          {/* Scrollable Long Description Box with Custom Pixel Bullets */}
          <div
            data-inner-scroll
            tabIndex={0}
            aria-label={`Chi tiết tính năng của ${game.title}`}
            className="pixel-scrollbar max-h-[34dvh] space-y-3 overflow-y-auto border-l-2 bg-[#04060A]/65 py-2 pr-3 pl-4 backdrop-blur-xs lg:max-h-[42dvh]"
            style={{ borderColor: `${game.theme.accentHex}88` }}
          >
            <p className="text-sm leading-relaxed text-[#D8E5FA] sm:text-[15px]">
              {game.summary}
            </p>

            <ul className="space-y-2.5 pt-1 text-xs leading-relaxed text-[#BACCE8] sm:text-sm">
              {game.features.map((feat, fIdx) => (
                <li key={fIdx} className="flex items-start gap-2.5">
                  <PixelBullet color={game.theme.accentHex} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons at bottom-left */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <PixelButton asChild tone={game.theme.pxlTone} variant="solid" size="md">
              <a
                href={game.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{game.liveLabel}</span>
                <PxlKitIcon icon={ExternalLink} size={14} />
              </a>
            </PixelButton>

            <PixelButton asChild tone="neutral" variant="outline" size="md">
              <a
                href={game.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{game.sourceLabel}</span>
                <PxlKitIcon icon={ExternalLink} size={13} />
              </a>
            </PixelButton>
          </div>
        </div>

        {/* RIGHT COLUMN: Gameplay Video Monitor + Bottom Thumbnail Strip */}
        <div className="flex flex-col gap-3 lg:col-span-7">
          <div
            ref={mediaContainerRef}
            className="pxl-corner-md relative overflow-hidden border-2 bg-[#030509]"
            style={{
              borderColor: game.theme.accentHex,
              boxShadow: `0 0 32px ${game.theme.accentHex}2A`,
            }}
          >
            {/* Clean Top Monitor Bezel Bar (never covers gameplay footage) */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#070B14] px-3 py-1.5 font-mono text-[10px] text-white">
              <span className="flex items-center gap-1.5 truncate">
                <span aria-hidden="true" className="inline-flex">
                  <PxlKitIcon icon={Play} size={11} />
                </span>
                <span>{activeMedia?.label}</span>
              </span>

              <div className="flex shrink-0 items-center gap-1.5">
                {hasVideoFile && (
                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    className="border border-white/25 bg-[#04060A] px-2 py-0.5 tracking-wider text-white hover:border-white"
                  >
                    {muted ? "SOUND: OFF" : "SOUND: ON"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleFullscreen}
                  aria-label="Phóng to toàn màn hình"
                  className="border border-white/25 bg-[#04060A] px-2 py-0.5 tracking-wider text-white hover:border-white"
                >
                  FULLSCREEN
                </button>
              </div>
            </div>

            <div className="relative aspect-video w-full bg-[#050810]">
              {hasVideoFile ? (
                <video
                  ref={videoRef}
                  key={activeMedia.src}
                  src={activeMedia.src}
                  poster={activeMedia.poster}
                  muted={muted}
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeMedia?.poster}
                  alt={activeMedia?.caption || game.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Bottom caption bar */}
            <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-[#070B14] px-3 py-1.5 font-mono text-[11px] text-retro-muted">
              <span className="truncate">{activeMedia?.caption}</span>
              <span style={{ color: game.theme.accentHex }}>
                {mediaIdx + 1}/{game.media.length}
              </span>
            </div>
          </div>

          {/* Bottom Thumbnail Strip (matches reference image) */}
          <div
            role="group"
            aria-label={`Chọn video hoặc ảnh gameplay của ${game.title}`}
            className="flex items-center gap-2.5 overflow-x-auto pb-1"
          >
            {game.media.map((item, idx) => {
              const selected = idx === mediaIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMediaIdx(idx)}
                  aria-pressed={selected}
                  className="group relative flex w-24 shrink-0 flex-col overflow-hidden border-2 bg-[#060910] text-left transition-transform hover:-translate-y-0.5 sm:w-28"
                  style={{
                    borderColor: selected
                      ? game.theme.accentHex
                      : "rgba(255,255,255,0.16)",
                    boxShadow: selected
                      ? `0 0 12px ${game.theme.accentHex}55`
                      : "none",
                  }}
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.poster}
                      alt={item.label}
                      className="h-full w-full object-cover opacity-85 group-hover:opacity-100"
                    />
                  </div>
                  <span
                    className="truncate px-1.5 py-0.5 font-mono text-[10px]"
                    style={{
                      color: selected ? game.theme.accentHex : "#94A3B8",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom margin spacer for clean vertical centering */}
      <div className="mx-auto flex w-full max-w-[1440px] justify-between font-mono text-[10px] text-white/35">
        <span>PIXEL STAGE // {game.id.toUpperCase()}</span>
        <span>SCROLL FOR NEXT</span>
      </div>
    </section>
  );
}
