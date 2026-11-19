/**
 * Zero-JS static SVG blueprint of the 15x18 pixel cursor arrow + spark.
 * Displays immediately during SSR / initial paint (zero CLS) and remains as
 * a permanent crisp fallback when WebGL2 is unavailable.
 */
const BLUEPRINT_ROWS = [
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

function glyphForCode(code: string, row: number, col: number): string {
  if (code === "s") return "+";
  if (code === "3") return (row + col) % 2 === 0 ? "#" : "@";
  if (code === "2") return (row + col) % 2 === 0 ? "/" : "%";
  if (code === "1") return ":";
  return "";
}

export function AsciiMarkFallback({ className = "" }: { className?: string }) {
  const cellW = 16;
  const cellH = 16;
  const cols = 15;
  const rows = BLUEPRINT_ROWS.length;
  const pad = 28;
  const vbW = cols * cellW + pad * 2;
  const vbH = rows * cellH + pad * 2;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      fill="none"
      role="img"
      aria-label="Pixel cursor mark rendered in ASCII characters"
      className={`h-full w-full select-none ${className}`.trim()}
    >
      {BLUEPRINT_ROWS.map((line, r) =>
        Array.from(line).map((code, c) => {
          if (code === ".") return null;
          const x = pad + c * cellW;
          const y = pad + r * cellH;
          const isSpark = code === "s";
          const isRim = code === "1";

          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x + 1}
                y={y + 1}
                width={cellW - 2}
                height={cellH - 2}
                fill={
                  isSpark
                    ? "var(--pixel-amber)"
                    : isRim
                      ? "var(--paper-2)"
                      : "var(--accent-soft)"
                }
                opacity={isSpark ? 0.35 : 0.75}
              />
              <text
                x={x + cellW / 2}
                y={y + cellH / 2 + 4}
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
                fontSize="12"
                fontWeight="600"
                fill={isSpark ? "var(--accent)" : "var(--ink)"}
              >
                {glyphForCode(code, r, c)}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}
