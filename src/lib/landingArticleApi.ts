import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const REF = doc(db, "config", "landingArticle");

export type LandingArticle = {
  title: string;
  firstParagraph: string;
  instruction: string;
  bodyHtml: string; // rest of article (below buttons); newlines become paragraphs
  updatedAt?: string;
};

export const DEFAULT_LANDING_ARTICLE: LandingArticle = {
  title: "Your link is ready to open",
  firstParagraph:
    "You're one tap away from your destination. Our team briefly reviews every shared link so readers stay safe from suspicious pages, phishing attempts, and low-quality redirects.",
  instruction:
    "Click any button below to continue — one of the six will open your destination link.",
  bodyHtml:
    "Lockede was built for creators, marketers, and everyday users who need a clean short link that actually opens inside strict in-app browsers like Facebook and TikTok. Instead of hiding behind opaque redirects, we surface a lightweight landing page so both people and platform crawlers can see exactly what they are about to visit.\n\nWe do not collect personal data on this page, we do not ask you to install anything, and we never inject full-screen popups. The short review moment you see here is what keeps Lockede free — sponsored slots on this page fund the domain, the servers, and the moderation work behind every shortened URL.\n\nThank you for using Lockede. If you run into a link that feels off, use the contact page and our team will investigate within one business day.",
};

export async function getLandingArticle(): Promise<LandingArticle> {
  const snap = await getDoc(REF);
  if (!snap.exists()) return DEFAULT_LANDING_ARTICLE;
  return { ...DEFAULT_LANDING_ARTICLE, ...(snap.data() as LandingArticle) };
}

export async function saveLandingArticle(a: LandingArticle): Promise<void> {
  await setDoc(
    REF,
    { ...a, updatedAt: new Date().toISOString(), _ts: serverTimestamp() },
    { merge: true },
  );
}
