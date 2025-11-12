"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
<<<<<<< HEAD
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft } from "lucide-react";
=======
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, User, CheckCircle2, XCircle, Loader2, AlertCircle, Shield, UserPlus } from "lucide-react";
import { signUpWithEmail } from "../lib/auth";
import { sendEmailOtp, verifyEmailOtp } from "../lib/otp";
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602

// Password strength checker component
const PasswordStrength = ({ password }: { password: string }) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = strength <= 1 ? "Lemah" : strength <= 3 ? "Sedang" : strength <= 4 ? "Kuat" : "Sangat Kuat";
  const strengthColor = strength <= 1 ? "#ef4444" : strength <= 3 ? "#f59e0b" : strength <= 4 ? "#10b981" : "#22c55e";

  return (
    <div className="password-strength-wrapper">
      <div className="password-strength-bar">
        <motion.div
          className="password-strength-fill"
          initial={{ width: 0 }}
          animate={{ width: `${(strength / 5) * 100}%`, backgroundColor: strengthColor }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="password-checks">
        <CheckItem valid={checks.length} text="Min. 8 karakter" />
        <CheckItem valid={checks.uppercase} text="Huruf besar" />
        <CheckItem valid={checks.number} text="Angka" />
      </div>
    </div>
  );
};

const CheckItem = ({ valid, text }: { valid: boolean; text: string }) => (
  <motion.div
    className="check-item"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.2 }}
  >
    {valid ? (
      <CheckCircle2 size={14} className="check-icon valid" />
    ) : (
      <XCircle size={14} className="check-icon invalid" />
    )}
    <span className={valid ? "check-text valid" : "check-text invalid"}>{text}</span>
  </motion.div>
);

export default function RegisterPage() {
  // State Management
  const [currentStep, setCurrentStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
=======
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const nicknameCheckTimeout = useRef<NodeJS.Timeout | null>(null);
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602

  // Notification State
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  // Slideshow
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = [
    {
      icon: <Sparkles size={40} color="#fff" />,
      title: "Mulai Perjalananmu",
      text: "Bergabung dengan ribuan UMKM yang telah berkembang bersama kami.",
    },
    {
      icon: <Shield size={40} color="#fff" />,
      title: "Keamanan Terjamin",
      text: "Data Anda dilindungi dengan enkripsi tingkat enterprise.",
    },
    {
      icon: <UserPlus size={40} color="#fff" />,
      title: "Mudah & Cepat",
      text: "Hanya 3 langkah untuk membuat akun dan mulai bertumbuh.",
    },
  ];

  // Profanity Filter Helpers
  const bannedWords = [
    // Indonesian
    "anjing","bangsat","kontol","memek","bajingan","tolol","goblok","kampret",
    // English common
    "fuck","shit","bitch","asshole","bastard","cunt","dick","pussy",
    // Racist/slurs (short representative list)
    "nigger","nigga","chink","spic","kike","retard"
  ];
  const normalize = (s: string) => s
    .toLowerCase()
    .replace(/[@$]+/g, 'a')
    .replace(/[0o]+/g, 'o')
    .replace(/[1l!]+/g, 'i')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-z0-9]+/g, '');
  const isCleanNickname = (n: string) => {
    const nrm = normalize(n);
    if (nrm.length < 3) return true;
    return !bannedWords.some(w => nrm.includes(normalize(w)));
  };

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

  // OTP Cooldown
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => setOtpCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Notification Helper
  const showNotification = (type: "success" | "error" | "info", title: string, message: string) => {
    setNotification({ type, title, message });
  };

  // API Functions
  const checkUserExists = async (email?: string, nickname?: string) => {
    try {
      const response = await fetch("/api/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nickname }),
      });
      return await response.json();
    } catch (err) {
      console.error("Error checking user:", err);
      return { emailExists: false, nicknameExists: false };
    }
  };

  // Debounced Nickname Check
  useEffect(() => {
    if (nickname.length < 3) {
      setNicknameStatus('idle');
      return;
    }

    if (nicknameCheckTimeout.current) {
      clearTimeout(nicknameCheckTimeout.current);
    }

    setNicknameStatus('checking');
    
    nicknameCheckTimeout.current = setTimeout(async () => {
      // Profanity validation first
      if (!isCleanNickname(nickname)) {
        setNicknameStatus('taken');
        setErrors((prev) => ({ ...prev, nickname: "Nickname mengandung kata tidak pantas." }));
        return;
      }
      const { nicknameExists } = await checkUserExists(undefined, nickname);
      setNicknameStatus(nicknameExists ? 'taken' : 'available');
      if (nicknameExists) {
        setErrors((prev) => ({ ...prev, nickname: "Nickname sudah digunakan" }));
      } else {
        setErrors((prev) => ({ ...prev, nickname: "" }));
      }
    }, 800);

    return () => {
      if (nicknameCheckTimeout.current) {
        clearTimeout(nicknameCheckTimeout.current);
      }
    };
  }, [nickname]);

  // Step 1: Name Handler
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
=======
    setErrors({});

    if (fullName.length < 3) {
      setErrors({ fullName: "Nama minimal 3 karakter" });
      return;
    }
    if (nickname.length < 3) {
      setErrors({ nickname: "Nickname minimal 3 karakter" });
      return;
    }
    if (!isCleanNickname(nickname)) {
      setErrors({ nickname: "Nickname mengandung kata tidak pantas." });
      setNicknameStatus('taken');
      return;
    }
    if (nicknameStatus === 'taken') {
      setErrors({ nickname: "Nickname sudah digunakan" });
      return;
    }

    setCurrentStep(1);
  };

  // Step 2: Email & OTP Handler
  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: "Format email tidak valid" });
      return;
    }

    setIsSendingOtp(true);
    setErrors({});

    try {
      const { emailExists } = await checkUserExists(email, undefined);
      if (emailExists) {
        setErrors({ email: "Email sudah terdaftar" });
        showNotification("error", "Email Sudah Terdaftar", "Gunakan email lain atau login ke akun Anda.");
        setIsSendingOtp(false);
        return;
      }

      await sendEmailOtp(email, { ttlSeconds: 300, subject: "Kode Verifikasi UMKMotion" });
      setOtpSent(true);
      setOtpCooldown(60);
      showNotification("success", "Kode Terkirim", `Kode verifikasi telah dikirim ke ${email}`);
      
      // Auto focus first OTP input
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengirim kode";
      setErrors({ email: errorMessage });
      showNotification("error", "Gagal Mengirim Kode", errorMessage);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // OTP Input Handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Auto verify when OTP is complete
  useEffect(() => {
    const otpCode = otp.join("");
    if (otpCode.length === 6 && !isVerifyingOtp) {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;

    setIsVerifyingOtp(true);
    setErrors({});

    try {
      await verifyEmailOtp(email, otpCode);
      showNotification("success", "Email Terverifikasi", "Silakan lanjutkan ke langkah berikutnya");
      setCurrentStep(2);
    } catch (err) {
      let errorMessage = "Kode verifikasi tidak valid";
      if (err instanceof Error) {
        if (err.message.includes("kadaluarsa")) errorMessage = "Kode sudah kadaluarsa";
        else if (err.message.includes("tidak ditemukan")) errorMessage = "Kode tidak valid";
      }
      setErrors({ otp: errorMessage });
      showNotification("error", "Verifikasi Gagal", errorMessage);
      setOtp(Array(6).fill(""));
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Step 3: Password Handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (password.length < 8) {
      setErrors({ password: "Password minimal 8 karakter" });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirm: "Password tidak cocok" });
      return;
    }
    if (!isCleanNickname(nickname)) {
      setErrors({ nickname: "Nickname mengandung kata tidak pantas." });
      return;
    }

>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602
    setIsLoading(true);

    try {
      await signUpWithEmail(email, password, fullName, nickname);
      showNotification("success", "Akun Berhasil Dibuat!", "Mengalihkan ke halaman login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      let errorMessage = "Gagal membuat akun";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Email sudah terdaftar";
      }
      showNotification("error", "Registrasi Gagal", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  const handleGoogleSignup = () => {
    console.log("Google signup");
  };

  const handleBackToHome = () => {
    window.location.href = "/";
=======
  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602
  };

  return (
    <div className="register-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .register-container {
          min-height: 120vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
<<<<<<< HEAD
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

        /* Card - REVERSED LAYOUT */
=======
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 20%, #93c5fd 40%, #60a5fa 60%, #3b82f6 80%, #2563eb 100%);
          font-family: 'Inter', -apple-system, sans-serif;
          overflow: hidden;
        }

        /* Animated Background */
        .register-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 15% 25%, rgba(255, 255, 255, 0.35) 0%, transparent 45%),
            radial-gradient(circle at 85% 75%, rgba(59, 130, 246, 0.25) 0%, transparent 50%);
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
          background: rgba(37, 99, 235, 0.15);
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
          background: rgba(37, 99, 235, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(37, 99, 235, 0.4);
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
          background: rgba(37, 99, 235, 0.35);
          transform: translateX(-4px);
        }

        /* Main Card */
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602
        .register-card {
          position: relative;
          z-index: 10;
          width: 90%;
<<<<<<< HEAD
          max-width: 800px;
          display: grid;
          grid-template-columns: 55% 45%;
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

        .register-card:hover {
          transform: translateY(-10px);
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.8),
            0 30px 80px rgba(0, 0, 0, 0.15),
            0 50px 120px rgba(0, 0, 0, 0.08);
        }

        /* Form section - NOW ON LEFT */
        .form-section {
          padding: 3rem 3.5rem;
=======
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
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: white;
          position: relative;
<<<<<<< HEAD
          order: 1;
        }

        .form-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
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
=======
          overflow: hidden;
        }

        .brand-side::before {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, transparent 70%);
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
          background: rgba(37, 99, 235, 0.4);
          cursor: pointer;
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602
          transition: all 0.3s ease;
        }

        .dot.active {
          width: 24px;
          border-radius: 4px;
          background: #2563eb;
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

        .step-badge {
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
<<<<<<< HEAD
          font-size: 0.9375rem;
          color: #64748b;
          margin-bottom: 2rem;
          font-weight: 400;
          line-height: 1.5;
        }

        /* Input styles */
        .input-group {
          margin-bottom: 1.125rem;
=======
          font-size: 0.95rem;
          color: #6b7280;
          line-height: 1.5;
        }

        /* Input Styles */
        .input-group {
          margin-bottom: 1.5rem;
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602
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
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
        }

        .input-field:focus + .input-icon {
          color: #2563eb;
        }

        .input-field.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .input-field:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .input-feedback {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
        }

<<<<<<< HEAD
        .toggle-password:hover {
          color: #ff7a1a;
          background: rgba(255, 122, 26, 0.08);
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
=======
        .error-text {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .success-text {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        /* OTP Input */
        .otp-container {
          display: flex;
          gap: 0.75rem;
          justify-content: space-between;
        }

        .otp-input {
          width: 50px !important;
          height: 60px !important;
          padding: 0 !important;
          text-align: center;
          font-size: 1.5rem !important;
          font-weight: 700;
          letter-spacing: 0;
        }

        /* Password Strength */
        .password-strength-wrapper {
          margin-top: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .password-strength-bar {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }

        .password-strength-fill {
          height: 100%;
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        .password-checks {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8rem;
        }

        .check-icon.valid { color: #10b981; }
        .check-icon.invalid { color: #d1d5db; }
        .check-text.valid { color: #059669; font-weight: 500; }
        .check-text.invalid { color: #9ca3af; }

        /* Buttons */
        .btn {
          height: 52px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: none;
          outline: none;
        }

        .btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          width: 52px;
          background: #f3f4f6;
          color: #6b7280;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-group {
          display: flex;
<<<<<<< HEAD
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

        .login-text {
          text-align: center;
          margin-top: 1.75rem;
          font-size: 0.9375rem;
          color: #64748b;
          line-height: 1.5;
        }

        .login-link {
          color: #ff7a1a;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          padding-bottom: 2px;
=======
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .link-btn {
          background: none;
          border: none;
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }

        .link-btn:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .footer-text {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #6b7280;
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
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Image section - NOW ON RIGHT */
        .image-section {
          position: relative;
          background: #ff8a3d;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          order: 2;
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
          left: -100px;
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

        /* Mobile Hero */
        .mobile-hero {
          display: none;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .register-card {
            grid-template-columns: 1fr;
            max-width: 480px;
          }

          .brand-side {
            display: none;
          }

          .form-side {
            padding: 2.5rem 2rem;
            order: 1;
          }

          .mobile-hero {
            display: block;
            width: 100%;
            height: 180px;
            margin-bottom: 1.5rem;
            border-radius: 16px;
            overflow: hidden;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
          .register-card {
            width: 95%;
            margin: 1rem;
          }

          .form-side {
            padding: 2rem 1.5rem;
          }

          .form-title {
            font-size: 1.75rem;
          }

          .otp-input {
            width: 45px !important;
            height: 55px !important;
            font-size: 1.25rem !important;
          }

          .password-checks {
            grid-template-columns: 1fr;
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

<<<<<<< HEAD
        *:focus-visible {
          outline: 2px solid #ff7a1a;
          outline-offset: 2px;
        }

        .input-field:focus-visible {
          outline: none;
=======
        @media (max-width: 480px) {
          .otp-container {
            gap: 0.5rem;
          }

          .otp-input {
            width: 40px !important;
            height: 50px !important;
            font-size: 1.125rem !important;
          }
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602
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
        className="register-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
<<<<<<< HEAD
        {/* Left: Form */}
        <div className="form-section">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
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
              Welcome to UMKMotion
            </h2>
            <p className="form-subtitle">
              Bergabunglah dan mulai perjalanan bisnis Anda bersama kami
            </p>

            <form onSubmit={handleSubmit}>
              {/* Full Name Input */}
              <div className="input-group">
                <label htmlFor="fullname" className="input-label">
                  Nama Lengkap
                </label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <motion.input
                    type="text"
                    id="fullname"
                    className="input-field"
                    placeholder="Masukkan nama lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    whileFocus={{ scale: 1.001 }}
                  />
                </div>
              </div>

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
                    placeholder="hi@polarastudio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    whileFocus={{ scale: 1.001 }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="input-group">
                <label htmlFor="password" className="input-label">
                  Kata Sandi
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="input-field has-toggle"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    Sign Up
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="divider">
              <span>ATAU</span>
            </div>

            {/* Google Signup */}
            <motion.button 
              type="button" 
              className="btn-google"
              onClick={handleGoogleSignup}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </motion.button>

            {/* Login Link */}
            <p className="login-text">
              Already have an account?{' '}
              <motion.a 
                href="/login" 
                className="login-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/login';
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.a>
            </p>
          </motion.div>
        </div>

        {/* Right: Image carousel */}
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
=======
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
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602

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
<<<<<<< HEAD
=======

        {/* Right Side - Form */}
        <div className="form-side">
          {/* Mobile Hero */}
          <div className="mobile-hero">
            <img src="/asset/register/register.webp" alt="Register illustration" />
          </div>
          <div className="form-header">
            <div className="step-badge">
              <Sparkles size={16} />
              <span>Langkah {currentStep + 1} dari 3</span>
            </div>
            <h2 className="form-title">
              {currentStep === 0 && "Buat Profil"}
              {currentStep === 1 && "Verifikasi Email"}
              {currentStep === 2 && "Atur Password"}
            </h2>
            <p className="form-subtitle">
              {currentStep === 0 && "Masukkan nama lengkap dan nickname unik Anda"}
              {currentStep === 1 && "Kami akan mengirim kode verifikasi ke email Anda"}
              {currentStep === 2 && "Buat password yang kuat untuk mengamankan akun"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Profile */}
            {currentStep === 0 && (
              <motion.form
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleStep1Submit}
              >
                <div className="input-group">
                  <label htmlFor="fullName" className="input-label">
                    Nama Lengkap
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <User size={20} />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      className={`input-field ${errors.fullName ? "error" : ""}`}
                      placeholder="Mamat Sudrajat"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {errors.fullName && (
                    <motion.div
                      className="error-text"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle size={14} />
                      {errors.fullName}
                    </motion.div>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="nickname" className="input-label">
                    Nickname
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <User size={20} />
                    </div>
                    <input
                      id="nickname"
                      type="text"
                      className={`input-field ${errors.nickname ? "error" : ""}`}
                      placeholder="mamat"
                      value={nickname}
                      onChange={(e) =>
                        setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                      }
                    />
                    <div className="input-feedback">
                      {nicknameStatus === 'checking' && <Loader2 size={20} className="spinner" color="#6366f1" />}
                      {nicknameStatus === 'available' && <CheckCircle2 size={20} color="#10b981" />}
                      {nicknameStatus === 'taken' && <XCircle size={20} color="#ef4444" />}
                    </div>
                  </div>
                  {errors.nickname && (
                    <motion.div
                      className="error-text"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle size={14} />
                      {errors.nickname}
                    </motion.div>
                  )}
                  {nicknameStatus === 'available' && (
                    <motion.div
                      className="success-text"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <CheckCircle2 size={14} />
                      Nickname tersedia
                    </motion.div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary" disabled={nicknameStatus === 'checking' || nicknameStatus === 'taken'}>
                  Lanjutkan <ArrowRight size={18} />
                </button>

                <p className="footer-text">
                  Sudah punya akun?{" "}
                  <a href="/login" className="link-btn">
                    Masuk di sini
                  </a>
                </p>
              </motion.form>
            )}

            {/* STEP 2: Email & OTP */}
            {currentStep === 1 && (
              <motion.form
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={(e) => e.preventDefault()}
              >
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
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={otpSent}
                      autoFocus={!otpSent}
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

                {otpSent && (
                  <motion.div
                    className="input-group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="input-label">Kode Verifikasi (6 Digit)</label>
                    <div className="otp-container" onPaste={handleOtpPaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className={`input-field otp-input ${errors.otp ? "error" : ""}`}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          disabled={isVerifyingOtp}
                        />
                      ))}
                    </div>
                    {errors.otp && (
                      <motion.div
                        className="error-text"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <AlertCircle size={14} />
                        {errors.otp}
                      </motion.div>
                    )}
                    {isVerifyingOtp && (
                      <motion.div
                        className="success-text"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Loader2 size={14} className="spinner" />
                        Memverifikasi kode...
                      </motion.div>
                    )}
                  </motion.div>
                )}

                <div className="btn-group">
                  <button type="button" className="btn btn-secondary" onClick={goBack}>
                    <ArrowLeft size={18} />
                  </button>
                  {!otpSent ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      style={{ flex: 1 }}
                    >
                      {isSendingOtp ? <div className="spinner" /> : <>Kirim Kode <ArrowRight size={18} /></>}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={true}
                      style={{ flex: 1, opacity: 0.5 }}
                    >
                      {isVerifyingOtp ? <div className="spinner" /> : "Memverifikasi..."}
                    </button>
                  )}
                </div>

                {otpSent && (
                  <p className="footer-text" style={{ marginTop: "1rem" }}>
                    Tidak menerima kode?{" "}
                    {otpCooldown > 0 ? (
                      <span style={{ color: "#6b7280" }}>
                        Kirim ulang dalam {otpCooldown}d
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="link-btn"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                      >
                        Kirim ulang
                      </button>
                    )}
                  </p>
                )}
              </motion.form>
            )}

            {/* STEP 3: Password */}
            {currentStep === 2 && (
              <motion.form
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handlePasswordSubmit}
              >
                <div className="input-group">
                  <label htmlFor="password" className="input-label">
                    Password
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <Lock size={20} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={`input-field ${errors.password ? "error" : ""}`}
                      placeholder="Minimal 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      className="input-feedback"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9ca3af",
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {password && <PasswordStrength password={password} />}
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

                <div className="input-group">
                  <label htmlFor="confirmPassword" className="input-label">
                    Konfirmasi Password
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <Lock size={20} />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`input-field ${errors.confirm ? "error" : ""}`}
                      placeholder="Ketik ulang password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      className="input-feedback"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9ca3af",
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirm && (
                    <motion.div
                      className="error-text"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle size={14} />
                      {errors.confirm}
                    </motion.div>
                  )}
                </div>

                <div className="btn-group">
                  <button type="button" className="btn btn-secondary" onClick={goBack}>
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                    style={{ flex: 1 }}
                  >
                    {isLoading ? <div className="spinner" /> : <>Buat Akun <UserPlus size={18} /></>}
                  </button>
                </div>

                <p className="footer-text">
                  Sudah punya akun?{" "}
                  <a href="/login" className="link-btn">
                    Masuk di sini
                  </a>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
>>>>>>> 992d3c57d600f1596b0e07b353da10b398b12602
      </motion.div>
    </div>
  );
}