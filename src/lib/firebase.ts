import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if we have config
const isConfigured = !!firebaseConfig.apiKey;

// Initialize Firebase only if configured and not already initialized
const app = isConfigured 
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : {} as any; // Mock app to avoid crash during preview without config

export const db = isConfigured ? getFirestore(app) : {} as any;
export const storage = isConfigured ? getStorage(app) : {} as any;
export const auth = isConfigured ? getAuth(app) : {} as any;
export const messaging = isConfigured ? async () => (await isSupported()) ? getMessaging(app) : null : async () => null;
export { isConfigured };
