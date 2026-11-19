import type { BufferGeometry } from "three";

import { buildVoxelGeometry } from "./voxel-mark";

export const QUANG_LETTERS = ["Q", "U", "A", "N", "G"] as const;
export type QuangLetter = (typeof QUANG_LETTERS)[number];

const LETTER_BITMAPS: Record<QuangLetter, readonly string[]> = {
  Q: [
    "..12221..",
    ".1233321.",
    "123111321",
    "123...321",
    "123...321",
    "123...321",
    "123.1.321",
    "123123321",
    ".1233321.",
    "..1221231",
    ".......11",
  ],
  U: [
    "121...121",
    "132...231",
    "132...231",
    "132...231",
    "132...231",
    "132...231",
    "132...231",
    "132...231",
    "123222321",
    ".1233321.",
    "..11111..",
  ],
  A: [
    "...121...",
    "..12321..",
    ".1231321.",
    "1231.1321",
    "132...231",
    "132222231",
    "133333331",
    "132...231",
    "132...231",
    "132...231",
    "121...121",
  ],
  N: [
    "121...121",
    "1321..231",
    "13321.231",
    "132321231",
    "132132231",
    "132.13331",
    "132..1331",
    "132...231",
    "132...231",
    "132...231",
    "121...121",
  ],
  G: [
    "..12221..",
    ".1233321.",
    "123111221",
    "123......",
    "123..1111",
    "123..2331",
    "123...231",
    "1231..231",
    ".1233321.",
    "..12221..",
    ".........",
  ],
};

export interface QuangLetterMeshSpec {
  letter: QuangLetter;
  geometry: BufferGeometry;
  xOffset: number;
  normalizedCenterX: number;
}

export interface QuangWordSpec {
  letters: QuangLetterMeshSpec[];
  wordWidth: number;
  wordHeight: number;
}

const LETTER_PITCH = 10.8;
const WORLD_UNIT_SCALE = 0.148;

export function buildQuangWordGeometry(): QuangWordSpec {
  const count = QUANG_LETTERS.length;
  const centerIndex = (count - 1) / 2;
  const totalColsWidth = (count - 1) * LETTER_PITCH + 9;
  const wordWidth = totalColsWidth * WORLD_UNIT_SCALE;
  const wordHeight = 11 * WORLD_UNIT_SCALE;

  const letters: QuangLetterMeshSpec[] = QUANG_LETTERS.map((letter, idx) => {
    const { geometry } = buildVoxelGeometry(LETTER_BITMAPS[letter]);
    geometry.scale(WORLD_UNIT_SCALE, WORLD_UNIT_SCALE, WORLD_UNIT_SCALE);
    const xOffset = (idx - centerIndex) * LETTER_PITCH * WORLD_UNIT_SCALE;
    return {
      letter,
      geometry,
      xOffset,
      normalizedCenterX: xOffset / (wordWidth * 0.5),
    };
  });

  return { letters, wordWidth, wordHeight };
}
