"use client";

import Image from "next/image";
import { useState } from "react";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const BOOK = {
  coverImage: "/images/bookcover.png",
  currency: "د.ت",
  deliveryCost: 8,
  versions: {
    fr: {
      label: "Français",
      flag: "🇫🇷",
      title: "Version Française",
      subtitle: "كتاب مخصّص للأطفال بين 6 و18 سنة يتعلّمون فيه Python وهندسة البرومبت والذكاء الاصطناعي، مع وصول مجاني لمنصة Plulai لمدة 3 أشهر.",
      price: 25,
      originalPrice: 45,
      language: "Français",
      features: [
        "Contenu original en français",
        "أمثلة عملية وتطبيقية",
        "مناسب للأطفال من 6 إلى 18 سنة",
        "وصول مجاني لـ Plulai لمدة 3 أشهر",
        "توصيل لجميع ولايات تونس",
      ],
    },
    en: {
      label: "English",
      flag: "🇬🇧",
      title: "English Version",
      subtitle: "A book for kids aged 6 to 18 to learn Python, prompt engineering, and AI — with free access to Plulai for 3 months.",
      price: 25,
      originalPrice: 45,
      language: "English",
      features: [
        "Original content in English",
        "Practical examples and exercises",
        "For kids aged 6 to 18",
        "Free 3-month access to Plulai",
        "Delivery across all of Tunisia",
      ],
    },
  },
  delivery: "2–4 أيام عمل",
};
// ─────────────────────────────────────────────────────────────────────────────

// REBUILD NOTE — why this changed:
// The previous version used a dark "SaaS checkout" theme (near-black #0D2B32
// page background, glowing card surfaces, a gold primary button) that exists
// nowhere else on plulai.com. The homepage runs light, Pearl-White-based, and
// treats Reef/Reef Bright teal as the one consistent "primary action" color
// across every CTA (nav, hero, final CTA, package cards) — gold and coral are
// reserved for badges and urgency accents, never the main button. This is a
// consumer purchase page for a kids' book, i.e. the same audience as the
// homepage's "For Families" (Energetic) mode — so it now uses that mode:
// light Pearl White background, Lagoon-tinted surfaces, Reef Bright as the
// primary CTA color, Sun Gold for the "new" badge, Coral for the discount
// ribbon and savings line, and Error red reserved strictly for form
// validation (per the brand spec: "Error — forms only"), never reused for
// promotional urgency the way the old version reused red for both.
//
// Plulai "Energetic mode" palette (B2C, kid-facing — matches the homepage):
//   Pearl white #F6F3EA · Lagoon #EAF7F4 · Lagoon fill #D9F1EC ·
//   Depth #0D2B32 · Ink #29394A · Reef bright #17D9C0 ·
//   Sun gold #FFB930 · Coral #FF6B57 · Error (forms only) #E15B71
// The two "-deep" tones are darkened variants of Reef Bright / Sun Gold used
// only for the pressed-button shadow effect — not separate brand colors.
const inlineStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap');

  :root {
    --background: #F6F3EA;        /* Pearl white */
    --foreground: #0D2B32;        /* Depth */
    --surface: #FFFFFF;
    --surface-2: #EAF7F4;         /* Lagoon, for input/track backgrounds */
    --surface-tint: #D9F1EC;      /* Lagoon fill */
    --border: rgba(13,43,50,0.10);
    --border-strong: rgba(13,43,50,0.16);
    --muted-foreground: rgba(41,57,74,0.62); /* Ink, faded */
    --brand-teal: #17D9C0;        /* Reef bright — primary action color, matches every CTA on plulai.com */
    --brand-teal-deep: #119E8E;   /* darker Reef bright, for the button's pressed shadow */
    --brand-gold: #FFB930;        /* Sun gold — badges only, not buttons */
    --brand-gold-deep: #C98B00;   /* darker Sun gold, for badge shadow */
    --brand-coral: #FF6B57;       /* Coral — promotional/urgency accents only */
    --brand-error: #E15B71;       /* Error red — form validation ONLY, never reused for promo */
    --shadow-teal: 0 4px 0 var(--brand-teal-deep);
    --shadow-dark: 0 4px 0 rgba(13,43,50,0.25);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: 'Cairo', system-ui, sans-serif;
    direction: rtl;
  }

  .btn-primary {
    background: var(--brand-teal); color: #0D2B32;
    box-shadow: var(--shadow-teal);
    transition: transform .1s ease, box-shadow .1s ease;
    cursor: pointer; border: none;
  }
  .btn-primary:active { box-shadow: 0 0 0 var(--brand-teal-deep); transform: translateY(4px); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .btn-back {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px;
    background: transparent; border: 1px solid var(--border-strong);
    color: var(--muted-foreground); font-size: 13px; font-weight: 700;
    cursor: pointer; text-decoration: none;
    transition: color .15s, border-color .15s, background .15s;
    font-family: 'Cairo', sans-serif;
  }
  .btn-back:hover { color: var(--foreground); border-color: var(--brand-teal); background: var(--surface-2); }

  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .animate-bob { animation: none; }
  }

  .animate-bob  { animation: bob 4s cubic-bezier(0.34,1.56,0.64,1) infinite; }
  .animate-in   { animation: fadeInUp 0.4s ease forwards; }

  input, select, textarea {
    font-family: 'Cairo', system-ui, sans-serif;
    font-size: 1rem; direction: rtl; text-align: right;
  }
  input:focus, select:focus, textarea:focus {
    outline: 2px solid var(--brand-teal); outline-offset: 2px;
  }

  .qty-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--surface-2); border: 1px solid var(--border);
    color: var(--foreground); font-size: 1.2rem; font-weight: 700;
    cursor: pointer; display: grid; place-items: center;
    transition: background .15s, color .15s;
  }
  .qty-btn:hover:not(:disabled) { background: var(--brand-teal); }
  .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .ver-btn {
    flex: 1; padding: 10px 0; border-radius: 14px;
    font-weight: 800; font-size: 15px; border: none;
    cursor: pointer; transition: all .15s ease;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    font-family: 'Cairo', sans-serif;
  }
  /* Same "dark pill on light track" pattern as the homepage's audience toggle,
     so the interaction language matches across pages. */
  .ver-btn-active   { background: var(--foreground); color: var(--background); }
  .ver-btn-inactive { background: transparent; color: var(--muted-foreground); }
  .ver-btn-inactive:hover { color: var(--foreground); }

  .discount-badge {
    display: inline-flex; align-items: center;
    background: rgba(255,107,87,0.12); color: var(--brand-coral);
    border: 1px solid rgba(255,107,87,0.3);
    border-radius: 999px; padding: 2px 10px;
    font-size: 12px; font-weight: 900;
  }
`;

const GOVERNORATES = [
  "تونس","أريانة","بن عروس","منوبة",
  "نابل","زغوان","بنزرت","باجة",
  "جندوبة","الكاف","سليانة","القصرين",
  "سيدي بوزيد","سوسة","المنستير","المهدية",
  "صفاقس","قفصة","توزر","قبلي",
  "قابس","مدنين","تطاوين","ولاية أخرى",
];

type Version  = "fr" | "en";
type FormState = { name: string; phone: string; governorate: string; address: string };
type Status   = "idle" | "loading" | "success" | "error";

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="animate-in" role="status" style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
      <h2 style={{ fontFamily: "Cairo", fontWeight: 900, fontSize: 28, marginBottom: 12, color: "var(--foreground)" }}>
        يعيشك {name}، وصلنا الطلب!
      </h2>
      <p style={{ color: "var(--muted-foreground)", fontSize: 16, lineHeight: 1.9, fontFamily: "Tajawal, sans-serif", marginBottom: 32 }}>
        فريقنا باش يتصل بيك في أقرب وقت باش يأكّد الطلب ويحدّد موعد التوصيل.
        <br />الدفع عند الاستلام — ما فيش حاجة تدفع دابا.
      </p>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 12,
        padding: "16px 28px", borderRadius: 16,
        background: "var(--surface-2)", border: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 28 }}>📦</span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--foreground)" }}>وقت التوصيل المتوقّع</div>
          <div style={{ color: "var(--brand-teal-deep)", fontWeight: 700 }}>{BOOK.delivery}</div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [version, setVersion] = useState<Version>("fr");
  const [qty, setQty]         = useState(1);
  const [form, setForm]       = useState<FormState>({ name: "", phone: "", governorate: "", address: "" });
  const [status, setStatus]   = useState<Status>("idle");
  const [errors, setErrors]   = useState<Partial<FormState>>({});

  const v        = BOOK.versions[version];
  const subtotal = qty * v.price;
  const total    = subtotal + BOOK.deliveryCost;

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim())                                             e.name        = "الاسم مطلوب";
    if (!form.phone.trim() || !/^[0-9+\s]{8,15}$/.test(form.phone))  e.phone       = "رقم هاتف غلط";
    if (!form.governorate)                                             e.governorate = "اختر الولاية";
    if (!form.address.trim() || form.address.trim().length < 8)       e.address     = "زد تفاصيل أكثر للعنوان";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp:   new Date().toLocaleString("ar-TN"),
          name:        form.name,
          phone:       form.phone,
          governorate: form.governorate,
          address:     form.address,
          version:     `${v.flag} ${v.label}`,
          quantity:    String(qty),
          total:       `${total} ${BOOK.currency}`,
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  // ── Reusable text input ─────────────────────────────────────────────────────
  const inputField = (
    key: keyof FormState,
    label: string,
    placeholder: string,
    type = "text",
  ) => {
    const id = `field-${key}`;
    const errId = `error-${key}`;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor={id} style={{ fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>{label}</label>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={form[key]}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? errId : undefined}
          onChange={(e) => {
            setForm((f) => ({ ...f, [key]: e.target.value }));
            setErrors((er) => ({ ...er, [key]: undefined }));
          }}
          style={{
            padding: "12px 16px", borderRadius: 12,
            background: "var(--surface-2)",
            border: errors[key] ? "1.5px solid var(--brand-error)" : "1.5px solid var(--border)",
            color: "var(--foreground)", width: "100%",
          }}
        />
        {errors[key] && (
          <span id={errId} role="alert" style={{ color: "var(--brand-error)", fontSize: 12, fontWeight: 600 }}>
            {errors[key]}
          </span>
        )}
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
      <div style={{ minHeight: "100vh", background: "var(--background)", direction: "rtl" }}>

        {/* NAV — same light nav treatment as the rest of plulai.com */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          backdropFilter: "blur(12px)",
          background: "rgba(246,243,234,0.9)",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <a href="https://plulai.com" className="btn-back">
                ← الرجوع
              </a>
              <a href="/ar" style={{ textDecoration: "none" }}>
                <Image src="/icons/plulai1.png" alt="بلولاي" width={120} height={40} style={{ height: 40, width: "auto", objectFit: "contain" }} />
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)", fontFamily: "Tajawal, sans-serif" }}>الدفع عند الاستلام</span>
              <span style={{
                background: "var(--surface-tint)", color: "var(--brand-teal-deep)",
                borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 800,
                border: "1px solid rgba(23,217,192,0.35)",
              }}>🔒 آمن</span>
            </div>
          </div>
        </nav>

        {/* TRUST BAND */}
        <div style={{
          background: "var(--surface-2)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 24px", textAlign: "center",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-teal-deep)", fontFamily: "Tajawal, sans-serif" }}>
            🚚 التوصيل لجميع ولايات تونس &nbsp;·&nbsp; الدفع عند الاستلام &nbsp;·&nbsp; ضمان استرجاع 7 أيام
          </span>
        </div>

        {/* MAIN */}
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
          {status === "success" ? (
            <div style={{ maxWidth: 500, margin: "0 auto" }}>
              <SuccessScreen name={form.name} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "start" }}>

              {/* LEFT: book info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                {/* Cover + discount badge */}
                <div style={{ position: "relative", width: "100%", maxWidth: 300, margin: "0 auto" }}>
                  <div style={{
                    position: "absolute", top: -12, left: -12, zIndex: 10,
                    background: "var(--brand-coral)", color: "white",
                    borderRadius: 999, width: 64, height: 64,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    fontFamily: "Cairo", fontWeight: 900, lineHeight: 1.1,
                    boxShadow: "0 4px 12px rgba(255,107,87,0.4)",
                  }}>
                    <span style={{ fontSize: 10 }}>خصم</span>
                    <span style={{ fontSize: 18 }}>44%</span>
                  </div>

                  <div className="animate-bob">
                    <Image
                      src={BOOK.coverImage}
                      alt={v.title}
                      width={300}
                      height={400}
                      style={{
                        width: "100%", height: "auto", borderRadius: 16, display: "block",
                        boxShadow: "0 30px 60px -10px rgba(23,217,192,0.28), 0 0 0 1px rgba(13,43,50,0.06)",
                      }}
                    />
                  </div>

                  <div style={{
                    position: "absolute", top: 14, right: 14,
                    background: "var(--brand-gold)", color: "#0D2B32",
                    borderRadius: 10, padding: "4px 10px", fontSize: 12, fontWeight: 900,
                  }}>جديد</div>
                </div>

                {/* Details card */}
                <div style={{
                  background: "var(--surface)", borderRadius: 20,
                  border: "1px solid var(--border)", padding: 24,
                  boxShadow: "0 1px 2px rgba(13,43,50,0.04)",
                  display: "flex", flexDirection: "column", gap: 16,
                }}>
                  <h1 style={{ fontFamily: "Cairo", fontWeight: 900, fontSize: 24, lineHeight: 1.3, color: "var(--foreground)" }}>{v.title}</h1>
                  <p style={{ color: "var(--muted-foreground)", fontFamily: "Tajawal, sans-serif", lineHeight: 1.9, fontSize: 15 }}>
                    {v.subtitle}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {[
                      { icon: "🌐", label: v.language },
                      { icon: "🚚", label: BOOK.delivery },
                      { icon: "🎓", label: "6–18 سنة" },
                    ].map((m) => (
                      <span key={m.label} style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 999,
                        background: "var(--surface-2)", border: "1px solid var(--border)",
                        fontSize: 13, fontWeight: 700, color: "var(--foreground)",
                      }}>{m.icon} {m.label}</span>
                    ))}
                  </div>

                  <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {v.features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontFamily: "Tajawal, sans-serif", color: "var(--foreground)" }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: 8, flexShrink: 0,
                          background: "var(--surface-tint)", display: "grid", placeItems: "center",
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#119E8E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* RIGHT: order form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* VERSION TOGGLE — same "dark pill on light track" tabs pattern as the homepage */}
                <div style={{
                  background: "var(--surface)", borderRadius: 20,
                  border: "1px solid var(--border)", padding: 20,
                  boxShadow: "0 1px 2px rgba(13,43,50,0.04)",
                  display: "flex", flexDirection: "column", gap: 12,
                }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: "var(--foreground)" }}>اختر نسخة الكتاب</span>
                  <div
                    role="tablist"
                    aria-label="اختر نسخة الكتاب"
                    style={{
                      display: "flex", gap: 8, padding: 6,
                      background: "var(--surface-2)", borderRadius: 16,
                      border: "1px solid var(--border)",
                    }}
                  >
                    {(["fr", "en"] as Version[]).map((vk) => (
                      <button
                        key={vk}
                        role="tab"
                        aria-selected={version === vk}
                        onClick={() => setVersion(vk)}
                        className={`ver-btn ${version === vk ? "ver-btn-active" : "ver-btn-inactive"}`}
                      >
                        <span>{BOOK.versions[vk].flag}</span>
                        <span>{BOOK.versions[vk].label}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 12,
                    background: "var(--surface-tint)", border: "1px solid rgba(23,217,192,0.25)",
                  }}>
                    <span style={{ fontSize: 20 }}>{v.flag}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: "var(--foreground)" }}>{v.title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "Tajawal, sans-serif" }}>
                        {v.language} · 6–18 سنة
                      </div>
                    </div>
                    <div style={{ marginRight: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span style={{ fontWeight: 900, color: "var(--brand-teal-deep)", fontSize: 18 }}>
                        {v.price} {BOOK.currency}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)", textDecoration: "line-through" }}>
                        {v.originalPrice} {BOOK.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PRICE + QTY */}
                <div style={{
                  background: "var(--surface)", borderRadius: 20,
                  border: "1px solid var(--border)", padding: 24,
                  boxShadow: "0 1px 2px rgba(13,43,50,0.04)",
                  display: "flex", flexDirection: "column", gap: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                        <span style={{ fontSize: 36, fontWeight: 900, color: "var(--brand-teal-deep)", fontFamily: "Cairo" }}>
                          {v.price}
                        </span>
                        <span style={{ fontSize: 18, color: "var(--muted-foreground)" }}>{BOOK.currency}</span>
                        <span style={{ fontSize: 18, color: "var(--muted-foreground)", textDecoration: "line-through" }}>
                          {v.originalPrice} {BOOK.currency}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                        <span className="discount-badge">تخفيض 44% 🔥</span>
                        <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "Tajawal, sans-serif" }}>
                          تدفع عند ما يوصلك الكتاب
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }} role="group" aria-label="الكمية">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        aria-label="إنقاص الكمية"
                      >−</button>
                      <span style={{ fontWeight: 900, fontSize: 20, minWidth: 24, textAlign: "center", color: "var(--foreground)" }} aria-live="polite">{qty}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => setQty((q) => Math.min(10, q + 1))}
                        disabled={qty >= 10}
                        aria-label="زيادة الكمية"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* DELIVERY FORM */}
                <div style={{
                  background: "var(--surface)", borderRadius: 20,
                  border: "1px solid var(--border)", padding: 24,
                  boxShadow: "0 1px 2px rgba(13,43,50,0.04)",
                  display: "flex", flexDirection: "column", gap: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      background: "var(--brand-teal)", color: "#0D2B32",
                      borderRadius: 8, width: 28, height: 28, display: "grid", placeItems: "center",
                      fontWeight: 900, fontSize: 14, flexShrink: 0,
                    }}>1</span>
                    <span style={{ fontWeight: 800, fontSize: 17, color: "var(--foreground)" }}>بيانات التوصيل</span>
                  </div>

                  {inputField("name",  "الاسم الكامل", "محمد علي")}
                  {inputField("phone", "رقم الهاتف",   "2X XXX XXX", "tel")}

                  {/* Governorate */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label htmlFor="field-governorate" style={{ fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>الولاية</label>
                    <select
                      id="field-governorate"
                      value={form.governorate}
                      aria-invalid={!!errors.governorate}
                      aria-describedby={errors.governorate ? "error-governorate" : undefined}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, governorate: e.target.value }));
                        setErrors((er) => ({ ...er, governorate: undefined }));
                      }}
                      style={{
                        padding: "12px 16px", borderRadius: 12,
                        background: "var(--surface-2)",
                        border: errors.governorate ? "1.5px solid var(--brand-error)" : "1.5px solid var(--border)",
                        color: form.governorate ? "var(--foreground)" : "var(--muted-foreground)",
                        width: "100%", appearance: "none",
                      }}
                    >
                      <option value="">اختر ولايتك</option>
                      {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {errors.governorate && (
                      <span id="error-governorate" role="alert" style={{ color: "var(--brand-error)", fontSize: 12, fontWeight: 600 }}>
                        {errors.governorate}
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label htmlFor="field-address" style={{ fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>العنوان التفصيلي</label>
                    <textarea
                      id="field-address"
                      placeholder="الحي، الشارع، رقم المنزل أو الشقة..."
                      value={form.address}
                      rows={3}
                      aria-invalid={!!errors.address}
                      aria-describedby={errors.address ? "error-address" : undefined}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, address: e.target.value }));
                        setErrors((er) => ({ ...er, address: undefined }));
                      }}
                      style={{
                        padding: "12px 16px", borderRadius: 12,
                        background: "var(--surface-2)",
                        border: errors.address ? "1.5px solid var(--brand-error)" : "1.5px solid var(--border)",
                        color: "var(--foreground)", width: "100%", resize: "vertical",
                        fontFamily: "Tajawal, sans-serif", direction: "rtl", textAlign: "right",
                      }}
                    />
                    {errors.address && (
                      <span id="error-address" role="alert" style={{ color: "var(--brand-error)", fontSize: 12, fontWeight: 600 }}>
                        {errors.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* ORDER SUMMARY */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(23,217,192,0.10), rgba(255,185,48,0.06))",
                  borderRadius: 16,
                  border: "1px solid rgba(23,217,192,0.25)", padding: "16px 20px",
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "var(--muted-foreground)" }}>{v.flag} {v.title} × {qty}</span>
                    <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{subtotal} {BOOK.currency}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "var(--muted-foreground)" }}>التوصيل 🚚</span>
                    <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{BOOK.deliveryCost} {BOOK.currency}</span>
                  </div>

                  <div style={{
                    display: "flex", justifyContent: "space-between", fontSize: 13,
                    padding: "8px 12px", borderRadius: 10,
                    background: "rgba(255,107,87,0.08)", border: "1px solid rgba(255,107,87,0.2)",
                  }}>
                    <span style={{ color: "var(--brand-coral)", fontWeight: 700 }}>💰 وفّرت</span>
                    <span style={{ color: "var(--brand-coral)", fontWeight: 800 }}>
                      {qty * (v.originalPrice - v.price)} {BOOK.currency}
                    </span>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 800, color: "var(--foreground)" }}>الجملة</span>
                    <span style={{ fontWeight: 900, fontSize: 18, color: "var(--brand-teal-deep)" }} aria-live="polite">{total} {BOOK.currency}</span>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  style={{ padding: "16px 24px", borderRadius: 16, fontSize: 18, fontWeight: 900, fontFamily: "Cairo", width: "100%" }}
                >
                  {status === "loading" ? "⏳ نحكّموا الطلب..." : `اطلب توّا · ${total} ${BOOK.currency} ←`}
                </button>

                {status === "error" && (
                  <div role="alert" style={{
                    background: "rgba(225,91,113,0.08)", border: "1px solid rgba(225,91,113,0.3)",
                    borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "var(--brand-error)", fontWeight: 700,
                  }}>
                    صرا مشكل. تحقّق من النت ولّا تواصل معنا مباشرةً.
                  </div>
                )}

                <p style={{ fontSize: 12, color: "var(--muted-foreground)", textAlign: "center", fontFamily: "Tajawal, sans-serif", lineHeight: 1.7 }}>
                  بالضغط على &quot;اطلب توّا&quot; توافق على شروط الاستخدام وسياسة الخصوصية.
                  <br />ما فيش دفع مسبق — تدفع غير عند ما يوصلك الكتاب.
                </p>
              </div>

            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center", marginTop: 48 }}>
          <p style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "Tajawal, sans-serif" }}>
            © 2026 Plulai Education · جميع الحقوق محفوظة
          </p>
        </footer>
      </div>
    </>
  );
}