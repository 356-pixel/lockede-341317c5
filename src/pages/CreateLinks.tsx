import { useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import { Copy, Check, Loader2, RotateCcw, Sparkles, Link2, Hash, MousePointerClick } from "lucide-react";
import {
  LOCKEDE_DOMAIN,
  createLockedeLink,
  generateUniqueLinkSlug,
} from "@/lib/linksApi";

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
  const [submitting, setSubmitting] = useState(false);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = destinationUrl.trim();
    const clickadu = clickaduLink.trim();
    const tid = trackingId.trim();
    if (!isValidUrl(url))
      return toast.error("Please enter a valid http(s) destination URL");
    if (!isValidUrl(clickadu))
      return toast.error("Please enter a valid Clickadu Direct Link");
    if (!tid) return toast.error("Please enter a Tracking ID");
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
    setTrackingId("");
    setCopied(false);
  }

  return (
    <Layout>
      <SEO
        title="Create Links · Lockede"
        description="Generate a clean lockede.com short URL."
      />
      <section className="container max-w-2xl py-12 sm:py-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Create a short link
        </h1>

        {!generated ? (
          <form
            onSubmit={onSubmit}
            className="mt-10 space-y-8 rounded-lg border border-border bg-card p-6 sm:p-8"
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
                Destination button position
              </label>
              <p className="mb-3 text-xs text-muted-foreground">
                Pick which of the five buttons on the bridge page will hold
                your destination. The remaining four are Clickadu slots.
              </p>
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
                      <span className="text-xs uppercase tracking-wider opacity-70">
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
              <p className="mt-2 text-xs text-muted-foreground">
                Every 1st, 3rd, 5th… click on a Clickadu slot routes here.
                Every 2nd, 4th, 6th… routes to the admin Clickadu link.
              </p>
            </div>

            {/* Tracking ID */}
            <div>
              <label
                htmlFor="tracking"
                className="mb-2 block text-sm font-medium"
              >
                Tracking ID
              </label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="tracking"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. CAMPAIGN-01"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Counts are stored per slug, not shared across links using the
                same Tracking ID.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
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
          <div className="mt-10 rounded-lg border border-border bg-card p-6 sm:p-8">
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
