import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import {
  ADMIN_CLICKADU_LINK,
  buildLandingButtons,
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
import { getDirectLinks, activeDirectLinks } from "@/lib/directLinksApi";

function normalizeUrl(url: string) {
  const t = url.trim();
  if (!t) return t;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export default function LinkPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [link, setLink] = useState<LockedeLink | null | undefined>(undefined);
  const [article, setArticle] = useState<LandingArticle>(DEFAULT_LANDING_ARTICLE);
  const [directLinks, setDirectLinks] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLandingArticle().then((a) => !cancelled && setArticle(a));
    getDirectLinks().then((cfg) => !cancelled && setDirectLinks(activeDirectLinks(cfg)));
    getLockedeLink(slug)
      .then((d) => {
        if (cancelled) return;
        if (!d) return navigate("/404", { replace: true });
        setLink(d);
      })
      .catch(() => !cancelled && navigate("/404", { replace: true }));
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  useEffect(() => {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://js.wpadmngr.com/static/adManager.js";
    s.setAttribute("data-admpid", "448176");
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);

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

  const buttons = buildLandingButtons(
    slug,
    link.destinationUrls ?? [],
    directLinks,
    ADMIN_CLICKADU_LINK,
  );

  async function handleClick(url: string, isDestination: boolean) {
    if (busy) return;
    setBusy(true);
    try {
      if (isDestination) incrementLinkClicks(slug);
      else incrementAdminClickaduClicks(slug);
      window.open(normalizeUrl(url), "_blank", "noopener,noreferrer");
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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>
        <p className="mt-5 text-base leading-relaxed text-foreground/90">
          {article.firstParagraph}
        </p>

        {/* Prominent buttons box */}
        <div className="mt-8 rounded-2xl border-2 border-primary/40 bg-gradient-to-b from-primary/10 to-card p-5 shadow-lg sm:p-7">
          <p className="text-center text-base font-bold text-foreground sm:text-lg">
            Click links below to continue
          </p>
          <p className="text-center text-sm font-medium text-foreground/80">
            Max. 4 video links below
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2">
            {buttons.map((slot, i) => (
              <button
                key={i}
                onClick={() => handleClick(slot.url, slot.kind === "destination")}
                disabled={busy}
                className="group flex items-center justify-between rounded-lg border-2 border-primary bg-primary px-4 py-4 text-left text-base font-bold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-60 sm:py-5 sm:text-lg"
              >
                <span>Link {i + 1}</span>
                <ExternalLink className="h-5 w-5 opacity-90 group-hover:opacity-100" />
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Sponsored links help keep Lockede free.
          </p>
        </div>

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
