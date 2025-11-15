'use client';

import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Filter, Grid, List, Search, Trash2, Share2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: string;
  rating: number;
  reviews: number;
  discount?: number;
  inStock: boolean;
  category: string;
  dateAdded: string;
}

export default function FavoritesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [animatedCount, setAnimatedCount] = useState(0);
  const [isCountAnimating, setIsCountAnimating] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        loadFavorites();
      }
    });
    return () => unsub();
  }, []);

  // Listen for storage changes to sync favorites data
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
    // Load actual favorites data from localStorage
    const favoritesData = JSON.parse(localStorage.getItem("favorites") || "[]");
    const favoriteItems: FavoriteItem[] = favoritesData.map((product: any) => ({
      id: product.ASIN || product.id || Math.random().toString(),
      name: product.nama_produk || product.name || 'Produk Tanpa Nama',
      price: product.harga_produk || product.price || 0,
      originalPrice: product.harga_asli || product.originalPrice,
      image: product.thumbnail_produk || product.gambar_produk || product.image || '/asset/placeholder/product.webp',
      seller: product.toko || product.seller || 'Toko Tidak Diketahui',
      rating: product.rating_bintang || product.rating || 4.5,
      reviews: product.reviews || Math.floor(Math.random() * 200) + 50,
      discount: product.persentase_diskon || product.discount || 0,
      inStock: product.inStock !== false,
      category: product.kategori || product.category || 'Lainnya',
      dateAdded: product.dateAdded || new Date().toISOString().split('T')[0]
    }));
    
    setFavorites(favoriteItems);
    
    // Animate counter
    animateCounter(favoriteItems.length);
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
    const newFavorites = favorites.filter(item => item.id !== id);
    setFavorites(newFavorites);
    
    // Update localStorage
    const favoritesData = JSON.parse(localStorage.getItem("favorites") || "[]");
    const updatedFavoritesData = favoritesData.filter((product: any) => {
      const productId = product.ASIN || product.id || Math.random().toString();
      return productId !== id;
    });
    localStorage.setItem("favorites", JSON.stringify(updatedFavoritesData));
    
    // Trigger navbar update
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { 
      detail: { type: 'favorites', count: updatedFavoritesData.length } 
    }));
    
    // Animate counter
    animateCounter(newFavorites.length);
  };

  const addToCart = (item: FavoriteItem) => {
    // Add to cart logic - find original product data and add to cart
    const favoritesData = JSON.parse(localStorage.getItem("favorites") || "[]");
    const originalProduct = favoritesData.find((product: any) => {
      const productId = product.ASIN || product.id || Math.random().toString();
      return productId === item.id;
    });
    
    if (originalProduct) {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find((p: any) => (p.ASIN || p.id) === item.id);
      if (existing) {
        // already in cart: don't add duplicate or increase quantity
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { type: 'cart', count: cart.length } 
        }));
        alert(`${item.name} sudah ada di keranjang.`);
        return;
      } else {
        cart.push({ ...originalProduct, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      
      // Trigger navbar cart update
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { type: 'cart', count: cart.length } 
      }));
      
      alert(`${item.name} berhasil ditambahkan ke keranjang!`);
    }
  };

  const shareItem = (item: FavoriteItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Lihat produk ${item.name} dari ${item.seller}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link produk disalin ke clipboard!');
    }
  };

  const categories = ['all', ...Array.from(new Set(favorites.map(item => item.category)))];

  const filteredFavorites = favorites
    .filter(item => filterCategory === 'all' || item.category === filterCategory)
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   item.seller.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'name': return a.name.localeCompare(b.name);
        default: return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

  const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Heart size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Favorit Kosong</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk melihat daftar favorit Anda</p>
          <a 
            href="/login" 
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
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
        @keyframes float-up {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-heart-bounce { animation: heart-bounce 0.6s ease-out; }
        .animate-pulse-heart { animation: pulse-heart 2s infinite; }
        .animate-float-up { animation: float-up 0.6s ease-out; }
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
      `}</style>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-float-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl">
                <Heart size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">
                  Daftar Favorit
                </h1>
                <p className="text-gray-600 mt-1">Koleksi produk kesukaan Anda</p>
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
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-3 hover:bg-pink-100 rounded-xl transition-all duration-300 hover:scale-110 bg-white shadow-lg"
              >
                {viewMode === 'grid' ? <List size={20} className="text-pink-600" /> : <Grid size={20} className="text-pink-600" />}
              </button>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
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
            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="dateAdded">Terbaru Ditambahkan</option>
                  <option value="price-low">Harga Terendah</option>
                  <option value="price-high">Harga Tertinggi</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="name">Nama A-Z</option>
                </select>
                
                <div className="text-sm text-gray-600 flex items-center">
                  {filteredFavorites.length} dari {favorites.length} produk
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {filteredFavorites.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`glass-card rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 animate-float-up ${
                    viewMode === 'list' ? 'flex gap-4 p-4' : 'overflow-hidden'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                        {item.discount && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                            -{item.discount}%
                          </div>
                        )}
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-semibold">
                              Stok Habis
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => removeFavorite(item.id)}
                          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                        >
                          <Heart size={16} className="text-red-500 fill-current" />
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{item.seller}</p>
                        
                        <div className="flex items-center gap-1 mb-3">
                          <Star size={14} className="text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{item.rating}</span>
                          <span className="text-sm text-gray-400">({item.reviews})</span>
                        </div>
                        
                        <div className="mb-4">
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through block">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                          <span className="font-bold text-lg text-pink-600">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => addToCart(item)}
                            disabled={!item.inStock}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 px-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={16} />
                            {item.inStock ? 'Keranjang' : 'Habis'}
                          </button>
                          <button
                            onClick={() => shareItem(item)}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.seller}</p>
                          </div>
                          <button
                            onClick={() => removeFavorite(item.id)}
                            className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1 mb-2">
                          <Star size={14} className="text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{item.rating} ({item.reviews})</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-400 line-through mr-2">
                                {formatPrice(item.originalPrice)}
                              </span>
                            )}
                            <span className="font-bold text-pink-600">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => addToCart(item)}
                              disabled={!item.inStock}
                              className="bg-gradient-to-r from-pink-500 to-red-500 text-white py-1 px-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <ShoppingCart size={14} />
                              {item.inStock ? 'Keranjang' : 'Habis'}
                            </button>
                            <button
                              onClick={() => shareItem(item)}
                              className="p-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Share2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
