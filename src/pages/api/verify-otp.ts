import type { APIRoute } from 'astro';
import { collection, query, where, getDocs, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Ensure server-rendered route so POST works
export const prerender = false;

// Access the same in-memory store defined in send-otp.ts (process-level)
const g: any = globalThis as any;
if (!g.__umkmotionOtpStore) {
  g.__umkmotionOtpStore = new Map<string, { email: string; code: string; expiresAt: number; used: boolean }>();
}

export const POST: APIRoute = async ({ request }) => {
  try {
    let email = '';
    let code = '';

    // Try JSON body safely
    try {
      const text = await request.text();
      if (text && text.trim()) {
        const json = JSON.parse(text);
        email = (json?.email || '').toString().trim().toLowerCase();
        code = (json?.code || '').toString().trim();
      }
    } catch {}

    // Try headers
    if (!email) email = (request.headers.get('x-email') || '').toString().trim().toLowerCase();
    if (!code) code = (request.headers.get('x-code') || request.headers.get('x-otp') || '').toString().trim();

    // Try query params
    if (!email || !code) {
      try {
        const u = new URL(request.url);
        if (!email) email = (u.searchParams.get('email') || '').toString().trim().toLowerCase();
        if (!code) code = (u.searchParams.get('code') || u.searchParams.get('otp') || '').toString().trim();
      } catch {}
    }

    if (!email || !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email)) {
      return new Response(JSON.stringify({ error: 'Email tidak valid' }), { status: 400 });
    }
    if (!code || code.length !== 6) {
      return new Response(JSON.stringify({ error: 'Kode verifikasi harus 6 digit' }), { status: 400 });
    }

    // Try Firestore first
    try {
      const q = query(
        collection(db, 'emailOtps'),
        where('email', '==', email),
        where('code', '==', code),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const otpDoc = snap.docs[0];
        const data = otpDoc.data() as { expiresAt: number; used: boolean };
        if (data.used) {
          return new Response(JSON.stringify({ error: 'Kode sudah digunakan' }), { status: 400 });
        }
        if (data.expiresAt < Date.now()) {
          await updateDoc(doc(db, 'emailOtps', otpDoc.id), { used: true });
          return new Response(JSON.stringify({ error: 'Kode kadaluarsa' }), { status: 400 });
        }
        await updateDoc(doc(db, 'emailOtps', otpDoc.id), { used: true });
        return new Response(JSON.stringify({ ok: true, persisted: 'firestore' }), { status: 200 });
      }
    } catch (_) {
      // Ignore Firestore errors and try memory fallback
    }

    // Fallback: in-memory store populated by send-otp.ts
    const key = `${email}:${code}`;
    const entry = g.__umkmotionOtpStore.get(key) as { email: string; code: string; expiresAt: number; used: boolean } | undefined;
    if (!entry) {
      return new Response(JSON.stringify({ error: 'Kode tidak ditemukan atau sudah digunakan' }), { status: 404 });
    }
    if (entry.used) {
      return new Response(JSON.stringify({ error: 'Kode sudah digunakan' }), { status: 400 });
    }
    if (entry.expiresAt < Date.now()) {
      entry.used = true;
      g.__umkmotionOtpStore.set(key, entry);
      return new Response(JSON.stringify({ error: 'Kode kadaluarsa' }), { status: 400 });
    }
    entry.used = true;
    g.__umkmotionOtpStore.set(key, entry);
    return new Response(JSON.stringify({ ok: true, persisted: 'memory' }), { status: 200 });
  } catch (err: any) {
    const message = err?.message || 'Gagal memproses permintaan';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
