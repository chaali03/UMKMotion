import type { APIRoute } from 'astro';
import { getAdminAuth, getAdminFirestore } from '../../lib/firebaseAdmin';

// Session expires in 7 days
const EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

// Base32 decode (RFC 4648, no padding)
function base32ToBytes(b32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const cleaned = b32.replace(/=+$/, '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  for (let i = 0; i < cleaned.length; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val < 0) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

// HOTP using HMAC-SHA1
function hotp(secretB32: string, counter: number, digits = 6): string {
  const key = base32ToBytes(secretB32);
  const buf = Buffer.alloc(8);
  const hi = Math.floor(counter / 0x100000000);
  const lo = counter >>> 0;
  buf.writeUInt32BE(hi, 0);
  buf.writeUInt32BE(lo, 4);
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha1', Buffer.from(key)).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return (code % 10 ** digits).toString().padStart(digits, '0');
}

function verifyTotp(secretB32: string, token: string, step = 30, windowSkew = 1): boolean {
  const time = Math.floor(Date.now() / 1000);
  const counter = Math.floor(time / step);
  for (let w = -windowSkew; w <= windowSkew; w++) {
    const code = hotp(secretB32, counter + w, 6);
    if (code === token) return true;
  }
  return false;
}

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    let idToken = '';
    let otp = '';

    // Parse JSON body
    try {
      const body = await request.json();
      idToken = (body?.idToken || '').toString();
      otp = (body?.otp || body?.code || '').toString();
    } catch {}

    if (!idToken) {
      return new Response(JSON.stringify({ error: 'Token login tidak tersedia' }), { status: 400 });
    }
    if (!/^\d{6}$/.test(otp)) {
      return new Response(JSON.stringify({ error: 'Kode TOTP harus 6 digit' }), { status: 400 });
    }

    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    if (!snap.exists) {
      return new Response(JSON.stringify({ error: 'Profil pengguna tidak ditemukan' }), { status: 404 });
    }
    const data = snap.data() || {} as any;
    const enabled = !!(data.twoFactorEnabled || data.totpEnabled);
    const secret: string | undefined = data.totpSecret;

    if (!enabled) {
      return new Response(JSON.stringify({ error: '2FA belum diaktifkan' }), { status: 400 });
    }
    if (!secret || typeof secret !== 'string') {
      return new Response(JSON.stringify({ error: 'Secret TOTP tidak tersedia' }), { status: 500 });
    }

    const valid = verifyTotp(secret, otp);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Kode TOTP tidak valid' }), { status: 401 });
    }

    // Create session cookie after successful TOTP verification
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN_SECONDS * 1000 });
    const isSecure = import.meta.env.PROD;
    cookies.set('session', sessionCookie, {
      path: '/',
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: EXPIRES_IN_SECONDS,
    });

    return new Response(JSON.stringify({ success: true, uid }), { status: 200 });
  } catch (err: any) {
    const message = err?.message || 'Gagal memverifikasi TOTP';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};