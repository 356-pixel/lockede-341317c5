import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "trackingIds";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export type TrackingId = {
  id: string; // 3-letter uppercase
  createdAt: string;
  note?: string;
};

export function randomTrackingId(): string {
  let s = "";
  for (let i = 0; i < 3; i++) s += LETTERS[Math.floor(Math.random() * 26)];
  return s;
}

export async function generateUniqueTrackingId(
  maxAttempts = 25,
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const id = randomTrackingId();
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return id;
  }
  throw new Error("Could not generate a unique Tracking ID.");
}

export async function createTrackingId(note?: string): Promise<TrackingId> {
  const id = await generateUniqueTrackingId();
  const payload: TrackingId = {
    id,
    createdAt: new Date().toISOString(),
    ...(note ? { note } : {}),
  };
  await setDoc(doc(db, COL, id), { ...payload, _ts: serverTimestamp() });
  return payload;
}

export async function listTrackingIds(): Promise<TrackingId[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs
    .map((d) => d.data() as TrackingId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function deleteTrackingId(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function trackingIdExists(id: string): Promise<boolean> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists();
}
