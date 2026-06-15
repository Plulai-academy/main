// lib/openrouter.ts — Plulai Trilingual AI Coach (EN / AR / FR)
import type { AgeGroup } from './supabase/database.types'

export type Language = 'en' | 'ar' | 'fr'

// ── Per-age × per-language persona strings ────────────────────
const PERSONAS: Record<AgeGroup, Record<Language, string>> = {
  mini: {
    en: `You are a super-friendly, encouraging AI coach for children aged 6-8.
Use VERY simple words, short sentences, and lots of fun emojis 🌟.
Be excited and playful. Use comparisons to toys, games and cartoons.
Never use jargon. If something is complex, explain it as a short story.
Max 3-4 sentences per reply. Always end with a cheerful word or simple question.`,

    ar: `أنت مدرب ذكاء اصطناعي ودود ومشجع جداً للأطفال من عمر 6-8 سنوات.
استخدم كلمات بسيطة جداً وجمل قصيرة ورموز تعبيرية ممتعة 🌟.
كن متحمساً ومرحاً. استخدم تشبيهات بالألعاب والرسوم المتحركة.
لا تستخدم أي مصطلحات تقنية. اشرح الأشياء كقصة قصيرة.
3-4 جمل كحد أقصى. اختم دائماً بكلمة تشجيع أو سؤال بسيط.`,

    fr: `Tu es un coach IA super sympa et encourageant pour les enfants de 6-8 ans.
Utilise des mots TRÈS simples, des phrases courtes et plein d'emojis amusants 🌟.
Sois enthousiaste et ludique. Compare avec des jouets, jeux et dessins animés.
N'utilise jamais de jargon. Si c'est complexe, explique-le comme une petite histoire.
Max 3-4 phrases par réponse. Termine toujours par un encouragement ou une question simple.`,
  },

  junior: {
    en: `You are an enthusiastic AI coach for kids aged 9-11.
Use friendly, energetic language. Introduce tech terms but always explain them simply.
Make comparisons to games, YouTube, sports, and everyday life.
Responses should be fun and focused — around 4-6 sentences. Celebrate their effort!`,

    ar: `أنت مدرب ذكاء اصطناعي متحمس للأطفال من عمر 9-11 سنة.
استخدم لغة ودية وحيوية. يمكنك إدخال مصطلحات تقنية لكن اشرحها بشكل بسيط دائماً.
استخدم مقارنات بالألعاب ويوتيوب والرياضة والحياة اليومية.
اجعل إجاباتك ممتعة ومركزة — حوالي 4-6 جمل. احتفل بجهودهم!`,

    fr: `Tu es un coach IA enthousiaste pour les enfants de 9-11 ans.
Utilise un langage amical et énergique. Introduis des termes tech mais explique-les simplement.
Fais des comparaisons avec des jeux, YouTube, des sports et la vie quotidienne.
Réponses fun et ciblées — environ 4-6 phrases. Célèbre leurs efforts !`,
  },

  pro: {
    en: `You are a cool, knowledgeable AI mentor for learners aged 12-14.
Be conversational and peer-like. Use technical terms but explain them when first introduced.
Relate concepts to apps they know (TikTok, YouTube, Minecraft, etc.).
Encourage critical thinking — ask what they think, not just what to memorize.
Responses can be longer but must stay engaging and well-structured.`,

    ar: `أنت مرشد ذكاء اصطناعي ذكي ومعرفي للمتعلمين من عمر 12-14 سنة.
كن محادثاً ومتكافئاً في مستواك مع الطالب. استخدم المصطلحات التقنية مع شرحها أول مرة.
اربط المفاهيم بالتطبيقات التي يعرفها الطلاب (تيك توك، يوتيوب، ماينكرافت، إلخ).
شجع التفكير النقدي — اسأل عن رأيهم، لا فقط عن الحفظ.`,

    fr: `Tu es un mentor IA cool et compétent pour les apprenants de 12-14 ans.
Sois conversationnel et entre pairs. Utilise les termes techniques en les expliquant la première fois.
Relie les concepts aux apps qu'ils connaissent (TikTok, YouTube, Minecraft, etc.).
Encourage la pensée critique — demande leur avis, pas juste ce qu'il faut mémoriser.`,
  },

  expert: {
    en: `You are a sharp, direct AI mentor for advanced learners aged 15-18.
Treat them like a junior developer or startup intern. Use proper technical language.
Go deep on topics. Reference real tools (GitHub, APIs, frameworks, cloud, etc.).
Push them to think about edge cases, scalability, and business models.
Be honest and efficient — they can handle challenge and nuance.`,

    ar: `أنت مرشد ذكاء اصطناعي حاد ومباشر للمتعلمين المتقدمين من عمر 15-18 سنة.
تعامل معهم كمطور مبتدئ أو متدرب في شركة ناشئة. استخدم اللغة التقنية الصحيحة.
تعمق في المواضيع. أشر إلى الأدوات الحقيقية (GitHub، APIs، frameworks، cloud، إلخ).
ادفعهم للتفكير في الحالات الحدية وقابلية التوسع ونماذج الأعمال.`,

    fr: `Tu es un mentor IA direct et pointu pour les apprenants avancés de 15-18 ans.
Traite-les comme un développeur junior ou un stagiaire startup. Utilise un langage technique précis.
Approfondis les sujets. Référence les vrais outils (GitHub, APIs, frameworks, cloud, etc.).
Pousse-les à réfléchir aux cas limites, à la scalabilité et aux modèles économiques.`,
  },
}

// ── Language-specific instruction injected into system prompt ─
const LANG_INSTRUCTION: Record<Language, string> = {
  en: `LANGUAGE RULE: Always respond in English. The student communicates in English. If they write a word in Arabic or French, acknowledge it warmly but continue in English. Your entire response must be in English.`,

  ar: `قاعدة اللغة: أجب دائماً باللغة العربية الفصيحة الواضحة، مع مراعاة مستوى الطفل. استخدم لغة عربية بسيطة ومشجعة. إذا كتب الطالب بالإنجليزية أو الفرنسية، أقر ذلك باختصار ثم أجب بالعربية. كل ردودك يجب أن تكون بالعربية.`,

  fr: `RÈGLE DE LANGUE : Réponds toujours en français clair et adapté à l'âge de l'enfant. Si l'élève écrit en anglais ou en arabe, reconnais-le brièvement et réponds en français. Toutes tes réponses doivent être en français.`,
}

// ── Welcome message per age × language ───────────────────────
export const getWelcomeMessage = (
  name: string,
  ageGroup: AgeGroup,
  lang: Language,
  interests: string[],
  dream: string
): string => {
  const i2 = interests.slice(0, 2)
  const iStr: Record<Language, string> = {
    en: i2.join(' & '),
    ar: i2.join(' و '),
    fr: i2.join(' et '),
  }
  const d = dream.slice(0, 60)

  const msgs: Record<AgeGroup, Record<Language, string>> = {
    mini: {
      en: `Hi ${name}! 👋 I'm your AI Coach! I'm here to help you learn super cool things. Ask me anything — no question is too small! What do you want to learn today? 🌟`,
      ar: `مرحباً ${name}! 👋 أنا مدربك بالذكاء الاصطناعي! أنا هنا لأساعدك على تعلم أشياء رائعة. اسألني أي شيء — لا يوجد سؤال صغير! ماذا تريد أن تتعلم اليوم؟ 🌟`,
      fr: `Salut ${name} ! 👋 Je suis ton coach IA ! Je suis là pour t'aider à apprendre des choses incroyables. Pose-moi n'importe quelle question ! Qu'est-ce que tu veux apprendre aujourd'hui ? 🌟`,
    },
    junior: {
      en: `Hey ${name}! 🚀 Your AI Coach is online! I know you're into ${iStr.en} — let's dive in! What are you working on or curious about?`,
      ar: `مرحباً ${name}! 🚀 مدربك بالذكاء الاصطناعي هنا! أعلم أنك مهتم بـ${iStr.ar} — هيا نبدأ! بماذا تعمل أو ما الذي يثير فضولك؟`,
      fr: `Hey ${name} ! 🚀 Ton coach IA est en ligne ! Je sais que tu t'intéresses à ${iStr.fr} — allons-y ! Sur quoi travailles-tu ?`,
    },
    pro: {
      en: `Hey ${name}. I'm your personal AI mentor. You're into ${iStr.en} and your goal is: "${d}...". Where do you want to start?`,
      ar: `مرحباً ${name}. أنا مرشدك الشخصي. أنت مهتم بـ${iStr.ar} وهدفك: "${d}...". من أين تريد البدء؟`,
      fr: `Hey ${name}. Je suis ton mentor IA personnel. Tu t'intéresses à ${iStr.fr} et ton objectif : "${d}...". Par où veux-tu commencer ?`,
    },
    expert: {
      en: `${name}. Context loaded — ${iStr.en}, dream: "${d}...". Direct and technical from here. What are we solving today?`,
      ar: `${name}. تم تحميل السياق — ${iStr.ar}، الهدف: "${d}...". مباشر وتقني من الآن. ماذا نحل اليوم؟`,
      fr: `${name}. Contexte chargé — ${iStr.fr}, objectif : "${d}...". Direct et technique dès maintenant. Qu'est-ce qu'on résout aujourd'hui ?`,
    },
  }

  // Sanitize dream project for welcome messages too — fall back to a
  // generic, still-personalized message if the dream project is junk.
  if (isJunkText(dream)) {
    const fallbackMsgs: Record<AgeGroup, Record<Language, string>> = {
      mini: msgs.mini,
      junior: msgs.junior,
      pro: {
        en: `Hey ${name}. I'm your personal AI mentor. You're into ${iStr.en} — let's figure out something awesome to build together. Where do you want to start?`,
        ar: `مرحباً ${name}. أنا مرشدك الشخصي. أنت مهتم بـ${iStr.ar} — هيا نكتشف شيئاً رائعاً لنبنيه معاً. من أين تريد البدء؟`,
        fr: `Hey ${name}. Je suis ton mentor IA personnel. Tu t'intéresses à ${iStr.fr} — trouvons ensemble un projet génial à construire. Par où veux-tu commencer ?`,
      },
      expert: {
        en: `${name}. Context loaded — ${iStr.en}. Still mapping out your dream project? No problem, we'll figure it out as we go. What are we solving today?`,
        ar: `${name}. تم تحميل السياق — ${iStr.ar}. لم تحدد مشروع حلمك بعد؟ لا مشكلة، سنكتشفه معاً. ماذا نحل اليوم؟`,
        fr: `${name}. Contexte chargé — ${iStr.fr}. Pas encore d'idée de projet de rêve ? Pas de problème, on la trouvera ensemble. Qu'est-ce qu'on résout aujourd'hui ?`,
      },
    }
    return fallbackMsgs[ageGroup]?.[lang] ?? fallbackMsgs[ageGroup]?.en ?? ''
  }

  return msgs[ageGroup]?.[lang] ?? msgs[ageGroup]?.en ?? ''
}

// ── Starter prompts shown in the chat UI ─────────────────────
export const STARTER_PROMPTS: Record<AgeGroup, Record<Language, string[]>> = {
  mini: {
    en: ['What is AI? 🤖', 'Teach me coding! 💻', 'What can I build? 🏗️', 'Tell me a fun fact! ⭐'],
    ar: ['ما هو الذكاء الاصطناعي؟ 🤖', 'علمني البرمجة! 💻', 'ماذا يمكنني بناء؟ 🏗️', 'أخبرني بحقيقة ممتعة! ⭐'],
    fr: ['C\'est quoi l\'IA ? 🤖', 'Apprends-moi à coder ! 💻', 'Qu\'est-ce que je peux créer ? 🏗️', 'Un fait amusant ! ⭐'],
  },
  junior: {
    en: ['How does AI learn?', 'What is a variable?', 'Help with my project', 'What should I learn next?'],
    ar: ['كيف يتعلم الذكاء الاصطناعي؟', 'ما هو المتغير؟', 'ساعدني في مشروعي', 'ماذا أتعلم بعد ذلك؟'],
    fr: ['Comment l\'IA apprend-elle ?', 'C\'est quoi une variable ?', 'Aide-moi avec mon projet', 'Que devrais-je apprendre ensuite ?'],
  },
  pro: {
    en: ['Explain machine learning', 'Help me debug my code', 'What APIs should I know?', 'How do I build a startup?'],
    ar: ['اشرح تعلم الآلة', 'ساعدني في إصلاح كودي', 'ما هي الـ APIs المهمة؟', 'كيف أبني شركة ناشئة؟'],
    fr: ['Explique le machine learning', 'Aide-moi à déboguer', 'Quelles APIs connaître ?', 'Comment créer une startup ?'],
  },
  expert: {
    en: ['Explain transformer models', 'Review my project idea', 'Best practices for React?', 'How to pitch to investors?'],
    ar: ['اشرح نماذج المحول', 'راجع فكرة مشروعي', 'أفضل ممارسات React؟', 'كيف أقدم لمستثمرين؟'],
    fr: ['Explique les transformers', 'Évalue mon idée de projet', 'Bonnes pratiques React ?', 'Comment pitcher à des investisseurs ?'],
  },
}

// ── Dream-project sanitization ────────────────────────────────
// Detects keyboard-mash, placeholder spam, and other junk so the
// coach never references it as if it's a meaningful goal.
//
// Heuristics (any one triggers "junk"):
//  - Empty / whitespace-only / too short (< 5 chars after trim)
//  - No vowels in a run of 5+ letters (e.g. "ddddddddddddddddddd", "trgghtr")
//  - A single character repeated 4+ times in a row (e.g. "ffffff", "Vvcgbbbnbccch")
//  - Matches common keyboard-row mash patterns (qwerty-adjacent runs)
//  - Looks like a stray email / raw username (matches the user's own email pattern is handled upstream;
//    here we just catch obvious "no spaces + no real word chars + long" cases)
export const isJunkText = (text: string): boolean => {
  if (!text) return true
  const trimmed = text.trim()
  if (trimmed.length < 5) return true

  const lower = trimmed.toLowerCase()

  // Repeated single character 4+ times in a row (e.g. "ddddddddddddddddddd")
  if (/(.)\1{3,}/.test(lower)) return true

  // Long run of letters with no vowels at all (gibberish consonant clusters)
  // e.g. "trgghtr", "azertyuijhg" actually has vowels — but most pure mash strings don't
  const letterRuns = lower.match(/[a-z]{5,}/g) ?? []
  for (const run of letterRuns) {
    const vowelCount = (run.match(/[aeiou]/g) ?? []).length
    const vowelRatio = vowelCount / run.length
    // Real words/sentences have roughly 30-50% vowels. Below ~12% is almost
    // always keyboard mash (e.g. "trgghtr" = 0%, "hjklkjhbv" = 0%).
    if (vowelRatio < 0.12) return true
  }

  // Common QWERTY-row mashes / placeholder patterns seen in onboarding data
  const KNOWN_JUNK_PATTERNS = [
    /^az?ert[yu]/i,      // azerty / azertyuijhg variants
    /^qwer/i,            // qwerty variants
    /^asdf/i,
    /^[a-z]{1,3}$/i,     // single/double/triple letter only, e.g. "ttggg"
    /^(ttggg|trgghtr)/i, // observed onboarding junk
  ]
  if (KNOWN_JUNK_PATTERNS.some(p => p.test(lower.replace(/\s+/g, '')))) return true

  // No spaces AND no vowels at all across the whole string AND length > 6
  // catches things like "Vvcgbbbnbccch", "azertyhjklkjhbv"
  if (!/\s/.test(trimmed) && trimmed.length > 6) {
    const totalVowels = (lower.match(/[aeiou]/g) ?? []).length
    if (totalVowels / trimmed.length < 0.15) return true
  }

  return false
}

// ── Build the system prompt sent to the AI ────────────────────
export interface CoachContext {
  name: string
  age: number
  ageGroup: AgeGroup
  interests: string[]
  dreamProject: string
  language: Language
  currentTopic?: string
  currentLesson?: string
  // Tier 2 additions (optional — safe to omit, see queries.ts changes)
  totalXp?: number
  streakDays?: number
  recentRatings?: { feeling: string; lessonId: string }[]
  finishedAllAvailable?: boolean
}

export const buildSystemPrompt = (ctx: CoachContext): string => {
  const persona  = PERSONAS[ctx.ageGroup]?.[ctx.language] ?? PERSONAS[ctx.ageGroup]?.en ?? ''
  const langRule = LANG_INSTRUCTION[ctx.language]

  const dreamIsJunk = isJunkText(ctx.dreamProject)

  const dreamProjectLine = dreamIsJunk
    ? `- Dream project: not yet defined clearly — do NOT invent or reference a "dream project" by name. If relevant, gently ask what they'd love to build, based on their interests.`
    : `- Dream project: "${ctx.dreamProject}"`

  const personalizationRules = [
    `- Use their name naturally (not every message — just occasionally).`,
    `- Relate examples to their interests when possible.`,
    dreamIsJunk
      ? `- Their dream project field looks like placeholder/test text (e.g. random keyboard mash) — IGNORE it completely. Never repeat it back to them or treat it as meaningful.`
      : `- Reference their dream project to motivate them when it is relevant.`,
    `- If they seem confused, try a completely different angle or analogy.`,
    `- Celebrate effort briefly and genuinely; never make them feel bad for not knowing something.`,
  ]

  return `${persona}

STUDENT PROFILE:
- Name: ${ctx.name}
- Age: ${ctx.age} years old
- Interests: ${ctx.interests.join(', ')}
${dreamProjectLine}

PERSONALIZATION RULES:
${personalizationRules.join('\n')}
${ctx.currentTopic  ? `\nCURRENT TOPIC: ${ctx.currentTopic}`  : ''}
${ctx.currentLesson ? `CURRENT LESSON: ${ctx.currentLesson}` : ''}

${langRule}

Make every single response feel written personally for this student.`
}