import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db, storage } from "../../src/lib/firebase";
import { 
  onAuthStateChanged, 
  updateProfile, 
  sendPasswordResetEmail, 
  signOut
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  getDocs,
  Timestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getUserBadges, getUserGamificationStats } from "../../src/lib/gamification";
import { 
  User as UserIcon,
  History, 
  DollarSign, 
  Store, 
  Settings, 
  LogOut,
  Edit2,
  Camera,
  Save,
  X,
  Plus,
  Trash2,
  MessageCircle,
  Calendar,
  Clock,
  Package,
  TrendingUp,
  Eye,
  Edit,
  Search,
  Filter,
  MoreVertical, 
  Loader2, 
  Mail, 
  Phone, 
  FileText, 
  Trophy,
  Award,
  Star,
  Zap,
  CheckCircle,
  Lock,
  MapPin,
  Navigation
} from 'lucide-react';

// ... (interfaces tetap sama)
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  sold: number;
  status: 'active' | 'inactive';
}

interface ConsultHistory {
  id: number;
  consultantName: string;
  consultantImage: string;
  specialty: string;
  date: string;
  duration: string;
  topics: string[];
  status: 'completed' | 'scheduled';
  rating?: number;
}

interface UserProfileData {
  nickname?: string;
  fullName?: string;
  phone?: string;
  bio?: string;
  photoURL?: string;
  email?: string | null;
  location?: string;
  businessName?: string;
  joinDate?: string;
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
  earnedAt: Date | Timestamp;
  fromMission?: string;
}

interface NewProduct {
  name: string;
  price: string;
  stock: string;
  category: string;
  image: string;
}

interface ProfileCompletionItem {
  label: string;
  percentage: number;
  completed: boolean;
}

interface GamificationStats {
  totalPoints?: number;
  level?: number;
  completedMissions?: number;
  totalBadges?: number;
  [key: string]: any;
}

interface FavoriteAddress {
  id: number;
  name: string;
  address: string;
  city: string;
  distance: string;
  savedAt: string;
  isDefault?: boolean;
}

interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  storeName: string;
  rating: number;
  sold: number;
  savedAt: string;
}

interface FavoriteStore {
  id: number;
  name: string;
  image: string;
  category: string;
  rating: number;
  totalProducts: number;
  location: string;
  savedAt: string;
  isVerified?: boolean;
}

type MenuType = 'profile' | 'history' | 'pricing' | 'store' | 'settings';

const UMKMProfilePage: React.FC = () => {
  // State Management with proper typing
  const [isEditingPersonal, setIsEditingPersonal] = useState<boolean>(false);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<MenuType>('profile');
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showAllBadgesModal, setShowAllBadgesModal] = useState<boolean>(false);
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'consultation' | 'address' | 'product' | 'store'>('consultation');
  const [profileData, setProfileData] = useState<UserProfileData>({
    nickname: "",
    fullName: "",
    phone: "",
    bio: "",
    photoURL: "",
    email: "",
    location: "",
    businessName: "",
    joinDate: ""
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [gamificationStats, setGamificationStats] = useState<GamificationStats>({});
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
          email: user.email,
          location: userData.location || "",
          businessName: userData.businessName || "",
          joinDate: userData.joinDate || new Date().toLocaleDateString('id-ID')
        });

        // Fetch gamification data - dengan error handling
        try {
          const userBadgesData = await getUserBadges(user.uid);
          setUserBadges(userBadgesData || []);
        } catch (error) {
          console.error("Error fetching user badges:", error);
          setUserBadges([]);
        }

        try {
          const badgesData = await fetchAllBadges();
          setBadges(badgesData);
        } catch (error) {
          console.error("Error fetching badges:", error);
          setBadges([]);
        }

        try {
          const statsData = await getUserGamificationStats(user.uid);
          setGamificationStats(statsData || {});
        } catch (error) {
          console.error("Error fetching gamification stats:", error);
          setGamificationStats({});
        }
        
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
        const data = doc.data();
        badgesList.push({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          icon: data.icon || '🏆',
          color: data.color || 'gray',
          category: data.category || 'general',
          rarity: data.rarity || 'common',
          points: data.points || 0
        });
      });
      return badgesList;
    } catch (error) {
      console.error("Error fetching badges:", error);
      return [];
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

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getBadgeCategories = (): string[] => {
    const categories = new Set(badges.map(badge => badge.category));
    return ['all', ...Array.from(categories)];
  };

  const getFilteredBadges = (): Badge[] => {
    if (selectedBadgeCategory === 'all') {
      return badges;
    }
    return badges.filter(badge => badge.category === selectedBadgeCategory);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (): Promise<void> => {
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
      setIsEditingPersonal(false);
      setIsEditingBio(false);
      alert("Profil berhasil diperbarui!");
      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Gagal memperbarui profil");
    }
    setSaving(false);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Data dummy tetap sama
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: 'Nasi Goreng Special',
      price: 25000,
      stock: 50,
      category: 'Makanan',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=300&fit=crop',
      sold: 234,
      status: 'active'
    },
    {
      id: 2,
      name: 'Ayam Bakar Madu',
      price: 35000,
      stock: 30,
      category: 'Makanan',
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=300&fit=crop',
      sold: 189,
      status: 'active'
    },
    {
      id: 3,
      name: 'Es Teh Manis',
      price: 5000,
      stock: 100,
      category: 'Minuman',
      image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=300&fit=crop',
      sold: 456,
      status: 'active'
    },
    {
      id: 4,
      name: 'Sate Ayam (10 tusuk)',
      price: 30000,
      stock: 0,
      category: 'Makanan',
      image: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=300&h=300&fit=crop',
      sold: 167,
      status: 'inactive'
    }
  ]);

  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    price: '',
    stock: '',
    category: 'Makanan',
    image: ''
  });

  const consultHistory: ConsultHistory[] = [
    {
      id: 1,
      consultantName: 'Dr. Budi Santoso',
      consultantImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
      specialty: 'Manajemen Keuangan UMKM',
      date: '15 Nov 2024',
      duration: '45 menit',
      topics: ['Pembukuan', 'Cash Flow', 'Laporan Keuangan'],
      status: 'completed',
      rating: 5
    },
    {
      id: 2,
      consultantName: 'Siti Nurhaliza',
      consultantImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
      specialty: 'Digital Marketing & Branding',
      date: '10 Nov 2024',
      duration: '60 menit',
      topics: ['Social Media', 'Content Strategy', 'Instagram Marketing'],
      status: 'completed',
      rating: 5
    },
    {
      id: 3,
      consultantName: 'Ahmad Wijaya',
      consultantImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      specialty: 'Strategi Bisnis & Ekspansi',
      date: '20 Nov 2024',
      duration: '30 menit',
      topics: ['Business Plan', 'Market Analysis'],
      status: 'scheduled'
    },
    {
      id: 4,
      consultantName: 'Dewi Lestari',
      consultantImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
      specialty: 'Legalitas & Perizinan UMKM',
      date: '5 Nov 2024',
      duration: '40 menit',
      topics: ['NIB', 'Izin Usaha', 'PIRT'],
      status: 'completed',
      rating: 4
    }
  ];

  const handleAddProduct = (): void => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    const product: Product = {
      id: products.length + 1,
      name: newProduct.name,
      price: parseInt(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: newProduct.category,
      image: newProduct.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
      sold: 0,
      status: 'active'
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', price: '', stock: '', category: 'Makanan', image: '' });
    setShowAddProduct(false);
  };

  const handleDeleteProduct = (id: number): void => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleUpdateStock = (id: number, change: number): void => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + change) } : p
    ));
  };

  // Favorites dummy data
  const favoriteAddresses: FavoriteAddress[] = [
  {
      id: 1,
      name: 'Alamat Usaha Utama',
      address: 'Jl. Sudirman No. 123, Kelurahan Melati',
      city: 'Jakarta Selatan',
      distance: '2.5 km',
      savedAt: '10 Nov 2024',
      isDefault: true
    },
    {
      id: 2,
      name: 'Cabang Bekasi',
      address: 'Ruko Galaxy Blok B-12, Jl. Kemang Pratama',
      city: 'Bekasi Barat',
      distance: '15 km',
      savedAt: '5 Nov 2024'
    },
    {
      id: 3,
      name: 'Gudang Pusat',
      address: 'Kawasan Industri MM2100, Blok J-5',
      city: 'Cikarang',
      distance: '35 km',
      savedAt: '1 Nov 2024'
    }
  ];

  const favoriteProducts: FavoriteProduct[] = [
    {
      id: 1,
      name: 'Kemasan Box Premium Custom',
      price: 15000,
      image: 'https://images.unsplash.com/photo-1565206077212-4eb48d41f54b?w=300&h=300&fit=crop',
      storeName: 'CV. Packaging Solution',
      rating: 4.8,
      sold: 523,
      savedAt: '12 Nov 2024'
    },
    {
      id: 2,
      name: 'Stiker Label Produk Waterproof',
      price: 25000,
      image: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=300&h=300&fit=crop',
      storeName: 'Percetakan Maju Jaya',
      rating: 4.5,
      sold: 892,
      savedAt: '8 Nov 2024'
    },
    {
      id: 3,
      name: 'Display Stand Akrilik',
      price: 75000,
      image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=300&h=300&fit=crop',
      storeName: 'Toko Display Pro',
      rating: 4.9,
      sold: 156,
      savedAt: '3 Nov 2024'
    }
  ];

  const favoriteStores: FavoriteStore[] = [
    {
      id: 1,
      name: 'CV. Packaging Solution',
      image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=100&h=100&fit=crop',
      category: 'Packaging & Kemasan',
      rating: 4.8,
      totalProducts: 124,
      location: 'Jakarta Barat',
      savedAt: '15 Nov 2024',
      isVerified: true
    },
    {
      id: 2,
      name: 'Toko Bahan Kue Sejahtera',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop',
      category: 'Bahan Makanan',
      rating: 4.7,
      totalProducts: 256,
      location: 'Tangerang',
      savedAt: '10 Nov 2024',
      isVerified: true
    },
    {
      id: 3,
      name: 'Supplier Elektronik Jaya',
      image: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=100&h=100&fit=crop',
      category: 'Elektronik & Gadget',
      rating: 4.6,
      totalProducts: 89,
      location: 'Depok',
      savedAt: '5 Nov 2024'
    }
  ];
  const profileCompletion: ProfileCompletionItem[] = [
    { label: 'Setup akun', percentage: 10, completed: true },
    { label: 'Upload foto profil', percentage: 10, completed: !!profileData.photoURL },
    { label: 'Informasi pribadi', percentage: 15, completed: !!(profileData.fullName && profileData.phone) },
    { label: 'Lokasi usaha', percentage: 15, completed: !!profileData.location },
    { label: 'Deskripsi bisnis', percentage: 20, completed: !!profileData.bio },
    { label: 'Informasi toko', percentage: 30, completed: !!profileData.businessName }
  ];

  const totalCompletion: number = profileCompletion
    .filter(item => item.completed)
    .reduce((sum, item) => sum + item.percentage, 0);

  const radius: number = 60;
  const circumference: number = 2 * Math.PI * radius;
  const offset: number = circumference - (totalCompletion / 100) * circumference;

  // Modal Component untuk menampilkan semua badge
  const AllBadgesModal = () => (
    <AnimatePresence>
      {showAllBadgesModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAllBadgesModal(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-6 h-6 text-orange-500" />
                      <h2 className="text-xl font-bold text-gray-900">
                        Semua Badge ({badges.length})
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowAllBadgesModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {getBadgeCategories().map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedBadgeCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                          selectedBadgeCategory === category
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category === 'all' ? 'Semua' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                  {/* Progress Stats */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Progress Badge</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {userBadges.length} / {badges.length} Badge Diperoleh
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Completion Rate</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {Math.round((userBadges.length / badges.length) * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 bg-white rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
                        style={{ width: `${(userBadges.length / badges.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Badge Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getFilteredBadges().map((badge) => {
                      const isEarned = userBadges.some(ub => ub.badgeId === badge.id);
                      const userBadge = userBadges.find(ub => ub.badgeId === badge.id);

                      return (
                        <motion.div
                          key={badge.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative p-4 rounded-xl border-2 transition-all ${
                            isEarned 
                              ? getRarityColor(badge.rarity)
                              : 'border-gray-200 bg-gray-50 opacity-75'
                          }`}
                        >
                          {/* Status Badge */}
                          {isEarned ? (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                              <Lock className="w-3 h-3 text-white" />
                            </div>
                          )}

                          {/* Badge Content */}
                          <div className="text-center">
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-1">
                              {badge.name}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {badge.description}
                            </p>

                            {/* Badge Info */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-center gap-1 text-xs">
                                <Zap className="w-3 h-3 text-yellow-500" />
                                <span className="text-gray-600">{badge.points} poin</span>
                              </div>
                              <div className={`text-xs font-medium ${getRarityTextColor(badge.rarity)}`}>
                                {badge.rarity.toUpperCase()}
                              </div>
                              {isEarned && userBadge && (
                                <div className="text-xs text-green-600 font-medium">
                                  ✓ {typeof userBadge.earnedAt === 'object' && 'toDate' in userBadge.earnedAt
                                    ? userBadge.earnedAt.toDate().toLocaleDateString('id-ID')
                                    : new Date(userBadge.earnedAt as any).toLocaleDateString('id-ID')}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Empty State */}
                  {getFilteredBadges().length === 0 && (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Tidak ada badge dalam kategori ini</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render Profile Content dengan updated badges section
  const renderProfileContent = (): JSX.Element => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Profile Photo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
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
                  <UserIcon className="w-16 h-16 text-slate-400" />
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
            <h2 className="text-xl font-bold text-gray-900 mt-4">
              {profileData.fullName || profileData.nickname || 'User'}
            </h2>
            <p className="text-sm text-gray-600">{profileData.email}</p>
          </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={profileData.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, fullName: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-2">Nomor Telepon</label>
                  <input 
                    type="tel" 
                    value={profileData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-2">Lokasi</label>
                  <input 
                    type="text" 
                    value={profileData.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, location: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-2">Nama Usaha</label>
                  <input 
                    type="text" 
                    value={profileData.businessName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, businessName: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
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
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Nama Lengkap</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.fullName || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Email</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.email || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Nomor Telepon</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.phone || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Lokasi</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.location || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Nama Usaha</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.businessName || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1.5">Bergabung Sejak</div>
                <div className="text-sm text-gray-900 font-medium">{profileData.joinDate || '-'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Deskripsi Bisnis</h3>
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
                value={profileData.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfileData({...profileData, bio: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[120px] resize-y"
                placeholder="Ceritakan tentang bisnis Anda..."
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
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-700 leading-relaxed text-sm">
              {profileData.bio || 'Belum ada deskripsi bisnis'}
            </p>
          )}
        </div>

        {/* Badges Section dengan tombol untuk membuka modal */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              Pencapaian & Badge
            </h3>
            <p className="text-sm text-gray-600 mt-1">Badge yang telah Anda dapatkan</p>
          </div>

          {/* Gamification Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{gamificationStats.totalPoints || 0}</div>
              <div className="text-xs text-gray-600">Total Poin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">Level {gamificationStats.level || 1}</div>
              <div className="text-xs text-gray-600">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{gamificationStats.completedMissions || 0}</div>
              <div className="text-xs text-gray-600">Misi Selesai</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userBadges.length}</div>
              <div className="text-xs text-gray-600">Badge</div>
            </div>
          </div>

          {/* Earned Badges */}
          {userBadges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Belum ada badge yang diperoleh</p>
              <p className="text-sm mt-1">Selesaikan misi untuk mendapatkan badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {userBadges.slice(0, 5).map((userBadge) => {
                const badge = getBadgeData(userBadge.badgeId);
                if (!badge) return null;

                return (
                  <motion.div
                    key={userBadge.badgeId}
                    whileHover={{ scale: 1.1 }}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all duration-300 ${getRarityColor(badge.rarity)}`}
                  >
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <h4 className="font-semibold text-xs text-gray-900 line-clamp-1">{badge.name}</h4>
                    
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span>{badge.points}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* View All Badges Button */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button 
              onClick={() => setShowAllBadgesModal(true)}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 mx-auto transition"
            >
              <Star className="w-4 h-4" />
              Lihat semua {badges.length} badge yang tersedia
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Completion Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-5">Kelengkapan Profil</h3>
          
          <div className="flex justify-center mb-6">
            <div className="relative w-36 h-36">
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="10"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  fill="none"
                  stroke="#ff6b35"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-orange-500">
                {totalCompletion}%
              </div>
            </div>
          </div>

          <div className="space-y-0">
            {profileCompletion.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    item.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {item.completed && '✓'}
                  </div>
                  <span className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  item.completed ? 'text-green-500' : 'text-orange-500'
                }`}>
                  {item.completed ? `✓ ${item.percentage}%` : `+${item.percentage}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Store Content
    const renderStoreContent = (): JSX.Element => (
      <div className="space-y-6">
        {/* Store Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Package className="text-orange-500" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{products.length}</div>
            <div className="text-sm text-gray-600">Total Produk</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-green-500" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{products.filter(p => p.status === 'active').length}</div>
            <div className="text-sm text-gray-600">Produk Aktif</div>
          </div>
  
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Store className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{products.reduce((sum, p) => sum + p.sold, 0)}</div>
            <div className="text-sm text-gray-600">Total Terjual</div>
          </div>
  
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-purple-500" size={24} />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR', 
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              }).format(
                products.reduce((sum, p) => sum + (p.price * p.sold), 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Total Pendapatan</div>
          </div>
        </div>
  
        {/* Products Management */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Kelola Produk</h3>
                <p className="text-sm text-gray-600 mt-1">Tambah, edit, atau hapus produk Anda</p>
              </div>
              <button 
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
              >
                <Plus size={20} />
                Tambah Produk
              </button>
            </div>
  
            {/* Search and Filter */}
            <div className="flex gap-3 mt-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                <Filter size={20} />
                Filter
              </button>
            </div>
          </div>
  
          {/* Add Product Form */}
          {showAddProduct && (
            <div className="p-6 bg-orange-50 border-b border-orange-100">
              <h4 className="font-bold text-gray-900 mb-4">Tambah Produk Baru</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Contoh: Nasi Goreng"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={newProduct.category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option>Makanan</option>
                    <option>Minuman</option>
                    <option>Snack</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="25000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stok</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, stock: e.target.value})}
                    placeholder="50"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                >
                  Simpan Produk
                </button>
              </div>
            </div>
          )}
  
          {/* Products List */}
          <div className="p-6">
            <div className="grid gap-4">
              {products.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((product) => (
                <div key={product.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-md transition">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full md:w-24 h-32 md:h-24 rounded-xl object-cover"
                  />
                  
                  <div className="flex-1 w-full">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{product.name}</h4>
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mt-1">
                          {product.category}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="font-semibold text-orange-500 text-lg">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                      <span>Stok: <strong className={product.stock === 0 ? 'text-red-500' : 'text-gray-900'}>{product.stock}</strong></span>
                      <span>Terjual: <strong className="text-gray-900">{product.sold}</strong></span>
                    </div>
  
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => handleUpdateStock(product.id, -1)}
                          disabled={product.stock === 0}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold">{product.stock}</span>
                        <button
                          onClick={() => handleUpdateStock(product.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-gray-50 transition"
                        >
                          +
                        </button>
                      </div>
  
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                        <Edit size={16} />
                        Edit
                      </button>
                      
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                        <Eye size={16} />
                        Lihat
                      </button>
  
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium ml-auto"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            {products.filter(p => 
              p.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Tidak ada produk ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  
    // Render History Content
    const renderHistoryContent = (): JSX.Element => (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm p-2">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveHistoryTab('consultation')}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              activeHistoryTab === 'consultation'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageCircle className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Konsultasi</span>
          </button>
          <button
            onClick={() => setActiveHistoryTab('address')}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              activeHistoryTab === 'address'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Alamat Favorit</span>
          </button>
          <button
            onClick={() => setActiveHistoryTab('product')}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              activeHistoryTab === 'product'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Produk Favorit</span>
          </button>
          <button
            onClick={() => setActiveHistoryTab('store')}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              activeHistoryTab === 'store'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Store className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Toko Favorit</span>
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeHistoryTab === 'consultation' && (
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Riwayat Konsultasi</h3>
            <p className="text-sm text-gray-600 mt-1">Lihat semua riwayat konsultasi dengan konsultan kami</p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {consultHistory.map((consult) => (
                <div key={consult.id} className="border border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row gap-4">
                    <img 
                      src={consult.consultantImage} 
                      alt={consult.consultantName}
                      className="w-20 h-20 rounded-full object-cover mx-auto md:mx-0"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{consult.consultantName}</h4>
                          <p className="text-sm text-orange-500 font-semibold">{consult.specialty}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          consult.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {consult.status === 'completed' ? 'Selesai' : 'Dijadwalkan'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={16} />
                          {consult.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={16} />
                          {consult.duration}
                        </span>
                        {consult.rating && (
                          <span className="flex items-center gap-1.5 text-yellow-500 font-semibold">
                            ⭐ {consult.rating}.0
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {consult.topics.map((topic, idx) => (
                          <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-600 text-xs rounded-full font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-semibold">
                          <MessageCircle size={16} />
                          Lihat Detail
                        </button>
                        {consult.status === 'completed' && !consult.rating && (
                          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-semibold">
                            ⭐ Beri Rating
                          </button>
                        )}
                        {consult.status === 'scheduled' && (
                          <button className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition text-sm font-semibold">
                            <Calendar size={16} />
                            Reschedule
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-500 mb-1">
                  {consultHistory.length}
                </div>
                <div className="text-sm text-gray-600">Total Konsultasi</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {consultHistory.filter(c => c.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Selesai</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {consultHistory.filter(c => c.status === 'scheduled').length}
                </div>
                <div className="text-sm text-gray-600">Dijadwalkan</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <div className="text-2xl font-bold text-yellow-500 mb-1">
                  {(consultHistory.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) / consultHistory.filter(c => c.rating).length || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Rating Rata-rata</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeHistoryTab === 'address' && (
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Alamat Favorit</h3>
                <p className="text-sm text-gray-600 mt-1">Alamat UMKM yang tersimpan</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-semibold">
                <Plus size={16} />
                Tambah Alamat
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {favoriteAddresses.map((address) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{address.name}</h4>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Utama
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{address.address}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {address.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Navigation size={14} />
                            {address.distance}
                          </span>
                          <span>Disimpan: {address.savedAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <Edit2 size={16} className="text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeHistoryTab === 'product' && (
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Produk Favorit</h3>
                <p className="text-sm text-gray-600 mt-1">Produk yang Anda simpan</p>
              </div>
              <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                Lihat Semua
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {favoriteProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">dari {product.storeName}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-orange-500">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Star size={14} fill="currentColor" />
                        {product.rating}
                      </span>
                      <span className="text-gray-500">
                        {product.sold} Terjual
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-semibold">
                      Lihat Produk
                    </button>
                    <span className="text-xs text-gray-500">Disimpan: {product.savedAt}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeHistoryTab === 'store' && (
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Toko Favorit</h3>
                <p className="text-sm text-gray-600 mt-1">Toko UMKM yang Anda ikuti</p>
              </div>
              <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                Jelajahi Toko
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteStores.map((store) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-sm">{store.name}</h4>
                        {store.isVerified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{store.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-gray-50 rounded-lg py-2">
                      <div className="text-sm font-bold text-gray-900">{store.rating}</div>
                      <div className="text-xs text-gray-600">Rating</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg py-2">
                      <div className="text-sm font-bold text-gray-900">{store.totalProducts}</div>
                      <div className="text-xs text-gray-600">Produk</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg py-2">
                      <MapPin className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600">{store.location}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Disimpan: {store.savedAt}</span>
                    <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-xs font-semibold">
                      Kunjungi Toko
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
              <UserIcon size={20} />
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
              onClick={() => setActiveMenu('pricing')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                activeMenu === 'pricing'
                  ? 'bg-orange-50 text-orange-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <DollarSign size={20} />
              Pricing
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
              Toko Anda
            </button>

            <button
              onClick={() => setActiveMenu('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                activeMenu === 'settings'
                  ? 'bg-orange-50 text-orange-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings size={20} />
              Pengaturan
            </button>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button 
              onClick={handleLogout}
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
              {activeMenu === 'profile' && 'Edit Profil'}
              {activeMenu === 'history' && 'Riwayat Konsultasi'}
              {activeMenu === 'pricing' && 'Paket Pricing'}
              {activeMenu === 'store' && 'Toko Anda'}
              {activeMenu === 'settings' && 'Pengaturan'}
            </h1>
          </div>

          {activeMenu === 'profile' && renderProfileContent()}
          {activeMenu === 'store' && renderStoreContent()}
          {activeMenu === 'history' && renderHistoryContent()}
          {activeMenu === 'pricing' && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <DollarSign size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pricing Coming Soon</h3>
              <p className="text-gray-600">Halaman pricing akan segera hadir</p>
            </div>
          )}
          {activeMenu === 'settings' && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Settings size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pengaturan Coming Soon</h3>
              <p className="text-gray-600">Halaman pengaturan akan segera hadir</p>
            </div>
          )}
        </div>
      </div>

      {/* All Badges Modal */}
      <AllBadgesModal />
    </>
  );
};

export default UMKMProfilePage;