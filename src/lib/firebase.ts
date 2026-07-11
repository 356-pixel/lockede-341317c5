import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "@secret:GOOGLE_API_KEY ",
  authDomain: "lockedeurl.firebaseapp.com",
  projectId: "lockedeurl",
  storageBucket: "lockedeurl.firebasestorage.app",
  messagingSenderId: "698178658185",
  appId: "1:698178658185:web:9111b75424ea6685d94b58",
  measurementId: "G-CM12GD66V1"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
