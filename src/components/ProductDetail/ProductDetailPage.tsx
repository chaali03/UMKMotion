'use client';

import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Star, Heart, ShoppingCart, Share2, ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, Check, Truck, Shield, RotateCcw, Package,
  MessageSquare, ThumbsUp, ThumbsDown, Flag, Verified
} from "lucide-react";

// Types matching FetchData.tsx
export type Product = {
  ASIN: string;
  nama_produk: string;
  merek_produk?: string;
  kategori: string;
  harga_produk: number;
  gambar_produk: string;
  thumbnail_produk: string;
  toko: string;
  deskripsi_produk: string;
  rating_bintang?: number | null;
  unit_terjual?: number | null;
  persentase_diskon?: number | null;
  harga_asli?: number | null;
  tags?: string[];
  likes?: number;
  interactions?: number;
  discount?: string;
  product_price?: string;
  ulasan?: Array<{
    nama_pengulas: string;
    rating: number;
    tanggal: string;
    isi: string;
    verified?: boolean;
    helpful?: number;
  }>;
  variants?: Array<{
    name: string;
    type: 'color' | 'size' | 'style';
    options: Array<{
      value: string;
      label: string;
      image?: string;
      price?: number;
      stock?: number;
    }>;
  }>;
  specifications?: Array<{ name: string; value: string }>;
  product_photos?: string[];
  galeri_gambar?: string[];
  stok?: number;
  berat?: number;
  dimensi?: string;
  garansi?: string;
};

interface Review {
  id: string;
  nama_pengulas: string;
  rating: number;
  tanggal: string;
  isi: string;
  verified?: boolean;
  helpful?: number;
  images?: string[];
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specification' | 'reviews'>('description');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showToast, setShowToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  
  const imageRef = useRef<HTMLDivElement>(null);
  const asin = typeof window !== 'undefined' ? (window as any).PRODUCT_ASIN : null;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.some((p: Product) => p.ASIN === asin));
      }
    });
    return () => unsub();
  }, [asin]);

  useEffect(() => {
    if (!asin) return;
    loadProduct();
  }, [asin]);

  const loadProduct = async () => {
    if (!db || !asin) {
      setLoading(false);
      return;
    }

    try {
      const productDoc = await getDoc(doc(db, 'products', asin));
      
      if (productDoc.exists()) {
        const data = productDoc.data();
        const productData: Product = {
          ASIN: productDoc.id,
          nama_produk: data.nama_produk || '',
          merek_produk: data.merek_produk,
          kategori: data.kategori || '',
          harga_produk: data.harga_produk || 0,
          gambar_produk: data.gambar_produk || data.thumbnail_produk || '',
          thumbnail_produk: data.thumbnail_produk || data.gambar_produk || '',
          toko: data.toko || '',
          deskripsi_produk: data.deskripsi_produk || '',
          rating_bintang: data.rating_bintang || null,
          unit_terjual: data.unit_terjual || null,
          persentase_diskon: data.persentase_diskon || null,
          harga_asli: data.harga_asli || null,
          tags: data.tags || [],
          likes: data.likes || 0,
          interactions: data.interactions || 0,
          specifications: data.specifications || [],
          product_photos: data.product_photos || data.galeri_gambar || [data.gambar_produk || data.thumbnail_produk].filter(Boolean),
          variants: data.variants || generateDefaultVariants(data),
          ulasan: data.ulasan || [],
          stok: data.stok || 100,
          berat: data.berat,
          dimensi: data.dimensi,
          garansi: data.garansi
        };
        
        setProduct(productData);
        setReviews((productData.ulasan || []).map((u, i) => ({
          id: `review-${i}`,
          ...u,
          helpful: u.helpful || 0
        })));
        
        // Load related products
        if (productData.kategori) {
          loadRelatedProducts(productData.kategori, productData.ASIN);
        }
      } else {
        // Try to get from localStorage (fallback)
        const stored = localStorage.getItem('selectedProduct');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.ASIN === asin) {
              setProduct(parsed as Product);
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultVariants = (data: any) => {
    const photos = data.product_photos || data.galeri_gambar || [];
    if (photos.length > 1) {
      return [{
        name: 'Varian',
        type: 'style' as const,
        options: photos.map((photo: string, i: number) => ({
          value: `variant-${i}`,
          label: `Varian ${i + 1}`,
          image: photo,
          stock: data.stok || 100
        }))
      }];
    }
    return [];
  };

  const loadRelatedProducts = async (category: string, currentASIN: string) => {
    if (!db) return;
    
    try {
      const q = query(
        collection(db, 'products'),
        where('kategori', '==', category),
        limit(12)
      );
      const snapshot = await getDocs(q);
      const products = snapshot.docs
        .map(doc => ({ ...doc.data(), ASIN: doc.id } as Product))
        .filter(p => p.ASIN !== currentASIN && p.nama_produk)
        .slice(0, 8);
      setRelatedProducts(products);
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const getDiscount = () => {
    if (!product) return 0;
    if (product.persentase_diskon) return product.persentase_diskon;
    if (product.harga_asli && product.harga_asli > product.harga_produk) {
      return Math.round(((product.harga_asli - product.harga_produk) / product.harga_asli) * 100);
    }
    return 0;
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < full ? 'fill-yellow-400 text-yellow-400' : i === full && hasHalf ? 'fill-yellow-200 text-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!isLoggedIn) {
      localStorage.setItem('pendingAction', JSON.stringify({
        type: 'cart',
        product,
        returnUrl: window.location.href
      }));
      window.location.href = '/login';
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((p: any) => p.ASIN === product.ASIN);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + quantity;
    } else {
      cart.push({
        ...product,
        quantity,
        selectedVariants
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showToastMessage('Ditambahkan ke keranjang!', 'success');
    
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { type: 'cart', count: cart.length }
    }));
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (!isLoggedIn) {
      localStorage.setItem('pendingAction', JSON.stringify({
        type: 'buy',
        product,
        returnUrl: window.location.href
      }));
      window.location.href = '/login';
      return;
    }

    const checkoutItem = {
      ...product,
      quantity,
      selectedVariants
    };
    localStorage.setItem('checkoutItem', JSON.stringify(checkoutItem));
    window.location.href = '/checkoutpage';
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    
    if (!isLoggedIn) {
      localStorage.setItem('pendingAction', JSON.stringify({
        type: 'favorites',
        product,
        returnUrl: window.location.href
      }));
      window.location.href = '/login';
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const existingIndex = favorites.findIndex((p: Product) => p.ASIN === product.ASIN);
    
    if (existingIndex >= 0) {
      favorites.splice(existingIndex, 1);
      setIsFavorite(false);
      showToastMessage('Dihapus dari favorit', 'success');
    } else {
      favorites.push(product);
      setIsFavorite(true);
      showToastMessage('Ditambahkan ke favorit!', 'success');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    window.dispatchEvent(new CustomEvent('favoritesUpdated', {
      detail: { type: 'favorites', count: favorites.length }
    }));
  };

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const images = product?.product_photos || product?.galeri_gambar || (product?.gambar_produk ? [product.gambar_produk] : []);
  const discount = getDiscount();
  const currentPrice = product?.harga_produk || 0;
  const originalPrice = product?.harga_asli || null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Produk tidak ditemukan</p>
          <a href="/etalase" className="text-orange-500 hover:underline">Kembali ke Etalase</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .product-detail-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px 16px;
        }
        
        @media (min-width: 768px) {
          .product-detail-container {
            padding: 32px 24px;
          }
        }
        
        .image-gallery {
          position: relative;
        }
        
        .main-image {
          aspect-ratio: 1;
          background: #f9fafb;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          cursor: zoom-in;
        }
        
        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        
        .main-image.zoomed img {
          transform: scale(2);
        }
        
        .thumbnail-list {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        
        .thumbnail-item {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          flex-shrink: 0;
          background: #f9fafb;
        }
        
        .thumbnail-item.active {
          border-color: #fd5701;
        }
        
        .thumbnail-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .variant-option {
          padding: 8px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        
        .variant-option:hover {
          border-color: #fd5701;
        }
        
        .variant-option.selected {
          border-color: #fd5701;
          background: #fff7ed;
          color: #fd5701;
          font-weight: 600;
        }
        
        .variant-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .tab-button {
          padding: 12px 24px;
          border-bottom: 2px solid transparent;
          font-weight: 600;
          color: #6b7280;
          transition: all 0.2s;
        }
        
        .tab-button.active {
          color: #fd5701;
          border-bottom-color: #fd5701;
        }
        
        .review-card {
          border-bottom: 1px solid #e5e7eb;
          padding: 20px 0;
        }
        
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <div className="product-detail-container">
        {/* Toast Notification */}
        {showToast.show && (
          <div className="toast">
            <div className={`flex items-center gap-3 ${showToast.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              <Check size={20} />
              <span>{showToast.message}</span>
            </div>
          </div>
        )}

        {/* Product Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="image-gallery">
            <div 
              ref={imageRef}
              className={`main-image ${isZoomed ? 'zoomed' : ''}`}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img 
                src={images[activeImageIndex] || '/placeholder.jpg'} 
                alt={product.nama_produk}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.jpg';
                }}
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                  -{discount}%
                </div>
              )}
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg"
              >
                <ZoomIn size={20} />
              </button>
            </div>
            
            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail-item ${activeImageIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={img} alt={`${product.nama_produk} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {product.nama_produk}
              </h1>
              {product.merek_produk && (
                <p className="text-gray-600 mb-3">Merek: {product.merek_produk}</p>
              )}
              <div className="flex items-center gap-4 mb-4">
                {product.rating_bintang && renderStars(product.rating_bintang)}
                <span className="text-gray-600">
                  ({product.unit_terjual ? `${(product.unit_terjual / 1000).toFixed(1)}K` : '0'} terjual)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(currentPrice)}
                </span>
                {originalPrice && originalPrice > currentPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <p className="text-green-600 font-semibold">
                  Hemat {formatPrice(originalPrice! - currentPrice)} ({discount}%)
                </p>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                {product.variants.map((variant, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pilih {variant.name}:
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {variant.options.map((option) => {
                        const isSelected = selectedVariants[variant.name] === option.value;
                        const isDisabled = option.stock === 0;
                        return (
                          <button
                            key={option.value}
                            className={`variant-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                            onClick={() => !isDisabled && setSelectedVariants({
                              ...selectedVariants,
                              [variant.name]: option.value
                            })}
                            disabled={isDisabled}
                          >
                            {variant.type === 'color' && option.value && (
                              <span 
                                className="inline-block w-6 h-6 rounded-full mr-2 border-2 border-gray-300"
                                style={{ backgroundColor: option.value }}
                              />
                            )}
                            {option.label}
                            {option.stock !== undefined && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({option.stock} tersedia)
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700">Jumlah:</label>
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-x-2 border-gray-300 py-2"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-600">
                Stok: {product.stok || 'Tersedia'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
              >
                Beli Sekarang
              </button>
              <button
                onClick={handleAddToCart}
                className="px-6 py-4 border-2 border-orange-500 text-orange-500 rounded-xl font-bold hover:bg-orange-50 transition-all"
              >
                <ShoppingCart size={24} />
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`px-6 py-4 border-2 rounded-xl font-bold transition-all ${
                  isFavorite 
                    ? 'border-red-500 text-red-500 bg-red-50' 
                    : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart size={24} className={isFavorite ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Truck className="text-green-600" size={20} />
                <div>
                  <p className="font-semibold text-sm">Gratis Ongkir</p>
                  <p className="text-xs text-gray-600">Min. belanja Rp 100rb</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" size={20} />
                <div>
                  <p className="font-semibold text-sm">Garansi Resmi</p>
                  <p className="text-xs text-gray-600">{product.garansi || '1 tahun'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="text-purple-600" size={20} />
                <div>
                  <p className="font-semibold text-sm">Bisa Retur</p>
                  <p className="text-xs text-gray-600">Dalam 7 hari</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="text-orange-600" size={20} />
                <div>
                  <p className="font-semibold text-sm">Pengiriman Cepat</p>
                  <p className="text-xs text-gray-600">1-3 hari kerja</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
            >
              Deskripsi
            </button>
            {product.specifications && product.specifications.length > 0 && (
              <button
                onClick={() => setActiveTab('specification')}
                className={`tab-button ${activeTab === 'specification' ? 'active' : ''}`}
              >
                Spesifikasi
              </button>
            )}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            >
              Ulasan ({reviews.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.deskripsi_produk}
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specification' && product.specifications && (
              <div className="space-y-4">
                {product.specifications.map((spec, idx) => (
                  <div key={idx} className="flex border-b pb-3">
                    <div className="w-1/3 font-semibold text-gray-700">{spec.name}</div>
                    <div className="flex-1 text-gray-600">{spec.value}</div>
                  </div>
                ))}
                {product.berat && (
                  <div className="flex border-b pb-3">
                    <div className="w-1/3 font-semibold text-gray-700">Berat</div>
                    <div className="flex-1 text-gray-600">{product.berat} gram</div>
                  </div>
                )}
                {product.dimensi && (
                  <div className="flex border-b pb-3">
                    <div className="w-1/3 font-semibold text-gray-700">Dimensi</div>
                    <div className="flex-1 text-gray-600">{product.dimensi}</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Belum ada ulasan untuk produk ini</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="review-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            {review.nama_pengulas.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{review.nama_pengulas}</span>
                              {review.verified && (
                                <Verified className="text-blue-500" size={16} />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(review.rating)}
                              <span className="text-xs text-gray-500">{review.tanggal}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{review.isi}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {review.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Review image ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500 text-sm">
                          <ThumbsUp size={16} />
                          <span>Membantu ({review.helpful || 0})</span>
                        </button>
                        <button className="text-gray-600 hover:text-red-500 text-sm">
                          <Flag size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Produk Terkait</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {relatedProducts.map((item) => (
                <div
                  key={item.ASIN}
                  onClick={() => window.location.href = `/product/${item.ASIN}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={item.thumbnail_produk || item.gambar_produk || '/placeholder.jpg'}
                      alt={item.nama_produk}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">{item.nama_produk}</h3>
                    <p className="text-lg font-bold text-red-600 mb-1">
                      {formatPrice(item.harga_produk)}
                    </p>
                    {item.rating_bintang && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span>{item.rating_bintang.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setActiveImageIndex(Math.max(0, activeImageIndex - 1))}
            className="absolute left-4 text-white hover:bg-white/20 p-2 rounded-full"
          >
            <ChevronLeft size={32} />
          </button>
          <img
            src={images[activeImageIndex] || '/placeholder.jpg'}
            alt={product.nama_produk}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setActiveImageIndex(Math.min(images.length - 1, activeImageIndex + 1))}
            className="absolute right-4 text-white hover:bg-white/20 p-2 rounded-full"
          >
            <ChevronRight size={32} />
          </button>
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

