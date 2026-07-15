import { useEffect, useMemo, useState } from "react";
import SEO from "@/components/SEO";
import {
  ChevronDown,
  Filter,
  Loader2,
  Lock,
  LogOut,
  MousePointerClick,
  Link as LinkIcon,
  Download,
  BarChart3,
  ImagePlus,
  Hash,
  FileText,
  Plus,
  Trash2,
  Save,
  Copy,
  Check,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { ADMIN_PASSWORD, SHAREABLE_DOMAIN } from "@/lib/adminConfig";
import { listLockedeLinks, type LockedeLink } from "@/lib/linksApi";
import { utcDateString } from "@/lib/analytics";
import BannerAdManager from "@/components/BannerAdManager";
import {
  createTrackingIdWithId,
  deleteTrackingId,
  listTrackingIds,
  type TrackingId,
} from "@/lib/trackingIdsApi";
import {
  DEFAULT_LANDING_ARTICLE,
  getLandingArticle,
  saveLandingArticle,
  type LandingArticle,
} from "@/lib/landingArticleApi";
import {
  DIRECT_LINK_SLOTS,
  EMPTY_DIRECT_LINKS,
  getDirectLinks,
  saveDirectLinks,
  type DirectLinksConfig,
} from "@/lib/directLinksApi";

const SESSION_KEY = "lockede_admin_auth";
const MIN_CLICKS_OPTIONS = [100, 150, 200] as const;

type TabId = "analytics" | "tracking" | "direct" | "article" | "banner";

export default function Admin() {
  const [authed, setAuthed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [tab, setTab] = useState<TabId>("analytics");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Admin · Lockede" />
      <div className="container max-w-6xl py-8">
        {authed ? (
          <>
            <nav className="mb-6 flex flex-wrap items-center gap-1 border-b border-border">
              {[
                { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
                { id: "tracking" as const, label: "Tracking IDs", icon: Hash },
                { id: "direct" as const, label: "Direct Links", icon: Link2 },
                { id: "article" as const, label: "Landing Article", icon: FileText },
                { id: "banner" as const, label: "Banner Ads", icon: ImagePlus },
              ].map(({ id, label, icon: Icon }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  try {
                    sessionStorage.removeItem(SESSION_KEY);
                  } catch {
                    /* ignore */
                  }
                  setAuthed(false);
                }}
                className="ml-auto mb-2 inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </nav>
            {tab === "analytics" && <AnalyticsDashboard />}
            {tab === "tracking" && <TrackingIdsPanel />}
            {tab === "direct" && <DirectLinksPanel />}
            {tab === "article" && <ArticleEditorPanel />}
            {tab === "banner" && <BannerAdManager />}
          </>
        ) : (
          <LoginGate
            onSuccess={() => {
              try {
                sessionStorage.setItem(SESSION_KEY, "1");
              } catch {
                /* ignore */
              }
              setAuthed(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  return (
    <div className="mx-auto mt-12 max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
          <Lock className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-semibold">Lockede Admin</h1>
          <p className="text-xs text-muted-foreground">Enter password to continue.</p>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pw === ADMIN_PASSWORD) {
            onSuccess();
            toast.success("Welcome back");
          } else toast.error("Wrong password");
        }}
        className="space-y-3"
      >
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}

/* ---------- Tracking IDs ---------- */
function TrackingIdsPanel() {
  const [rows, setRows] = useState<TrackingId[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newId, setNewId] = useState("");
  const [note, setNote] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setRows(await listTrackingIds());
    } catch (e) {
      console.error(e);
      toast.error("Could not load Tracking IDs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate() {
    const id = newId.trim().toUpperCase();
    if (!/^[A-Z0-9]{3}$/.test(id)) {
      toast.error("ID must be exactly 3 characters (A–Z or 0–9).");
      return;
    }
    setCreating(true);
    try {
      const t = await createTrackingIdWithId(id, note.trim() || undefined);
      setNewId("");
      setNote("");
      toast.success(`Issued Tracking ID ${t.id}`);
      refresh();
    } catch (e: unknown) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not issue Tracking ID");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete Tracking ID ${id}?`)) return;
    try {
      await deleteTrackingId(id);
      toast.success(`Deleted ${id}`);
      refresh();
    } catch {
      toast.error("Could not delete");
    }
  }

  async function copy(id: string) {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Tracking IDs</h1>
        <p className="text-xs text-muted-foreground">
          Choose a 3-character Tracking ID (letters A–Z or digits 0–9) and a description. Users enter these when creating short links.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="w-full text-xs font-medium text-muted-foreground sm:w-40">
            Tracking ID (3 chars)
            <input
              type="text"
              value={newId}
              onChange={(e) =>
                setNewId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3))
              }
              placeholder="AB1"
              maxLength={3}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono uppercase tracking-widest text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="flex-1 text-xs font-medium text-muted-foreground">
            Description
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Campaign name / owner"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex h-[38px] items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Issue ID
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[1fr_2fr_1fr_auto] gap-2 border-b border-border bg-secondary/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>ID</span>
          <span>Note</span>
          <span>Created</span>
          <span />
        </div>
        {loading ? (
          <div className="grid place-items-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No Tracking IDs yet. Issue one above.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li
                key={r.id}
                className="grid grid-cols-[1fr_2fr_1fr_auto] items-center gap-2 px-4 py-3 text-sm"
              >
                <span className="font-mono font-semibold">{r.id}</span>
                <span className="truncate text-muted-foreground">{r.note || "—"}</span>
                <span className="text-xs text-muted-foreground">{r.createdAt.slice(0, 10)}</span>
                <span className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => copy(r.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-secondary"
                  >
                    {copiedId === r.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ---------- Landing Article ---------- */
function ArticleEditorPanel() {
  const [art, setArt] = useState<LandingArticle>(DEFAULT_LANDING_ARTICLE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLandingArticle()
      .then(setArt)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await saveLandingArticle(art);
      toast.success("Landing article saved");
    } catch (e) {
      console.error(e);
      toast.error("Could not save article");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold">Landing Article</h1>
        <p className="text-xs text-muted-foreground">
          Shown on every short-link landing page. Destination and Clickadu links stay per-slug; this article is shared.
        </p>
      </header>

      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <label className="block text-xs font-medium text-muted-foreground">
          Title
          <input
            type="text"
            value={art.title}
            onChange={(e) => setArt({ ...art, title: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block text-xs font-medium text-muted-foreground">
          First paragraph (shown above the buttons)
          <textarea
            rows={4}
            value={art.firstParagraph}
            onChange={(e) => setArt({ ...art, firstParagraph: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block text-xs font-medium text-muted-foreground">
          Rest of the article (blank line = new paragraph)
          <textarea
            rows={10}
            value={art.bodyHtml}
            onChange={(e) => setArt({ ...art, bodyHtml: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring font-mono"
          />
        </label>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>
    </section>
  );
}

/* ---------- Direct Links ---------- */
function DirectLinksPanel() {
  const [cfg, setCfg] = useState<DirectLinksConfig>(EMPTY_DIRECT_LINKS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDirectLinks()
      .then(setCfg)
      .finally(() => setLoading(false));
  }, []);

  function updateSlot(i: number, value: string) {
    setCfg((prev) => ({
      links: prev.links.map((v, idx) => (idx === i ? value : v)),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveDirectLinks(cfg);
      toast.success("Direct links saved");
    } catch (e) {
      console.error(e);
      toast.error("Could not save direct links");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold">Direct Links</h1>
        <p className="text-xs text-muted-foreground">
          Up to {DIRECT_LINK_SLOTS} unique ad/direct links. These fill the
          buttons on every landing page after the user's destination URLs
          (placed randomly, never repeated).
        </p>
      </header>

      <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        {cfg.links.map((val, i) => (
          <label key={i} className="block text-xs font-medium text-muted-foreground">
            Direct link {i + 1}
            <input
              type="url"
              value={val}
              onChange={(e) => updateSlot(i, e.target.value)}
              placeholder="https://example.com/offer"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>
    </section>
  );
}

/* ---------- Analytics ---------- */
function defaultFromDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 29);
  return utcDateString(d);
}

function dateOnly(iso: string): string {
  return iso ? iso.slice(0, 10) : "";
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return "—";
  }
}

type LinkRow = {
  slug: string;
  shortUrl: string;
  clicks: number;
  trackingId: string;
  createdAt: string;
};
type DateRow = {
  date: string;
  urlsCreated: number;
  totalClicks: number;
  links: LinkRow[];
};

function AnalyticsDashboard() {
  const [fromDate, setFromDate] = useState<string>(defaultFromDate());
  const [toDate, setToDate] = useState<string>(utcDateString());
  const [trackingFilter, setTrackingFilter] = useState<string>("");
  const [minClicks, setMinClicks] = useState<number>(0);
  const [data, setData] = useState<LockedeLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [issuedTrackingIds, setIssuedTrackingIds] = useState<TrackingId[]>([]);

  useEffect(() => {
    listTrackingIds()
      .then(setIssuedTrackingIds)
      .catch(() => setIssuedTrackingIds([]));
  }, []);

  async function handleFetch() {
    setLoading(true);
    setOpenRow(null);
    try {
      setData(await listLockedeLinks());
      setFetched(true);
    } catch (e) {
      console.error(e);
      toast.error("Could not load analytics");
    } finally {
      setLoading(false);
    }
  }

  const trackingOptions = useMemo(() => {
    const fromIssued = issuedTrackingIds.map((t) => t.id);
    const fromData = data.map((p) => p.trackingId).filter((x): x is string => !!x);
    return [...new Set([...fromIssued, ...fromData])].sort();
  }, [data, issuedTrackingIds]);

  const dateRows: DateRow[] = useMemo(() => {
    const byDate = new Map<string, DateRow>();
    for (const p of data) {
      if (trackingFilter && p.trackingId !== trackingFilter) continue;
      const clicks = Number(p.clicks || 0);
      if (clicks < minClicks) continue;
      const date = dateOnly(p.createdAt);
      if (!date) continue;
      if (date < fromDate || date > toDate) continue;
      if (!byDate.has(date))
        byDate.set(date, { date, urlsCreated: 0, totalClicks: 0, links: [] });
      const row = byDate.get(date)!;
      row.urlsCreated += 1;
      row.totalClicks += clicks;
      row.links.push({
        slug: p.slug,
        shortUrl: `${SHAREABLE_DOMAIN}/${p.slug}`,
        clicks,
        trackingId: p.trackingId || "—",
        createdAt: p.createdAt,
      });
    }
    return [...byDate.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data, fromDate, toDate, trackingFilter, minClicks]);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-xl font-semibold">Analytics</h1>
      </header>

      <section className="mb-5 rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Filters
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-end">
          <label className="text-xs font-medium text-muted-foreground">
            From date
            <input
              type="date"
              value={fromDate}
              max={toDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            To date
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={utcDateString()}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Tracking ID
            <select
              value={trackingFilter}
              onChange={(e) => setTrackingFilter(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Tracking IDs</option>
              {trackingOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Min. Clicks
            <select
              value={minClicks}
              onChange={(e) => setMinClicks(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={0}>All (0+)</option>
              {MIN_CLICKS_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={handleFetch}
            disabled={loading}
            className="inline-flex h-[38px] items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Fetch Data
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr] gap-2 border-b border-border bg-secondary/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span />
          <span>Date</span>
          <span className="text-right">URLs created</span>
          <span className="text-right">Total clicks</span>
        </div>
        {loading ? (
          <div className="grid place-items-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : !fetched ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            Set your filters and click <span className="font-semibold text-foreground">Fetch Data</span> to load analytics.
          </div>
        ) : dateRows.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No links found in this range.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {dateRows.map((row) => {
              const open = openRow === row.date;
              const sortedLinks = [...row.links].sort((a, b) =>
                a.createdAt < b.createdAt ? 1 : -1,
              );
              return (
                <li key={row.date}>
                  <button
                    type="button"
                    onClick={() => setOpenRow(open ? null : row.date)}
                    className="grid w-full grid-cols-[1.5rem_1fr_1fr_1fr] items-center gap-2 px-3 py-3 text-left text-sm hover:bg-secondary/40"
                  >
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                    />
                    <span className="font-medium">{row.date}</span>
                    <span className="text-right tabular-nums">{row.urlsCreated.toLocaleString()}</span>
                    <span className="text-right tabular-nums font-semibold">{row.totalClicks.toLocaleString()}</span>
                  </button>
                  {open && (
                    <div className="border-t border-border bg-background/40 px-4 py-3">
                      <ul className="divide-y divide-border/60">
                        {sortedLinks.map((l) => {
                          const url = l.shortUrl;
                          return (
                            <li
                              key={l.slug}
                              className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm"
                            >
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-w-0 items-center gap-1.5 truncate text-primary hover:underline"
                              >
                                <LinkIcon className="h-3 w-3 shrink-0" />
                                <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
                                <span className="ml-1 shrink-0 rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                  {l.trackingId}
                                </span>
                              </a>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  {formatTime(l.createdAt)}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                  <MousePointerClick className="h-3 w-3" />
                                  {l.clicks.toLocaleString()}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
