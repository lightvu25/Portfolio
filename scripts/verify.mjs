import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import zlib from "node:zlib";
import { chromium } from "playwright";

const OUT_DIR = path.resolve(process.cwd(), "out");
const SCREENSHOT_DIR = process.env.VERIFY_SCREENSHOT_DIR
  ? path.resolve(process.env.VERIFY_SCREENSHOT_DIR)
  : path.resolve(process.cwd(), ".verify-screenshots");

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const urlObj = new URL(req.url || "/", "http://127.0.0.1");
        let pathname = decodeURIComponent(urlObj.pathname);
        if (pathname.endsWith("/")) {
          pathname += "index.html";
        }

        let filePath = path.join(rootDir, pathname);
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          const indexCandidate = path.join(filePath, "index.html");
          if (fs.existsSync(indexCandidate)) {
            filePath = indexCandidate;
          } else {
            console.warn(`  [404] ${req.url} -> ${filePath}`);
            const notFoundPage = path.join(rootDir, "404.html");
            res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
            res.end(
              fs.existsSync(notFoundPage)
                ? fs.readFileSync(notFoundPage)
                : "Not found"
            );
            return;
          }
        }

        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
          "Cache-Control": "no-cache",
        });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${addr.port}`,
      });
    });
  });
}

async function launchBrowser() {
  for (const channel of ["msedge", "chrome", undefined]) {
    try {
      return await chromium.launch({
        channel,
        headless: true,
      });
    } catch {
      // Try next browser channel
    }
  }
  throw new Error("Could not launch Chromium/Edge/Chrome via Playwright.");
}

const ROUTES = [
  "/",
  "/web-service/",
  "/web-service/work/",
  "/web-service/work/bau-chup-choet/",
  "/web-service/services/",
];
const WIDTHS = [320, 375, 768, 1024, 1440, 1920];

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    throw new Error(
      `Static build output not found at ${OUT_DIR}. Run 'npm run build' first.`
    );
  }

  const { server, baseUrl } = await startStaticServer(OUT_DIR);
  const browser = await launchBrowser();
  const failures = [];
  const notes = [];

  const assert = (condition, message) => {
    if (!condition) {
      failures.push(message);
      console.error(`  [FAIL] ${message}`);
    }
  };

  try {
    console.log(`Serving dual-portfolio static export at ${baseUrl}`);

    // 1. Game Portfolio Boot Sequence, QUANG 3D ASCII, 6 Action Buttons, Magnetic Scroll (0.5s Cooldown), 4 Games, Fluid Footer & CRT Toggle
    console.log(
      "\n1. Testing Game Portfolio (/) interactive flows & visual captures..."
    );
    const gameContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const gamePage = await gameContext.newPage();

    const gameConsoleErrors = [];
    const gamePageErrors = [];
    gamePage.on("console", (msg) => {
      if (msg.type() === "error") gameConsoleErrors.push(msg.text());
    });
    gamePage.on("pageerror", (err) => {
      gamePageErrors.push(err.message);
    });

    await gamePage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await gamePage.waitForSelector('[data-testid="pixel-scan-loader"]', {
      timeout: 3000,
    });
    await gamePage.waitForTimeout(80);

    const bootAudit = await gamePage.evaluate(() => {
      const beam = document.querySelector("[data-scan-beam]");
      const loader = document.querySelector('[data-testid="pixel-scan-loader"]');
      const topCurtain = document.querySelector('[data-pixel-curtain="top"]');
      const bottomCurtain = document.querySelector('[data-pixel-curtain="bottom"]');
      const beamRect = beam?.getBoundingClientRect();
      const loaderRect = loader?.getBoundingClientRect();
      const cx = loaderRect ? loaderRect.left + loaderRect.width / 2 : 0;
      const cy = loaderRect ? loaderRect.top + loaderRect.height / 2 : 0;
      return {
        beamFullWidth: beamRect ? beamRect.width >= window.innerWidth - 4 : false,
        loaderCentered:
          Math.abs(cx - window.innerWidth / 2) < 60 &&
          Math.abs(cy - window.innerHeight / 2) < 60,
        hasScanCanvas: Boolean(document.querySelector("[data-boot-scan-canvas]")),
        hasSplitCurtains: Boolean(topCurtain && bottomCurtain),
        hasTrailCanvas: Boolean(document.querySelector("[data-curtain-trail-canvas]")),
      };
    });
    assert(
      bootAudit.beamFullWidth &&
        bootAudit.hasScanCanvas &&
        bootAudit.loaderCentered &&
        bootAudit.hasSplitCurtains &&
        bootAudit.hasTrailCanvas,
      `Expected full-screen pixel scan beam, centered progress bar, dual pixel curtains & trail canvas during boot (${JSON.stringify(bootAudit)})`
    );

    await gamePage.screenshot({
      path: path.join(SCREENSHOT_DIR, "game-boot-loader.png"),
      fullPage: false,
    });

    // Wait for mid-open vertical split-curtain pixel trail & capture screenshot
    await gamePage.waitForFunction(
      () => {
        const topCurtain = document.querySelector('[data-pixel-curtain="top"]');
        if (!topCurtain) return false;
        const b = topCurtain.getBoundingClientRect().bottom;
        return b < window.innerHeight * 0.42 && b > 40;
      },
      null,
      { timeout: 5000 }
    );
    await gamePage.waitForTimeout(40);
    const curtainSymmetry = await gamePage.evaluate(() => {
      const topCurtain = document.querySelector('[data-pixel-curtain="top"]');
      const bottomCurtain = document.querySelector('[data-pixel-curtain="bottom"]');
      const topBottom = topCurtain ? topCurtain.getBoundingClientRect().bottom : -1;
      const bottomTop = bottomCurtain ? bottomCurtain.getBoundingClientRect().top : -1;
      const gapDiff = Math.abs(topBottom - (window.innerHeight - bottomTop));
      return { topBottom, bottomTop, innerHeight: window.innerHeight, gapDiff };
    });
    assert(
      curtainSymmetry.topBottom >= 0 && curtainSymmetry.gapDiff <= 6,
      `Expected symmetrical vertical curtain opening (${JSON.stringify(curtainSymmetry)})`
    );
    await gamePage.screenshot({
      path: path.join(SCREENSHOT_DIR, "game-boot-curtain-trail.png"),
      fullPage: false,
    });

    // Wait for vertical split-curtain + trail sequence to finish unmounting
    await gamePage.waitForFunction(
      () => !document.querySelector('[data-testid="boot-sequence-overlay"]'),
      null,
      { timeout: 6000 }
    );
    await gamePage.waitForTimeout(450);

    const heroAudit = await gamePage.evaluate(() => {
      const topNavbarCount = document.querySelectorAll(
        "body > header, .game-portfolio-root > header, main > header, header nav"
      ).length;
      const crossLinks = document.querySelectorAll(
        'a[href*="web-service"]'
      ).length;
      const quangEl = document.querySelector("ascii-quang");
      const quangRect = quangEl?.getBoundingClientRect();
      const fb = document.querySelector('a[aria-label*="Facebook"]');
      const li = document.querySelector('a[aria-label*="LinkedIn"]');
      const gh = document.querySelector('a[aria-label="GitHub profile"]');
      const cv = document.querySelector('a[download]');
      const avatarImg = document.querySelector("#hero .hero-avatar-box img");
      const gameCount = document.querySelectorAll(
        'section[id^="game-"]'
      ).length;
      const roleEl = document.querySelector("[data-hero-role]");
      const nameEl = document.querySelector("[data-hero-name]");
      const bioRemoved = !document.querySelector("[data-hero-bio]");
      const heroText = document.getElementById("hero")?.textContent || "";
      const skillCardsRemoved =
        !heroText.includes("ENGINE & TECH") &&
        !heroText.includes("CORE SYSTEMS");
      const taglineRemoved = !document.querySelector("[data-hero-tagline]");
      const leftInvader = document.querySelector('[data-role-invader="left"]');
      const rightInvader = document.querySelector('[data-role-invader="right"]');
      const roleRect = roleEl?.getBoundingClientRect();
      const nameRect = nameEl?.getBoundingClientRect();
      const avatarBoxRect = document
        .querySelector("#hero .hero-avatar-box")
        ?.getBoundingClientRect();
      const leftLinksRect = document
        .querySelector("[data-hero-links-left]")
        ?.getBoundingClientRect();
      const rightLinksRect = document
        .querySelector("[data-hero-links-right]")
        ?.getBoundingClientRect();
      const linksOnAvatarRow = Boolean(
        avatarBoxRect &&
          leftLinksRect &&
          rightLinksRect &&
          nameRect &&
          leftLinksRect.top >= avatarBoxRect.top &&
          leftLinksRect.bottom <= avatarBoxRect.bottom + 16 &&
          rightLinksRect.top >= avatarBoxRect.top &&
          rightLinksRect.bottom <= avatarBoxRect.bottom + 16 &&
          leftLinksRect.bottom <= nameRect.top + 8 &&
          rightLinksRect.bottom <= nameRect.top + 8
      );
      const leftInvRect = leftInvader?.getBoundingClientRect();
      const rightInvRect = rightInvader?.getBoundingClientRect();
      const roleBg = roleEl ? getComputedStyle(roleEl).backgroundColor : "";
      const roleFontPx = roleEl ? parseFloat(getComputedStyle(roleEl).fontSize) : 0;
      const nameFontPx = nameEl ? parseFloat(getComputedStyle(nameEl).fontSize) : 0;
      const sparkleCount = document.querySelectorAll("[data-name-sparkle]").length;
      const hasIntroPixelCanvas = Boolean(
        document.querySelector("[data-hero-intro-canvas]")
      );
      const rootScrollbarWidth = getComputedStyle(
        document.documentElement
      ).scrollbarWidth;
      const nativeScrollbarPx =
        window.innerWidth - document.documentElement.clientWidth;
      return {
        topNavbarCount,
        crossLinks,
        quangExists: Boolean(quangEl),
        quangReady: quangEl?.getAttribute("data-ready") === "true",
        quangFullWidth: quangRect ? quangRect.left <= 2 && quangRect.width >= window.innerWidth - 4 : false,
        fbHref: fb?.getAttribute("href") || "",
        liHref: li?.getAttribute("href") || "",
        ghHref: gh?.getAttribute("href") || "",
        hasCvDownload: Boolean(cv),
        cvHref: cv?.getAttribute("href") || "",
        cvDownload: cv?.getAttribute("download") || "",
        avatarLoaded: Boolean(
          avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0
        ),
        avatarNaturalWidth: avatarImg ? avatarImg.naturalWidth : 0,
        gameCount,
        taglineRemoved,
        bioRemoved,
        skillCardsRemoved,
        nameAboveRole: Boolean(
          nameRect && roleRect && nameRect.top < roleRect.top
        ),
        linksOnAvatarRow,
        roleBg,
        roleFontPx,
        nameFontPx,
        invadersCount: document.querySelectorAll("[data-role-invader]").length,
        invadersFlankRole: Boolean(
          leftInvRect &&
            rightInvRect &&
            roleRect &&
            leftInvRect.left < roleRect.left &&
            rightInvRect.left >= roleRect.right - 4
        ),
        sparkleCount,
        hasIntroPixelCanvas,
        rootScrollbarWidth,
        nativeScrollbarPx,
      };
    });

    assert(
      heroAudit.taglineRemoved &&
        heroAudit.bioRemoved &&
        heroAudit.skillCardsRemoved &&
        heroAudit.nameAboveRole &&
        heroAudit.linksOnAvatarRow,
      `Expected streamlined Hero with 6 buttons aligned on avatar row (taglineRemoved=${heroAudit.taglineRemoved}, bioRemoved=${heroAudit.bioRemoved}, skillCardsRemoved=${heroAudit.skillCardsRemoved}, nameAboveRole=${heroAudit.nameAboveRole}, linksOnAvatarRow=${heroAudit.linksOnAvatarRow})`
    );
    assert(
      heroAudit.invadersCount === 2 && heroAudit.invadersFlankRole,
      `Expected 2 animated invader icons flanking Role (count=${heroAudit.invadersCount}, flank=${heroAudit.invadersFlankRole})`
    );
    assert(
      heroAudit.roleBg === "rgba(0, 0, 0, 0)",
      `Expected Role text without background fill, got '${heroAudit.roleBg}'`
    );
    assert(
      heroAudit.roleFontPx >= 22 && heroAudit.roleFontPx < heroAudit.nameFontPx,
      `Expected font hierarchy role (${heroAudit.roleFontPx}) >= 22px and < name (${heroAudit.nameFontPx})`
    );
    assert(
      heroAudit.sparkleCount >= 3 && heroAudit.hasIntroPixelCanvas,
      `Expected name sparkle accents (${heroAudit.sparkleCount}) and intro pixel canvas (${heroAudit.hasIntroPixelCanvas})`
    );

    assert(
      heroAudit.rootScrollbarWidth === "none" && heroAudit.nativeScrollbarPx === 0,
      `Expected hidden root vertical scrollbar on '/' (scrollbarWidth=${heroAudit.rootScrollbarWidth}, nativeScrollbarPx=${heroAudit.nativeScrollbarPx})`
    );
    assert(
      heroAudit.avatarLoaded && heroAudit.avatarNaturalWidth > 0,
      `Expected Hero avatar image to load cleanly (loaded=${heroAudit.avatarLoaded}, width=${heroAudit.avatarNaturalWidth})`
    );

    const cvRes = await fetch(`${baseUrl}${heroAudit.cvHref}`);
    assert(
      cvRes.status === 200,
      `Expected CV URL '${heroAudit.cvHref}' to return HTTP 200, got ${cvRes.status}`
    );
    const cvContentType = cvRes.headers.get("content-type") || "";
    assert(
      cvContentType.toLowerCase().includes("application/pdf"),
      `Expected CV Content-Type 'application/pdf', got '${cvContentType}'`
    );
    const cvHead = Buffer.from((await cvRes.arrayBuffer()).slice(0, 5)).toString("ascii");
    assert(
      cvHead === "%PDF-",
      `Expected CV response body to start with '%PDF-' binary header, got '${cvHead}'`
    );
    assert(
      heroAudit.cvDownload.toLowerCase().endsWith(".pdf"),
      `Expected CV download filename to end with '.pdf', got '${heroAudit.cvDownload}'`
    );

    assert(
      heroAudit.topNavbarCount === 0,
      `Game portfolio '/' must have NO top navbar <header>, found ${heroAudit.topNavbarCount}`
    );
    assert(
      heroAudit.quangFullWidth,
      "Expected <ascii-quang> to span full viewport width centered across the Hero top 50%"
    );
    assert(
      heroAudit.crossLinks === 0,
      `Game portfolio '/' must have NO links to /web-service, found ${heroAudit.crossLinks}`
    );
    assert(heroAudit.quangExists, "Expected <ascii-quang> element on '/'");
    assert(
      heroAudit.fbHref.includes("github") &&
        heroAudit.liHref.includes("github") &&
        heroAudit.ghHref.includes("github"),
      `Expected FB, LinkedIn, and GitHub buttons to link to GitHub (got ${heroAudit.fbHref}, ${heroAudit.liHref}, ${heroAudit.ghHref})`
    );
    assert(heroAudit.hasCvDownload, "Expected CV download button with download attribute");
    assert(
      heroAudit.gameCount === 4,
      `Expected exactly 4 game stages on '/', found ${heroAudit.gameCount}`
    );

    await gamePage.screenshot({
      path: path.join(SCREENSHOT_DIR, "game-hero-1440.png"),
      fullPage: false,
    });

    // Click Zalo copy button in Hero -> expect PxlKitToast notification
    await gamePage.locator("#hero").getByRole("button", { name: /^zalo$/i }).click();
    await gamePage.waitForSelector("[data-pxl-toast]", { timeout: 2500 });
    await gamePage.waitForTimeout(150);

    // Test CRT Toggle ON -> OFF -> ON
    const crtBtn = gamePage.getByRole("button", { name: /crt effect/i });
    const crtInitial = await gamePage
      .locator("[data-crt-enabled]")
      .getAttribute("data-crt-enabled");
    assert(crtInitial === "true", `Expected CRT initially 'true', got '${crtInitial}'`);
    await crtBtn.click();
    const crtOff = await gamePage
      .locator("[data-crt-enabled]")
      .getAttribute("data-crt-enabled");
    assert(crtOff === "false", `Expected CRT 'false' after toggle click, got '${crtOff}'`);
    await crtBtn.click();

    // Check English-only text audit (excluding "Vũ Minh Quang")
    const nonEnglishLeak = await gamePage.evaluate(() => {
      const stripped = document.body.innerText.replace(/Vũ Minh Quang/g, "");
      const m = stripped.match(
        /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i
      );
      if (!m || m.index === undefined) return "";
      const start = Math.max(0, m.index - 20);
      return stripped.slice(start, start + 60);
    });
    assert(
      !nonEnglishLeak,
      `Expected only English copy (except Vũ Minh Quang) on '/', found: '${nonEnglishLeak}'`
    );

    // Test Magnetic Scroll + 0.5s Cooldown: two rapid wheel events 120ms apart should advance strictly 1 stage (0 -> 1)
    await gamePage.mouse.move(720, 450);
    await gamePage.mouse.wheel(0, 180);
    await gamePage.waitForTimeout(120);
    await gamePage.mouse.wheel(0, 180);
    await gamePage.waitForTimeout(700);

    const stageAfterBurst = await gamePage.evaluate(() => {
      const g1 = document.getElementById("game-01");
      const r = g1?.getBoundingClientRect();
      return { top: r ? Math.round(r.top) : 9999 };
    });
    assert(
      Math.abs(stageAfterBurst.top) <= 8,
      `Expected rapid double wheel within 0.5s cooldown to land strictly on #game-01 (top=${stageAfterBurst.top})`
    );
    await gamePage.screenshot({
      path: path.join(SCREENSHOT_DIR, "game-project-01-1440.png"),
      fullPage: false,
    });

    // After cooldown (>500ms), another wheel tick advances cleanly to #game-02
    await gamePage.mouse.wheel(0, 180);
    await gamePage.waitForTimeout(700);
    const stageAfterNext = await gamePage.evaluate(() => {
      const g2 = document.getElementById("game-02");
      const r = g2?.getBoundingClientRect();
      return { top: r ? Math.round(r.top) : 9999 };
    });
    assert(
      Math.abs(stageAfterNext.top) <= 8,
      `Expected next wheel after cooldown to land on #game-02 (top=${stageAfterNext.top})`
    );

    // Click thumbnail #2 in Game 02
    const g2Thumb2 = gamePage
      .locator("#game-02")
      .getByRole("button", { name: /echoes & relics/i });
    await g2Thumb2.click();
    assert(
      (await g2Thumb2.getAttribute("aria-pressed")) === "true",
      "Expected clicking thumbnail #2 in Game 02 to set aria-pressed='true'"
    );
    await gamePage.screenshot({
      path: path.join(SCREENSHOT_DIR, "game-project-02-1440.png"),
      fullPage: false,
    });

    const gameTitles = await gamePage.evaluate(() =>
      ["game-01", "game-02", "game-03", "game-04"].map(
        (id) => document.querySelector(`#${id} h2`)?.textContent?.trim() || ""
      )
    );
    const expectedTitles = ["GRAVITA", "ECHOES", "ETERNAL KING", "ADHD DUNGEON"];
    assert(
      JSON.stringify(gameTitles) === JSON.stringify(expectedTitles),
      `Expected game headings ${JSON.stringify(expectedTitles)}, got ${JSON.stringify(gameTitles)}`
    );

    // Verify alternating desktop layout: 1 & 3 (info left, media right) vs 2 & 4 (media left, info right)
    const alternatingAudit = await gamePage.evaluate(() => {
      return ["game-01", "game-02", "game-03", "game-04"].map((id) => {
        const sec = document.getElementById(id);
        const info = sec?.querySelector("[data-stage-info]")?.getBoundingClientRect();
        const media = sec?.querySelector("[data-stage-media]")?.getBoundingClientRect();
        return {
          id,
          infoLeft: info ? Math.round(info.left) : -1,
          mediaLeft: media ? Math.round(media.left) : -1,
        };
      });
    });
    for (let i = 0; i < alternatingAudit.length; i++) {
      const row = alternatingAudit[i];
      if (i % 2 === 0) {
        assert(
          row.infoLeft >= 0 && row.infoLeft < row.mediaLeft,
          `Expected ${row.id} info on left and media on right (info=${row.infoLeft}, media=${row.mediaLeft})`
        );
      } else {
        assert(
          row.mediaLeft >= 0 && row.mediaLeft < row.infoLeft,
          `Expected ${row.id} media on left and info on right (media=${row.mediaLeft}, info=${row.infoLeft})`
        );
      }
    }

    // Jump to Outro/Footer stage & verify THANK YOU FOR WATCHING, Hire Me, 2-tier Footer
    await gamePage.getByRole("button", { name: "Jump to HIRE" }).click();
    await gamePage.waitForTimeout(700);
    const outroChecks = await gamePage.evaluate(() => {
      const txt = document.getElementById("outro")?.textContent || "";
      return {
        hasThankYou: txt.includes("THANK YOU FOR WATCHING"),
        hasHireMe: txt.includes("Hire Me"),
        hasEmailBtn: txt.includes("Email"),
        hasZaloBtn: txt.includes("Zalo"),
        hasName: txt.includes("Vũ Minh Quang"),
        hasCopyright: txt.includes("© 2026"),
      };
    });
    assert(
      Object.values(outroChecks).every(Boolean),
      `Missing expected Outro/Footer elements: ${JSON.stringify(outroChecks)}`
    );
    await gamePage.screenshot({
      path: path.join(SCREENSHOT_DIR, "game-outro-footer-1440.png"),
      fullPage: false,
    });

    assert(
      gameConsoleErrors.length === 0,
      `Console errors on '/': ${gameConsoleErrors.join(" | ")}`
    );
    assert(
      gamePageErrors.length === 0,
      `Uncaught page errors on '/': ${gamePageErrors.join(" | ")}`
    );
    notes.push(
      `Game Portfolio '/': Boot->SplitCurtain->QUANG (WebGL2=${heroAudit.quangReady}), 4 Game stages, 0.5s Magnetic Scroll cooldown, CRT toggle, and 2-tier Fluid Footer verified.`
    );
    await gameContext.close();

    // 2. Full Responsive Breakpoint Overflow Audit across ALL 5 routes (6 widths each)
    console.log(
      "\n2. Auditing responsive layout (320..1920) across all 5 routes..."
    );
    const respContext = await browser.newContext({ deviceScaleFactor: 1 });
    const respPage = await respContext.newPage();

    const respConsoleErrors = [];
    const respPageErrors = [];
    respPage.on("console", (msg) => {
      if (msg.type() === "error")
        respConsoleErrors.push(`${respPage.url()}: ${msg.text()}`);
    });
    respPage.on("pageerror", (err) => {
      respPageErrors.push(`${respPage.url()}: ${err.message}`);
    });

    for (const route of ROUTES) {
      for (const width of WIDTHS) {
        const height = width < 768 ? 812 : 900;
        await respPage.setViewportSize({ width, height });
        await respPage.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
        if (route === "/") {
          await respPage
            .waitForFunction(
              () =>
                !document.querySelector(
                  '[data-testid="boot-sequence-overlay"]'
                ),
              null,
              { timeout: 5000 }
            )
            .catch(() => {});
          await respPage.waitForTimeout(250);
        } else {
          await respPage.waitForTimeout(180);
        }

        const metrics = await respPage.evaluate(() => {
          const docEl = document.documentElement;
          const overflowPx = docEl.scrollWidth - window.innerWidth;
          const offenders = [];
          if (overflowPx > 1) {
            for (const el of document.querySelectorAll("*")) {
              const r = el.getBoundingClientRect();
              if (r.right > window.innerWidth + 1 || r.left < -1) {
                offenders.push(
                  `${el.tagName.toLowerCase()}.${Array.from(el.classList).join(".")} [left=${Math.round(r.left)}, right=${Math.round(r.right)}]`
                );
                if (offenders.length >= 4) break;
              }
            }
          }
          return { overflowPx, offenders };
        });

        assert(
          metrics.overflowPx <= 1,
          `Horizontal overflow on ${route} at ${width}px (+${metrics.overflowPx}px): ${metrics.offenders.join("; ")}`
        );

        if (route === "/" && width === 375) {
          await respPage.screenshot({
            path: path.join(SCREENSHOT_DIR, "game-hero-375.png"),
            fullPage: false,
          });
        }
        if (route === "/web-service/" && width === 1440) {
          await respPage.screenshot({
            path: path.join(SCREENSHOT_DIR, "web-service-1440.png"),
            fullPage: false,
          });
        }
      }
    }

    assert(
      respConsoleErrors.length === 0,
      `Console errors across routes: ${respConsoleErrors.join(" | ")}`
    );
    assert(
      respPageErrors.length === 0,
      `Uncaught errors across routes: ${respPageErrors.join(" | ")}`
    );
    notes.push(
      `Checked ${ROUTES.length * WIDTHS.length} route/breakpoint combinations (0 overflows, 0 console errors).`
    );
    await respContext.close();

    // 3. Web Service /web-service/services/ Regression Test (Package pre-fill + Form validation + Demo Mode)
    console.log("3. Testing /web-service/services/ form validation & Demo Mode...");
    const wsContext = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const wsPage = await wsContext.newPage();
    await wsPage.goto(`${baseUrl}/web-service/services/`, {
      waitUntil: "networkidle",
    });

    await wsPage
      .getByRole("link", { name: /inquire about studio & business/i })
      .click();
    await wsPage.waitForTimeout(200);
    const selectedType = await wsPage
      .locator('select[name="websiteType"]')
      .inputValue();
    assert(
      selectedType === "business-website",
      `Expected pricing CTA on /web-service/services/ to preset 'business-website', got '${selectedType}'`
    );

    await wsPage.locator('input[name="name"]').fill("Linh Nguyen");
    await wsPage
      .locator('input[name="email"]')
      .fill("linh@example-studio.vn");
    await wsPage
      .locator('textarea[name="description"]')
      .fill("Testing form validation and demo mode after moving to /web-service.");
    await wsPage
      .getByRole("button", { name: /validate project brief/i })
      .click();
    await wsPage.waitForSelector("text=Validated in Demo Mode", {
      timeout: 3000,
    });
    await wsContext.close();
    notes.push("Web Service '/web-service/services/' form & package pre-fill verified.");

    // 4. Reduced Motion Fallback Check on '/'
    console.log("4. Testing prefers-reduced-motion on '/'...");
    const rmContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      reducedMotion: "reduce",
    });
    const rmPage = await rmContext.newPage();
    await rmPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await rmPage.waitForFunction(
      () => !document.querySelector('[data-testid="boot-sequence-overlay"]'),
      null,
      { timeout: 3000 }
    );
    await rmContext.close();
    notes.push("Reduced-motion boot bypass verified cleanly.");

    // 5. Cloudflare Static Export Readiness: out/ integrity, wrangler.jsonc, SPA <Link> navigation, direct nested refresh, custom 404 & secret scan
    console.log(
      "5. Auditing Cloudflare static-assets readiness, SPA nav, refresh & 404..."
    );

    const expectedStaticArtifacts = [
      "404.html",
      "robots.txt",
      "sitemap.xml",
      "icon.svg",
      "favicon.ico",
      "_headers",
    ];
    for (const relPath of expectedStaticArtifacts) {
      const absPath = path.join(OUT_DIR, relPath);
      const ok = fs.existsSync(absPath) && fs.statSync(absPath).size > 0;
      assert(ok, `Missing or empty static export artifact: out/${relPath}`);
    }

    const expectedRscAliasDirs = [
      "",
      "web-service",
      "web-service/work",
      "web-service/work/bau-chup-choet",
      "web-service/services",
    ];
    for (const relDir of expectedRscAliasDirs) {
      const targetDir = relDir ? path.join(OUT_DIR, relDir) : OUT_DIR;
      const hasFlattenedRsc = fs.existsSync(targetDir)
        ? fs
            .readdirSync(targetDir)
            .some(
              (f) =>
                /^__next\..+\.__PAGE__\.txt$/.test(f) &&
                fs.statSync(path.join(targetDir, f)).size > 0
            )
        : false;
      assert(
        hasFlattenedRsc,
        `Missing flattened __next.*.__PAGE__.txt RSC alias in out/${relDir || "."}`
      );
    }

    const staticMediaDir = path.join(OUT_DIR, "_next/static/media");
    const fontFiles = fs.existsSync(staticMediaDir)
      ? fs
          .readdirSync(staticMediaDir)
          .filter((f) => /\.(woff2?|ttf|otf)$/i.test(f))
      : [];
    assert(
      fontFiles.length > 0,
      "Expected bundled font files in out/_next/static/media/"
    );

    const parseJsonc = (raw) => {
      const stripped = raw
        .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) =>
          g ? "" : m
        )
        .replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(stripped);
    };

    const wranglerPath = path.resolve(process.cwd(), "wrangler.jsonc");
    assert(fs.existsSync(wranglerPath), "Expected root wrangler.jsonc file");
    if (fs.existsSync(wranglerPath)) {
      let wranglerCfg = null;
      let parseErr = "";
      try {
        wranglerCfg = parseJsonc(fs.readFileSync(wranglerPath, "utf8"));
      } catch (err) {
        parseErr = err instanceof Error ? err.message : String(err);
      }
      assert(
        Boolean(
          !parseErr &&
            wranglerCfg &&
            wranglerCfg.name === "portfolio" &&
            wranglerCfg.main === undefined &&
            wranglerCfg.assets?.directory === "./out" &&
            wranglerCfg.assets?.html_handling === "auto-trailing-slash" &&
            wranglerCfg.assets?.not_found_handling === "404-page"
        ),
        `Invalid wrangler.jsonc Cloudflare Static Assets config: ${parseErr || JSON.stringify(wranglerCfg)}`
      );
    }

    const navContext = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const navPage = await navContext.newPage();
    const navConsoleErrors = [];
    const navPageErrors = [];
    const navHttpErrors = [];
    navPage.on("console", (msg) => {
      if (msg.type() === "error") navConsoleErrors.push(msg.text());
    });
    navPage.on("pageerror", (err) => {
      navPageErrors.push(err.message);
    });
    navPage.on("response", (res) => {
      if (res.status() >= 400) {
        navHttpErrors.push(`${res.status()} ${res.url()}`);
      }
    });

    await navPage.goto(`${baseUrl}/web-service/`, { waitUntil: "networkidle" });
    await navPage
      .locator('header nav[aria-label="Primary navigation"]')
      .getByRole("link", { name: /^work$/i })
      .click();
    await navPage.waitForURL("**/web-service/work/", { timeout: 4000 });
    await navPage.waitForLoadState("networkidle");

    await navPage
      .getByRole("link", { name: /read case study/i })
      .first()
      .click();
    await navPage.waitForURL("**/web-service/work/bau-chup-choet/", {
      timeout: 4000,
    });
    await navPage.waitForLoadState("networkidle");

    await navPage
      .locator('header nav[aria-label="Primary navigation"]')
      .getByRole("link", { name: /^services$/i })
      .click();
    await navPage.waitForURL("**/web-service/services/", { timeout: 4000 });
    await navPage.waitForLoadState("networkidle");

    // Direct nested route access + full browser refresh
    const directRes = await navPage.goto(
      `${baseUrl}/web-service/work/bau-chup-choet/`,
      { waitUntil: "networkidle" }
    );
    assert(
      directRes?.status() === 200,
      `Expected HTTP 200 for direct nested route, got ${directRes?.status()}`
    );
    const reloadRes = await navPage.reload({ waitUntil: "networkidle" });
    assert(
      reloadRes?.status() === 200,
      `Expected HTTP 200 after page refresh on nested route, got ${reloadRes?.status()}`
    );
    const caseHeading = (
      await navPage.locator("#main-content h1").first().textContent()
    )?.trim();
    assert(
      Boolean(caseHeading && caseHeading.length > 0),
      `Expected non-empty #main-content <h1> after reload, got '${caseHeading}'`
    );

    assert(
      navHttpErrors.length === 0,
      `HTTP >=400 responses during SPA nav / refresh: ${navHttpErrors.join(" | ")}`
    );
    assert(
      navConsoleErrors.length === 0,
      `Console errors during SPA nav / refresh: ${navConsoleErrors.join(" | ")}`
    );
    assert(
      navPageErrors.length === 0,
      `Uncaught errors during SPA nav / refresh: ${navPageErrors.join(" | ")}`
    );
    await navContext.close();

    // Verify custom 404 handling on unknown route in separate context (browser logs 404 resource error as expected)
    const notFoundCtx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const notFoundPage = await notFoundCtx.newPage();
    const notFoundRes = await notFoundPage.goto(
      `${baseUrl}/missing-route-verify-404/`,
      { waitUntil: "domcontentloaded" }
    );
    const notFoundText = await notFoundPage.locator("body").innerText();
    assert(
      notFoundRes?.status() === 404 &&
        notFoundText.includes("This page could not be found."),
      `Expected HTTP 404 with custom 404 page, got status=${notFoundRes?.status()}`
    );
    await notFoundCtx.close();

    // Scan static export artifacts for accidental secrets
    const secretRegex =
      /CLOUDFLARE_API_TOKEN|-----BEGIN [A-Z ]*PRIVATE KEY-----|sk_live_[0-9a-zA-Z]{16,}/;
    const scanOutSecrets = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanOutSecrets(full);
        } else if (/\.(html|js|txt|xml)$/i.test(entry.name)) {
          const content = fs.readFileSync(full, "utf8");
          const m = content.match(secretRegex);
          if (m) {
            failures.push(`Potential secret pattern '${m[0]}' found in ${full}`);
          }
        }
      }
    };
    scanOutSecrets(OUT_DIR);

    notes.push(
      "Cloudflare static export integrity, wrangler.jsonc, client-side <Link> nav, nested refresh, custom 404 & secret scan verified."
    );

    // 6. Output chunk summary
    const chunksDir = path.join(OUT_DIR, "_next/static/chunks");
    if (fs.existsSync(chunksDir)) {
      const chunkFiles = fs
        .readdirSync(chunksDir)
        .filter((f) => f.endsWith(".js"))
        .map((f) => {
          const buf = fs.readFileSync(path.join(chunksDir, f));
          return {
            name: f,
            bytes: buf.length,
            gzipBytes: zlib.gzipSync(buf).length,
          };
        })
        .sort((a, b) => b.bytes - a.bytes);

      console.log("\nLargest JS chunks in out/_next/static/chunks:");
      for (const c of chunkFiles.slice(0, 5)) {
        console.log(
          `  ${c.name.padEnd(32)} ${(c.bytes / 1024).toFixed(1).padStart(7)} KB raw | ${(c.gzipBytes / 1024).toFixed(1).padStart(6)} KB gz`
        );
      }
    }

    console.log("\nVerification Summary:");
    for (const n of notes) {
      console.log(`  [PASS] ${n}`);
    }

    if (failures.length > 0) {
      console.error(`\nVerification failed with ${failures.length} issue(s).`);
      process.exitCode = 1;
    } else {
      console.log("\nAll automated dual-portfolio verification checks passed!");
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
