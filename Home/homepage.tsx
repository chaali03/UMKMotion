"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../src/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, orderBy, limit, query, onSnapshot } from "firebase/firestore";
import { TrendingUp, Users, Star, Calendar, BarChart3, ShoppingBag, Store, MapPin, Heart, Clock, Award, Search, Filter, ChevronRight, Trophy, Sparkles, Zap, Coffee, ShoppingCart, Phone } from "lucide-react";

interface UserStats {
  totalUMKMVisited: number;
  totalProductsViewed: number;
  averageTimeSpent: string;
  satisfactionRating: number;
  weeklyActivity: number;
  monthlyGrowth: number;
  loyaltyPoints: number;
  monthlySpend: number;
  favoriteCategory: string;
}

interface ActivityItem {
  id: string;
  title: string;
  type: "purchase" | "visit" | "favorite" | "review" | "other";
  amount?: number;
  unit?: string;
  store?: string;
  storeId?: string;
  category?: string;
  createdAt: Date;
  image?: string;
}

interface RecommendedUMKM {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
  image: string;
  address?: string;
  phone?: string;
  mapsLink?: string;
  isNew?: boolean;
}

export default function Homepage() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalUMKMVisited: 12,
    totalProductsViewed: 80,
    averageTimeSpent: "4 hari",
    satisfactionRating: 4.6,
    weeklyActivity: 98,
    monthlyGrowth: 24,
    loyaltyPoints: 1250,
    monthlySpend: 0,
    favoriteCategory: "Makanan & Minuman"
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recommendedUMKM, setRecommendedUMKM] = useState<RecommendedUMKM[]>([]);
  const [chartData, setChartData] = useState<{ month: string; value: number }[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);

  // Haversine distance in KM
  const getDistanceKm = (a: {lat:number,lng:number}, b: {lat:number,lng:number}) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const aHarv = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    const c = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
    return R * c;
  };

  const refreshLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  useEffect(() => {
    // ask for geolocation once
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setUserCoords(null);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    let activitiesUnsub: (() => void) | null = null;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          const data = snap.exists() ? snap.data() : {};
          const displayName = data?.nickname || data?.fullName || user.displayName || (user.email ? user.email.split("@")[0] : "User");
          setUserName(displayName);
          
          // Subscribe to activities for live updates
          try {
            const q = query(
              collection(db, "users", user.uid, "activities"),
              orderBy("createdAt", "desc"),
              limit(100)
            );
            activitiesUnsub = onSnapshot(q, (snapshot) => {
              const items: ActivityItem[] = snapshot.docs.map((d) => {
                const v = d.data() as any;
                return {
                  id: d.id,
                  title: v.title || v.productName || "Aktivitas",
                  type: (v.type as any) || "other",
                  amount: typeof v.amount === "number" ? v.amount : undefined,
                  unit: v.unit || (typeof v.amount === "number" ? "Rp" : undefined),
                  store: v.store || v.umkmName || undefined,
                  storeId: v.storeId || undefined,
                  category: v.category,
                  createdAt: v.createdAt?.toDate ? v.createdAt.toDate() : new Date(v.createdAt || Date.now()),
                  image: v.image
                };
              });
              setActivities(items.length ? items : []);

              // Compute accurate stats from activities and loyalty (from user doc)
              const loyaltyPoints = Number((data as any)?.loyalty?.points || 0);
              const visits = items.filter(i => i.type === 'visit');
              const uniqueVisited = visits.length; // count every visit event, including repeats
              const productsViewed = items.filter(i => i.type === 'purchase' || i.type === 'review').length;

              // Average time spent approximation: number of distinct visit days
              const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
              const distinctDays = new Set(visits.map(v => dayKey(v.createdAt))).size;

              // Weekly activity: visits in last 7 days scaled to percentage (cap 100)
              const nowTs = Date.now();
              const weekAgo = nowTs - 7 * 24 * 60 * 60 * 1000;
              const last7 = visits.filter(v => v.createdAt.getTime() >= weekAgo).length;
              const weeklyActivity = Math.min(100, Math.round((last7 / 10) * 100));

              // Monthly growth: compare visits last 30d vs previous 30d
              const last30 = nowTs - 30 * 24 * 60 * 60 * 1000;
              const prev60 = nowTs - 60 * 24 * 60 * 60 * 1000;
              const cntLast30 = visits.filter(v => v.createdAt.getTime() >= last30).length;
              const cntPrev30 = visits.filter(v => v.createdAt.getTime() < last30 && v.createdAt.getTime() >= prev60).length;
              const monthlyGrowth = cntPrev30 === 0 ? (cntLast30 > 0 ? 100 : 0) : Math.round(((cntLast30 - cntPrev30) / Math.max(1, cntPrev30)) * 100);

              // Monthly spend (last 30 days) and Favorite Category (prefer purchases)
              const purchases = items.filter(i => i.type === 'purchase' && typeof i.amount === 'number');
              const monthlyPurchases = purchases.filter(p => p.createdAt.getTime() >= last30);
              const monthlySpend = monthlyPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);

              const catFromPurch: Record<string, number> = {};
              monthlyPurchases.forEach(p => { if (p.category) catFromPurch[p.category] = (catFromPurch[p.category] || 0) + 1; });
              let favoriteCategory = Object.entries(catFromPurch).sort((a,b)=>b[1]-a[1])[0]?.[0];
              if (!favoriteCategory) {
                const catFromVisits: Record<string, number> = {};
                visits.forEach(v => { if (v.category) catFromVisits[v.category] = (catFromVisits[v.category] || 0) + 1; });
                favoriteCategory = Object.entries(catFromVisits).sort((a,b)=>b[1]-a[1])[0]?.[0] || "Makanan & Minuman";
              }

              setUserStats({
                totalUMKMVisited: uniqueVisited,
                totalProductsViewed: productsViewed,
                averageTimeSpent: `${distinctDays} hari`,
                satisfactionRating: 4.6,
                weeklyActivity,
                monthlyGrowth,
                loyaltyPoints,
                monthlySpend,
                favoriteCategory
              });

              // Build chart data: visits per month for last 8 months
              const months: { label: string; start: Date; end: Date }[] = [];
              const base = new Date();
              for (let i = 7; i >= 0; i--) {
                const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
                const next = new Date(base.getFullYear(), base.getMonth() - i + 1, 1);
                const label = d.toLocaleString('id-ID', { month: 'short' });
                months.push({ label, start: d, end: next });
              }
              const series = months.map(m => ({
                month: m.label,
                value: visits.filter(v => v.createdAt >= m.start && v.createdAt < m.end).length
              }));
              setChartData(series);
            });
          } catch {
            setDefaultActivities();
          }

          // Fetch recommended UMKM from Firestore
          try {
            const storesQuery = query(
              collection(db, "stores"),
              orderBy("rating", "desc"),
              limit(50)
            );
            const storesDocs = await getDocs(storesQuery);
            const storesDataRaw = storesDocs.docs.map((d) => {
              const s = d.data();
              const lat = s.lat || s.latitude || s.location?.lat || s.coords?.lat;
              const lng = s.lng || s.longitude || s.location?.lng || s.location?.lon || s.coords?.lng || s.coords?.lon;
              let distanceStr = "N/A";
              let distanceNum: number | null = null;
              if (userCoords && typeof lat === 'number' && typeof lng === 'number') {
                const km = getDistanceKm(userCoords, { lat, lng });
                distanceNum = km;
                distanceStr = `${km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km'}`;
              }
              return {
                id: d.id,
                name: s.name || "UMKM",
                category: s.category || "Lainnya",
                distance: distanceStr,
                rating: s.rating || 0,
                image: s.profileImage || s.image || "/api/placeholder/80/80",
                address: s.address || s.lokasi || undefined,
                phone: s.phone || undefined,
                mapsLink: s.mapsLink || undefined,
                isNew: !!s.isNew,
                _distanceNum: distanceNum as any
              } as any;
            });
            // Sort by nearest if we have distances
            let withSort: any[] = (storesDataRaw as any[]).sort((a,b) => {
              const da = a._distanceNum; const db = b._distanceNum;
              if (da == null && db == null) return 0;
              if (da == null) return 1;
              if (db == null) return -1;
              return da - db;
            });

            if (userCoords) {
              const insideRadius = withSort.filter(s => typeof s._distanceNum === 'number' && s._distanceNum <= radiusKm);
              if (insideRadius.length > 0) {
                const picked = insideRadius.slice(0, 6).map(({ _distanceNum, ...rest }) => rest);
                setRecommendedUMKM(picked as RecommendedUMKM[]);
              } else {
                // strictly nearby only: show none if nothing within radius
                setRecommendedUMKM([]);
              }
            } else {
              const picked = withSort.slice(0, 6).map(({ _distanceNum, ...rest }) => rest);
              setRecommendedUMKM(picked as RecommendedUMKM[]);
            }

            if (!withSort.length) setRecommendedUMKM([
              { id: "1", name: "Kedai Kopi Gayo", category: "Kafe", distance: "1.2 km", rating: 4.8, image: "/api/placeholder/80/80" }
            ]);
          } catch (err) {
            console.error("Error fetching stores:", err);
            setRecommendedUMKM([
              { id: "1", name: "Kedai Kopi Gayo", category: "Kafe", distance: "1.2 km", rating: 4.8, image: "/api/placeholder/80/80" }
            ]);
          }

        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserName("Pengunjung");
        setUserStats({
          totalUMKMVisited: 5,
          totalProductsViewed: 25,
          averageTimeSpent: "2 hari",
          satisfactionRating: 4.0,
          weeklyActivity: 65,
          monthlyGrowth: 12,
          loyaltyPoints: 0,
          monthlySpend: 0,
          favoriteCategory: "-"
        });

        // Fetch recommended for guests as well (apply nearest if coords available)
        try {
          const storesQuery = query(
            collection(db, "stores"),
            orderBy("rating", "desc"),
            limit(50)
          );
          const storesDocs = await getDocs(storesQuery);
          const storesDataRaw = storesDocs.docs.map((d) => {
            const s = d.data();
            const lat = (s as any).lat || (s as any).latitude || (s as any).location?.lat || (s as any).coords?.lat;
            const lng = (s as any).lng || (s as any).longitude || (s as any).location?.lng || (s as any).location?.lon || (s as any).coords?.lng || (s as any).coords?.lon;
            let distanceStr = "N/A";
            let distanceNum: number | null = null;
            if (userCoords && typeof lat === 'number' && typeof lng === 'number') {
              const km = getDistanceKm(userCoords, { lat, lng });
              distanceNum = km;
              distanceStr = `${km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km'}`;
            }
            return {
              id: d.id,
              name: (s as any).name || "UMKM",
              category: (s as any).category || "Lainnya",
              distance: distanceStr,
              rating: (s as any).rating || 0,
              image: (s as any).profileImage || (s as any).image || "/api/placeholder/80/80",
              address: (s as any).address || (s as any).lokasi || undefined,
              phone: (s as any).phone || undefined,
              mapsLink: (s as any).mapsLink || undefined,
              _distanceNum: distanceNum as any
            } as any;
          });

          let withSort: any[] = (storesDataRaw as any[]).sort((a,b) => {
            const da = a._distanceNum; const db = b._distanceNum;
            if (da == null && db == null) return 0;
            if (da == null) return 1;
            if (db == null) return -1;
            return da - db;
          });

          if (userCoords) {
            const insideRadius = withSort.filter(s => typeof s._distanceNum === 'number' && s._distanceNum <= radiusKm);
            if (insideRadius.length > 0) {
              const picked = insideRadius.slice(0, 6).map(({ _distanceNum, ...rest }) => rest);
              setRecommendedUMKM(picked as RecommendedUMKM[]);
            } else {
              setRecommendedUMKM([]);
            }
          } else {
            const picked = withSort.slice(0, 6).map(({ _distanceNum, ...rest }) => rest);
            setRecommendedUMKM(picked as RecommendedUMKM[]);
          }

          if (!withSort.length) setRecommendedUMKM([
            { id: "1", name: "Kedai Kopi Gayo", category: "Kafe", distance: "1.2 km", rating: 4.8, image: "/api/placeholder/80/80" }
          ]);
        } catch (err) {
          console.error("Error fetching stores:", err);
          setRecommendedUMKM([
            { id: "1", name: "Kedai Kopi Gayo", category: "Kafe", distance: "1.2 km", rating: 4.8, image: "/api/placeholder/80/80" }
          ]);
        }
      }
      setLoading(false);
    });

    return () => { unsub(); if (activitiesUnsub) activitiesUnsub(); };
  }, [userCoords, radiusKm]);

  const setDefaultActivities = () => {
    setActivities([
      { id: "d1", title: "Beli Kopi Gayo", type: "purchase", amount: 45000, unit: "Rp", store: "Kedai Gayo", category: "Minuman", createdAt: new Date() },
      { id: "d2", title: "Kunjungi Toko Batik Citra", type: "visit", store: "Batik Citra", category: "Fashion", createdAt: new Date(Date.now()-3600_000) },
      { id: "d3", title: "Beri Rating UMKM Minang", type: "review", store: "UMKM Minang", category: "Makanan", createdAt: new Date(Date.now()-7200_000) },
      { id: "d4", title: "Simpan Favorit Kerajinan", type: "favorite", store: "Kerajinan Nusantara", category: "Kerajinan", createdAt: new Date(Date.now()-10800_000) }
    ]);
  };

  // chartData is computed from activities (visits per month)

  const filteredActivities = activities
    .filter(activity => activeTab === "all" || activity.type === activeTab)
    .slice(0, 5);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search results page with query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleCategoryClick = (category: string) => {
    window.location.href = `/kategori/${category.toLowerCase()}`;
  };

  const handleUMKMClick = (umkmId: string) => {
    window.location.href = `/umkm/${umkmId}`;
  };

  const handleActivityClick = (activity: ActivityItem) => {
    // Activity items don't have storeId, so we can't navigate directly
    // Just show a message or do nothing for now
    console.log('Activity clicked:', activity);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "purchase": return <ShoppingBag className="w-4 h-4" />;
      case "visit": return <Store className="w-4 h-4" />;
      case "favorite": return <Heart className="w-4 h-4" />;
      case "review": return <Star className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "purchase": return "bg-green-100 text-green-600";
      case "visit": return "bg-blue-100 text-blue-600";
      case "favorite": return "bg-pink-100 text-pink-600";
      case "review": return "bg-yellow-100 text-yellow-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardHoverVariants = {
    initial: { scale: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      y: -5,
      transition: {
        duration: 0.3
      }
    }
  };

  const floatingAnimation: any = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-600"
          >
            Memuat dashboard...
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={floatingAnimation}
          className="absolute top-20 left-10 w-6 h-6 bg-orange-200 rounded-full opacity-50"
        />
        <motion.div
          animate={floatingAnimation}
          transition={{ delay: 1 }}
          className="absolute top-40 right-20 w-8 h-8 bg-blue-200 rounded-full opacity-30"
        />
        <motion.div
          animate={floatingAnimation}
          transition={{ delay: 2 }}
          className="absolute bottom-40 left-20 w-4 h-4 bg-green-200 rounded-full opacity-40"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header dengan Search */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8"
          >
            <div className="flex-1">
              <motion.h1 
                className="text-4xl font-bold text-slate-900 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                Hi {userName}, 👋
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="inline-block ml-2"
                >
                  
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-lg text-slate-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Mari dukung UMKM lokal dengan berbelanja hari ini!
              </motion.p>
            </div>
            <motion.form 
              onSubmit={handleSearch} 
              className="relative w-full sm:w-80"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <motion.input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Cari UMKM atau produk..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-base transition-all duration-300"
                whileFocus={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                }}
              />
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50"
                  >
                    <div className="text-sm text-slate-500 p-2">Coba cari: "kopi", "batik", "kerajinan"</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          </motion.div>

          {/* Quick Stats Bar */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            variants={containerVariants}
          >
            {[
              { value: userStats.loyaltyPoints, label: "Poin Loyalty", href: "/loyalty", icon: Award },
              { value: userStats.totalUMKMVisited, label: "UMKM Dikunjungi", icon: Store },
              { value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(userStats.monthlySpend), label: "Total Belanja Bulan Ini", icon: ShoppingCart },
              { value: (activities.length ? userStats.favoriteCategory : "Belum ada aktivitas"), label: "Kategori Terpilih", icon: TrendingUp }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover="hover"
                className="relative"
              >
                <motion.div
                  variants={cardHoverVariants}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  {/* Animated background effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-100%]"
                    whileHover={{ translateX: "100%" }}
                    transition={{ duration: 0.8 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats & Chart Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div 
                      className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Users className="w-6 h-6" />
                    </motion.div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{userStats.totalUMKMVisited}</div>
                  <div className="text-orange-100">UMKM Telah Dikunjungi</div>
                  <div className="flex items-center gap-1 mt-2 text-orange-200 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    +{userStats.monthlyGrowth}% dari bulan lalu
                  </div>
                </div>
                {/* Animated background elements */}
                <motion.div
                  className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div 
                      className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Award className="w-6 h-6" />
                    </motion.div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{userStats.loyaltyPoints}</div>
                  <div className="text-blue-100">Poin Loyalty</div>
                  <div className="text-blue-200 text-sm mt-2">Tukar dengan hadiah menarik</div>
                </div>
                {/* Floating particles */}
                <motion.div
                  className="absolute top-4 right-6 w-2 h-2 bg-white/30 rounded-full"
                  animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </motion.div>
            </div>

            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Statistik Kunjungan UMKM</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BarChart3 className="w-4 h-4" />
                  <span>6 Bulan Terakhir</span>
                </div>
              </div>
              
              <div className="h-48 flex items-end justify-between gap-2 px-4">
                {chartData.slice(-6).map((item, index) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.value / 80) * 100}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                      whileHover={{ scale: 1.1 }}
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg min-h-[20px] relative group max-w-12 cursor-pointer"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-slate-700 bg-white px-2 py-1 rounded shadow-lg whitespace-nowrap"
                      >
                        {item.value} kunjungan
                      </motion.div>
                    </motion.div>
                    <div className="text-xs text-slate-500 mt-2">{item.month}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recommended UMKM */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-slate-900">UMKM Terdekat</h3>
              <div className="flex items-center gap-3 ml-auto">
                <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                  {[2,5,10,20].map(v => (
                    <button
                      key={v}
                      onClick={() => setRadiusKm(v)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${radiusKm===v? 'bg-white text-slate-900 shadow-sm':'text-slate-600 hover:text-slate-900'}`}
                    >
                      {v} km
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Radius:</span>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-28 accent-orange-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 w-8 text-right">{radiusKm}k</span>
                </div>
                <motion.a 
                  href="/rumah-umkm" 
                  className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  Lihat semua <ChevronRight className="w-4 h-4" />
                </motion.a>
              </div>
            </div>
            
            <div className="space-y-4">
              {recommendedUMKM.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <div className="w-10 h-10 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="font-medium text-slate-700 mb-1">UMKM terdekat tidak ditemukan</div>
                  <div className="text-sm mb-2">Periksa izin lokasi atau coba perluas radius</div>
                  <div className="text-xs text-slate-400">Radius saat ini: {radiusKm} km</div>
                </div>
              ) : recommendedUMKM.map((umkm, index) => (
                <motion.div
                  key={umkm.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: "rgba(249, 250, 251, 1)"
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 group relative overflow-hidden"
                  onClick={() => handleUMKMClick(umkm.id)}
                >
                  <div className="relative">
                    <motion.img
                      src={umkm.image}
                      alt={umkm.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                      whileHover={{ rotate: 3 }}
                    />
                    {umkm.isNew && (
                      <motion.div 
                        className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                      >
                        Baru
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                      {umkm.name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {umkm.address || 'N/A'} • {umkm.category}
                    </div>
                    {umkm.phone && (
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {umkm.phone}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-slate-700">{umkm.rating}</span>
                  </div>
                  {/* Hover effect line */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>

            
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { title: "Belanja Produk", desc: "Temukan produk UMKM terbaik", icon: ShoppingBag, href: "/etalase", color: "orange" },
            { title: "Kunjungi UMKM", desc: "Temukan UMKM terdekat", icon: Store, href: "/rumah-umkm", color: "blue" },
            { title: "Rekomendasi AI", desc: "Dapatkan rekomendasi personalized", icon: Sparkles, href: "/ai", color: "purple" },
            { title: "Promo & Diskon", desc: "Penawaran spesial untukmu", icon: Award, href: "/promo", color: "green" },
            { title: "Misi & Badge", desc: "Selesaikan misi dan kumpulkan badge", icon: Trophy, href: "/gamifikasi", color: "purple" },
          ].map((action, index) => (
            <motion.a
              key={action.title}
              href={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover="hover"
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
              <motion.div
                variants={cardHoverVariants}
                className="relative z-10"
              >
                <div className={`w-12 h-12 bg-${action.color}-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-${action.color}-500 transition-colors duration-300`}>
                  <action.icon className={`w-6 h-6 text-${action.color}-600 group-hover:text-white transition-colors duration-300`} />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-800 transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">
                  {action.desc}
                </p>
              </motion.div>
              {/* Animated background on hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                initial={false}
              />
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-100%]"
                whileHover={{ translateX: "100%" }}
                transition={{ duration: 0.8 }}
              />
            </motion.a>
          ))}
        </motion.div>

        {/* Recent Activity dengan Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Aktivitas Terkini</h3>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {["all", "purchase", "visit", "favorite"].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab === "all" ? "Semua" : 
                   tab === "purchase" ? "Pembelian" :
                   tab === "visit" ? "Kunjungan" : "Favorit"}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {filteredActivities.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-slate-500"
                >
                  Tidak ada aktivitas {activeTab !== "all" ? "pada kategori ini" : ""}
                </motion.div>
              ) : (
                <motion.div
                  key="activities"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ 
                        x: 5,
                        backgroundColor: "rgba(249, 250, 251, 1)"
                      }}
                      className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group cursor-pointer"
                      onClick={() => handleActivityClick(activity)}
                    >
                      <motion.div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActivityColor(activity.type)}`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {getActivityIcon(activity.type)}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 group-hover:text-orange-600 transition-colors">
                          {activity.title}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          {activity.store && (
                            <>
                              <span>di {activity.store}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{activity.createdAt.toLocaleString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                        </div>
                      </div>
                      {activity.amount && (
                        <motion.div 
                          className="text-sm font-semibold text-slate-900 whitespace-nowrap"
                          whileHover={{ scale: 1.1 }}
                        >
                          {activity.unit} {activity.amount.toLocaleString('id-ID')}
                        </motion.div>
                      )}
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}