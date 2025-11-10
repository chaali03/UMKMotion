"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { auth, db, storage } from "../../src/lib/firebase";
import { onAuthStateChanged, updateProfile, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getUserBadges, getUserGamificationStats } from "../../src/lib/gamification";
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
  CheckCircle
} from "lucide-react";

interface UserProfileData {
  nickname?: string;
  fullName?: string;
  phone?: string;
  bio?: string;
  photoURL?: string;
  email?: string | null;
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
  const [activeTab, setActiveTab] = useState<"profile" | "badges">("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }

      setCurrentUser(user);
      
      try {
        // Fetch user profile data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        setProfileData({
          nickname: userData.nickname || "",
          fullName: userData.fullName || "",
          phone: userData.phone || "",
          bio: userData.bio || "",
          photoURL: userData.photoURL || user.photoURL || "",
          email: user.email
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

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: profileData.nickname || profileData.fullName,
        photoURL: photoURL
      });

      // Update Firestore document
      await setDoc(doc(db, "users", currentUser.uid), {
        ...profileData,
        photoURL,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setProfileData(prev => ({ ...prev, photoURL }));
      setPreviewImage(null);
      alert("Profil berhasil diperbarui!");
      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Gagal memperbarui profil");
    }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      alert("Email reset password telah dikirim!");
    } catch (error) {
      console.error("Error sending password reset:", error);
      alert("Gagal mengirim email reset password");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Profil Saya</h1>
          <p className="text-slate-600">Kelola informasi profil dan lihat pencapaian Anda</p>
        </motion.div>

        {/* Gamification Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{gamificationStats.totalPoints || 0}</div>
              <div className="text-orange-100 text-sm">Total Poin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">Level {gamificationStats.level || 1}</div>
              <div className="text-orange-100 text-sm">Level Saat Ini</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{gamificationStats.completedMissions || 0}</div>
              <div className="text-orange-100 text-sm">Misi Selesai</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{userBadges.length}</div>
              <div className="text-orange-100 text-sm">Badge Diperoleh</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-5 h-5" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "badges"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
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
            className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
          >
            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                  {previewImage || profileData.photoURL ? (
                    <img
                      src={previewImage || profileData.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-slate-400" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Panggilan
                </label>
                <input
                  type="text"
                  value={profileData.nickname || ""}
                  onChange={(e) => setProfileData(prev => ({ ...prev, nickname: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Masukkan nama panggilan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileData.fullName || ""}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={profileData.phone || ""}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Masukkan nomor telepon"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ceritakan tentang diri Anda..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              
              <button
                onClick={handleResetPassword}
                className="flex-1 bg-slate-100 text-slate-700 py-3 px-6 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Reset Kata Sandi
              </button>
              
              <button
                onClick={handleSignOut}
                className="flex-1 bg-red-100 text-red-700 py-3 px-6 rounded-xl font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Keluar
              </button>
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
                      className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 ${
                        isEarned 
                          ? `${getRarityColor(badge.rarity)} shadow-lg` 
                          : "border-slate-200 opacity-60 hover:opacity-80"
                      }`}
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
      </div>
    </div>
  );
}
