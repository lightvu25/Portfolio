"use client";

import { useCallback, useEffect, useState } from "react";

import { gameProjects } from "@/content/games";
import { BootSequence } from "./BootSequence";
import { GameHero } from "./GameHero";
import { GameOutroFooter } from "./GameOutroFooter";
import { GameProjectStage } from "./GameProjectStage";
import {
  MagneticScrollProvider,
  type SectionDescriptor,
} from "./MagneticScroller";
import { PixelCursor } from "./PixelCursor";
import { PixelProgressRail } from "./PixelProgressRail";
import { ProjectPixelBackdrop } from "./ProjectPixelBackdrop";

const SECTIONS: SectionDescriptor[] = [
  { index: 0, id: "hero", label: "INTRO", accentHex: "#00F0FF" },
  ...gameProjects.map((g, idx) => ({
    index: idx + 1,
    id: g.id,
    label: `GAME ${g.index}`,
    accentHex: g.theme.accentHex,
  })),
  {
    index: gameProjects.length + 1,
    id: "outro",
    label: "HIRE",
    accentHex: "#00FF88",
  },
];

export function GamePortfolioApp() {
  const [webglState, setWebglState] = useState<
    "pending" | "ready" | "fallback"
  >("pending");

  const handleWebglState = useCallback((state: "ready" | "fallback") => {
    setWebglState(state);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("no-root-scrollbar");
    return () => {
      html.classList.remove("no-root-scrollbar");
    };
  }, []);

  return (
    <MagneticScrollProvider sections={SECTIONS}>
      <PixelCursor />
      <BootSequence webglState={webglState} />
      <PixelProgressRail />
      <ProjectPixelBackdrop />

      <main id="main-content" className="crt-fisheye-lens relative w-full">
        <GameHero onWebglState={handleWebglState} />
        {gameProjects.map((game, idx) => (
          <GameProjectStage
            key={game.id}
            game={game}
            stageIndex={idx + 1}
            totalGames={gameProjects.length}
            mediaOnLeft={idx % 2 === 1}
          />
        ))}
        <GameOutroFooter stageIndex={gameProjects.length + 1} />
      </main>
    </MagneticScrollProvider>
  );
}
