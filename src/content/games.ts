import type { Tone } from "@pxlkit/ui-kit/common";

export interface GameMediaItem {
  id: string;
  type: "video" | "image";
  /** Put `.mp4` / `.webm` in `public/games/game-0X/` when ready; poster renders seamlessly until video loads. */
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
  /** Detailed bullet list rendered with glowing pixel bullets (supports long scrollable descriptions). */
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
    title: "NEON CHRONICLE // PROJECT 01",
    subtitle: "Action Roguelite · Top-Down Pixel Combat",
    genre: "Action Roguelite",
    engine: "Unity · C#",
    year: "2026 [Placeholder]",
    role: "Lead Gameplay & Systems Programmer",
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
      "[Mô tả tổng quan Project 01 — Thay nội dung giới thiệu gameplay, cốt truyện hoặc bài toán kỹ thuật chính của tựa game đầu tiên tại `src/content/games.ts`.]",
    features: [
      "Hệ thống Combat phản hồi nhanh: kết hợp Input Buffering, Coyote Time, Hit-stop theo frame và Camera Shake có kiểm soát để từng đòn đánh có lực.",
      "AI Enemy State Machine mô-đun hoá (Patrol, Telegraph, Dash Attack, Stagger) cho phép nhà thiết kế ghép hành vi boss mới qua ScriptableObject mà không sửa code lõi.",
      "Sinh bản đồ ngẫu nhiên theo Room Graph (Procedural Dungeon) với thuật toán kiểm tra đường đi thông suốt trước khi spawn quái và hòm thưởng.",
      "Object Pooling toàn diện cho đạn, hạt pixel VFX và số sát thương (Damage Popups), giữ frame time ổn định ngay cả khi hàng trăm thực thể xuất hiện cùng lúc.",
      "Shader 2D Pixel Lighting & Dissolve viết bằng HLSL giúp nhân vật và kỹ năng phát sáng neon sắc nét trên nền tối.",
      "Hệ thống Inventory & Upgrade Tree lưu trạng thái bằng JSON checksum an toàn, hỗ trợ chơi tiếp và đổi cấu hình phím điều khiển.",
    ],
    liveUrl: "https://github.com/your-github-username",
    liveLabel: "Play / Live Demo",
    sourceUrl: "https://github.com/your-github-username",
    sourceLabel: "GitHub",
    media: [
      {
        id: "g1-clip-1",
        type: "video",
        src: "",
        poster: "/games/game-01/demo-1.svg",
        label: "Combat Boss",
        caption: "Clip 01 — Gameplay chiến đấu & Hit-stop VFX (thêm .mp4 vào public/games/game-01/)",
      },
      {
        id: "g1-clip-2",
        type: "video",
        src: "",
        poster: "/games/game-01/demo-2.svg",
        label: "Dungeon Gen",
        caption: "Clip 02 — Thuật toán tạo phòng ngẫu nhiên & Minimap",
      },
      {
        id: "g1-shot-3",
        type: "image",
        src: "/games/game-01/demo-3.svg",
        poster: "/games/game-01/demo-3.svg",
        label: "Skill Tree",
        caption: "Screenshot 03 — Giao diện nâng cấp & Pixel HUD",
      },
    ],
  },
  {
    id: "game-02",
    index: "02",
    title: "CYBER DRIFT // PROJECT 02",
    subtitle: "High-Speed Arcade Platformer · Precision Movement",
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
      "[Mô tả tổng quan Project 02 — Giới thiệu cơ chế di chuyển, giải đố hoặc thử thách tốc độ mà bạn tự hào nhất trong dự án game thứ hai.]",
    features: [
      "Bộ điều khiển nhân vật 2D tuỳ biến hoàn toàn (Custom Kinematic Controller) với gia tốc phi tuyến, bám tường, wall-jump và cơ chế dash 8 hướng.",
      "Hệ thống Ghost Replay ghi lại quỹ đạo từng frame của người chơi để đua bóng (Time Trial) với độ lệch bằng 0.",
      "Cơ chế tương tác môi trường phản ứng theo tốc độ: bệ nhảy đàn hồi, cổng dịch chuyển bảo toàn vector vận tốc và bẫy laser đồng bộ nhịp.",
      "Tích hợp Custom Level Data & Hot-reload màn chơi phục vụ tinh chỉnh nhịp độ thử thách nhanh chóng.",
      "Hiệu ứng hậu ảnh (Afterimage Trail) & vệt sáng Cyan vẽ bằng GPU Particle giữ rõ đường bay ở tốc độ cao.",
      "Hỗ trợ đầy đủ cả bàn phím lẫn tay cầm Gamepad với rung phản hồi (Haptic Feedback) tinh chỉnh theo va chạm.",
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
        caption: "Clip 01 — Chuỗi Wall-Jump & Dash tốc độ cao",
      },
      {
        id: "g2-clip-2",
        type: "video",
        src: "",
        poster: "/games/game-02/demo-2.svg",
        label: "Ghost Race",
        caption: "Clip 02 — Hệ thống Replay bóng thời gian thực",
      },
      {
        id: "g2-shot-3",
        type: "image",
        src: "/games/game-02/demo-3.svg",
        poster: "/games/game-02/demo-3.svg",
        label: "Level Editor",
        caption: "Screenshot 03 — Bố cục màn chơi & bẫy đồng bộ nhịp",
      },
    ],
  },
  {
    id: "game-03",
    index: "03",
    title: "SYNTH PULSE // PROJECT 03",
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
      "[Mô tả tổng quan Project 03 — Trình bày cách đồng bộ âm thanh, đạn màn và hiệu ứng synthwave neon pixel trong dự án thứ ba.]",
    features: [
      "Hệ thống Beat-Sync Clock sử dụng DSP Time chuẩn xác, triệt tiêu hoàn toàn độ trễ trôi nhịp giữa nhạc nền và đợt bắn của Boss.",
      "Bullet Pattern Emitter dạng Data-driven: tạo vòng xoắn ốc, sóng sin, tia laser cảnh báo với hàng nghìn viên đạn xử lý qua GPU Instancing / Job System.",
      "Audio-Reactive Visuals: phân tích phổ tần số (FFT Spectrum) để điều khiển biên độ rung sàn đấu, ánh sáng neon và hiệu ứng biến dạng không gian.",
      "Công cụ Beatmap Timeline tích hợp trong Editor giúp đánh dấu nhịp trực tiếp trên sóng âm và xem trước tức thì.",
      "Hệ thống chấm điểm Combo & Rank theo cửa sổ thời gian (Perfect / Great / Miss) kèm hiệu ứng phản hồi UI sắc nét.",
      "Tối ưu vùng va chạm (Hitbox Grazing) nhỏ hơn sprite nhân vật giúp người chơi lách đạn sát mép đầy kịch tính.",
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
        caption: "Clip 01 — Đạn màn đồng bộ nhịp DSP & Audio-reactive VFX",
      },
      {
        id: "g3-clip-2",
        type: "video",
        src: "",
        poster: "/games/game-03/demo-2.svg",
        label: "Graze Combo",
        caption: "Clip 02 — Cơ chế lách đạn tính điểm Combo",
      },
      {
        id: "g3-shot-3",
        type: "image",
        src: "/games/game-03/demo-3.svg",
        poster: "/games/game-03/demo-3.svg",
        label: "Timeline Tool",
        caption: "Screenshot 03 — Công cụ chỉnh nhịp Beatmap trong Editor",
      },
    ],
  },
  {
    id: "game-04",
    index: "04",
    title: "SOLAR BASTION // PROJECT 04",
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
      "[Mô tả tổng quan Project 04 — Chia sẻ bài toán chiến thuật theo lượt, AI tìm đường A*, mô phỏng tài nguyên hoặc thiết kế giao diện HUD chiến thuật.]",
    features: [
      "Thuật toán tìm đường A* kết hợp bản đồ trọng số địa hình (Cost Map) và tính toán vùng tầm bắn (Line-of-Sight Raycast trên lưới ô).",
      "Utility AI cho phe địch biết đánh giá mục tiêu yếu máu, giữ vị trí yểm trợ và phối hợp kỹ năng thay vì lao vào ngẫu nhiên.",
      "Hệ thống Command Pattern hỗ trợ Hoàn tác (Undo) nước đi chiến thuật và xem trước sát thương dự kiến (Damage Preview) trước khi xác nhận.",
      "Giao diện Game HUD trực quan: thanh máu phân đốt pixel, biểu đồ trạng thái buff/debuff và nhật ký chiến đấu dễ theo dõi.",
      "Tách biệt hoàn toàn lõi mô phỏng (Deterministic Simulation) với tầng hiển thị giúp dễ viết unit test và hỗ trợ lưu/nạp trận đấu nhanh.",
      "Shader sương mù chiến tranh (Fog of War) mượt mà chuyển bậc pixel quanh các đơn vị trinh sát.",
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
        caption: "Clip 01 — Chiến đấu theo lượt trên lưới & Preview sát thương",
      },
      {
        id: "g4-clip-2",
        type: "video",
        src: "",
        poster: "/games/game-04/demo-2.svg",
        label: "Utility AI",
        caption: "Clip 02 — Phản ứng phối hợp của Utility AI & Fog of War",
      },
      {
        id: "g4-shot-3",
        type: "image",
        src: "/games/game-04/demo-3.svg",
        poster: "/games/game-04/demo-3.svg",
        label: "Tactical HUD",
        caption: "Screenshot 03 — Giao diện chỉ huy & thông số đơn vị",
      },
    ],
  },
];
