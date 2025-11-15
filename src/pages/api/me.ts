import type { APIRoute } from 'astro';
import { getAdminAuth } from '../../lib/firebaseAdmin';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const session = cookies.get('session');
    if (!session) {
      return new Response(JSON.stringify({ error: 'No session' }), { status: 401 });
    }

    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(session, true);

    const ref = doc(db, 'users', decoded.uid);
    const snap = await getDoc(ref);
    const profile = snap.exists() ? snap.data() : {};

    return new Response(
      JSON.stringify({ uid: decoded.uid, email: decoded.email || null, profile }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unauthorized' }), { status: 401 });
  }
};