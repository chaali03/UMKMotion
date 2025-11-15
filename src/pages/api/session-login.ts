import type { APIRoute } from 'astro';
import { getAdminAuth } from '../../lib/firebaseAdmin';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    try {
      // Try to initialize with environment variables
      initializeApp();
    } catch (error) {
      console.warn('Firebase Admin initialization failed:', error);
      return false;
    }
  }
  return true;
};

export const prerender = false;

// 7 days session
const EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days in seconds

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse request body
    let idToken: string;
    try {
      const body = await request.json();
      idToken = body.idToken;
      if (!idToken) {
        throw new Error('Missing idToken in request body');
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request',
          details: 'Missing or invalid request body'
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Firebase Admin
    const adminInitialized = initializeFirebaseAdmin();
    
    // If Firebase Admin failed to initialize, return a response that allows the client to continue
    if (!adminInitialized) {
      console.warn('Firebase Admin not initialized - session cookie not created');
      return new Response(
        JSON.stringify({ 
          success: true,
          warning: 'Session cookie not created - running in limited mode',
          uid: 'unknown',
          email: null,
          emailVerified: false
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      const auth = getAdminAuth();
      const decoded = await auth.verifyIdToken(idToken);
      
      // Create session cookie that expires in 7 days
      const sessionCookie = await auth.createSessionCookie(idToken, { 
        expiresIn: EXPIRES_IN * 1000 // convert to milliseconds
      });

      // Set secure cookie in production, allow http in development
      const isSecure = import.meta.env.PROD;
      
      // Set the session cookie
      cookies.set('session', sessionCookie, {
        path: '/',
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: EXPIRES_IN,
      });

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true,
          uid: decoded.uid,
          email: decoded.email,
          emailVerified: decoded.email_verified || false
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error: any) {
      // Handle Firebase Admin initialization errors
      const isAdminError = error.message?.includes('Firebase Admin') || 
                          error.message?.includes('FIREBASE_ADMIN') ||
                          error.code === 'app/no-app';
      
      if (isAdminError) {
        console.warn('Firebase Admin error, falling back to client-side auth:', error.message);
        return new Response(
          JSON.stringify({ 
            success: true,
            warning: 'Running in client-side only mode',
            uid: 'unknown',
            email: null,
            emailVerified: false
          }), 
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Handle invalid token errors
      if (error.code === 'auth/argument-error' || 
          error.code === 'auth/id-token-expired' || 
          error.code === 'auth/id-token-revoked') {
        console.warn('Invalid or expired token:', error.message);
        return new Response(
          JSON.stringify({ 
            success: false,
            warning: 'Authentication failed',
            details: 'Your session has expired. Please refresh the page and try again.'
          }), 
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Other authentication errors
      console.error('Session creation failed:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          warning: 'Authentication failed',
          details: error.message || 'Failed to create session'
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in session-login:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message || 'An unexpected error occurred'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
