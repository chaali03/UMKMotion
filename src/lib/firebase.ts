// ======================================================
// ✅ UMKMotion Universal Firebase Config (Astro + Node)
// ======================================================

// import * as dotenv from "dotenv";
// dotenv.config();

// Firebase SDK imports
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Deteksi environment
const isBrowser = typeof window !== 'undefined';
const isServer = typeof process !== 'undefined' && typeof process.env !== 'undefined';
const hasImportMeta = typeof import.meta !== 'undefined';

// Kumpulkan semua sumber environment vars
const publicEnv = (hasImportMeta && (import.meta as any).env) || {};
const winEnv = (isBrowser && (window as any).ENV) || {};
const nodeEnv = (isServer && process.env) || {};

// Firebase Config Universal
const firebaseConfig = {
  apiKey:
    publicEnv.PUBLIC_FIREBASE_API_KEY ||
    winEnv.FIREBASE_API_KEY ||
    nodeEnv.PUBLIC_FIREBASE_API_KEY ||
    nodeEnv.FIREBASE_API_KEY,
  authDomain:
    publicEnv.PUBLIC_FIREBASE_AUTH_DOMAIN ||
    winEnv.FIREBASE_AUTH_DOMAIN ||
    nodeEnv.PUBLIC_FIREBASE_AUTH_DOMAIN ||
    nodeEnv.FIREBASE_AUTH_DOMAIN,
  projectId:
    publicEnv.PUBLIC_FIREBASE_PROJECT_ID ||
    winEnv.FIREBASE_PROJECT_ID ||
    nodeEnv.PUBLIC_FIREBASE_PROJECT_ID ||
    nodeEnv.FIREBASE_PROJECT_ID,
  storageBucket:
    publicEnv.PUBLIC_FIREBASE_STORAGE_BUCKET ||
    winEnv.FIREBASE_STORAGE_BUCKET ||
    nodeEnv.PUBLIC_FIREBASE_STORAGE_BUCKET ||
    nodeEnv.FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    publicEnv.PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    winEnv.FIREBASE_MESSAGING_SENDER_ID ||
    nodeEnv.PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    nodeEnv.FIREBASE_MESSAGING_SENDER_ID,
  appId:
    publicEnv.PUBLIC_FIREBASE_APP_ID ||
    winEnv.FIREBASE_APP_ID ||
    nodeEnv.PUBLIC_FIREBASE_APP_ID ||
    nodeEnv.FIREBASE_APP_ID,
} as const;

// Diagnostics (cuma di browser)
if (isBrowser && !firebaseConfig.apiKey) {
  console.error('[UMKMotion] Firebase apiKey missing. Pastikan PUBLIC_FIREBASE_* ada di .env.');
  console.warn('[UMKMotion] Sources check:', {
    hasImportMeta: !!publicEnv,
    hasWindowENV: !!(window as any).ENV,
    publicKeys: {
      apiKey: !!publicEnv.PUBLIC_FIREBASE_API_KEY,
      authDomain: !!publicEnv.PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!publicEnv.PUBLIC_FIREBASE_PROJECT_ID,
      appId: !!publicEnv.PUBLIC_FIREBASE_APP_ID,
    },
    windowENVKeys: {
      apiKey: !!winEnv.FIREBASE_API_KEY,
      authDomain: !!winEnv.FIREBASE_AUTH_DOMAIN,
      projectId: !!winEnv.FIREBASE_PROJECT_ID,
      appId: !!winEnv.FIREBASE_APP_ID,
    },
  });
}

// Initialize Firebase (guard for HMR)
const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig as any);

// Firestore, Auth, Storage
export const db = isBrowser
  ? initializeFirestore(app, { experimentalForceLongPolling: true })
  : getFirestore(app);

export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;



// // ==== Tambahan: dotenv support untuk Node.js / ts-node ====
// import 'dotenv/config'; 

// import { getApps, initializeApp } from 'firebase/app';
// import { getFirestore, initializeFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';
// import { getStorage } from 'firebase/storage';
// import * as dotenv from "dotenv";
// dotenv.config();



// // Astro: use PUBLIC_ vars for client bundle; fallback to process.env only when available (SSR)
// const publicEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
// const isServer = typeof process !== 'undefined' && typeof process.env !== 'undefined';
// const firebaseConfig = {
//   apiKey: publicEnv.PUBLIC_FIREBASE_API_KEY || (isServer ? (process.env.PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY) : undefined),
//   authDomain: publicEnv.PUBLIC_FIREBASE_AUTH_DOMAIN || (isServer ? (process.env.PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN) : undefined),
//   projectId: publicEnv.PUBLIC_FIREBASE_PROJECT_ID || (isServer ? (process.env.PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID) : undefined),
//   storageBucket: publicEnv.PUBLIC_FIREBASE_STORAGE_BUCKET || (isServer ? (process.env.PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET) : undefined),
//   messagingSenderId: publicEnv.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (isServer ? (process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID) : undefined),
//   appId: publicEnv.PUBLIC_FIREBASE_APP_ID || (isServer ? (process.env.PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID) : undefined),
// } as const;

// // Helpful diagnostics during hydration
// if (typeof window !== 'undefined') {
//   if (!firebaseConfig.apiKey) {
//     // eslint-disable-next-line no-console
//     console.error('[UMKMotion] Firebase apiKey is missing. Ensure PUBLIC_FIREBASE_* vars are set in .env.');
//     // eslint-disable-next-line no-console
//     console.warn('[UMKMotion] Sources check:', {
//       hasImportMeta: !!publicEnv,
//       hasWindowENV: !!(window as any).ENV,
//       publicKeys: {
//         apiKey: !!publicEnv.PUBLIC_FIREBASE_API_KEY,
//         authDomain: !!publicEnv.PUBLIC_FIREBASE_AUTH_DOMAIN,
//         projectId: !!publicEnv.PUBLIC_FIREBASE_PROJECT_ID,
//         appId: !!publicEnv.PUBLIC_FIREBASE_APP_ID,
//       },
//       windowENVKeys: {
//         apiKey: !!winEnv.FIREBASE_API_KEY,
//         authDomain: !!winEnv.FIREBASE_AUTH_DOMAIN,
//         projectId: !!winEnv.FIREBASE_PROJECT_ID,
//         appId: !!winEnv.FIREBASE_APP_ID,
//       },
//     });
//   }
// }

// // Initialize Firebase (guard for HMR)

// const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig as any);

// // Initialize Firestore with long-polling in browser to avoid WebChannel 400s behind proxies/VPNs
// export const db =
//   typeof window !== 'undefined'
//     ? initializeFirestore(app, { experimentalForceLongPolling: true })
//     : getFirestore(app);
// export const auth = getAuth(app);
// export const storage = getStorage(app);

// export default app;
