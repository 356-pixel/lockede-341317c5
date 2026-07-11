import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "links";
const ALPHA =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const LOCKEDE_DOMAIN = "https://lockede.com";

/** Clickadu direct-link ad slots used to fill the non-destination buttons. */
export const CLICKADU_LINKS = [
  "https://clickadu.com/ad/1",
  "https://clickadu.com/ad/2",
  "https://clickadu.com/ad/3",
  "https://clickadu.com/ad/4",
];

export type LockedeLink = {
  slug: string;
  destinationUrl: string;
  buttonPosition: number; // 1..5
  clickaduLinks: string[]; // 4 entries used in the other slots
  createdAt: string;
  clicks?: number;
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
  data: Omit<LockedeLink, "clicks">,
): Promise<void> {
  await setDoc(doc(db, COL, data.slug), {
    ...data,
    clicks: 0,
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
