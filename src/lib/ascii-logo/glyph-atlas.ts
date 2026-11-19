import {
  CanvasTexture,
  DataTexture,
  FloatType,
  LinearFilter,
  LinearMipmapLinearFilter,
  RedFormat,
  Vector2,
} from "three";

import { INNER_SAMPLES } from "./samples";

const GLYPHS = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i));
const CELL_HEIGHT = 64;
const PAD = 8;

export interface GlyphAtlas {
  sheet: CanvasTexture;
  shapes: DataTexture;
  count: number;
  grid: Vector2;
  pad: Vector2;
  inner: Vector2;
}

const atlasCache = new Map<string, Promise<GlyphAtlas>>();

function shapeVectors(
  image: ImageData,
  cols: number,
  cellW: number,
  cellH: number
): Float32Array<ArrayBuffer> {
  const count = GLYPHS.length;
  const buffer = new ArrayBuffer(count * INNER_SAMPLES.length * 4);
  const vectors = new Float32Array(buffer);
  const radius = cellH * 0.26;
  const padW = cellW + PAD * 2;
  const padH = cellH + PAD * 2;

  for (let glyph = 0; glyph < count; glyph++) {
    const originX = (glyph % cols) * padW + PAD;
    const originY = Math.floor(glyph / cols) * padH + PAD;

    for (let sample = 0; sample < INNER_SAMPLES.length; sample++) {
      const cx = INNER_SAMPLES[sample][0] * cellW;
      const cy = INNER_SAMPLES[sample][1] * cellH;

      let sum = 0;
      let total = 0;

      for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
        for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
          const dx = x + 0.5 - cx;
          const dy = y + 0.5 - cy;

          if (dx * dx + dy * dy > radius * radius) {
            continue;
          }

          total++;

          if (x < -PAD || y < -PAD || x >= cellW + PAD || y >= cellH + PAD) {
            continue;
          }

          sum += image.data[((originY + y) * image.width + originX + x) * 4 + 3];
        }
      }

      vectors[glyph * INNER_SAMPLES.length + sample] =
        total > 0 ? sum / (total * 255) : 0;
    }
  }

  for (let sample = 0; sample < INNER_SAMPLES.length; sample++) {
    let peak = 0;

    for (let glyph = 0; glyph < count; glyph++) {
      peak = Math.max(peak, vectors[glyph * INNER_SAMPLES.length + sample]);
    }

    if (peak > 0) {
      for (let glyph = 0; glyph < count; glyph++) {
        vectors[glyph * INNER_SAMPLES.length + sample] /= peak;
      }
    }
  }

  return vectors;
}

function rasterize(font: string, weight: string, aspect: number): GlyphAtlas {
  const cellH = CELL_HEIGHT;
  const cellW = Math.max(Math.round(cellH * aspect), 8);
  const padW = cellW + PAD * 2;
  const padH = cellH + PAD * 2;
  const cols = Math.ceil(Math.sqrt(GLYPHS.length));
  const rows = Math.ceil(GLYPHS.length / cols);
  const source = document.createElement("canvas");

  source.width = cols * padW;
  source.height = rows * padH;

  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("2d context unavailable");
  }

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${weight} ${Math.floor(Math.min(cellH * 0.92, cellW / 0.58))}px ${font}`;

  for (let glyph = 0; glyph < GLYPHS.length; glyph++) {
    ctx.fillText(
      GLYPHS[glyph],
      (glyph % cols) * padW + padW / 2,
      Math.floor(glyph / cols) * padH + padH / 2
    );
  }

  const image = ctx.getImageData(0, 0, source.width, source.height);
  const sheet = new CanvasTexture(source);
  sheet.minFilter = LinearMipmapLinearFilter;
  sheet.magFilter = LinearFilter;

  const shapes = new DataTexture(
    shapeVectors(image, cols, cellW, cellH),
    INNER_SAMPLES.length,
    GLYPHS.length,
    RedFormat,
    FloatType
  );
  shapes.needsUpdate = true;

  return {
    sheet,
    shapes,
    count: GLYPHS.length,
    grid: new Vector2(cols, rows),
    pad: new Vector2(PAD / padW, PAD / padH),
    inner: new Vector2(cellW / padW, cellH / padH),
  };
}

export function loadGlyphAtlas(
  font: string,
  weight: string,
  aspect: number
): Promise<GlyphAtlas> {
  const key = `${font}|${weight}|${aspect}`;
  const pending = atlasCache.get(key);
  if (pending) {
    return pending;
  }

  const built = (
    document.fonts?.load(`${weight} ${CELL_HEIGHT}px ${font}`) ??
    Promise.resolve()
  )
    .catch(() => {})
    .then(() => rasterize(font, weight, aspect));

  atlasCache.set(key, built);
  return built;
}
