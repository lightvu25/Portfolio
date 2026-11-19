import type { Metadata } from "next";

import { GamePortfolioApp } from "@/components/game/GamePortfolioApp";
import { gameProfile } from "@/content/profile";

export const metadata: Metadata = {
  title: `${gameProfile.fullName} — ${gameProfile.role} Portfolio`,
  description: gameProfile.bio,
};

export default function GameHomePage() {
  return <GamePortfolioApp />;
}
