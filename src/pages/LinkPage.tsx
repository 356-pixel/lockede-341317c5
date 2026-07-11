import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  getLockedeLink,
  incrementLinkClicks,
  type LockedeLink,
} from "@/lib/linksApi";

function normalizeUrl(url: string) {
  const t = url.trim();
  if (!t) return t;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export default function LinkPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [link, setLink] = useState<LockedeLink | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
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
      <main className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </main>
    );
  }
  if (!link) return null;

  const buttons = Array.from({ length: 5 }, (_, i) => {
    const position = i + 1;
    const isDestination = position === link.buttonPosition;
    if (isDestination) {
      return { position, url: normalizeUrl(link.destinationUrl), isDestination };
    }
    // Fill remaining slots with Clickadu links, cycling if fewer than 4.
    const clickaduIdx =
      (position > link.buttonPosition ? position - 2 : position - 1) %
      link.clickaduLinks.length;
    return {
      position,
      url: link.clickaduLinks[clickaduIdx] ?? link.clickaduLinks[0],
      isDestination,
    };
  });

  function handleClick(url: string, isDestination: boolean) {
    if (isDestination) incrementLinkClicks(slug);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="container flex flex-1 flex-col items-center justify-center py-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Lockede
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Choose to continue
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap a button below to proceed. One leads to your destination.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {buttons.map((b) => (
              <button
                key={b.position}
                onClick={() => handleClick(b.url, b.isDestination)}
                className="group flex w-full items-center justify-between rounded-md border border-border bg-card px-5 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-secondary"
              >
                <span>Continue — Option {b.position}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Sponsored links help keep Lockede free.
          </p>
        </div>
      </div>
    </main>
  );
}
