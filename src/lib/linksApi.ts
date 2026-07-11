import {
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { ADMIN_CLICKADU_LINK } from "./adminConfig";

const COL = "links";
const ALPHA =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const LOCKEDE_DOMAIN = "https://lockede.com";

export { ADMIN_CLICKADU_LINK };

export type LockedeLink = {
  slug: string;
  destinationUrl: string;
  buttonPosition: number; // 1..6
  clickaduLink: string; // user-supplied Clickadu direct link
  trackingId: string; // admin-issued 3-letter uppercase tracking ID
  createdAt: string;
  clicks?: number; // destination clicks
  clickaduClicks?: number; // clicks on any non-destination button (drives rotation)
  trackingClicks?: number; // clicks routed to user's Clickadu (i.e. tracking ID hits)
  adminClickaduClicks?: number; // clicks routed to admin Clickadu link
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
  data: Omit<
    LockedeLink,
    "clicks" | "clickaduClicks" | "trackingClicks" | "adminClickaduClicks"
  >,
): Promise<void> {
  await setDoc(doc(db, COL, data.slug), {
    ...data,
    clicks: 0,
    clickaduClicks: 0,
    trackingClicks: 0,
    adminClickaduClicks: 0,
    _ts: serverTimestamp(),
  });
}

export async function getLockedeLink(
  slug: string,
): Promise<LockedeLink | null> {
  const snap = await getDoc(doc(db, COL, slug));
  if (!snap.exists()) return null;
  return snap.data() as LockedeLink;
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

/**
 * Register a click on a non-destination (Clickadu) button. Uses a transaction
 * to atomically increment the per-slug counter and decide which URL this
 * particular click should route to:
 *   - odd click (1st, 3rd, 5th…) → user's Clickadu Direct Link (tracking hit)
 *   - even click (2nd, 4th, 6th…) → admin Clickadu link
 */
export async function registerClickaduClick(
  slug: string,
): Promise<{ url: string; isAdmin: boolean }> {
  const ref = doc(db, COL, slug);
  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("Link not found");
      const data = snap.data() as LockedeLink;
      const nextCount = (data.clickaduClicks ?? 0) + 1;
      const isAdmin = nextCount % 2 === 0;
      const url = isAdmin
        ? ADMIN_CLICKADU_LINK
        : data.clickaduLink || ADMIN_CLICKADU_LINK;
      tx.update(ref, {
        clickaduClicks: nextCount,
        trackingClicks: (data.trackingClicks ?? 0) + (isAdmin ? 0 : 1),
        adminClickaduClicks: (data.adminClickaduClicks ?? 0) + (isAdmin ? 1 : 0),
      });
      return { url, isAdmin };
    });
  } catch (e) {
    console.warn("clickadu click:", e);
    return { url: ADMIN_CLICKADU_LINK, isAdmin: true };
  }
}
