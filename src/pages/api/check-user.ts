import type { APIRoute } from 'astro';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const email = (body?.email || '').toString().trim().toLowerCase();
    const nickname = (body?.nickname || '').toString().trim();

    if (!email && !nickname) {
      return new Response(
        JSON.stringify({ error: 'Email atau nickname diperlukan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const results: { emailExists?: boolean; nicknameExists?: boolean } = {};

    // Check email
    if (email) {
      try {
        const emailQuery = query(
          collection(db, 'users'),
          where('email', '==', email),
          limit(1)
        );
        const emailSnap = await getDocs(emailQuery);
        results.emailExists = !emailSnap.empty;
      } catch (err) {
        console.error('Error checking email:', err);
        results.emailExists = false;
      }
    }

    // Check nickname
    if (nickname) {
      try {
        const nicknameQuery = query(
          collection(db, 'users'),
          where('nickname', '==', nickname),
          limit(1)
        );
        const nicknameSnap = await getDocs(nicknameQuery);
        results.nicknameExists = !nicknameSnap.empty;
      } catch (err) {
        console.error('Error checking nickname:', err);
        results.nicknameExists = false;
      }
    }

    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Gagal memeriksa data', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

