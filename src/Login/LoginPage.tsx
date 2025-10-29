"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Home } from "lucide-react";

const carouselItems = [
  { src: "/asset/umkm/umkm1.png", title: "Kuliner Nusantara" },
  { src: "/asset/umkm/umkm2.jpg", title: "Fashion Lokal" },
  { src: "/asset/umkm/umkm3.jpeg", title: "Kerajinan Tangan" },
  { src: "/asset/umkm/umkm4.jpeg", title: "Produk Digital" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isHoveringRegister, setIsHoveringRegister] = useState(false);

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
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #FF6914;
        }

        /* Back to Home Button */
        .back-to-home {
          position: fixed;
          top: 2rem;
          left: 2rem;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          color: #334155;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .back-to-home:hover {
          transform: translateX(-4px);
          background: rgba(255, 255, 255, 1);
          border-color: #ff7a1a;
          color: #ff7a1a;
          box-shadow: 
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .back-to-home:active {
          transform: translateX(-2px);
        }

        .back-to-home svg {
          width: 18px;
          height: 18px;
          stroke-width: 2.5;
          transition: transform 0.3s ease;
        }

        .back-to-home:hover svg {
          transform: translateX(-2px);
        }

        .back-text {
          display: inline;
        }

        /* Enhanced Grid pattern */
        .grid-pattern {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
          background-size: 100% 100%, 100% 100%, 20px 20px;
          z-index: 0;
        }

        /* Enhanced Card */
        .login-card {
          position: relative;
          z-index: 10;
          width: 90%;
          max-width: 1100px;
          display: grid;
          grid-template-columns: 45% 55%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(30px);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.6),
            0 20px 60px rgba(0, 0, 0, 0.1),
            0 40px 100px rgba(0, 0, 0, 0.05);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .login-card:hover {
          transform: translateY(-10px);
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.8),
            0 30px 80px rgba(0, 0, 0, 0.15),
            0 50px 120px rgba(0, 0, 0, 0.08);
        }

        /* Enhanced Image section */
        .image-section {
          position: relative;
          background: #ff8a3d;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }

        .image-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 1;
          animation: patternMove 30s linear infinite;
        }

        @keyframes patternMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        .image-section::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          bottom: -100px;
          right: -100px;
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
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
          transition: transform 0.3s ease;
        }

        .carousel-wrapper:hover {
          transform: scale(1.02);
        }

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.4);
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
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: 2px solid transparent;
        }

        .dot:hover {
          background: rgba(255, 255, 255, 0.6);
          transform: scale(1.2);
        }

        .dot.active {
          width: 32px;
          border-radius: 6px;
          background: white;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.4);
        }

        /* Enhanced Form section */
        .form-section {
          padding: 3rem 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
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

        .logo-badge {
          width: 100px;
          height: 100px;
          margin-bottom: 1.5rem;
          padding: 0;
          background: transparent;
          border-radius: 24px;
          transition: all 0.3s ease;
        }

        .logo-badge:hover {
          transform: scale(1.05) rotate(2deg);
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
        }

        .form-subtitle {
          font-size: 0.9375rem;
          color: #64748b;
          margin-bottom: 2rem;
          font-weight: 400;
          line-height: 1.5;
        }

        /* PRECISION INPUT STYLES */
        .input-group {
          margin-bottom: 1.125rem;
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
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
          transform: translateY(-50%) scale(1.05);
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
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
          outline: none;
        }

        .input-field::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .input-field:hover:not(:focus) {
          border-color: #cbd5e1;
          background-color: #f8fafc;
        }

        .input-field:focus {
          border-color: #ff7a1a;
          background-color: #ffffff;
          box-shadow: 
            0 0 0 3px rgba(255, 122, 26, 0.08),
            0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
        }

        .input-field:focus::placeholder {
          color: #cbd5e1;
        }

        .input-field.has-toggle {
          padding-right: 48px;
        }

        .toggle-password {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          color: #94a3b8;
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: color 0.2s ease, background-color 0.2s ease;
          z-index: 3;
        }
        
        .toggle-password svg {
          width: 18px;
          height: 18px;
          stroke-width: 2;
          display: block;
        }

        .toggle-password:hover {
          color: #ff7a1a;
          background: rgba(255, 122, 26, 0.08);
        }

        .toggle-password:active {
          background: rgba(255, 122, 26, 0.12);
        }

        .toggle-password:focus {
          outline: 2px solid #ff7a1a;
          outline-offset: 2px;
        }

        .toggle-password:focus-visible {
          outline: 2px solid #ff7a1a;
          outline-offset: 2px;
        }

        .password-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .forgot-link {
          font-size: 0.8125rem;
          color: #ff7a1a;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
          position: relative;
          padding-bottom: 2px;
        }

        .forgot-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #ff7a1a;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .forgot-link:hover {
          color: #ff4d00;
        }

        .forgot-link:hover::after {
          width: 100%;
        }

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
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 
            0 1px 2px 0 rgba(0, 0, 0, 0.05),
            0 0 0 1px rgba(255, 122, 26, 0.1);
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transition: left 0.6s ease;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 
            0 4px 12px rgba(255, 122, 26, 0.25),
            0 0 0 1px rgba(255, 122, 26, 0.1);
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
          margin: 1.75rem 0;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .btn-google {
          width: 100%;
          height: 44px;
          padding: 0;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          position: relative;
          overflow: hidden;
        }

        .btn-google::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 100%;
          background: rgba(66, 133, 244, 0.04);
          transition: width 0.4s ease;
        }

        .btn-google:hover::before {
          width: 100%;
        }

        .btn-google:hover {
          border-color: #cbd5e1;
          background-color: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .btn-google:active {
          transform: translateY(0);
        }

        .register-text {
          text-align: center;
          margin-top: 1.75rem;
          font-size: 0.9375rem;
          color: #64748b;
          line-height: 1.5;
        }

        .register-link {
          color: #ff7a1a;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          padding-bottom: 2px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .register-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1.5px;
          background: #ff7a1a;
          transform: scaleX(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .register-link:hover {
          color: #ff4d00;
        }

        .register-link:hover::after {
          transform: scaleX(1);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .login-card {
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
          .form-section {
            padding: 2rem 1.5rem;
          }

          .form-title {
            font-size: 1.75rem;
          }

          .logo-badge {
            width: 85px;
            height: 85px;
          }

          .input-field,
          .btn-primary,
          .btn-google {
            height: 42px;
          }

          .toggle-password {
            width: 34px;
            height: 34px;
          }

          .back-to-home {
            top: 1rem;
            left: 1rem;
            padding: 0.625rem 1rem;
            font-size: 0.875rem;
          }

          .back-to-home svg {
            width: 16px;
            height: 16px;
          }

          .back-text {
            display: none;
          }
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

        /* Focus visible for accessibility */
        *:focus-visible {
          outline: 2px solid #ff7a1a;
          outline-offset: 2px;
        }

        .input-field:focus-visible {
          outline: none;
        }
      `}</style>

      {/* Back to Home Button */}
      <motion.button
        className="back-to-home"
        onClick={handleBackToHome}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft />
        <span className="back-text">Kembali ke Beranda</span>
      </motion.button>

      {/* Background elements */}
      <div className="grid-pattern" />
      <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-50" />

      {/* Main card */}
      <motion.div
        className="login-card"
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
              <motion.div
                key={index}
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="form-section">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.div
              className="logo-badge"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src="/logo.png" alt="Logo" />
            </motion.div>

            <h2 className="form-title">
              Selamat Datang Kembali
            </h2>
            <p className="form-subtitle">
              Masuk untuk melanjutkan perjalanan bisnis Anda
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  Alamat Email
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <motion.input
                    type="email"
                    id="email"
                    className="input-field"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    required
                    whileFocus={{ scale: 1.001 }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="input-group">
                <div className="password-row">
                  <label htmlFor="password" className="input-label">
                    Kata Sandi
                  </label>
                  <a href="#forgot" className="forgot-link">
                    Lupa password?
                  </a>
                </div>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="input-field has-toggle"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    whileFocus={{ scale: 1.001 }}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary"
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                {isLoading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    Masuk
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="divider">
              <span>ATAU</span>
            </div>

            {/* Google Login */}
            <motion.button 
              type="button" 
              className="btn-google"
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </motion.button>

            {/* Register Link with Animated Arrow */}
            <p className="register-text">
              Belum punya akun?{' '}
              <motion.a 
                href="/register" 
                className="register-link"
                onMouseEnter={() => setIsHoveringRegister(true)}
                onMouseLeave={() => setIsHoveringRegister(false)}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/register';
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0.9 }}
                animate={{ 
                  opacity: 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  initial={{ x: 0 }}
                  animate={{ 
                    x: isHoveringRegister ? 2 : 0,
                  }}
                  transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 20 
                  }}
                >
                  Daftar sekarang
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ 
                    opacity: isHoveringRegister ? 1 : 0,
                    x: isHoveringRegister ? 0 : -5,
                  }}
                  transition={{ 
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                  style={{ 
                    display: 'inline-block',
                    marginLeft: isHoveringRegister ? '2px' : '0px'
                  }}
                >
                  <ArrowRight size={16} strokeWidth={2.5} />
                </motion.span>
              </motion.a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}