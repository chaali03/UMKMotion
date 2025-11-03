"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleGoogleSignup = () => {
    console.log("Google signup");
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="register-page">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .register-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #e8e4dc 0%, #ff7a1a 50%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        }

        .register-container {
          width: 90%;
          max-width: 1100px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
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

        /* Left Side - Form */
        .form-side {
          padding: 4rem 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(135deg, #f5f3f0 100%);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 3rem;
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

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-title {
          font-size: 2.25rem;
          font-weight: 400;
          color: #1a1a1a;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .form-subtitle {
          font-size: 0.9375rem;
          color: #6b6b6b;
          line-height: 1.6;
          max-width: 380px;
        }

        .input-group {
          margin-bottom: 1.25rem;
          position: relative;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #9b9b9b;
          pointer-events: none;
        }

        .input-icon svg {
          width: 20px;
          height: 20px;
        }

        .input-field {
          width: 100%;
          height: 52px;
          padding: 0 1rem 0 3rem;
          background: white;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          font-size: 0.9375rem;
          color: #1a1a1a;
          transition: all 0.2s ease;
          outline: none;
        }

        .input-field::placeholder {
          color: #9b9b9b;
        }

        .input-field:focus {
          border-color: #1a1a1a;
          background: white;
        }

        .input-field.has-toggle {
          padding-right: 3rem;
        }

        .toggle-password {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #9b9b9b;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .toggle-password:hover {
          color: #1a1a1a;
        }

        .toggle-password svg {
          width: 20px;
          height: 20px;
        }

        .btn-signup {
          width: 100%;
          height: 52px;
          background: #1a1a1a;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-signup:hover {
          background: #2d2d2d;
          transform: translateY(-1px);
        }

        .btn-signup:active {
          transform: translateY(0);
        }

        .btn-signup:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 1.75rem 0;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e0e0e0;
        }

        .btn-google {
          width: 100%;
          height: 52px;
          background: white;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #1a1a1a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s ease;
        }

        .btn-google:hover {
          border-color: #c0c0c0;
          background: #fafafa;
        }

        .login-text {
          text-align: center;
          margin-top: 1.75rem;
          font-size: 0.9375rem;
          color: #6b6b6b;
        }

        .login-link {
          color: #1a1a1a;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .login-link:hover {
          opacity: 0.7;
        }

        /* Right Side - Image */
        .image-side {
          position: relative;
          background: linear-gradient(135deg, #d4d0c8 0%, #e8e4dc 100%);
          overflow: hidden;
        }

        .statue-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .image-overlay {
          position: absolute;
          bottom: 2rem;
          left: 2rem;
          right: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .marquee-text {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          animation: marquee 15s linear infinite;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .spinner {
          width: 20px;
          height: 20px;
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
          .register-container {
            grid-template-columns: 1fr;
            max-width: 480px;
          }

          .image-side {
            display: none;
          }

          .form-side {
            padding: 3rem 2rem;
          }
        }

        @media (max-width: 640px) {
          .form-side {
            padding: 2rem 1.5rem;
          }

          .form-title {
            font-size: 2rem;
          }

          .input-field,
          .btn-signup,
          .btn-google {
            height: 48px;
          }
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

      <motion.div
        className="register-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Side - Form */}
        <div className="form-side">
            <div className="logo-badge">
              <img src="/logo.png" alt="Logo" />
            </div>

          <div className="form-header">
            <h1 className="form-title">Selamat Datang di UMKMotion</h1>
            <p className="form-subtitle">
              Masuk untuk melanjutkan perjalanan bisnis Anda
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="input-group">
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </div>
                <input
                  type="email"
                  className="input-field"
                  placeholder="hi@polarastudio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field has-toggle"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-signup"
              disabled={isLoading}
            >
              {isLoading ? <div className="spinner" /> : 'Sign Up'}
            </button>
          </form>

          <div className="divider"></div>

          {/* Google Signup */}
          <button 
            type="button" 
            className="btn-google"
            onClick={handleGoogleSignup}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          {/* Login Link */}
          <p className="login-text">
            Belum punya akun?{' '}
            <a href="/register" className="login-link">Register Sekarang!</a>
          </p>
        </div>

        {/* Right Side - Image */}
        <div className="image-side">
          <img 
            src="/asset/umkm/umkm1.png"
            alt="Justice Statue" 
            className="statue-image"
          />
          <div className="image-overlay">
            <div className="marquee-text">
              Shining beacon the planet's light • Shining beacon the planet's light • Shining beacon the planet's light •
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}