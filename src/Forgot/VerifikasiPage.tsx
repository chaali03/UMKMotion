"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, Mail } from "lucide-react";

const carouselItems = [
  { src: "/asset/optimized/umkm/umkm1.webp", title: "Kuliner Nusantara" },
  { src: "/asset/optimized/umkm/umkm2.webp", title: "Fashion Lokal" },
  { src: "/asset/optimized/umkm/umkm3.webp", title: "Kerajinan Tangan" },
  { src: "/asset/optimized/umkm/umkm4.webp", title: "Produk Digital" },
];

export default function VerificationPage() {
  const [codes, setCodes] = useState<string[]>(["", "", "", "", "", ""]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const email = "nama@email.com"; // Bisa diambil dari props/state/URL

  // Carousel auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0 && !canResend) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newCodes = pastedData.split("");
      setCodes(newCodes);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codes.join("");
    
    if (code.length !== 6) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setCodes(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    // Add resend logic here
  };

  const handleBackToLogin = () => {
    window.location.href = "/login";
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  const isCodeComplete = codes.every(code => code !== "");

  return (
    <div className="verification-container">
      <style>{`
        .verification-container {
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

        /* Grid pattern */
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

        /* Card */
        .verification-card {
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

        .verification-card:hover {
          transform: translateY(-10px);
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.8),
            0 30px 80px rgba(0, 0, 0, 0.15),
            0 50px 120px rgba(0, 0, 0, 0.08);
        }

        /* Image section */
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

        /* Form section */
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
          line-height: 1.6;
        }

        .email-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 122, 26, 0.1);
          border: 1px solid rgba(255, 122, 26, 0.2);
          border-radius: 8px;
          color: #ff7a1a;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        .email-badge svg {
          width: 16px;
          height: 16px;
        }

        /* OTP Input Container */
        .otp-container {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .otp-input {
          width: 56px;
          height: 56px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .otp-input:hover:not(:focus) {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .otp-input:focus {
          border-color: #ff7a1a;
          background: white;
          box-shadow: 
            0 0 0 3px rgba(255, 122, 26, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transform: scale(1.05);
        }

        .otp-input.filled {
          border-color: #ff7a1a;
          background: rgba(255, 122, 26, 0.05);
        }

        /* Timer and Resend */
        .timer-container {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .timer-text {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .timer-value {
          font-weight: 700;
          color: #ff7a1a;
        }

        .resend-button {
          background: none;
          border: none;
          color: #ff7a1a;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          transition: all 0.2s ease;
        }

        .resend-button:hover:not(:disabled) {
          color: #ff4d00;
        }

        .resend-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          text-decoration: none;
        }

        /* Success message */
        .success-message {
          text-align: center;
          padding: 2rem;
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
        }

        .success-text {
          font-size: 0.9375rem;
          color: #64748b;
          margin-bottom: 2rem;
          line-height: 1.6;
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
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

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
          transition: all 0.2s ease;
          position: relative;
          padding-bottom: 2px;
        }

        .back-to-login-link::after {
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

        .back-to-login-link:hover {
          color: #ff4d00;
        }

        .back-to-login-link:hover::after {
          transform: scaleX(1);
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
          .verification-card {
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

          .otp-container {
            gap: 0.5rem;
          }

          .otp-input {
            width: 48px;
            height: 48px;
            font-size: 1.25rem;
          }

          .btn-primary,
          .btn-secondary {
            height: 42px;
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

          .success-icon {
            width: 70px;
            height: 70px;
          }
        }

        @media (max-width: 380px) {
          .otp-input {
            width: 42px;
            height: 42px;
            font-size: 1.1rem;
          }
        }

        /* Focus visible */
        *:focus-visible {
          outline: 2px solid #ff7a1a;
          outline-offset: 2px;
        }

        .otp-input:focus-visible {
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

      {/* Main card */}
      <motion.div
        className="verification-card"
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
            {!isSuccess ? (
              <>
                <motion.div
                  className="logo-badge"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img src="/logo.webp" alt="Logo" />
                </motion.div>

                <h2 className="form-title">
                  Kode Verifikasi
                </h2>
                <p className="form-subtitle">
                  Kami telah mengirimkan kode verifikasi 6 digit ke email Anda
                </p>

                <div className="email-badge">
                  <Mail />
                  <span>{email}</span>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* OTP Input */}
                  <div className="otp-container">
                    {codes.map((code, index) => (
                      <motion.input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={code}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className={`otp-input ${code ? 'filled' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        whileFocus={{ scale: 1.05 }}
                      />
                    ))}
                  </div>

                  {/* Timer and Resend */}
                  <div className="timer-container">
                    {!canResend ? (
                      <p className="timer-text">
                        Kirim ulang kode dalam <span className="timer-value">{timer}s</span>
                      </p>
                    ) : (
                      <p className="timer-text">
                        Tidak menerima kode?{' '}
                        <button
                          type="button"
                          className="resend-button"
                          onClick={handleResend}
                        >
                          Kirim Ulang
                        </button>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button 
                    type="submit" 
                    disabled={isLoading || !isCodeComplete}
                    className="btn-primary"
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    {isLoading ? (
                      <div className="spinner" />
                    ) : (
                      <>
                        Verifikasi
                        <ArrowRight size={18} strokeWidth={2.5} />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Back to Login Link */}
                <p className="back-to-login">
                  Salah email?{' '}
                  <motion.a 
                    href="/login" 
                    className="back-to-login-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleBackToLogin();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Kembali ke Login
                  </motion.a>
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
                  Verifikasi Berhasil!
                </h2>
                <p className="success-text">
                  Email Anda telah berhasil diverifikasi.
                  <br />
                  Anda akan dialihkan ke dashboard dalam beberapa saat.
                </p>

                <motion.button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => window.location.href = '/dashboard'}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                >
                  Lanjutkan ke Dashboard
                  <ArrowRight size={18} strokeWidth={2.5} />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}