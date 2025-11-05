"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, MapPin, BarChart3, Megaphone, UserPlus, User } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [leaving, setLeaving] = useState(false);

  const slides = [
    {
      icon: <Sparkles size={32} color="#111827" />,
      title: "Mulai Perjalananmu",
      text:
        "Daftarkan akunmu dalam tiga langkah sederhana. Nikmati akses ke fitur peta usaha, promosi, dan komunitas dukungan untuk mempercepat pertumbuhan bisnismu.",
    },
    {
      icon: <UserPlus size={32} color="#111827" />,
      title: "Bangun Identitas Bisnis",
      text:
        "Gunakan nama lengkap dan nickname agar profilmu terlihat profesional, mudah dicari pelanggan, dan konsisten di seluruh fitur UMKMotion.",
    },
    {
      icon: <Lock size={32} color="#111827" />,
      title: "Keamanan Diutamakan",
      text:
        "Lindungi aksesmu dengan verifikasi email dan password yang kuat. Data usahamu tersimpan aman sehingga kamu bisa fokus berkembang.",
    },
  ];

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setSlideIndex((i) => (i + 1) % slides.length), 3500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const validateEmail = (v: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v);
  
  const nextFromName = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!fullName || fullName.length < 3) return setErrors({ fullName: "Nama minimal 3 karakter" });
    if (!nickname || nickname.length < 3) return setErrors({ nickname: "Nickname minimal 3 karakter" });
    setCurrentStep(1);
  };

  const nextFromEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateEmail(email)) return setErrors({ email: "Email tidak valid" });
    if (verificationCode.length !== 6) return setErrors({ code: "Kode verifikasi 6 digit" });
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setCurrentStep(2); }, 800);
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (password.length < 8) return setErrors({ password: "Minimal 8 karakter" });
    if (password !== confirmPassword) return setErrors({ confirm: "Password tidak cocok" });
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); window.location.href = "/login"; }, 1000);
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
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
          background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/asset/register/register.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Animated Background Gradient */
        .bg-animated {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            #eff6ff 0%,
            #dbeafe 25%,
            #bfdbfe 50%,
            #93c5fd 75%,
            #60a5fa 100%
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

        /* Main Card - SAME AS LOGIN */
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

        /* Left Side - Brand - SAME AS LOGIN */
        .brand-side {
          padding: 3rem;
          background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
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
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .dot.active {
          background: white;
          width: 16px;
          border-radius: 6px;
        }

        /* Right Side - Form - SAME AS LOGIN */
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
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.12));
          border: 1px solid rgba(37, 99, 235, 0.25);
          border-radius: 50px;
          color: #2563eb;
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

        /* Input Styles - SAME AS LOGIN */
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
          color: #2563eb;
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
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
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

        /* Helper Text */
        .helper-text {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: #eff6ff;
          border-left: 3px solid #2563eb;
          border-radius: 8px;
          font-size: 0.8125rem;
          color: #1e40af;
          line-height: 1.4;
        }

        /* Buttons - SAME AS LOGIN */
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
          background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
          color: white;
          margin-top: 1rem;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-back {
          flex: 0 0 auto;
          width: 48px;
          padding: 0;
          background: #f1f5f9;
          color: #475569;
        }

        .btn-back:hover {
          background: #e2e8f0;
        }

        .btn-group {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        /* Divider */
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

        .footer-text {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9375rem;
          color: #64748b;
        }

        .footer-text a {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-text a:hover {
          color: #1d4ed8;
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

        /* Mobile Hero (hidden on desktop) */
        .mobile-hero {
          display: none;
        }

        /* Responsive - SAME AS LOGIN */
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
            display:block;
            width: 100%;
            height: 160px;
            margin-bottom: 1rem;
            border-radius: 16px;
            overflow:hidden;
            background: #eef2ff;
          }
          .mobile-hero img { width: 100%; height: 100%; object-fit: cover; display:block; }
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
        onClick={() => (window.location.href = "/")}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft />
        <span>Kembali</span>
      </motion.button>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        {!leaving && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, x: 40, scale: 0.92, transition: { duration: 0.3 } }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
        {/* Left - Brand with animated slides */}
        <div
          className="brand-side"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
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
                <div className="mb-3">{slides[slideIndex].icon}</div>
                <h1 className="brand-title">{slides[slideIndex].title}</h1>
                <p className="brand-text">{slides[slideIndex].text}</p>
              </motion.div>
            </AnimatePresence>
          )}

          <div className="decorative-dots">
            {slides.map((_, i) => (
              <div key={i} className={"dot" + (i === slideIndex ? " active" : "")} onClick={() => setSlideIndex(i)} />
            ))}
          </div>
        </div>

        {/* Right - Register Form */}
        <div className="form-side">
          <div className="form-header">
            {/* Mobile only hero image/banner (hidden on exit) */}
            {!leaving && (
              <div className="mobile-hero">
                <img src="/asset/register/register.webp" alt="Register hero" />
              </div>
            )}
            <motion.div className="welcome-badge" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Sparkles />
              <span>{currentStep === 0 ? "Langkah 1 dari 3" : currentStep === 1 ? "Langkah 2 dari 3" : "Langkah 3 dari 3"}</span>
            </motion.div>
            <h2 className="form-title">{currentStep === 0 ? "Data Profil" : currentStep === 1 ? "Email & Verifikasi" : "Buat Password"}</h2>
            <p className="form-subtitle">{currentStep === 0 ? "Isi nama lengkap dan nickname kamu." : currentStep === 1 ? "Masukkan email dan kode verifikasi 6 digit." : "Amankan akunmu dengan password yang kuat."}</p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Name */}
            {currentStep === 0 && (
              <motion.form key="step-name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} onSubmit={nextFromName}>
                <div className="input-group">
                  <label htmlFor="name" className="input-label">Nama Lengkap</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input id="name" type="text" className="input-field" placeholder="Nama lengkap kamu" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  {errors.fullName && <div className="helper-text">{errors.fullName}</div>}
                </div>
                <div className="input-group">
                  <label htmlFor="nick" className="input-label">Nickname</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input id="nick" type="text" className="input-field" placeholder="Panggilan kamu" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                  </div>
                  {errors.nickname && <div className="helper-text">{errors.nickname}</div>}
                </div>

                <button type="submit" className="btn btn-primary">
                  Lanjutkan <ArrowRight size={18} />
                </button>

                <p className="footer-text">
                  Sudah punya akun? {" "}
                  <button type="button" onClick={() => navigateWithExit("/login")} style={{ background: "none", border: "none", color: "#f97316", fontWeight: 700, cursor: "pointer" }}>Masuk</button>
                </p>
              </motion.form>
            )}

            {/* Step 2: Email */}
            {currentStep === 1 && (
              <motion.form key="step-email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} onSubmit={nextFromEmail}>
                <div className="input-group">
                  <label htmlFor="email" className="input-label">Email</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" />
                    <input id="email" type="email" className="input-field" placeholder="contoh@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  {errors.email && <div className="helper-text">{errors.email}</div>}
                </div>
                <div className="input-group">
                  <label htmlFor="code" className="input-label">Kode Verifikasi</label>
                  <div className="input-wrapper">
                    <input id="code" type="text" className="input-field" placeholder="000000" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} />
                  </div>
                  {errors.code && <div className="helper-text">{errors.code}</div>}
                </div>

                <div className="btn-group">
                  <button type="button" className="btn btn-back" onClick={goBack}>
                    <ArrowLeft size={18} />
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 1 }}>
                    {isLoading ? <div className="spinner" /> : <>Lanjutkan <ArrowRight size={18} /></>}
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Password */}
            {currentStep === 2 && (
              <motion.form key="step-pass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} onSubmit={submitPassword}>
                <div className="input-group">
                  <label htmlFor="password" className="input-label">Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" />
                    <input id="password" type={showPassword ? "text" : "password"} className="input-field" placeholder="Minimal 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button>
                  </div>
                  {errors.password && <div className="helper-text">{errors.password}</div>}
                </div>
                <div className="input-group">
                  <label htmlFor="confirm" className="input-label">Konfirmasi Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" />
                    <input id="confirm" type={showConfirmPassword ? "text" : "password"} className="input-field" placeholder="Ketik ulang password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff /> : <Eye />}</button>
                  </div>
                  {errors.confirm && <div className="helper-text">{errors.confirm}</div>}
                </div>

                <div className="btn-group">
                  <button type="button" className="btn btn-back" onClick={goBack}>
                    <ArrowLeft size={18} />
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 1 }}>
                    {isLoading ? <div className="spinner" /> : <>Buat Akun <UserPlus size={18} /></>}
                  </button>
                </div>

                <p className="footer-text">Sudah punya akun? <button type="button" onClick={() => navigateWithExit("/login")} style={{ background: "none", border: "none", color: "#f97316", fontWeight: 700, cursor: "pointer" }}>Masuk</button></p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
        )}
    </AnimatePresence>
    </div>
  );
}