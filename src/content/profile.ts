export interface AvatarDisplayConfig {
  /** Portrait frame size (px) on mobile (< 640px) */
  mobileSizePx: number;
  /** Portrait frame size (px) on tablet (640px - 1023px) */
  tabletSizePx: number;
  /** Portrait frame size (px) on desktop (>= 1024px) */
  desktopSizePx: number;
  /** Inner image zoom scale inside the frame (1 = fit, 1.22 = 22% zoom) */
  zoom: number;
  /** Focal alignment inside portrait crop (e.g. "50% 20%" for head & shoulders) */
  objectPosition: string;
}

export interface GameProfileConfig {
  fullName: string;
  asciiHeroWord: string;
  role: string;
  tagline: string;
  bio: string;
  avatarSrc: string;
  avatarAlt: string;
  /** Configurable portrait dimensions & crop across responsive breakpoints */
  avatarConfig: AvatarDisplayConfig;
  /** Target URL opened by FB, LinkedIn, and GitHub buttons */
  githubUrl: string;
  zaloValue: string;
  emailValue: string;
  cvUrl: string;
  cvFileName: string;
  hudLeftTitle: string;
  hudLeftStats: { label: string; value: string }[];
  hudRightTitle: string;
  hudRightStats: { label: string; value: string }[];
  copyrightNotice: string;
}

/**
 * Centralized profile configuration for the Game Developer Portfolio (`/`).
 * Images placed in `asset/avatar/` and PDF files in `asset/cv/`
 * are automatically synced into `public/` before `npm run dev` or `npm run build`.
 */
export const gameProfile: GameProfileConfig = {
  fullName: "Vũ Minh Quang",
  asciiHeroWord: "QUANG",
  role: "Game Developer",
  tagline: "Gameplay Systems · Shaders · Interactive Mechanics",
  bio: "Building 2D/3D games focused on responsive game feel, clean gameplay architecture, AI state machines, and 60fps-optimized shaders.",
  avatarSrc: "/asset/avatar/ava.jpg",
  avatarAlt: "Portrait of Vũ Minh Quang — Game Developer",
  avatarConfig: {
    mobileSizePx: 96,
    tabletSizePx: 120,
    desktopSizePx: 240,
    zoom: 1.22,
    objectPosition: "50% 20%",
  },
  githubUrl: "https://github.com/lightvu25",
  zaloValue: "0971966699",
  emailValue: "minhquangvuxd@gmail.com",
  cvUrl: "/cv/Unity-Dev-Vu-Minh-Quang-0971966699.pdf",
  cvFileName: "Unity Dev - Vũ Minh Quang - 0971966699.pdf",
  hudLeftTitle: "ENGINE & TECH",
  hudLeftStats: [
    { label: "Engines", value: "Unity · Cocos" },
    { label: "Tools", value: "Blender · Aseprite" },
  ],
  hudRightTitle: "CORE SYSTEMS",
  hudRightStats: [
    { label: "Gameplay", value: "Combat · Input Buffering · Physics" },
    { label: "Architecture", value: "ECS / ScriptableObjects · AI" },
    { label: "UI / UX", value: "Pixel HUD · CRT & Tween Juice" },
  ],
  copyrightNotice: "© 2026 Vũ Minh Quang. Keep moving forward!",
};
