import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Loader2,
  RotateCcw,
  Sparkles,
  Link2,
  Hash,
  MousePointerClick,
} from "lucide-react";
import {
  LOCKEDE_DOMAIN,
  createLockedeLink,
  generateUniqueLinkSlug,
} from "@/lib/linksApi";
import { listTrackingIds, type TrackingId } from "@/lib/trackingIdsApi";

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function CreateLinks() {
  const [destinationUrl, setDestinationUrl] = useState("");
  const [buttonPosition, setButtonPosition] = useState(1);
  const [clickaduLink, setClickaduLink] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [trackingIds, setTrackingIds] = useState<TrackingId[]>([]);
  const [loadingTids, setLoadingTids] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listTrackingIds()
      .then((rows) => {
        if (cancelled) return;
        setTrackingIds(rows);
        if (rows.length && !trackingId) setTrackingId(rows[0].id);
      })
      .catch(() => !cancelled && setTrackingIds([]))
      .finally(() => !cancelled && setLoadingTids(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = destinationUrl.trim();
    const clickadu = clickaduLink.trim();
    const tid = trackingId.trim();
    if (!isValidUrl(url))
      return toast.error("Please enter a valid http(s) destination URL");
    if (!isValidUrl(clickadu))
      return toast.error("Please enter a valid Clickadu Direct Link");
    if (!tid) return toast.error("Please select a Tracking ID");
    if (buttonPosition < 1 || buttonPosition > 5)
      return toast.error("Choose a button position from 1 to 5");


    setSubmitting(true);
    try {
      const slug = await generateUniqueLinkSlug(5);
      await createLockedeLink({
        slug,
        destinationUrl: url,
        buttonPosition,
        clickaduLink: clickadu,
        trackingId: tid,
        createdAt: new Date().toISOString(),
      });
      setGenerated(`${LOCKEDE_DOMAIN}/${slug}`);
      setCopied(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not create that link. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setGenerated("");
    setDestinationUrl("");
    setButtonPosition(1);
    setClickaduLink("");
    setCopied(false);
  }

  return (
    <Layout>
      <SEO
        title="Create Links · Lockede"
        description="Generate a clean lockede.com short URL."
      />
      <section className="container max-w-2xl pt-4 pb-12 sm:pt-6 sm:pb-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Create a short link
        </h1>

        {!generated ? (
          <form
            onSubmit={onSubmit}
            className="mt-6 space-y-8 rounded-lg border border-border bg-card p-6 sm:p-8"
          >
            {/* Destination */}
            <div>
              <label
                htmlFor="destination"
                className="mb-2 block text-sm font-medium"
              >
                Destination link
              </label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="destination"
                  type="url"
                  required
                  autoComplete="off"
                  placeholder="https://example.com/your-page"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Button position */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Select button position for destination link
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => {

                  const selected = n === buttonPosition;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setButtonPosition(n)}
                      className={`flex h-16 flex-col items-center justify-center rounded-md border text-sm font-semibold transition-all ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-foreground hover:border-foreground"
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider opacity-70">
                        Btn
                      </span>
                      <span className="text-lg">{n}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clickadu Direct Link */}
            <div>
              <label
                htmlFor="clickadu"
                className="mb-2 block text-sm font-medium"
              >
                Clickadu Direct Link
              </label>
              <div className="relative">
                <MousePointerClick className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="clickadu"
                  type="url"
                  required
                  autoComplete="off"
                  placeholder="https://your-clickadu-direct-link"
                  value={clickaduLink}
                  onChange={(e) => setClickaduLink(e.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Tracking ID (admin-issued) */}
            <div>
              <label
                htmlFor="tracking"
                className="mb-2 block text-sm font-medium"
              >
                Tracking ID
              </label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  id="tracking"
                  required
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  disabled={loadingTids || trackingIds.length === 0}
                  className="h-12 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-3 text-sm font-mono uppercase outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                >
                  {loadingTids ? (
                    <option value="">Loading…</option>
                  ) : trackingIds.length === 0 ? (
                    <option value="">No Tracking IDs issued yet</option>
                  ) : (
                    trackingIds.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}
                        {t.note ? ` — ${t.note}` : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || trackingIds.length === 0}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {submitting ? "Generating…" : "Generate short link"}
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-lg border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4" />
              Your Lockede short URL
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Copy the link and share it anywhere.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <code className="flex-1 truncate rounded-md border border-border bg-background px-4 py-3 text-center text-base font-medium sm:text-left">
                {generated}
              </code>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
            <button
              type="button"
              onClick={reset}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" />
              Create another link
            </button>
          </div>
        )}
      </section>
    </Layout>
  );
}
