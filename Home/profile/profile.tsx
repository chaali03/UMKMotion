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
  CheckCircle,
  History,
  DollarSign,
  Store,
  CreditCard,
  Edit2,
  X
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
  const [activeMenu, setActiveMenu] = useState<"profile" | "history" | "store" | "pricing">("profile");
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
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
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              {/* Photo Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
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
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-9 h-9 bg-orange-500 rounded-full border-3 border-white flex items-center justify-center cursor-pointer hover:bg-orange-600 transition"
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
                  className="hidden"
                />
              </div>

              {/* Personal Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Informasi Pribadi</h3>
                  <button 
                    onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                    className="flex items-center gap-2 text-orange-500 font-semibold text-sm px-3 py-2 rounded-lg hover:bg-orange-50 transition"
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
                      <div>
                        <label className="block text-sm text-gray-600 font-medium mb-2">Nomor Telepon</label>
                        <input 
                          type="tel" 
                          value={profileData.phone || ""}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
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
                        disabled={saving}
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
                      <div className="text-sm text-gray-600 font-medium mb-1.5">Nomor Telepon</div>
                      <div className="text-sm text-gray-900 font-medium">{profileData.phone || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1.5">Email</div>
                      <div className="text-sm text-gray-900 font-medium">{profileData.email || '-'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Deskripsi</h3>
                  <button 
                    onClick={() => setIsEditingBio(!isEditingBio)}
                    className="flex items-center gap-2 text-orange-500 font-semibold text-sm px-3 py-2 rounded-lg hover:bg-orange-50 transition"
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
                        disabled={saving}
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
              {/* Stats Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Statistik</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-500 mb-1">{gamificationStats.totalPoints || 0}</div>
                    <div className="text-sm text-gray-600">Total Poin</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-500 mb-1">Level {gamificationStats.level || 1}</div>
                    <div className="text-sm text-gray-600">Level</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-500 mb-1">{gamificationStats.completedMissions || 0}</div>
                    <div className="text-sm text-gray-600">Misi</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-500 mb-1">{userBadges.length}</div>
                    <div className="text-sm text-gray-600">Badge</div>
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