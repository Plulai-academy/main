// File: layout.tsx
// Placement: app/layout.tsx

import type { Metadata } from "next";
import { Manrope, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// next/font self-hosts these at build time — no external request at runtime,
// and no need for the @import line in globals.css anymore (see note below).
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plulai — Coding, AI & Entrepreneurship for Kids | GCC",
  description:
    "Plulai teaches kids across the GCC to code, think in AI, and build their first business — bilingual, bite-sized, and built around a habit that sticks.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/*
        dir="rtl" + an /ar route is the right long-term setup for the
        Arabic-first version — not wired up here, flagging it as the
        next real piece of work once this English shell is approved.
      */}
      <body
        className={`${manrope.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}