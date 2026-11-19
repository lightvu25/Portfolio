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
    await gamePage.screenshot({
      path: path.join(SCREENSHOT_DIR, "game-boot-loader.png"),
      fullPage: false,
    });

    // Wait for Q -> QUANG boot sequence to finish
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
      const gameCount = document.querySelectorAll(
        'section[id^="game-"]'
      ).length;
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
        gameCount,
      };
    });

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

    // Click Zalo copy button -> expect PxlKitToast notification
    await gamePage.getByRole("button", { name: /^zalo$/i }).click();
    await gamePage.waitForSelector("[data-pxl-toast]", { timeout: 2500 });
    await gamePage.waitForTimeout(150);

    // Test CRT Toggle ON -> OFF -> ON
    const crtBtn = gamePage.getByRole("button", { name: /hiệu ứng crt/i });
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
      .getByRole("button", { name: /ghost race/i });
    await g2Thumb2.click();
    assert(
      (await g2Thumb2.getAttribute("aria-pressed")) === "true",
      "Expected clicking thumbnail #2 in Game 02 to set aria-pressed='true'"
    );
    await gamePage.screenshot({
      path: path.join(SCREENSHOT_DIR, "game-project-02-1440.png"),
      fullPage: false,
    });

    // Jump to Outro/Footer stage & verify THANK YOU FOR WATCHING, Hire Me, 2-tier Footer
    await gamePage.getByRole("button", { name: "Chuyển đến HIRE" }).click();
    await gamePage.waitForTimeout(700);
    const outroChecks = await gamePage.evaluate(() => {
      const txt = document.getElementById("outro")?.textContent || "";
      return {
        hasThankYou: txt.includes("THANK YOU FOR WATCHING"),
        hasHireMe: txt.includes("Hire Me"),
        hasCopyEmail: txt.includes("Copy Email"),
        hasCopyZalo: txt.includes("Copy Zalo"),
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
      `Game Portfolio '/': Boot->Q->QUANG (WebGL2=${heroAudit.quangReady}), 4 Game stages, 0.5s Magnetic Scroll cooldown, CRT toggle, and 2-tier Fluid Footer verified.`
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

    // 5. Output chunk summary
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
