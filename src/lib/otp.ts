export type SendEmailOtpOptions = {
  ttlSeconds?: number; // default 10 minutes
  subject?: string;
};

export async function sendEmailOtp(email: string, options: SendEmailOtpOptions = {}) {
  const ttlSeconds = options.ttlSeconds ?? 600;
  const subject = options.subject ?? 'Kode Verifikasi Akun UMKMotion';

  // Redundantly send data via query params and headers to be resilient to server body parsing differences
  const qp = new URLSearchParams({ email, ttlSeconds: String(ttlSeconds), subject });
  const res = await fetch(`/api/send-otp?${qp.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-email': email, 'x-subject': subject, 'x-ttlseconds': String(ttlSeconds) },
    // Still include JSON body as primary source
    body: JSON.stringify({ email, ttlSeconds, subject }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Gagal mengirim email OTP');
  }

  return { expiresAt: new Date(data.expiresAt) };
}

export async function verifyEmailOtp(email: string, code: string) {
  const res = await fetch('/api/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Kode salah atau kadaluarsa');
  }
  return true;
}
