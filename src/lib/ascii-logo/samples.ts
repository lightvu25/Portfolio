/**
 * Six staggered sample points per character cell (fractions, y down).
 * Must match `INNER` in `shaders.ts` (`CELL_FRAG`).
 */
export const INNER_SAMPLES: readonly (readonly [number, number])[] = [
  [0.28, 0.26],
  [0.72, 0.14],
  [0.28, 0.56],
  [0.72, 0.44],
  [0.28, 0.86],
  [0.72, 0.74],
];
