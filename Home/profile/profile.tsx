"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { auth, db, storage } from "../../src/lib/firebase";
import { onAuthStateChanged, updateProfile, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getUserBadges, getUserGamificationStats } from "../../src/lib/gamification";
import QRCode from "qrcode";
import { 
  Camera, 
  Loader2, 
  LogOut, 
  Save, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Trophy,
  Award,
  Star,
  Zap,
  CheckCircle,
  History,
  DollarSign,
  Store,
  CreditCard,
  Edit2,
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Key,
  Eye,
  EyeOff
} from "lucide-react";

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

export default function ProfilePage() {
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
  const [show2FASetup, setShow2FASetup] = useState(false);
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }

      setCurrentUser(user);
      
      try {
        // Verify server session cookie to lock profile editing to authenticated user
        try {
          const resp = await fetch('/api/me', { credentials: 'include' });
          if (resp.ok) {
            const data = await resp.json();
            setCanEdit(data?.uid === user.uid);
          } else {
            setCanEdit(false);
          }
        } catch (e) {
          setCanEdit(false);
        }

        // Fetch user profile data
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

        // Fetch gamification data
        const [userBadgesData, badgesData, statsData] = await Promise.all([
          getUserBadges(user.uid),
          fetchAllBadges(),
          getUserGamificationStats(user.uid)
        ]);

        setUserBadges(userBadgesData);
        setBadges(badgesData);
        setGamificationStats(statsData);
        
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
      
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Calculate security score based on account completeness
  const calculateSecurityScore = (data: UserProfileData): number => {
    let score = 0;
    const maxScore = 100;
    
    // Email verified (Firebase handles this) - 30 points
    if (data.email) score += 30;
    
    // 2FA enabled - 40 points
    if (data.twoFactorEnabled) score += 40;
    
    // Profile completed (name, bio) - 20 points
    if (data.fullName && data.bio) score += 20;
    
    // Recent password change (within 90 days) - 10 points
    if (data.lastPasswordChange) {
      const daysSinceChange = (Date.now() - data.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceChange <= 90) score += 10;
    }
    
    return Math.min(score, maxScore);
  };


  const startTOTPSetup = async () => {
    if (!currentUser) return;
    try {
      setIsSettingUpTOTP(true);
      const generateBase32Secret = (length: number = 32) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        const bytes = new Uint8Array(length);
        (window.crypto || (window as any).msCrypto).getRandomValues(bytes);
        let out = '';
        for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
        return out;
      };
      const secret = generateBase32Secret(32);
      const account = encodeURIComponent(currentUser.email || currentUser.uid);
      const issuer = encodeURIComponent('UMKMotion');
      const otpauth = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&period=30&digits=6`;
      const qr = await QRCode.toDataURL(otpauth);
      setTotpSecret(secret);
      setTotpQRCode(qr);
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

  // ===== TOTP helpers (Browser-safe) =====
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
    // write counter as big-endian
    const hi = Math.floor(counter / 0x100000000);
    const lo = counter >>> 0;
    view.setUint32(0, hi);
    view.setUint32(4, lo);
    const hmac = new Uint8Array(await hmacSha1(key, new Uint8Array(ctr)));
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
    const str = (code % 10 ** digits).toString().padStart(digits, '0');
    return str;
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
      setModalMessage('Autentikasi aplikasi (TOTP) berhasil diaktifkan. Simpan perangkat authenticator Anda.');
      setShowSuccessModal(true);
    } catch (e) {
      setModalTitle('Error TOTP');
      setModalMessage('Gagal menyimpan konfigurasi TOTP.');
      setShowErrorModal(true);
    }
  };

  // Update security score when profile data changes
  useEffect(() => {
    const score = calculateSecurityScore(profileData);
    setSecurityScore(score);
  }, [profileData]);

  const fetchAllBadges = async (): Promise<Badge[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "badges"));
      const badgesList: Badge[] = [];
      querySnapshot.forEach((doc) => {
        badgesList.push({ ...doc.data() } as Badge);
      });
      return badgesList;
    } catch (error) {
      console.error("Error fetching badges:", error);
      return [];
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    if (!canEdit) {
      setModalTitle('Akses Dibatasi');
      setModalMessage('Edit profil dikunci. Pastikan Anda login dan memiliki sesi yang valid.');
      setShowErrorModal(true);
      return;
    }
    
    setSaving(true);
    try {
      let photoURL = profileData.photoURL;
      
      // Upload new image if selected
      if (previewImage && fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const imageRef = ref(storage, `profile-images/${currentUser.uid}`);
        await uploadBytes(imageRef, file);
        photoURL = await getDownloadURL(imageRef);
      }

      // Calculate updated security score
      const updatedData = { ...profileData, photoURL };
      const newSecurityScore = calculateSecurityScore(updatedData);

      // Update profile via secure server endpoint
      const resp = await fetch('/api/profile-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nickname: updatedData.nickname,
          fullName: updatedData.fullName,
          bio: updatedData.bio,
          photoURL: photoURL
        })
      });
      if (!resp.ok) throw new Error('Gagal update profil via server');

      // Optionally reflect in client-side auth profile for UI consistency
      await updateProfile(currentUser, {
        displayName: updatedData.nickname || updatedData.fullName,
        photoURL
      });

      setProfileData(prev => ({ ...prev, photoURL, securityScore: newSecurityScore }));
      setPreviewImage(null);
      setModalTitle('Profil Diperbarui');
      setModalMessage('Profil berhasil diperbarui!');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setModalTitle('Error Profil');
      setModalMessage('Gagal memperbarui profil');
      setShowErrorModal(true);
    }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setModalTitle('Email Terkirim');
      setModalMessage('Email reset password telah dikirim!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error sending password reset:", error);
      setModalTitle('Error Reset Password');
      setModalMessage('Gagal mengirim email reset password');
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


  const getBadgeData = (badgeId: string): Badge | undefined => {
    return badges.find(b => b.id === badgeId);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'uncommon': return 'border-green-300 bg-green-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  // Generate initials from name
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Generate color based on name for consistent avatar color
  const getAvatarColor = (name: string): string => {
    if (!name) return 'bg-orange-500';
    const colors = [
      'bg-orange-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500',
      'bg-amber-500',
      'bg-cyan-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get security level based on score
  const getSecurityLevel = (score: number): { level: string; color: string; icon: React.ReactNode } => {
    if (score >= 90) return { level: 'Sangat Aman', color: 'text-green-600', icon: <ShieldCheck className="w-5 h-5 text-green-600" /> };
    if (score >= 70) return { level: 'Aman', color: 'text-blue-600', icon: <Shield className="w-5 h-5 text-blue-600" /> };
    if (score >= 50) return { level: 'Cukup Aman', color: 'text-yellow-600', icon: <ShieldAlert className="w-5 h-5 text-yellow-600" /> };
    return { level: 'Kurang Aman', color: 'text-red-600', icon: <AlertTriangle className="w-5 h-5 text-red-600" /> };
  };

  // Get security recommendations
  const getSecurityRecommendations = (data: UserProfileData): string[] => {
    const recommendations: string[] = [];
    
    if (!data.twoFactorEnabled) recommendations.push('Aktifkan autentikasi dua faktor (2FA)');
    if (!data.fullName || !data.bio) recommendations.push('Lengkapi profil Anda');
    
    const daysSincePasswordChange = data.lastPasswordChange 
      ? (Date.now() - data.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    
    if (daysSincePasswordChange > 90) recommendations.push('Perbarui kata sandi');
    
    return recommendations;
  };

  const displayName = profileData.nickname || profileData.fullName || currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Pengguna');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <div className="text-slate-600">Memuat profil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-lg flex flex-col p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Store size={24} className="text-white" />
          </div>
          <div className="text-2xl font-bold">
            UMKM<span className="text-orange-500">otion</span>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-3 px-3">Menu Utama</div>
          
          <button
            onClick={() => setActiveMenu('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              activeMenu === 'profile'
                ? 'bg-orange-50 text-orange-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <User size={20} />
            Profil
          </button>

          <button
            onClick={() => setActiveMenu('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              activeMenu === 'history'
                ? 'bg-orange-50 text-orange-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <History size={20} />
            Riwayat
          </button>

          <button
            onClick={() => setActiveMenu('store')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              activeMenu === 'store'
                ? 'bg-orange-50 text-orange-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Store size={20} />
            Toko
          </button>

          <button
            onClick={() => setActiveMenu('pricing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              activeMenu === 'pricing'
                ? 'bg-orange-50 text-orange-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CreditCard size={20} />
            Pricing
          </button>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {activeMenu === 'profile' && 'Profil Saya'}
            {activeMenu === 'history' && 'Riwayat'}
            {activeMenu === 'store' && 'Toko Saya'}
            {activeMenu === 'pricing' && 'Pricing'}
          </h1>
          {activeMenu === 'profile' && (
            <p className="text-slate-600 mt-2">Kelola informasi profil dan lihat pencapaian Anda</p>
          )}
        </div>

        {activeMenu === 'profile' && (
          <>
            {/* Security Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-8 text-white mb-8 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {getSecurityLevel(securityScore).icon}
                    <div>
                      <h3 className="text-xl font-bold">Keamanan Akun</h3>
                      <p className="text-slate-300 text-sm">Tingkatkan keamanan untuk perlindungan maksimal</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{securityScore}%</div>
                    <div className={`text-sm font-medium ${getSecurityLevel(securityScore).color.replace('text-', 'text-')}`}>
                      {getSecurityLevel(securityScore).level}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">Skor Keamanan</span>
                    <span className="text-white font-medium">{securityScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        securityScore >= 90 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                        securityScore >= 70 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                        securityScore >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                        'bg-gradient-to-r from-red-500 to-red-400'
                      }`}
                      style={{ width: `${securityScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Security Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                    <div className="flex justify-center mb-2">
                      {profileData.email ? 
                        <CheckCircle2 className="w-6 h-6 text-green-400" /> : 
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      }
                    </div>
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-xs text-slate-300 mt-1">
                      {profileData.email ? 'Terverifikasi' : 'Belum ada'}
                    </div>
                  </div>
                  
                  
                  <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                    <div className="flex justify-center mb-2">
                      {profileData.twoFactorEnabled ? 
                        <CheckCircle2 className="w-6 h-6 text-green-400" /> : 
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      }
                    </div>
                    <div className="text-sm font-medium">2FA</div>
                    <div className="text-xs text-slate-300 mt-1">
                      {profileData.twoFactorEnabled ? 'Aktif' : 'Nonaktif'}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                    <div className="flex justify-center mb-2">
                      {(profileData.fullName && profileData.bio) ? 
                        <CheckCircle2 className="w-6 h-6 text-green-400" /> : 
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      }
                    </div>
                    <div className="text-sm font-medium">Profil</div>
                    <div className="text-xs text-slate-300 mt-1">
                      {(profileData.fullName && profileData.bio) ? 'Lengkap' : 'Belum lengkap'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-white rounded-2xl p-2 mb-8 shadow-lg border border-gray-100">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105"
                    : "text-slate-600 hover:text-slate-900 hover:bg-gray-50"
                }`}
              >
                <User className="w-5 h-5" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "security"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                    : "text-slate-600 hover:text-slate-900 hover:bg-gray-50"
                }`}
              >
                <Shield className="w-5 h-5" />
                Keamanan
              </button>
              <button
                onClick={() => setActiveTab("badges")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "badges"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                    : "text-slate-600 hover:text-slate-900 hover:bg-gray-50"
                }`}
              >
                <Award className="w-5 h-5" />
                Badge ({userBadges.length})
              </button>
            </div>

            {/* Content */}
            {activeTab === "profile" ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              {/* Photo Section */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white ${getAvatarColor(displayName)}`}>
                      {previewImage || profileData.photoURL ? (
                        <img
                          src={previewImage || profileData.photoURL}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(displayName)
                      )}
                    </div>
                    <button
                      onClick={() => canEdit && fileInputRef.current?.click()}
                      disabled={!canEdit}
                      className={`absolute bottom-0 right-0 w-9 h-9 rounded-full border-3 border-white flex items-center justify-center transition ${canEdit ? 'bg-orange-500 cursor-pointer hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                      <Camera size={18} className="text-white" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-900 mb-1">Upload foto baru</div>
                    <div className="text-sm text-gray-500 leading-relaxed">
                      Minimal 800×800 px disarankan.<br/>
                      Format JPG atau PNG diperbolehkan
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={!canEdit}
                  className="hidden"
                />
              </div>

              {/* Personal Info */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Informasi Pribadi</h3>
                  <button 
                    onClick={() => canEdit && setIsEditingPersonal(!isEditingPersonal)}
                    disabled={!canEdit}
                    className={`flex items-center gap-2 font-semibold text-sm px-3 py-2 rounded-lg transition ${canEdit ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                </div>

                {isEditingPersonal ? (
                  <>
                    <div className="grid grid-cols-3 gap-5 mb-6">
                      <div>
                        <label className="block text-sm text-gray-600 font-medium mb-2">Nama Panggilan</label>
                        <input 
                          type="text" 
                          value={profileData.nickname || ""}
                          onChange={(e) => setProfileData({...profileData, nickname: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 font-medium mb-2">Nama Lengkap</label>
                        <input 
                          type="text" 
                          value={profileData.fullName || ""}
                          onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm text-gray-600 font-medium mb-2">Email</label>
                      <input 
                        type="email" 
                        value={profileData.email || ""}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setIsEditingPersonal(false)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
                      >
                        <X size={16} />
                        Batal
                      </button>
                      <button 
                        onClick={() => {
                          handleSave();
                          setIsEditingPersonal(false);
                        }}
                        disabled={saving || !canEdit}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Simpan
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1.5">Nama Panggilan</div>
                      <div className="text-sm text-gray-900 font-medium">{profileData.nickname || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1.5">Nama Lengkap</div>
                      <div className="text-sm text-gray-900 font-medium">{profileData.fullName || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1.5">Email</div>
                      <div className="text-sm text-gray-900 font-medium">{profileData.email || '-'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Deskripsi</h3>
                  <button 
                    onClick={() => canEdit && setIsEditingBio(!isEditingBio)}
                    disabled={!canEdit}
                    className={`flex items-center gap-2 font-semibold text-sm px-3 py-2 rounded-lg transition ${canEdit ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                </div>

                {isEditingBio ? (
                  <>
                    <textarea 
                      value={profileData.bio || ""}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[120px] resize-y"
                      placeholder="Ceritakan tentang diri Anda..."
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <button 
                        onClick={() => setIsEditingBio(false)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
                      >
                        <X size={16} />
                        Batal
                      </button>
                      <button 
                        onClick={() => {
                          handleSave();
                          setIsEditingBio(false);
                        }}
                        disabled={saving || !canEdit}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Simpan
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {profileData.bio || 'Belum ada deskripsi. Klik Edit untuk menambahkan deskripsi tentang diri Anda.'}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleResetPassword}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 px-6 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Reset Kata Sandi
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Security Recommendations */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 shadow-xl border border-orange-100 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-orange-500" />
                  Rekomendasi Keamanan
                </h3>
                <div className="space-y-3">
                  {getSecurityRecommendations(profileData).length === 0 ? (
                    <div className="text-center py-4">
                      <ShieldCheck className="w-12 h-12 mx-auto text-green-500 mb-2" />
                      <p className="text-green-600 font-medium">Akun Anda sudah aman!</p>
                      <p className="text-sm text-gray-500">Semua fitur keamanan telah diaktifkan</p>
                    </div>
                  ) : (
                    getSecurityRecommendations(profileData).map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{recommendation}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Aksi Cepat</h3>
                <div className="space-y-3">
                  {!profileData.twoFactorEnabled && (
                    <button
                      onClick={startTOTPSetup}
                      disabled={isSettingUpTOTP}
                      className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors disabled:opacity-50"
                    >
                      <Lock className="w-5 h-5 text-green-600" />
                      <div className="text-left flex-1">
                        <div className="text-sm font-medium text-green-900">Aktifkan 2FA</div>
                        <div className="text-xs text-green-600">Tingkatkan keamanan +40%</div>
                      </div>
                      {isSettingUpTOTP && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
                    </button>
                  )}
                  
                  <button
                    onClick={handleResetPassword}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <Key className="w-5 h-5 text-gray-600" />
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium text-gray-900">Reset Password</div>
                      <div className="text-xs text-gray-600">Perbarui kata sandi</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
            ) : activeTab === "security" ? (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
            {/* Security Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Pengaturan Keamanan
              </h3>
              
              <div className="space-y-6">

                {/* 2FA */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Autentikasi Dua Faktor (2FA)</h4>
                        <p className="text-sm text-gray-600">Lapisan keamanan tambahan dengan Aplikasi Authenticator.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {profileData.twoFactorEnabled ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Aktif
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={startTOTPSetup}
                            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900"
                            disabled={isSettingUpTOTP}
                          >
                            {isSettingUpTOTP ? 'Menyiapkan…' : 'Aktifkan TOTP'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Kata Sandi</h4>
                        <p className="text-sm text-gray-600">
                          {profileData.lastPasswordChange 
                            ? `Terakhir diubah ${Math.floor((Date.now() - profileData.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24))} hari lalu`
                            : 'Belum pernah diubah'
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleResetPassword}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                Tips Keamanan
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Gunakan Password yang Kuat</h4>
                    <p className="text-sm text-blue-700">Kombinasi huruf besar, kecil, angka, dan simbol minimal 8 karakter.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Smartphone className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">Aktifkan 2FA</h4>
                    <p className="text-sm text-green-700">Lapisan keamanan tambahan dengan kode SMS untuk login.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Key className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-1">Update Password Berkala</h4>
                    <p className="text-sm text-purple-700">Ganti password setiap 3 bulan untuk keamanan optimal.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900 mb-1">Jangan Bagikan Info Login</h4>
                    <p className="text-sm text-orange-700">Jangan pernah membagikan password atau kode OTP kepada siapapun.</p>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
            ) : (
              <motion.div
                key="badges"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Earned Badges */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-orange-600" />
                    Badge yang Diperoleh ({userBadges.length})
                  </h3>
                  
                  {userBadges.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Belum ada badge yang diperoleh</p>
                      <p className="text-sm">Selesaikan misi untuk mendapatkan badge!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {userBadges.map((userBadge) => {
                        const badge = getBadgeData(userBadge.badgeId);
                        if (!badge) return null;

                        return (
                          <div
                            key={userBadge.badgeId}
                            className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-300 hover:scale-105 ${getRarityColor(badge.rarity)}`}
                          >
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <h4 className="font-semibold text-slate-900 text-sm mb-1">{badge.name}</h4>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-2">{badge.description}</p>
                            
                            <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-2">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              <span>{badge.points} poin</span>
                            </div>
                            
                            <div className="text-xs text-green-600">
                              {userBadge.earnedAt.toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* All Available Badges */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-slate-400" />
                    Semua Badge Tersedia ({badges.length})
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {badges.map((badge) => {
                      const isEarned = userBadges.some(ub => ub.badgeId === badge.id);
                      
                      return (
                        <div
                          key={badge.id}
                          className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 ${isEarned ? `${getRarityColor(badge.rarity)} shadow-lg` : "border-slate-200 opacity-60 hover:opacity-80"}`}
                        >
                          {isEarned && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                          
                          <div className="text-3xl mb-2">{badge.icon}</div>
                          <h4 className="font-semibold text-slate-900 text-sm mb-1">{badge.name}</h4>
                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">{badge.description}</p>
                          
                          <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span>{badge.points} poin</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}


            {/* TOTP Setup Modal */}
            {showTOTPSetup && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-6 w-full max-w-md"
                >
                  <div className="text-center mb-6">
                    <Lock className="w-12 h-12 mx-auto text-slate-800 mb-3" />
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Aktifkan TOTP 2FA</h3>
                    <p className="text-gray-600">Scan QR ini dengan aplikasi Authenticator, lalu masukkan kode 6 digit.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      {totpQRCode ? (
                        <img src={totpQRCode} alt="TOTP QR" className="w-48 h-48" />
                      ) : (
                        <div className="w-48 h-48 bg-gray-100 rounded-lg animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 font-medium mb-2">Kode 6 digit</label>
                      <input
                        type="text"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-2">Jika tidak bisa scan, gunakan secret: <span className="font-mono break-all">{totpSecret}</span></p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowTOTPSetup(false)}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={verifyTOTPSetup}
                        disabled={totpCode.length !== 6}
                        className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Verifikasi & Aktifkan
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* 2FA Setup Modal */}
            {show2FASetup && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-6 w-full max-w-md"
                >
                  <div className="text-center mb-6">
                    <Lock className="w-12 h-12 mx-auto text-green-600 mb-3" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aktifkan 2FA</h3>
                    <p className="text-gray-600">Tingkatkan keamanan akun dengan autentikasi dua faktor via Telegram</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Keuntungan 2FA:</span>
                      </div>
                      <ul className="text-sm text-green-700 space-y-1 ml-7">
                        <li>• Keamanan login berlapis</li>
                        <li>• Perlindungan dari akses tidak sah</li>
                        <li>• Notifikasi aktivitas mencurigakan</li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShow2FASetup(false)}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Nanti Saja
                      </button>
                      <button
                        onClick={enable2FA}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Aktifkan 2FA
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-6 w-full max-w-md"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{modalTitle}</h3>
                    <p className="text-gray-600 mb-6">{modalMessage}</p>
                    <button
                      onClick={() => setShowSuccessModal(false)}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Error Modal */}
            {showErrorModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-6 w-full max-w-md"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{modalTitle}</h3>
                    <p className="text-gray-600 mb-6">{modalMessage}</p>
                    <button
                      onClick={() => setShowErrorModal(false)}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

          </>
        )}

        {activeMenu === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <History size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Riwayat Coming Soon</h3>
            <p className="text-gray-600">Halaman riwayat akan segera hadir</p>
          </div>
        )}

        {activeMenu === 'store' && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Store size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Toko Coming Soon</h3>
            <p className="text-gray-600">Halaman toko akan segera hadir</p>
          </div>
        )}

        {activeMenu === 'pricing' && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <CreditCard size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pricing Coming Soon</h3>
            <p className="text-gray-600">Halaman pricing akan segera hadir</p>
          </div>
        )}
      </div>
    </div>
  );
}