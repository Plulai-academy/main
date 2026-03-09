// lib/email/templates.ts
// HTML email templates for Plulai notifications.
// All emails: dark themed, mobile-first, inline CSS (required for email clients),
// bilingual fallback (primary lang + English if Arabic/French).

export type EmailLang = 'en' | 'ar' | 'fr'

// ── Shared styles ─────────────────────────────────────────────
const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0d0d1a;
  color: #ffffff;
  margin: 0;
  padding: 0;
`

const CONTAINER = `
  max-width: 600px;
  margin: 0 auto;
  background: #16162a;
  border-radius: 20px;
  overflow: hidden;
`

const HEADER_BASE = `
  padding: 40px 40px 32px;
  text-align: center;
`

const BODY = `
  padding: 0 40px 40px;
`

const FOOTER = `
  padding: 24px 40px;
  border-top: 1px solid rgba(255,255,255,0.08);
  text-align: center;
  color: #8888bb;
  font-size: 12px;
  line-height: 1.6;
`

const BTN_PRIMARY = (bg = '#4d96ff') => `
  display: inline-block;
  background: ${bg};
  color: #ffffff;
  text-decoration: none;
  font-weight: 800;
  font-size: 16px;
  padding: 16px 36px;
  border-radius: 14px;
  margin: 8px 4px;
`

const BTN_SECONDARY = `
  display: inline-block;
  background: rgba(255,255,255,0.08);
  color: #ffffff;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 28px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.12);
  margin: 8px 4px;
`

const STAT_BOX = (color = '#4d96ff') => `
  background: rgba(255,255,255,0.04);
  border: 1px solid ${color}33;
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  display: inline-block;
  min-width: 120px;
  margin: 6px;
`

function wrap(content: string, lang: EmailLang = 'en'): string {
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Plulai</title>
</head>
<body style="${BASE_STYLE}">
  <div style="padding: 24px 16px;">
    <div style="${CONTAINER}">
      ${content}
    </div>
    <p style="text-align:center;color:#555577;font-size:11px;margin-top:20px;">
      © ${new Date().getFullYear()} Plulai · AI Learning for Kids · plulai.com
    </p>
  </div>
</body>
</html>`
}

function logo(accent = '#4d96ff'): string {
  return `<div style="font-size:28px;font-weight:900;color:${accent};margin-bottom:8px;">🚀 Plulai</div>`
}

// ── 1. TRIAL EXPIRY EMAIL ─────────────────────────────────────
export interface TrialExpiryData {
  childName:    string
  daysLeft:     number
  lang:         EmailLang
  upgradeUrl:   string
  loginUrl:     string
}

export function trialExpiryEmail(d: TrialExpiryData): { subject: string; html: string } {
  const isAr = d.lang === 'ar'
  const isFr = d.lang === 'fr'

  const subjects: Record<EmailLang, string> = {
    en: `⏰ ${d.daysLeft} day${d.daysLeft !== 1 ? 's' : ''} left on your Plulai free trial`,
    ar: `⏰ تبقى ${d.daysLeft} ${d.daysLeft === 1 ? 'يوم' : 'أيام'} على انتهاء تجربتك المجانية في Plulai`,
    fr: `⏰ Plus que ${d.daysLeft} jour${d.daysLeft !== 1 ? 's' : ''} sur votre essai gratuit Plulai`,
  }

  const headline: Record<EmailLang, string> = {
    en: `Your free trial ends in ${d.daysLeft} day${d.daysLeft !== 1 ? 's' : ''}`,
    ar: `تجربتك المجانية تنتهي خلال ${d.daysLeft} ${d.daysLeft === 1 ? 'يوم' : 'أيام'}`,
    fr: `Votre essai gratuit se termine dans ${d.daysLeft} jour${d.daysLeft !== 1 ? 's' : ''}`,
  }

  const body: Record<EmailLang, string> = {
    en: `<b>${d.childName}</b> has been learning on Plulai and we'd love to keep that momentum going. Upgrade now to keep unlimited access to all lessons, the AI Coach, challenges, and the leaderboard.`,
    ar: `<b>${d.childName}</b> يتعلم على Plulai ونريد الاستمرار في هذه الرحلة معاً. قم بالترقية الآن للحصول على وصول غير محدود لجميع الدروس والمدرب الذكي والتحديات.`,
    fr: `<b>${d.childName}</b> apprend sur Plulai et nous adorerions continuer cette aventure. Mettez à niveau maintenant pour un accès illimité à toutes les leçons, au Coach IA et aux défis.`,
  }

  const cta: Record<EmailLang, string> = {
    en: 'Upgrade Now →',
    ar: 'قم بالترقية الآن ←',
    fr: 'Passer à la version Pro →',
  }

  const price: Record<EmailLang, string> = {
    en: 'Starting at $79/month · Cancel anytime · 100% safe for kids',
    ar: 'من 79$ شهرياً · إلغاء في أي وقت · آمن 100% للأطفال',
    fr: 'À partir de 79$/mois · Annulation à tout moment · 100% sûr pour les enfants',
  }

  const urgencyColor = d.daysLeft <= 1 ? '#ff6b6b' : d.daysLeft <= 3 ? '#ffd93d' : '#4d96ff'

  const html = wrap(`
    <div style="${HEADER_BASE} background: linear-gradient(135deg, #1a1a3e 0%, #0d0d2e 100%);">
      ${logo(urgencyColor)}
      <div style="font-size:48px;margin:16px 0;">${d.daysLeft <= 1 ? '🚨' : d.daysLeft <= 3 ? '⏰' : '📅'}</div>
      <h1 style="margin:0;font-size:26px;font-weight:900;line-height:1.3;color:${urgencyColor};">
        ${headline[d.lang]}
      </h1>
    </div>

    <div style="${BODY}">
      <p style="font-size:16px;line-height:1.7;color:rgba(255,255,255,0.8);margin-bottom:28px;">
        ${body[d.lang]}
      </p>

      <!-- Features reminder -->
      <div style="background:rgba(255,255,255,0.03);border-radius:16px;padding:24px;margin-bottom:28px;">
        ${[
          ['🗺️', isAr ? 'شجرة المهارات الكاملة' : isFr ? 'Arbre de compétences complet' : 'Full skill tree'],
          ['🤖', isAr ? 'مدرب الذكاء الاصطناعي 24/7' : isFr ? 'Coach IA 24/7' : 'AI Coach 24/7'],
          ['⚡', isAr ? 'تحديات يومية وشارات' : isFr ? 'Défis quotidiens & badges' : 'Daily challenges & badges'],
          ['📊', isAr ? 'لوحة متصدرين GCC' : isFr ? 'Classement CCG' : 'GCC leaderboard'],
          ['🧊', isAr ? 'نظام حماية السلسلة' : isFr ? 'Protection de série' : 'Streak freeze system'],
        ].map(([emoji, label]) => `
          <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="font-size:20px;">${emoji}</span>
            <span style="font-size:14px;font-weight:600;color:rgba(255,255,255,0.8);">${label}</span>
            <span style="margin-left:auto;font-size:16px;color:#6bcb77;">✓</span>
          </div>
        `).join('')}
      </div>

      <div style="text-align:center;margin-bottom:20px;">
        <a href="${d.upgradeUrl}" style="${BTN_PRIMARY(urgencyColor)}">${cta[d.lang]}</a>
      </div>
      <p style="text-align:center;color:#8888bb;font-size:13px;font-weight:600;">
        ${price[d.lang]}
      </p>
    </div>

    <div style="${FOOTER}">
      ${isAr ? `لإدارة اشتراكك` : isFr ? `Pour gérer votre abonnement` : `To manage your subscription`},
      <a href="${d.loginUrl}" style="color:#4d96ff;">${isAr ? 'قم بتسجيل الدخول' : isFr ? 'connectez-vous' : 'log in to Plulai'}</a>.<br/>
      ${isAr ? 'لديك أسئلة؟ راسلنا على' : isFr ? 'Des questions ? Écrivez-nous à' : 'Questions? Email us at'} 
      <a href="mailto:hello@plulai.com" style="color:#4d96ff;">hello@plulai.com</a>
    </div>
  `, d.lang)

  return { subject: subjects[d.lang], html }
}

// ── 2. STREAK AT RISK EMAIL ───────────────────────────────────
export interface StreakRiskData {
  childName:    string
  currentStreak: number
  freezeTokens: number
  lang:         EmailLang
  dashboardUrl: string
}

export function streakRiskEmail(d: StreakRiskData): { subject: string; html: string } {
  const isAr = d.lang === 'ar'
  const isFr = d.lang === 'fr'

  const subjects: Record<EmailLang, string> = {
    en: `🔥 Don't break your ${d.currentStreak}-day streak, ${d.childName}!`,
    ar: `🔥 لا تكسر سلسلة ${d.currentStreak} يوم يا ${d.childName}!`,
    fr: `🔥 Ne brise pas ta série de ${d.currentStreak} jours, ${d.childName} !`,
  }

  const headline: Record<EmailLang, string> = {
    en: `Your streak is at risk! 🔥`,
    ar: `سلسلتك في خطر! 🔥`,
    fr: `Ta série est en danger ! 🔥`,
  }

  const body: Record<EmailLang, string> = {
    en: `Hey ${d.childName}! You haven't done a lesson today yet — and your <b>${d.currentStreak}-day streak</b> is on the line. It only takes 5 minutes to keep it alive.`,
    ar: `مرحباً ${d.childName}! لم تكمل درساً اليوم بعد — وسلسلتك <b>${d.currentStreak} يوماً</b> في خطر. 5 دقائق فقط تكفي للحفاظ عليها!`,
    fr: `Hé ${d.childName} ! Tu n'as pas encore fait de leçon aujourd'hui — et ta série de <b>${d.currentStreak} jours</b> est en jeu. Il ne faut que 5 minutes pour la garder en vie.`,
  }

  const freezeNote: Record<EmailLang, string> = {
    en: d.freezeTokens > 0
      ? `💡 You have ${d.freezeTokens} freeze token${d.freezeTokens !== 1 ? 's' : ''} — they'll auto-protect you IF you miss today entirely. But a lesson is better!`
      : `⚠️ You have no freeze tokens! Miss today and your streak resets to 0. Go learn something now!`,
    ar: d.freezeTokens > 0
      ? `💡 لديك ${d.freezeTokens} رمز تجميد — ستحميك تلقائياً إذا غبت اليوم. لكن الدرس أفضل!`
      : `⚠️ ليس لديك رموز تجميد! إذا غبت اليوم ستعود سلسلتك إلى صفر. تعلّم الآن!`,
    fr: d.freezeTokens > 0
      ? `💡 Tu as ${d.freezeTokens} jeton${d.freezeTokens !== 1 ? 's' : ''} de gel — il${d.freezeTokens !== 1 ? 's' : ''} te protège${d.freezeTokens !== 1 ? 'ront' : 'ra'} automatiquement si tu rates aujourd'hui. Mais une leçon c'est mieux !`
      : `⚠️ Tu n'as pas de jetons de gel ! Rate aujourd'hui et ta série repart à 0. Apprends quelque chose maintenant !`,
  }

  const cta: Record<EmailLang, string> = {
    en: `Keep My Streak! 🔥`,
    ar: `احمِ سلسلتي! 🔥`,
    fr: `Garder ma série ! 🔥`,
  }

  const html = wrap(`
    <div style="${HEADER_BASE} background: linear-gradient(135deg, #2a1500 0%, #1a0d00 100%);">
      ${logo('#ff6b6b')}
      <div style="font-size:60px;margin:12px 0;animation:pulse 1s infinite;">🔥</div>
      <h1 style="margin:0;font-size:28px;font-weight:900;color:#ff6b6b;">
        ${headline[d.lang]}
      </h1>
      <!-- Streak counter -->
      <div style="margin-top:20px;display:inline-block;background:rgba(255,107,107,0.15);border:2px solid rgba(255,107,107,0.4);border-radius:20px;padding:16px 32px;">
        <div style="font-size:48px;font-weight:900;color:#ff6b6b;">${d.currentStreak}</div>
        <div style="font-size:14px;font-weight:700;color:rgba(255,255,255,0.7);">
          ${isAr ? 'يوم متتالي' : isFr ? 'jours de suite' : 'day streak'}
        </div>
      </div>
    </div>

    <div style="${BODY}">
      <p style="font-size:16px;line-height:1.7;color:rgba(255,255,255,0.85);margin-bottom:20px;">
        ${body[d.lang]}
      </p>

      <div style="background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.25);border-radius:14px;padding:18px;margin-bottom:28px;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.75);">
          ${freezeNote[d.lang]}
        </p>
      </div>

      <div style="text-align:center;margin-bottom:16px;">
        <a href="${d.dashboardUrl}" style="${BTN_PRIMARY('#ff6b6b')}">${cta[d.lang]}</a>
      </div>
      <p style="text-align:center;color:#8888bb;font-size:13px;">
        ${isAr ? 'أي درس يكفي — حتى 5 دقائق تحسب!' : isFr ? 'N\'importe quelle leçon compte — même 5 minutes !' : 'Any lesson counts — even 5 minutes!'}
      </p>
    </div>

    <div style="${FOOTER}">
      ${isAr ? 'لإلغاء تلقي هذه التنبيهات' : isFr ? 'Pour ne plus recevoir ces alertes' : 'To stop streak alerts'},
      <a href="${d.dashboardUrl}/settings" style="color:#4d96ff;">
        ${isAr ? 'قم بتعديل الإعدادات' : isFr ? 'modifiez vos paramètres' : 'update your settings'}
      </a>.
    </div>
  `, d.lang)

  return { subject: subjects[d.lang], html }
}

// ── 3. WEEKLY PARENT REPORT ───────────────────────────────────
export interface WeeklyReportData {
  parentEmail:      string
  childName:        string
  childAvatar:      string
  // This week stats
  lessonsThisWeek:  number
  xpThisWeek:       number
  currentStreak:    number
  timeThisWeek:     number // minutes
  // Badges earned this week
  newBadges:        { name: string; emoji: string; rarity: string }[]
  // Skills in progress
  skillsInProgress: { name: string; emoji: string; pct: number }[]
  // Links
  parentDashUrl:    string
  appUrl:           string
  lang:             EmailLang
}

export function weeklyReportEmail(d: WeeklyReportData): { subject: string; html: string } {
  const isAr = d.lang === 'ar'
  const isFr = d.lang === 'fr'

  const timeStr = d.timeThisWeek >= 60
    ? `${Math.floor(d.timeThisWeek / 60)}h ${d.timeThisWeek % 60}m`
    : `${d.timeThisWeek}m`

  const weekRange = (() => {
    const now   = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - 7)
    const fmt = (x: Date) => x.toLocaleDateString(isAr ? 'ar-AE' : isFr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short' })
    return `${fmt(start)} – ${fmt(now)}`
  })()

  const subjects: Record<EmailLang, string> = {
    en: `📊 ${d.childName}'s weekly learning report — ${weekRange}`,
    ar: `📊 تقرير تعلّم ${d.childName} الأسبوعي — ${weekRange}`,
    fr: `📊 Rapport d'apprentissage hebdomadaire de ${d.childName} — ${weekRange}`,
  }

  const greeting: Record<EmailLang, string> = {
    en: `Here's how ${d.childName} ${d.childAvatar} did this week`,
    ar: `إليك ملخص أداء ${d.childName} ${d.childAvatar} هذا الأسبوع`,
    fr: `Voici comment ${d.childName} ${d.childAvatar} a progressé cette semaine`,
  }

  const assessment = (): { emoji: string; msg: Record<EmailLang, string> } => {
    if (d.lessonsThisWeek >= 5)  return { emoji: '🚀', msg: { en: 'Outstanding week!',    ar: 'أسبوع استثنائي!',     fr: 'Semaine exceptionnelle !' } }
    if (d.lessonsThisWeek >= 3)  return { emoji: '⭐', msg: { en: 'Great progress!',       ar: 'تقدم رائع!',          fr: 'Excellent progrès !'      } }
    if (d.lessonsThisWeek >= 1)  return { emoji: '💪', msg: { en: 'Good start!',            ar: 'بداية جيدة!',         fr: 'Bon début !'              } }
    return                               { emoji: '🌱', msg: { en: 'Just getting started…', ar: '…لا تزال البداية',    fr: 'C\'est un début…'         } }
  }
  const { emoji: assessEmoji, msg: assessMsg } = assessment()

  const statLabel: Record<string, Record<EmailLang, string>> = {
    lessons:  { en: 'Lessons', ar: 'دروس', fr: 'Leçons' },
    xp:       { en: 'XP',      ar: 'XP',   fr: 'XP'     },
    streak:   { en: 'Streak',  ar: 'سلسلة', fr: 'Série' },
    time:     { en: 'Time',    ar: 'وقت',   fr: 'Temps'  },
  }

  const html = wrap(`
    <div style="${HEADER_BASE} background: linear-gradient(135deg, #0d1b3e 0%, #1a1a3e 100%);">
      ${logo('#4d96ff')}
      <div style="font-size:16px;color:rgba(255,255,255,0.5);font-weight:600;margin-bottom:12px;">${weekRange}</div>
      <h1 style="margin:0;font-size:24px;font-weight:900;line-height:1.3;">
        ${greeting[d.lang]}
      </h1>
      <div style="margin-top:16px;font-size:32px;">${assessEmoji}</div>
      <div style="font-size:20px;font-weight:800;color:#4d96ff;margin-top:4px;">${assessMsg[d.lang]}</div>
    </div>

    <div style="${BODY}">

      <!-- Stats grid -->
      <div style="text-align:center;margin-bottom:28px;">
        ${[
          { val: d.lessonsThisWeek, label: statLabel.lessons[d.lang], color: '#4d96ff', emoji: '📚' },
          { val: `+${d.xpThisWeek}`, label: statLabel.xp[d.lang],   color: '#ffd93d', emoji: '⚡' },
          { val: `${d.currentStreak}d`, label: statLabel.streak[d.lang], color: '#ff6b6b', emoji: '🔥' },
          { val: timeStr,            label: statLabel.time[d.lang],  color: '#6bcb77', emoji: '⏱' },
        ].map(s => `
          <div style="${STAT_BOX(s.color)}">
            <div style="font-size:24px;">${s.emoji}</div>
            <div style="font-size:28px;font-weight:900;color:${s.color};margin:4px 0;">${s.val}</div>
            <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);">${s.label}</div>
          </div>
        `).join('')}
      </div>

      <!-- New badges this week -->
      ${d.newBadges.length > 0 ? `
        <div style="margin-bottom:24px;">
          <h3 style="margin:0 0 14px;font-size:16px;font-weight:800;">
            🏆 ${isAr ? 'شارات جديدة هذا الأسبوع' : isFr ? 'Nouveaux badges cette semaine' : 'New badges this week'}
          </h3>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            ${d.newBadges.map(b => `
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:10px;">
                <span style="font-size:24px;">${b.emoji}</span>
                <div>
                  <div style="font-size:13px;font-weight:800;">${b.name}</div>
                  <div style="font-size:11px;color:#8888bb;text-transform:capitalize;">${b.rarity}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Skills in progress -->
      ${d.skillsInProgress.length > 0 ? `
        <div style="margin-bottom:28px;">
          <h3 style="margin:0 0 14px;font-size:16px;font-weight:800;">
            🗺️ ${isAr ? 'المهارات قيد التعلم' : isFr ? 'Compétences en cours' : 'Skills in progress'}
          </h3>
          ${d.skillsInProgress.slice(0, 4).map(s => `
            <div style="margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:14px;font-weight:700;">${s.emoji} ${s.name}</span>
                <span style="font-size:12px;font-weight:800;color:${s.pct >= 100 ? '#6bcb77' : '#4d96ff'};">
                  ${s.pct >= 100 ? '✅ Done!' : `${s.pct}%`}
                </span>
              </div>
              <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:999px;overflow:hidden;">
                <div style="height:100%;width:${s.pct}%;background:${s.pct >= 100 ? '#6bcb77' : 'linear-gradient(90deg,#4d96ff,#c77dff)'};border-radius:999px;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Parent tips -->
      <div style="background:rgba(77,150,255,0.06);border:1px solid rgba(77,150,255,0.2);border-radius:16px;padding:20px;margin-bottom:28px;">
        <h3 style="margin:0 0 12px;font-size:15px;font-weight:800;">
          💡 ${isAr ? 'نصيحة لولي الأمر' : isFr ? 'Conseil pour les parents' : 'Parent tip this week'}
        </h3>
        <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.75);">
          ${isAr
            ? `أفضل طريقة لتحفيز ${d.childName} هي الاحتفال بالشارات الجديدة. اسأله/ها عن شاراته/ها وستلاحظ تحسناً كبيراً في الدافعية.`
            : isFr
            ? `La meilleure façon de motiver ${d.childName} est de célébrer les nouveaux badges. Demandez-lui de vous les montrer et vous verrez une grande amélioration de sa motivation.`
            : `The best way to motivate ${d.childName} is to celebrate new badges together. Ask to see the badge collection and you'll notice a big boost in motivation.`
          }
        </p>
      </div>

      <div style="text-align:center;">
        <a href="${d.parentDashUrl}" style="${BTN_PRIMARY('#4d96ff')}">
          ${isAr ? 'عرض لوحة التقدم الكاملة' : isFr ? 'Voir le tableau de bord complet' : 'View Full Progress Dashboard'}
        </a>
      </div>
    </div>

    <div style="${FOOTER}">
      ${isAr
        ? `هذا التقرير أُرسل إلى ${d.parentEmail} لأن طفلك أضاف بريدك في إعداداته.`
        : isFr
        ? `Ce rapport a été envoyé à ${d.parentEmail} car votre enfant a ajouté votre email dans ses paramètres.`
        : `This report was sent to ${d.parentEmail} because your child added your email in their settings.`
      }<br/>
      <a href="${d.appUrl}" style="color:#4d96ff;">Plulai.com</a> ·
      <a href="mailto:hello@plulai.com" style="color:#4d96ff;">hello@plulai.com</a>
    </div>
  `, d.lang)

  return { subject: subjects[d.lang], html }
}

// ── 4. PARENT MAGIC LINK EMAIL ────────────────────────────────
export interface ParentMagicLinkData {
  parentEmail:  string
  childName:    string
  childAvatar:  string
  magicLink:    string
  expiresHours: number
  lang:         EmailLang
}

export function parentMagicLinkEmail(d: ParentMagicLinkData): { subject: string; html: string } {
  const isAr = d.lang === 'ar'
  const isFr = d.lang === 'fr'

  const subjects: Record<EmailLang, string> = {
    en: `${d.childAvatar} ${d.childName} shared their Plulai progress with you`,
    ar: `${d.childAvatar} ${d.childName} شارك/ت تقدمه/ا على Plulai معك`,
    fr: `${d.childAvatar} ${d.childName} a partagé sa progression Plulai avec vous`,
  }

  const html = wrap(`
    <div style="${HEADER_BASE} background: linear-gradient(135deg, #1a0a2e 0%, #2d1b69 100%);">
      ${logo('#c77dff')}
      <div style="font-size:64px;margin:16px 0;">${d.childAvatar}</div>
      <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;">
        ${isAr
          ? `${d.childName} يريد/تريد مشاركة تقدمه/ا معك!`
          : isFr
          ? `${d.childName} veut partager sa progression avec vous !`
          : `${d.childName} wants to share their progress with you!`
        }
      </h1>
    </div>

    <div style="${BODY}">
      <p style="font-size:16px;line-height:1.7;color:rgba(255,255,255,0.85);margin-bottom:28px;">
        ${isAr
          ? `مرحباً! أرسل لك ${d.childName} رابطاً خاصاً لعرض تقدمه/ا على Plulai — بما في ذلك درجاته، شاراته، وسلسلته اليومية. لا تحتاج إلى إنشاء حساب.`
          : isFr
          ? `Bonjour ! ${d.childName} vous a envoyé un lien privé pour voir sa progression sur Plulai — incluant ses scores, badges et série quotidienne. Aucun compte nécessaire.`
          : `Hi! ${d.childName} sent you a private link to see their progress on Plulai — including lessons completed, badges earned, and daily streak. No account needed.`
        }
      </p>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="${d.magicLink}" style="${BTN_PRIMARY('#c77dff')}">
          ${isAr ? `عرض تقدم ${d.childName} ←` : isFr ? `Voir la progression de ${d.childName} →` : `View ${d.childName}'s Progress →`}
        </a>
      </div>

      <div style="background:rgba(255,255,255,0.04);border-radius:14px;padding:18px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.55);line-height:1.6;">
          ${isAr
            ? `🔒 هذا الرابط خاص وصالح لمدة ${d.expiresHours} ساعة. لا تشاركه مع آخرين.`
            : isFr
            ? `🔒 Ce lien est privé et valide pendant ${d.expiresHours} heures. Ne le partagez pas.`
            : `🔒 This link is private and valid for ${d.expiresHours} hours. Please don't share it with others.`
          }
        </p>
      </div>

      <p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.6);margin:0;">
        ${isAr
          ? `يمكنك طلب رابط جديد في أي وقت من خلال إعدادات ${d.childName} على Plulai.`
          : isFr
          ? `Vous pouvez demander un nouveau lien à tout moment depuis les paramètres de ${d.childName} sur Plulai.`
          : `You can request a new link anytime from ${d.childName}'s settings on Plulai.`
        }
      </p>
    </div>

    <div style="${FOOTER}">
      ${isAr
        ? `تلقيت هذا البريد لأن طفلك أضاف ${d.parentEmail} كبريد ولي الأمر.`
        : isFr
        ? `Vous avez reçu cet email car votre enfant a ajouté ${d.parentEmail} comme email parent.`
        : `You received this because ${d.parentEmail} was added as a parent email by ${d.childName}.`
      }<br/>
      <a href="mailto:hello@plulai.com" style="color:#4d96ff;">hello@plulai.com</a>
    </div>
  `, d.lang)

  return { subject: subjects[d.lang], html }
}
