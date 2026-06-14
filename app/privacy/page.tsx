"use client";

import Image from "next/image";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen font-nunito" style={{ background: "var(--bg)", color: "#e8e8f0" }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Image src="/icons/plulai1.png" alt="Plulai" width={110} height={36} style={{ height: "36px", width: "auto", objectFit: "contain" }} />
          </Link>
          <Link href="/" style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.45)", textDecoration: "none", padding: "8px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", transition: "all .15s" }}>
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "72px 24px 48px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(28,176,246,0.12), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(28,176,246,0.1)", border: "1px solid rgba(28,176,246,0.25)", color: "#14D4F4", fontSize: "11px", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", padding: "6px 14px", borderRadius: "999px", marginBottom: "24px" }}>
            🔒 Privacy Policy
          </div>
          <h1 className="font-fredoka" style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 700, color: "#fff", marginBottom: "16px", lineHeight: 1.05, letterSpacing: "-0.5px" }}>
            Your privacy matters to us.
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            Last updated: June 2026 &nbsp;·&nbsp; Effective immediately
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>

          {/* Intro card */}
          <div style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px 32px", marginBottom: "32px", borderLeft: "3px solid #1CB0F6" }}>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.65)", lineHeight: 1.8 }}>
              Plulai Education (&ldquo;Plulai,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting the privacy of children and families who use our platform. This policy explains what data we collect, why we collect it, and how we protect it — especially when the user is a child.
            </p>
          </div>

          {[
            {
              icon: "👤",
              title: "1. Who This Policy Covers",
              color: "#1CB0F6",
              content: [
                "This policy applies to all users of the Plulai platform, including children aged 6–18, their parents or guardians, and school administrators. We take special care to comply with child privacy laws including COPPA and applicable GCC regulations.",
              ],
            },
            {
              icon: "📋",
              title: "2. What We Collect",
              color: "#14D4F4",
              content: [
                "Account information: name, email address, age group, and password (hashed) provided at registration.",
                "Learning data: lesson progress, XP points, streaks, quiz results, and completed projects — used solely to personalise the learning experience.",
                "Device & usage data: browser type, device type, approximate location (country level), and session duration for performance and security purposes.",
                "Communications: messages sent to our support team.",
                "We do not collect: government IDs, precise location, biometrics, or any sensitive personal data beyond what is listed above.",
              ],
            },
            {
              icon: "🎯",
              title: "3. How We Use Your Data",
              color: "#FAA918",
              content: [
                "To deliver and personalise the learning experience (AI coach adaptation, streak tracking, progress reports).",
                "To send weekly parent summaries and important account notifications.",
                "To improve the platform — we analyse aggregated, anonymised usage patterns.",
                "To provide customer support.",
                "We never use your data to serve ads, and we never sell data to third parties.",
              ],
            },
            {
              icon: "🛡️",
              title: "4. Children's Privacy",
              color: "#58CC02",
              content: [
                "Children under 13 may only use Plulai with verifiable parental consent. Accounts for children are created and managed by a parent or school administrator.",
                "AI coach responses are filtered and moderated to ensure age-appropriate content at all times.",
                "Parents may request to review, correct, or delete their child's data at any time by contacting hello@plulai.com.",
                "We do not allow children to publicly post content or communicate with other users outside of the structured learning environment.",
              ],
            },
            {
              icon: "🔐",
              title: "5. Data Security",
              color: "#8B5CF6",
              content: [
                "All data is encrypted in transit (TLS 1.3) and at rest (AES-256).",
                "We conduct regular security audits and follow industry best practices.",
                "Access to personal data is restricted to authorised Plulai team members on a need-to-know basis.",
                "In the event of a data breach, we will notify affected users within 72 hours as required by applicable law.",
              ],
            },
            {
              icon: "🌍",
              title: "6. Data Storage & Transfers",
              color: "#1CB0F6",
              content: [
                "Data is stored on servers located in the European Union and/or the United Arab Emirates, depending on your region.",
                "If data is transferred across borders, we ensure appropriate safeguards are in place including Standard Contractual Clauses where required.",
              ],
            },
            {
              icon: "⏱️",
              title: "7. Data Retention",
              color: "#14D4F4",
              content: [
                "We retain account data for as long as the account is active, plus 30 days after deletion to allow for account recovery.",
                "Learning data (progress, XP) is deleted upon account deletion.",
                "Anonymised, aggregated analytics data may be retained indefinitely.",
              ],
            },
            {
              icon: "✅",
              title: "8. Your Rights",
              color: "#FAA918",
              content: [
                "Access: request a copy of all data we hold about you.",
                "Correction: request that inaccurate data be corrected.",
                "Deletion: request that your account and all associated data be permanently deleted.",
                "Portability: receive your data in a machine-readable format.",
                "Objection: object to certain types of processing.",
                "To exercise any of these rights, email hello@plulai.com. We will respond within 30 days.",
              ],
            },
            {
              icon: "🍪",
              title: "9. Cookies",
              color: "#58CC02",
              content: [
                "We use essential cookies only — required for authentication, security, and core platform functionality.",
                "We do not use advertising cookies, third-party tracking pixels, or analytics cookies that identify individuals.",
              ],
            },
            {
              icon: "📝",
              title: "10. Changes to This Policy",
              color: "#8B5CF6",
              content: [
                "We may update this policy from time to time. We will notify you of material changes by email and by posting a notice on the platform at least 14 days before the change takes effect.",
              ],
            },
            {
              icon: "📬",
              title: "11. Contact Us",
              color: "#1CB0F6",
              content: [
                "For privacy questions, data requests, or concerns: hello@plulai.com",
                "Plulai Education — serving families and schools across the GCC and internationally.",
              ],
            },
          ].map((section) => (
            <div key={section.title} style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px 32px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${section.color}18`, border: `1px solid ${section.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                  {section.icon}
                </div>
                <h2 className="font-fredoka" style={{ fontSize: "20px", fontWeight: 600, color: section.color, letterSpacing: "-0.3px" }}>{section.title}</h2>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {section.content.map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.60)", lineHeight: 1.75 }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: section.color, flexShrink: 0, marginTop: "8px", opacity: 0.7 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA */}
          <div style={{ background: "var(--card2)", border: "1px solid rgba(28,176,246,0.15)", borderRadius: "24px", padding: "40px 32px", textAlign: "center", marginTop: "32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(28,176,246,0.1), transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔒</div>
              <h3 className="font-fredoka" style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Questions about your privacy?</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>We&apos;re happy to explain anything in plain language.</p>
              <a href="mailto:hello@plulai.com" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px", borderRadius: "14px", background: "#1CB0F6", color: "#fff", fontSize: "14px", fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 0 #2B70C9" }}>
                Email hello@plulai.com →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "32px 24px", background: "var(--card)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>© 2026 Plulai Education. All rights reserved.</span>
          <div style={{ display: "flex", gap: "24px" }}>
            {[["/#", "Privacy"], ["/terms", "Terms"], ["/about", "About"]].map(([href, label]) => (
              <Link key={label} href={href} style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", textDecoration: "none", fontWeight: 700 }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}