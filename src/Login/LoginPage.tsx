"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, MapPin, BarChart3, Megaphone, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { signInWithEmail, signInWithGoogle } from "../lib/auth";
// removed auth state redirect to avoid auto-refresh loop

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  const slides = [
    {
      icon: <MapPin size={40} color="#fff" />,
      title: "Peta UMKM Digital",
      text: "Jelajahi ribuan UMKM di sekitarmu dan temukan peluang bisnis baru dengan peta interaktif.",
    },
    {
      icon: <BarChart3 size={40} color="#fff" />,
      title: "Analitik Real-time",
      text: "Pantau performa bisnis, tren penjualan, dan insight pelanggan untuk keputusan lebih cerdas.",
    },
    {
      icon: <Megaphone size={40} color="#fff" />,
      title: "Promosi Efektif",
      text: "Jangkau target audiens yang tepat dengan kampanye terukur dan notifikasi lokasi.",
    },
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

  // Redirect handled explicitly after successful login only

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

    // Validation
    if (!email) {
      setErrors({ email: "Email harus diisi" });
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: "Format email tidak valid" });
      return;
    }
    if (!password) {
      setErrors({ password: "Password harus diisi" });
      return;
    }
    if (password.length < 6) {
      setErrors({ password: "Password minimal 6 karakter" });
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      showNotification("success", "Login Berhasil!", "Mengalihkan ke Homepage...");
      // Set simple auth cookie for SSR guard (non-HTTP-only fallback)
      try {
        document.cookie = `auth=1; Path=/; Max-Age=${60 * 60 * 24 * 7}`; // 7 days
      } catch {}
      setTimeout(() => {
        window.location.href = "/homepage";
      }, 1500);
    } catch (err: any) {
      let errorMessage = "Login gagal. Periksa email/password dan coba lagi.";
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = "Email tidak terdaftar. Silakan daftar terlebih dahulu.";
        setErrors({ email: errorMessage });
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = "Password salah. Silakan coba lagi.";
        setErrors({ password: errorMessage });
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Format email tidak valid.";
        setErrors({ email: errorMessage });
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Terlalu banyak percobaan login. Coba lagi nanti.";
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = "Email atau password salah.";
      }
      
      showNotification("error", "Login Gagal", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      showNotification("success", "Login Berhasil!", "Mengalihkan ke Homepage...");
      // Set simple auth cookie for SSR guard (non-HTTP-only fallback)
      try {
        document.cookie = `auth=1; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
      } catch {}
      setTimeout(() => {
        window.location.href = "/homepage";
      }, 1500);
    } catch (err: any) {
      let errorMessage = "Login Google gagal. Silakan coba lagi.";
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login dibatalkan. Silakan coba lagi.";
      }
      showNotification("error", "Login Google Gagal", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .login-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 25%, #fed7aa 50%, #fdba74 75%, #fb923c 100%);
          font-family: 'Inter', -apple-system, sans-serif;
          overflow: hidden;
        }

        /* Animated Background */
        .login-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.25) 0%, transparent 50%);
          /* disable background pulsing to avoid page movement */
          animation: none;
        }

        @keyframes bgPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* Floating shapes */
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.15);
          backdrop-filter: blur(20px);
        }

        .shape-1 { width: 300px; height: 300px; top: -150px; left: -150px; animation: none !important; }
        .shape-2 { width: 200px; height: 200px; bottom: -100px; right: -100px; animation: none !important; }
        .shape-3 { width: 150px; height: 150px; top: 50%; right: 10%; animation: none !important; }

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
          background: rgba(249, 115, 22, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.4);
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
          background: rgba(249, 115, 22, 0.35);
          transform: translateX(-4px);
        }

        /* Main Card */
        .login-card {
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

        .brand-side::before {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.18) 0%, transparent 70%);
          top: -200px;
          right: -200px;
        }

        .brand-content {
          position: relative;
          z-index: 2;
        }

        .brand-icon {
          margin-bottom: 2rem;
          opacity: 0.95;
        }

        .brand-title {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .brand-text {
          font-size: 1.05rem;
          line-height: 1.7;
          opacity: 0.95;
          max-width: 320px;
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
          background: rgba(249, 115, 22, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot.active {
          width: 24px;
          border-radius: 4px;
          background: #f97316;
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

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.12), rgba(249, 115, 22, 0.12));
          border-radius: 50px;
          color: #f97316;
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

        /* Input Styles */
        .input-group {
          margin-bottom: 1.5rem;
        }

        .input-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .input-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .forgot-link {
          font-size: 0.875rem;
          color: #f97316;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          color: #c2410c;
          text-decoration: underline;
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
          border-color: #f97316;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
        }

        .input-field:focus + .input-icon {
          color: #f97316;
        }

        .input-field.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .toggle-password {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .toggle-password:hover {
          color: #f97316;
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
          /* prevent hover shift */
          transform: none;
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          color: #9ca3af;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .btn-google {
          width: 100%;
          background: white;
          color: #374151;
          border: 2px solid #e5e7eb;
        }

        .btn-google:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .btn-google:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .footer-text {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .footer-text a {
          color: #f97316;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-text a:hover {
          color: #c2410c;
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

        /* Mobile Hero */
        .mobile-hero {
          display: none;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .login-card {
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
          .login-card {
            width: 95%;
            margin: 1rem;
          }

          .form-side {
            padding: 2rem 1.5rem;
          }

          .form-title {
            font-size: 1.75rem;
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
        className="login-card"
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
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIndex}
              className="brand-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="brand-icon">{slides[slideIndex].icon}</div>
              <h1 className="brand-title">{slides[slideIndex].title}</h1>
              <p className="brand-text">{slides[slideIndex].text}</p>
            </motion.div>
          </AnimatePresence>

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
          {/* Mobile Hero */}
          <div className="mobile-hero">
            <img src="/asset/login/login.webp" alt="Login illustration" />
          </div>

          <div className="form-header">
            <div className="welcome-badge">
              <Sparkles size={16} />
              <span>Selamat Datang Kembali</span>
            </div>
            <h2 className="form-title">Masuk ke Akun</h2>
            <p className="form-subtitle">Masukkan email dan password untuk mengakses Homepage Anda</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email
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

            {/* Password Input */}
            <div className="input-group">
              <div className="input-label-row">
                <label htmlFor="password" className="input-label">
                  Password
                </label>
                <a href="/forgotpassword" className="forgot-link">
                  Lupa password?
                </a>
              </div>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`input-field ${errors.password ? "error" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <motion.div
                  className="error-text"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={14} />
                  {errors.password}
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
                <div className="spinner" />
              ) : (
                <>
                  Masuk
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="divider">
              <span>atau</span>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              className="btn btn-google"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Masuk dengan Google
            </button>
          </form>

          {/* Footer */}
          <p className="footer-text">
            Belum punya akun?{" "}
            <a href="/register">Daftar di sini</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}