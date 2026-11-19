import { placeholder, type Project } from "@/types/content";

/**
 * Selected work — currently featuring Bấu Chụp Choẹt only.
 * Add new entries to this array to automatically populate Selected Work,
 * `/work`, static case-study routes (`/work/[slug]`), and `sitemap.xml`.
 */
export const projects: Project[] = [
  {
    slug: "bau-chup-choet",
    index: "01",
    title: "Bấu Chụp Choẹt",
    subtitle: "Photography Portfolio & Session Booking Website",
    featured: true,
    category: "Portfolio & Booking",
    projectType: "Photographer Portfolio + Booking Web",
    year: placeholder("Year"),
    clientType: "Photography brand / studio",
    role: [
      "UI/UX Direction",
      "Frontend Architecture",
      "Booking Flow Implementation",
      placeholder("Additional role details"),
    ],
    stack: [
      "Responsive Web UI",
      "Interactive Gallery",
      "Session Booking Flow",
      placeholder("Framework / Backend stack"),
    ],
    stackConfirmed: false,
    summary:
      "A cohesive web presence for Bấu Chụp Choẹt combining visual storytelling for photo series with a structured, mobile-friendly session booking flow—helping visitors browse concepts and request shoots without back-and-forth DM confusion.",
    highlights: [
      "Curated photo-series showcase balanced for visual impact and fast image loading",
      "Guided shoot-booking flow capturing package concept, preferred date, and inquiry details",
      "Mobile-first browsing experience designed for visitors arriving from social channels",
    ],
    cover: {
      src: "/projects/bau-chup-choet/cover.svg",
      alt: "Architectural layout preview for Bấu Chụp Choẹt photography portfolio and booking interface",
      width: 1200,
      height: 800,
      caption: placeholder("Replace with live Bấu Chụp Choẹt hero screenshot"),
      isPlaceholder: true,
    },
    liveUrl: placeholder("https://your-live-project-url.example"),
    liveLabel: "Live site URL (placeholder)",
    caseStudy: {
      overview:
        "Bấu Chụp Choẹt needed a single destination where prospective clients could explore photography concepts, understand session styles, and move directly into booking a shoot. Rather than separating the portfolio gallery from manual chat coordination, the website bridges curated visual galleries with a clear booking request workflow.",
      problemAndGoal: [
        "Give photography work breathing room on both narrow mobile screens and wide desktop displays without burying session details.",
        "Turn casual social-media visitors into structured booking inquiries by clarifying shoot concepts, preparation notes, and date preferences upfront.",
        "Maintain responsive image loading so high-visual pages still feel calm, immediate, and easy to navigate.",
      ],
      roleSummary:
        "Designed the interface structure and visual rhythm, engineered the responsive gallery and booking user flow, and structured reusable page sections so new photo concepts can be showcased cleanly.",
      deliverables: [
        "Custom visual layout & responsive UI system",
        "Category-based photography portfolio showcase",
        "Multi-step or structured session booking inquiry flow",
        "Mobile-first navigation & touch-friendly gallery viewing",
      ],
      approach: [
        {
          step: "01",
          title: "Editorial framing first",
          detail:
            "Structured the layout around clean whitespace and clear typographic hierarchy so photographs remain the focal point rather than competing with heavy UI chrome.",
        },
        {
          step: "02",
          title: "Friction-free path from gallery to booking",
          detail:
            "Placed clear session context alongside visual series so visitors inspired by a look can select that shoot style directly when requesting a date.",
        },
        {
          step: "03",
          title: "Mobile-first ergonomics",
          detail:
            "Tuned tap targets, aspect-ratio reservation, and form controls for thumb navigation, recognizing that most photography clients browse from phones first.",
        },
      ],
      challenges: [
        {
          title: "Balancing dense photography galleries with layout stability",
          problem:
            "Mixed portrait and landscape photographs can cause jarring layout shifts and sluggish scrolling on mobile networks if dimensions and loading priorities are left unmanaged.",
          solution:
            "Reserved explicit aspect-ratio frames for gallery items, prioritized above-the-fold media, and lazy-loaded secondary series below the fold.",
        },
        {
          title: "Keeping the booking experience welcoming instead of bureaucratic",
          problem:
            "Long, rigid booking forms intimidate personal portrait clients who may not know every shoot detail yet.",
          solution:
            "Grouped inputs into clear, human-readable choices—shoot concept, preferred timeframe, and optional notes—with inline validation and clear next-step expectations.",
        },
        {
          title: placeholder("Project-specific technical challenge"),
          problem: placeholder(
            "Describe a specific implementation constraint from Bấu Chụp Choẹt (e.g., calendar availability, CMS gallery uploads, or image CDN setup)"
          ),
          solution: placeholder(
            "Describe how you solved it in production"
          ),
        },
      ],
      gallery: [
        {
          src: "/projects/bau-chup-choet/gallery-grid.svg",
          alt: "Schematic preview of the Bấu Chụp Choẹt curated gallery grid layout",
          width: 1200,
          height: 780,
          caption: placeholder(
            "Replace with real screenshot: Portfolio series & concept filtering view"
          ),
          isPlaceholder: true,
        },
        {
          src: "/projects/bau-chup-choet/booking-flow.svg",
          alt: "Schematic preview of the Bấu Chụp Choẹt shoot selection and date booking interface",
          width: 1200,
          height: 780,
          caption: placeholder(
            "Replace with real screenshot: Session package & date booking flow"
          ),
          isPlaceholder: true,
        },
        {
          src: "/projects/bau-chup-choet/mobile-sheet.svg",
          alt: "Schematic preview of mobile responsive views for gallery and booking",
          width: 1200,
          height: 780,
          caption: placeholder(
            "Replace with real screenshot: Mobile responsive gallery & quick-book drawer"
          ),
          isPlaceholder: true,
        },
      ],
      outcome:
        "Delivered a unified photography portfolio and booking experience that organizes shoot concepts clearly and gives prospective clients a direct, structured path to request sessions on any device.",
      outcomeNotes: placeholder(
        "Optional qualitative client feedback or confirmed post-launch notes (avoid unverified metrics)"
      ),
    },
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
