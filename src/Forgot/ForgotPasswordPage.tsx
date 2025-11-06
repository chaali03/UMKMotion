"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const carouselItems = [
  { src: "/asset/optimized/umkm/umkm1.webp", title: "Kuliner Nusantara" },
  { src: "/asset/optimized/umkm/umkm2.webp", title: "Fashion Lokal" },
  { src: "/asset/optimized/umkm/umkm3.webp", title: "Kerajinan Tangan" },
  { src: "/asset/optimized/umkm/umkm4.webp", title: "Produk Digital" },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  // Carousel auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
  };

  const handleBackToLogin = () => {
    window.location.href = "/login";
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="forgot-password-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .forgot-password-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, #ff7a1a 0%, #ff7a1a 45%, #ff9440 50%, #5a9cf7 50%, #3b82f6 55%, #3b82f6 100%);
        }

        /* Back to Home Button */
        .back-to-home {
          position: fixed;
          top: 2rem;
          left: 2rem;
          z-index: 100;
          padding: 0.75rem 1.25rem;
          background: rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 12px;
          color: #0f172a;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: none;
        }

        .back-to-home:hover {
          background: rgba(0, 0, 0, 0.12);
        }

        .back-to-home:active {
          transform: scale(0.98);
        }

        .back-to-home svg {
          width: 18px;
          height: 18px;
        }

        .back-text {
          display: inline;
        }

        /* Card */
        .forgot-password-card {
          position: relative;
          z-index: 10;
          width: 90%;
          max-width: 900px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        /* Image section */
        .image-section {
          position: relative;
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }

        .carousel-wrapper {
          position: relative;
          flex: 1;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.2),
            0 25px 70px rgba(0, 0, 0, 0.4);
          z-index: 2;
          transition: transform 0.2s ease;
        }

        .carousel-wrapper:hover {
          transform: scale(1.01);
        }

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          z-index: 3;
        }

        .carousel-dots {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 1.5rem;
          z-index: 2;
          position: relative;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          transition: all 0.2s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .dot:hover {
          background: rgba(255, 255, 255, 0.6);
        }

        .dot.active {
          width: 32px;
          border-radius: 6px;
          background: white;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.4);
        }

        /* Form section */
        .form-section {
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          background: white;
        }

        .form-section::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 122, 26, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .form-content {
          position: relative;
          z-index: 1;
        }

        .logo-badge {
          width: 100px;
          height: 100px;
          margin-bottom: 1.5rem;
          padding: 0;
          background: transparent;
          border-radius: 24px;
          transition: transform 0.2s ease;
          cursor: pointer;
        }

        .logo-badge:hover {
          transform: scale(1.03);
        }

        .logo-badge img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: 0.9;
        }

        .form-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #1a1a1a 0%, #ff7a1a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .form-subtitle {
          font-size: 0.9375rem;
          color: #64748b;
          margin-bottom: 2rem;
          font-weight: 400;
          line-height: 1.6;
        }

        /* Success message */
        .success-message {
          text-align: center;
          padding: 2rem 0;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }

        .success-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .success-text {
          font-size: 0.9375rem;
          color: #64748b;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .success-email {
          font-weight: 600;
          color: #ff7a1a;
        }

        /* Form elements */
        .form-element {
          width: 100%;
        }

        /* Input styles */
        .input-group {
          margin-bottom: 1.5rem;
        }

        .input-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.5rem;
          letter-spacing: 0.01em;
          transition: color 0.2s ease;
        }

        .input-group:focus-within .input-label {
          color: #ff7a1a;
        }

        .input-wrapper {
          position: relative;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          transition: color 0.2s ease;
          pointer-events: none;
          z-index: 2;
        }
        
        .input-icon svg {
          width: 18px;
          height: 18px;
          stroke-width: 2;
        }

        .input-wrapper:focus-within .input-icon {
          color: #ff7a1a;
        }

        .input-field {
          width: 100%;
          height: 44px;
          padding: 0 14px 0 44px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 400;
          line-height: 1.5;
          color: #1e293b;
          background-color: #ffffff;
          transition: all 0.2s ease;
          box-sizing: border-box;
          outline: none;
        }

        .input-field::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .input-field:hover:not(:focus) {
          border-color: #cbd5e1;
        }

        .input-field:focus {
          border-color: #ff7a1a;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(255, 122, 26, 0.08);
        }

        .input-field:focus::placeholder {
          color: #cbd5e1;
        }

        /* Button styles */
        .btn-primary {
          width: 100%;
          height: 44px;
          padding: 0;
          background: #ff7a1a;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .btn-primary:hover:not(:disabled) {
          background: #f97316;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(1px);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          width: 100%;
          height: 44px;
          padding: 0;
          background: white;
          color: #334155;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .btn-secondary:active {
          transform: translateY(1px);
        }

        /* Disable hover/active effects helper */
        .no-hover:hover,
        .no-hover:active,
        .no-hover:focus {
          background: inherit !important;
          border-color: inherit !important;
          box-shadow: none !important;
          transform: none !important;
        }

        /* Links */
        .back-to-login {
          text-align: center;
          margin-top: 1.75rem;
          font-size: 0.9375rem;
          color: #64748b;
          line-height: 1.5;
        }

        .back-to-login-link {
          color: #ff7a1a;
          font-weight: 700;
          text-decoration: none;
          transition: none;
          position: static;
          padding-bottom: 0;
        }

        .back-to-login-link::after { display: none; }

        .back-to-login-link:hover { color: #ff7a1a; }

        .back-to-login-link:hover::after { transform: none; }

        /* Resend link: simple underline on hover */
        .resend-link {
          color: #ff7a1a;
          font-weight: 700;
          text-decoration: none;
          transition: text-decoration-color 0.15s ease;
          text-underline-offset: 2px;
        }
        .resend-link:hover {
          text-decoration: underline;
        }

        /* Loading spinner */
        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .forgot-password-card {
            grid-template-columns: 1fr;
            max-width: 480px;
          }

          .image-section {
            display: none;
          }

          .form-section {
            padding: 2.5rem 2rem;
          }

          .back-to-home {
            top: 1.5rem;
            left: 1.5rem;
          }
        }

        @media (max-width: 640px) {
          .forgot-password-card {
            width: 95%;
          }

          .form-section {
            padding: 2rem 1.5rem;
          }

          .form-title {
            font-size: 1.75rem;
          }

          .form-subtitle {
            font-size: 0.875rem;
          }

          .logo-badge {
            width: 85px;
            height: 85px;
          }

          .input-field,
          .btn-primary,
          .btn-secondary {
            height: 42px;
            font-size: 0.875rem;
          }

          .back-to-home {
            top: 1rem;
            left: 1rem;
            padding: 0.625rem 1rem;
            font-size: 0.8125rem;
          }

          .back-to-home svg {
            width: 16px;
            height: 16px;
          }

          .back-text {
            display: none;
          }

          .success-icon {
            width: 70px;
            height: 70px;
          }

          .success-title {
            font-size: 1.375rem;
          }

          .success-text {
            font-size: 0.875rem;
          }

          .back-to-login {
            font-size: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .form-section {
            padding: 1.5rem 1rem;
          }

          .logo-badge {
            width: 75px;
            height: 75px;
          }

          .form-title {
            font-size: 1.5rem;
          }
        }

        /* Focus visible for accessibility */
        *:focus-visible {
          outline: 2px solid #ff7a1a;
          outline-offset: 2px;
        }

        .input-field:focus-visible,
        .btn-primary:focus-visible,
        .btn-secondary:focus-visible {
          outline: none;
        }

        button:focus-visible {
          outline: 2px solid #ff7a1a;
          outline-offset: 2px;
        }
      `}</style>

      {/* Back to Home Button */}
      <motion.button
        className="back-to-home"
        onClick={handleBackToHome}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        aria-label="Kembali ke halaman utama"
      >
        <ArrowLeft />
        <span className="back-text">Kembali</span>
      </motion.button>

      {/* Main card */}
      <motion.div
        className="forgot-password-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Left: Image carousel */}
        <div className="image-section">
          <motion.div
            className="carousel-wrapper"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7 }}
                style={{ width: '100%', height: '100%', position: 'relative' }}
              >
                <img
                  src={carouselItems[currentImageIndex].src}
                  alt={carouselItems[currentImageIndex].title}
                  className="carousel-image"
                />
                <div className="image-overlay">
                  {carouselItems[currentImageIndex].title}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="carousel-dots">
            {carouselItems.map((_, index) => (
              <div
                key={index}
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
                role="button"
                aria-label={`Slide ${index + 1}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setCurrentImageIndex(index);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="form-section">
          <motion.div
            className="form-content"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {!isSuccess ? (
              <>
                <div className="logo-badge">
                  <img src="/logo.png" alt="Logo UMKM Connect" />
                </div>

                <h1 className="form-title">
                  Lupa Password?
                </h1>
                <p className="form-subtitle">
                  Masukkan email Anda dan kami akan mengirimkan link untuk mereset password Anda
                </p>

                <form onSubmit={handleSubmit} className="form-element">
                  {/* Email Input */}
                  <div className="input-group">
                    <label htmlFor="email" className="input-label">
                      Alamat Email
                    </label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        id="email"
                        className="input-field"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        required
                        autoComplete="email"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="btn-primary"
                    aria-label="Kirim permintaan reset password"
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight size={18} strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </form>

                {/* Back to Login Link */}
                <p className="back-to-login">
                  Ingat password Anda?{' '}
                  <a
                    href="/login"
                    className="back-to-login-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleBackToLogin();
                    }}
                  >
                    Kembali ke Login
                  </a>
                </p>
              </>
            ) : (
              <motion.div
                className="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="success-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.2 
                  }}
                >
                  <CheckCircle size={40} strokeWidth={2.5} />
                </motion.div>

                <h2 className="success-title">
                  Email Terkirim!
                </h2>
                <p className="success-text">
                  Kami telah mengirimkan link reset password ke{' '}
                  <span className="success-email">{email}</span>
                  <br />
                  Silakan cek inbox atau folder spam Anda.
                </p>

                <button 
                  type="button" 
                  className="btn-secondary no-hover"
                  onClick={handleBackToLogin}
                  aria-label="Kembali ke halaman login"
                >
                  <ArrowLeft size={18} strokeWidth={2.5} />
                  Kembali ke Login
                </button>

                <p className="back-to-login" style={{ marginTop: '1rem' }}>
                  Tidak menerima email?{' '}
                  <a 
                    href="#" 
                    className="resend-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSuccess(false);
                      setEmail('');
                    }}
                  >
                    Kirim ulang
                  </a>
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}