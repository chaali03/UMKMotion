import type { APIRoute } from 'astro';
import { getAdminAuth } from '../../lib/firebaseAdmin';
import { db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    let decoded: any;
    const auth = getAdminAuth();
    
    // Parse request body once
    const body = await request.json();
    
    // Try to verify via session cookie first
    const session = cookies.get('session');
    if (session) {
      try {
        decoded = await auth.verifySessionCookie(session.value, true);
      } catch (sessionError) {
        console.warn('Session cookie verification failed, trying ID token fallback');
      }
    }
    
    // Fallback: verify via ID token if session cookie doesn't exist or failed
    if (!decoded) {
      const idToken = body.idToken;
      
      if (!idToken) {
        return new Response(
          JSON.stringify({ error: 'No session or ID token provided' }), 
          { status: 401 }
        );
      }
      
      try {
        decoded = await auth.verifyIdToken(idToken);
      } catch (tokenError: any) {
        return new Response(
          JSON.stringify({ error: 'Authentication failed', details: tokenError.message }), 
          { status: 401 }
        );
      }
    }

    // Process update data
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
    console.error('Profile update error:', e);
    return new Response(JSON.stringify({ error: e?.message || 'Update failed' }), { status: 400 });
  }
};