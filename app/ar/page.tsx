"use client";

import Image from "next/image";
import { useState } from "react";
import mascot from "@/public/images/mascot.png";
import dashboard from "@/public/images/dashboard.png";

const inlineStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap');

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
    font-family: 'Cairo', system-ui, sans-serif;
    direction: rtl;
  }

  /* RTL overrides */
  [dir="rtl"] { direction: rtl; text-align: right; }

  .font-display, h1, h2, h3, h4 {
    font-family: 'Cairo', system-ui, sans-serif;
    font-weight: 800;
    letter-spacing: 0;
  }

  .font-body {
    font-family: 'Tajawal', system-ui, sans-serif;
  }

  /* Shelf button utilities */
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

  /* Backgrounds & surfaces */
  .bg-background { background-color: var(--background); }
  .bg-surface { background-color: var(--surface); }
  .bg-surface\\/40 { background-color: oklch(0.23 0.045 265 / 40%); }
  .bg-surface\\/60 { background-color: oklch(0.23 0.045 265 / 60%); }
  .text-foreground { color: var(--foreground); }
  .border-border { border-color: oklch(1 0 0 / 10%); }
  .ring-border { --tw-ring-color: oklch(1 0 0 / 10%); }

  /* Animations */
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes marquee-rtl {
    0% { transform: translateX(0); }
    100% { transform: translateX(50%); }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: .5; }
    50% { opacity: 1; }
  }

  .animate-bob { animation: bob 4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
  .animate-marquee-rtl { animation: marquee-rtl 30s linear infinite; }
  .animate-glow { animation: glow-pulse 2s ease-in-out infinite; }

  /* RTL floating card positional fixes */
  .float-card-start {
    right: auto;
    left: -0.5rem;
  }
  .float-card-end {
    left: auto;
    right: -0.5rem;
  }
  @media (min-width: 1024px) {
    .float-card-start { left: -2rem; }
    .float-card-end { right: -1.5rem; }
  }
`;

const tracks = [
  { icon: "💻", title: "البرمجة", desc: "من البرمجة بالبلوكات إلى بايثون. ابنِ تطبيقات وألعاباً حقيقية بينما تتعلّم التفكير المنطقي.", accent: "var(--brand-blue)", pct: 33 },
  { icon: "🧠", title: "الذكاء الاصطناعي وتقنيات المستقبل", desc: "افهم كيف يعمل الذكاء الاصطناعي. هندسة الأوامر وأساسيات التعلم الآلي لعقول فضولية.", accent: "var(--brand-cyan)", pct: 50 },
  { icon: "💡", title: "ريادة الأعمال", desc: "أطلق مشروعك الرقمي الأول. تعلّم التسويق والميزانية والمهارات الحياتية.", accent: "var(--brand-gold)", pct: 25 },
];

const faqs = [
  { q: "ما هي بلولاي تحديداً؟", a: "بلولاي منصة تعليمية مدعومة بالذكاء الاصطناعي للأطفال من سن 6 إلى 18 عاماً في دول مجلس التعاون الخليجي. يتعلّم الأطفال البرمجة والذكاء الاصطناعي وريادة الأعمال عبر مدرّب ذكي شخصي، وأكثر من 500 درس ومشاريع حقيقية — بالعربية والإنجليزية." },
  { q: "ماذا يحدث بعد التجربة المجانية لمدة 14 يوماً؟", a: "بعد التجربة المجانية يمكنك الاشتراك في الخطة الاحترافية أو الاستمرار بوصول محدود. لا يلزم إدخال بطاقة ائتمان للبدء." },
  { q: "هل العربية حقيقية أم مترجمة آلياً؟", a: "عربية أصيلة تماماً — ليست ترجمة آلية. واجهة كاملة من اليمين إلى اليسار ومدرّب ذكاء اصطناعي يُدرّس بالعربية بشكل أصلي، مع أمثلة خليجية في كل مكان." },
  { q: "كم مدة الدروس؟", a: "من 15 إلى 25 دقيقة لكل درس. مصمّمة لتناسب وقت ما بعد المدرسة دون أن تزاحم الواجبات. معظم الأطفال يجدون أنفسهم يكملون درسَين متتاليَين!" },
  { q: "هل هي آمنة لطفلي؟", a: "لا إعلانات إطلاقاً. ردود الذكاء الاصطناعي مُصفَّاة لضمان سلامة الأطفال. يتحكّم الآباء في الحساب ويتلقّون ملخصات أسبوعية. بيانات طفلك لن تُباع أبداً." },
  { q: "كيف تعمل تراخيص المدارس؟", a: "مقاعد جماعية من 50 إلى 5000 طالب. لوحة تحكّم للمعلمين، ومواءمة مع المناهج الوطنية، وخصومات إقليمية، ودعم مخصّص — كل ذلك مشمول." },
];

// Arabic footer links matching the English structure
const footerLinksAr = [
  {
    title: "المنتج",
    links: [
      { label: "المسارات", href: "#tracks" },
      { label: "كيف يعمل", href: "#how" },
      { label: "الأسعار", href: "#pricing" },
    ],
  },
  {
    title: "المدارس",
    links: [
      { label: "نظرة عامة", href: "#schools" },
      { label: "اطلب عرضاً", href: "mailto:hello@plulai.com" },
      { label: "المنهج", href: "/schools" },
    ],
  },
  {
    title: "الشركة",
    links: [
      { label: "من نحن", href: "/about" },
      { label: "اتصل بنا", href: "mailto:hello@plulai.com" },
    ],
  },
];

function Landing() {
  const [audience, setAudience] = useState<"families" | "schools">("families");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const isSchools = audience === "schools";

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
    <div className="min-h-screen bg-background text-foreground" dir="rtl">

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/ar" className="flex items-center gap-2">
              <Image src="/icons/plulai1.png" alt="بلولاي" width={120} height={40} className="h-10 w-auto object-contain" />
            </a>
            <div className="hidden lg:flex items-center gap-6 text-sm font-bold text-foreground/70">
              <a href="#tracks" className="hover:text-foreground transition-colors">المسارات</a>
              <a href="#how" className="hover:text-foreground transition-colors">كيف يعمل</a>
              <a href="#schools" className="hover:text-foreground transition-colors" style={{ color: "var(--brand-cyan)" }}>للمدارس</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">الأسعار</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/auth/login" className="hidden sm:block text-sm font-bold px-4 py-2 hover:text-[var(--brand-blue)] transition-colors">تسجيل الدخول</a>
            <a href="https://www.plulai.com/auth/signup" className="shelf-blue text-sm font-bold py-2.5 px-5 rounded-xl">ابدأ مجاناً ←</a>
            <a href="/" className="hidden sm:block text-xs font-bold px-3 py-1.5 rounded-lg bg-surface/60 ring-1 ring-border text-foreground/50 hover:text-foreground transition-colors">EN</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-12 pb-24 px-6 overflow-hidden relative">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(28,176,246,0.18), transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto relative">
          {/* Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1 bg-surface ring-1 ring-border rounded-2xl">
              <button
                onClick={() => setAudience("families")}
                className={`px-7 py-3 rounded-xl font-bold text-sm transition-all ${
                  !isSchools ? "shelf-blue" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                👨‍👩‍👧 للعائلات
              </button>
              <button
                onClick={() => setAudience("schools")}
                className={`px-7 py-3 rounded-xl font-bold text-sm transition-all ${
                  isSchools ? "shelf-gold" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                🏫 للمدارس
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text side — appears first visually in RTL (right side) */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-cyan)]/10 ring-1 ring-[var(--brand-cyan)]/30 text-[var(--brand-cyan)] text-xs font-bold uppercase tracking-widest mb-6">
                <span className="size-2 rounded-full bg-[var(--brand-cyan)] animate-glow" />
                {isSchools ? "موثوق من مدارس الخليج" : "+200 متعلّم · دول الخليج"}
              </div>

              {isSchools ? (
                <h1 className="font-display text-5xl lg:text-6xl font-bold leading-[1.2] mb-6">
                  أحضر المستقبل إلى فصلك الدراسي مع{" "}
                  <span style={{ color: "var(--brand-cyan)" }}>بلولاي للمدارس.</span>
                </h1>
              ) : (
                <h1 className="font-display text-5xl lg:text-6xl font-bold leading-[1.2] mb-6">
                  طفلك يتعلّم{" "}
                  <span style={{ color: "var(--brand-blue)" }}>البرمجة والذكاء الاصطناعي</span>{" "}
                  ويبدأ مشروعه الخاص.
                </h1>
              )}

              <p className="text-lg text-foreground/70 mb-8 max-w-xl leading-loose font-body">
                {isSchools
                  ? "وفِّر منهجاً متكاملاً للبرمجة والذكاء الاصطناعي وريادة الأعمال لـ 50 إلى 5000 طالب. لوحة تحكّم للمعلّمين، بالعربية والإنجليزية، ومتوائمة مع المعايير الوطنية."
                  : "مدرّب ذكاء اصطناعي شخصي يتكيّف مع طفلك. أكثر من 500 درس بالعربية والإنجليزية. فقط 15 دقيقة يومياً."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {isSchools ? (
                  <a href="https://www.plulai.com/schools" className="shelf-gold font-bold py-4 px-9 rounded-2xl text-lg text-center">
                    اطلب عرضاً للمدرسة ←
                  </a>
                ) : (
                  <a href="https://www.plulai.com/auth/signup" className="shelf-blue font-bold py-4 px-9 rounded-2xl text-lg text-center">
                    ابدأ التجربة المجانية ←
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-foreground/50">
                <div className="flex -space-x-2 space-x-reverse">
                  <div className="size-8 rounded-full bg-[var(--brand-blue)] ring-2 ring-background" />
                  <div className="size-8 rounded-full bg-[var(--brand-gold)] ring-2 ring-background" />
                  <div className="size-8 rounded-full bg-[var(--brand-cyan)] ring-2 ring-background" />
                </div>
                <span>
                  {isSchools ? "تُشغِّل أكثر من 9 مدارس في الخليج" : "موثوق من أكثر من 200 عائلة في دول الخليج"}
                </span>
              </div>
            </div>

            {/* Mascot side */}
            <div className="relative">
              <div
                className="absolute -inset-10 rounded-full blur-3xl"
                style={{ background: isSchools ? "var(--brand-gold)" : "var(--brand-blue)", opacity: 0.15 }}
              />
              <div className="relative animate-bob">
                <Image src={mascot} alt="مدرّب بلولاي الذكي" width={480} height={480} className="w-full max-w-[480px] mx-auto block" />
              </div>

              {/* Floating cards — RTL flipped positions */}
              <div className="absolute top-8 -right-2 lg:-right-8 shelf-white py-3 px-4 rounded-2xl flex items-center gap-3 max-w-[200px]">
                <div className="size-10 rounded-full bg-[var(--brand-gold)]/20 grid place-items-center text-xl">🔥</div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">السلسلة</div>
                  <div className="text-zinc-900 font-bold text-sm">14 يوماً مجانا !</div>
                </div>
              </div>

              <div className="absolute bottom-2 -left-2 lg:-left-6 shelf-white py-3 px-4 rounded-2xl flex items-center gap-3 max-w-[220px]">
                <div className="size-10 rounded-full bg-[var(--brand-blue)]/20 grid place-items-center text-[var(--brand-blue)] font-extrabold">م5</div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">ترقية!</div>
                  <div className="text-zinc-900 font-bold text-sm">فارس وصل للمستوى 5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST MARQUEE — RTL direction */}
      <section className="py-10 bg-surface/40 border-y border-border overflow-hidden">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-foreground/40 font-bold mb-6">
          موثوق من المؤسسات الرائدة في المنطقة
        </p>
        <div className="flex whitespace-nowrap animate-marquee-rtl items-center">
          {[...Array(2)].map((_, round) =>
            ["p1","p2","p3","p4","p5","p6","p7","p8","p9"].map((p, i) => (
              <div key={`${round}-${i}`} className="mx-10 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <img src={`/partners/${p}.png`} alt={`شريك ${i + 1}`} className="h-10 w-auto object-contain" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* TRACKS */}
      <section id="tracks" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--brand-cyan)] font-extrabold uppercase tracking-[0.2em] text-xs mb-3">3 مسارات · اختر مسارك</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4">اختر قوّتك الخارقة</h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto leading-loose font-body">
              ثلاثة مسارات متخصّصة مصمَّمة لتحويل الأطفال إلى صُنّاع لا مجرّد مستهلكين.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tracks.map((t) => (
              <div
                key={t.title}
                className="group p-8 rounded-3xl bg-surface ring-1 ring-border hover:-translate-y-1 transition-transform"
                style={{ boxShadow: `0 10px 30px -15px ${t.accent}30` }}
              >
                <div
                  className="size-16 rounded-2xl grid place-items-center mb-6 text-3xl group-hover:scale-110 transition-transform"
                  style={{ background: `${t.accent}25`, boxShadow: `inset 0 0 0 1px ${t.accent}40` }}
                >
                  {t.icon}
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">{t.title}</h3>
                <p className="text-foreground/60 mb-6 leading-loose font-body">{t.desc}</p>
                <div className="h-2 rounded-full bg-background overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.accent, boxShadow: `0 0 12px ${t.accent}`, marginRight: "auto" }} />
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider" style={{ color: t.accent }}>
                  <span>← استكشف</span>
                  <span>الوحدة 1 · {t.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 50% 40% at 80% 30%, rgba(28,176,246,0.12), transparent 60%), radial-gradient(ellipse 40% 30% at 15% 75%, rgba(250,169,24,0.10), transparent 60%)",
          }}
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-[var(--brand-gold)] font-extrabold uppercase tracking-[0.2em] text-xs mb-3">خريطة المغامرة</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold">مسار تعليمي يبدو وكأنّه لعبة</h2>
            <p className="text-foreground/60 mt-4 max-w-2xl mx-auto leading-loose font-body">
              كل مستوى يفتح التالي. اكسب نقاط XP، حافظ على سلسلتك، اجتز معارك الزعيم — وابنِ مشروعاً حقيقياً في نهاية كل وحدة.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
            {/* Right: legend & explainer — shown first in RTL */}
            <div className="space-y-6 order-1 lg:order-1">
              <div className="p-6 rounded-3xl bg-surface ring-1 ring-border">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-[var(--brand-blue)]/20 grid place-items-center text-2xl flex-shrink-0">💻</div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-blue)]">متاح الآن</div>
                    <div className="font-display text-xl font-bold">ابنِ تطبيقك الأول</div>
                    <div className="text-sm text-foreground/60">الوحدة 1 · 6 دروس · ~15 دقيقة لكل درس</div>
                  </div>
                </div>
                <div className="mt-5 h-2 rounded-full bg-background overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "33%", background: "var(--brand-blue)", boxShadow: "0 0 12px var(--brand-blue)" }} />
                </div>
                <div className="flex justify-between mt-2 text-[11px] font-bold uppercase tracking-wider text-foreground/50">
                  <span style={{ color: "var(--brand-blue)" }}>33%</span>
                  <span>2 / 6 دروس</span>
                </div>
              </div>

              <ul className="space-y-3">
                {[
                  { icon: "🎯", title: "دروس قصيرة وفعّالة", desc: "وحدات مدتها 15 دقيقة يُكملها الأطفال فعلاً." },
                  { icon: "🤖", title: "مدرّب ذكاء اصطناعي شخصي", desc: "يتكيّف مع وتيرة طفلك ولغته المفضّلة." },
                  { icon: "🏆", title: "معارك ومكافآت", desc: "نقاط XP وسلاسل وشارات تحفّز الاستمرار." },
                  { icon: "🛠️", title: "مشاريع حقيقية", desc: "انتهِ من كل وحدة بشيء تفخر بعرضه." },
                ].map((f) => (
                  <li key={f.title} className="flex items-start gap-4 p-4 rounded-2xl bg-surface/60 ring-1 ring-border">
                    <div className="size-10 rounded-xl bg-background grid place-items-center text-xl flex-shrink-0">{f.icon}</div>
                    <div>
                      <div className="font-bold text-sm">{f.title}</div>
                      <div className="text-sm text-foreground/60 font-body">{f.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a href="https://www.plulai.com/auth/signup" className="shelf-blue font-bold py-3.5 px-6 rounded-2xl flex-1 text-center">ابدأ المسار ←</a>
              </div>
            </div>

            {/* Game map */}
            <div className="relative mx-auto w-full max-w-[460px] order-2 lg:order-2">
              <svg viewBox="0 0 400 720" className="w-full h-auto block" aria-hidden>
                <defs>
                  <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1CB0F6" />
                    <stop offset="55%" stopColor="#14D4F4" />
                    <stop offset="100%" stopColor="#FAA918" />
                  </linearGradient>
                </defs>
                <path
                  d="M200 40 C 80 100, 80 200, 200 240 S 320 360, 200 420 S 80 540, 200 600 S 320 680, 280 700"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="22"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M200 40 C 80 100, 80 200, 200 240 S 320 360, 200 420"
                  stroke="url(#road)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="2 12"
                  fill="none"
                />
              </svg>

              {[
                { top: "4%",  left: "50%", icon: "✨", color: "var(--brand-blue)", state: "done", label: "مرحباً" },
                { top: "32%", left: "50%", icon: "💻", color: "var(--brand-blue)", state: "current", label: "ابنِ تطبيقك الأول" },
                { top: "57%", left: "50%", icon: "🏆", color: "var(--brand-gold)", state: "locked", label: "معركة الزعيم", big: true },
                { top: "82%", left: "50%", icon: "🤖", color: "var(--brand-cyan)", state: "locked", label: "درِّب ذكاءك الاصطناعي" },
                { top: "97%", left: "70%", icon: "🌍", color: "var(--brand-gold)", state: "locked", label: "أطلق مشروعك" },
              ].map((n, i) => {
                const size = n.big ? 92 : 72;
                const isDone = n.state === "done";
                const isCurrent = n.state === "current";
                const isLocked = n.state === "locked";
                return (
                  <div
                    key={i}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                    style={{ top: n.top, left: n.left }}
                  >
                    <button
                      className="rounded-full grid place-items-center text-3xl transition-transform hover:scale-110"
                      style={{
                        width: size,
                        height: size,
                        background: isLocked ? "var(--surface-2)" : n.color,
                        boxShadow: isLocked
                          ? "0 5px 0 rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.04)"
                          : `0 6px 0 rgba(0,0,0,0.45), 0 0 40px ${n.color}90`,
                        filter: isLocked ? "grayscale(1)" : undefined,
                        opacity: isLocked ? 0.5 : 1,
                        outline: `8px solid var(--background)`,
                      }}
                      aria-label={n.label}
                    >
                      <span className={isLocked ? "opacity-40" : ""}>{isLocked ? "🔒" : n.icon}</span>
                      {isDone && (
                        <span className="absolute -bottom-1 -right-1 size-7 rounded-full bg-[var(--brand-gold)] grid place-items-center text-sm ring-4 ring-background">
                          ✓
                        </span>
                      )}
                    </button>

                    {isCurrent && (
                      <div className="absolute right-[calc(100%+18px)] top-1/2 -translate-y-1/2 whitespace-nowrap">
                        <div className="relative shelf-blue px-4 py-2 rounded-xl font-bold text-sm">
                          ابدأ
                          <span
                            className="absolute left-full top-1/2 -translate-y-1/2 size-0"
                            style={{
                              borderTop: "8px solid transparent",
                              borderBottom: "8px solid transparent",
                              borderLeft: "10px solid var(--brand-blue)",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="absolute top-2 -right-2 sm:-right-6 shelf-white py-2 px-3 rounded-2xl flex items-center gap-2 z-20">
                <span className="text-lg">⚡</span>
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500">نقاط اليوم</div>
                  <div className="text-zinc-900 font-bold text-sm leading-none">+120</div>
                </div>
              </div>

              <div className="absolute bottom-6 -left-2 sm:-left-6 shelf-white py-2 px-3 rounded-2xl flex items-center gap-2 z-20">
                <span className="text-lg">🔥</span>
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500">السلسلة</div>
                  <div className="text-zinc-900 font-bold text-sm leading-none">14 يوماً</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B2B SECTION */}
      <section id="schools" className="py-24 px-6 relative" style={{ background: "linear-gradient(180deg, var(--surface) 0%, var(--background) 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Dashboard image — left side in RTL */}
            <div className="order-2 lg:order-2 relative">
              <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-30" style={{ background: "var(--brand-cyan)" }} />
              <div className="relative rounded-2xl overflow-hidden ring-1 ring-border shadow-2xl">
                <Image src={dashboard} alt="معاينة لوحة تحكّم المعلّم" width={1280} height={960} className="w-full block" />
              </div>
            </div>

            <div className="order-1 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-cyan)]/15 ring-1 ring-[var(--brand-cyan)]/30 text-[var(--brand-cyan)] text-xs font-extrabold uppercase tracking-widest mb-6">
                🏫 للمدارس والمؤسسات
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6 leading-[1.2]">
                مكِّن فصلك الدراسي بأكمله بالذكاء الاصطناعي.
              </h2>
              <p className="text-foreground/70 text-lg mb-8 leading-loose font-body">
                بلولاي للمدارس منهج جاهز للتطبيق سيحبّ معلّموك تدريسه — مع تحليلات مدمجة وتلعيب ومدير نجاح مخصّص.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  ["مقاعد جماعية من 50 إلى 5000", "خصومات إقليمية وفوترة مرنة لأي حجم مدرسة."],
                  ["مناهج عربية وإنجليزية", "متوائمة مع معايير وزارة التعليم في دول الخليج."],
                  ["دعم مخصّص", "التأهيل والتدريب ومدير نجاح العملاء مشمولون."],
                ].map(([title, desc]) => (
                  <li key={title} className="flex gap-4">
                    <div className="size-7 rounded-lg bg-[var(--brand-cyan)]/20 grid place-items-center flex-shrink-0 mt-0.5">
                      <svg className="size-4 text-[var(--brand-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{title}</div>
                      <div className="text-foreground/60 text-sm font-body">{desc}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:hello@plulai.com" className="shelf-gold font-bold py-4 px-8 rounded-2xl text-lg text-center">اطلب عرضاً للمدرسة ←</a>
                <a href="mailto:hello@plulai.com" className="shelf-dark font-bold py-4 px-8 rounded-2xl text-lg text-center">تحميل الكتيّب</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-20 px-6 border-y border-border" style={{ background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { n: "+200", l: "متعلّم نشط", c: "var(--brand-blue)" },
            { n: "+500", l: "درس قصير", c: "var(--brand-cyan)" },
            { n: "+9", l: "مدرسة شريكة", c: "var(--brand-gold)" },
            { n: "9.2/10", l: "رضا المستخدمين", c: "var(--brand-red)" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-5xl lg:text-6xl font-bold mb-2" style={{ color: s.c, textShadow: `0 0 40px ${s.c}40` }}>
                {s.n}
              </div>
              <div className="text-foreground/60 font-bold uppercase tracking-wider text-xs">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--brand-gold)] font-extrabold uppercase tracking-[0.2em] text-xs mb-3">محبوب من الآباء والمديرين</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold">ماذا يقول الناس</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "ابني عمره 9 سنوات ويتوسّل كل يوم لإكمال درسه بعد المدرسة. لم أكن أتوقّع هذا مع البرمجة.", name: "ليلى م.", role: "أمّ لطفلين، الرياض", color: "var(--brand-blue)" },
              { quote: "العربية ليست مترجمة — هي أصيلة. هذا وحده يجعل بلولاي الأفضل في المنطقة.", name: "د. خالد ر.", role: "مدير مدرسة، الدوحة", color: "var(--brand-cyan)" },
              { quote: "بنى أول لعبة تعمل فعلاً خلال أسبوعين. المدرّب الذكي صبور بطريقة لا أستطيعها أنا!", name: "سارة أ.", role: "أمّ، دبي", color: "var(--brand-gold)" },
            ].map((t) => (
              <div key={t.name} className="p-7 rounded-3xl bg-surface ring-1 ring-border">
                <div className="flex gap-1 mb-4" style={{ color: t.color }}>
                  {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="text-foreground/85 leading-loose mb-6 font-body">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div
                    className="size-10 rounded-full grid place-items-center font-bold text-sm"
                    style={{ background: `${t.color}30`, color: t.color }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-foreground/50">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--brand-cyan)] font-extrabold uppercase tracking-[0.2em] text-xs mb-3">بسيط وعادل</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4">اختر خطّتك</h2>
            <p className="text-foreground/60 font-body">ابدأ مجاناً. اشترك عندما تكون جاهزاً. أسعار المدارس مخصّصة.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Free */}
            <div className="p-8 rounded-3xl bg-surface ring-1 ring-border flex flex-col">
              <div className="text-foreground/50 font-extrabold uppercase tracking-widest text-xs mb-2">المستكشف</div>
              <div className="font-display text-4xl font-bold mb-1">مجاناً</div>
              <p className="text-sm text-foreground/60 mb-6 font-body">تجربة 14 يوماً، بدون بطاقة ائتمان</p>
              <ul className="space-y-3 text-sm text-foreground/70 mb-8 flex-1 font-body">
                <li>✓ أول 5 دروس</li>
                <li>✓ أساسيات مسار البرمجة</li>
                <li>✓ اللغة الإنجليزية فقط</li>
              </ul>
              <a href="https://www.plulai.com/auth/signup" className="shelf-dark py-3 rounded-xl font-bold text-center">ابدأ الآن</a>
            </div>

            {/* Pro — featured */}
            <div className="p-8 rounded-3xl relative flex flex-col" style={{ background: "var(--brand-blue)", boxShadow: "0 6px 0 var(--brand-deep), 0 20px 60px -20px var(--brand-blue)" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--brand-gold)] text-[#1A1A2E] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">الأكثر شعبية</div>
              <div className="text-white/80 font-extrabold uppercase tracking-widest text-xs mb-2">النابغة</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-4xl font-bold text-white">70$</span>
                <span className="text-white/70 font-medium">/شهرياً</span>
              </div>
              <p className="text-sm text-white/80 mb-6 font-body">للعائلات</p>
              <ul className="space-y-3 text-sm text-white mb-8 flex-1 font-body">
                <li>✓ المسارات الثلاثة (برمجة · ذكاء اصطناعي · أعمال)</li>
                <li>✓ مدرّب ذكاء اصطناعي شخصي</li>
                <li>✓ عربي + إنجليزي</li>
                <li>✓ ملخّص أسبوعي للوالدين</li>
                <li>✓ تجربة مجانية 14 يوماً</li>
              </ul>
              <a href="https://www.plulai.com/auth/signup" className="shelf-white py-3 rounded-xl font-bold text-center">ابدأ التجربة المجانية</a>
            </div>

            {/* Schools */}
            <div className="p-8 rounded-3xl bg-surface ring-1 ring-[var(--brand-cyan)]/30 flex flex-col">
              <div className="text-[var(--brand-cyan)] font-extrabold uppercase tracking-widest text-xs mb-2">المؤسسات</div>
              <div className="font-display text-4xl font-bold mb-1">مخصّص</div>
              <p className="text-sm text-foreground/60 mb-6 font-body">للمدارس (+50 مقعداً)</p>
              <ul className="space-y-3 text-sm text-foreground/70 mb-8 flex-1 font-body">
                <li>✓ لوحة تحكّم المعلّم</li>
                <li>✓ مقاعد جماعية بخصومات</li>
                <li>✓ تكامل LMS / SSO</li>
                <li>✓ مواءمة مناهج</li>
                <li>✓ مدير نجاح مخصّص</li>
              </ul>
              <button className="shelf-gold py-3 rounded-xl font-bold">تواصل مع فريق المبيعات ←</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6" style={{ background: "var(--surface)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold">أسئلة شائعة</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-2xl bg-background ring-1 ring-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-right"
                >
                  <svg
                    className={`size-5 text-foreground/50 transition-transform flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="font-bold pr-4">{f.q}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-foreground/70 leading-loose font-body text-right">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, rgba(28,176,246,0.18), transparent 60%)" }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="text-7xl mb-6">🚀</div>
          <h2 className="font-display text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            هل أنت مستعد لمنح طفلك ميزة المستقبل؟
          </h2>
          <p className="text-foreground/70 text-lg mb-10 max-w-xl mx-auto leading-loose font-body">
            انضم إلى آلاف العائلات والمدارس التي تبني الجيل القادم من صنّاع الخليج.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://www.plulai.com/auth/signup" className="shelf-blue font-bold py-4 px-10 rounded-2xl text-lg text-center">ابدأ التجربة المجانية ←</a>
            <a href="/ar#schools" className="shelf-gold font-bold py-4 px-10 rounded-2xl text-lg text-center">للمدارس</a>
          </div>
        </div>
      </section>

      {/* FOOTER — Updated with English-like links structure */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image src="/icons/plulai1.png" alt="بلولاي" width={100} height={32} className="h-8 w-auto object-contain" />
            </div>
            <p className="text-sm text-foreground/50 font-body">نبني قادة الغد، اليوم. صُنع من أجل الخليج.</p>
          </div>
          {footerLinksAr.map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2 text-sm text-foreground/60 font-body">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="hover:text-foreground transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-foreground/40">
          <div className="flex gap-6 uppercase tracking-wider font-bold">
            <a href="/privacy" className="hover:text-foreground">الخصوصية</a>
            <a href="/terms" className="hover:text-foreground">الشروط</a>
            <a href="/" className="hover:text-foreground">English</a>
          </div>
          <span>© 2026 Plulai Education. جميع الحقوق محفوظة.</span>
        </div>
      </footer>
    </div>
    </>
  );
}

export default function Page() {
  return <Landing />;
}