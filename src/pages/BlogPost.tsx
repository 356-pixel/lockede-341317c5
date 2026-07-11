import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { BLOGS } from "@/lib/blogs";
import { useEffect, useRef } from "react";

// Renders text with URLs converted into anchor tags.
function renderWithLinks(text: string) {
  const pattern = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(pattern);
  return parts.map((part, i) => {
    if (!part) return null;
    if (/^https?:\/\//.test(part)) {
      const trailingMatch = part.match(/[.,!?;:]+$/);
      const trailing = trailingMatch ? trailingMatch[0] : "";
      const url = trailing ? part.slice(0, -trailing.length) : part;
      return (
        <span key={i}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
          >
            {url}
          </a>
          {trailing}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function BlogPost() {
  const { id = "" } = useParams();
  const post = BLOGS.find((b) => b.id === id);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  if (!post) {
    return (
      <Layout>
        <SEO title="Article not found · Lockede" />
        <div className="container py-24 text-center">
          <h1 className="text-3xl font-bold">Article not found</h1>
          <Link
            to="/blogs"
            className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Browse blogs
          </Link>
        </div>
      </Layout>
    );
  }

  const wordCount = post.body.split(/\s+/).filter(Boolean).length;
  const publishedLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Layout>
      <SEO title={`${post.title} · Lockede`} description={post.excerpt} />
      <article className="container max-w-3xl py-10 sm:py-14">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full bg-primary px-2.5 py-1 font-semibold uppercase tracking-wider text-primary-foreground">
              {post.category}
            </span>
            {publishedLabel && (
              <time className="text-muted-foreground">{publishedLabel}</time>
            )}
            <span className="text-muted-foreground">
              · {Math.max(1, post.readMinutes ?? Math.round(wordCount / 220))} min read
            </span>
          </div>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {post.excerpt}
          </p>
        </header>

        <img
          src={post.image}
          alt={post.title}
          loading="eager"
          className="aspect-[16/9] w-full rounded-lg object-cover"
        />

        <div
          ref={bodyRef}
          className="prose prose-neutral mt-10 max-w-none text-[17px] leading-8 text-foreground/90"
        >
          {post.body.split("\n\n").map((p, i) => (
            <p key={i} className="mb-6">
              {renderWithLinks(p)}
            </p>
          ))}
        </div>

        <div className="mt-14 border-t border-border pt-8">
          <Link
            to="/blogs"
            className="text-sm font-semibold text-foreground hover:underline"
          >
            ← Back to all blogs
          </Link>
        </div>
      </article>
    </Layout>
  );
}
