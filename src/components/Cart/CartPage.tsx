'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Star, 
  Truck, Tag, Check, AlertCircle, Package,
  ChevronDown, ChevronUp, X, Percent
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

// ============================================
// LOADING COMPONENTS
// ============================================

const AuthCheckingLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="relative inline-block mb-4">
        <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        <ShoppingBag className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-600" size={32} />
      </div>
      <p className="text-gray-600 font-medium text-lg">Memuat keranjang...</p>
    </div>
  </div>
);

const SkeletonItem = ({ delay = 0 }: { delay?: number }) => (
  <div 
    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex gap-4">
      {/* Checkbox */}
      <div className="w-5 h-5 bg-gray-200 rounded"></div>
      
      {/* Image */}
      <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0"></div>
      
      {/* Content */}
      <div className="flex-1 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded-full w-28"></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonLoader = () => (
  <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
    {/* Header Skeleton */}
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      {/* Items */}
      <div className="lg:col-span-2 space-y-4">
        <SkeletonItem delay={0} />
        <SkeletonItem delay={100} />
        <SkeletonItem delay={200} />
      </div>

      {/* Sidebar Skeleton - Desktop */}
      <div className="hidden lg:block space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function CartPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        await loadCartItems();
      } else {
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
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

  // ============================================
  // FUNCTIONS
  // ============================================

  const loadCartItems = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      const mapped: CartItem[] = cartData.map((product: any) => ({
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

      const validItems = mapped.filter(item => item.name.toLowerCase() !== 'produk tanpa nama');

      // Minimum loading time for smooth UX
      const elapsed = Date.now() - startTime;
      const minLoadTime = 500;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      setCartItems(validItems);
      setSelectedItems(validItems.filter(item => item.inStock).map(item => item.id));
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);

    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCartData = cartData.map((product: any) => {
      const productId = product.ASIN || product.id;
      return productId === id ? { ...product, quantity: newQuantity } : product;
    });
    localStorage.setItem('cart', JSON.stringify(updatedCartData));
  };

  const removeItem = (id: string) => {
    const newCartItems = cartItems.filter(item => item.id !== id);
    setCartItems(newCartItems);
    setSelectedItems(selected => selected.filter(itemId => itemId !== id));

    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCartData = cartData.filter((product: any) => {
      const productId = product.ASIN || product.id;
      return productId !== id;
    });
    localStorage.setItem('cart', JSON.stringify(updatedCartData));

    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { type: 'cart', count: updatedCartData.length }
    }));
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(selected =>
      selected.includes(id)
        ? selected.filter(itemId => itemId !== id)
        : [...selected, id]
    );
  };

  const toggleSelectAll = () => {
    const availableItems = cartItems.filter(item => item.inStock);
    if (selectedItems.length === availableItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(availableItems.map(item => item.id));
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const code = promoCode.toUpperCase();
    if (code === 'UMKM10') {
      setPromoDiscount(10);
    } else if (code === 'NEWUSER') {
      setPromoDiscount(15);
    } else if (code === 'GRATIS20') {
      setPromoDiscount(20);
    } else {
      alert('❌ Kode promo tidak valid');
      setPromoDiscount(0);
    }
    setIsApplyingPromo(false);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      window.location.href = '/login?redirect=' + encodeURIComponent('/checkoutpage');
      return;
    }
    if (selectedItems.length === 0) return;

    const selected = cartItems.filter(item => selectedItems.includes(item.id));
    const checkoutItems = selected.map(item => ({
      asin: item.id,
      product_title: item.name,
      product_photo: item.image,
      selectedImage: item.image,
      product_price: formatPrice(item.price),
      product_price_num: item.price,
      quantity: item.quantity,
      seller_name: item.seller
    }));

    localStorage.setItem('checkoutItems', JSON.stringify(checkoutItems));
    localStorage.removeItem('checkoutItem');
    window.location.href = '/checkoutpage';
  };

  // ============================================
  // CALCULATIONS
  // ============================================

  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * (promoDiscount / 100);
  const shipping = subtotal > 100000 ? 0 : 15000;
  const effectiveShipping = selectedItems.length === 0 ? 0 : shipping;
  const total = selectedItems.length === 0 ? 0 : subtotal - discount + effectiveShipping;

  const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

  // ============================================
  // RENDER CONDITIONS
  // ============================================

  // Auth checking
  if (isLoggedIn === null) {
    return <AuthCheckingLoader />;
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-orange-100">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShoppingBag size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Keranjang Belanja</h2>
          <p className="text-gray-600 mb-8">Silakan masuk untuk melihat keranjang belanja Anda</p>
          <a
            href="/login"
            className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Masuk Sekarang
          </a>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <SkeletonLoader />
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pb-32 lg:pb-8">
      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        
        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ea580c; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 mb-6 shadow-sm border border-gray-100 animate-fade-in">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:gap-4 flex-1">
              <button
                onClick={() => window.history.back()}
                className="p-2.5 lg:p-3 hover:bg-orange-50 rounded-xl transition-all duration-200 active:scale-95 border border-gray-200"
              >
                <ArrowLeft size={20} className="text-orange-600" />
              </button>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Keranjang Belanja
                </h1>
                <p className="text-gray-600 text-sm mt-1 hidden sm:block">
                  {cartItems.length} produk dalam keranjang
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md">
                {cartItems.length} item
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* EMPTY STATE */}
        {/* ============================================ */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100 animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Keranjang Kosong</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Belum ada produk dalam keranjang. Yuk mulai belanja sekarang!
            </p>
            <a
              href="/etalase"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ShoppingBag size={20} />
              Mulai Belanja
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* ============================================ */}
            {/* CART ITEMS - LEFT SIDE */}
            {/* ============================================ */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All Bar */}
              <div className="bg-white rounded-xl lg:rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cartItems.filter(item => item.inStock).length && cartItems.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="font-semibold text-gray-800 text-sm lg:text-base">
                    Pilih Semua ({cartItems.filter(item => item.inStock).length})
                  </span>
                </label>
                {selectedItems.length > 0 && (
                  <button
                    onClick={() => selectedItems.forEach(id => removeItem(id))}
                    className="text-red-500 hover:text-red-600 font-medium text-sm lg:text-base transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Hapus</span> ({selectedItems.length})
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-4 custom-scrollbar">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in ${!item.inStock ? 'opacity-60' : ''
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          disabled={!item.inStock}
                          className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-2 focus:ring-orange-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                        {item.discount && item.discount > 0 && (
                          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Percent size={10} />
                            {item.discount}
                          </div>
                        )}
                      </div>

                      {/* Image */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-xl shadow-sm"
                        />
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                            <AlertCircle size={24} className="text-white" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-sm lg:text-base line-clamp-2 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 mb-1">{item.seller}</p>
                            {item.variant && (
                              <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs">
                                {item.variant}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          <Star size={14} className="text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{item.rating}</span>
                        </div>

                        {/* Out of Stock Warning */}
                        {!item.inStock && (
                          <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm mb-3 border border-red-200 flex items-center gap-2">
                            <AlertCircle size={16} />
                            <span>Stok habis</span>
                          </div>
                        )}

                        {/* Price & Quantity */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          {/* Price */}
                          <div>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <div className="text-xs text-gray-400 line-through mb-1">
                                {formatPrice(item.originalPrice)}
                              </div>
                            )}
                            <div className="font-bold text-lg text-orange-600">
                              {formatPrice(item.price)}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 w-fit border border-gray-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={!item.inStock || item.quantity <= 1}
                              className="p-2 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-10 text-center font-semibold text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={!item.inStock}
                              className="p-2 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-xs text-gray-600">Subtotal:</span>
                          <span className="font-bold text-sm text-gray-800">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================================ */}
            {/* SUMMARY SIDEBAR - DESKTOP ONLY */}
            {/* ============================================ */}
            <div className="hidden lg:block space-y-6">
              {/* Promo Code */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag size={20} className="text-orange-500" />
                  Kode Promo
                </h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Masukkan kode"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={isApplyingPromo || !promoCode.trim()}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingPromo ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : promoDiscount > 0 ? (
                      <Check size={20} />
                    ) : (
                      'Pakai'
                    )}
                  </button>
                </div>

                {promoDiscount > 0 && (
                  <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-green-200">
                    <Check size={16} />
                    Diskon {promoDiscount}% diterapkan!
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <p>Coba kode berikut:</p>
                  <div className="flex flex-wrap gap-2">
                    {['UMKM10', 'NEWUSER', 'GRATIS20'].map((code) => (
                      <button
                        key={code}
                        onClick={() => setPromoCode(code)}
                        className="font-mono bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Ringkasan Pesanan</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({selectedItems.length} item)</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Diskon Promo</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkos Kirim</span>
                    <span className={effectiveShipping === 0 ? 'text-green-600 font-semibold' : 'font-medium'}>
                      {effectiveShipping === 0 ? 'GRATIS' : formatPrice(effectiveShipping)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-2xl text-orange-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold mt-6 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} />
                  Checkout ({selectedItems.length} item)
                </button>

                {/* Free Shipping Notice */}
                {subtotal > 0 && subtotal < 100000 && (
                  <div className="mt-4 bg-blue-50 text-blue-700 p-3 rounded-lg text-xs border border-blue-200 flex items-center gap-2">
                    <Truck size={16} />
                    <span>Belanja {formatPrice(100000 - subtotal)} lagi untuk gratis ongkir!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* MOBILE BOTTOM BAR */}
      {/* ============================================ */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 animate-slide-up">
          {/* Summary Toggle */}
          <button
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="w-full px-4 py-3 flex items-center justify-between border-b border-gray-200"
          >
            <div className="flex items-center gap-2">
              <Package size={18} className="text-orange-500" />
              <span className="font-semibold text-sm">
                Ringkasan ({selectedItems.length} item)
              </span>
            </div>
            {showMobileSummary ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>

          {/* Expandable Summary */}
          {showMobileSummary && (
            <div className="px-4 py-4 space-y-4 border-b border-gray-200 max-h-80 overflow-y-auto custom-scrollbar bg-gray-50">
              {/* Promo Code */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Kode Promo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Masukkan kode"
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={isApplyingPromo || !promoCode.trim()}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2.5 rounded-lg font-semibold disabled:opacity-50 min-w-20"
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
                  <div className="mt-2 bg-green-50 text-green-600 p-2 rounded-lg text-xs flex items-center gap-2 border border-green-200">
                    <Check size={14} />
                    Diskon {promoDiscount}% diterapkan!
                  </div>
                )}

                <div className="mt-2 flex flex-wrap gap-1">
                  {['UMKM10', 'NEWUSER', 'GRATIS20'].map((code) => (
                    <button
                      key={code}
                      onClick={() => setPromoCode(code)}
                      className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 hover:border-orange-500 transition-colors"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Ongkir</span>
                  <span className={effectiveShipping === 0 ? 'text-green-600 font-semibold' : 'font-medium'}>
                    {effectiveShipping === 0 ? 'GRATIS' : formatPrice(effectiveShipping)}
                  </span>
                </div>

                {subtotal > 0 && subtotal < 100000 && (
                  <div className="bg-blue-50 text-blue-700 p-2 rounded text-xs border border-blue-200 flex items-center gap-2">
                    <Truck size={14} />
                    <span>Belanja {formatPrice(100000 - subtotal)} lagi gratis ongkir!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checkout Bar */}
          <div className="px-4 py-4 flex items-center gap-3 bg-white">
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-0.5">Total Bayar</p>
              <p className="font-bold text-xl text-orange-600">{formatPrice(total)}</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2"
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