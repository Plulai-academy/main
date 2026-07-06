"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { SiteStyleTag, SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getPostBySlug, getRelatedPosts, formatDate, type BlogBlock } from "@/lib/blog-posts";

function Block({ block, accent }: { block: BlogBlock; accent: string }) {
  switch (block.type) {
    case "heading":
      return <h2 className="font-display text-2xl lg:text-3xl font-bold mt-12 mb-4">{block.text}</h2>;
    case "paragraph":
      return <p className="text-foreground/80 text-lg leading-relaxed mb-6">{block.text}</p>;
    case "quote":
      return (
        <blockquote
          className="my-8 pl-6 py-2 text-xl font-display italic leading-relaxed"
          style={{ borderLeft: `4px solid ${accent}`, color: "var(--foreground)" }}
        >
          &ldquo;{block.text}&rdquo;
          {block.attribution && (
            <footer className="mt-3 text-sm font-sans not-italic font-bold text-foreground/50">— {block.attribution}</footer>
          )}
        </blockquote>
      );
    case "list":
      return (
        <ul className="space-y-3 mb-8">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-foreground/80 text-lg leading-relaxed">
              <span className="mt-2 size-2 rounded-full flex-shrink-0" style={{ background: accent }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <figure className="my-10">
          <img src={block.src} alt={block.alt} className="w-full rounded-2xl ring-1 ring-border" />
          {block.caption && <figcaption className="text-center text-sm text-foreground/50 mt-3">{block.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}

function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const related = getRelatedPosts(post!.slug);

  return (
    <>
      <SiteStyleTag />
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />

        {/* HERO */}
        <section className="pt-16 pb-12 px-6 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${post!.accent}30, transparent 70%)` }}
          />
          <div className="max-w-3xl mx-auto relative">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground mb-8 transition-colors">
              ← Back to blog
            </Link>

            <span
              className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5"
              style={{ background: `${post!.accent}20`, color: post!.accent }}
            >
              {post!.category}
            </span>

            <h1 className="font-display text-3xl lg:text-5xl font-bold leading-[1.1] mb-6">{post!.title}</h1>

            <div className="flex items-center gap-4 text-sm text-foreground/50 font-bold">
              <div className="flex items-center gap-2">
                <div
                  className="size-9 rounded-full grid place-items-center text-sm"
                  style={{ background: `${post!.accent}30`, color: post!.accent }}
                >
                  {post!.author.name.charAt(0)}
                </div>
                <div>
                  <div className="text-foreground">{post!.author.name}</div>
                  <div className="text-xs font-semibold text-foreground/40">{post!.author.role}</div>
                </div>
              </div>
              <span className="text-foreground/30">·</span>
              <span>{formatDate(post!.date)}</span>
              <span className="text-foreground/30">·</span>
              <span>{post!.readTime}</span>
            </div>
          </div>
        </section>

        {/* COVER */}
        <section className="px-6 mb-4">
          <div
            className="max-w-3xl mx-auto h-64 lg:h-80 rounded-3xl grid place-items-center ring-1 ring-border"
            style={{ background: `linear-gradient(135deg, ${post!.accent}25, transparent)` }}
          >
            <span className="text-8xl">{post!.coverEmoji}</span>
          </div>
        </section>

        {/* CONTENT */}
        <section className="py-12 px-6">
          <article className="max-w-3xl mx-auto">
            {post!.content.map((block, i) => (
              <Block key={i} block={block} accent={post!.accent} />
            ))}
          </article>
        </section>

        {/* SHARE / CTA STRIP */}
        <section className="px-6 mb-20">
          <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-surface ring-1 ring-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-display text-xl font-bold mb-1">Want your kid building this too?</div>
              <div className="text-foreground/60 text-sm">Start with one free lesson — no credit card needed.</div>
            </div>
            <a href="https://www.plulai.com/auth/signup" className="shelf-blue font-bold py-3.5 px-7 rounded-2xl text-center whitespace-nowrap">
              Try a free lesson →
            </a>
          </div>
        </section>

        {/* RELATED POSTS */}
        {related.length > 0 && (
          <section className="py-20 px-6 border-t border-border" style={{ background: "var(--surface)" }}>
            <div className="max-w-6xl mx-auto">
              <h3 className="font-display text-2xl lg:text-3xl font-bold mb-10 text-center">More from the blog</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group flex flex-col rounded-3xl bg-background ring-1 ring-border overflow-hidden hover:-translate-y-1 transition-transform"
                  >
                    <div
                      className="h-40 grid place-items-center relative"
                      style={{ background: `linear-gradient(135deg, ${r.accent}25, transparent)` }}
                    >
                      <span className="text-5xl">{r.coverEmoji}</span>
                      <span
                        className="absolute top-4 left-4 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full"
                        style={{ background: `${r.accent}25`, color: r.accent }}
                      >
                        {r.category}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="font-display text-lg font-bold mb-2 leading-snug group-hover:opacity-90">{r.title}</h4>
                      <p className="text-foreground/60 text-sm leading-relaxed flex-1">{r.excerpt}</p>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-foreground/40 pt-4 mt-4 border-t border-border">
                        <span>{formatDate(r.date)}</span>
                        <span>{r.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <SiteFooter />
      </div>
    </>
  );
}

export default function Page() {
  return <BlogPostPage />;
}