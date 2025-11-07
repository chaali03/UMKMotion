import type { APIRoute } from 'astro';
import { collection, query, where, getDocs, limit, updateDoc, doc } from 'firebase/firestore';

// Ensure this route is server-rendered (not prerendered) so POST works and headers are available
export const prerender = false;

// Access the same in-memory store defined in send-otp.ts (process-level)
const g: any = globalThis as any;
if (!g.__umkmotionOtpStore) {
  g.__umkmotionOtpStore = new Map<string, { email: string; code: string; expiresAt: number; used: boolean }>();
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const urlObjForDebug = new URL(request.url);
    const debug = ['1', 'true'].includes((urlObjForDebug.searchParams.get('debug') || '').toLowerCase());
    // Robust body parsing (avoid 500 when body is empty/malformed)
    let email = '';
    let code = '';
    try {
      const text = await request.text();
      if (text && text.trim()) {
        const json = JSON.parse(text);
        email = (json?.email || '').toString().trim().toLowerCase();
        code = (json?.code || '').toString().trim();
      }
    } catch (e) {
      // ignore, will validate below
    }

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
      const resp: any = { error: 'Email tidak valid' };
      if (debug) resp.debug = { email, codeLength: code?.length || 0, hint: 'Periksa input email di body/headers/query' };
      return new Response(JSON.stringify(resp), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!code || code.length !== 6) {
      const resp: any = { error: 'Kode verifikasi harus 6 digit' };
      if (debug) resp.debug = { email, code, hint: 'Kode harus tepat 6 digit angka' };
      return new Response(JSON.stringify(resp), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Try Firestore first unless explicitly disabled via OTP_PERSISTENCE=memory
    try {
      const env: any = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
      const persistence = ((typeof process !== 'undefined' && process.env && process.env.OTP_PERSISTENCE) || env.OTP_PERSISTENCE || 'memory').toString().toLowerCase();
      if (persistence !== 'memory') {
        const { db } = await import('../../lib/firebase');
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
            const resp: any = { error: 'Kode sudah digunakan' };
            if (debug) resp.debug = { source: 'firestore', email, code, docId: otpDoc.id, used: true };
            return new Response(JSON.stringify(resp), { status: 400, headers: { 'Content-Type': 'application/json' } });
          }
          if (data.expiresAt < Date.now()) {
            await updateDoc(doc(db, 'emailOtps', otpDoc.id), { used: true });
            const resp: any = { error: 'Kode kadaluarsa' };
            if (debug) resp.debug = { source: 'firestore', email, code, docId: otpDoc.id, expiresAt: data.expiresAt, now: Date.now() };
            return new Response(JSON.stringify(resp), { status: 400, headers: { 'Content-Type': 'application/json' } });
          }
          await updateDoc(doc(db, 'emailOtps', otpDoc.id), { used: true });
          const resp: any = { ok: true, persisted: 'firestore' };
          if (debug) resp.debug = { source: 'firestore', email, code, docId: otpDoc.id };
          return new Response(JSON.stringify(resp), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (debug) console.log('[verify-otp][debug] Firestore empty for email/code', { email, code });
      }
    } catch (_) {
      // Ignore Firestore errors and continue to memory fallback
    }

    // Fallback: in-memory store populated by send-otp.ts
    if (debug) console.log(`[verify-otp][debug] Memory store size: ${g.__umkmotionOtpStore.size}`);
    const key = `${email}:${code}`;
    const entry = g.__umkmotionOtpStore.get(key) as { email: string; code: string; expiresAt: number; used: boolean } | undefined;
    if (!entry) {
      // Dev fallback: allow verify when DEV_OTP_FALLBACK=true (non-production) or ?mock=1
      try {
        const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
        const isProd = ((typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || (viteEnv && (viteEnv as any).NODE_ENV) || '').toLowerCase() === 'production';
        const devFallback = ((typeof process !== 'undefined' && process.env && process.env.DEV_OTP_FALLBACK) || (viteEnv && (viteEnv as any).DEV_OTP_FALLBACK) || 'false').toString().toLowerCase() === 'true';
        const urlObj = new URL(request.url);
        const mock = urlObj.searchParams.get('mock') === '1';
        if (!isProd && (devFallback || mock)) {
          // find latest OTP for this email (if any)
          let latest: any = null;
          for (const [k, v] of g.__umkmotionOtpStore.entries()) {
            if (k.startsWith(`${email}:`)) {
              if (!latest || v.expiresAt > latest.expiresAt) latest = v;
            }
          }
          if (latest) {
            latest.used = true;
            g.__umkmotionOtpStore.set(`${latest.email}:${latest.code}`, latest);
            const resp: any = { ok: true, persisted: 'memory', devFallback: true };
            if (debug) resp.debug = { email, chosenCode: latest.code };
            return new Response(JSON.stringify(resp), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
        }
      } catch {}
      const resp: any = { error: 'Kode tidak ditemukan atau sudah digunakan' };
      if (debug) resp.debug = { email, code, memoryKeys: Array.from(g.__umkmotionOtpStore.keys()).slice(0, 10) };
      return new Response(JSON.stringify(resp), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    if (entry.used) {
      const resp: any = { error: 'Kode sudah digunakan' };
      if (debug) resp.debug = { email, code };
      return new Response(JSON.stringify(resp), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (entry.expiresAt < Date.now()) {
      entry.used = true;
      g.__umkmotionOtpStore.set(key, entry);
      const resp: any = { error: 'Kode kadaluarsa' };
      if (debug) resp.debug = { email, code, expiresAt: entry.expiresAt, now: Date.now() };
      return new Response(JSON.stringify(resp), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    entry.used = true;
    g.__umkmotionOtpStore.set(key, entry);
    const resp: any = { ok: true, persisted: 'memory' };
    if (debug) resp.debug = { email, code };
    return new Response(JSON.stringify(resp), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    // Log and avoid generic 500 without context
    console.error('[verify-otp] Unhandled error:', err?.message || err);
    const message = err?.message || 'Gagal memproses permintaan';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
