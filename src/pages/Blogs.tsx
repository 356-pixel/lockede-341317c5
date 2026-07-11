import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { BLOGS } from "@/lib/blogs";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 6;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Blogs() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(BLOGS.map((b) => b.category)))],
    [],
  );

  const filtered = useMemo(
    () =>
      category === "All" ? BLOGS : BLOGS.filter((b) => b.category === category),
    [category],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goto(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Layout>
      <SEO
        title="Blogs · Lockede"
        description="Short, useful reads on tech, marketing, URL shortening, and utility tools."
      />
      <section className="container py-12 sm:py-16">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            The Journal
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            All blogs
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Filter by topic or scroll the archive. New posts published weekly.
          </p>
        </header>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((b) => (
            <Link
              key={b.id}
              to={`/blogs/${b.id}`}
              className="group flex flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-md bg-secondary">
                <img
                  src={b.image}
                  alt={b.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex flex-1 flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {b.category}
                </span>
                <h2 className="mt-2 text-lg font-bold leading-snug group-hover:underline">
                  {b.title}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                  {b.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatDate(b.publishedAt)} · {b.readMinutes} min read
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-14 flex items-center justify-center gap-1"
            aria-label="Pagination"
          >
            <button
              onClick={() => goto(page - 1)}
              disabled={page === 1}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => goto(n)}
                aria-current={n === page ? "page" : undefined}
                className={`h-9 w-9 rounded-md border text-sm font-semibold transition-colors ${
                  n === page
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => goto(page + 1)}
              disabled={page === totalPages}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </section>
    </Layout>
  );
}
