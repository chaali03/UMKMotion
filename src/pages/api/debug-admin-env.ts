import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const proj = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const email = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  const hasProj = !!proj;
  const hasEmail = !!email;
  const hasKey = !!key;

  // Do minimal checks without leaking secrets
  const keyPreview = hasKey ? {
    length: key!.length,
    startsWithBegin: key!.includes('BEGIN PRIVATE KEY'),
    endsWithEnd: key!.includes('END PRIVATE KEY'),
    containsEscapedNewlines: /\\n/.test(key!),
    // count of escaped newlines
    escapedNewlineCount: (key!.match(/\\n/g) || []).length,
  } : null;

  return new Response(JSON.stringify({
    FIREBASE_ADMIN_PROJECT_ID: hasProj,
    FIREBASE_ADMIN_CLIENT_EMAIL: hasEmail,
    FIREBASE_ADMIN_PRIVATE_KEY: hasKey,
    privateKeyChecks: keyPreview,
    nodeEnv: process.env.NODE_ENV,
  }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
