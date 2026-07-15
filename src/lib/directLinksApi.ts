import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const DOC_PATH = ["config", "directLinks"] as const;

export const DIRECT_LINK_SLOTS = 5;

export type DirectLinksConfig = {
  links: string[]; // up to 5, may contain empty strings for empty slots
};

export const EMPTY_DIRECT_LINKS: DirectLinksConfig = {
  links: Array(DIRECT_LINK_SLOTS).fill(""),
};

export async function getDirectLinks(): Promise<DirectLinksConfig> {
  try {
    const snap = await getDoc(doc(db, DOC_PATH[0], DOC_PATH[1]));
    if (!snap.exists()) return EMPTY_DIRECT_LINKS;
    const raw = snap.data() as { links?: unknown };
    const arr = Array.isArray(raw.links) ? raw.links.map((x) => String(x || "")) : [];
    const links = Array.from({ length: DIRECT_LINK_SLOTS }, (_, i) => arr[i] || "");
    return { links };
  } catch {
    return EMPTY_DIRECT_LINKS;
  }
}

export async function saveDirectLinks(cfg: DirectLinksConfig): Promise<void> {
  const links = Array.from({ length: DIRECT_LINK_SLOTS }, (_, i) =>
    (cfg.links[i] || "").trim(),
  );
  await setDoc(
    doc(db, DOC_PATH[0], DOC_PATH[1]),
    { links, _ts: serverTimestamp() },
    { merge: true },
  );
}

/** Return only unique, non-empty direct links, preserving order. */
export function activeDirectLinks(cfg: DirectLinksConfig): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const l of cfg.links) {
    const v = (l || "").trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}
