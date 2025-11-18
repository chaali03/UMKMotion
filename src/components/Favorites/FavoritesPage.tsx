'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Search, 
  Trash2, 
  Package, 
  Users, 
  Store, 
  ArrowLeft, 
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface FavoriteItem {
  id: string;
  name: string;
  price: number | string | undefined;
  originalPrice?: number;
  image: string;
  seller: string;
  rating: number;
  reviews: number;
  discount?: number;
  inStock: boolean;
  category: string;
  dateAdded: string;
  favoriteType: 'product' | 'consultant' | 'umkm';
  specialty?: string;
  experience?: string;
  location?: string;
  priceText?: string;
}

interface Toast {
  id: string;
  type: 'cart' | 'favorite' | 'error';
  title: string;
  message: string;
}

export default function FavoritesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'product' | 'consultant' | 'umkm'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Auth Check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setIsAuthChecking(false);
      if (user) {
        loadFavorites();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // Storage Listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'favorites' || e.key === 'favorites_umkm' || 
           e.key === 'consultantFavorites' || e.key === 'favorites_consultants') && isLoggedIn) {
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isLoggedIn]);

  const loadFavorites = useCallback(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      // Load Products
      const favoritesData = JSON.parse(localStorage.getItem("favorites") || "[]");
      const productItems: FavoriteItem[] = favoritesData.map((product: any) => ({
        id: String(product.ASIN || product.id || Math.random().toString()),
        name: product.nama_produk || product.name || 'Produk Tanpa Nama',
        price: product.harga_produk ?? product.price ?? 0,
        originalPrice: product.harga_asli || product.originalPrice,
        image: product.thumbnail_produk || product.gambar_produk || product.image || '/asset/placeholder/product.webp',
        seller: product.toko || product.seller || 'Toko Tidak Diketahui',
        rating: Number(product.rating_bintang || product.rating || 4.5),
        reviews: product.reviews || Math.floor(Math.random() * 200) + 50,
        discount: product.persentase_diskon || product.discount || 0,
        inStock: product.inStock !== false,
        category: product.kategori || product.category || 'Lainnya',
        dateAdded: product.dateAdded || new Date().toISOString().split('T')[0],
        favoriteType: 'product' as const
      }));

      // Load Consultants
      const consultantFavsA = JSON.parse(localStorage.getItem("consultantFavorites") || "[]");
      const consultantFavsB = JSON.parse(localStorage.getItem("favorites_consultants") || "[]");
      const allConsultants = [...consultantFavsA, ...consultantFavsB];
      const consultantItems: FavoriteItem[] = allConsultants.map((c: any) => {
        const rawPrice = c.price || c.priceMonthly || 0;
        const parsedPrice = typeof rawPrice === 'number'
          ? rawPrice
          : typeof rawPrice === 'string'
            ? parseInt(String(rawPrice).replace(/[^0-9]/g, '')) || 0
            : 0;
        return {
          id: String(c.id || Math.random().toString()),
          name: c.name || 'Konsultan',
          price: parsedPrice,
          originalPrice: undefined,
          image: c.image || '/asset/placeholder/user.webp',
          seller: c.specialty || c.location || 'Konsultan',
          rating: Number(c.rating || 4.8),
          reviews: c.reviews || Math.floor(Math.random() * 200) + 50,
          discount: 0,
          inStock: true,
          category: 'Konsultan',
          dateAdded: c.dateAdded || new Date().toISOString().split('T')[0],
          favoriteType: 'consultant' as const
        } as FavoriteItem;
      });

      // Load UMKM
      const umkmFavs = JSON.parse(localStorage.getItem("favorites_umkm") || "[]");
      const umkmItems: FavoriteItem[] = Array.isArray(umkmFavs) ? umkmFavs.map((u: any) => ({
        id: String(u.id || Math.random().toString()),
        name: u.name || 'UMKM',
        price: u.price || undefined,
        originalPrice: undefined,
        image: u.image || '/asset/placeholder/store.webp',
        seller: u.seller || u.address || 'UMKM',
        rating: Number(u.rating || 4.8),
        reviews: u.reviews || Math.floor(Math.random() * 200) + 50,
        discount: 0,
        inStock: true,
        category: u.category || 'UMKM',
        dateAdded: u.dateAdded || new Date().toISOString().split('T')[0],
        favoriteType: 'umkm' as const
      })) : [];

      const merged = [...productItems, ...consultantItems, ...umkmItems];
      setFavorites(merged);
      setIsLoading(false);
    }, 400);
  }, []);

  const removeFavorite = (id: string) => {
    const itemToRemove = favorites.find(item => item.id === id);
    const shortTitle = itemToRemove?.name ? 
      (itemToRemove.name.length > 25 ? itemToRemove.name.substring(0, 25) + '...' : itemToRemove.name) : 'Item';
    
    const newFavorites = favorites.filter(item => item.id !== id);
    setFavorites(newFavorites);

    // Update localStorage
    const favoritesData = JSON.parse(localStorage.getItem("favorites") || "[]");
    const updatedFavoritesData = favoritesData.filter((product: any) => {
      const productId = String(product.ASIN || product.id || Math.random().toString());
      return productId !== id;
    });
    localStorage.setItem("favorites", JSON.stringify(updatedFavoritesData));

    const consA = JSON.parse(localStorage.getItem("consultantFavorites") || "[]");
    const consB = JSON.parse(localStorage.getItem("favorites_consultants") || "[]");
    const updA = consA.filter((c: any) => String(c.id) !== id);
    const updB = consB.filter((c: any) => String(c.id) !== id);
    localStorage.setItem("consultantFavorites", JSON.stringify(updA));
    localStorage.setItem("favorites_consultants", JSON.stringify(updB));

    const totalCount = updatedFavoritesData.length + updA.length;
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { 
      detail: { type: 'favorites', count: totalCount } 
    }));

    showToast('favorite', 'Dihapus!', shortTitle);
  };

  const showToast = (type: 'cart' | 'favorite' | 'error', title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const addToCart = (item: FavoriteItem) => {
    const favoritesData = JSON.parse(localStorage.getItem("favorites") || "[]");
    const originalProduct = favoritesData.find((product: any) => {
      const productId = product.ASIN || product.id || Math.random().toString();
      return productId === item.id;
    });

    if (!originalProduct) {
      showToast('error', 'Error', 'Produk tidak ditemukan');
      return;
    }

    const shortTitle = item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name;

    if (!isLoggedIn) {
      try {
        const pending = {
          type: 'cart' as const,
          product: originalProduct,
          returnUrl: window.location.href,
          createdAt: Date.now(),
        };
        localStorage.setItem('pendingAction', JSON.stringify(pending));
      } catch {}
      window.location.href = "/login";
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((p: any) => (p.ASIN || p.id) === item.id);
    if (existing) {
      showToast('cart', 'Sudah di Keranjang', shortTitle);
      return;
    }

    cart.push({ ...originalProduct, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast('cart', 'Ditambahkan!', shortTitle);

    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { type: 'cart', count: cart.length }
    }));
  };

  const categories = ['all', ...Array.from(new Set(favorites.filter(f => f.category).map(item => item.category!)))];

  const toNumber = (val: number | string | undefined | null): number => {
    if (typeof val === 'number') return isFinite(val) ? val : 0;
    if (typeof val === 'string') {
      const n = parseInt(val.replace(/[^0-9]/g, ''));
      return isFinite(n) && !isNaN(n) ? n : 0;
    }
    return 0;
  };

  const filteredFavorites = favorites
    .filter(item => {
      if (activeTab !== 'all' && item.favoriteType !== activeTab) return false;
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      const searchLower = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(searchLower) ||
        (item.seller && item.seller.toLowerCase().includes(searchLower));
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return toNumber(a.price) - toNumber(b.price);
        case 'price-high': return toNumber(b.price) - toNumber(a.price);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'name': return a.name.localeCompare(b.name);
        default: return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

  const formatPrice = (price: number | string | undefined | null) => {
    const n = typeof price === 'number' ? price
      : typeof price === 'string' ? parseInt(price.replace(/[^0-9]/g, ''))
      : 0;
    const safe = isFinite(n) && !isNaN(n) ? n : 0;
    return `Rp ${safe.toLocaleString('id-ID')}`;
  };

  const tabCounts = {
    all: favorites.length,
    product: favorites.filter(f => f.favoriteType === 'product').length,
    consultant: favorites.filter(f => f.favoriteType === 'consultant').length,
    umkm: favorites.filter(f => f.favoriteType === 'umkm').length,
  };

  // Loading Skeleton
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded-full w-28"></div>
      </div>
    </div>
  );

  // Auth Checking State
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pink-500" size={24} />
          </div>
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  // Not Logged In State
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={40} className="text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Favorit Kosong</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Silakan masuk untuk melihat dan menyimpan produk favorit Anda
          </p>
          <a 
            href="/login" 
            className="block w-full bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
          >
            Masuk Sekarang
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 pb-6">
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ec4899;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #db2777;
        }

        /* Toast Styles */
        .toast-enter {
          animation: slideIn 0.3s ease-out;
        }

        /* Smooth transitions */
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-pink-50 rounded-xl transition-all active:scale-95 flex-shrink-0"
                aria-label="Kembali"
              >
                <ArrowLeft size={22} className="text-gray-700" />
              </button>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Heart size={20} className="text-white fill-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">Favorit Saya</h1>
                  <p className="text-xs text-gray-500">{tabCounts[activeTab]} item</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Mobile Optimized */}
          <div className="mt-4 relative">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari favorit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Tabs - Horizontal Scroll */}
          <div className="mt-4 -mx-4 px-4 overflow-x-auto custom-scrollbar">
            <div className="flex gap-2 pb-2">
              {[
                { id: 'all', label: 'Semua', icon: Heart },
                { id: 'product', label: 'Produk', icon: Package },
                { id: 'consultant', label: 'Konsultan', icon: Users },
                { id: 'umkm', label: 'UMKM', icon: Store },
              ].map(tab => {
                const Icon = tab.icon;
                const count = tabCounts[tab.id as keyof typeof tabCounts];
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-pink-50 border border-gray-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-white/25' : 'bg-pink-100 text-pink-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter & Sort - Mobile Optimized */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-sm text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
            >
              <Filter size={16} />
              Filter
              {filterCategory !== 'all' && (
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-sm text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
            >
              <SlidersHorizontal size={16} />
              Urutkan
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Filter Kategori</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setFilterCategory(category);
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                    filterCategory === category
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category === 'all' ? 'Semua Kategori' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort Modal */}
      {showSortMenu && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSortMenu(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Urutkan Berdasarkan</h3>
              <button onClick={() => setShowSortMenu(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { value: 'dateAdded', label: 'Terbaru Ditambahkan' },
                { value: 'price-low', label: 'Harga Terendah' },
                { value: 'price-high', label: 'Harga Tertinggi' },
                { value: 'rating', label: 'Rating Tertinggi' },
                { value: 'name', label: 'Nama A-Z' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                    sortBy === option.value
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {searchQuery || filterCategory !== 'all' ? (
                <Search size={40} className="text-pink-500" />
              ) : (
                <Heart size={40} className="text-pink-500" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              {searchQuery || filterCategory !== 'all' ? 'Tidak Ada Hasil' : 'Belum Ada Favorit'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterCategory !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian' 
                : 'Mulai jelajahi dan simpan produk favorit Anda'}
            </p>
            {!searchQuery && filterCategory === 'all' && (
              <a 
                href="/etalase" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
              >
                <Heart size={18} />
                Jelajahi Produk
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 px-1">
              <p className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold text-pink-600">{filteredFavorites.length}</span> dari {favorites.length} item
              </p>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {filteredFavorites.map((item, index) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-slide-up border border-gray-100"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-4">
                    {/* Item Header */}
                    <div className="flex gap-3 mb-3">
                      {/* Image */}
                      <div className="relative flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl"
                          loading="lazy"
                        />
                        {item.discount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
                            -{item.discount}%
                          </div>
                        )}
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xs font-bold">Habis</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate mb-1.5">
                          {item.seller}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold text-gray-700">
                              {item.rating?.toFixed(1)}
                            </span>
                          </div>
                          {item.reviews && (
                            <span className="text-xs text-gray-400">
                              ({item.reviews})
                            </span>
                          )}
                          {item.favoriteType === 'consultant' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                              Konsultan
                            </span>
                          )}
                          {item.favoriteType === 'umkm' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                              UMKM
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="flex-shrink-0 self-start p-2 hover:bg-red-50 text-red-500 rounded-xl transition-all active:scale-90"
                        aria-label="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-end justify-between gap-3 pt-3 border-t border-gray-100">
                      <div className="flex-1 min-w-0">
                        {item.originalPrice && (
                          <span className="text-xs text-gray-400 line-through block mb-0.5">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                        <span className="font-bold text-pink-600 text-base md:text-lg block truncate">
                          {item.price ? formatPrice(item.price) : 'Hubungi'}
                        </span>
                      </div>

                      {/* CTA Button */}
                      {item.favoriteType === 'consultant' ? (
                        <button
                          onClick={() => { window.location.href = `/ConsultantChat?consultant=${item.id}`; }}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all active:scale-95 flex-shrink-0"
                        >
                          💬 Chat
                        </button>
                      ) : item.favoriteType === 'umkm' ? (
                        <button
                          onClick={() => { window.location.href = `/umkm/${item.id}`; }}
                          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all active:scale-95 flex-shrink-0"
                        >
                          <Store size={16} />
                          Lihat
                        </button>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          disabled={!item.inStock}
                          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                          <ShoppingCart size={16} />
                          {item.inStock ? 'Keranjang' : 'Habis'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`toast-enter flex items-start gap-3 bg-white rounded-xl shadow-xl p-4 border-l-4 ${
              toast.type === 'cart' ? 'border-orange-500' :
              toast.type === 'favorite' ? 'border-pink-500' :
              'border-red-500'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              toast.type === 'cart' ? 'bg-orange-100' :
              toast.type === 'favorite' ? 'bg-pink-100' :
              'bg-red-100'
            }`}>
              {toast.type === 'cart' ? '🛒' : toast.type === 'favorite' ? '❤️' : '⚠️'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm mb-0.5">{toast.title}</p>
              <p className="text-xs text-gray-600 truncate">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}