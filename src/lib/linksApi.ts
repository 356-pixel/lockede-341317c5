import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { ADMIN_CLICKADU_LINK } from "./adminConfig";

const COL = "links";
const ALPHA =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const LOCKEDE_DOMAIN = "https://lockede.com";
export const MIN_DESTINATIONS = 2;
export const MAX_DESTINATIONS = 4;

/** Number of buttons shown on the landing page, given destination count. */
export const TOTAL_LANDING_BUTTONS = 6;
export function totalButtonsForDestinations(_destCount: number): number {
  return TOTAL_LANDING_BUTTONS;
}

export { ADMIN_CLICKADU_LINK };

export type LockedeLink = {
  slug: string;
  destinationUrls: string[]; // 2..4 URLs, mapped to buttons 1..N
  trackingId: string; // admin-issued 3-letter uppercase tracking ID
  createdAt: string;
  clicks?: number; // total destination clicks (any destination button)
  adminClickaduClicks?: number; // total clicks on non-destination buttons
};

export function generateSlug(len = 5): string {
  let s = "";
  for (let i = 0; i < len; i++)
    s += ALPHA[Math.floor(Math.random() * ALPHA.length)];
  return s;
}

export async function generateUniqueLinkSlug(
  len = 5,
  maxAttempts = 10,
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const slug = generateSlug(len);
    const existing = await getDoc(doc(db, COL, slug));
    if (!existing.exists()) return slug;
  }
  throw new Error("Could not generate a unique slug. Please try again.");
}

export async function createLockedeLink(
  data: Omit<LockedeLink, "clicks" | "adminClickaduClicks">,
): Promise<void> {
  await setDoc(doc(db, COL, data.slug), {
    ...data,
    clicks: 0,
    adminClickaduClicks: 0,
    _ts: serverTimestamp(),
  });
}

export async function getLockedeLink(
  slug: string,
): Promise<LockedeLink | null> {
  const snap = await getDoc(doc(db, COL, slug));
  if (!snap.exists()) return null;
  const raw = snap.data() as any;
  // Backwards compat with older single-destination docs
  if (!raw.destinationUrls && raw.destinationUrl) {
    raw.destinationUrls = [raw.destinationUrl];
  }
  return raw as LockedeLink;
}

export async function incrementLinkClicks(slug: string): Promise<void> {
  try {
    await setDoc(
      doc(db, COL, slug),
      { clicks: increment(1) },
      { merge: true },
    );
  } catch (e) {
    console.warn("link clicks:", e);
  }
}

export async function incrementAdminClickaduClicks(slug: string): Promise<void> {
  try {
    await setDoc(
      doc(db, COL, slug),
      { adminClickaduClicks: increment(1) },
      { merge: true },
    );
  } catch (e) {
    console.warn("admin clickadu clicks:", e);
  }
}

export async function listLockedeLinks(): Promise<LockedeLink[]> {
  try {
    const q = query(collection(db, COL), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const raw = d.data() as any;
      if (!raw.destinationUrls && raw.destinationUrl) {
        raw.destinationUrls = [raw.destinationUrl];
      }
      return raw as LockedeLink;
    });
  } catch {
    const snap = await getDocs(collection(db, COL));
    return snap.docs.map((d) => d.data() as LockedeLink);
  }
}

/** Deterministic PRNG seeded from a string (mulberry32 + xmur3). */
function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = (h ^= h >>> 16) >>> 0;
  const rand = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type ButtonSlot =
  | { kind: "destination"; url: string; index: number }
  | { kind: "direct"; url: string }
  | { kind: "admin"; url: string };

/**
 * Build the button layout for a landing page. Destinations + unique direct
 * links are placed at random positions (deterministic per slug). Remaining
 * slots (if not enough direct links) fall back to the admin Clickadu link.
 */
export function buildLandingButtons(
  slug: string,
  destinationUrls: string[],
  directLinks: string[],
  adminClickaduLink: string,
): ButtonSlot[] {
  const dests = destinationUrls.filter(Boolean);
  const total = totalButtonsForDestinations(dests.length);
  const need = Math.max(0, total - dests.length);

  // Take direct links per slot (duplicates allowed), up to what's needed
  const uniqueDirects: string[] = [];
  for (const d of directLinks) {
    const v = (d || "").trim();
    if (!v) continue;
    uniqueDirects.push(v);
    if (uniqueDirects.length >= need) break;
  }

  const slots: ButtonSlot[] = [
    ...dests.map((url, index) => ({ kind: "destination" as const, url, index })),
    ...uniqueDirects.map((url) => ({ kind: "direct" as const, url })),
  ];
  while (slots.length < total) {
    slots.push({ kind: "admin", url: adminClickaduLink });
  }
  return seededShuffle(slots, slug);
}
