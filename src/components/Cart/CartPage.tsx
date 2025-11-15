'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Heart, Star, 
  Truck, Shield, RotateCcw, Tag, Check, X, AlertCircle, Package,
  ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  seller: string;
  rating: number;
  inStock: boolean;
  variant?: string;
  discount?: number;
}

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse">
    {/* Header Skeleton */}
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8 shadow-xl border border-white/20">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl shimmer"></div>
          <div className="flex-1">
            <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-32 sm:w-48 mb-2 shimmer"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded-lg w-24 sm:w-36 shimmer hidden sm:block"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-16 sm:w-20 h-8 sm:h-10 bg-gray-200 rounded-full shimmer"></div>
          <div className="w-20 sm:w-28 h-8 sm:h-10 bg-gray-200 rounded-full shimmer"></div>
        </div>
      </div>
    </div>

    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {/* Cart Items Skeleton */}
      <div className="lg:col-span-2 space-y-3 sm:space-y-4">
        {/* Select All Skeleton */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-lg border border-white/20">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded shimmer"></div>
            <div className="h-4 sm:h-5 bg-gray-200 rounded-lg w-24 sm:w-32 shimmer"></div>
          </div>
        </div>

        {/* Product Items Skeleton */}
        {[1, 2, 3].map((index) => (
          <div 
            key={index}
            className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex gap-2 sm:gap-3 lg:gap-4">
              <div className="flex flex-col items-center gap-2 pt-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded shimmer"></div>
              </div>
              
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-lg sm:rounded-xl shimmer flex-shrink-0"></div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex-1">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded-lg w-full mb-2 shimmer"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded-lg w-2/3 shimmer"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-lg shimmer"></div>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  <div className="w-12 h-3 bg-gray-200 rounded shimmer"></div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded-lg w-20 sm:w-24 shimmer"></div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1 w-24 sm:w-28 h-8 sm:h-10 shimmer"></div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-16 shimmer"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Skeleton - Desktop */}
      <div className="hidden lg:block space-y-6">
        {/* Promo Code Skeleton */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="h-5 bg-gray-200 rounded-lg w-24 mb-4 shimmer"></div>
          <div className="flex gap-2">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl shimmer"></div>
            <div className="w-20 h-12 bg-gray-200 rounded-xl shimmer"></div>
          </div>
        </div>

        {/* Order Summary Skeleton */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="h-5 bg-gray-200 rounded-lg w-36 mb-4 shimmer"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24 shimmer"></div>
                <div className="h-4 bg-gray-200 rounded w-20 shimmer"></div>
              </div>
            ))}
            <hr className="border-gray-200" />
            <div className="flex justify-between pt-2">
              <div className="h-5 bg-gray-200 rounded w-16 shimmer"></div>
              <div className="h-5 bg-gray-200 rounded w-24 shimmer"></div>
            </div>
          </div>
          <div className="w-full h-14 bg-gray-200 rounded-xl mt-6 shimmer"></div>
        </div>
      </div>
    </div>
  </div>
);

// Loading Overlay Component
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-sm animate-float">
      <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse-scale">
        <ShoppingBag size={32} className="text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Memuat Keranjang</h3>
      <p className="text-sm text-gray-600 text-center mb-4">Sedang mengambil data produk Anda...</p>
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
);

export default function CartPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // Changed to null initially
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [isCountAnimating, setIsCountAnimating] = useState(false);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // Add auth checking state

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        await loadCartItems();
      } else {
        setIsLoggedIn(false);
        setIsLoading(false);
      }
      setIsAuthChecking(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' && isLoggedIn) {
        loadCartItems();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isLoggedIn]);

  const loadCartItems = async () => {
    setIsLoading(true);
    
    // Simulate minimum loading time for smooth transition
    const startTime = Date.now();
    
    try {
      const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
      const cartItems: CartItem[] = cartData.map((product: any) => ({
        id: product.ASIN || product.id || Math.random().toString(),
        name: product.nama_produk || product.name || 'Produk Tanpa Nama',
        price: product.harga_produk || product.price || 0,
        originalPrice: product.harga_asli || product.originalPrice,
        image: product.thumbnail_produk || product.gambar_produk || product.image || '/asset/placeholder/product.webp',
        quantity: product.quantity || 1,
        seller: product.toko || product.seller || 'Toko Tidak Diketahui',
        rating: product.rating_bintang || product.rating || 4.5,
        inStock: product.inStock !== false,
        variant: product.variant || '',
        discount: product.persentase_diskon || product.discount || 0
      }));
      
      // Ensure minimum loading time for smooth animation
      const elapsed = Date.now() - startTime;
      const minLoadTime = 800; // Reduced minimum load time
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      setCartItems(cartItems);
      setSelectedItems(cartItems.filter(item => item.inStock).map(item => item.id));
      animateCounter(cartItems.length);
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setIsLoading(false);
    }
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

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedItems = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    
    const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCartData = cartData.map((product: any) => {
      const productId = product.ASIN || product.id || Math.random().toString();
      if (productId === id) {
        return { ...product, quantity: newQuantity };
      }
      return product;
    });
    localStorage.setItem("cart", JSON.stringify(updatedCartData));
  };

  const removeItem = (id: string) => {
    const newCartItems = cartItems.filter(item => item.id !== id);
    setCartItems(newCartItems);
    setSelectedItems(selected => selected.filter(itemId => itemId !== id));
    
    const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCartData = cartData.filter((product: any) => {
      const productId = product.ASIN || product.id || Math.random().toString();
      return productId !== id;
    });
    localStorage.setItem("cart", JSON.stringify(updatedCartData));
    
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { type: 'cart', count: updatedCartData.length } 
    }));
    
    animateCounter(newCartItems.length);
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(selected => 
      selected.includes(id) 
        ? selected.filter(itemId => itemId !== id)
        : [...selected, id]
    );
  };

  const selectAll = () => {
    const availableItems = cartItems.filter(item => item.inStock);
    setSelectedItems(availableItems.map(item => item.id));
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (promoCode.toUpperCase() === 'UMKM10') {
      setPromoDiscount(10);
    } else if (promoCode.toUpperCase() === 'NEWUSER') {
      setPromoDiscount(15);
    } else {
      alert('Kode promo tidak valid');
      setPromoDiscount(0);
    }
    setIsApplyingPromo(false);
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * (promoDiscount / 100);
  const shipping = subtotal > 100000 ? 0 : 15000;
  const effectiveShipping = selectedItems.length === 0 ? 0 : shipping;
  const total = selectedItems.length === 0 ? 0 : subtotal - discount + effectiveShipping;

  const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

  // Auth checking: cart icon + orange theme
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <ShoppingBag className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-600" size={24} />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  // While cart items loading (after auth): cart-themed skeleton + overlay (orange accents)
  if (isLoggedIn && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
            @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
            @keyframes pulse-scale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
            .animate-float { animation: float 3s ease-in-out infinite; }
            .animate-slide-up { animation: slideUp 0.3s ease-out; }
            .animate-pulse-scale { animation: pulse-scale 0.5s ease-in-out; }
            .animate-fade-in { animation: fadeIn 0.5s ease-out; }
            .shimmer { background: linear-gradient(90deg, #fff7ed 0%, #ffedd5 50%, #fff7ed 100%); background-size: 1000px 100%; animation: shimmer 2s infinite; }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 20px; }
          `
        }} />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <SkeletonLoader />
        </div>
        <LoadingOverlay />
      </div>
    );
  }

  // Show login prompt if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <ShoppingBag size={28} className="sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Keranjang Belanja</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Silakan masuk untuk melihat keranjang belanja Anda</p>
          <a 
            href="/login" 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 inline-block text-sm sm:text-base"
          >
            Masuk Sekarang
          </a>
        </div>
      </div>
    );
  }

  // Main content - only shown after loading is complete
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-32 lg:pb-8">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          @keyframes pulse-scale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-slide-up { animation: slideUp 0.3s ease-out; }
          .animate-pulse-scale { animation: pulse-scale 0.5s ease-in-out; }
          .animate-fade-in { animation: fadeIn 0.5s ease-out; }
          .shimmer { 
            background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #f97316;
            border-radius: 20px;
          }
        `
      }} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="animate-fade-in">
          {/* Enhanced Header - Mobile Optimized */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <button 
                  onClick={() => window.history.back()}
                  className="p-2 sm:p-3 hover:bg-orange-100 rounded-xl transition-all duration-300 active:scale-95 bg-white shadow-lg flex-shrink-0"
                >
                  <ArrowLeft size={20} className="sm:w-6 sm:h-6 text-orange-600" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent truncate">
                    Keranjang
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base hidden sm:block">Kelola produk pilihan Anda</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                <div className={`${isCountAnimating ? 'animate-pulse-scale' : ''}`}>
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm lg:text-base shadow-lg whitespace-nowrap">
                    {animatedCount} item{animatedCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm lg:text-base shadow-lg whitespace-nowrap">
                  {formatPrice(total)}
                </div>
              </div>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 text-center border border-white/20">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-float">
                <ShoppingBag size={32} className="sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-600 mb-3 sm:mb-4">Keranjang Anda Kosong</h2>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-sm mx-auto">Mulai berbelanja dan tambahkan produk ke keranjang</p>
              <a 
                href="/etalase" 
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 active:scale-95 inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                Mulai Belanja
              </a>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                {/* Select All - Mobile Optimized */}
                <div className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-lg border border-white/20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === cartItems.filter(item => item.inStock).length && cartItems.length > 0}
                      onChange={() => 
                        selectedItems.length === cartItems.filter(item => item.inStock).length 
                          ? deselectAll() 
                          : selectAll()
                      }
                      className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base">
                      Pilih Semua <span className="hidden sm:inline">({cartItems.filter(item => item.inStock).length})</span>
                    </span>
                  </div>
                  {selectedItems.length > 0 && (
                    <button 
                      onClick={() => {
                        selectedItems.forEach(id => removeItem(id));
                      }}
                      className="text-red-500 hover:text-red-600 font-medium text-xs sm:text-sm lg:text-base transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Hapus</span> ({selectedItems.length})
                    </button>
                  )}
                </div>

                {/* Cart Items List - Mobile Optimized */}
                <div className="space-y-3 sm:space-y-4 custom-scrollbar">
                  {cartItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 border border-white/20 ${
                        !item.inStock ? 'opacity-60 grayscale' : ''
                      } animate-fade-in`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex gap-2 sm:gap-3 lg:gap-4">
                        {/* Checkbox & Discount Badge */}
                        <div className="flex flex-col items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleSelectItem(item.id)}
                            disabled={!item.inStock}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                          />
                          {item.discount && item.discount > 0 && (
                            <div className="bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                              -{item.discount}%
                            </div>
                          )}
                        </div>
                        
                        {/* Product Image */}
                        <div className="relative flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover rounded-lg sm:rounded-xl shadow-md"
                          />
                          {!item.inStock && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg sm:rounded-xl flex items-center justify-center">
                              <AlertCircle size={20} className="text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base line-clamp-2 mb-1">
                                {item.name}
                              </h3>
                              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{item.seller}</p>
                              {item.variant && (
                                <p className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-lg inline-block mt-1">
                                  {item.variant}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 sm:p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors duration-200 active:scale-95 flex-shrink-0"
                            >
                              <Trash2 size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                            </button>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-2">
                            <Star size={12} className="sm:w-3.5 sm:h-3.5 text-yellow-400 fill-current" />
                            <span className="text-[10px] sm:text-xs text-gray-600">{item.rating}</span>
                          </div>
                          
                          {/* Out of Stock Banner */}
                          {!item.inStock && (
                            <div className="bg-red-50 text-red-600 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-[10px] sm:text-sm mb-2 border border-red-200 flex items-center gap-1">
                              <AlertCircle size={12} className="sm:w-4 sm:h-4" />
                              <span>Stok habis</span>
                            </div>
                          )}
                          
                          {/* Price & Quantity - Mobile Optimized */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                            {/* Price */}
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-[10px] sm:text-xs lg:text-sm text-gray-400 line-through">
                                  {formatPrice(item.originalPrice)}
                                </span>
                              )}
                              <span className="font-bold text-sm sm:text-base lg:text-lg text-orange-600">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1 w-fit">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={!item.inStock || item.quantity <= 1}
                                className="p-1.5 sm:p-2 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-30 active:scale-95"
                              >
                                <Minus size={12} className="sm:w-4 sm:h-4" />
                              </button>
                              <span className="w-6 sm:w-8 text-center font-semibold text-xs sm:text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={!item.inStock}
                                className="p-1.5 sm:p-2 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-30 active:scale-95"
                              >
                                <Plus size={12} className="sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Total per Item */}
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] sm:text-xs text-gray-600">Subtotal:</span>
                              <span className="font-bold text-xs sm:text-sm text-gray-800">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Sidebar */}
              <div className="hidden lg:block space-y-6">
                {/* Promo Code */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 animate-fade-in">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Tag size={20} className="text-orange-500" />
                    Kode Promo
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Masukkan kode promo"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                    />
                    <button
                      onClick={applyPromoCode}
                      disabled={isApplyingPromo || !promoCode.trim()}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-20"
                    >
                      {isApplyingPromo ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : promoDiscount > 0 ? (
                        <Check size={20} />
                      ) : (
                        'Pakai'
                      )}
                    </button>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="mt-3 text-green-600 text-sm flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                      <Check size={16} />
                      Kode promo berhasil! Diskon {promoDiscount}%
                    </div>
                  )}
                  <div className="mt-3 text-xs text-gray-500">
                    Coba: <span className="font-mono bg-gray-100 px-2 py-1 rounded">UMKM10</span> atau <span className="font-mono bg-gray-100 px-2 py-1 rounded">NEWUSER</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 sticky top-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <h3 className="font-semibold text-gray-800 mb-4 text-lg">Ringkasan Pesanan</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({selectedItems.length} item)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span>Diskon Promo</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Ongkos Kirim</span>
                      <span className={effectiveShipping === 0 ? 'text-green-600 font-semibold' : ''}>
                        {effectiveShipping === 0 ? 'GRATIS' : formatPrice(effectiveShipping)}
                      </span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between font-bold text-lg pt-2">
                      <span>Total</span>
                      <span className="text-orange-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                  
                  <button
                    disabled={selectedItems.length === 0}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold mt-6 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  >
                    Checkout ({selectedItems.length} item)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {cartItems.length > 0 && !isLoading && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50 animate-slide-up">
          {/* Summary Toggle */}
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="w-full px-4 py-3 flex items-center justify-between border-b border-gray-200"
          >
            <div className="flex items-center gap-2">
              <Package size={18} className="text-orange-500" />
              <span className="font-semibold text-sm text-gray-800">
                Ringkasan ({selectedItems.length} item)
              </span>
            </div>
            {showSummary ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>

          {/* Expandable Summary */}
          {showSummary && (
            <div className="px-4 py-3 space-y-3 border-b border-gray-200 max-h-60 overflow-y-auto custom-scrollbar">
              {/* Promo Code */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Kode promo"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                />
                <button
                  onClick={applyPromoCode}
                  disabled={isApplyingPromo || !promoCode.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 min-w-16"
                >
                  {isApplyingPromo ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : promoDiscount > 0 ? (
                    <Check size={16} />
                  ) : (
                    'Pakai'
                  )}
                </button>
              </div>

              {promoDiscount > 0 && (
                <div className="text-green-600 text-xs flex items-center gap-2 bg-green-50 p-2 rounded-lg border border-green-200">
                  <Check size={14} />
                  Diskon {promoDiscount}% diterapkan
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Ongkir</span>
                  <span className={effectiveShipping === 0 ? 'text-green-600 font-semibold' : 'font-medium'}>
                    {effectiveShipping === 0 ? 'GRATIS' : formatPrice(effectiveShipping)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Checkout Bar */}
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-600">Total Bayar</p>
              <p className="font-bold text-lg text-orange-600">{formatPrice(total)}</p>
            </div>
            <button
              disabled={selectedItems.length === 0}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm flex items-center gap-2"
            >
              <ShoppingBag size={18} />
              Checkout {selectedItems.length > 0 && `(${selectedItems.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}