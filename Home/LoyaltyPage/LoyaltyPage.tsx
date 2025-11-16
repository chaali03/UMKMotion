"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { auth, db } from "../../src/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Award, Gift, Star, ShoppingBag, Coffee, Shirt, Palette } from "lucide-react";

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  image: string;
  available: boolean;
}

interface UserLoyalty {
  points: number;
  level: string;
  nextLevelPoints: number;
  totalEarned: number;
  totalRedeemed: number;
}

export default function LoyaltyPage() {
  const [loading, setLoading] = useState(true);
  const [userLoyalty, setUserLoyalty] = useState<UserLoyalty>({
    points: 0,
    level: "Bronze",
    nextLevelPoints: 1000,
    totalEarned: 0,
    totalRedeemed: 0
  });
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          const data = snap.exists() ? snap.data() : {};
          
          // Get loyalty data
          const loyaltyData = data.loyalty || {};
          setUserLoyalty({
            points: loyaltyData.points || Math.floor(Math.random() * 2000) + 500,
            level: getLoyaltyLevel(loyaltyData.points || 1250),
            nextLevelPoints: getNextLevelPoints(loyaltyData.points || 1250),
            totalEarned: loyaltyData.totalEarned || Math.floor(Math.random() * 5000) + 2000,
            totalRedeemed: loyaltyData.totalRedeemed || Math.floor(Math.random() * 1000) + 200
          });
        } catch (error) {
          console.error("Error fetching loyalty data:", error);
        }
      } else {
        // Redirect to login if not authenticated
        window.location.href = "/login";
      }
      setLoading(false);
    });

    // Mock rewards data
    setRewards([
      {
        id: "1",
        name: "Diskon 10% Semua Produk",
        description: "Berlaku untuk semua pembelian di platform UMKMotion",
        points: 500,
        category: "discount",
        image: "/api/placeholder/100/100",
        available: true
      },
      {
        id: "2",
        name: "Kopi Gratis",
        description: "Voucher kopi gratis di kedai partner pilihan",
        points: 300,
        category: "food",
        image: "/api/placeholder/100/100",
        available: true
      },
      {
        id: "3",
        name: "Kaos UMKMotion",
        description: "Kaos eksklusif dengan logo UMKMotion",
        points: 1000,
        category: "merchandise",
        image: "/api/placeholder/100/100",
        available: true
      },
      {
        id: "4",
        name: "Tas Belanja Ramah Lingkungan",
        description: "Tas belanja dari bahan daur ulang",
        points: 750,
        category: "merchandise",
        image: "/api/placeholder/100/100",
        available: true
      },
      {
        id: "5",
        name: "Diskon 25% Produk Fashion",
        description: "Khusus untuk kategori fashion dan aksesoris",
        points: 800,
        category: "discount",
        image: "/api/placeholder/100/100",
        available: true
      }
    ]);

    return () => unsub();
  }, []);

  const getLoyaltyLevel = (points: number) => {
    if (points >= 5000) return "Platinum";
    if (points >= 2500) return "Gold";
    if (points >= 1000) return "Silver";
    return "Bronze";
  };

  const getNextLevelPoints = (points: number) => {
    if (points >= 5000) return 0; // Max level
    if (points >= 2500) return 5000;
    if (points >= 1000) return 2500;
    return 1000;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Platinum": return "text-purple-600 bg-purple-100";
      case "Gold": return "text-yellow-600 bg-yellow-100";
      case "Silver": return "text-gray-600 bg-gray-100";
      default: return "text-orange-600 bg-orange-100";
    }
  };

  const handleRedeem = async (reward: LoyaltyReward) => {
    if (userLoyalty.points < reward.points) {
      alert("Poin tidak mencukupi!");
      return;
    }

    const confirmed = confirm(`Tukar ${reward.points} poin untuk ${reward.name}?`);
    if (!confirmed) return;

    try {
      // Update user points in Firestore
      const user = auth.currentUser;
      if (user) {
        const newPoints = userLoyalty.points - reward.points;
        await updateDoc(doc(db, "users", user.uid), {
          "loyalty.points": newPoints,
          "loyalty.totalRedeemed": userLoyalty.totalRedeemed + reward.points
        });

        setUserLoyalty(prev => ({
          ...prev,
          points: newPoints,
          totalRedeemed: prev.totalRedeemed + reward.points
        }));

        alert("Berhasil menukar poin! Voucher akan dikirim ke email Anda.");
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  const filteredRewards = rewards.filter(reward => 
    selectedCategory === "all" || reward.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600">Memuat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => window.location.href = "/etalase"}
            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Loyalty Points</h1>
        </div>
      </motion.div>

      {/* Loyalty Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">{userLoyalty.points} Poin</h2>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(userLoyalty.level)}`}>
                {userLoyalty.level}
              </span>
              {userLoyalty.nextLevelPoints > 0 && (
                <span className="text-orange-100 text-sm">
                  {userLoyalty.nextLevelPoints - userLoyalty.points} poin lagi ke level berikutnya
                </span>
              )}
            </div>
          </div>
          <Award className="w-12 h-12 text-orange-200" />
        </div>

        {userLoyalty.nextLevelPoints > 0 && (
          <div className="w-full bg-orange-400 rounded-full h-2 mb-4">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${(userLoyalty.points / userLoyalty.nextLevelPoints) * 100}%` }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-orange-200">Total Poin Diperoleh</div>
            <div className="font-semibold">{userLoyalty.totalEarned}</div>
          </div>
          <div>
            <div className="text-orange-200">Total Poin Ditukar</div>
            <div className="font-semibold">{userLoyalty.totalRedeemed}</div>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Semua", icon: Gift },
            { key: "discount", label: "Diskon", icon: Star },
            { key: "food", label: "Makanan", icon: Coffee },
            { key: "merchandise", label: "Merchandise", icon: Shirt }
          ].map((category) => {
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

      {/* Rewards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredRewards.map((reward, index) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-slate-400" />
            </div>
            
            <h3 className="font-semibold text-slate-900 mb-2">{reward.name}</h3>
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{reward.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-orange-600">
                {reward.points} poin
              </div>
              
              <button
                onClick={() => handleRedeem(reward)}
                disabled={userLoyalty.points < reward.points}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                  userLoyalty.points >= reward.points
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {userLoyalty.points >= reward.points ? "Tukar" : "Poin Kurang"}
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* How to Earn Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Cara Mendapatkan Poin</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Berbelanja</div>
              <div className="text-sm text-slate-600">1 poin per Rp 1.000</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Review Produk</div>
              <div className="text-sm text-slate-600">50 poin per review</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Referral</div>
              <div className="text-sm text-slate-600">200 poin per teman</div>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
