import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { BLOGS } from "@/lib/blogs";
import { ArrowRight, ArrowUpRight } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Home() {
  const featured = BLOGS.find((b) => b.featured) ?? BLOGS[0];
  const secondary = BLOGS.filter((b) => b.id !== featured.id).slice(0, 4);
  const recommended = BLOGS.filter(
    (b) => b.id !== featured.id && !secondary.some((s) => s.id === b.id),
  ).slice(0, 3);

  return (
    <Layout>
      <SEO
        title="Lockede — Tech, Marketing & Utility Tools Blog"
        description="Minimalist reads on tech trends, social media marketing, URL shortening, and everyday utility tools."
      />

      {/* Masthead */}
      <section className="border-b border-border/60">
        <div className="container py-10 sm:py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                The Lockede Journal
              </p>
              <h1 className="mt-3 max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Notes on the internet, quietly written.
              </h1>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground sm:text-right">
              Tech, marketing, URL shortening, and utility tools — short reads
              with a point of view.
            </p>
          </div>
        </div>
      </section>

      {/* Featured + side stack */}
      <section className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          {/* Featured post */}
          <article className="group">
            <Link to={`/blogs/${featured.id}`} className="block">
              <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-secondary">
                <img
                  src={featured.image}
                  alt={featured.title}
                  loading="eager"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-primary px-2.5 py-1 font-semibold uppercase tracking-wider text-primary-foreground">
                    Featured
                  </span>
                  <span className="font-medium uppercase tracking-wider text-muted-foreground">
                    {featured.category}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <time className="text-muted-foreground">
                    {formatDate(featured.publishedAt)}
                  </time>
                </div>
                <h2 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {featured.excerpt}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground group-hover:underline">
                  Read the story <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </article>

          {/* Side stack */}
          <aside className="flex flex-col divide-y divide-border/60">
            <div className="pb-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Latest
              </h3>
            </div>
            {secondary.map((p) => (
              <Link
                key={p.id}
                to={`/blogs/${p.id}`}
                className="group flex gap-4 py-5 first:pt-4"
              >
                <div className="aspect-square h-20 w-20 flex-none overflow-hidden rounded-md bg-secondary">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {p.category}
                  </span>
                  <h4 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug group-hover:underline">
                    {p.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(p.publishedAt)} · {p.readMinutes} min read
                  </p>
                </div>
              </Link>
            ))}
          </aside>
        </div>
      </section>

      {/* Create Links promo */}
      <section className="container">
        <div className="relative overflow-hidden rounded-lg border border-border bg-primary p-8 text-primary-foreground sm:p-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
              Lockede Tools
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold leading-tight sm:text-4xl">
              A cleaner short link on lockede.com — in one click.
            </h2>
            <p className="mt-3 max-w-lg text-base opacity-85">
              Paste a destination, pick a slot, and generate a five-character
              short URL you can share anywhere.
            </p>
            <Link
              to="/create"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
            >
              Create a Link
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recommended */}
      <section className="container py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Recommended
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Hand-picked reads
            </h2>
          </div>
          <Link
            to="/blogs"
            className="hidden items-center gap-1 text-sm font-semibold text-foreground hover:underline sm:inline-flex"
          >
            All blogs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((p) => (
            <Link
              key={p.id}
              to={`/blogs/${p.id}`}
              className="group flex flex-col"
            >
              <div className="aspect-[16/10] w-full overflow-hidden rounded-md bg-secondary">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {p.category}
                </span>
                <h3 className="mt-2 text-lg font-bold leading-snug group-hover:underline">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {p.excerpt}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatDate(p.publishedAt)} · {p.readMinutes} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
