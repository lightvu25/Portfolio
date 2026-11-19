import { BufferAttribute, BufferGeometry } from "three";

/**
 * Editable 2D voxel blueprint for the 3D ASCII hero mark (Pixel Cursor Arrow + Spark).
 * Legend:
 *  '.' = empty
 *  '1' = outer bevel step
 *  '2' = mid body relief
 *  '3' = raised spine relief
 *  's' = floating pixel click-spark (offset forward in Z for 3D orbit parallax)
 */
export const CURSOR_VOXEL_MAP: readonly string[] = [
  "11....ss.......",
  "121...ss.......",
  "1221.....s.....",
  "12321..........",
  "123321.........",
  "1233321........",
  "12333321.......",
  "123333321......",
  "1233333321.....",
  "12333333321....",
  "123333333321...",
  "1233332111111..",
  "123212321......",
  "1221.12321.....",
  "121...12321....",
  "11....12321....",
  ".......1221....",
  "........11.....",
];

interface VoxelSpan {
  zMin: number;
  zMax: number;
}

function spanForCode(code: string): VoxelSpan | null {
  switch (code) {
    case "1":
      return { zMin: -0.52, zMax: 0.52 };
    case "2":
      return { zMin: -0.84, zMax: 0.84 };
    case "3":
      return { zMin: -1.12, zMax: 1.12 };
    case "s":
      return { zMin: 0.42, zMax: 1.32 };
    default:
      return null;
  }
}

function exposedSegments(
  self: VoxelSpan,
  neighbor: VoxelSpan | null
): [number, number][] {
  if (!neighbor || neighbor.zMax <= self.zMin || neighbor.zMin >= self.zMax) {
    return [[self.zMin, self.zMax]];
  }
  const out: [number, number][] = [];
  if (neighbor.zMin > self.zMin) {
    out.push([self.zMin, Math.min(self.zMax, neighbor.zMin)]);
  }
  if (neighbor.zMax < self.zMax) {
    out.push([Math.max(self.zMin, neighbor.zMax), self.zMax]);
  }
  return out;
}

export interface VoxelMarkResult {
  geometry: BufferGeometry;
  size: number;
}

/**
 * Extrudes `bitmap` into an exposed-face 3D voxel BufferGeometry centered on its
 * visual bounding box, with subtle normal camber on front/back caps so studio
 * lighting produces rich ASCII tonal gradation even at rest.
 */
export function buildVoxelGeometry(
  bitmap: readonly string[] = CURSOR_VOXEL_MAP
): VoxelMarkResult {
  const rows = bitmap.length;
  const cols = Math.max(...bitmap.map((r) => r.length));

  let minCol = cols;
  let maxCol = 0;
  let minRow = rows;
  let maxRow = 0;

  const grid: (VoxelSpan | null)[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (__, c) => {
      const span = spanForCode(bitmap[r]?.[c] ?? ".");
      if (span) {
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
      }
      return span;
    })
  );

  const width = Math.max(maxCol - minCol + 1, 1);
  const height = Math.max(maxRow - minRow + 1, 1);
  const size = Math.max(width, height);
  const originX = (minCol + maxCol + 1) / 2;
  const originY = (minRow + maxRow + 1) / 2;

  const positions: number[] = [];
  const normals: number[] = [];

  type Vec3 = [number, number, number];

  const pushVertex = (p: Vec3, n: Vec3) => {
    positions.push(p[0], p[1], p[2]);
    normals.push(n[0], n[1], n[2]);
  };

  const pushQuad = (a: Vec3, b: Vec3, c: Vec3, d: Vec3, n: Vec3) => {
    pushVertex(a, n);
    pushVertex(b, n);
    pushVertex(c, n);
    pushVertex(a, n);
    pushVertex(c, n);
    pushVertex(d, n);
  };

  const pushCapQuad = (
    a: Vec3,
    b: Vec3,
    c: Vec3,
    d: Vec3,
    signZ: 1 | -1
  ) => {
    const camberedNormal = (v: Vec3): Vec3 => {
      const nx = (v[0] / (size * 0.5)) * 0.34;
      const ny = (v[1] / (size * 0.5)) * 0.34;
      const nz = signZ;
      const len = Math.hypot(nx, ny, nz) || 1;
      return [nx / len, ny / len, nz / len];
    };
    const na = camberedNormal(a);
    const nb = camberedNormal(b);
    const nc = camberedNormal(c);
    const nd = camberedNormal(d);
    pushVertex(a, na);
    pushVertex(b, nb);
    pushVertex(c, nc);
    pushVertex(a, na);
    pushVertex(c, nc);
    pushVertex(d, nd);
  };

  const at = (r: number, c: number): VoxelSpan | null => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return grid[r][c];
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const span = grid[r][c];
      if (!span) continue;

      const x0 = c - originX;
      const x1 = c + 1 - originX;
      // Flip Y so row 0 is at the top in 3D space
      const y1 = originY - r;
      const y0 = originY - (r + 1);
      const { zMin, zMax } = span;

      // Front (+Z) and Back (-Z) caps
      pushCapQuad([x0, y0, zMax], [x1, y0, zMax], [x1, y1, zMax], [x0, y1, zMax], 1);
      pushCapQuad([x1, y0, zMin], [x0, y0, zMin], [x0, y1, zMin], [x1, y1, zMin], -1);

      // Right (+X) exposed segments
      for (const [zA, zB] of exposedSegments(span, at(r, c + 1))) {
        pushQuad([x1, y0, zB], [x1, y0, zA], [x1, y1, zA], [x1, y1, zB], [1, 0, 0]);
      }
      // Left (-X) exposed segments
      for (const [zA, zB] of exposedSegments(span, at(r, c - 1))) {
        pushQuad([x0, y0, zA], [x0, y0, zB], [x0, y1, zB], [x0, y1, zA], [-1, 0, 0]);
      }
      // Top (+Y -> r - 1) exposed segments
      for (const [zA, zB] of exposedSegments(span, at(r - 1, c))) {
        pushQuad([x0, y1, zB], [x1, y1, zB], [x1, y1, zA], [x0, y1, zA], [0, 1, 0]);
      }
      // Bottom (-Y -> r + 1) exposed segments
      for (const [zA, zB] of exposedSegments(span, at(r + 1, c))) {
        pushQuad([x0, y0, zA], [x1, y0, zA], [x1, y0, zB], [x0, y0, zB], [0, -1, 0]);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.setAttribute(
    "normal",
    new BufferAttribute(new Float32Array(normals), 3)
  );

  return { geometry, size };
}
