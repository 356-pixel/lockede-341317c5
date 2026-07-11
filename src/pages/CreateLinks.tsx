import { useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import { Copy, Check, Loader2, RotateCcw, Sparkles, Link2 } from "lucide-react";
import {
  CLICKADU_LINKS,
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
  const [submitting, setSubmitting] = useState(false);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = destinationUrl.trim();
    if (!isValidUrl(url))
      return toast.error("Please enter a valid http(s) destination URL");
    if (buttonPosition < 1 || buttonPosition > 5)
      return toast.error("Choose a button position from 1 to 5");

    setSubmitting(true);
    try {
      const slug = await generateUniqueLinkSlug(5);
      await createLockedeLink({
        slug,
        destinationUrl: url,
        buttonPosition,
        clickaduLinks: CLICKADU_LINKS,
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
    setCopied(false);
  }

  return (
    <Layout>
      <SEO
        title="Create Links · Lockede"
        description="Generate a clean lockede.com short URL. Paste a destination, pick a button slot, and share."
      />
      <section className="container max-w-2xl py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Lockede Tools
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Create a short link
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Paste your destination, choose which of the five buttons on the
          bridge page will lead to it, and generate a five-character
          lockede.com URL.
        </p>

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
              <p className="mt-2 text-xs text-muted-foreground">
                This is the real page visitors will reach after clicking the
                correct button on the bridge page.
              </p>
            </div>

            {/* Button position */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Destination button position
              </label>
              <p className="mb-3 text-xs text-muted-foreground">
                Pick which of the five buttons on the bridge page will hold
                your destination. The remaining four positions are
                automatically filled with Clickadu direct links.
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
            <div className="mt-4 rounded-md border border-border/70 bg-secondary/50 px-4 py-3 text-xs text-muted-foreground">
              Destination button position:{" "}
              <span className="font-semibold text-foreground">
                {buttonPosition}
              </span>{" "}
              — the other four buttons are filled with Clickadu direct links.
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
