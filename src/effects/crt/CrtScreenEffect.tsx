"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { CRT_DEFAULT_CONFIG, type CrtEffectConfig } from "./crtConfig";
import "./crt.css";

interface CrtContextValue {
  config: CrtEffectConfig;
  toggleCrt: () => void;
  setConfig: (patch: Partial<CrtEffectConfig>) => void;
}

const CrtContext = createContext<CrtContextValue | null>(null);

export function useCrtEffect(): CrtContextValue {
  const ctx = useContext(CrtContext);
  if (!ctx) {
    throw new Error("useCrtEffect must be used within <CrtProvider>.");
  }
  return ctx;
}

export function CrtProvider({
  initialConfig = CRT_DEFAULT_CONFIG,
  children,
}: {
  initialConfig?: CrtEffectConfig;
  children: ReactNode;
}) {
  const [config, setConfigState] = useState<CrtEffectConfig>(initialConfig);

  const toggleCrt = useCallback(() => {
    setConfigState((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const setConfig = useCallback((patch: Partial<CrtEffectConfig>) => {
    setConfigState((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(
    () => ({ config, toggleCrt, setConfig }),
    [config, toggleCrt, setConfig]
  );

  return (
    <CrtContext.Provider value={value}>
      <div
        data-crt-enabled={config.enabled ? "true" : "false"}
        data-crt-halftone={config.halftone ? "true" : "false"}
        data-crt-ca={config.chromaticAberration ? "true" : "false"}
        data-crt-fisheye={config.fisheye ? "true" : "false"}
        style={{ "--crt-intensity": config.intensity } as CSSProperties}
        className="crt-stage-wrapper"
      >
        {children}
      </div>

      {/* Fixed CRT Visual Overlay Layers (strictly pointer-events: none) */}
      {config.enabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[75] overflow-hidden"
        >
          {config.halftone && (
            <div
              className="crt-layer-halftone absolute inset-0"
              style={{ opacity: 0.42 * config.intensity }}
            />
          )}
          {config.chromaticAberration && (
            <div
              className="crt-layer-ca absolute inset-0"
              style={{ opacity: 0.85 * config.intensity }}
            />
          )}
          {config.fisheye && (
            <div
              className="crt-layer-fisheye absolute inset-0"
              style={{ opacity: 0.9 * config.intensity }}
            />
          )}
          <div className="crt-scan-beam absolute inset-x-0 top-0 h-20" />
        </div>
      )}

      {/* Corner Pixel Toggle Button (outside filtered/curved layers) */}
      {config.showToggleWidget && (
        <button
          type="button"
          onClick={toggleCrt}
          aria-pressed={config.enabled}
          aria-label={
            config.enabled ? "Disable CRT effect" : "Enable CRT effect"
          }
          className="pxl-corner-sm pxl-shadow fixed top-3 right-3 z-[85] inline-flex h-8 items-center gap-1.5 border-2 border-retro-border-strong bg-retro-bg/90 px-2.5 font-mono text-[11px] font-semibold tracking-wider text-retro-text backdrop-blur-sm transition-colors hover:border-retro-cyan hover:text-retro-cyan sm:top-4 sm:right-5"
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 ${
              config.enabled
                ? "bg-retro-green shadow-[0_0_8px_#00ff88]"
                : "bg-retro-muted"
            }`}
          />
          <span>CRT: {config.enabled ? "ON" : "OFF"}</span>
        </button>
      )}
    </CrtContext.Provider>
  );
}
