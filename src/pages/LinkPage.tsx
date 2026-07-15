import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import {
  ADMIN_CLICKADU_LINK,
  TOTAL_BUTTONS,
  getLockedeLink,
  incrementAdminClickaduClicks,
  incrementLinkClicks,
  type LockedeLink,
} from "@/lib/linksApi";
import {
  getLandingArticle,
  DEFAULT_LANDING_ARTICLE,
  type LandingArticle,
} from "@/lib/landingArticleApi";

function normalizeUrl(url: string) {
  const t = url.trim();
  if (!t) return t;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export default function LinkPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [link, setLink] = useState<LockedeLink | null | undefined>(undefined);
  const [article, setArticle] = useState<LandingArticle>(
    DEFAULT_LANDING_ARTICLE,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLandingArticle().then((a) => !cancelled && setArticle(a));
    getLockedeLink(slug)
      .then((d) => {
        if (cancelled) return;
        if (!d) {
          navigate("/404", { replace: true });
          return;
        }
        setLink(d);
      })
      .catch(() => !cancelled && navigate("/404", { replace: true }));
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  if (link === undefined) {
    return (
      <Layout>
        <div className="grid min-h-[60vh] place-items-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }
  if (!link) return null;

  async function handleClick(position: number) {
    if (busy) return;
    const dests = link!.destinationUrls ?? [];
    const isDestination = position >= 1 && position <= dests.length;
    setBusy(true);
    try {
      if (isDestination) {
        incrementLinkClicks(slug);
        window.open(
          normalizeUrl(dests[position - 1]),
          "_blank",
          "noopener,noreferrer",
        );
      } else {
        incrementAdminClickaduClicks(slug);
        window.open(ADMIN_CLICKADU_LINK, "_blank", "noopener,noreferrer");
      }
    } finally {
      setBusy(false);
    }
  }

  const bodyParagraphs = (article.bodyHtml || "")
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Layout>
      <SEO title={`${article.title} · Lockede`} description={article.firstParagraph} />
      <article className="container max-w-2xl pt-4 pb-16 sm:pt-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-foreground/90">
          {article.firstParagraph}
        </p>

        {/* Buttons box */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-7">
          <p className="text-center text-sm font-semibold text-foreground">
            {article.instruction}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[1, 2, 3, 4, 5].map((position) => (

              <button
                key={position}
                onClick={() => handleClick(position)}
                disabled={busy}
                className="group flex items-center justify-between rounded-md border border-border bg-background px-4 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-secondary disabled:opacity-60"
              >
                <span>Link {position}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Sponsored links help keep Lockede free.
          </p>
        </div>

        {/* Rest of the article */}
        {bodyParagraphs.length > 0 && (
          <div className="mt-10 space-y-5 text-base leading-relaxed text-foreground/90">
            {bodyParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
      </article>
    </Layout>
  );
}
