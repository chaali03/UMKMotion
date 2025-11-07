"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle, KeyRound, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { sendPasswordReset } from "../lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  // Slideshow images (from public/asset/optimized/umkm)
  const slides = [
    "/asset/optimized/umkm/umkm1.webp",
    "/asset/optimized/umkm/umkm2.webp",
    "/asset/optimized/umkm/umkm3.webp",
    "/asset/optimized/umkm/umkm4.webp",
    "/asset/optimized/umkm/umkm5.webp",
    "/asset/optimized/umkm/umkm6.webp",
  ];

  // Slideshow effect
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [paused, slides.length]);

  // Notification auto-dismiss
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  const showNotification = (type: "success" | "error" | "info", title: string, message: string) => {
    setNotification({ type, title, message });
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: "Email harus diisi" });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Format email tidak valid" });
      return;
    }

    setIsLoading(true);

    // Ensure the account is registered before sending reset link
    try {
      const resp = await fetch('/api/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.emailExists) {
        const msg = 'Email tidak terdaftar dalam sistem kami.';
        setErrors({ email: msg });
        showNotification('error', 'Email Tidak Terdaftar', msg);
        setIsLoading(false);
        return;
      }
    } catch {}

    try {
      await sendPasswordReset(email);
      setIsSuccess(true);
      showNotification(
        "success",
        "Email Terkirim!",
        `Link reset password telah dikirim ke ${email}`
      );
    } catch (err: any) {
      let errorMessage = "Gagal mengirim email reset. Silakan coba lagi.";
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = "Email tidak terdaftar dalam sistem kami.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Format email tidak valid.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Terlalu banyak permintaan. Coba lagi nanti.";
      }

      setErrors({ email: errorMessage });
      showNotification("error", "Gagal Mengirim", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setIsSuccess(false);
    setEmail("");
    setErrors({});
  };

  return (
    <div className="forgot-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .forgot-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: linear-gradient(90deg, #fb923c 0%, #fb923c 50%, #3b82f6 50%, #3b82f6 100%);
          font-family: 'Inter', -apple-system, sans-serif;
          overflow: hidden;
        }

        /* Animated Background */
        .forgot-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%);
          animation: bgPulse 8s ease-in-out infinite;
        }

        @keyframes bgPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* Floating shapes */
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
        }

        .shape-1 { width: 300px; height: 300px; top: -150px; left: -150px; animation: float1 20s infinite; }
        .shape-2 { width: 200px; height: 200px; bottom: -100px; right: -100px; animation: float2 15s infinite; }
        .shape-3 { width: 150px; height: 150px; top: 50%; right: 10%; animation: float3 18s infinite; }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(30px, -30px) rotate(180deg); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-30px, 30px) rotate(-180deg); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }

        /* Back Button */
        .back-btn {
          position: fixed;
          top: 2rem;
          left: 2rem;
          z-index: 100;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateX(-4px);
        }

        /* Main Card */
        .forgot-card {
          position: relative;
          z-index: 10;
          width: 90%;
          max-width: 950px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* Left Side - Brand */
        .brand-side {
          padding: 3rem;
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        /* Media (image) wrapper */
        .brand-media {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .brand-media::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 0%, transparent 40%),
                      linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15));
          pointer-events: none;
        }

        .brand-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(1.05) contrast(0.98);
        }

        .slide-dots {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
          z-index: 3;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot.active {
          width: 24px;
          border-radius: 4px;
          background: white;
        }

        /* Right Side - Form */
        .form-side {
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .reset-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          border-radius: 50px;
          color: #6366f1;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .form-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .form-subtitle {
          font-size: 0.95rem;
          color: #6b7280;
          line-height: 1.5;
        }

        /* Mobile Hero */
        .mobile-hero {
          display: none;
        }

        /* Input Styles */
        .input-group {
          margin-bottom: 1.5rem;
        }

        .input-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          transition: color 0.2s;
        }

        .input-field {
          width: 100%;
          height: 52px;
          padding: 0 1rem 0 3rem;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #111827;
          transition: all 0.2s ease;
          outline: none;
        }

        .input-field:focus {
          background: white;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .input-field:focus + .input-icon {
          color: #6366f1;
        }

        .input-field.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .error-text {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        /* Buttons */
        .btn {
          height: 52px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: none;
          outline: none;
        }

        .btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          color: white;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
          margin-top: 0.5rem;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          width: 100%;
          background: white;
          color: #374151;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Success State */
        .success-container {
          text-align: center;
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
          font-size: 1.75rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .success-text {
          font-size: 0.95rem;
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .success-email {
          font-weight: 700;
          color: #6366f1;
        }

        .footer-text {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .footer-text a {
          color: #6366f1;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-text a:hover {
          color: #4f46e5;
          text-decoration: underline;
        }

        /* Notification */
        .notification-wrapper {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 1000;
        }

        .notification {
          min-width: 320px;
          max-width: 400px;
          padding: 1rem 1.25rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border-left: 4px solid;
          display: flex;
          gap: 0.75rem;
        }

        .notification.success { border-left-color: #10b981; }
        .notification.error { border-left-color: #ef4444; }
        .notification.info { border-left-color: #3b82f6; }

        .notification-icon {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .notification-content h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .notification-content p {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.5;
        }

        /* Loading Spinner */
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .forgot-card {
            grid-template-columns: 1fr;
            max-width: 480px;
          }

          .brand-side {
            display: none;
          }

          .form-side {
            padding: 2.5rem 2rem;
          }

          .mobile-hero {
            display: block;
            width: 100%;
            height: 180px;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            overflow: hidden;
            background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-hero img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        @media (max-width: 640px) {
          .forgot-card {
            width: 95%;
            margin: 1rem;
          }

          .form-side {
            padding: 2rem 1.5rem;
          }

          .form-title {
            font-size: 1.75rem;
          }

          .success-title {
            font-size: 1.5rem;
          }

          .back-btn {
            padding: 0.625rem 1rem;
            top: 1rem;
            left: 1rem;
          }

          .back-btn span {
            display: none;
          }

          .notification-wrapper {
            left: 1rem;
            right: 1rem;
          }

          .notification {
            min-width: auto;
          }

          .mobile-hero {
            height: 160px;
          }

          .success-icon {
            width: 70px;
            height: 70px;
          }
        }
      `}</style>

      {/* Floating Shapes */}
      <div className="floating-shape shape-1" />
      <div className="floating-shape shape-2" />
      <div className="floating-shape shape-3" />

      {/* Back Button */}
      <motion.a
        href="/"
        className="back-btn"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft size={18} />
        <span>Kembali</span>
      </motion.a>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <div className="notification-wrapper">
            <motion.div
              className={`notification ${notification.type}`}
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <div className="notification-icon">
                {notification.type === "success" && <CheckCircle2 size={22} color="#10b981" />}
                {notification.type === "error" && <XCircle size={22} color="#ef4444" />}
                {notification.type === "info" && <AlertCircle size={22} color="#3b82f6" />}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Card */}
      <motion.div
        className="forgot-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Left Side - Brand */}
        <div
          className="brand-side"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="brand-media">
            <AnimatePresence mode="wait">
              <motion.img
                key={slides[slideIndex]}
                src={slides[slideIndex]}
                alt={`UMKM ${slideIndex + 1}`}
                className="brand-img"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </AnimatePresence>
          </div>

          <div className="slide-dots">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`dot ${i === slideIndex ? "active" : ""}`}
                onClick={() => setSlideIndex(i)}
              />
            ))}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="form-side">
          {/* Mobile Hero (UMKM slideshow) */}
          <div className="mobile-hero">
            <AnimatePresence mode="wait">
              <motion.img
                key={slides[slideIndex]}
                src={slides[slideIndex]}
                alt={`UMKM ${slideIndex + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </AnimatePresence>
          </div>

          {!isSuccess ? (
            <>
              <div className="form-header">
                <div className="reset-badge">
                  <KeyRound size={16} />
                  <span>Reset Password</span>
                </div>
                <h2 className="form-title">Lupa Password?</h2>
                <p className="form-subtitle">
                  Masukkan email Anda dan kami akan mengirimkan link untuk mereset password
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="input-group">
                  <label htmlFor="email" className="input-label">
                    Alamat Email
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <Mail size={20} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      className={`input-field ${errors.email ? "error" : ""}`}
                      placeholder="anda@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <motion.div
                      className="error-text"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle size={14} />
                      {errors.email}
                    </motion.div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      Kirim Link Reset
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="footer-text">
                Ingat password Anda?{" "}
                <a href="/login">Kembali ke Login</a>
              </p>
            </>
          ) : (
            <motion.div
              className="success-container"
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
                  delay: 0.2,
                }}
              >
                <CheckCircle size={40} />
              </motion.div>

              <h2 className="success-title">Email Terkirim!</h2>
              <p className="success-text">
                Link reset password telah dikirim ke{" "}
                <span className="success-email">{email}</span>
                <br />
                Silakan cek inbox atau folder spam Anda.
              </p>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => (window.location.href = "/login")}
              >
                <ArrowLeft size={18} />
                Kembali ke Login
              </button>

              <p className="footer-text">
                Tidak menerima email?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); handleResend(); }}>
                  Kirim ulang
                </a>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}