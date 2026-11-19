"use client";

import { useSyncExternalStore } from "react";

function subscribeMedia(query: string, callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(query);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export function useReducedMotionPref(): boolean {
  return useSyncExternalStore(
    (cb) => subscribeMedia("(prefers-reduced-motion: reduce)", cb),
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

export function useFinePointer(): boolean {
  return useSyncExternalStore(
    (cb) => subscribeMedia("(hover: hover) and (pointer: fine)", cb),
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => false
  );
}
