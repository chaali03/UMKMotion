import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

// Ensure this route is server-rendered, not prerendered
export const prerender = false;

function generate6Digit(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const g: any = globalThis as any;
if (!g.__umkmotionOtpStore) {
  g.__umkmotionOtpStore = new Map<string, { email: string; code: string; expiresAt: number; used: boolean }>();
}

export const GET: APIRoute = async ({ request, url }) => {
  try {
    console.log('=== 🚀 GET REQUEST ===');
    console.log('🔍 Full URL:', request.url);
    console.log('🔍 URL Object:', url.toString());
    console.log('🔍 Search Params:', Object.fromEntries(url.searchParams.entries()));
    
    // DEBUG: Log semua parameter yang ada
    console.log('🔍 ALL PARAMETERS:');
    url.searchParams.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
    });

    // Cara 1: Direct from URL searchParams
    const emailFromUrl = url.searchParams.get('email');
    console.log('📧 Email from url.searchParams:', emailFromUrl);

    // Cara 2: Manual parsing dari request URL
    const requestUrl = new URL(request.url);
    const emailFromRequest = requestUrl.searchParams.get('email');
    console.log('📧 Email from request.url:', emailFromRequest);

    // Cara 3: Try different parameter names
    const emailAlt1 = url.searchParams.get('Email');
    const emailAlt2 = url.searchParams.get('EMAIL');
    const emailAlt3 = url.searchParams.get('e');
    console.log('📧 Alternative param names:', { Email: emailAlt1, EMAIL: emailAlt2, e: emailAlt3 });

    // Gunakan email yang pertama ada, decode URL encoding
    let email = emailFromUrl || emailFromRequest || emailAlt1 || emailAlt2 || emailAlt3 || '';
    if (email) {
      try {
        email = decodeURIComponent(email).trim().toLowerCase();
      } catch (e) {
        email = email.trim().toLowerCase();
      }
    }
    
    const subject = url.searchParams.get('subject') || 'Kode Verifikasi Akun UMKMotion';
    const ttlSeconds = Number(url.searchParams.get('ttlSeconds') || 600);

    // Validate email - reject if invalid
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Email tidak valid atau tidak ditemukan',
          hint: 'Pastikan parameter ?email=user@example.com ada di URL'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 FINAL VALUES:', { 
      email, 
      subject, 
      ttlSeconds,
      source: email === emailFromUrl ? 'url.searchParams' : 
              email === emailFromRequest ? 'request.url' :
              email === emailAlt1 ? 'Email' :
              email === emailAlt2 ? 'EMAIL' :
              email === emailAlt3 ? 'e' : 'unknown'
    });

    // DEBUG RESPONSE - Show everything
    if (url.searchParams.has('debug')) {
      return new Response(
        JSON.stringify({
          debug: true,
          method: 'GET',
          parameters_received: Object.fromEntries(url.searchParams.entries()),
          email_sources: {
            from_url_searchParams: emailFromUrl,
            from_request_url: emailFromRequest,
            from_Email: emailAlt1,
            from_EMAIL: emailAlt2,
            from_e: emailAlt3,
            final_email: email
          },
          raw_url: request.url,
          parsed_url: url.toString()
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate OTP
    const code = generate6Digit();
    const expiresAt = Date.now() + ttlSeconds * 1000;

    // Store OTP (memory)
    g.__umkmotionOtpStore.set(`${email}:${code}`, { email, code, expiresAt, used: false });

    // Optionally persist to Firestore when enabled
    try {
      const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
      const persistence = ((typeof process !== 'undefined' && process.env && process.env.OTP_PERSISTENCE) || (viteEnv as any).OTP_PERSISTENCE || 'memory').toString().toLowerCase();
      if (persistence !== 'memory') {
        const { db } = await import('../../lib/firebase');
        const { addDoc, collection } = await import('firebase/firestore');
        await addDoc(collection(db, 'emailOtps'), { email, code, expiresAt, used: false, createdAt: Date.now() });
      }
    } catch (e) {
      console.warn('[send-otp][GET] Firestore persist skipped:', (e as any)?.message || e);
    }

    console.log('✅ OTP Generated:', { email, code });

    // For GET requests, we don't send email (use POST for that)
    return new Response(
      JSON.stringify({
        ok: true,
        email: email,
        code: code,
        expiresAt: expiresAt,
        note: 'GET request - OTP generated but email not sent. Use POST method to send email via SMTP.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (err: any) {
    console.error('💥 GET Error:', err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'GET request failed',
        message: err.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const debugMode = url.searchParams.get('debug') === '1';
    
    console.log('🔍 FULL URL:', request.url);
    console.log('🌍 ENV Check:', {
      NODE_ENV: process.env.NODE_ENV,
      SMTP_USER: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : 'UNDEFINED',
      SMTP_PASS: process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.substring(process.env.SMTP_PASS.length - 4) : 'UNDEFINED',
      DEV_OTP_FALLBACK: process.env.DEV_OTP_FALLBACK
    });
    
    // Consolidated email extraction: query, headers, body (JSON/form)
    // Parse query params from request.url directly (more reliable)
    const requestUrlObj = new URL(request.url);
    let qpEmail = requestUrlObj.searchParams.get('email') || '';
    console.log('📧 Raw query param email (from request.url):', qpEmail);
    
    // Also try from url param (fallback)
    if (!qpEmail && url) {
      qpEmail = url.searchParams.get('email') || '';
      console.log('📧 Email from url param:', qpEmail);
    }
    
    // Decode URL encoding (%40 = @, etc)
    if (qpEmail) {
      try {
        qpEmail = decodeURIComponent(qpEmail);
      } catch (e) {
        console.log('⚠️ decodeURIComponent failed, using raw:', qpEmail);
      }
      qpEmail = qpEmail.trim().toLowerCase();
    }
    
    const headerEmail = (request.headers.get('x-email') || '').toString().trim().toLowerCase();

    let bodyEmail = '';
    // Get subject and ttlSeconds from request URL query params
    let subject = requestUrlObj.searchParams.get('subject') || request.headers.get('x-subject') || 'Kode Verifikasi Akun UMKMotion';
    let ttlSeconds = Number(requestUrlObj.searchParams.get('ttlSeconds') || request.headers.get('x-ttlseconds') || 600);

    // Try to read body - always try to read as text first, then parse
    try {
      const contentType = request.headers.get('content-type') || '';
      console.log('📝 Content-Type:', contentType || '(empty, will try to parse anyway)');
      
      // Always try to read body as text first
      const bodyText = await request.text().catch(() => '');
      console.log('📝 Body as text (length):', bodyText.length, 'content:', bodyText.substring(0, 200));
      
      if (bodyText && bodyText.trim()) {
        // Try JSON first (most common)
        if (contentType.includes('application/json') || bodyText.trim().startsWith('{')) {
          try {
            const body = JSON.parse(bodyText);
            console.log('📝 JSON Body (parsed):', body);
            
            if (body && typeof body === 'object') {
              bodyEmail = (body.email || '').toString().trim().toLowerCase();
              if (body.subject) subject = body.subject.toString();
              if (body.ttlSeconds) ttlSeconds = Number(body.ttlSeconds);
            }
            console.log('📝 Extracted from body:', { bodyEmail, subject, ttlSeconds });
          } catch (parseError) {
            console.log('❌ JSON parse error:', parseError);
          }
        } else if (contentType.includes('form')) {
          // Try form data
          try {
            const formData = await request.formData();
            const formBody: any = {};
            for (const [key, value] of formData.entries()) formBody[key] = value.toString();
            console.log('📝 Form Body:', formBody);
            bodyEmail = (formBody.email || '').trim().toLowerCase();
            if (formBody.subject) subject = formBody.subject.toString();
            if (formBody.ttlSeconds) ttlSeconds = Number(formBody.ttlSeconds);
          } catch (formError) {
            console.log('❌ Form parsing failed:', formError);
          }
        }
      } else {
        console.log('📝 Body is empty or whitespace only');
      }
    } catch (bodyError: any) {
      console.log('❌ Body parsing failed:', bodyError?.message || bodyError);
    }

    const email = qpEmail || bodyEmail || headerEmail || '';
    console.log('🎯 EMAIL SOURCES:', { qpEmail, bodyEmail, headerEmail, chosen: email, subject, ttlSeconds });

    // Validate email strictly - do NOT silently replace with test@example.com
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('⚠️ Email invalid, rejecting request. Email value:', email);
      const errorResponse = {
        ok: false,
        error: 'Email tidak valid atau tidak ditemukan',
        debug: debugMode ? {
          emailValue: email,
          emailLength: email.length,
          emailSources: { qpEmail, bodyEmail, headerEmail },
          rawQueryParam: url.searchParams.get('email'),
          allQueryParams: Object.fromEntries(url.searchParams.entries())
        } : undefined,
        hint: 'Pastikan parameter ?email=user@example.com ada di URL atau di request body'
      };
      return new Response(
        JSON.stringify(errorResponse),
        { status: debugMode ? 200 : 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate OTP
    const code = generate6Digit();
    const expiresAt = Date.now() + ttlSeconds * 1000;

    console.log('✅ OTP Generated:', { email, code, expiresAt });

    // Store OTP in memory
    g.__umkmotionOtpStore.set(`${email}:${code}`, { email, code, expiresAt, used: false });

    // Optionally persist to Firestore when enabled
    try {
      const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
      const persistence = ((typeof process !== 'undefined' && process.env && process.env.OTP_PERSISTENCE) || (viteEnv as any).OTP_PERSISTENCE || 'memory').toString().toLowerCase();
      if (persistence !== 'memory') {
        const { db } = await import('../../lib/firebase');
        const { addDoc, collection } = await import('firebase/firestore');
        await addDoc(collection(db, 'emailOtps'), { email, code, expiresAt, used: false, createdAt: Date.now() });
      }
    } catch (e) {
      console.warn('[send-otp][POST] Firestore persist skipped:', (e as any)?.message || e);
    }

    // Check if we should skip email sending (dev mode with send=0 or mock=1)
    const skipSend = url.searchParams.get('send') === '0' || url.searchParams.get('mock') === '1';
    const isDev = (process.env.NODE_ENV || '').toLowerCase() !== 'production';
    
    if (skipSend && isDev) {
      console.log('🔄 Skipping email send (mock mode)');
      return new Response(
        JSON.stringify({
          ok: true,
          email: email,
          code: code,
          expiresAt: expiresAt,
          note: 'Development mode - OTP returned directly without sending email'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // GMAIL SMTP VIA NODEMAILER
    try {
      // Resolve env from both process.env and import.meta.env (Astro/Vite)
      const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
      const getEnv = (key: string): string | undefined => {
        const fromProc = (typeof process !== 'undefined' && process.env && process.env[key]) || undefined;
        return fromProc ?? (viteEnv ? (viteEnv as any)[key] : undefined);
      };

      const smtpHost = getEnv('SMTP_HOST') || 'smtp.gmail.com';
      const smtpPort = Number(getEnv('SMTP_PORT') || 465);
      const smtpSecure = getEnv('SMTP_SECURE') ? getEnv('SMTP_SECURE') === 'true' : smtpPort === 465;
      let smtpUser = getEnv('SMTP_USER') || getEnv('GMAIL_USER');
      let smtpPass = getEnv('SMTP_PASS') || getEnv('GMAIL_APP_PASSWORD');
      const fromAddr = getEnv('SMTP_FROM') || (smtpUser ? `UMKMotion <${smtpUser}>` : 'UMKMotion <noreply@umkmotion.com>');

      // Dev helper: allow override via query (su/sp) when not in production
      const isProd = ((typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || (viteEnv && (viteEnv as any).NODE_ENV) || '').toLowerCase() === 'production';
      if (!isProd) {
        const qpUser = url.searchParams.get('su') || '';
        const qpPass = url.searchParams.get('sp') || '';
        if (qpUser && qpPass) {
          smtpUser = qpUser;
          smtpPass = qpPass;
          console.warn('⚠️ Using SMTP creds from query params (dev only).');
        }
      }

      console.log('🔑 SMTP Config Check:', {
        smtpUser: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'MISSING',
        smtpPass: smtpPass ? '***' + smtpPass.substring(smtpPass.length - 4) : 'MISSING',
        smtpHost,
        smtpPort,
        smtpSecure,
        allowDev: (process.env.DEV_OTP_FALLBACK || '').toLowerCase() === 'true'
      });

      if (!smtpUser || !smtpPass) {
        const allowDev = (process.env.DEV_OTP_FALLBACK || '').toLowerCase() === 'true';
        console.warn('⚠️ SMTP credentials missing. Set SMTP_USER and SMTP_PASS (Gmail App Password).');
        if (allowDev) {
          console.log('✅ DEV_OTP_FALLBACK enabled - returning OTP without sending email');
          return new Response(
            JSON.stringify({
              ok: true,
              message: 'OTP dibuat (dev fallback aktif)',
              email,
              code,
              expiresAt,
              note: 'Set SMTP_USER/SMTP_PASS untuk mengirim email via Gmail',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({
            ok: false,
            error: 'Konfigurasi SMTP belum diatur',
            hint: 'Tambahkan SMTP_USER dan SMTP_PASS (Gmail App Password) di .env. Atau aktifkan DEV_OTP_FALLBACK=true untuk testing. Di dev, bisa coba tambahkan ?su=yourgmail@gmail.com&sp=yourapppassword pada URL ini untuk cepat uji. ',
          }),
          { status: debugMode ? 200 : 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
        ...(smtpHost.includes('gmail') ? { service: 'gmail' } : {}),
      });

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ff8c00 0%, #ff6b35 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">UMKMotion</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Verifikasi Email Anda</p>
          </div>
          <div style="padding: 40px; background: #ffffff;">
            <h2 style="color: #333; margin-top: 0;">Kode Verifikasi</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hai, terima kasih telah bergabung dengan UMKMotion. Gunakan kode berikut untuk verifikasi email Anda:
            </p>
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; text-align: center; margin: 30px 0; border: 2px dashed #ddd;">
              <div style="font-size: 42px; font-weight: bold; letter-spacing: 10px; color: #333; font-family: monospace;">${code}</div>
            </div>
            <p style="color: #666; font-size: 14px;">
              Kode ini berlaku selama <strong>${Math.floor(ttlSeconds / 60)} menit</strong>.
              Jangan berikan kode ini kepada siapapun.
            </p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Jika Anda tidak meminta kode ini, abaikan email ini.
              <br>© 2025 UMKMotion. All rights reserved.
            </p>
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: fromAddr,
        to: email,
        subject: subject,
        html,
        text: `Kode verifikasi UMKMotion Anda adalah: ${code}. Berlaku selama ${Math.floor(ttlSeconds / 60)} menit.`,
        headers: { 'X-OTP-Code': code, 'X-Email-Service': 'GmailSMTP' },
      });

      console.log('✅ Email terkirim via Gmail SMTP:', info.messageId);

      return new Response(
        JSON.stringify({
          ok: true,
          message: 'Kode verifikasi telah dikirim ke email Anda',
          email: email,
          expiresAt: expiresAt,
          service: 'GmailSMTP',
          messageId: info.messageId,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (smtpError: any) {
      console.log('❌ Gagal kirim email via SMTP:', smtpError?.message || smtpError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Gagal mengirim email OTP',
          message: smtpError?.message || 'SMTP error',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (err: any) {
    console.error('💥 Error:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Terjadi kesalahan',
        message: err.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Verification endpoint
export const PUT: APIRoute = async ({ request }) => {
  try {
    const { email, code } = await request.json();

    console.log('🔐 Verification attempt:', { email, code });

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email dan kode diperlukan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const key = `${email.trim().toLowerCase()}:${code}`;
    const otpData = g.__umkmotionOtpStore.get(key);

    if (!otpData) {
      return new Response(
        JSON.stringify({ error: 'Kode OTP tidak ditemukan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (otpData.used) {
      return new Response(
        JSON.stringify({ error: 'Kode OTP sudah digunakan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (Date.now() > otpData.expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Kode OTP sudah kedaluwarsa' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Mark as used
    otpData.used = true;
    g.__umkmotionOtpStore.set(key, otpData);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: 'Verifikasi berhasil',
        email: email
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Gagal memverifikasi', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};