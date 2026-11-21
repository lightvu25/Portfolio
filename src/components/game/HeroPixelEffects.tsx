"use client";

import { AnimatedPxlKitIcon, type AnimatedPxlKitData } from "@pxlkit/core";
import { Twinkle } from "@pxlkit/effects";

/**
 * Classic 2-frame 16x16 Space Invader arcade alien sprite (`👾`)
 * styled in neon retro purple/magenta/cyan for the Role flanking badges.
 */
const SpaceInvaderAlien: AnimatedPxlKitData = {
  name: "space-invader-alien",
  size: 16,
  category: "gamification",
  palette: {
    P: "#B86BFF",
    H: "#F0ABFC",
    C: "#00F0FF",
  },
  frames: [
    {
      grid: [
        "................",
        "....HH....HH....",
        ".....PP..PP.....",
        "....PPPPPPPP....",
        "...PPPPPPPPPP...",
        "..PPCCPPPPCCPP..",
        "..PPCCPPPPCCPP..",
        "..PPPPPPPPPPPP..",
        ".PPPPPPPPPPPPPP.",
        ".PP.PPPPPPPP.PP.",
        ".PP.PPPPPPPP.PP.",
        "....PP....PP....",
        "..PP........PP..",
        "................",
        "................",
        "................",
      ],
    },
    {
      grid: [
        "................",
        "....HH....HH....",
        ".....PP..PP.....",
        ".HH.PPPPPPPP.HH.",
        ".PP.PPPPPPPP.PP.",
        ".PPPCCPPPPCCPPP.",
        ".PPPCCPPPPCCPPP.",
        "..PPPPPPPPPPPP..",
        "...PPPPPPPPPP...",
        "....PPPPPPPP....",
        "....PP....PP....",
        "...PP......PP...",
        "....PP....PP....",
        "................",
        "................",
        "................",
      ],
    },
  ],
  frameDuration: 340,
  loop: true,
  trigger: "loop",
  tags: ["alien", "invader", "arcade", "pixel", "animated"],
  author: "portfolio",
};

function PixelGlintStar({
  color,
  size = 12,
  delay = "0ms",
  className = "",
}: {
  color: string;
  size?: number;
  delay?: string;
  className?: string;
}) {
  return (
    <svg
      data-name-sparkle=""
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      className={`animate-pixel-sparkle pointer-events-none absolute ${className}`}
      style={{
        animationDelay: delay,
        filter: `drop-shadow(0 0 6px ${color})`,
      }}
    >
      <rect x="3" y="0" width="2" height="8" fill={color} />
      <rect x="0" y="3" width="8" height="2" fill={color} />
      <rect x="3" y="3" width="2" height="2" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Background-free neon Role display flanked by animated 👾 alien sprites on both sides,
 * scaled just beneath the main name heading.
 */
export function RoleWithInvaders({ role }: { role: string }) {
  return (
    <div className="inline-flex items-center justify-center gap-2.5 sm:gap-3.5">
      <span
        data-role-invader="left"
        aria-hidden="true"
        className="inline-flex shrink-0 drop-shadow-[0_0_10px_rgba(184,107,255,0.65)]"
      >
        <AnimatedPxlKitIcon
          icon={SpaceInvaderAlien}
          size={30}
          fps={3}
          className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
        />
      </span>

      <p
        data-hero-role=""
        className="font-display text-2xl leading-none font-bold tracking-wider text-[#00FF88] drop-shadow-[0_0_14px_rgba(0,255,136,0.48)] sm:text-4xl lg:text-[2.35rem] xl:text-[2.6rem]"
      >
        {role}
      </p>

      <span
        data-role-invader="right"
        aria-hidden="true"
        className="inline-flex shrink-0 drop-shadow-[0_0_10px_rgba(184,107,255,0.65)]"
      >
        <AnimatedPxlKitIcon
          icon={SpaceInvaderAlien}
          size={30}
          fps={3}
          className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
        />
      </span>
    </div>
  );
}

/**
 * Display name heading with layered pixel twinkle & sparkle glints around the letters.
 */
export function SparkleNameHeading({ fullName }: { fullName: string }) {
  return (
    <div className="relative inline-flex items-center justify-center px-3 py-0.5 sm:px-5">
      <span
        data-name-sparkle=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 -left-2 opacity-90 drop-shadow-[0_0_8px_#00F0FF] sm:-left-3"
      >
        <AnimatedPxlKitIcon icon={Twinkle} size={18} fps={6} />
      </span>

      <PixelGlintStar
        color="#FFE066"
        size={11}
        delay="0ms"
        className="-top-1.5 right-3"
      />
      <PixelGlintStar
        color="#00F0FF"
        size={10}
        delay="380ms"
        className="top-1/2 -left-1.5 -translate-y-1/2"
      />
      <PixelGlintStar
        color="#00FF88"
        size={11}
        delay="760ms"
        className="-bottom-1 left-6"
      />

      <h1
        data-hero-name=""
        className="hero-name-sparkle font-display text-3xl leading-[1.02] font-bold tracking-wide text-[#ECF4FF] sm:text-5xl lg:text-[3.35rem] xl:text-[3.75rem]"
      >
        {fullName}
      </h1>

      <PixelGlintStar
        color="#FFFFFF"
        size={10}
        delay="540ms"
        className="top-1 -right-1"
      />
      <span
        data-name-sparkle=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -bottom-1.5 opacity-90 drop-shadow-[0_0_8px_#FFE066] sm:-right-3"
      >
        <AnimatedPxlKitIcon icon={Twinkle} size={18} fps={5} />
      </span>
    </div>
  );
}
