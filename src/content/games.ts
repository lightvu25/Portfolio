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
    subtitle: "Grid-Based Movement gameplay",
    genre: "Hybrid Action Puzzle",
    engine: "Unity · C#",
    year: "2026 [Placeholder]",
    role: "Dev",
    theme: {
      bgBase: "#030A07",
      pixelIdle: "#071C13",
      pixelWave: "#0D3826",
      pixelGlow: "#00FF88",
      accentHex: "#00FF88",
      secondaryHex: "#7CFFD0",
      pxlTone: "green",
    },
    summary:
      "[Project 01 Overview — Replace with gameplay introduction, core gravity/grid puzzle loop, or key technical highlights in `src/content/games.ts`.]",
    features: [
      "Snappy combat and grid-based response: combines Input Buffering, Coyote Time, frame-accurate hit-stop, and tuned screen shake for impactful actions.",
      "Modular AI Enemy State Machine (Patrol, Telegraph, Dash Attack, Stagger) allowing designers to compose new boss behaviors via ScriptableObjects without touching core code.",
      "Procedural Room-Graph generation with path-connectivity validation before spawning enemies, traps, and reward chests.",
      "Comprehensive Object Pooling for projectiles, pixel VFX particles, and damage popups to keep frame times stable even with hundreds of active entities.",
      "Custom HLSL 2D pixel lighting & dissolve shaders making characters and abilities glow crisply against dark environments.",
      "JSON checksum-verified Inventory & Upgrade Tree state saving supporting seamless run continuation and key rebinding.",
    ],
    liveUrl: "https://github.com/lightvu25/Gravita",
    liveLabel: "Play",
    sourceUrl: "https://github.com/lightvu25/Gravita",
    sourceLabel: "GitHub",
    media: [
      {
        id: "g1-clip-1",
        type: "video",
        src: "",
        poster: "/games/game-01/demo-1.svg",
        label: "Combat Boss",
        caption: "Clip 01 — Combat gameplay & hit-stop VFX (drop .mp4 into public/games/game-01/)",
      },
      {
        id: "g1-clip-2",
        type: "video",
        src: "",
        poster: "/games/game-01/demo-2.svg",
        label: "Dungeon Gen",
        caption: "Clip 02 — Procedural room generation & minimap traversal",
      },
      {
        id: "g1-shot-3",
        type: "image",
        src: "/games/game-01/demo-3.svg",
        poster: "/games/game-01/demo-3.svg",
        label: "Skill Tree",
        caption: "Screenshot 03 — Upgrade interface & Pixel HUD",
      },
    ],
  },
  {
    id: "game-02",
    index: "02",
    title: "EK",
    subtitle: "Action Roguelite",
    genre: "Precision Platformer",
    engine: "Godot / Custom Physics",
    year: "2026 [Placeholder]",
    role: "Gameplay Engineer & Physics Tuning",
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
      "[Project 02 Overview — Highlight the custom movement mechanics, speedrun tuning, or technical systems in your second game project.]",
    features: [
      "Fully custom 2D Kinematic Character Controller featuring non-linear acceleration curves, wall clinging, wall-jumping, and 8-directional air dashing.",
      "Frame-exact Ghost Replay system recording player trajectories for zero-drift Time Trial racing.",
      "Velocity-reactive environment hazards: elastic bounce pads, momentum-preserving portals, and beat-synchronized laser gates.",
      "Custom level data pipeline & hot-reload support enabling rapid difficulty pacing and obstacle iteration.",
      "GPU particle afterimage trails and cyan speed ribbons keeping high-velocity movement silhouettes readable.",
      "Full keyboard and gamepad input support with impact-tuned haptic rumble feedback.",
    ],
    liveUrl: "https://github.com/your-github-username",
    liveLabel: "Play / Live Demo",
    sourceUrl: "https://github.com/your-github-username",
    sourceLabel: "GitHub",
    media: [
      {
        id: "g2-clip-1",
        type: "video",
        src: "",
        poster: "/games/game-02/demo-1.svg",
        label: "Speedrun",
        caption: "Clip 01 — High-speed Wall-Jump & Dash chains",
      },
      {
        id: "g2-clip-2",
        type: "video",
        src: "",
        poster: "/games/game-02/demo-2.svg",
        label: "Ghost Race",
        caption: "Clip 02 — Real-time Ghost Replay race system",
      },
      {
        id: "g2-shot-3",
        type: "image",
        src: "/games/game-02/demo-3.svg",
        poster: "/games/game-02/demo-3.svg",
        label: "Level Editor",
        caption: "Screenshot 03 — Level layout & rhythm-synced hazards",
      },
    ],
  },
  {
    id: "game-03",
    index: "03",
    title: "Echoes",
    subtitle: "Rhythm Bullet-Hell · Audio-Reactive Shaders",
    genre: "Rhythm / Bullet-Hell",
    engine: "Unity · Shader Graph / HLSL",
    year: "2025 [Placeholder]",
    role: "Tech Artist & Gameplay Programmer",
    theme: {
      bgBase: "#0A0308",
      pixelIdle: "#22071A",
      pixelWave: "#3E0D30",
      pixelGlow: "#FF2E93",
      accentHex: "#FF2E93",
      secondaryHex: "#FF8DC6",
      pxlTone: "pink",
    },
    summary:
      "[Project 03 Overview — Describe the audio synchronization, bullet-hell emitter architecture, and neon synthwave shaders in this project.]",
    features: [
      "Sample-accurate DSP Beat-Sync Clock eliminating audio-visual drift between background tracks and boss attack waves.",
      "Data-driven Bullet Pattern Emitter generating spirals, sine waves, and warning lasers for thousands of bullets via GPU Instancing & Job System.",
      "Audio-Reactive Visuals driven by real-time FFT spectrum analysis to modulate arena floor pulses, neon glow, and distortion shaders.",
      "In-editor Beatmap Timeline tool allowing designers to scrub waveforms, place beat markers, and preview patterns live.",
      "Timing-window Combo & Rank scoring system (Perfect / Great / Miss) paired with crisp UI punch feedback.",
      "Precision grazing hitbox tuned tighter than the character sprite for thrilling close-call bullet dodging.",
    ],
    liveUrl: "https://github.com/your-github-username",
    liveLabel: "Play / Live Demo",
    sourceUrl: "https://github.com/your-github-username",
    sourceLabel: "GitHub",
    media: [
      {
        id: "g3-clip-1",
        type: "video",
        src: "",
        poster: "/games/game-03/demo-1.svg",
        label: "Boss Phase",
        caption: "Clip 01 — DSP-synced bullet patterns & audio-reactive VFX",
      },
      {
        id: "g3-clip-2",
        type: "video",
        src: "",
        poster: "/games/game-03/demo-2.svg",
        label: "Graze Combo",
        caption: "Clip 02 — Bullet-grazing combo scoring mechanic",
      },
      {
        id: "g3-shot-3",
        type: "image",
        src: "/games/game-03/demo-3.svg",
        poster: "/games/game-03/demo-3.svg",
        label: "Timeline Tool",
        caption: "Screenshot 03 — Custom in-editor Beatmap Timeline tool",
      },
    ],
  },
  {
    id: "game-04",
    index: "04",
    title: "ADHD Dungeon",
    subtitle: "Tactical Pixel Strategy · Grid & AI Simulation",
    genre: "Tactical Turn-Based",
    engine: "TypeScript / WebGL / Unity",
    year: "2025 [Placeholder]",
    role: "Systems Architect & UI Engineer",
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
      "[Project 04 Overview — Share turn-based combat logic, A* pathfinding, AI decision scoring, or tactical HUD engineering highlights.]",
    features: [
      "A* pathfinding combined with weighted terrain cost maps and grid-based Line-of-Sight raycasting for tactical firing arcs.",
      "Utility AI evaluating low-HP targets, cover positioning, and skill synergies instead of naive random aggro.",
      "Command Pattern turn pipeline enabling instant move Undo and real-time Damage Preview before confirming attacks.",
      "Readable tactical HUD featuring segmented pixel health bars, status buff/debuff badges, and a clean combat log.",
      "Strict separation between deterministic simulation state and rendering view for reliable unit testing and save/load snapshots.",
      "Smooth pixel-stepped Fog of War shader dynamically revealing tiles around scouting units.",
    ],
    liveUrl: "https://github.com/your-github-username",
    liveLabel: "Play / Live Demo",
    sourceUrl: "https://github.com/your-github-username",
    sourceLabel: "GitHub",
    media: [
      {
        id: "g4-clip-1",
        type: "video",
        src: "",
        poster: "/games/game-04/demo-1.svg",
        label: "Grid Combat",
        caption: "Clip 01 — Turn-based grid combat & damage preview",
      },
      {
        id: "g4-clip-2",
        type: "video",
        src: "",
        poster: "/games/game-04/demo-2.svg",
        label: "Utility AI",
        caption: "Clip 02 — Coordinated Utility AI & Fog of War visibility",
      },
      {
        id: "g4-shot-3",
        type: "image",
        src: "/games/game-04/demo-3.svg",
        poster: "/games/game-04/demo-3.svg",
        label: "Tactical HUD",
        caption: "Screenshot 03 — Command interface & unit inspection panel",
      },
    ],
  },
];
