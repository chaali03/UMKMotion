"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, MapPin, BarChart3, Megaphone, CheckCircle2, XCircle, AlertCircle, Loader2, UserX, ShieldAlert } from "lucide-react";
import { signInWithEmail, signInWithGoogle, checkEmailExistsStrict } from "../lib/auth";
import { auth } from "../lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
    icon?: React.ReactNode;
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

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [paused, slides.length]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 6000);
    return () => clearTimeout(timer);
  }, [notification]);

  const showNotification = (
    type: "success" | "error" | "info" | "warning", 
    title: string, 
    message: string,
    icon?: React.ReactNode
  ) => {
    setNotification({ type, title, message, icon });
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const processPendingAction = async (): Promise<string | null> => {
    try {
      const raw = localStorage.getItem('pendingAction');
      if (!raw) return null;
      const pending = JSON.parse(raw);
      const returnUrl: string | null = pending?.returnUrl || null;

      if (pending?.type === 'cart') {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const exists = cart.find((p: any) => (p.ASIN || p.id) === (pending.product?.ASIN || pending.product?.id));
        if (!exists && pending.product) {
          cart.push({ ...pending.product, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { type: 'cart', count: cart.length } }));
      } else if (pending?.type === 'favorites') {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const exists = favorites.find((p: any) => (p.ASIN || p.id) === (pending.product?.ASIN || pending.product?.id));
        if (!exists && pending.product) {
          favorites.push(pending.product);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { type: 'favorites', count: favorites.length } }));
      }
      localStorage.removeItem('pendingAction');
      return returnUrl;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Normalize email
    const emailNorm = email.trim().toLowerCase();

    // Validation
    if (!emailNorm) {
      setErrors({ email: "Email harus diisi" });
      showNotification("warning", "Email Kosong", "Silakan masukkan alamat email Anda", <Mail size={22} />);
      return;
    }
    if (!validateEmail(emailNorm)) {
      setErrors({ email: "Format email tidak valid" });
      showNotification("error", "Format Email Salah", "Periksa kembali format email Anda (contoh: user@email.com)", <AlertCircle size={22} />);
      return;
    }
    if (!password) {
      setErrors({ password: "Password harus diisi" });
      showNotification("warning", "Password Kosong", "Silakan masukkan password Anda", <Lock size={22} />);
      return;
    }
    if (password.length < 6) {
      setErrors({ password: "Password minimal 6 karakter" });
      showNotification("error", "Password Terlalu Pendek", "Password harus memiliki minimal 6 karakter", <ShieldAlert size={22} />);
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmail(emailNorm, password);
      const redirectTo = await processPendingAction();
      showNotification(
        "success", 
        "🎉 Login Berhasil!", 
        redirectTo ? "Melanjutkan aksi Anda..." : "Selamat datang kembali! Mengalihkan ke Homepage...",
        <CheckCircle2 size={24} />
      );
      setTimeout(() => { window.location.href = redirectTo || "/homepage"; }, 600);
    } catch (err: any) {
      let errorMessage = "Login gagal. Periksa email/password dan coba lagi.";
      const fieldErrors: Record<string, string> = {};
      let notificationType: "error" | "warning" = "error";
      let notificationTitle = "Login Gagal";
      let notificationIcon: React.ReactNode = <XCircle size={24} />;

      console.log("Login error code:", err.code); // Debug

      if (err.code === 'auth/user-not-found') {
        errorMessage = "Email ini belum terdaftar di sistem kami";
        fieldErrors.email = errorMessage;
        notificationType = "error";
        notificationTitle = "❌ Email Tidak Terdaftar";
        notificationIcon = <UserX size={24} />;
        showNotification(
          notificationType,
          notificationTitle,
          "Akun dengan email ini belum terdaftar. Silakan daftar terlebih dahulu atau periksa kembali email Anda.",
          notificationIcon
        );
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = "Password yang Anda masukkan salah";
        fieldErrors.password = errorMessage;
        notificationType = "error";
        notificationTitle = "🔒 Password Salah";
        notificationIcon = <ShieldAlert size={24} />;
        showNotification(
          notificationType,
          notificationTitle,
          "Password yang Anda masukkan tidak sesuai. Periksa kembali atau gunakan fitur 'Lupa Password'.",
          notificationIcon
        );
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Format email tidak valid";
        fieldErrors.email = errorMessage;
        notificationType = "error";
        notificationTitle = "Format Email Salah";
        showNotification(
          notificationType,
          notificationTitle,
          "Format email yang Anda masukkan tidak valid. Gunakan format: nama@email.com",
          <AlertCircle size={24} />
        );
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.";
        fieldErrors.form = errorMessage;
        notificationType = "warning";
        notificationTitle = "⏱️ Terlalu Banyak Percobaan";
        showNotification(
          notificationType,
          notificationTitle,
          "Akun Anda telah diblokir sementara karena terlalu banyak percobaan login. Tunggu beberapa menit dan coba lagi.",
          <AlertCircle size={24} />
        );
      } else if (err.code === 'auth/invalid-credential') {
        // Check if email exists first
        try {
          const exists = await checkEmailExistsStrict(emailNorm);
          if (!exists) {
            errorMessage = "Email ini belum terdaftar di sistem kami";
            fieldErrors.email = errorMessage;
            notificationType = "error";
            notificationTitle = "❌ Email Tidak Terdaftar";
            notificationIcon = <UserX size={24} />;
            showNotification(
              notificationType,
              notificationTitle,
              "Akun dengan email ini tidak ditemukan. Apakah Anda yakin sudah mendaftar? Silakan daftar terlebih dahulu.",
              notificationIcon
            );
          } else {
            errorMessage = "Password yang Anda masukkan salah";
            fieldErrors.password = errorMessage;
            notificationType = "error";
            notificationTitle = "🔒 Password Salah";
            notificationIcon = <ShieldAlert size={24} />;
            showNotification(
              notificationType,
              notificationTitle,
              "Password yang Anda masukkan tidak cocok dengan akun ini. Periksa kembali atau klik 'Lupa Password' untuk reset.",
              notificationIcon
            );
          }
        } catch (checkErr) {
          errorMessage = "Email atau password salah";
          fieldErrors.form = errorMessage;
          showNotification(
            "error",
            "Login Gagal",
            "Email atau password yang Anda masukkan salah. Silakan coba lagi.",
            <XCircle size={24} />
          );
        }
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Koneksi internet bermasalah. Periksa koneksi Anda.";
        fieldErrors.form = errorMessage;
        showNotification(
          "error",
          "❌ Tidak Ada Koneksi",
          "Periksa koneksi internet Anda dan coba lagi.",
          <AlertCircle size={24} />
        );
      } else {
        // Generic error
        errorMessage = "Terjadi kesalahan. Silakan coba lagi.";
        fieldErrors.form = errorMessage;
        showNotification(
          "error",
          "Terjadi Kesalahan",
          errorMessage + " Jika masalah berlanjut, hubungi support.",
          <XCircle size={24} />
        );
      }

      setErrors(fieldErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      const redirectTo = await processPendingAction();
      showNotification(
        "success", 
        "🎉 Login Google Berhasil!", 
        redirectTo ? "Melanjutkan aksi Anda..." : "Selamat datang! Mengalihkan ke Homepage...",
        <CheckCircle2 size={24} />
      );
      setTimeout(() => { window.location.href = redirectTo || "/homepage"; }, 600);
    } catch (err: any) {
      let errorMessage = "Login Google gagal. Silakan coba lagi.";
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login dibatalkan. Silakan coba lagi.";
        showNotification(
          "warning",
          "Login Dibatalkan",
          "Anda menutup jendela login Google. Silakan coba lagi jika ingin melanjutkan.",
          <AlertCircle size={22} />
        );
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = "Popup diblokir browser. Aktifkan popup dan coba lagi.";
        showNotification(
          "error",
          "Popup Diblokir",
          "Browser memblokir popup login Google. Izinkan popup di browser Anda dan coba lagi.",
          <XCircle size={22} />
        );
      } else {
        showNotification(
          "error",
          "Login Google Gagal",
          errorMessage,
          <XCircle size={22} />
        );
      }
      setErrors({ form: errorMessage });
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

        .login-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.25) 0%, transparent 50%);
          animation: none;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.15);
          backdrop-filter: blur(20px);
        }

        .shape-1 { width: 300px; height: 300px; top: -150px; left: -150px; animation: none !important; }
        .shape-2 { width: 200px; height: 200px; bottom: -100px; right: -100px; animation: none !important; }
        .shape-3 { width: 150px; height: 150px; top: 50%; right: 10%; animation: none !important; }

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

        .login-card {
          position: relative;
          z-index: 10;
          width: 90%;
          max-width: 950px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

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
        }

        .input-field:focus + .input-icon {
          color: #f97316;
        }

        .input-field.error {
          border-color: #ef4444;
          background: #fef2f2;
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
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
          font-weight: 600;
          padding: 0.5rem 0.75rem;
          background: #fef2f2;
          border-radius: 8px;
          border-left: 3px solid #ef4444;
        }

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
          margin-top: 0.5rem;
        }

        .btn-primary:hover:not(:disabled) {
          transform: none;
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

        .notification-wrapper {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 1000;
        }

        .notification {
          min-width: 360px;
          max-width: 440px;
          padding: 1.25rem 1.5rem;
          background: white;
          border-radius: 16px;
          border-left: 5px solid;
          display: flex;
          gap: 1rem;
          align-items: start;
        }

        .notification.success { 
          border-left-color: #10b981;
          background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
        }
        .notification.error { 
          border-left-color: #ef4444;
          background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
        }
        .notification.info { 
          border-left-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
        }
        .notification.warning { 
          border-left-color: #f59e0b;
          background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
        }

        .notification-icon {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .notification-icon.success { color: #10b981; }
        .notification-icon.error { color: #ef4444; }
        .notification-icon.info { color: #3b82f6; }
        .notification-icon.warning { color: #f59e0b; }

        .notification-content h4 {
          font-size: 1rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 0.375rem;
          letter-spacing: -0.02em;
        }

        .notification-content p {
          font-size: 0.875rem;
          color: #4b5563;
          line-height: 1.6;
          font-weight: 500;
        }

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

        .mobile-hero {
          display: none;
        }

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

      <div className="floating-shape shape-1" />
      <div className="floating-shape shape-2" />
      <div className="floating-shape shape-3" />

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
              <div className={`notification-icon ${notification.type}`}>
                {notification.icon}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
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

        <div className="form-side">
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
                  <AlertCircle size={16} />
                  {errors.email}
                </motion.div>
              )}
            </div>

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
                  <AlertCircle size={16} />
                  {errors.password}
                </motion.div>
              )}
            </div>

            {errors.form && (
              <motion.div
                className="error-text"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: "0.5rem" }}
              >
                <AlertCircle size={16} />
                {errors.form}
              </motion.div>
            )}

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

            <div className="divider">
              <span>atau</span>
            </div>

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

          <p className="footer-text">
            Belum punya akun?{" "}
            <a href="/register">Daftar di sini</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}