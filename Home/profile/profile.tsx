"use client";
import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db, storage } from "../../src/lib/firebase";
import { onAuthStateChanged, updateProfile, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getUserBadges, getUserGamificationStats } from "../../src/lib/gamification";
import Harga from "../Pricing/harga";

import {
  Camera, Loader2, LogOut, Save, User, Mail, Phone, FileText, Trophy,
  Award, Star, Zap, CheckCircle, History, DollarSign, Store, CreditCard,
  Edit2, X, Shield, ShieldCheck, ShieldAlert, Lock, Smartphone, AlertTriangle,
  CheckCircle2, Clock, Key, Eye, EyeOff, Menu, ChevronLeft, ChevronRight, ArrowLeft
} from "lucide-react";

// Interfaces
interface UserProfileData {
  nickname?: string;
  fullName?: string;
  bio?: string;
  photoURL?: string;
  email?: string | null;
  twoFactorEnabled?: boolean;
  lastPasswordChange?: Date;
  securityScore?: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  rarity: string;
  points: number;
}

interface UserBadge {
  badgeId: string;
  earnedAt: Date;
  fromMission?: string;
}

interface SecurityTip {
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  title: string;
  desc: string;
}

export default function ProfilePage() {
  // State Management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<UserProfileData>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [gamificationStats, setGamificationStats] = useState<any>({});
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "badges">("profile");
  const [activeMenu, setActiveMenu] = useState<"profile" | "history" | "store" | "pricing">("profile");
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [totpSecret, setTotpSecret] = useState<string>("");
  const [totpQRCode, setTotpQRCode] = useState<string>("");
  const [totpCode, setTotpCode] = useState<string>("");
  const [isSettingUpTOTP, setIsSettingUpTOTP] = useState(false);
  const [showTOTPLoginPrompt, setShowTOTPLoginPrompt] = useState(false);
  const [loginOTPCode, setLoginOTPCode] = useState<string>("");
  const [isVerifyingLoginOTP, setIsVerifyingLoginOTP] = useState(false);
  const [postLoginIdToken, setPostLoginIdToken] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [historyTab, setHistoryTab] = useState<'all' | 'product' | 'visit' | 'consultation'>('all');
  
  const securityTips: SecurityTip[] = [
    {
      icon: ShieldCheck,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      title: 'Update Password',
      desc: 'Ganti password secara berkala'
    },
    {
      icon: AlertTriangle,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      title: 'Jaga Kerahasiaan',
      desc: 'Jangan bagikan info login'
    },
    {
      icon: Smartphone,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      title: 'Aktifkan 2FA',
      desc: 'Gunakan aplikasi Authenticator untuk keamanan ekstra'
    },
  ];

  // Open activity destination
  const openActivity = (a: any) => {
    try {
      if ((a.type === 'product_view' || a.productASIN) && a.productASIN) {
        window.location.href = `/product/${a.productASIN}`;
        return;
      }
      if (a.type === 'visit') {
        if (a.storeId) {
          window.location.href = `/umkm/${a.storeId}`;
        } else {
          window.location.href = '/toko';
        }
        return;
      }
      if ((a.type === 'consult_chat' || a.type === 'consult_chat_message') && a.consultantId) {
        window.location.href = `/ConsultantChat?consultant=${a.consultantId}`;
        return;
      }
    } catch {}
  };

  // Responsive Sidebar Handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth State Observer
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }

      setCurrentUser(user);
      setCanEdit(true);

      // Fetch user data to determine if 2FA is enabled before creating session cookie
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      setProfileData({
        nickname: userData.nickname || "",
        fullName: userData.fullName || "",
        bio: userData.bio || "",
        photoURL: userData.photoURL || user.photoURL || "",
        email: user.email,
        twoFactorEnabled: userData.twoFactorEnabled || false,
        lastPasswordChange: userData.lastPasswordChange?.toDate() || null,
        securityScore: userData.securityScore || 0
      });

      try {
        const idToken = await user.getIdToken(false);
        if (userData.twoFactorEnabled) {
          // Require OTP verification before creating session cookie
          setPostLoginIdToken(idToken);
          setShowTOTPLoginPrompt(true);
        } else {
          // No 2FA enabled: create session cookie immediately
          await fetch('/api/session-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ idToken })
          });
        }
      } catch (e) {
        // ignore
      }

      const [userBadgesData, badgesData, statsData] = await Promise.all([
        getUserBadges(user.uid),
        fetchAllBadges(),
        getUserGamificationStats(user.uid)
      ]);

      setUserBadges(userBadgesData);
      setBadges(badgesData);
      setGamificationStats(statsData);

      // **FIX ERROR 1**: Load activities properly
      try {
        let loadedActivities: any[] = [];
        if (db) {
          try {
            const q = query(collection(db, 'users', user.uid, 'activities'), orderBy('createdAt', 'desc'), limit(50));
            const snap = await getDocs(q);
            loadedActivities = snap.docs.map(d => {
              const data: any = d.data();
              const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
              return {
                id: d.id,
                type: data.type || 'other',
                title: data.title || '',
                store: data.store || null,
                storeId: data.storeId || null,
                productASIN: data.productASIN || null,
                productName: data.productName || null,
                consultantName: data.consultantName || null,
                image: data.image || null,
                category: data.category || null,
                createdAt,
              };
            });
          } catch (e) {
            console.warn('Failed to load activities from Firestore:', e);
          }
        }
        setActivities(loadedActivities);
      } catch (e) {
        console.warn('Failed to load activities:', e);
      }
      
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Calculate Security Score
  const calculateSecurityScore = (data: UserProfileData): number => {
    let score = 0;
    if (data.email) score += 30;
    if (data.twoFactorEnabled) score += 40;
    if (data.fullName && data.bio) score += 20;
    if (data.lastPasswordChange) {
      const daysSinceChange = (Date.now() - data.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceChange <= 90) score += 10;
    }
    return Math.min(score, 100);
  };
  
  useEffect(() => {
    setSecurityScore(calculateSecurityScore(profileData));
  }, [profileData]);

  // TOTP Functions
  const startTOTPSetup = async () => {
    if (!currentUser) return;
    try {
      setIsSettingUpTOTP(true);
      const generateBase32Secret = (length: number = 32) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        const bytes = new Uint8Array(length);
        window.crypto.getRandomValues(bytes);
        let out = '';
        for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
        return out;
      };
      const secret = generateBase32Secret(32);
      setTotpSecret(secret);
      try {
        const issuer = encodeURIComponent('UMKMotion');
        const account = encodeURIComponent(currentUser.email || currentUser.uid || 'user');
        const otpAuthUrl = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
        const dataUrl = await QRCode.toDataURL(otpAuthUrl, { width: 220, margin: 1 });
        setTotpQRCode(dataUrl);
      } catch {
        setTotpQRCode('');
      }
      setTotpCode("");
      setShowTOTPSetup(true);
    } catch (e) {
      setModalTitle('Error TOTP');
      setModalMessage('Gagal menyiapkan TOTP. Coba lagi.');
      setShowErrorModal(true);
    } finally {
      setIsSettingUpTOTP(false);
    }
  };

  const base32ToBytes = (b32: string): Uint8Array => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    const cleaned = b32.replace(/=+$/, '').toUpperCase().replace(/[^A-Z2-7]/g, '');
    for (let i = 0; i < cleaned.length; i++) {
      const val = alphabet.indexOf(cleaned[i]);
      if (val < 0) continue;
      bits += val.toString(2).padStart(5, '0');
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }
    return new Uint8Array(bytes);
  };

  const hmacSha1 = async (key: Uint8Array, msg: Uint8Array): Promise<ArrayBuffer> => {
    const cryptoKey = await crypto.subtle.importKey('raw', key.buffer as ArrayBuffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    return crypto.subtle.sign('HMAC', cryptoKey, msg.buffer as ArrayBuffer);
  };

  const hotp = async (secretB32: string, counter: number, digits = 6): Promise<string> => {
    const key = base32ToBytes(secretB32);
    const ctr = new ArrayBuffer(8);
    const view = new DataView(ctr);
    const hi = Math.floor(counter / 0x100000000);
    const lo = counter >>> 0;
    view.setUint32(0, hi);
    view.setUint32(4, lo);
    const hmac = new Uint8Array(await hmacSha1(key, new Uint8Array(ctr)));
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
    return (code % 10 ** digits).toString().padStart(digits, '0');
  };

  const verifyTotp = async (secretB32: string, token: string, step = 30, windowSkew = 1): Promise<boolean> => {
    const time = Math.floor(Date.now() / 1000);
    const counter = Math.floor(time / step);
    for (let w = -windowSkew; w <= windowSkew; w++) {
      const code = await hotp(secretB32, counter + w, 6);
      if (code === token) return true;
    }
    return false;
  };

  const verifyTOTPSetup = async () => {
    if (!currentUser || !totpSecret || totpCode.length !== 6) return;
    try {
      const isValid = await verifyTotp(totpSecret, totpCode);
      if (!isValid) {
        setModalTitle('Verifikasi TOTP Gagal');
        setModalMessage('Kode tidak valid. Periksa waktu perangkat dan coba lagi.');
        setShowErrorModal(true);
        return;
      }
      const updatedData = { ...profileData, twoFactorEnabled: true } as UserProfileData;
      const newSecurityScore = calculateSecurityScore(updatedData);
      await setDoc(doc(db, "users", currentUser.uid), {
        ...updatedData,
        securityScore: newSecurityScore,
        totpSecret,
        totpEnabled: true,
        twoFactorEnabledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      setProfileData(updatedData);
      setShowTOTPSetup(false);
      setModalTitle('TOTP Diaktifkan');
      setModalMessage('Autentikasi aplikasi (TOTP) berhasil diaktifkan.');
      setShowSuccessModal(true);
    } catch (e) {
      setModalTitle('Error TOTP');
      setModalMessage('Gagal menyimpan konfigurasi TOTP.');
      setShowErrorModal(true);
    }
  };

  // Verify OTP during login to create session cookie
  const handleVerifyLoginTOTP = async () => {
    if (!postLoginIdToken) return;
    setIsVerifyingLoginOTP(true);
    try {
      const resp = await fetch('/api/verify-totp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken: postLoginIdToken, otp: loginOTPCode })
      });
      if (resp.ok) {
        setShowTOTPLoginPrompt(false);
        setLoginOTPCode("");
        setModalTitle('Login Berhasil');
        setModalMessage('Verifikasi 2FA sukses. Sesi aman telah dibuat.');
        setShowSuccessModal(true);
      } else {
        const data = await resp.json().catch(() => ({ error: 'Verifikasi gagal' }));
        setModalTitle('Verifikasi Gagal');
        setModalMessage(data.error || 'Kode OTP tidak valid atau kedaluwarsa. Coba lagi.');
        setShowErrorModal(true);
      }
    } catch (e) {
      setModalTitle('Kesalahan Jaringan');
      setModalMessage('Tidak dapat memverifikasi OTP. Periksa koneksi Anda dan coba lagi.');
      setShowErrorModal(true);
    } finally {
      setIsVerifyingLoginOTP(false);
    }
  };

  const fetchAllBadges = async (): Promise<Badge[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "badges"));
      return querySnapshot.docs.map(doc => ({ ...doc.data() } as Badge));
    } catch (error) {
      console.error("Error fetching badges:", error);
      return [];
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser || !canEdit) {
      setModalTitle('Akses Dibatasi');
      setModalMessage('Anda tidak diizinkan untuk mengedit profil ini.');
      setShowErrorModal(true);
      return;
    }
    
    setSaving(true);
    try {
      let photoURL = profileData.photoURL;
      if (previewImage && fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const imageRef = ref(storage, `profile-images/${currentUser.uid}`);
        await uploadBytes(imageRef, file);
        photoURL = await getDownloadURL(imageRef);
      }

      const updatedData = { ...profileData, photoURL };
      const newSecurityScore = calculateSecurityScore(updatedData);

      const idToken = await currentUser.getIdToken(false);
      
      const updateResp = await fetch('/api/profile-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nickname: updatedData.nickname,
          fullName: updatedData.fullName,
          bio: updatedData.bio,
          photoURL: photoURL,
          idToken: idToken
        })
      });

      if (!updateResp.ok) {
        const errorData = await updateResp.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to update profile');
      }

      await updateProfile(currentUser, {
        displayName: updatedData.nickname || updatedData.fullName,
        photoURL
      });

      setProfileData(prev => ({ ...prev, photoURL, securityScore: newSecurityScore }));
      setPreviewImage(null);
      setIsEditingPersonal(false);
      setIsEditingBio(false);
      setModalTitle('Profil Diperbarui');
      setModalMessage('Profil berhasil diperbarui!');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setModalTitle('Error');
      setModalMessage(error.message || 'Gagal memperbarui profil. Silakan coba lagi.');
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setModalTitle('Email Terkirim');
      setModalMessage('Email untuk reset kata sandi telah dikirim.');
      setShowSuccessModal(true);
    } catch (error) {
      setModalTitle('Error');
      setModalMessage('Gagal mengirim email reset kata sandi.');
      setShowErrorModal(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Helper Functions
  const getBadgeData = (badgeId: string) => badges.find(b => b.id === badgeId);
  
  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      common: 'border-gray-300 bg-gray-50',
      uncommon: 'border-green-300 bg-green-50',
      rare: 'border-blue-300 bg-blue-50',
      epic: 'border-purple-300 bg-purple-50',
      legendary: 'border-yellow-300 bg-yellow-50',
    };
    return colors[rarity] || colors.common;
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.trim().split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-indigo-500'];
    if (!name) return colors[0];
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getSecurityLevel = (score: number) => {
    if (score >= 90) return { level: 'Sangat Aman', color: 'text-green-600', icon: <ShieldCheck className="w-4 h-4 text-green-600" /> };
    if (score >= 70) return { level: 'Aman', color: 'text-blue-600', icon: <Shield className="w-4 h-4 text-blue-600" /> };
    if (score >= 50) return { level: 'Cukup Aman', color: 'text-yellow-600', icon: <ShieldAlert className="w-4 h-4 text-yellow-600" /> };
    return { level: 'Kurang Aman', color: 'text-red-600', icon: <AlertTriangle className="w-4 h-4 text-red-600" /> };
  };

  const getSecurityRecommendations = (data: UserProfileData) => {
    const recommendations: string[] = [];
    if (!data.twoFactorEnabled) recommendations.push('Aktifkan autentikasi dua faktor (2FA)');
    if (!data.fullName || !data.bio) recommendations.push('Lengkapi profil Anda');
    const daysSincePasswordChange = data.lastPasswordChange ? (Date.now() - data.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24) : 999;
    if (daysSincePasswordChange > 90) recommendations.push('Perbarui kata sandi secara berkala');
    return recommendations;
  };

  const displayName = profileData.nickname || profileData.fullName || currentUser?.displayName || 'Pengguna';

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-slate-600 text-sm">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Toggle (fixed) */}
      {!isMobile && (
        <motion.button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? 'Tutup Menu' : 'Buka Menu'}
          className="hidden lg:flex fixed top-24 z-[60] w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white border border-white/30"
          style={{ left: isSidebarOpen ? 340 : 12 }}
          animate={{ left: isSidebarOpen ? 340 : 12 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <div className="relative w-full h-full grid place-items-center">
            <motion.span
              key={isSidebarOpen ? 'chev-left-fixed' : 'chev-right-fixed'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 grid place-items-center"
            >
              {isSidebarOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
            </motion.span>
          </div>
        </motion.button>
      )}

      {/* Mobile/Tablet Menu Toggle Button */}
      <AnimatePresence>
        {(isMobile || window.innerWidth < 1024) && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed top-4 left-4 z-50 lg:hidden w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            aria-label="Toggle Menu"
          >
            <motion.div
              animate={{ rotate: isSidebarOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? (isSidebarOpen ? '320px' : '0px') : (isSidebarOpen ? '340px' : '0px'),
          x: isMobile && !isSidebarOpen ? '-100%' : '0%'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed lg:sticky top-0 h-screen bg-white shadow-2xl flex flex-col z-50 overflow-visible min-w-0"
      >
        {/* Logo */}
        <div className={`flex items-center transition-all duration-300 ${isSidebarOpen ? 'pl-4 pr-4 py-5' : 'pl-3 pr-3 py-5 lg:pl-4'}`}>
          <img
            src="/LogoNavbar.webp"
            alt="UMKMotion"
            className={`${isSidebarOpen ? 'h-10 w-auto' : 'h-10 w-10'} -ml-1`}
          />
        </div>

        {/* Navigation */}
        <nav className={`flex-1 space-y-2 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'px-4' : 'px-2'}`}>
          <div className={`text-xs text-gray-500 uppercase font-semibold mb-3 transition-all ${isSidebarOpen ? 'px-3' : 'text-center px-0'}`}>
            {isSidebarOpen ? 'Navigasi' : '•'}
          </div>
          
          {[
            { label: 'Profil', icon: User, menu: 'profile' },
            { label: 'Riwayat', icon: History, menu: 'history' },
            { label: 'Toko', icon: Store, menu: 'store' },
            { label: 'Pricing', icon: CreditCard, menu: 'pricing' },
          ].map((item) => (
            <button
              key={item.menu}
              onClick={() => {
                setActiveMenu(item.menu as any);
                if (isMobile) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeMenu === item.menu 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-600'
              } ${isSidebarOpen ? 'px-4' : 'px-0 justify-center'}`}
              title={!isSidebarOpen ? item.label : ''}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className={`border-t border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'p-5' : 'p-4'}`}>
          <button
            onClick={handleSignOut}
            className={`group w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all hover:shadow-lg ${isSidebarOpen ? 'px-4' : 'px-2 justify-center'}`}
            title={!isSidebarOpen ? 'Keluar' : ''}
          >
            <div className="relative">
              <LogOut size={22} className="flex-shrink-0" />
              {!isSidebarOpen && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">
                  !
                </span>
              )}
            </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 text-left"
              >
                <div className="text-sm font-bold">Keluar Akun</div>
                <div className="text-xs text-red-500">Akhiri sesi Anda</div>
              </motion.div>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <header className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Back Button */}
                <button
                  onClick={() => window.history.back()}
                  className="p-2 sm:p-2.5 bg-white text-orange-600 hover:bg-orange-50 rounded-xl shadow-sm border border-orange-100 transition-all active:scale-95 hover:shadow-md"
                  aria-label="Kembali"
                >
                  <ArrowLeft size={20} />
                </button>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                    {activeMenu === 'profile' && 'Profil Saya'}
                    {activeMenu === 'history' && 'Riwayat'}
                    {activeMenu === 'store' && 'Toko Saya'}
                    {activeMenu === 'pricing' && 'Pricing'}
                  </h1>
                  {activeMenu === 'profile' && (
                    <p className="text-slate-600 mt-0.5 text-sm sm:text-base line-clamp-1">
                      Kelola informasi profil dan lihat pencapaian Anda
                    </p>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Profile Content */}
          {activeMenu === 'profile' && (
            <>
              {/* Security Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-white mb-4 sm:mb-6 lg:mb-8 relative overflow-hidden shadow-2xl"
              >
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-8 translate-x-8 sm:-translate-y-12 sm:translate-x-12"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-6 -translate-x-6 sm:translate-y-8 sm:-translate-x-8"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2">
                      {getSecurityLevel(securityScore).icon}
                      <div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold">Keamanan Akun</h3>
                        <p className="text-xs sm:text-sm text-gray-300 break-words">Tingkatkan keamanan untuk perlindungan maksimal</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">{securityScore}%</div>
                      <div className={`text-xs sm:text-sm font-medium ${getSecurityLevel(securityScore).color}`}>
                        {getSecurityLevel(securityScore).level}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3 sm:mb-4">
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-1000 ${
                          securityScore >= 90 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                          securityScore >= 70 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                          securityScore >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                          'bg-gradient-to-r from-red-500 to-red-400'
                        }`}
                        style={{ width: `${securityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Security Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="text-center p-2.5 sm:p-3 lg:p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                      <div className="flex justify-center mb-1">
                        {profileData.email ? 
                          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" /> : 
                          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                        }
                      </div>
                      <div className="text-sm sm:text-base font-medium">Email</div>
                      <div className="text-xs sm:text-sm text-gray-300 break-words">
                        {profileData.email ? 'Terverifikasi' : 'Belum ada'}
                      </div>
                    </div>
                    <div className="text-center p-2.5 sm:p-3 lg:p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                      <div className="flex justify-center mb-1">
                        {profileData.twoFactorEnabled ? 
                          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" /> : 
                          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                        }
                      </div>
                      <div className="text-sm sm:text-base font-medium">2FA</div>
                      <div className="text-xs sm:text-sm text-gray-300 break-words">
                        {profileData.twoFactorEnabled ? 'Aktif' : 'Nonaktif'}
                      </div>
                    </div>
                    <div className="text-center p-2.5 sm:p-3 lg:p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                      <div className="flex justify-center mb-1">
                        {(profileData.fullName && profileData.bio) ? 
                          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" /> : 
                          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                        }
                      </div>
                      <div className="text-sm sm:text-base font-medium">Profil</div>
                      <div className="text-xs sm:text-sm text-gray-300 break-words">
                        {(profileData.fullName && profileData.bio) ? 'Lengkap' : 'Belum lengkap'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 bg-white rounded-xl p-2 mb-4 sm:mb-6 shadow-lg border border-gray-100">
                {[
                  { id: 'profile', label: 'Profil', shortLabel: 'Profil', icon: User, color: 'from-orange-500 to-pink-500' },
                  { id: 'security', label: 'Keamanan', shortLabel: 'Keamanan', icon: Shield, color: 'from-blue-500 to-indigo-500' },
                  { id: 'badges', label: `Badge (${userBadges.length})`, shortLabel: `Badge`, icon: Award, color: 'from-purple-500 to-pink-500' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                        : "text-slate-600 hover:text-slate-900 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">{tab.label}</span>
                    <span className="sm:hidden truncate">{tab.shortLabel}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content - Profile */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
                >
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
                    {/* Photo Section */}
                    <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-xl border border-gray-100">
                      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                        <div className="relative">
                          <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg border-4 border-white ${getAvatarColor(displayName)}`}>
                            {previewImage || profileData.photoURL ? (
                              <img src={previewImage || profileData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              getInitials(displayName)
                            )}
                          </div>
                          <button
                            onClick={() => canEdit && fileInputRef.current?.click()}
                            disabled={!canEdit}
                            className={`absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white flex items-center justify-center transition ${canEdit ? 'bg-orange-500 cursor-pointer hover:bg-orange-600 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}
                          >
                            <Camera size={14} className="text-white" />
                          </button>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <div className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Upload foto baru</div>
                          <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                            Minimal 800×800 px. Format JPG atau PNG.
                          </div>
                        </div>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} disabled={!canEdit} className="hidden" />
                    </div>
                    
                    {/* Personal Info */}
                    <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-xl border border-gray-100">
                      <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Informasi Pribadi</h3>
                        <button 
                          onClick={() => canEdit && setIsEditingPersonal(!isEditingPersonal)}
                          disabled={!canEdit}
                          className={`flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition active:scale-95 ${canEdit ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
                        >
                          <Edit2 size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      </div>

                      {isEditingPersonal ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div>
                              <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">Nama Panggilan</label>
                              <input 
                                type="text" 
                                value={profileData.nickname || ""}
                                onChange={(e) => setProfileData({...profileData, nickname: e.target.value})}
                                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">Nama Lengkap</label>
                              <input 
                                type="text" 
                                value={profileData.fullName || ""}
                                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div className="mb-3 sm:mb-4">
                            <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">Email</label>
                            <input 
                              type="email" 
                              value={profileData.email || ""}
                              disabled
                              className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm bg-gray-50 text-gray-500"
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <button 
                              onClick={() => setIsEditingPersonal(false)}
                              className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-200 transition active:scale-95"
                            >
                              <X size={16} />
                              Batal
                            </button>
                            <button 
                              onClick={() => { handleSave(); setIsEditingPersonal(false); }}
                              disabled={saving || !canEdit}
                              className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-orange-600 transition disabled:opacity-50 active:scale-95"
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                              Simpan
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Nama Panggilan</div>
                            <div className="text-xs sm:text-sm text-gray-900 font-medium">{profileData.nickname || '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Nama Lengkap</div>
                            <div className="text-xs sm:text-sm text-gray-900 font-medium">{profileData.fullName || '-'}</div>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Email</div>
                            <div className="text-xs sm:text-sm text-gray-900 font-medium break-all">{profileData.email || '-'}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bio Section */}
                    <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-xl border border-gray-100">
                      <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Deskripsi</h3>
                        <button 
                          onClick={() => canEdit && setIsEditingBio(!isEditingBio)}
                          disabled={!canEdit}
                          className={`flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition active:scale-95 ${canEdit ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
                        >
                          <Edit2 size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      </div>

                      {isEditingBio ? (
                        <>
                          <textarea 
                            value={profileData.bio || ""}
                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                            className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px] resize-y"
                            placeholder="Ceritakan tentang diri Anda..."
                          />
                          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3 sm:mt-4">
                            <button 
                              onClick={() => setIsEditingBio(false)}
                              className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-200 transition active:scale-95"
                            >
                              <X size={16} />
                              Batal
                            </button>
                            <button 
                              onClick={() => { handleSave(); setIsEditingBio(false); }}
                              disabled={saving || !canEdit}
                              className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-orange-600 transition disabled:opacity-50 active:scale-95"
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                              Simpan
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                          {profileData.bio || 'Belum ada deskripsi. Klik Edit untuk menambahkan.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {/* Security Recommendations */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 sm:p-4 lg:p-5 shadow-xl border border-orange-100">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <span>Rekomendasi Keamanan</span>
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        {getSecurityRecommendations(profileData).length === 0 ? (
                          <div className="text-center py-3 sm:py-4">
                            <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-green-500 mb-2" />
                            <p className="text-green-600 font-medium text-sm sm:text-base">Akun Anda sudah aman!</p>
                            <p className="text-xs sm:text-sm text-gray-500">Semua fitur keamanan telah diaktifkan</p>
                          </div>
                        ) : (
                          getSecurityRecommendations(profileData).map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-100">
                              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs sm:text-sm font-medium text-gray-900">{rec}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 lg:p-5 shadow-xl border border-green-100">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Aksi Cepat</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {!profileData.twoFactorEnabled && (
                          <button
                            onClick={startTOTPSetup}
                            disabled={isSettingUpTOTP}
                            className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors disabled:opacity-50 active:scale-95"
                          >
                            <Lock className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div className="text-left flex-1">
                              <div className="text-xs sm:text-sm font-medium text-green-900">Aktifkan 2FA</div>
                              <div className="text-[10px] sm:text-xs text-green-600">Tingkatkan keamanan +40%</div>
                            </div>
                            {isSettingUpTOTP && <Loader2 className="w-4 h-4 animate-spin text-green-600 flex-shrink-0" />}
                          </button>
                        )}
                        
                        <button
                          onClick={handleResetPassword}
                          className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors active:scale-95"
                        >
                          <Key className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          <div className="text-left flex-1">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">Reset Password</div>
                            <div className="text-[10px] sm:text-xs text-gray-600">Perbarui kata sandi Anda</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab Content - Security */}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3 sm:space-y-4 lg:space-y-6"
                >
                  {/* Security Settings */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-slate-200">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <span>Pengaturan Keamanan</span>
                    </h3>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {/* 2FA */}
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base text-gray-900">Autentikasi Dua Faktor (2FA)</h4>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">Lapisan keamanan tambahan dengan Aplikasi Authenticator.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                            {profileData.twoFactorEnabled ? (
                              <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Aktif
                              </span>
                            ) : (
                              <button
                                onClick={startTOTPSetup}
                                className="w-full sm:w-auto bg-slate-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-slate-900 transition active:scale-95"
                                disabled={isSettingUpTOTP}
                              >
                                {isSettingUpTOTP ? 'Menyiapkan…' : 'Aktifkan TOTP'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <Key className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base text-gray-900">Kata Sandi</h4>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">
                                {profileData.lastPasswordChange 
                                  ? `Terakhir diubah ${Math.floor((Date.now() - profileData.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24))} hari lalu`
                                  : 'Belum pernah diubah'
                                }
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleResetPassword}
                            className="w-full sm:w-auto bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-700 transition active:scale-95 flex-shrink-0"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Tips */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-slate-200">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                      <span>Tips Keamanan</span>
                    </h3>
                    
                    <div className="space-y-2 sm:space-y-3">
                      {securityTips.map((tip, idx) => (
                        <div key={idx} className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 ${tip.bgColor} rounded-lg`}>
                          <tip.icon className={`w-5 h-5 ${tip.textColor} mt-0.5 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium ${tip.textColor.replace('600', '900')} mb-0.5 text-xs sm:text-sm`}>{tip.title}</h4>
                            <p className={`text-[10px] sm:text-xs ${tip.textColor.replace('600', '700')} break-words`}>{tip.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab Content - Badges */}
              {activeTab === "badges" && (
                <motion.div
                  key="badges"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3 sm:space-y-4 lg:space-y-6"
                >
                  {/* Earned Badges */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-slate-200">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
                      <span>Badge yang Diperoleh ({userBadges.length})</span>
                    </h3>
                    
                    {userBadges.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-slate-500">
                        <Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 text-slate-300" />
                        <p className="text-sm sm:text-base">Belum ada badge yang diperoleh</p>
                        <p className="text-xs sm:text-sm">Selesaikan misi untuk mendapatkan badge!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                        {userBadges.map((userBadge) => {
                          const badge = getBadgeData(userBadge.badgeId);
                          if (!badge) return null;

                          return (
                            <div
                              key={userBadge.badgeId}
                              className={`relative p-3 sm:p-4 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 active:scale-100 ${getRarityColor(badge.rarity)}`}
                            >
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                              
                              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{badge.icon}</div>
                              <h4 className="font-semibold text-slate-900 text-xs sm:text-sm mb-0.5 line-clamp-1">{badge.name}</h4>
                              <p className="text-[10px] sm:text-xs text-slate-600 mb-1 line-clamp-2">{badge.description}</p>
                              
                              <div className="flex items-center justify-center gap-0.5 text-[10px] sm:text-xs text-slate-500 mb-1">
                                <Zap className="w-3 h-3 text-yellow-500" />
                                <span>{badge.points} poin</span>
                              </div>
                              
                              <div className="text-[10px] sm:text-xs text-green-600">
                                {userBadge.earnedAt.toLocaleDateString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* All Available Badges */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-slate-200">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 flex-shrink-0" />
                      <span>Semua Badge Tersedia ({badges.length})</span>
                    </h3>

                    {badges.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-slate-500">
                        <Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 text-slate-300" />
                        <p className="text-sm sm:text-base">Belum ada badge tersedia</p>
                        <p className="text-xs sm:text-sm">Tunggu pembaruan konten untuk melihat badge baru.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                        {badges.map((badge) => (
                          <div
                            key={badge.id}
                            className="relative p-3 sm:p-4 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 active:scale-100 border-slate-200"
                          >
                            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{badge.icon}</div>
                            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm mb-0.5 line-clamp-1">{badge.name}</h4>
                            <p className="text-[10px] sm:text-xs text-slate-600 mb-1 line-clamp-2">{badge.description}</p>
                            <div className="flex items-center justify-center gap-0.5 text-[10px] sm:text-xs text-slate-500 mb-1">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              <span>{badge.points} poin</span>
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-500 capitalize">{badge.rarity}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* **FIX ERROR 3 & 4**: Use activeMenu instead of activeTab */}
          {/* Pricing */}
          {activeMenu === 'pricing' && (
            <div className="-mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
              <Harga hideFooter />
            </div>
          )}

          {/* Store (placeholder) */}
          {activeMenu === 'store' && (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
              <Store size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 capitalize">Store Coming Soon</h3>
              <p className="text-sm text-gray-600">Halaman store akan segera hadir.</p>
            </div>
          )}

          {/* History (placeholder) */}
          {activeMenu === 'history' && (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
              <History size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Riwayat Coming Soon</h3>
              <p className="text-sm text-gray-600">Halaman riwayat akan segera hadir.</p>
            </div>
          )}
        </div>
      </main>

      {/* TOTP Setup Modal */}
      <AnimatePresence>
        {showTOTPSetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-4">
                <Lock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-800 mb-2" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Aktifkan TOTP 2FA</h3>
                <p className="text-xs sm:text-sm text-gray-600">Scan QR atau masukkan secret key di aplikasi Authenticator.</p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {totpQRCode && (
                  <div className="flex flex-col items-center gap-2">
                    <img src={totpQRCode} alt="QR Code" className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl border border-slate-200" />
                    <p className="text-xs text-gray-500">Gunakan Google Authenticator / Authy</p>
                  </div>
                )}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">Secret Key:</p>
                  <div className="bg-white border border-slate-300 rounded p-2 sm:p-3 font-mono text-xs sm:text-sm text-center break-all select-all cursor-pointer hover:bg-slate-100 transition">
                    {totpSecret}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-2">Salin dan masukkan ke aplikasi Authenticator Anda</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">Kode 6 digit</label>
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-center text-lg sm:text-xl font-mono tracking-widest focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setShowTOTPSetup(false)}
                    className="flex-1 px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    onClick={verifyTOTPSetup}
                    disabled={totpCode.length !== 6}
                    className="flex-1 px-4 py-2 sm:py-2.5 bg-slate-800 text-white rounded-lg font-medium text-sm hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
                  >
                    Verifikasi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTOTPLoginPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-4">
                <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-800 mb-2" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Verifikasi 2FA</h3>
                <p className="text-xs sm:text-sm text-gray-600">Masukkan kode dari aplikasi Authenticator untuk melanjutkan.</p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-2">Kode 6 digit</label>
                  <input
                    type="text"
                    value={loginOTPCode}
                    onChange={(e) => setLoginOTPCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-center text-lg sm:text-xl font-mono tracking-widest focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => { setShowTOTPLoginPrompt(false); setLoginOTPCode(''); }}
                    className="flex-1 px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleVerifyLoginTOTP}
                    disabled={loginOTPCode.length !== 6 || isVerifyingLoginOTP}
                    className="flex-1 px-4 py-2 sm:py-2.5 bg-slate-800 text-white rounded-lg font-medium text-sm hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
                  >
                    {isVerifyingLoginOTP ? 'Memverifikasi...' : 'Verifikasi'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm"
            >
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{modalTitle}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">{modalMessage}</p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-green-600 text-white py-2 sm:py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors active:scale-95"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm"
            >
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{modalTitle}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">{modalMessage}</p>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full bg-red-600 text-white py-2 sm:py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-red-700 transition-colors active:scale-95"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}