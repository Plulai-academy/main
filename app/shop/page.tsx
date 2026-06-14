"use client";

import { useState } from "react";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// 1. Replace with your Google Apps Script Web App URL (see setup guide below)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

// 2. Book details — swap these out
const BOOK = {
  title: "اسم الكتاب",
  subtitle: "وصف مختصر وجذّاب للكتاب يشرح ما سيكتسبه القارئ من هذا الكتاب الرائع.",
  price: "49",
  currency: "ر.س",
  pages: "٢٤٠ صفحة",
  language: "العربية",
  delivery: "٣–٥ أيام عمل",
  features: [
    "محتوى أصيل باللغة العربية",
    "أمثلة عملية وتطبيقية",
    "مناسب للمبتدئين والمحترفين",
    "شحن لجميع دول الخليج",
  ],
};
// ─────────────────────────────────────────────────────────────────────────────

const inlineStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap');

  :root {
    --radius: 1rem;
    --background: oklch(0.18 0.04 265);
    --foreground: oklch(0.97 0.01 250);
    --surface: oklch(0.23 0.045 265);
    --surface-2: oklch(0.27 0.05 265);
    --border: oklch(1 0 0 / 10%);
    --muted-foreground: oklch(0.7 0.02 260);
    --brand-blue: #1CB0F6;
    --brand-cyan: #14D4F4;
    --brand-deep: #2B70C9;
    --brand-gold: #FAA918;
    --brand-red: #D33131;
    --shadow-blue: 0 4px 0 #2B70C9;
    --shadow-gold: 0 4px 0 #C47D00;
    --shadow-dark: 0 4px 0 rgba(0,0,0,0.4);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: 'Cairo', system-ui, sans-serif;
    direction: rtl;
  }

  .shelf-blue {
    background: var(--brand-blue);
    color: white;
    box-shadow: var(--shadow-blue);
    transition: transform .1s ease, box-shadow .1s ease;
    cursor: pointer;
    border: none;
  }
  .shelf-blue:active { box-shadow: 0 0 0 var(--brand-deep); transform: translateY(4px); }
  .shelf-blue:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: var(--shadow-blue); }

  .shelf-gold {
    background: var(--brand-gold);
    color: #1A1A2E;
    box-shadow: var(--shadow-gold);
    transition: transform .1s ease, box-shadow .1s ease;
    cursor: pointer;
    border: none;
  }
  .shelf-gold:active { box-shadow: 0 0 0 #C47D00; transform: translateY(4px); }

  .shelf-dark {
    background: var(--surface);
    color: var(--foreground);
    box-shadow: var(--shadow-dark);
    transition: transform .1s ease, box-shadow .1s ease;
  }

  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: .5; }
    50% { opacity: 1; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .animate-bob { animation: bob 4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
  .animate-glow { animation: glow-pulse 2s ease-in-out infinite; }
  .animate-in { animation: fadeInUp 0.4s ease forwards; }

  input, select, textarea {
    font-family: 'Cairo', system-ui, sans-serif;
    font-size: 1rem;
    direction: rtl;
    text-align: right;
  }

  input:focus, select:focus, textarea:focus {
    outline: 2px solid var(--brand-blue);
    outline-offset: 2px;
  }

  /* Quantity stepper */
  .qty-btn {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--foreground);
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background .15s;
  }
  .qty-btn:hover { background: var(--brand-blue); }
`;

// Saudi Arabia cities (Gulf-friendly)
const CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
  "الخبر", "تبوك", "بريدة", "أبها", "نجران", "حائل", "الطائف",
  "الكويت", "أبوظبي", "دبي", "الشارقة", "الدوحة", "المنامة", "مسقط",
  "أخرى",
];

type FormState = { name: string; phone: string; city: string; address: string };
type Status = "idle" | "loading" | "success" | "error";

function BookCover() {
  return (
    <div
      className="animate-bob"
      style={{
        width: "100%", maxWidth: 300, margin: "0 auto",
        aspectRatio: "3/4",
        borderRadius: 16,
        background: "linear-gradient(145deg, #1CB0F6 0%, #2B70C9 60%, #14D4F4 100%)",
        boxShadow: "0 30px 60px -10px rgba(28,176,246,0.45), 0 0 0 1px rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* decorative circles */}
      <div style={{ position: "absolute", top: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      <div style={{ position: "absolute", bottom: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

      <div style={{ fontSize: 64, marginBottom: 16 }}>📘</div>
      <div style={{ color: "white", fontWeight: 900, fontSize: 22, textAlign: "center", lineHeight: 1.3, marginBottom: 8 }}>
        {BOOK.title}
      </div>
      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textAlign: "center", fontFamily: "Tajawal, sans-serif" }}>
        {BOOK.subtitle.slice(0, 40)}…
      </div>

      {/* badge */}
      <div style={{
        position: "absolute", top: 16, right: 16,
        background: "var(--brand-gold)", color: "#1A1A2E",
        borderRadius: 10, padding: "4px 10px",
        fontSize: 12, fontWeight: 900,
      }}>
        جديد
      </div>
    </div>
  );
}

function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="animate-in" style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
      <h2 style={{ fontFamily: "Cairo", fontWeight: 900, fontSize: 28, marginBottom: 12 }}>
        تم استلام طلبك، {name}!
      </h2>
      <p style={{ color: "var(--muted-foreground)", fontSize: 16, lineHeight: 1.8, fontFamily: "Tajawal, sans-serif", marginBottom: 32 }}>
        سيتصل بك فريقنا خلال ٢٤ ساعة لتأكيد الطلب وترتيب التوصيل.
        <br />الدفع عند الاستلام.
      </p>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 12,
        padding: "16px 28px", borderRadius: 16,
        background: "var(--surface)", border: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 28 }}>📦</span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>التوصيل المتوقع</div>
          <div style={{ color: "var(--brand-gold)", fontWeight: 700 }}>٣–٥ أيام عمل</div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState<FormState>({ name: "", phone: "", city: "", address: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const total = qty * parseInt(BOOK.price);

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "الاسم مطلوب";
    if (!form.phone.trim() || !/^[0-9+\s]{8,15}$/.test(form.phone.trim())) e.phone = "رقم هاتف غير صحيح";
    if (!form.city) e.city = "المدينة مطلوبة";
    if (!form.address.trim() || form.address.trim().length < 10) e.address = "العنوان قصير جداً";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStatus("loading");

    try {
      const payload = {
        timestamp: new Date().toLocaleString("ar-SA"),
        name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address,
        quantity: qty,
        total: `${total} ${BOOK.currency}`,
        book: BOOK.title,
      };

      // Google Apps Script accepts POST with no-cors
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const field = (
    key: keyof FormState,
    label: string,
    placeholder: string,
    type: string = "text",
    extra?: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontWeight: 700, fontSize: 14 }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: undefined })); }}
        {...extra}
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          background: "var(--surface-2)",
          border: errors[key] ? "1.5px solid var(--brand-red)" : "1.5px solid var(--border)",
          color: "var(--foreground)",
          width: "100%",
        }}
      />
      {errors[key] && <span style={{ color: "var(--brand-red)", fontSize: 12, fontWeight: 600 }}>{errors[key]}</span>}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
      <div style={{ minHeight: "100vh", background: "var(--background)", direction: "rtl" }}>

        {/* NAV */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          backdropFilter: "blur(12px)",
          background: "oklch(0.18 0.04 265 / 85%)",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/ar" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--foreground)", textDecoration: "none" }}>
              {/* swap <img src="/icons/plulai1.png" /> if you have the logo */}
              <span style={{ fontFamily: "Cairo", fontWeight: 900, fontSize: 22, color: "var(--brand-blue)" }}>بلولاي</span>
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)", fontFamily: "Tajawal, sans-serif" }}>الدفع عند الاستلام</span>
              <span style={{
                background: "rgba(28,176,246,0.15)", color: "var(--brand-blue)",
                borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 800,
                border: "1px solid rgba(28,176,246,0.3)",
              }}>🔒 آمن</span>
            </div>
          </div>
        </nav>

        {/* HERO BAND */}
        <div style={{
          background: "linear-gradient(180deg, rgba(28,176,246,0.1) 0%, transparent 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 24px",
          textAlign: "center",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-cyan)", fontFamily: "Tajawal, sans-serif" }}>
            🚚 شحن مجاني لجميع دول الخليج · الدفع عند الاستلام · ضمان استرداد ٧ أيام
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

              {/* ── LEFT: Book info ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                <BookCover />

                {/* Details card */}
                <div style={{
                  background: "var(--surface)",
                  borderRadius: 20,
                  border: "1px solid var(--border)",
                  padding: 24,
                  display: "flex", flexDirection: "column", gap: 16,
                }}>
                  <h1 style={{ fontFamily: "Cairo", fontWeight: 900, fontSize: 26, lineHeight: 1.3 }}>
                    {BOOK.title}
                  </h1>
                  <p style={{ color: "var(--muted-foreground)", fontFamily: "Tajawal, sans-serif", lineHeight: 1.8, fontSize: 15 }}>
                    {BOOK.subtitle}
                  </p>

                  {/* Meta pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {[
                      { icon: "📄", label: BOOK.pages },
                      { icon: "🌐", label: BOOK.language },
                      { icon: "🚚", label: BOOK.delivery },
                    ].map(m => (
                      <span key={m.label} style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 999,
                        background: "var(--surface-2)", border: "1px solid var(--border)",
                        fontSize: 13, fontWeight: 700,
                      }}>
                        {m.icon} {m.label}
                      </span>
                    ))}
                  </div>

                  {/* Feature list */}
                  <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {BOOK.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontFamily: "Tajawal, sans-serif" }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: 8, flexShrink: 0,
                          background: "rgba(28,176,246,0.2)", display: "grid", placeItems: "center",
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1CB0F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── RIGHT: Order form ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Price + Qty */}
                <div style={{
                  background: "var(--surface)", borderRadius: 20,
                  border: "1px solid var(--border)", padding: 24,
                  display: "flex", flexDirection: "column", gap: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 36, fontWeight: 900, color: "var(--brand-blue)", fontFamily: "Cairo" }}>
                        {BOOK.price} <span style={{ fontSize: 18, color: "var(--muted-foreground)" }}>{BOOK.currency}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted-foreground)", fontFamily: "Tajawal, sans-serif" }}>الدفع عند الاستلام</div>
                    </div>

                    {/* Quantity */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                      <span style={{ fontWeight: 900, fontSize: 20, minWidth: 24, textAlign: "center" }}>{qty}</span>
                      <button className="qty-btn" onClick={() => setQty(q => Math.min(10, q + 1))}>+</button>
                    </div>
                  </div>

                  {qty > 1 && (
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: 12,
                      background: "rgba(250,169,24,0.1)", border: "1px solid rgba(250,169,24,0.25)",
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>الإجمالي</span>
                      <span style={{ fontWeight: 900, color: "var(--brand-gold)", fontSize: 16 }}>{total} {BOOK.currency}</span>
                    </div>
                  )}
                </div>

                {/* Form */}
                <div style={{
                  background: "var(--surface)", borderRadius: 20,
                  border: "1px solid var(--border)", padding: 24,
                  display: "flex", flexDirection: "column", gap: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      background: "var(--brand-blue)", color: "white",
                      borderRadius: 8, width: 28, height: 28, display: "grid", placeItems: "center",
                      fontWeight: 900, fontSize: 14, flexShrink: 0,
                    }}>١</span>
                    <span style={{ fontWeight: 800, fontSize: 17 }}>بيانات التوصيل</span>
                  </div>

                  {field("name", "الاسم الكامل", "محمد أحمد")}
                  {field("phone", "رقم الجوال", "+966 5X XXX XXXX", "tel")}

                  {/* City select */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontWeight: 700, fontSize: 14 }}>المدينة</label>
                    <select
                      value={form.city}
                      onChange={(e) => { setForm(f => ({ ...f, city: e.target.value })); setErrors(er => ({ ...er, city: undefined })); }}
                      style={{
                        padding: "12px 16px", borderRadius: 12,
                        background: "var(--surface-2)",
                        border: errors.city ? "1.5px solid var(--brand-red)" : "1.5px solid var(--border)",
                        color: form.city ? "var(--foreground)" : "var(--muted-foreground)",
                        width: "100%", appearance: "none",
                      }}
                    >
                      <option value="">اختر مدينتك</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.city && <span style={{ color: "var(--brand-red)", fontSize: 12, fontWeight: 600 }}>{errors.city}</span>}
                  </div>

                  {/* Address textarea */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontWeight: 700, fontSize: 14 }}>العنوان التفصيلي</label>
                    <textarea
                      placeholder="الحي، الشارع، رقم البناء / الشقة..."
                      value={form.address}
                      rows={3}
                      onChange={(e) => { setForm(f => ({ ...f, address: e.target.value })); setErrors(er => ({ ...er, address: undefined })); }}
                      style={{
                        padding: "12px 16px", borderRadius: 12,
                        background: "var(--surface-2)",
                        border: errors.address ? "1.5px solid var(--brand-red)" : "1.5px solid var(--border)",
                        color: "var(--foreground)",
                        width: "100%", resize: "vertical",
                        fontFamily: "Tajawal, sans-serif",
                        direction: "rtl", textAlign: "right",
                      }}
                    />
                    {errors.address && <span style={{ color: "var(--brand-red)", fontSize: 12, fontWeight: 600 }}>{errors.address}</span>}
                  </div>
                </div>

                {/* Order summary */}
                <div style={{
                  background: "rgba(28,176,246,0.06)", borderRadius: 16,
                  border: "1px solid rgba(28,176,246,0.2)", padding: "16px 20px",
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "var(--muted-foreground)" }}>{BOOK.title} × {qty}</span>
                    <span style={{ fontWeight: 700 }}>{total} {BOOK.currency}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "var(--muted-foreground)" }}>الشحن</span>
                    <span style={{ color: "var(--brand-cyan)", fontWeight: 800 }}>مجاني 🎁</span>
                  </div>
                  <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 800 }}>الإجمالي</span>
                    <span style={{ fontWeight: 900, fontSize: 18, color: "var(--brand-blue)" }}>{total} {BOOK.currency}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  className="shelf-gold"
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  style={{ padding: "16px 24px", borderRadius: 16, fontSize: 18, fontWeight: 900, fontFamily: "Cairo", width: "100%" }}
                >
                  {status === "loading" ? "⏳ جاري الإرسال..." : `اطلب الآن · ${total} ${BOOK.currency} ←`}
                </button>

                {status === "error" && (
                  <div style={{
                    background: "rgba(211,49,49,0.1)", border: "1px solid rgba(211,49,49,0.3)",
                    borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "var(--brand-red)", fontWeight: 700,
                  }}>
                    حدث خطأ. تحقق من اتصالك أو تواصل معنا مباشرةً.
                  </div>
                )}

                <p style={{ fontSize: 12, color: "var(--muted-foreground)", textAlign: "center", fontFamily: "Tajawal, sans-serif", lineHeight: 1.7 }}>
                  بالضغط على &quot;اطلب الآن&quot; توافق على شروط الاستخدام وسياسة الخصوصية.
                  <br />لا يلزم دفع مسبق — الدفع عند استلام الكتاب.
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

      {/*
      ═══════════════════════════════════════════════════════════════════
      GOOGLE SHEETS SETUP — Run once, takes ~5 minutes
      ═══════════════════════════════════════════════════════════════════

      1. Open Google Sheets → create a new sheet named "Orders"
         Add these headers in row 1:
         Timestamp | Name | Phone | City | Address | Quantity | Total | Book

      2. In the sheet: Extensions → Apps Script → paste this code:

      function doPost(e) {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders");
        var data = JSON.parse(e.postData.contents);
        sheet.appendRow([
          data.timestamp,
          data.name,
          data.phone,
          data.city,
          data.address,
          data.quantity,
          data.total,
          data.book,
        ]);
        return ContentService
          .createTextOutput(JSON.stringify({ result: "success" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      3. Deploy → New deployment → Web app
         - Execute as: Me
         - Who has access: Anyone
         → Copy the Web App URL

      4. Paste the URL into GOOGLE_SCRIPT_URL at the top of this file.

      Done! Every order will appear as a new row in Google Sheets.
      ═══════════════════════════════════════════════════════════════════
      */}
    </>
  );
}