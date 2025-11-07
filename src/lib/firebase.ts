// ==== Tambahan: dotenv support untuk Node.js / ts-node ====
import 'dotenv/config'; // ini otomatis load .env ke process.env
// ==========================================================

import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import * as dotenv from "dotenv";
dotenv.config();



// Astro: use PUBLIC_ vars for client bundle; fallback to process.env only when available (SSR)
const publicEnv =
  (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const isServer =
  typeof process !== 'undefined' && typeof process.env !== 'undefined';

const firebaseConfig = {
  apiKey:
    publicEnv.PUBLIC_FIREBASE_API_KEY ||
    (isServer
      ? process.env.PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY
      : undefined),
  authDomain:
    publicEnv.PUBLIC_FIREBASE_AUTH_DOMAIN ||
    (isServer
      ? process.env.PUBLIC_FIREBASE_AUTH_DOMAIN ||
        process.env.FIREBASE_AUTH_DOMAIN
      : undefined),
  projectId:
    publicEnv.PUBLIC_FIREBASE_PROJECT_ID ||
    (isServer
      ? process.env.PUBLIC_FIREBASE_PROJECT_ID ||
        process.env.FIREBASE_PROJECT_ID
      : undefined),
  storageBucket:
    publicEnv.PUBLIC_FIREBASE_STORAGE_BUCKET ||
    (isServer
      ? process.env.PUBLIC_FIREBASE_STORAGE_BUCKET ||
        process.env.FIREBASE_STORAGE_BUCKET
      : undefined),
  messagingSenderId:
    publicEnv.PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    (isServer
      ? process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
        process.env.FIREBASE_MESSAGING_SENDER_ID
      : undefined),
  appId:
    publicEnv.PUBLIC_FIREBASE_APP_ID ||
    (isServer
      ? process.env.PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID
      : undefined),
} as const;

// Initialize Firebase (guard for HMR)
console.log("🔥 FIREBASE CONFIG:", firebaseConfig);

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig as any);

// Initialize Firestore with long-polling in browser to avoid WebChannel 400s behind proxies/VPNs
export const db =
  typeof window !== 'undefined'
    ? initializeFirestore(app, { experimentalForceLongPolling: true })
    : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
