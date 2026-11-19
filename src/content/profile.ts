export interface GameProfileConfig {
  fullName: string;
  asciiHeroWord: string;
  role: string;
  tagline: string;
  bio: string;
  avatarSrc: string;
  avatarAlt: string;
  /** Opens for FB, LinkedIn, and GitHub buttons per design specification. */
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
 * Replace placeholder URLs, phone/Zalo, email, avatar image, and CV PDF path here.
 */
export const gameProfile: GameProfileConfig = {
  fullName: "Vũ Minh Quang",
  asciiHeroWord: "QUANG",
  role: "Game Developer",
  tagline: "Gameplay Systems · Shaders · Interactive Mechanics",
  bio: "Xây dựng game 2D/3D với trọng tâm vào cảm giác điều khiển (game feel), kiến trúc gameplay sạch, AI state-machine và hiệu ứng shader tối ưu cho 60fps.",
  avatarSrc: "/profile/avatar-pixel.svg",
  avatarAlt: "Ảnh chân dung pixel Vũ Minh Quang — Game Developer",
  githubUrl: "https://github.com/your-github-username",
  zaloValue: "0900 000 000",
  emailValue: "vuminhquang.gamedev@example.com",
  cvUrl: "/cv/Vu-Minh-Quang-CV.pdf",
  cvFileName: "Vu-Minh-Quang-GameDev-CV.pdf",
  hudLeftTitle: "ENGINE & TECH",
  hudLeftStats: [
    { label: "Engines", value: "Unity (C#) · Godot · Unreal" },
    { label: "Graphics", value: "GLSL / HLSL · WebGL2 · VFX" },
    { label: "Tools", value: "Custom Editors · Profiler" },
  ],
  hudRightTitle: "CORE SYSTEMS",
  hudRightStats: [
    { label: "Gameplay", value: "Combat · Input Buffering · Physics" },
    { label: "Architecture", value: "ECS / ScriptableObjects · AI" },
    { label: "UI / UX", value: "Pixel HUD · CRT & Tween Juice" },
  ],
  copyrightNotice: "© 2026 Vũ Minh Quang. Built with Pixel & Neon Craft.",
};
