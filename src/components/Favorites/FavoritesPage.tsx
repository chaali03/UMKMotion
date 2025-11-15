'use client';

import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Filter, Grid, List, Search, Trash2, Share2, Users, Store, Package, ArrowLeft, X } from 'lucide-react';
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
  type: 'cart' | 'favorite';
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
  const [animatedCount, setAnimatedCount] = useState(0);
  const [isCountAnimating, setIsCountAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'favorites' && isLoggedIn) {
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isLoggedIn]);

  const loadFavorites = () => {
    setIsLoading(true);
    
    setTimeout(() => {
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

      const merged = [...productItems, ...consultantItems];
      setFavorites(merged);
      animateCounter(merged.length);
      setIsLoading(false);
    }, 600);
  };

  const animateCounter = (newCount: number) => {
    setIsCountAnimating(true);
    const startCount = animatedCount;
    const duration = 500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.round(startCount + (newCount - startCount) * easeOutQuart);
      
      setAnimatedCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsCountAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  const removeFavorite = (id: string) => {
    const itemToRemove = favorites.find(item => item.id === id);
    const shortTitle = itemToRemove?.name ? 
      (itemToRemove.name.length > 20 ? itemToRemove.name.substring(0, 20) + '...' : itemToRemove.name) : 'Item';
    
    const newFavorites = favorites.filter(item => item.id !== id);
    setFavorites(newFavorites);

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

    showToast('favorite', 'Dihapus dari Favorit', shortTitle);
    animateCounter(newFavorites.length);
  };

  const showToast = (type: 'cart' | 'favorite', title: string, message: string) => {
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

    if (!originalProduct) return;

    const shortTitle = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;

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
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { type: 'cart', count: cart.length }
      }));
      return;
    }

    cart.push({ ...originalProduct, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast('cart', 'Ditambahkan ke Keranjang!', shortTitle);

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
        (item.seller && item.seller.toLowerCase().includes(searchLower)) ||
        (item.specialty && item.specialty.toLowerCase().includes(searchLower));
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

  // Loading Skeleton Component
  const SkeletonLoader = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i} 
          className="rounded-xl border border-pink-100 bg-white p-4 flex gap-4 animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pink-500" size={24} />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Heart size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Favorit Kosong</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk melihat daftar favorit Anda</p>
          <a 
            href="/login" 
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-block"
          >
            Masuk Sekarang
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      <style>{`
        @keyframes heart-bounce {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-heart {
          0%, 100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(236, 72, 153, 0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes float-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes toast-slide-in {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-heart-bounce { animation: heart-bounce 0.6s ease-out; }
        .animate-pulse-heart { animation: pulse-heart 2s infinite; }
        .animate-float-up { animation: float-up 0.5s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .gradient-text {
          background: linear-gradient(135deg, #ec4899, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          pointer-events: none;
        }
        
        .toast {
          background: white;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 8px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 250px;
          animation: toast-slide-in 0.3s ease-out;
        }
        
        .toast-cart {
          border-left: 3px solid #f59e0b;
        }
        
        .toast-favorite {
          border-left: 3px solid #ec4899;
        }
        
        .toast-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .toast-cart .toast-icon {
          background: #f59e0b;
        }
        
        .toast-favorite .toast-icon {
          background: #ec4899;
        }
        
        .toast-content {
          flex: 1;
          min-width: 0;
        }
        
        .toast-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
          font-size: 0.85rem;
        }
        
        .toast-message {
          font-size: 0.75rem;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-float-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-pink-100 rounded-xl transition-all duration-300 active:scale-95 bg-white shadow-md"
                aria-label="Kembali"
              >
                <ArrowLeft size={20} className="text-pink-600" />
              </button>
              <div className="p-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl">
                <Heart size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Daftar Favorit</h1>
                <p className="text-gray-600 mt-1">Koleksi produk, konsultan, dan UMKM kesukaan Anda</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`relative ${isCountAnimating ? 'animate-pulse-heart' : ''}`}>
                <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                  <span className={`${isCountAnimating ? 'animate-heart-bounce' : ''}`}>
                    ❤️ {animatedCount} item{animatedCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Semua', icon: Heart, count: favorites.length },
              { id: 'product', label: 'Produk', icon: Package, count: favorites.filter(f => f.favoriteType === 'product').length },
              { id: 'consultant', label: 'Konsultan', icon: Users, count: favorites.filter(f => f.favoriteType === 'consultant').length },
              { id: 'umkm', label: 'UMKM', icon: Store, count: favorites.filter(f => f.favoriteType === 'umkm').length },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-pink-50 border border-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-pink-100 text-pink-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <SkeletonLoader />
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center animate-fade-in">
            <Heart size={80} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Belum Ada Favorit</h2>
            <p className="text-gray-500 mb-8">Mulai jelajahi produk dan tambahkan ke favorit</p>
            <a 
              href="/etalase" 
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Heart size={20} />
              Jelajahi Produk
            </a>
          </div>
        ) : (
          <>
            {/* Filters & Search */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm animate-fade-in">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Semua Kategori' : category}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                >
                  <option value="dateAdded">Terbaru Ditambahkan</option>
                  <option value="price-low">Harga Terendah</option>
                  <option value="price-high">Harga Tertinggi</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="name">Nama A-Z</option>
                </select>
                
                <div className="text-sm text-gray-600 flex items-center justify-center bg-gray-50 rounded-lg px-4">
                  {filteredFavorites.length} dari {favorites.length} item
                </div>
              </div>
            </div>

            {/* Products List */}
            {filteredFavorites.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center animate-fade-in">
                <Search size={48} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Tidak ada hasil</h3>
                <p className="text-gray-500 text-sm">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFavorites.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="rounded-xl border border-pink-100 bg-white hover:shadow-md transition-all duration-200 animate-float-up flex gap-4 px-4 py-3 items-center"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm md:text-base truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500 truncate">{item.seller}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                            <Star size={12} className="text-yellow-400 fill-current" />
                            <span>{item.rating?.toFixed ? item.rating.toFixed(1) : item.rating}</span>
                            {item.reviews && <span className="text-[11px] text-gray-400">({item.reviews})</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFavorite(item.id)}
                          className="ml-2 p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div>
                          {item.originalPrice && (
                            <span className="text-xs text-gray-400 line-through mr-2 block">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                          <span className="font-bold text-sm md:text-base text-pink-600">
                            {item.price ? formatPrice(item.price) : 'Harga tidak tersedia'}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {item.favoriteType === 'consultant' ? (
                            <button
              onClick={() => { window.location.href = `/ConsultantPage?chat=${encodeURIComponent(item.id)}`; }}
                              className="bg-gradient-to-r from-pink-500 to-red-500 text-white py-1 px-3 rounded-full font-semibold text-xs md:text-sm hover:shadow-md transition-all flex items-center gap-1"
                            >
                              💬 Chat
                            </button>
                          ) : (
                            <button
                              onClick={() => addToCart(item)}
                              disabled={!item.inStock}
                              className="bg-gradient-to-r from-pink-500 to-red-500 text-white py-1 px-3 rounded-full font-semibold text-xs md:text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <ShoppingCart size={14} />
                              {item.inStock ? 'Keranjang' : 'Habis'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'cart' ? '🛒' : '❤️'}
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}