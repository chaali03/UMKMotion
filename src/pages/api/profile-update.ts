import type { APIRoute } from 'astro';
import { getAdminAuth } from '../../lib/firebaseAdmin';
import { db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const session = cookies.get('session');
    if (!session) return new Response(JSON.stringify({ error: 'No session' }), { status: 401 });

    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(session, true);

    const body = await request.json();
    const allowed: Record<string, any> = {};

    // Only allow safe fields to be updated
    if (typeof body.nickname === 'string') allowed.nickname = body.nickname.trim();
    if (typeof body.fullName === 'string') allowed.fullName = body.fullName.trim();
    if (typeof body.bio === 'string') allowed.bio = body.bio;
    if (typeof body.photoURL === 'string') allowed.photoURL = body.photoURL;

    if (!Object.keys(allowed).length) {
      return new Response(JSON.stringify({ error: 'No allowed fields' }), { status: 400 });
    }

    allowed.updatedAt = serverTimestamp();

    await setDoc(doc(db, 'users', decoded.uid), allowed, { merge: true });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Update failed' }), { status: 400 });
  }
};