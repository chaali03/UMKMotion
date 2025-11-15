import { getAdminAuth } from '../firebaseAdmin';
import type { APIContext } from 'astro';

export async function verifySession(cookies: APIContext['cookies']) {
  const session = cookies.get('session')?.value;
  if (!session) return null;

  try {
    const auth = getAdminAuth();
    return await auth.verifySessionCookie(session, true);
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}
