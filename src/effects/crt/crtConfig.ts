export interface CrtEffectConfig {
  /** Master toggle for the entire CRT screen pipeline (Halftone + Chromatic Aberration + Fisheye). */
  enabled: boolean;
  /** Fine halftone dot-matrix + CRT phosphor scanline mask. */
  halftone: boolean;
  /** Retro RGB channel fringe / Chromatic Aberration along high-contrast edges & screen rim. */
  chromaticAberration: boolean;
  /** Subtle barrel-lens fisheye vignette & curved CRT monitor bezel. */
  fisheye: boolean;
  /** Master intensity scale (0.0 to 1.0). */
  intensity: number;
  /** Show the quick [CRT: ON/OFF] toggle widget in the top-right corner. */
  showToggleWidget: boolean;
}

/**
 * Edit this file anytime to configure or disable the CRT screen effect by default.
 */
export const CRT_DEFAULT_CONFIG: CrtEffectConfig = {
  enabled: true,
  halftone: true,
  chromaticAberration: true,
  fisheye: true,
  intensity: 0.72,
  showToggleWidget: true,
};
