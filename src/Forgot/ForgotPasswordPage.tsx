"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const carouselItems = [
  { src: "/asset/umkm/umkm1.png", title: "Kuliner Nusantara" },
  { src: "/asset/umkm/umkm2.jpg", title: "Fashion Lokal" },
  { src: "/asset/umkm/umkm3.jpeg", title: "Kerajinan Tangan" },
  { src: "/asset/umkm/umkm4.jpeg", title: "Produk Digital" },
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
                  Lupa Password?
                </h2>
                <p className="form-subtitle">
                  Masukkan email Anda dan kami akan mengirimkan link untuk mereset password Anda
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
                        Reset Password
                        <ArrowRight size={18} strokeWidth={2.5} />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Back to Login Link */}
                <p className="back-to-login">
                  Ingat password Anda?{' '}
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
                  Email Terkirim!
                </h2>
                <p className="success-text">
                  Kami telah mengirimkan link reset password ke{' '}
                  <span className="success-email">{email}</span>
                  <br />
                  Silakan cek inbox atau folder spam Anda.
                </p>

                <motion.button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleBackToLogin}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <ArrowLeft size={18} strokeWidth={2.5} />
                  Kembali ke Login
                </motion.button>

                <p className="back-to-login" style={{ marginTop: '1rem' }}>
                  Tidak menerima email?{' '}
                  <motion.a 
                    href="#" 
                    className="back-to-login-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSuccess(false);
                      setEmail('');
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Kirim ulang
                  </motion.a>
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}