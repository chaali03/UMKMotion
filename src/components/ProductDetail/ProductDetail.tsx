'use client';

import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Store, Shield, Truck, ArrowLeft, Check, Minus, Plus } from "lucide-react";

// === TIPE DATA ===
interface FirebaseProduct {
  nama_produk?: string;
  thumbnail_produk?: string;
  gambar_produk?: string;
  harga_produk?: number;
  harga_asli?: number;
  rating_bintang?: number;
  unit_terjual?: number;
  toko?: string;
  deskripsi_produk?: string;
  bullet_points?: string[];
  product_photos?: string[];
  kategori?: string;
  ASIN?: string;
  discount?: string;
  persentase_diskon?: number;
  jumlah_ulasan?: number;
  merek_produk?: string;
  varian?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  gambar?: string;
}

interface FirebaseStore {
  nama_toko: string;
  image?: string;
  kategori: string;
  deskripsi_toko?: string;
  rating_toko?: number;
  jumlah_review?: number;
}

interface DisplayProduct {
  product_title: string;
  product_photo: string;
  product_price: string;
  product_original_price?: string;
  product_star_rating?: string;
  product_num_ratings?: string;
  seller_name?: string;
  asin: string;
  product_description?: string;
  category?: string;
  bullet_points?: string[];
  product_photos?: string[];
  discount?: string;
  product_sold?: string;
  varian?: ProductVariant[];
}

const formatRupiah = (num?: number) => num ? `Rp ${num.toLocaleString("id-ID")}` : "Rp 0";

const formatSold = (sold?: number) => {
  if (!sold || sold <= 0) return "Baru";
  if (sold < 1000) return `${sold} terjual`;
  const k = (sold / 1000);
  const text = k >= 10 ? Math.floor(k).toString() : k.toFixed(1).replace('.0', '');
  return `${text}rb terjual`;
};

const fallbackFirebase: FirebaseProduct = {
  nama_produk: "Paket Sambal Nusantara - 3 Varian (Roa, Rica, Matah)",
  thumbnail_produk: "https://via.placeholder.com/600x800/dc2626/ffffff?text=Sambal+Set",
  harga_produk: 89000,
  harga_asli: 120000,
  rating_bintang: 4.9,
  unit_terjual: 2400,
  toko: "Nusantara Rasa",
  deskripsi_produk: "Paket sambal premium khas Indonesia. Roa dari Manado, Rica-Rica dari Sulawesi Utara, dan Sambal Matah khas Bali. Dikemas higienis, tahan lama, cocok untuk oleh-oleh atau konsumsi harian.",
  bullet_points: [
    "3 varian sambal premium dalam 1 paket",
    "Tanpa pengawet kimia, 100% alami",
    "Kemasan kedap udara, tahan 6 bulan",
    "Rasa autentik khas daerah",
    "Bisa langsung makan atau campur nasi"
  ],
  product_photos: Array(4).fill(null).map((_, i) => `https://via.placeholder.com/600x800/ef4444/ffffff?text=Sambal+${i + 1}`),
  kategori: "Makanan & Minuman",
  ASIN: "B0SAMBAL123",
  discount: "26%",
  varian: [
    { id: "var1", nama: "Paket 3 Varian (Roa, Rica, Matah)", harga: 89000, stok: 50, gambar: "https://via.placeholder.com/600x800/dc2626/ffffff?text=Sambal+Set" },
    { id: "var2", nama: "Paket 5 Varian + Extra Pedas", harga: 145000, stok: 30, gambar: "https://via.placeholder.com/600x800/ef4444/ffffff?text=Sambal+Set+Extra" },
    { id: "var3", nama: "Paket 10 Mini Jar", harga: 220000, stok: 15, gambar: "https://via.placeholder.com/600x800/f97316/ffffff?text=Sambal+Mini+Set" }
  ]
};

export default function BuyingPage() {
  const [firebaseProduct, setFirebaseProduct] = useState<FirebaseProduct | null>(null);
  const [displayProduct, setDisplayProduct] = useState<DisplayProduct | null>(null);
  const [storeData, setStoreData] = useState<FirebaseStore | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [recommendations, setRecommendations] = useState<DisplayProduct[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const allProductPhotos = displayProduct?.product_photos || [];
  const carouselImages = allProductPhotos.slice(0, 4);

  const mapToDisplay = (p: FirebaseProduct): DisplayProduct => {
    const allPhotos = (p.product_photos && p.product_photos.length > 0)
      ? p.product_photos
      : [p.thumbnail_produk || p.gambar_produk || "https://via.placeholder.com/600x800/f3f4f6/9ca3af?text=No+Image"];

    return {
      product_title: p.nama_produk || p.merek_produk || "Produk Tanpa Nama",
      product_photo: p.thumbnail_produk || p.gambar_produk || "https://via.placeholder.com/600x800/f3f4f6/9ca3af?text=No+Image",
      product_price: formatRupiah(p.harga_produk),
      product_original_price: p.harga_asli ? formatRupiah(p.harga_asli) : undefined,
      product_star_rating: p.rating_bintang ? p.rating_bintang.toFixed(1) : undefined,
      product_num_ratings: p.jumlah_ulasan ? p.jumlah_ulasan.toString() : undefined,
      product_sold: formatSold(p.unit_terjual),
      seller_name: p.toko || "Toko Tidak Diketahui",
      asin: p.ASIN || "unknown",
      product_description: p.deskripsi_produk || "Deskripsi tidak tersedia.",
      category: p.kategori || "Lainnya",
      bullet_points: p.bullet_points,
      product_photos: allPhotos,
      discount: p.discount || (typeof p.persentase_diskon === 'number' ? `${p.persentase_diskon}%` : undefined),
      varian: p.varian,
    };
  };

  useEffect(() => {
    const loadAllData = async () => {
      if (typeof window === "undefined") return;

      let rawProduct: FirebaseProduct | null = null;
      const resolveAsin = (): string | null => {
        try {
          const params = new URLSearchParams(window.location.search);
          const fromQuery = params.get("asin");
          if (fromQuery) return fromQuery;
        } catch {}
        try {
          const sel = localStorage.getItem('selectedProduct');
          if (sel) {
            const parsed = JSON.parse(sel);
            if (parsed && typeof parsed === 'object' && parsed.ASIN) return String(parsed.ASIN);
          }
        } catch {}
        return null;
      };

      const asinParam = resolveAsin();
      try {
        if (db && asinParam) {
          try {
            const snap = await getDoc(doc(db, "products", asinParam));
            if (snap.exists()) {
              const data = snap.data() as FirebaseProduct;
              rawProduct = { ...data, ASIN: asinParam };
            }
          } catch {}
          if (!rawProduct) {
            try {
              const q1 = query(collection(db, "products"), where("ASIN", "==", asinParam), limit(1));
              const s1 = await getDocs(q1);
              if (!s1.empty) {
                const d = s1.docs[0];
                rawProduct = { ...(d.data() as FirebaseProduct), ASIN: d.id };
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error("Gagal ambil produk dari Firestore:", err);
      }

      if (!rawProduct) {
        try {
          if (db) {
            const q = query(collection(db, "products"), limit(1));
            const s = await getDocs(q);
            if (!s.empty) {
              const d = s.docs[0];
              rawProduct = { ...(d.data() as FirebaseProduct), ASIN: d.id };
            }
          }
        } catch {}
      }

      if (!rawProduct) {
        rawProduct = fallbackFirebase;
      }

      setFirebaseProduct(rawProduct);

      // Set selected variant to the first one if available
      if (rawProduct.varian && rawProduct.varian.length > 0) {
        setSelectedVariant(rawProduct.varian[0]);
      }

      if (db && rawProduct.toko) {
        await fetchStoreData(rawProduct.toko);
      } else {
        setStoreData(null);
        setLoadingStore(false);
      }

      setDisplayProduct(mapToDisplay(rawProduct));
      setLoadingDetail(false);

      try {
        const u = auth?.currentUser;
        if (u && rawProduct?.ASIN) {
          const favRef = doc(db, "favorites", `${u.uid}_${rawProduct.ASIN}`);
          const favSnap = await getDoc(favRef);
          setIsFavorite(favSnap.exists());
        } else {
          setIsFavorite(false);
        }
      } catch (e) {
        console.warn('Gagal cek favorit:', e);
      }

      if (db && rawProduct.kategori && rawProduct.ASIN) {
        fetchSameCategoryProducts(rawProduct.kategori, rawProduct.ASIN);
      } else {
        setLoadingRecs(false);
      }
    };

    loadAllData();
  }, []);

  const fetchStoreData = async (namaToko: string) => {
    if (!db) { setStoreData(null); setLoadingStore(false); return; }

    setLoadingStore(true);
    try {
      const q = query(
        collection(db, "stores"),
        where("nama_toko", "==", namaToko),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const store = snapshot.docs[0].data() as FirebaseStore;
        setStoreData(store);
      } else {
        setStoreData(null);
      }
    } catch (err) {
      console.error("Gagal fetch toko:", err);
      setStoreData(null);
    } finally {
      setLoadingStore(false);
    }
  };

  const fetchSameCategoryProducts = async (currentCategory: string, currentASIN: string) => {
    if (!db) { setLoadingRecs(false); return; }
    setLoadingRecs(true);
    try {
      const q = query(collection(db, "products"), where("kategori", "==", currentCategory));
      const snapshot = await getDocs(q);
      const products = snapshot.docs
        .map(doc => ({ ...doc.data() as FirebaseProduct, ASIN: doc.id }))
        .filter(p => p.ASIN !== currentASIN)
        .slice(0, 20);
      const shuffled = products.sort(() => 0.5 - Math.random()).slice(0, 6);
      const mappedRecs = shuffled.map(p => mapToDisplay(p));
      setRecommendations(mappedRecs);
    } catch (err) {
      console.error("Gagal fetch rekomendasi:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleRecommendationClick = (item: DisplayProduct) => {
    try {
      localStorage.setItem("selectedProduct", JSON.stringify({ ASIN: item.asin }));
    } catch {}
    window.location.href = `/BuyingPage?asin=${encodeURIComponent(item.asin)}`;
  };

  const renderStars = (rating?: number) => {
    const r = Number.isFinite(rating as number) ? (rating as number) : 0;
    const clamped = Math.min(5, Math.max(0, r));
    const full = Math.floor(clamped);
    const half = clamped - full >= 0.5 ? 1 : 0;
    const empty = Math.max(0, 5 - full - half);
    return "★".repeat(full) + (half ? "★" : "") + "☆".repeat(empty);
  };

  const stars = renderStars(parseFloat(displayProduct?.product_star_rating || "0"));
  const discount = displayProduct?.discount || "0%";

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const productToAdd = {
      ...displayProduct,
      quantity,
      selectedVariant: selectedVariant || null,
      product_price: selectedVariant ? formatRupiah(selectedVariant.harga) : displayProduct?.product_price
    };
    
    const existing = cart.find((p: any) => p.asin === displayProduct?.asin && 
      JSON.stringify(p.selectedVariant) === JSON.stringify(selectedVariant));
      
    if (existing) {
      existing.quantity = (existing.quantity || 1) + quantity;
    } else {
      cart.push(productToAdd);
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Show success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-weight: 600;
      transform: translateX(400px);
      transition: transform 0.3s ease;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    `;
    notification.textContent = `✓ Ditambahkan ke keranjang: ${quantity} item`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };
  
  const toggleFavorite = async () => {
    if (!displayProduct || !firebaseProduct) return;
    const u = auth?.currentUser;
    if (!u) {
      alert('Silakan login untuk menambahkan favorit');
      return;
    }
    if (!firebaseProduct.ASIN) return;
    setFavLoading(true);
    try {
      const favId = `${u.uid}_${firebaseProduct.ASIN}`;
      const favRef = doc(db, "favorites", favId);
      if (isFavorite) {
        await deleteDoc(favRef);
        setIsFavorite(false);
      } else {
        await setDoc(favRef, {
          uid: u.uid,
          asin: firebaseProduct.ASIN,
          nama_produk: firebaseProduct.nama_produk || displayProduct.product_title,
          thumbnail: displayProduct.product_photo,
          harga: firebaseProduct.harga_produk || null,
          kategori: firebaseProduct.kategori || null,
          toko: firebaseProduct.toko || null,
          createdAt: new Date().toISOString(),
        });
        setIsFavorite(true);
      }
    } catch (e) {
      console.error('Gagal toggle favorit:', e);
      alert('Gagal mengubah favorit. Coba lagi.');
    } finally {
      setFavLoading(false);
    }
  };
  
  const handleBuyNow = () => {
    if (!displayProduct) return;
    const checkoutItem = { 
      ...displayProduct, 
      quantity, 
      selectedVariant,
      product_price_num: selectedVariant ? selectedVariant.harga : parseInt(displayProduct.product_price.replace(/\D/g, '')) || 0 
    };
    localStorage.setItem("checkoutItem", JSON.stringify(checkoutItem));
    window.location.href = "/checkoutpage";
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const handleVisitStore = () => {
    const product = JSON.parse(localStorage.getItem("selectedProduct") || "{}");
    const categoryKey = product.kategori || "all";
    localStorage.setItem("currentStoreCategory", categoryKey);
    window.location.href = "/toko";
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1); // Reset quantity when variant changes
  };

  if (loadingDetail || !displayProduct) {
    return (
      <div className="page-container">
        <div className="skeleton-container">
          <div className="skeleton-card">
            <div className="skeleton-grid">
              <div>
                <div className="skeleton skeleton-image"></div>
              </div>
              <div className="skeleton-content">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-price"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton-actions">
                  <div className="skeleton skeleton-button"></div>
                  <div className="skeleton skeleton-button"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const MAX_CHARS = 280;
  const fullDescription = displayProduct?.product_description || "";
  const isLongDescription = fullDescription.length > MAX_CHARS;
  const shortDescription = isLongDescription ? fullDescription.slice(0, MAX_CHARS) + "..." : fullDescription;

  // Determine current price based on selected variant
  const currentPrice = selectedVariant ? formatRupiah(selectedVariant.harga) : displayProduct.product_price;
  const currentOriginalPrice = selectedVariant ? undefined : displayProduct.product_original_price;

  return (
    <>
      <style >{`
        .page-container {
          padding-top: 88px;
          padding-left: 16px;
          padding-right: 16px;
          min-height: 100vh;
          background: #f8fafc;
        }
        
        @media (min-width: 769px) {
          .page-container {
            padding-left: 32px;
            padding-right: 32px;
          }
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #374151;
          border-radius: 8px;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 20px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .product-card {
          max-width: 1200px;
          margin: 0 auto 32px;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }

        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }

        .carousel-section {
          position: relative;
          padding: 24px;
        }

        .carousel-wrapper {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          width: 100%;
          height: 400px;
          user-select: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        @media (max-width: 768px) {
          .carousel-wrapper {
            height: 300px;
          }
        }

        .carousel {
          display: flex;
          transition: transform 0.3s ease;
          height: 100%;
        }

        .carousel-slide {
          min-width: 100%;
          position: relative;
          overflow: hidden;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
        }

        .carousel-slide img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
        }

        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.95);
          border: 1px solid #e2e8f0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .carousel-nav.prev {
          left: 16px;
        }

        .carousel-nav.next {
          right: 16px;
        }

        .discount-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: #dc2626;
          color: white;
          font-weight: 700;
          font-size: 14px;
          padding: 6px 12px;
          border-radius: 6px;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e2e8f0;
          cursor: pointer;
        }

        .dot.active {
          background: #10b981;
        }

        .details-section {
          padding: 32px 32px 32px 0;
          background: white;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .details-section {
            padding: 24px;
          }
        }

        .product-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .product-title {
          font-size: 22px;
          font-weight: 600;
          line-height: 1.4;
          color: #0f172a;
          flex: 1;
        }

        .favorite-button {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          flex-shrink: 0;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .favorite-button.active {
          background: #fff1f2;
          border-color: #f43f5e;
          color: #f43f5e;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .rating-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .rating-stars {
          color: #fbbf24;
          font-size: 16px;
        }

        .sold-badge {
          background: #eff6ff;
          color: #1d4ed8;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .price-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 8px 0;
          flex-wrap: wrap;
        }

        .current-price {
          font-size: 28px;
          font-weight: 700;
          color: #dc2626;
        }

        .original-price {
          font-size: 16px;
          color: #94a3b8;
          text-decoration: line-through;
          font-weight: 500;
        }

        .discount-tag {
          background: #fef2f2;
          color: #dc2626;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
        }

        .description-section {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
        }

        .description {
          font-size: 15px;
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        .see-more {
          color: #10b981;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          margin-top: 8px;
          display: inline-block;
        }

        /* Variant Section */
        .variant-section {
          margin: 16px 0;
        }

        .variant-label {
          font-size: 15px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .variant-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .variant-option {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s;
          background: white;
        }

        .variant-option.selected {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .variant-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .variant-name {
          font-weight: 500;
          color: #1f2937;
        }

        .variant-price {
          font-weight: 600;
          color: #dc2626;
        }

        .variant-stock {
          font-size: 12px;
          color: #6b7280;
        }

        .variant-check {
          color: #10b981;
          opacity: 0;
        }

        .variant-option.selected .variant-check {
          opacity: 1;
        }

        .quantity-section {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 16px 0;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          width: fit-content;
          border: 1px solid #f1f5f9;
        }

        .quantity-label {
          font-size: 15px;
          font-weight: 600;
          color: #374151;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .quantity-btn {
          width: 36px;
          height: 36px;
          border: 1px solid #d1d5db;
          background: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 6px;
          color: #374151;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quantity-input {
          width: 50px;
          height: 36px;
          text-align: center;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          background: white;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin: 20px 0;
        }

        .btn-buy, .btn-cart {
          flex: 1;
          padding: 16px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          text-align: center;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }

        .btn-buy {
          background: #dc2626;
          color: white;
        }

        .btn-cart {
          background: white;
          color: #166534;
          border: 1px solid #166534;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #475569;
        }

        .feature-icon {
          width: 18px;
          height: 18px;
          color: #10b981;
        }

        .store-container {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          max-width: 1200px;
          margin: 0 auto;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }

        .store-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .store-avatar {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 700;
          text-transform: uppercase;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .store-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .store-info {
          flex: 1;
        }

        .store-info h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #0f172a;
        }

        .store-badge {
          background: #ecfdf5;
          color: #166534;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #a7f3d0;
          text-transform: uppercase;
          display: inline-block;
          margin-bottom: 8px;
        }

        .store-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #10b981;
          font-weight: 500;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
        }

        .visit-store-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }

        .store-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 16px;
          margin: 20px 0;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .stat-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
        }

        .action-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          padding: 12px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 12px;
          z-index: 1000;
          box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 769px) {
          .action-bar {
            display: none;
          }
        }

        .action-bar .btn-buy,
        .action-bar .btn-cart {
          padding: 14px;
          font-size: 14px;
        }

        /* Skeleton Loading */
        .skeleton-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
        }

        .skeleton-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .skeleton-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          padding: 24px;
        }

        @media (max-width: 768px) {
          .skeleton-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }

        .skeleton {
          background: #f1f5f9;
          border-radius: 6px;
        }

        .skeleton-image {
          height: 400px;
          border-radius: 8px;
        }

        .skeleton-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-title {
          height: 28px;
          width: 80%;
        }

        .skeleton-text {
          height: 16px;
        }

        .skeleton-price {
          height: 32px;
          width: 40%;
        }

        .skeleton-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .skeleton-button {
          height: 48px;
          flex: 1;
        }
      `}</style>

      <div className="page-container">
        {/* Back Button */}
        <div style={{ maxWidth: 1200, margin: '0 auto 20px' }}>
          <button className="back-button" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
            Kembali
          </button>
        </div>

        {/* PRODUCT CARD */}
        <div className="product-card">
          <div className="product-grid">
            {/* Image Section */}
            <div className="carousel-section">
              <div className="carousel-wrapper">
                <div className="carousel" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                  {carouselImages.map((src, i) => (
                    <div key={i} className="carousel-slide">
                      <img 
                        src={src} 
                        alt={`${displayProduct.product_title} ${i + 1}`} 
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/600x800/f3f4f6/9ca3af?text=No+Image";
                        }}
                      />
                      {discount !== "0%" && <div className="discount-badge">{discount} OFF</div>}
                    </div>
                  ))}
                </div>
                
                {carouselImages.length > 1 && (
                  <>
                    <button className="carousel-nav prev" onClick={prevSlide}>
                      <ChevronLeft size={20} />
                    </button>
                    <button className="carousel-nav next" onClick={nextSlide}>
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {carouselImages.length > 1 && (
                <div className="carousel-dots">
                  {carouselImages.map((_, i) => (
                    <div 
                      key={i} 
                      className={`dot ${activeSlide === i ? "active" : ""}`} 
                      onClick={() => setActiveSlide(i)} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="details-section">
              <div className="product-header">
                <h1 className="product-title">{displayProduct.product_title}</h1>
                <button 
                  className={`favorite-button ${isFavorite ? 'active' : ''}`}
                  onClick={toggleFavorite}
                  disabled={favLoading}
                >
                  <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="rating-section">
                <div className="rating-item">
                  <span className="rating-stars">{stars}</span>
                  <span>({displayProduct.product_star_rating || '0'})</span>
                </div>
                <div className="rating-item">
                  <span>{displayProduct.product_num_ratings || '0'} ulasan</span>
                </div>
                <div className="sold-badge">
                  <ShoppingCart size={14} />
                  {displayProduct.product_sold || "Baru"}
                </div>
              </div>

              <div className="price-section">
                <div className="current-price">{currentPrice}</div>
                {currentOriginalPrice && (
                  <div className="original-price">{currentOriginalPrice}</div>
                )}
                {discount !== "0%" && (
                  <div className="discount-tag">Hemat {discount}</div>
                )}
              </div>

              {/* Variant Selection */}
              {displayProduct.varian && displayProduct.varian.length > 0 && (
                <div className="variant-section">
                  <div className="variant-label">Pilih Varian:</div>
                  <div className="variant-options">
                    {displayProduct.varian.map((variant) => (
                      <div 
                        key={variant.id}
                        className={`variant-option ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                        onClick={() => handleVariantSelect(variant)}
                      >
                        <div className="variant-info">
                          <div className="variant-name">{variant.nama}</div>
                          <div className="variant-price">{formatRupiah(variant.harga)}</div>
                          <div className="variant-stock">Stok: {variant.stok}</div>
                        </div>
                        <div className="variant-check">
                          <Check size={18} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="description-section">
                <p className="description">
                  {showFullDetail ? fullDescription : shortDescription}
                </p>
                {isLongDescription && (
                  <span 
                    className="see-more" 
                    onClick={() => setShowFullDetail(!showFullDetail)}
                  >
                    {showFullDetail ? 'Sembunyikan' : 'Lihat lebih banyak'}
                  </span>
                )}
              </div>

              <div className="quantity-section">
                <span className="quantity-label">Jumlah:</span>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <input 
                    type="number" 
                    className="quantity-input"
                    value={quantity} 
                    readOnly 
                  />
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="features-grid">
                <div className="feature-item">
                  <Shield size={18} className="feature-icon" />
                  <span>Garansi 100% Original</span>
                </div>
                <div className="feature-item">
                  <Truck size={18} className="feature-icon" />
                  <span>Gratis Ongkir</span>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn-buy" onClick={handleBuyNow}>
                  <ShoppingCart size={18} />
                  Beli Sekarang
                </button>
                <button className="btn-cart" onClick={handleAddToCart}>
                  <Heart size={18} />
                  Tambah Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STORE SECTION */}
        {storeData && (
          <div className="store-container">
            <div className="store-header">
              <div className="store-avatar">
                {storeData.image ? (
                  <img src={storeData.image} alt={storeData.nama_toko} />
                ) : (
                  <>{storeData.nama_toko.charAt(0)}</>
                )}
              </div>
              <div className="store-info">
                <div className="store-badge">TOKO RESMI</div>
                <h3>{storeData.nama_toko}</h3>
                <div className="store-status">
                  <span className="status-dot"></span>
                  Aktif beberapa menit lalu
                </div>
              </div>
              <button className="visit-store-btn" onClick={handleVisitStore}>
                <Store size={18} />
                Kunjungi Toko
              </button>
            </div>

            <div className="store-stats">
              <div className="stat-item">
                <div className="stat-value">
                  <Star size={18} color="#fbbf24" />
                  {storeData.rating_toko || '4.9'}
                </div>
                <div className="stat-label">Rating Toko</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  <span>📦</span>
                  {storeData.jumlah_review || '500'}+
                </div>
                <div className="stat-label">Total Review</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  <span>✓</span>
                  98%
                </div>
                <div className="stat-label">Tingkat Respons</div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Action Bar */}
        <div className="action-bar">
          <button className="btn-buy" onClick={handleBuyNow}>
            <ShoppingCart size={16} />
            Beli
          </button>
          <button className="btn-cart" onClick={handleAddToCart}>
            <Heart size={16} />
            Keranjang
          </button>
        </div>
      </div>
    </>
  );
}