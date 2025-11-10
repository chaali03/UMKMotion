import type { APIRoute } from 'astro';
import { getAdminAuth } from '../../lib/firebaseAdmin';

export const prerender = false;

// 7 days session
const EXPIRES_IN = 60 * 60 * 24 * 7 * 1000;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { idToken } = await request.json();
    if (!idToken) return new Response(JSON.stringify({ error: 'Missing idToken' }), { status: 400 });

    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN });

    const isProd = process.env.NODE_ENV === 'production';
    cookies.set('session', sessionCookie, {
      path: '/',
      httpOnly: true,
      secure: isProd, // allow non-secure in dev so cookie works over http
      sameSite: 'lax',
      maxAge: EXPIRES_IN / 1000,
    });

    return new Response(JSON.stringify({ uid: decoded.uid }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Session create failed' }), { status: 401 });
  }
};
