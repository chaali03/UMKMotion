import type { APIRoute } from 'astro';
import { verifySession } from '../../lib/auth/session-utils';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, request }) => {
  try {
    // Verify session using our utility
    const decoded = await verifySession(cookies);
    
    if (!decoded) {
      // Check if session cookie exists but is invalid
      const sessionCookie = cookies.get('session')?.value;
      return new Response(
        JSON.stringify({ 
          error: 'Not authenticated',
          details: sessionCookie 
            ? 'Session expired or invalid. Please refresh the page or log in again.'
            : 'No session found. Please ensure you are logged in and try refreshing the page.'
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user profile from Firestore
    try {
      const userRef = doc(db, 'users', decoded.uid);
      const userDoc = await getDoc(userRef);
      
      const profile = userDoc.exists() ? userDoc.data() : {};

      return new Response(
        JSON.stringify({
          uid: decoded.uid,
          email: decoded.email || null,
          profile,
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return new Response(
        JSON.stringify({
          uid: decoded.uid,
          email: decoded.email || null,
          error: 'Failed to fetch profile',
          details: error.message,
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in /api/me:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};