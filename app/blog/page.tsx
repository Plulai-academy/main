"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteStyleTag, SiteHeader, SiteFooter } from "@/components/site-chrome";
import { blogPosts, formatDate } from "@/lib/blog-posts";

const categories = ["All", "Coding", "AI & Future Tech", "Entrepreneurship", "Parenting", "Schools"] as const;

function PostCard({ post, featured = false }: { post: (typeof blogPosts)[number]; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col rounded-3xl bg-surface ring-1 ring-border overflow-hidden hover:-translate-y-1 transition-transform ${
        featured ? "lg:col-span-2 lg:flex-row" : ""
      }`}
      style={{ boxShadow: `0 10px 30px -15px ${post.accent}30` }}
    >
      <div
        className={`relative flex items-center justify-center flex-shrink-0 ${featured ? "lg:w-2/5 h-56 lg:h-auto" : "h-44"}`}
        style={{ background: `linear-gradient(135deg, ${post.accent}25, transparent)` }}
      >
        <span className={featured ? "text-7xl" : "text-5xl"}>{post.coverEmoji}</span>
        <span
          className="absolute top-4 left-4 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full"
          style={{ background: `${post.accent}25`, color: post.accent }}
        >
          {post.category}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className={`font-display font-bold mb-2 leading-snug group-hover:opacity-90 ${featured ? "text-2xl lg:text-3xl" : "text-lg"}`}>
          {post.title}
        </h3>
        <p className={`text-foreground/60 mb-5 leading-relaxed flex-1 ${featured ? "text-base" : "text-sm"}`}>
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-foreground/40 pt-4 border-t border-border">
          <span>{formatDate(post.date)}</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </Link>
  );
}

function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");

  const filtered = useMemo(() => {
    if (activeCategory === "All") return blogPosts;
    return blogPosts.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const [featuredPost, ...restPosts] = filtered;

  return (
    <>
      <SiteStyleTag />
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />

        {/* HERO */}
        <section className="pt-16 pb-12 px-6 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(28,176,246,0.18), transparent 70%)",
            }}
          />
          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-cyan)]/10 ring-1 ring-[var(--brand-cyan)]/30 text-[var(--brand-cyan)] text-xs font-bold uppercase tracking-widest mb-6">
              <span className="size-2 rounded-full bg-[var(--brand-cyan)] animate-glow" />
              From the Plulai team
            </div>
            <h1 className="font-display text-4xl lg:text-6xl font-bold leading-[1.05] mb-6">
              Ideas for raising <span style={{ color: "var(--brand-blue)" }}>builders, coders,</span> and future founders
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Practical guidance for parents and teachers navigating coding, AI, and entrepreneurship with kids in the GCC.
            </p>
          </div>
        </section>

        {/* CATEGORY FILTER */}
        <section className="px-6 mb-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeCategory === c ? "shelf-blue" : "bg-surface ring-1 ring-border text-foreground/60 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* POSTS GRID */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-foreground/50 py-24">No posts in this category yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {featuredPost && <PostCard post={featuredPost} featured />}
                {restPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA BAND */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(28,176,246,0.18), transparent 60%)" }} />
          <div className="max-w-3xl mx-auto text-center relative">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="font-display text-3xl lg:text-5xl font-bold mb-6 leading-tight">Ready to give them a head start?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://www.plulai.com/auth/signup" className="shelf-blue font-bold py-4 px-9 rounded-2xl text-lg text-center">Try a free lesson →</a>
              <a href="mailto:hello@plulai.com" className="shelf-dark font-bold py-4 px-9 rounded-2xl text-lg text-center">Book a live intro call</a>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}

export default function Page() {
  return <BlogIndex />;
}