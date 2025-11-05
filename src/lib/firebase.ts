import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Add your Firebase config here
  apiKey: (typeof window !== 'undefined' && window.ENV?.FIREBASE_API_KEY) || 
          (typeof process !== 'undefined' && process.env?.FIREBASE_API_KEY) || 
          "your-api-key",
  authDomain: (typeof window !== 'undefined' && window.ENV?.FIREBASE_AUTH_DOMAIN) || 
              (typeof process !== 'undefined' && process.env?.FIREBASE_AUTH_DOMAIN) || 
              "your-project.firebaseapp.com",
  projectId: (typeof window !== 'undefined' && window.ENV?.FIREBASE_PROJECT_ID) || 
             (typeof process !== 'undefined' && process.env?.FIREBASE_PROJECT_ID) || 
             "your-project-id",
  storageBucket: (typeof window !== 'undefined' && window.ENV?.FIREBASE_STORAGE_BUCKET) || 
                 (typeof process !== 'undefined' && process.env?.FIREBASE_STORAGE_BUCKET) || 
                 "your-project.appspot.com",
  messagingSenderId: (typeof window !== 'undefined' && window.ENV?.FIREBASE_MESSAGING_SENDER_ID) || 
                     (typeof process !== 'undefined' && process.env?.FIREBASE_MESSAGING_SENDER_ID) || 
                     "123456789",
  appId: (typeof window !== 'undefined' && window.ENV?.FIREBASE_APP_ID) || 
         (typeof process !== 'undefined' && process.env?.FIREBASE_APP_ID) || 
         "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
