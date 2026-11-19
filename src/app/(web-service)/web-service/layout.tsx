import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.brandTitle} — Web Development Services & Portfolio`,
    template: `%s | ${siteConfig.brandTitle}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    title: `${siteConfig.brandTitle} — Portfolio & Web Development Services`,
    description: siteConfig.description,
    siteName: siteConfig.brandTitle,
  },
};

export default function WebServiceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      lang="en"
      className="web-service-root flex min-h-screen flex-col bg-paper text-ink"
    >
      <MotionProvider>
        <SkipLink />
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </MotionProvider>
    </div>
  );
}
