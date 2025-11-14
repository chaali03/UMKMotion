import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

function generateVoucher(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `UMKM-${rand}-${ts}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ ok: false, message: 'Invalid content type' }), { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const email = (body?.email || '').toString().trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ ok: false, message: 'Email tidak valid' }), { status: 400 });
    }

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      SMTP_SECURE,
      SMTP_FROM,
      FROM_EMAIL,
      FROM_NAME,
    } = import.meta.env as any;

    const fromEmail = FROM_EMAIL || SMTP_FROM;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !fromEmail) {
      return new Response(JSON.stringify({ ok: false, message: 'Konfigurasi SMTP belum lengkap' }), { status: 500 });
    }

    const portNum = Number(SMTP_PORT);
    const secure = typeof SMTP_SECURE !== 'undefined'
      ? (String(SMTP_SECURE).toLowerCase() === 'true')
      : (portNum === 465);
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: portNum,
      secure,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const voucher = generateVoucher();
    const subject = 'Voucher Selamat Datang • UMKMotion';
    const html = `
    <!doctype html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${subject}</title>
      </head>
      <body style="margin:0;padding:0;background:#f6f7fb;font-family:Inter,Arial,sans-serif;color:#0f172a;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f7fb;">
          <tr>
            <td align="center" style="padding:28px 16px;">
              <!-- Container -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(16,24,40,.08);overflow:hidden;">
                <!-- Header -->
                <tr>
                  <td align="left" style="padding:20px 24px;background:linear-gradient(90deg,#ff7a1a,#ff4d00);">
                    <table width="100%" role="presentation">
                      <tr>
                        <td align="left">
                          <img src="https://raw.githubusercontent.com/chaali03/UMKMotion/main/public/LogoNavbar.webp" alt="UMKMotion" width="120" style="display:block;border:0;outline:none;">
                        </td>
                        <td align="right" style="color:#fff;font-weight:800;letter-spacing:.3px;">Voucher Selamat Datang</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:28px 24px 8px;">
                    <h1 style="margin:0 0 8px;font-size:22px;line-height:30px;color:#0f172a;">Terima kasih sudah bergabung 🎉</h1>
                    <p style="margin:0 0 16px;font-size:14px;line-height:22px;color:#334155;">Ini kode voucher spesial untuk kamu. Gunakan saat checkout di UMKMotion.</p>

                    <div style="margin:12px 0 18px;">
                      <span style="display:inline-block;padding:14px 18px;border-radius:12px;background:#0f172a;color:#ffffff;font-weight:900;letter-spacing:1px;box-shadow:0 6px 16px rgba(15,23,42,.2);">${voucher}</span>
                    </div>

                    <a href="https://umkmotion.vercel.app/etalase" style="display:inline-block;background:linear-gradient(90deg,#ff7a1a,#ff4d00);color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:800;box-shadow:0 10px 20px rgba(253,87,1,.25);">Pakai Voucher Sekarang</a>

                    <div style="margin-top:18px;border-top:1px dashed #e5e7eb;padding-top:12px;">
                      <p style="margin:0;font-size:12px;line-height:18px;color:#64748b;">S&K berlaku. Jangan bagikan kode ini ke orang lain. Jika kamu tidak merasa mendaftar, abaikan email ini.</p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:16px 24px 24px;color:#94a3b8;font-size:12px;">
                    © ${new Date().getFullYear()} UMKMotion • Indonesia
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

    await transporter.sendMail({
      from: `${FROM_NAME || 'UMKMotion'} <${fromEmail}>`,
      to: email,
      subject,
      html,
    });

    return new Response(JSON.stringify({ ok: true, voucher }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, message: err?.message || 'Terjadi kesalahan' }), { status: 500 });
  }
};
