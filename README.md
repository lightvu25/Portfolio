# Dual Frontend Portfolio — Vũ Minh Quang

A dual-experience **Next.js 16 (`output: "export"`) + React 19 + TypeScript + Tailwind CSS v4** project serving two completely isolated frontends from one static codebase:

1. **Root `/` — Game Developer Portfolio (Vũ Minh Quang):** Dark Retro Neon (`#04060A`) pixel-art portfolio featuring **Handjet** display titles, **Pixelify Sans** UI/body typography, `@pxlkit/*` widgets & icons (`asset/components/`), a GSAP boot preloader (`PixelScanLoader -> Q -> QUANG`), full-width 3D WebGL2 ASCII **`QUANG`**, `0.5s`-cooldown Magnetic Scroll across 4 color-morphing Game Showcases, a Fluid Pixel Outro/Footer, and a modular CRT screen effect pipeline (`src/effects/crt/`).
2. **Route `/web-service/` — Web Development Services Portfolio:** Light-themed Paper & Pixels portfolio (`/web-service/`, `/web-service/work/`, `/web-service/work/bau-chup-choet/`, `/web-service/services/`), isolated from `/` with zero cross-links from the Game Portfolio.

---

## Tech Stack

- **Framework:** Next.js 16 (`output: "export"`, `trailingSlash: true`, `images.unoptimized: true`)
- **UI & Styling:** React 19, TypeScript, Tailwind CSS v4, `@pxlkit/*` (`asset/components/packages/`)
- **Typography:** Local variable fonts (`Handjet`, `Pixelify Sans`) + Google Fonts (`Space Grotesk`, `Plus Jakarta Sans`, `IBM Plex Mono`, `Silkscreen`)
- **Motion & Graphics:** GSAP (`@gsap/react`), Motion, Three.js (WebGL2 ASCII shader & canvas effects)
- **Verification:** ESLint 9, TypeScript `tsc --noEmit`, Playwright (`scripts/verify.mjs`)

---

## Project Structure

```text
.
├── asset/
│   ├── components/packages/   # @pxlkit/* UI kit, icons & effects (tracked for builds)
│   └── fonts/                 # Handjet & Pixelify Sans variable fonts (tracked for builds)
├── public/
│   ├── cv/                    # Downloadable CV PDF
│   ├── games/                 # Gameplay videos & posters (game-01 .. game-04)
│   ├── profile/               # Personal avatar image
│   └── projects/              # Web-service showcase assets
├── scripts/
│   ├── check-placeholders.mjs # Lists remaining placeholder fields in web-service content
│   ├── postbuild-static.mjs   # Generates static RSC prefetch aliases in ./out
│   └── verify.mjs             # Playwright verification across 5 routes & 6 breakpoints
└── src/
    ├── app/
    │   ├── (game)/            # Root Game Portfolio route (/)
    │   └── (web-service)/     # Web Services routes (/web-service/*)
    ├── components/            # Shared & route-specific UI components
    ├── content/               # Editable profile, games, web-service & pricing data
    ├── effects/crt/           # Toggleable CRT shader/overlay pipeline
    ├── lib/                   # WebGL2 ASCII renderer & utilities
    └── types/                 # Shared TypeScript definitions
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server (http://localhost:3000)
npm run dev
#   -> Game Portfolio:      http://localhost:3000/
#   -> Web Service Site:    http://localhost:3000/web-service/

# 3. Build static export into ./out (+ static RSC prefetch aliases)
npm run build

# 4. Run strict TypeScript & ESLint checks
npm run typecheck
npm run lint

# 5. Run automated Playwright verification across all 5 routes & 6 widths (320..1920)
npm run verify
```

---

## Customizing the Game Portfolio (`/`)

### 1. Personal Info, Avatar, Links & CV (`src/content/profile.ts`)
- **Avatar:** Drop your portrait image into `public/profile/` and update `avatarSrc` in `src/content/profile.ts`.
- **Socials & Contact:** Edit `githubUrl` (used by **FB**, **LinkedIn**, and **GitHub** buttons), `zaloValue` (copied on **Zalo** click), `emailValue` (copied on **Email** click), and `hudLeftStats` / `hudRightStats`.
- **CV File:** Replace `public/cv/Vu-Minh-Quang-CV.pdf` with your real PDF file (or update `cvUrl` / `cvFileName`).

### 2. Four Game Projects & Gameplay Videos (`src/content/games.ts`)
- Edit any of the 4 entries in `gameProjects`: `title`, `subtitle`, `genre`, `engine`, `year`, `role`, `summary`, `features` (rendered with glowing pixel bullets inside a scrollable container), `liveUrl`, and `sourceUrl`.
- Drop `.mp4` / `.webm` gameplay videos and `.png` / `.webp` thumbnails into `public/games/game-01/` through `game-04/` and update `media[].src` & `media[].poster`.
- Customize each project's animated large-pixel backdrop colors via `theme` (`bgBase`, `pixelIdle`, `pixelWave`, `pixelGlow`, `accentHex`, `pxlTone`).

### 3. Modular CRT Screen Effects (`src/effects/crt/crtConfig.ts`)
- Open `src/effects/crt/crtConfig.ts` to toggle defaults (`enabled`, `halftone`, `chromaticAberration`, `fisheye`, `intensity`, `showToggleWidget`).
- Visitors can also toggle the full CRT pipeline live via the **`[CRT: ON / OFF]`** corner widget.

---

## Customizing the Web Service Portfolio (`/web-service`)

- **Content & Placeholders:** Run `npm run check:placeholders` to list remaining editable fields in `src/content/site.ts`, `src/content/projects.ts`, and `src/content/pricing.ts`.
- **Inquiry Form:** Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_INQUIRY_ENDPOINT`, `NEXT_PUBLIC_CONTACT_EMAIL`, and `NEXT_PUBLIC_SITE_URL`. Without an endpoint, the form runs transparently in Demo Mode.

---

## Deployment & Git Notes

- **Static Export & Cloudflare:** `npm run build` outputs a pure static site to `./out/` (`output: "export"`, `trailingSlash: true`, `images.unoptimized: true`, plus `scripts/postbuild-static.mjs` for static RSC navigation aliases and `public/_headers` for caching/security headers). `wrangler.jsonc` configures Cloudflare Static Assets (`"assets": { "directory": "./out", "html_handling": "auto-trailing-slash", "not_found_handling": "404-page" }`, no Worker runtime/OpenNext), so both `npx wrangler deploy` (Cloudflare Workers Builds) and **Cloudflare Pages** (output directory `out`) serve the site directly from Cloudflare's static edge CDN. Also compatible with Vercel, Netlify, or GitHub Pages.
- **Tracked `asset/` Files:** `asset/components/packages/` and the two variable fonts in `asset/fonts/` are intentionally tracked in Git because `tsconfig.json` (`@pxlkit/*`), `src/app/globals.css`, and `src/app/layout.tsx` (`next/font/local`) compile directly against them. Unused monorepo demo apps, docs, scripts, tests, and static font duplicates are ignored via `.gitignore`.
