import type { Tone } from "@pxlkit/ui-kit/common";

export interface GameMediaItem {
  id: string;
  type: "video" | "image";
  src: string;
  poster: string;
  label: string;
  caption: string;
}

export interface GameTheme {
  bgBase: string;
  pixelIdle: string;
  pixelWave: string;
  pixelGlow: string;
  accentHex: string;
  secondaryHex: string;
  pxlTone: Tone;
}

export interface GameProject {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  genre: string;
  engine: string;
  year: string;
  role: string;
  teamInfo?: string;
  theme: GameTheme;
  summary: string;
  features: string[];
  liveUrl: string;
  liveLabel: string;
  sourceUrl: string;
  sourceLabel: string;
  media: GameMediaItem[];
}

/**
 * 4 Game Projects showcased on `/`.
 * Edit titles, bullet descriptions, links, and drop real `.mp4` / `.png` files into `public/games/`.
 */
export const gameProjects: GameProject[] = [
  {
    id: "game-01",
    index: "01",
    title: "GRAVITA",
    subtitle: "Grid-Based Sci-Fi Puzzle",
    genre: "2D Puzzle / Strategy",
    engine: "Unity · C#",
    year: "2026",
    role: "Solo Developer",
    theme: {
      bgBase: "#03070D",
      pixelIdle: "#071829",
      pixelWave: "#0E3152",
      pixelGlow: "#00E5FF",
      accentHex: "#00E5FF",
      secondaryHex: "#8CEBFF",
      pxlTone: "cyan",
    },
    summary:
      "A sci-fi puzzle game built around grid-based movement, environmental hazards, and tactical decision-making. Players navigate levels, interact with obstacles, and use abilities to reach the exit.",
    features: [
      "Grid-Based Movement: Implemented deterministic grid movement with directional input, slide mechanics, and input buffering.",
      "Hazard & Block Systems: Developed modular environmental hazards and interactive blocks that affect player movement and level navigation.",
      "Level Management: Implemented level configuration, objectives, progression, and level loading.",
      "Power-Up System: Designed a charge-based ability system with limited uses.",
      "Economy & Progression: Implemented coin and gem currencies, shop, missions, achievements, and upgrade progression.",
      "Input Support: Added keyboard and touch controls.",
    ],
    liveUrl: "https://github.com/lightvu25/Gravita",
    liveLabel: "Gameplay",
    sourceUrl: "https://github.com/lightvu25/Gravita",
    sourceLabel: "GitHub",
    media: [
      {
        id: "g1-tab-1",
        type: "video",
        src: "",
        poster: "/games/game-01/demo-1.svg",
        label: "Core Gameplay",
        caption:
          "Core Gameplay — Deterministic grid movement, slide mechanics & tactical navigation",
      },
      {
        id: "g1-tab-2",
        type: "video",
        src: "",
        poster: "/games/game-01/demo-2.svg",
        label: "Game Systems",
        caption:
          "Game Systems — Modular hazards, interactive blocks & charge-based power-ups",
      },
      {
        id: "g1-tab-3",
        type: "image",
        src: "/games/game-01/demo-3.svg",
        poster: "/games/game-01/demo-3.svg",
        label: "UI & Progression",
        caption:
          "UI & Progression — Level progression, shop, missions & upgrade systems",
      },
    ],
  },
  {
    id: "game-02",
    index: "02",
    title: "ECHOES",
    subtitle: "Roguelite Combat & Evolution",
    genre: "2D Action Roguelite",
    engine: "Unity · C#",
    year: "2026",
    role: "Solo Developer",
    theme: {
      bgBase: "#07030D",
      pixelIdle: "#18092B",
      pixelWave: "#2E1252",
      pixelGlow: "#B86BFF",
      accentHex: "#B86BFF",
      secondaryHex: "#DFB8FF",
      pxlTone: "purple",
    },
    summary:
      "A 2D action roguelite focused on combat progression and build customization. Players collect Echoes and Relics, explore branching paths, and develop combat synergies throughout each run.",
    features: [
      "Combat Systems: Developed modular player combat, damage handling, health, and weapon interactions.",
      "Enemy AI: Implemented enemy behavior, including detection, movement, attacks, and evolution.",
      "Echo System: Built a modular framework for combat modifiers and elemental effects.",
      "Relic System: Developed passive item effects and stat modifications to support different character builds.",
      "Procedural Level Generation: Implemented room-based generation and runtime map population.",
      "Branching Progression: Designed a node-based path system with different encounters and challenges.",
      "Game Systems: Worked on inventory, item drops, pickups, resource management, and gameplay feedback.",
    ],
    liveUrl: "https://github.com/lightvu25",
    liveLabel: "Gameplay",
    sourceUrl: "https://github.com/lightvu25",
    sourceLabel: "GitHub",
    media: [
      {
        id: "g2-tab-1",
        type: "video",
        src: "",
        poster: "/games/game-02/demo-1.svg",
        label: "Combat Gameplay",
        caption:
          "Combat Gameplay — Modular 2D action roguelite combat & enemy evolution",
      },
      {
        id: "g2-tab-2",
        type: "video",
        src: "",
        poster: "/games/game-02/demo-2.svg",
        label: "Echoes & Relics",
        caption:
          "Echoes & Relics — Elemental combat modifiers, passive relics & build synergies",
      },
      {
        id: "g2-tab-3",
        type: "image",
        src: "/games/game-02/demo-3.svg",
        poster: "/games/game-02/demo-3.svg",
        label: "World & Level Generation",
        caption:
          "World & Level Generation — Procedural room generation & branching node progression",
      },
    ],
  },
  {
    id: "game-03",
    index: "03",
    title: "ETERNAL KING",
    subtitle: "Offline RPG Systems",
    genre: "RPG / Strategy",
    engine: "Unity · C#",
    year: "2026",
    role: "Unity Developer",
    teamInfo: "Team Project · 2 Developers",
    theme: {
      bgBase: "#0A0702",
      pixelIdle: "#241705",
      pixelWave: "#422A09",
      pixelGlow: "#FFB800",
      accentHex: "#FFB800",
      secondaryHex: "#FFE17D",
      pxlTone: "gold",
    },
    summary:
      "An offline adaptation of a multiplayer RPG, converting selected online gameplay systems into a local single-player experience. The project focuses on offline architecture, gameplay integration, and AI-controlled opponents.",
    features: [
      "Offline Backend Architecture: Worked on the local backend architecture, including request routing and offline data handling.",
      "Debugging & Troubleshooting: Investigated and fixed bugs across existing gameplay systems and integrations.",
      "AI Behavior: Modified existing AI behavior to support offline gameplay.",
      "Guild AI Bot: Developed a bot generation algorithm that combines player data with random seeds to create AI-controlled opponents for the Guild mode.",
      "Automated Skill Usage: Implemented automatic skill usage, allowing bots to use available skills during combat.",
    ],
    liveUrl: "https://github.com/lightvu25",
    liveLabel: "Gameplay",
    sourceUrl: "https://github.com/lightvu25",
    sourceLabel: "GitHub",
    media: [
      {
        id: "g3-tab-1",
        type: "video",
        src: "",
        poster: "/games/game-03/demo-1.svg",
        label: "Offline Gameplay",
        caption:
          "Offline Gameplay — Local single-player RPG adaptation & combat systems",
      },
      {
        id: "g3-tab-2",
        type: "video",
        src: "",
        poster: "/games/game-03/demo-2.svg",
        label: "Guild AI Bot",
        caption:
          "Guild AI Bot — Seeded opponent generation & automated combat skill usage",
      },
      {
        id: "g3-tab-3",
        type: "image",
        src: "/games/game-03/demo-3.svg",
        poster: "/games/game-03/demo-3.svg",
        label: "Backend & Game Systems",
        caption:
          "Backend & Game Systems — Offline request routing & local data architecture",
      },
    ],
  },
  {
    id: "game-04",
    index: "04",
    title: "ADHD DUNGEON",
    subtitle: "3D Action Dungeon",
    genre: "3D Action / Adventure",
    engine: "Cocos Creator 3.8.8 · TypeScript",
    year: "2026",
    role: "Solo Developer",
    theme: {
      bgBase: "#0B0305",
      pixelIdle: "#26070E",
      pixelWave: "#470D1A",
      pixelGlow: "#FF4D6D",
      accentHex: "#FF4D6D",
      secondaryHex: "#FF99AC",
      pxlTone: "red",
    },
    summary:
      "A 3D action dungeon prototype featuring real-time combat, enemy encounters, and interactive environmental hazards. Players dodge attacks and use time manipulation abilities to survive dangerous encounters.",
    features: [
      "Player Controls: Implemented player movement, touch controls, and combat input.",
      "Enemy AI: Developed enemy behavior with detection, pursuit, attack telegraphing, striking, recovery, and death states.",
      "Combat & Dodge: Implemented combat interactions, projectile handling, and dodge mechanics.",
      "Time Freeze: Developed an ability that temporarily stops enemy and hazard behavior.",
      "Environmental Hazards: Created configurable hazards with movement, rotation, slamming, and timed activation.",
      "Object Pooling: Implemented a reusable object pooling system for runtime object management.",
      "Gameplay Management: Developed game states, victory and defeat handling, retry flow, and combat UI.",
      "Combat Feedback: Integrated camera follow, camera shake, and skeletal animation handling.",
    ],
    liveUrl: "https://github.com/lightvu25",
    liveLabel: "Gameplay",
    sourceUrl: "https://github.com/lightvu25",
    sourceLabel: "GitHub",
    media: [
      {
        id: "g4-tab-1",
        type: "video",
        src: "",
        poster: "/games/game-04/demo-1.svg",
        label: "Core Gameplay",
        caption:
          "Core Gameplay — 3D action dungeon movement, controls & real-time combat",
      },
      {
        id: "g4-tab-2",
        type: "video",
        src: "",
        poster: "/games/game-04/demo-2.svg",
        label: "Combat & Enemy AI",
        caption:
          "Combat & Enemy AI — Telegraphed enemy state machine, projectiles & dodge timing",
      },
      {
        id: "g4-tab-3",
        type: "image",
        src: "/games/game-04/demo-3.svg",
        poster: "/games/game-04/demo-3.svg",
        label: "Abilities & Hazards",
        caption:
          "Abilities & Hazards — Time Freeze ability & timed environmental traps",
      },
    ],
  },
];
