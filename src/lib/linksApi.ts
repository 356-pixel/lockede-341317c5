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
export function totalButtonsForDestinations(destCount: number): number {
  return destCount <= 2 ? 6 : 8;
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
