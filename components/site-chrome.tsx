"use client";

import Image from "next/image";
import { useState } from "react";

export const siteStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');

  :root {
    --radius: 1rem;
    --background: oklch(0.18 0.04 265);
    --foreground: oklch(0.97 0.01 250);
    --surface: oklch(0.23 0.045 265);
    --surface-2: oklch(0.27 0.05 265);
    --card: oklch(0.23 0.045 265);
    --card-foreground: oklch(0.97 0.01 250);
    --popover: oklch(0.23 0.045 265);
    --popover-foreground: oklch(0.97 0.01 250);
    --primary: oklch(0.72 0.17 230);
    --primary-foreground: oklch(0.15 0.04 265);
    --secondary: oklch(0.3 0.05 265);
    --secondary-foreground: oklch(0.97 0.01 250);
    --muted: oklch(0.27 0.04 265);
    --muted-foreground: oklch(0.7 0.02 260);
    --accent: oklch(0.83 0.17 220);
    --accent-foreground: oklch(0.15 0.04 265);
    --destructive: oklch(0.6 0.22 25);
    --destructive-foreground: oklch(0.97 0.01 250);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 12%);
    --ring: oklch(0.72 0.17 230);
    --brand-blue: #1CB0F6;
    --brand-cyan: #14D4F4;
    --brand-deep: #2B70C9;
    --brand-gold: #FAA918;
    --brand-red: #D33131;
    --brand-light: #F5F5F5;
    --brand-muted: #6F6F6F;
    --shadow-blue: 0 4px 0 #2B70C9;
    --shadow-gold: 0 4px 0 #C47D00;
    --shadow-white: 0 4px 0 #D1D5DB;
    --shadow-dark: 0 4px 0 rgba(0,0,0,0.4);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; border-color: oklch(1 0 0 / 10%); }

  html, body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: 'Nunito', system-ui, sans-serif;
  }

  .font-display, h1, h2, h3, h4 {
    font-family: 'Fredoka', system-ui, sans-serif;
    letter-spacing: -0.02em;
  }

  .shelf-blue {
    background: var(--brand-blue);
    color: white;
    box-shadow: var(--shadow-blue);
    transition: transform .1s ease, box-shadow .1s ease;
  }
  .shelf-blue:active { box-shadow: 0 0 0 var(--brand-deep); transform: translateY(4px); }

  .shelf-gold {
    background: var(--brand-gold);
    color: #1A1A2E;
    box-shadow: var(--shadow-gold);
    transition: transform .1s ease, box-shadow .1s ease;
  }
  .shelf-gold:active { box-shadow: 0 0 0 #C47D00; transform: translateY(4px); }

  .shelf-white {
    background: white;
    color: #1A1A2E;
    box-shadow: var(--shadow-white);
    transition: transform .1s ease, box-shadow .1s ease;
  }
  .shelf-white:active { box-shadow: 0 0 0 #D1D5DB; transform: translateY(4px); }

  .shelf-dark {
    background: var(--surface);
    color: var(--foreground);
    box-shadow: var(--shadow-dark);
    transition: transform .1s ease, box-shadow .1s ease;
  }
  .shelf-dark:active { box-shadow: 0 0 0 rgba(0,0,0,0.4); transform: translateY(4px); }

  .bg-background { background-color: var(--background); }
  .bg-surface { background-color: var(--surface); }
  .bg-surface\\/40 { background-color: oklch(0.23 0.045 265 / 40%); }
  .bg-surface\\/60 { background-color: oklch(0.23 0.045 265 / 60%); }
  .text-foreground { color: var(--foreground); }
  .border-border { border-color: oklch(1 0 0 / 10%); }
  .ring-border { --tw-ring-color: oklch(1 0 0 / 10%); }

  .mobile-menu {
    display: none;
    position: fixed;
    inset: 0;
    top: 80px;
    z-index: 49;
    background: oklch(0.18 0.04 265 / 97%);
    backdrop-filter: blur(16px);
    padding: 24px;
    flex-direction: column;
    gap: 8px;
    border-top: 1px solid oklch(1 0 0 / 10%);
    overflow-y: auto;
  }
  .mobile-menu.open { display: flex; }

  .mobile-nav-link {
    display: flex;
    align-items: center;
    padding: 14px 18px;
    border-radius: 14px;
    font-weight: 800;
    font-size: 16px;
    text-decoration: none;
    color: oklch(0.97 0.01 250 / 80%);
    transition: background .15s, color .15s;
    gap: 10px;
  }
  .mobile-nav-link:hover, .mobile-nav-link:active {
    background: oklch(0.27 0.05 265);
    color: oklch(0.97 0.01 250);
  }

  .mobile-nav-divider {
    height: 1px;
    background: oklch(1 0 0 / 8%);
    margin: 8px 0;
  }

  .hamburger {
    width: 40px;
    height: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    cursor: pointer;
    background: var(--surface);
    border: 1px solid oklch(1 0 0 / 12%);
    border-radius: 10px;
    padding: 0;
  }
  .hamburger span {
    display: block;
    width: 18px;
    height: 2px;
    background: var(--foreground);
    border-radius: 2px;
    transition: transform .2s ease, opacity .2s ease;
    transform-origin: center;
  }
  .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; }
  .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: .5; }
    50% { opacity: 1; }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .animate-bob { animation: bob 4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
  .animate-glow { animation: glow-pulse 2s ease-in-out infinite; }
  .mobile-menu.open { animation: slideDown .2s ease forwards; }
`;

export function SiteStyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: siteStyles }} />;
}

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <Image src="/icons/plulai1.png" alt="Plulai" width={120} height={40} className="h-10 w-auto object-contain" />
            </a>
            <div className="hidden lg:flex items-center gap-6 text-sm font-bold text-foreground/70">
              <a href="/#tracks" className="hover:text-foreground transition-colors">Tracks</a>
              <a href="/#how" className="hover:text-foreground transition-colors">How it works</a>
              <a href="/schools" className="hover:text-foreground transition-colors" style={{ color: "var(--brand-cyan)" }}>For Schools</a>
              <a href="/#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
              <a href="/shop" className="hover:text-foreground transition-colors" style={{ color: "var(--brand-gold)" }}>🛍️ Shop</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/auth/login" className="hidden sm:block text-sm font-bold px-4 py-2 hover:text-[var(--brand-blue)] transition-colors">Log in</a>
            <a href="https://www.plulai.com/auth/signup" className="shelf-blue text-sm font-bold py-2.5 px-5 rounded-xl">Try a free lesson →</a>
            <button
              className={`lg:hidden hamburger ${mobileMenuOpen ? "open" : ""}`}
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`} role="dialog" aria-label="Navigation menu">
        <a href="/#tracks" className="mobile-nav-link" onClick={closeMobileMenu}>📚 Tracks</a>
        <a href="/#how" className="mobile-nav-link" onClick={closeMobileMenu}>🗺️ How it works</a>
        <a href="/schools" className="mobile-nav-link" onClick={closeMobileMenu} style={{ color: "var(--brand-cyan)" }}>🏫 For Schools</a>
        <a href="/#pricing" className="mobile-nav-link" onClick={closeMobileMenu}>💳 Pricing</a>
        <a href="/blog" className="mobile-nav-link" onClick={closeMobileMenu}>📝 Blog</a>
        <a href="/shop" className="mobile-nav-link" onClick={closeMobileMenu} style={{ color: "var(--brand-gold)" }}>🛍️ Shop</a>

        <div className="mobile-nav-divider" />

        <a href="/auth/login" className="mobile-nav-link" onClick={closeMobileMenu}>🔑 Log in</a>
        <a
          href="https://www.plulai.com/auth/signup"
          className="shelf-blue font-bold py-4 px-6 rounded-2xl text-center text-base mt-2"
          onClick={closeMobileMenu}
          style={{ textDecoration: "none" }}
        >
          Try a free lesson →
        </a>
      </div>
    </>
  );
}

type FooterColumn = { title: string; links: { label: string; href: string }[] };

const footerLinks: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Tracks", href: "/#tracks" },
      { label: "How it works", href: "/#how" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Shop", href: "/shop" },
    ],
  },
  {
    title: "Schools",
    links: [
      { label: "Overview", href: "/#schools" },
      { label: "Request demo", href: "mailto:hello@plulai.com" },
      { label: "Curriculum", href: "/schools" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "mailto:hello@plulai.com" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image src="/icons/plulai1.png" alt="Plulai" width={100} height={32} className="h-8 w-auto object-contain" />
          </div>
          <p className="text-sm text-foreground/50">Building tomorrow&apos;s leaders, today. Made for the GCC.</p>
        </div>
        {footerLinks.map(({ title, links }) => (
          <div key={title}>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">{title}</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              {links.map(({ label, href }) => (
                <li key={label}><a href={href} className="hover:text-foreground transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-foreground/40">
        <span>© 2026 Plulai Education. All rights reserved.</span>
        <div className="flex gap-6 uppercase tracking-wider font-bold">
          <a href="/privacy" className="hover:text-foreground">Privacy</a>
          <a href="/terms" className="hover:text-foreground">Terms</a>
          <a href="/ar" className="hover:text-foreground">العربية</a>
        </div>
      </div>
    </footer>
  );
}