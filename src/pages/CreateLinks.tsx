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
  Plus,
  X,
} from "lucide-react";
import {
  LOCKEDE_DOMAIN,
  MIN_DESTINATIONS,
  MAX_DESTINATIONS,
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
  const [destinations, setDestinations] = useState<string[]>(["", ""]);
  const [trackingId, setTrackingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  function updateDestination(i: number, value: string) {
    setDestinations((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function addDestination() {
    setDestinations((prev) =>
      prev.length < MAX_DESTINATIONS ? [...prev, ""] : prev,
    );
  }

  function removeDestination(i: number) {
    setDestinations((prev) =>
      prev.length > MIN_DESTINATIONS ? prev.filter((_, idx) => idx !== i) : prev,
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const urls = destinations.map((u) => u.trim()).filter(Boolean);
    if (urls.length < MIN_DESTINATIONS)
      return toast.error(`Please enter at least ${MIN_DESTINATIONS} destination links`);
    if (urls.length > MAX_DESTINATIONS)
      return toast.error(`You can enter up to ${MAX_DESTINATIONS} destination links`);
    for (const u of urls) {
      if (!isValidUrl(u)) return toast.error(`Invalid URL: ${u}`);
    }
    const tid = trackingId.trim().toUpperCase();
    if (!/^[A-Z0-9]{3}$/.test(tid))
      return toast.error("Tracking ID must be exactly 3 characters (A–Z or 0–9)");

    setSubmitting(true);
    try {
      const slug = await generateUniqueLinkSlug(5);
      await createLockedeLink({
        slug,
        destinationUrls: urls,
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
    setDestinations(["", ""]);
    setTrackingId("");
    setCopied(false);
  }

  const canAdd = destinations.length < MAX_DESTINATIONS;

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
            {/* Destinations */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Destination links
              </label>
              <p className="mb-3 text-xs text-muted-foreground">
                Enter between {MIN_DESTINATIONS} and {MAX_DESTINATIONS} destination
                URLs. Tap the + to add another.
              </p>
              <div className="space-y-3">
                {destinations.map((val, i) => {
                  const isLast = i === destinations.length - 1;
                  const showPlus = isLast && canAdd;
                  const showRemove =
                    destinations.length > MIN_DESTINATIONS && !showPlus;
                  return (
                    <div key={i} className="relative">
                      <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="url"
                        required={i < MIN_DESTINATIONS}
                        autoComplete="off"
                        placeholder={`Destination link ${i + 1}`}
                        value={val}
                        onChange={(e) => updateDestination(i, e.target.value)}
                        className="h-12 w-full rounded-md border border-input bg-background pl-9 pr-12 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                      {showPlus && (
                        <button
                          type="button"
                          onClick={addDestination}
                          aria-label="Add another destination"
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                      {destinations.length > MIN_DESTINATIONS && (
                        <button
                          type="button"
                          onClick={() => removeDestination(i)}
                          aria-label="Remove destination"
                          className={`absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground ${
                            showPlus ? "right-12" : "right-2"
                          }`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
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
                  maxLength={3}
                  autoComplete="off"
                  placeholder="AB1"
                  value={trackingId}
                  onChange={(e) =>
                    setTrackingId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                  }
                  className="h-12 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm font-mono uppercase tracking-widest outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
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
