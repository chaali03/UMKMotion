"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, MapPin, BarChart3, Megaphone } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const slides = [
    {
      icon: <MapPin size={26} />,
      title: "UMKM Digital",
      text: "Dorong pertumbuhan usahamu dengan peta sebaran, promosi, dan analitik real‑time.",
    },
    {
      icon: <BarChart3 size={26} />,
      title: "Analitik Cerdas",
      text: "Pantau performa penjualan, tren pelanggan, dan insight lokasi untuk keputusan lebih tepat.",
    },
    {
      icon: <Megaphone size={26} />,
      title: "Kampanye Efektif",
      text: "Jangkau audiens yang tepat dengan promosi terukur dan notifikasi lokasi terdekat.",
    },
  ];

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, 3500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const navigateWithExit = (href: string) => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => {
      window.location.href = href;
    }, 350);
  };

  return (
    <div className="container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 25%, #fed7aa 50%, #fdba74 75%, #fb923c 100%);
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Animated Background Gradient */
        .bg-animated {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            #fff7ed 0%,
            #ffedd5 25%,
            #fed7aa 50%,
            #fdba74 75%,
            #fb923c 100%
          );
          background-size: 400% 400%;
          animation: gradientFlow 15s ease infinite;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Floating Shapes */
        .shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          filter: blur(40px);
        }

        .shape-1 {
          width: 500px;
          height: 500px;
          background: #fff;
          top: -250px;
          right: -250px;
          animation: float1 20s ease-in-out infinite;
        }

        .shape-2 {
          width: 400px;
          height: 400px;
          background: #fff;
          bottom: -200px;
          left: -200px;
          animation: float2 18s ease-in-out infinite;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-50px, 50px) rotate(180deg); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(50px, -50px) rotate(-180deg); }
        }

        /* Back Button */
        .back-btn {
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
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .back-btn:hover {
          background: rgba(0, 0, 0, 0.12);
          transform: translateX(-4px);
        }

        .back-btn svg {
          width: 18px;
          height: 18px;
        }

        /* Main Card */
        .card {
          position: relative;
          z-index: 10;
          width: 90%;
          max-width: 900px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1);
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
          position: relative;
          overflow: hidden;
        }

        .brand-side::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          top: -150px;
          right: -150px;
        }

        .brand-side::after {
          content: '';
          position: absolute;
          width: 250px;
          height: 250px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          bottom: -125px;
          left: -125px;
        }

        .logo-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          position: relative;
          z-index: 2;
        }

        .logo-wrapper img {
          width: 48px;
          height: 48px;
        }

        .brand-title {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          position: relative;
          z-index: 2;
        }

        .brand-text {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          max-width: 300px;
          position: relative;
          z-index: 2;
        }

        .decorative-dots {
          position: absolute;
          bottom: 2rem;
          display: flex;
          gap: 0.5rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
        }

        .dot.active {
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

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.12), rgba(249, 115, 22, 0.12));
          border: 1px solid rgba(249, 115, 22, 0.25);
          border-radius: 50px;
          color: #f97316;
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .welcome-badge svg {
          width: 14px;
          height: 14px;
        }

        .form-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .form-subtitle {
          font-size: 0.9375rem;
          color: #64748b;
        }

        /* Input Styles */
        .input-group {
          margin-bottom: 1.25rem;
        }

        .input-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
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
          color: #94a3b8;
          transition: color 0.2s ease;
        }

        .input-icon svg {
          width: 20px;
          height: 20px;
        }

        .input-wrapper:focus-within .input-icon {
          color: #f97316;
        }

        .input-field {
          width: 100%;
          height: 48px;
          padding: 0 1rem 0 3rem;
          background: #f8fafc;
          border: 2px solid transparent;
          border-radius: 12px;
          font-size: 0.9375rem;
          color: #1e293b;
          transition: all 0.2s ease;
          outline: none;
        }

        .input-field::placeholder {
          color: #94a3b8;
        }

        .input-field:focus {
          background: white;
          border-color: #f97316;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
        }

        .toggle-password {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          transition: color 0.2s ease;
        }

        .toggle-password:hover {
          color: #f97316;
        }

        .toggle-password svg {
          width: 20px;
          height: 20px;
        }

        .forgot-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .forgot-link {
          font-size: 0.875rem;
          color: #f97316;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #c2410c;
        }

        /* Button */
        .btn {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          font-size: 0.9375rem;
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
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          color: white;
          margin-top: 1rem;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          color: #94a3b8;
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .btn-google {
          background: white;
          color: #334155;
          border: 2px solid #e2e8f0;
        }

        .btn-google:hover {
          background: #f8fafc;
          border-color: #cbd5e0;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .footer-text {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9375rem;
          color: #64748b;
        }

        .footer-text a {
          color: #f97316;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-text a:hover {
          color: #c2410c;
        }

        /* Link-style button for footer actions */
        .link-btn {
          background: none;
          border: none;
          padding: 0;
          color: #2563eb;
          font-weight: 700;
          cursor: pointer;
        }
        .link-btn:hover { color: #1d4ed8; }

        /* Mobile Hero (hidden on desktop) */
        .mobile-hero { display: none; }

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
          .card {
            grid-template-columns: 1fr;
            max-width: 450px;
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
            height: 160px;
            margin-bottom: 1rem;
            border-radius: 16px;
            overflow: hidden;
            background: #f1f5f9;
          }
          .mobile-hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
        }

        @media (max-width: 640px) {
          .card {
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
            top: 1rem;
            left: 1rem;
            padding: 0.625rem 1rem;
          }

          .back-btn span {
            display: none;
          }
        }
      `}</style>

      {/* Background */}
      <div className="bg-animated" />
      <div className="shape shape-1" />
      <div className="shape shape-2" />

      {/* Back Button */}
      <motion.button
        className="back-btn"
        onClick={() => window.location.href = "/"}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Kembali</span>
      </motion.button>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        {!leaving && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, x: -40, scale: 0.92, transition: { duration: 0.3 } }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Left - Brand with animated slides */}
            <div
              className="brand-side"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Hide brand content when leaving to avoid logo flashing */}
              {!leaving && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slideIndex}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-3 text-white/90">{slides[slideIndex].icon}</div>
                    <h1 className="brand-title">{slides[slideIndex].title}</h1>
                    <p className="brand-text">{slides[slideIndex].text}</p>
                  </motion.div>
                </AnimatePresence>
              )}

              <div className="decorative-dots">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className={"dot" + (i === slideIndex ? " active" : "")}
                    onClick={() => setSlideIndex(i)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </div>
            </div>

            {/* Right - Form */}
            <div className="form-side">
              <div className="form-header">
                {/* Mobile only hero image/banner (hidden on exit) */}
                {!leaving && (
                  <div className="mobile-hero">
                    <img src="/asset/login/login.webp" alt="Login hero" />
                  </div>
                )}
                <motion.div
                  className="welcome-badge"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Sparkles />
                  <span>Selamat Datang Kembali</span>
                </motion.div>
                <h2 className="form-title">Masuk ke Akunmu</h2>
                <p className="form-subtitle">Ayo mulai produktif. Login untuk mengelola usaha kamu.</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="input-group">
                  <label htmlFor="email" className="input-label">
                    Email
                  </label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      className="input-field"
                      placeholder="contoh@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="input-group">
                  <div className="forgot-row">
                    <label htmlFor="password" className="input-label">
                      Password
                    </label>
                    <a href="#forgot" className="forgot-link">
                      Lupa kata sandi?
                    </a>
                  </div>
                  <div className="input-wrapper">
                    <Lock className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="input-field"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="spinner" />
                  ) : (
                    <>
                      Masuk
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="divider">
                  <span>atau</span>
                </div>

                {/* Google */}
                <motion.button
                  type="button"
                  className="btn btn-google"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Masuk dengan Google
                </motion.button>
              </form>

              {/* Footer */}
              <p className="footer-text">
                Belum punya akun? {" "}
                <button type="button" onClick={() => navigateWithExit("/register")} className="link-btn">
                  Daftar sekarang
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}