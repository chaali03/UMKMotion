// Simple in-memory OTP store (bypasses Firestore transport issues)
import { sendEmailWithOTP } from './email-config';

interface OtpEntry {
  code: string;
  email: string;
  expiresAt: number;
  used: boolean;
}

const otpStore = new Map<string, OtpEntry>();

function generate6Digit(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export type SendEmailOtpOptions = {
  ttlSeconds?: number; // default 10 minutes
  subject?: string;
};

export async function sendEmailOtp(email: string, options: SendEmailOtpOptions = {}) {
  const ttl = options.ttlSeconds ?? 600;
  const code = generate6Digit();
  const expiresAt = Date.now() + ttl * 1000;
  const key = `${email}:${code}`;

  // Store OTP in memory
  otpStore.set(key, {
    code,
    email,
    expiresAt,
    used: false,
  });

  // Clean up expired entries
  const now = Date.now();
  for (const [k, v] of otpStore.entries()) {
    if (v.expiresAt < now) {
      otpStore.delete(k);
    }
  }

  const subject = options.subject ?? 'Kode Verifikasi Akun UMKMotion';
  
  try {
    // Send real email using EmailJS
    await sendEmailWithOTP(email, code, subject);
    console.log(`✅ Email OTP berhasil dikirim ke ${email}`);
  } catch (error) {
    console.error('❌ Gagal mengirim email OTP:', error);
    
    // Berikan pesan error yang lebih user-friendly
    let errorMessage = 'Gagal mengirim email OTP. ';
    
    if (error instanceof Error) {
      if (error.message.includes('SERVICE_ID')) {
        errorMessage += 'SERVICE_ID EmailJS belum dikonfigurasi dengan benar.';
      } else if (error.message.includes('TEMPLATE_ID')) {
        errorMessage += 'TEMPLATE_ID EmailJS belum dikonfigurasi dengan benar.';
      } else if (error.message.includes('PUBLIC_KEY')) {
        errorMessage += 'PUBLIC_KEY EmailJS belum dikonfigurasi dengan benar.';
      } else if (error.message.includes('400')) {
        errorMessage += 'Konfigurasi EmailJS salah. Cek SERVICE_ID, TEMPLATE_ID, dan PUBLIC_KEY.';
      } else {
        errorMessage += error.message;
      }
    } else {
      errorMessage += 'Silakan coba lagi atau hubungi admin.';
    }
    
    throw new Error(errorMessage);
  }

  return { id: key, code, expiresAt: new Date(expiresAt) };
}

export async function verifyEmailOtp(email: string, code: string) {
  const key = `${email}:${code}`;
  const entry = otpStore.get(key);
  
  if (!entry) {
    throw new Error('Kode tidak ditemukan atau sudah digunakan');
  }
  
  if (entry.used) {
    throw new Error('Kode sudah digunakan');
  }
  
  if (entry.expiresAt < Date.now()) {
    otpStore.delete(key);
    throw new Error('Kode kadaluarsa');
  }
  
  // Mark as used
  entry.used = true;
  otpStore.set(key, entry);
  
  console.log(`✅ OTP verified for ${email}`);
  return true;
}
