"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../src/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  Star, 
  Gift, 
  Zap, 
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  Users,
  ShoppingBag,
  Heart,
  MessageCircle,
  Share2,
  Calendar
} from "lucide-react";

interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  points: number;
  badge: string;
  category: string;
  difficulty: string;
  isActive: boolean;
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

interface UserProgress {
  missionId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

interface UserBadge {
  badgeId: string;
  earnedAt: Date;
  fromMission?: string;
}

export default function GamificationPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [activeTab, setActiveTab] = useState<"missions" | "badges">("missions");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    completedMissions: 0,
    earnedBadges: 0,
    level: 1,
    nextLevelPoints: 1000
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await Promise.all([
          fetchMissions(),
          fetchBadges(),
          fetchUserProgress(user.uid),
          fetchUserBadges(user.uid),
          fetchUserStats(user.uid)
        ]);
      } else {
        window.location.href = "/login";
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const fetchMissions = async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "missions"), where("isActive", "==", true))
      );
      const missionsList: Mission[] = [];
      querySnapshot.forEach((doc) => {
        missionsList.push({ ...doc.data() } as Mission);
      });
      setMissions(missionsList);
    } catch (error) {
      console.error("Error fetching missions:", error);
    }
  };

  const fetchBadges = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "badges"));
      const badgesList: Badge[] = [];
      querySnapshot.forEach((doc) => {
        badgesList.push({ ...doc.data() } as Badge);
      });
      setBadges(badgesList);
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  const fetchUserProgress = async (uid: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, "users", uid, "progress"));
      const progressList: UserProgress[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        progressList.push({
          missionId: doc.id,
          progress: data.progress || 0,
          completed: data.completed || false,
          completedAt: data.completedAt?.toDate()
        });
      });
      setUserProgress(progressList);
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  const fetchUserBadges = async (uid: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, "users", uid, "badges"));
      const badgesList: UserBadge[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        badgesList.push({
          badgeId: doc.id,
          earnedAt: data.earnedAt?.toDate() || new Date(),
          fromMission: data.fromMission
        });
      });
      setUserBadges(badgesList);
    } catch (error) {
      console.error("Error fetching user badges:", error);
    }
  };

  const fetchUserStats = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      const userData = userDoc.data();
      const gamification = userData?.gamification || {};
      
      setUserStats({
        totalPoints: gamification.totalPoints || 0,
        completedMissions: gamification.completedMissions || 0,
        earnedBadges: gamification.earnedBadges || 0,
        level: calculateLevel(gamification.totalPoints || 0),
        nextLevelPoints: getNextLevelPoints(gamification.totalPoints || 0)
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const calculateLevel = (points: number) => {
    return Math.floor(points / 1000) + 1;
  };

  const getNextLevelPoints = (points: number) => {
    const currentLevel = calculateLevel(points);
    return currentLevel * 1000;
  };

  const getMissionProgress = (missionId: string) => {
    return userProgress.find(p => p.missionId === missionId);
  };

  const isBadgeEarned = (badgeId: string) => {
    return userBadges.some(b => b.badgeId === badgeId);
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingBag className="w-5 h-5" />;
      case 'visit': return <Users className="w-5 h-5" />;
      case 'review': return <Star className="w-5 h-5" />;
      case 'favorite': return <Heart className="w-5 h-5" />;
      case 'share': return <Share2 className="w-5 h-5" />;
      case 'login': return <Calendar className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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

  const filteredMissions = missions.filter(mission => 
    selectedCategory === "all" || mission.category === selectedCategory
  );

  const filteredBadges = badges.filter(badge => 
    selectedCategory === "all" || badge.category === selectedCategory
  );

  const categories = [
    { key: "all", label: "Semua", icon: Trophy },
    { key: "beginner", label: "Pemula", icon: Star },
    { key: "spending", label: "Belanja", icon: ShoppingBag },
    { key: "engagement", label: "Interaksi", icon: Heart },
    { key: "loyalty", label: "Loyalitas", icon: Award },
    { key: "social", label: "Sosial", icon: Share2 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600">Memuat gamifikasi...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => window.location.href = "/homepage"}
              className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-orange-600" />
                Gamifikasi
              </h1>
              <p className="text-slate-600">Selesaikan misi dan kumpulkan badge untuk mendapatkan reward</p>
            </div>
          </div>

          {/* User Stats */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.totalPoints}</div>
                <div className="text-orange-100 text-sm">Total Poin</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Level {userStats.level}</div>
                <div className="text-orange-100 text-sm">
                  {userStats.nextLevelPoints - userStats.totalPoints} poin lagi
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.completedMissions}</div>
                <div className="text-orange-100 text-sm">Misi Selesai</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.earnedBadges}</div>
                <div className="text-orange-100 text-sm">Badge Diperoleh</div>
              </div>
            </div>
            
            {/* Level Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-orange-100 mb-2">
                <span>Level {userStats.level}</span>
                <span>Level {userStats.level + 1}</span>
              </div>
              <div className="w-full bg-orange-400 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${((userStats.totalPoints % 1000) / 1000) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab("missions")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "missions"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Target className="w-5 h-5" />
              Misi ({missions.length})
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
              Badge ({badges.length})
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === category.key
                      ? "bg-orange-500 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "missions" ? (
            <motion.div
              key="missions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredMissions.map((mission, index) => {
                const progress = getMissionProgress(mission.id);
                const progressPercentage = progress ? (progress.progress / mission.target) * 100 : 0;
                const isCompleted = progress?.completed || false;

                return (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
                      isCompleted 
                        ? "border-green-200 bg-green-50" 
                        : "border-slate-200 hover:border-orange-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCompleted ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                      }`}>
                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : getMissionIcon(mission.type)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(mission.difficulty)}`}>
                          {mission.difficulty}
                        </span>
                        {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                    </div>

                    <h3 className="font-semibold text-slate-900 mb-2">{mission.title}</h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{mission.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Progress</span>
                        <span>{progress?.progress || 0}/{mission.target}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isCompleted ? "bg-green-500" : "bg-orange-500"
                          }`}
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Reward */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span>{mission.points} poin</span>
                      </div>
                      {mission.badge && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Award className="w-4 h-4 text-purple-500" />
                          <span>Badge</span>
                        </div>
                      )}
                    </div>

                    {isCompleted && progress?.completedAt && (
                      <div className="mt-3 pt-3 border-t border-green-200 text-xs text-green-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Selesai {progress.completedAt.toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="badges"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {filteredBadges.map((badge, index) => {
                const isEarned = isBadgeEarned(badge.id);
                const userBadge = userBadges.find(b => b.badgeId === badge.id);

                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative bg-white rounded-2xl p-4 text-center border-2 transition-all duration-300 hover:scale-105 ${
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

                    {isEarned && userBadge && (
                      <div className="mt-2 text-xs text-green-600">
                        Diperoleh {userBadge.earnedAt.toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {((activeTab === "missions" && filteredMissions.length === 0) || 
          (activeTab === "badges" && filteredBadges.length === 0)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-slate-500 mb-2">
              Tidak ada {activeTab === "missions" ? "misi" : "badge"} untuk kategori ini
            </div>
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-orange-600 hover:text-orange-700 text-sm"
            >
              Lihat semua
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
