export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; alt: string; caption?: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Coding" | "AI & Future Tech" | "Entrepreneurship" | "Parenting" | "Schools" | "Case Study";
  accent: string; // brand css var, e.g. "var(--brand-blue)"
  coverImage: string; // path under /public, e.g. "/blog/covers/first-app.jpg"
  coverEmoji: string; // fallback icon shown on the card/hero
  date: string; // e.g. "2026-06-18"
  readTime: string; // e.g. "6 min read"
  author: { name: string; role: string };
  content: BlogBlock[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "template-brain-tunisian-students",
    title: "The Template Brain: What Tunisian Students Taught Us About Creativity, Fear, and Code",
    excerpt:
      "A 10-year-old will happily invent a command that doesn't exist just to see what happens. A 16-year-old from one of Tunisia's top schools will stare at an error and wait for someone to tell them what to do.",
    category: "Case Study",
    accent: "var(--brand-red)",
    coverImage: "/blog/covers/template-brain.jpg",
    coverEmoji: "📐",
    date: "2026-07-06",
    readTime: "8 min read",
    author: { name: "Plulai Team", role: "Research" },
    content: [
      {
        type: "paragraph",
        text: "A 10-year-old will happily invent a command that doesn't exist just to see what happens. A 16-year-old from one of Tunisia's top schools will stare at an error and wait for someone to tell them what to do.",
      },
      {
        type: "paragraph",
        text: "That's the pattern we kept seeing across our coding sessions with Tunisian students — and it's not about talent. It's about what school teaches kids to feel about being wrong.",
      },
      { type: "heading", text: "Two groups, two completely different relationships with mistakes" },
      { type: "heading", text: "Ages 10–12: The Inventors" },
      {
        type: "paragraph",
        text: "Younger students in our program experimented constantly. When something didn't work, they didn't freeze — they tried another way. Sometimes that meant making up their own syntax, guessing at a command, or bending a concept to fit their own logic, even when it was technically wrong. Being wrong didn't carry much weight for them. Trying was just... the default.",
      },
      { type: "heading", text: "Ages 15–17: The Template Followers" },
      {
        type: "paragraph",
        text: "Older students — especially those from Tunisia's elite \"pioneer\" schools (écoles pilotes) — showed the opposite instinct. Hit an error, and the first move was to ask the instructor for the fix, not attempt one. Many couldn't move forward at all without a template in front of them. Without one, the \"continue\" button might as well not exist. Their process looked less like problem-solving and more like recognition: copy, paste, adjust slightly, repeat.",
      },
      { type: "heading", text: "The real finding: it's not ability, it's fear" },
      {
        type: "paragraph",
        text: "On paper, the older group were the stronger academic performers. But ability wasn't the differentiator here — their relationship to risk was.",
      },
      {
        type: "paragraph",
        text: "The younger kids hadn't yet been shaped by a system that grades performance and punishes deviation. The older ones, especially from the most academically prestigious schools, had spent years in an environment where a wrong answer costs something real: a lower grade, a comparison, a step behind in a demanding curriculum. Many seem to have absorbed a simple survival rule: don't attempt something unless you're already sure it'll work.",
      },
      {
        type: "paragraph",
        text: "That rule is smart inside an exam. It's a disaster everywhere else. Coding, building, designing, debugging — almost everything worth doing requires trying things that might fail. A student trained to avoid that risk isn't behind on skill. They're behind on practice at being wrong safely.",
      },
      { type: "heading", text: "Why this should worry (and motivate) educators" },
      {
        type: "paragraph",
        text: "The schools built to produce Tunisia's top academic performers may also be producing a specific kind of dependency — one where fear of error outweighs the instinct to explore. The \"template brain\" isn't a character flaw in these students. It's a rational response to a system that punishes experimentation.",
      },
      {
        type: "paragraph",
        text: "For anyone building education tools, this isn't just a teaching problem — it's a design problem. An environment that quietly rewards copy-paste and penalizes messy attempts will train template thinkers, no matter how good the content is.",
      },
      { type: "heading", text: "What we're changing at Plulai" },
      {
        type: "list",
        items: [
          "Normalize wrong answers as part of the process, not a detour from it.",
          "Reward the attempt, not just the correct output — especially for students who need to unlearn the fear first.",
          "Reduce reliance on templates as a crutch, and scaffold toward independent problem-solving instead.",
          "Treat every error as data — about the student, and about where a system trained the confidence out of them.",
        ],
      },
      {
        type: "paragraph",
        text: "The 10-to-12-year-olds in our program remind us what unfiltered curiosity looks like. The 15-to-17-year-olds remind us how efficiently a \"good\" system can train it out of someone — and how much intentional work it takes to bring it back.",
      },
      {
        type: "quote",
        text: "Plulai — building coding education that rewards trying, not just getting it right.",
      },
    ],
  },
  {
    slug: "ai-literacy-for-kids",
    title: "AI Literacy Isn't Optional Anymore — Here's What Kids Should Understand by 12",
    excerpt:
      "Kids are already using AI tools daily. The question isn't whether to teach them how it works — it's how early to start.",
    category: "AI & Future Tech",
    accent: "var(--brand-cyan)",
    coverImage: "/blog/covers/ai-literacy.jpg",
    coverEmoji: "🧠",
    date: "2026-06-25",
    readTime: "7 min read",
    author: { name: "Plulai Team", role: "Curriculum" },
    content: [
      {
        type: "paragraph",
        text: "PASTE INTRO PARAGRAPH HERE.",
      },
      { type: "heading", text: "What 'understanding AI' means at each age" },
      {
        type: "paragraph",
        text: "PASTE PARAGRAPH HERE.",
      },
      {
        type: "list",
        items: [
          "PASTE LIST ITEM HERE",
          "PASTE LIST ITEM HERE",
          "PASTE LIST ITEM HERE",
        ],
      },
      { type: "heading", text: "Prompting is a literacy skill, not a shortcut" },
      {
        type: "paragraph",
        text: "PASTE PARAGRAPH HERE.",
      },
      {
        type: "quote",
        text: "PASTE QUOTE HERE.",
        attribution: "Attribution",
      },
      { type: "heading", text: "The line between using AI and outsourcing thinking" },
      {
        type: "paragraph",
        text: "PASTE PARAGRAPH HERE.",
      },
    ],
  },
  {
    slug: "first-business-lessons",
    title: "What an 11-Year-Old's First Digital Business Actually Teaches Them",
    excerpt:
      "It's rarely about the money. The kids who launch a small project early learn budgeting, marketing, and rejection — years ahead of schedule.",
    category: "Entrepreneurship",
    accent: "var(--brand-gold)",
    coverImage: "/blog/covers/first-business.jpg",
    coverEmoji: "💡",
    date: "2026-07-01",
    readTime: "5 min read",
    author: { name: "Plulai Team", role: "Curriculum" },
    content: [
      {
        type: "paragraph",
        text: "PASTE INTRO PARAGRAPH HERE.",
      },
      { type: "heading", text: "The first budget is the real lesson" },
      {
        type: "paragraph",
        text: "PASTE PARAGRAPH HERE.",
      },
      {
        type: "quote",
        text: "PASTE QUOTE HERE.",
        attribution: "Attribution",
      },
      { type: "heading", text: "Marketing without a marketing budget" },
      {
        type: "paragraph",
        text: "PASTE PARAGRAPH HERE.",
      },
      {
        type: "list",
        items: [
          "PASTE LIST ITEM HERE",
          "PASTE LIST ITEM HERE",
          "PASTE LIST ITEM HERE",
        ],
      },
      { type: "heading", text: "Handling the first 'no'" },
      {
        type: "paragraph",
        text: "PASTE PARAGRAPH HERE.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, count = 2): BlogPost[] {
  return blogPosts.filter((p) => p.slug !== slug).slice(0, count);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}