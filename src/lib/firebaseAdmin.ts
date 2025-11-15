import * as admin from 'firebase-admin';

function getPrivateKeyFromEnv() {
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!key) return undefined;
  // Support both escaped and raw newlines
  return key.replace(/\\n/g, '\n');
}

let app: admin.app.App | undefined;

export function getAdminApp() {
  if (app) return app;
  if (admin.apps.length) {
    app = admin.app();
    return app;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = getPrivateKeyFromEnv();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin envs: FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY');
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  return app;
}

export function getAdminAuth() {
  return getAdminApp().auth();
}

export function getAdminFirestore() {
  // Initialize Firestore from the same Admin app
  const app = getAdminApp();
  return (require('firebase-admin')).firestore(app);
}
