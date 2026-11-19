import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  Plus_Jakarta_Sans,
  Silkscreen,
  Space_Grotesk,
} from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";

const handjetFont = localFont({
  src: "../../asset/fonts/Handjet/Handjet-VariableFont_ELGR,ELSH,wght.ttf",
  variable: "--font-handjet",
  weight: "100 900",
  display: "swap",
});

const pixelifySansFont = localFont({
  src: "../../asset/fonts/Pixelify_Sans/PixelifySans-VariableFont_wght.ttf",
  variable: "--font-pixel-sans",
  weight: "400 700",
  display: "swap",
});

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const pixelFont = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vũ Minh Quang — Game Developer Portfolio",
    template: "%s | Vũ Minh Quang",
  },
  description:
    "Retro neon pixel-art portfolio of Vũ Minh Quang — Game Developer specializing in gameplay systems, shaders, interactive mechanics, and polished player experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${handjetFont.variable} ${pixelifySansFont.variable} ${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} ${pixelFont.variable}`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
