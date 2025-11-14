'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
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

export default function CartPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [isCountAnimating, setIsCountAnimating] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        loadCartItems();
      }
    });
    return () => unsub();
  }, []);

  // Listen for storage changes to sync cart data
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' && isLoggedIn) {
        loadCartItems();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isLoggedIn]);

  const loadCartItems = () => {
    // Load actual cart data from localStorage
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
    
    setCartItems(cartItems);
    setSelectedItems(cartItems.filter(item => item.inStock).map(item => item.id));
    
    // Animate counter
    animateCounter(cartItems.length);
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
    
    // Update localStorage
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
    
    // Update localStorage
    const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCartData = cartData.filter((product: any) => {
      const productId = product.ASIN || product.id || Math.random().toString();
      return productId !== id;
    });
    localStorage.setItem("cart", JSON.stringify(updatedCartData));
    
    // Trigger navbar update
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { type: 'cart', count: updatedCartData.length } 
    }));
    
    // Animate counter
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

  const applyPromoCode = () => {
    if (promoCode === 'UMKM10') {
      setPromoDiscount(10);
    } else if (promoCode === 'NEWUSER') {
      setPromoDiscount(15);
    } else {
      alert('Kode promo tidak valid');
    }
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * (promoDiscount / 100);
  const shipping = subtotal > 100000 ? 0 : 15000;
  const total = subtotal - discount + shipping;

  const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Keranjang Kosong</h2>
          <p className="text-gray-600 mb-6">Silakan masuk untuk melihat keranjang belanja Anda</p>
          <a 
            href="/login" 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Masuk Sekarang
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
        }
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
        .animate-pulse-glow { animation: pulse-glow 2s infinite; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="glass-effect rounded-2xl p-6 mb-8 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="p-3 hover:bg-orange-100 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <ArrowLeft size={24} className="text-orange-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Keranjang Belanja
                </h1>
                <p className="text-gray-600 mt-1">Kelola produk pilihan Anda</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`relative ${isCountAnimating ? 'animate-pulse-glow' : ''}`}>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                  <span className={`${isCountAnimating ? 'animate-bounce-in' : ''}`}>
                    {animatedCount} item{animatedCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                💰 {formatPrice(total)}
              </div>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Keranjang Anda Kosong</h2>
            <p className="text-gray-500 mb-8">Mulai berbelanja dan tambahkan produk ke keranjang</p>
            <a 
              href="/etalase" 
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <ShoppingBag size={20} />
              Mulai Belanja
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <div className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cartItems.filter(item => item.inStock).length}
                    onChange={() => 
                      selectedItems.length === cartItems.filter(item => item.inStock).length 
                        ? deselectAll() 
                        : selectAll()
                    }
                    className="w-5 h-5 text-orange-500 rounded"
                  />
                  <span className="font-semibold">Pilih Semua ({cartItems.filter(item => item.inStock).length})</span>
                </div>
                <button 
                  onClick={() => setSelectedItems([])}
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Hapus Terpilih
                </button>
              </div>

              {/* Cart Items List */}
              {cartItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`glass-effect rounded-xl p-6 mb-4 hover:shadow-lg transition-all duration-300 animate-slide-up ${!item.inStock ? 'opacity-60' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      disabled={!item.inStock}
                      className="w-5 h-5 text-orange-500 rounded mt-2"
                    />
                    
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.seller}</p>
                          {item.variant && (
                            <p className="text-sm text-gray-500">{item.variant}</p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={14} className="text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{item.rating}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      {!item.inStock && (
                        <div className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm mb-3">
                          Stok habis
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                          <span className="font-bold text-lg text-orange-600">
                            {formatPrice(item.price)}
                          </span>
                          {item.discount && (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                              -{item.discount}%
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={!item.inStock}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={!item.inStock}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Promo Code */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold mb-4">Kode Promo</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Masukkan kode promo"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
                {promoDiscount > 0 && (
                  <div className="mt-3 text-green-600 text-sm">
                    ✓ Kode promo berhasil diterapkan! Diskon {promoDiscount}%
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold mb-4">Ringkasan Pesanan</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal ({selectedItems.length} item)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon Promo</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span>{shipping === 0 ? 'GRATIS' : formatPrice(shipping)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">{formatPrice(total)}</span>
                  </div>
                </div>
                
                <button
                  disabled={selectedItems.length === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold mt-6 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Checkout ({selectedItems.length} item)
                </button>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold mb-4">Keuntungan Berbelanja</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-green-500" />
                    <span className="text-sm">Gratis ongkir min. Rp100.000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-blue-500" />
                    <span className="text-sm">Jaminan uang kembali</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw size={20} className="text-purple-500" />
                    <span className="text-sm">Mudah retur & tukar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
