"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, Mail } from "lucide-react";

const carouselItems = [
  { src: "/asset/umkm/umkm1.png", title: "Kuliner Nusantara" },
  { src: "/asset/umkm/umkm2.jpg", title: "Fashion Lokal" },
  { src: "/asset/umkm/umkm3.jpeg", title: "Kerajinan Tangan" },
  { src: "/asset/umkm/umkm4.jpeg", title: "Produk Digital" },
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
                  <img src="/logo.png" alt="Logo" />
                </motion.div>

                <h2 className="form-title">
                  Verifikasi Email
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