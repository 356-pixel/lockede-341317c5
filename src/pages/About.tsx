import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

export default function About() {
  return (
    <Layout>
      <SEO
        title="About · Lockede"
        description="Lockede is a minimalist blog and short-link tool for tech, marketing, and utility topics."
      />
      <section className="container max-w-3xl py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          About
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          About Lockede
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Lockede is a small publication and a small tool, in that order. The
          journal covers tech, social media marketing, URL shortening, and the
          everyday utility software that quietly runs the internet.
        </p>

        <div className="mt-10 space-y-6 text-[15px] leading-7">
          <p>
            We started Lockede because the internet is loud enough already.
            Most sites shout, most tools bloat, and most short links feel like
            traps. We wanted a calmer alternative: a place to read a short,
            honest post over coffee, and a shortener that respects both the
            person creating the link and the person clicking it.
          </p>
          <p>
            Every article is written to be useful in about five minutes. No
            filler, no clickbait, no cookie walls, no autoplaying video. The
            short-link tool follows the same principle. Paste a destination,
            pick a slot, get a clean lockede.com URL. That is the whole product.
          </p>
          <p>
            Behind the scenes we care about performance, privacy, and
            longevity. Pages are lightweight. Analytics are minimal. Links you
            create today should still work years from now. If any of that
            stops being true, we consider it a bug.
          </p>
          <p>
            Lockede is an independent project. If you find something useful
            here, share it. If you find something wrong, tell us. Both are how
            small publications get better.
          </p>
        </div>
      </section>
    </Layout>
  );
}
