// EmailJS Configuration
export const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.PUBLIC_EMAILJS_SERVICE_ID || 'your_service_id_here',
  TEMPLATE_ID: import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID || 'your_template_id_here',
  PUBLIC_KEY: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key_here',
};

// Fungsi untuk validasi konfigurasi
export const validateEmailJSConfig = () => {
  const config = EMAILJS_CONFIG;
  
  if (!config.SERVICE_ID || config.SERVICE_ID === 'your_service_id_here') {
    throw new Error('SERVICE_ID belum dikonfigurasi. Silakan cek file .env atau email-config.ts');
  }
  
  if (!config.TEMPLATE_ID || config.TEMPLATE_ID === 'your_template_id_here') {
    throw new Error('TEMPLATE_ID belum dikonfigurasi. Silakan cek file .env atau email-config.ts');
  }
  
  if (!config.PUBLIC_KEY || config.PUBLIC_KEY === 'your_public_key_here') {
    throw new Error('PUBLIC_KEY belum dikonfigurasi. Silakan cek file .env atau email-config.ts');
  }
  
  return true;
};

// Fungsi untuk mengirim email OTP menggunakan EmailJS
export async function sendEmailWithOTP(email: string, otp: string, subject: string = 'Kode Verifikasi UMKMotion') {
  try {
    // Validasi konfigurasi terlebih dahulu
    validateEmailJSConfig();

    // Import EmailJS secara dinamis untuk menghindari SSR issues
    const emailjs = await import('@emailjs/browser');
    
    console.log('📧 Mengirim email ke:', email);
    console.log('📋 Template params:', { to_email: email, otp_code: otp, subject });
    
    const templateParams = {
      to_email: email,
      otp_code: otp,
      subject: subject,
      expiry_time: '10 menit',
      app_name: 'UMKMotion',
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('✅ Email berhasil dikirim:', response);
    return response;
  } catch (error) {
    console.error('❌ Gagal mengirim email:', error);
    console.error('📋 Config:', {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID,
      publicKey: EMAILJS_CONFIG.PUBLIC_KEY ? '✅ Set' : '❌ Not set'
    });
    throw new Error(`Gagal mengirim email OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}