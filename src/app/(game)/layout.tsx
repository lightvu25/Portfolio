"use client";

import { PxlKitSurfaceProvider } from "@pxlkit/ui-kit/common";
import { PxlKitToastProvider } from "@pxlkit/ui-kit/toast";
import type { ReactNode } from "react";

import { CrtProvider } from "@/effects/crt/CrtScreenEffect";

export default function GamePortfolioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="game-portfolio-root min-h-screen bg-[#04060A] text-[#ECF4FF]">
      <PxlKitSurfaceProvider surface="pixel">
        <PxlKitToastProvider position="bottom-right" surface="pixel">
          <CrtProvider>{children}</CrtProvider>
        </PxlKitToastProvider>
      </PxlKitSurfaceProvider>
    </div>
  );
}
