'use client';

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, doc, getDoc } from "firebase/firestore";
import { ShoppingCart } from "lucide-react";

// === TIPE PRODUK ===
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
  specifications?: Array<{ name: string; value: string }>;
  kategori?: string;
  ASIN?: string;
  discount?: string;
}

// === TIPE TOKO ===
interface FirebaseStore {
  nama_toko: string;
  image?: string;
  banner?: string;
  kategori: string;
  deskripsi_toko?: string;
  lokasi_toko?: string;
  no_telp?: string;
  email?: string;
  profileImage?: string;
  jam_operasional?: string;
  hari_operasional?: string;
  rating_toko?: number;
  jumlah_review?: number;
  maps_link?: string;
  fasilitas?: string[];
  metode_pembayaran?: string[];
  social?: { instagram?: string; whatsapp?: string; facebook?: string };
}

// === TIPE TAMPILAN ===
interface DisplayProduct {
  product_title: string;
  product_photo: string;
  product_price: string;
  product_original_price?: string;
  product_star_rating?: string;
  product_num_ratings?: string;
  seller_name?: string;
  seller_logo?: string;
  asin: string;
  product_description?: string;
  category?: string;
  bullet_points?: string[];
  product_photos?: string[];
  specifications?: Array<{ name: string; value: string }>;
  discount?: string;
  store?: FirebaseStore | null;
  product_sold?: string;
}

// === DATA TOKO ASLI (DARI SEED) ===

// === UTILS ===
// Dummy store seed removed. Store data is fetched directly from Firestore.

const formatRupiah = (num?: number) => num ? `Rp ${num.toLocaleString("id-ID")}` : "Rp 0";

const formatSold = (sold?: number) => {
  if (!sold || sold <= 0) return "Baru";
  if (sold < 1000) return `${sold.toLocaleString('id-ID')} terjual`;
  const k = (sold / 1000);
  const text = k >= 10 ? Math.floor(k).toString() : k.toFixed(1).replace('.0', '');
  return `${text}K terjual`;
};

const categoryMap: Record<string, string> = {
  "Makanan & Minuman": "food",
  "Fashion & Tekstil": "fashion",
  "Kerajinan Tangan": "craft",
  "Kesehatan": "beauty",
  "Pertanian": "agriculture",
  "Elektronik": "electronics",
  "Furniture": "furniture",
  "Buku & Percetakan": "education",
};

// === FALLBACK PRODUK (CONTOH MAKANAN) ===
const fallbackFirebase: FirebaseProduct = {
  nama_produk: "Paket Sambal Nusantara - 3 Varian (Roa, Rica, Matah)",
  thumbnail_produk: "https://via.placeholder.com/600x800/dc2626/ffffff?text=Sambal+Set",
  gambar_produk: "https://via.placeholder.com/600x800/dc2626/ffffff?text=Sambal+Set",
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
  product_photos: Array(8).fill(null).map((_, i) => `https://via.placeholder.com/600x800/ef4444/ffffff?text=Sambal+${i + 1}`),
  specifications: [
    { name: "Isi", value: "3 botol @150g" },
    { name: "Kadaluarsa", value: "6 bulan dari produksi" },
    { name: "Penyimpanan", value: "Suhu ruang / kulkas" }
  ],
  kategori: "Makanan & Minuman",
  ASIN: "B0SAMBAL123",
  discount: "26%"
};

export default function BuyingPage() {
  const [firebaseProduct, setFirebaseProduct] = useState<FirebaseProduct | null>(null);
  const [displayProduct, setDisplayProduct] = useState<DisplayProduct | null>(null);
  const [storeData, setStoreData] = useState<FirebaseStore | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [recommendations, setRecommendations] = useState<DisplayProduct[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const MAX_THUMBS = 8;
  const THUMB_WIDTH_DESKTOP = 120;
  const THUMB_GAP = 8;
  const thumbItemWidthDesktop = THUMB_WIDTH_DESKTOP + THUMB_GAP;

  const [thumbStart, setThumbStart] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [currentThumbWidth, setCurrentThumbWidth] = useState(thumbItemWidthDesktop);

  const allProductPhotos = displayProduct?.product_photos || [];
  const carouselImages = allProductPhotos.slice(0, MAX_THUMBS);
  const hasMoreThanThumbs = allProductPhotos.length > MAX_THUMBS;

  const variants = allProductPhotos.length > 0
    ? allProductPhotos.map((photo, i) => ({
        name: `Varian ${i + 1}`,
        photo,
        color: i % 2 === 0 ? "#1a1a1a" : i % 3 === 0 ? "#d4d4d8" : "#fbbf24"
      }))
    : [{ name: "Default", photo: displayProduct?.product_photo || "", color: "#1a1a1a" }];

  const mapToDisplay = (p: FirebaseProduct): DisplayProduct => {
    const allPhotos = p.product_photos && p.product_photos.length > 0
      ? p.product_photos
      : [p.thumbnail_produk || p.gambar_produk || "https://via.placeholder.com/600x800/f3f4f6/9ca3af?text=No+Image"];

    return {
      product_title: p.nama_produk || "Produk Tanpa Nama",
      product_photo: p.thumbnail_produk || p.gambar_produk || "https://via.placeholder.com/600x800/f3f4f6/9ca3af?text=No+Image",
      product_price: formatRupiah(p.harga_produk),
      product_original_price: p.harga_asli ? formatRupiah(p.harga_asli) : undefined,
      product_star_rating: p.rating_bintang ? p.rating_bintang.toFixed(1) : undefined,
      product_num_ratings: undefined,
      product_sold: formatSold(p.unit_terjual),
      seller_name: p.toko || "Toko Tidak Diketahui",
      seller_logo: storeData?.profileImage || "",
      asin: p.ASIN || "unknown",
      product_description: p.deskripsi_produk || "Deskripsi tidak tersedia.",
      category: p.kategori || "Lainnya",
      bullet_points: p.bullet_points,
      product_photos: allPhotos,
      specifications: p.specifications,
      discount: p.discount,
      store: storeData
    };
  };

  useEffect(() => {
    setIsClient(true);
    const updateThumbWidth = () => {
      setCurrentThumbWidth(window.innerWidth <= 768 ? 0 : thumbItemWidthDesktop);
    };
    updateThumbWidth();
    window.addEventListener('resize', updateThumbWidth);
    return () => window.removeEventListener('resize', updateThumbWidth);
  }, []);

  // === LOAD SEMUA DATA ===
  useEffect(() => {
    const loadAllData = async () => {
      if (typeof window === "undefined") return;

      let rawProduct: FirebaseProduct | null = null;
      try {
        const params = new URLSearchParams(window.location.search);
        const asinParam = params.get("asin");
        if (db && asinParam) {
          const snap = await getDoc(doc(db, "products", asinParam));
          if (snap.exists()) {
            const data = snap.data() as FirebaseProduct;
            rawProduct = { ...data, ASIN: asinParam };
          }
        }
      } catch (err) {
        console.error("Gagal ambil produk dari Firestore:", err);
      }

      if (!rawProduct) {
        // Fallback jika tidak ada param atau dokumen tidak ada
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

      // === FETCH TOKO DARI FIRESTORE DENGAN NORMALISASI ===
      if (db && rawProduct.toko && rawProduct.kategori) {
        await fetchStoreData(rawProduct.toko, rawProduct.kategori);
      } else {
        setStoreData(null);
        setLoadingStore(false);
      }

      setDisplayProduct(mapToDisplay(rawProduct));
      setLoadingDetail(false);

      // === REKOMENDASI ===
      if (db && rawProduct.kategori && rawProduct.ASIN) {
        fetchSameCategoryProducts(rawProduct.kategori, rawProduct.ASIN);
      } else {
        setLoadingRecs(false);
      }
    };

    loadAllData();
  }, []);

  // === FETCH TOKO DARI FIRESTORE ===
  const fetchStoreData = async (namaToko: string, kategoriProduk: string) => {
    if (!db) { setStoreData(null); setLoadingStore(false); return; }

    setLoadingStore(true);
    try {
      const q = query(
        collection(db, "stores"),
        where("nama_toko", "==", namaToko),
        where("kategori", "==", kategoriProduk),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const store = snapshot.docs[0].data() as FirebaseStore;
        setStoreData(store);
      } else {
        console.log(`Toko "${namaToko}" tidak ditemukan di kategori "${kategoriProduk}"`);
        setStoreData(null);
      }
    } catch (err) {
      console.error("Gagal fetch toko:", err);
      setStoreData(null);
    } finally {
      setLoadingStore(false);
    }
  };

  // === REKOMENDASI ===
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

  // === KLIK REKOMENDASI ===
  const handleRecommendationClick = (item: DisplayProduct) => {
    const fullProductData: FirebaseProduct = {
      nama_produk: item.product_title,
      thumbnail_produk: item.product_photo,
      gambar_produk: item.product_photo,
      harga_produk: parseInt(item.product_price.replace(/\D/g, '')) || undefined,
      harga_asli: item.product_original_price ? parseInt(item.product_original_price.replace(/\D/g, '')) : undefined,
      rating_bintang: item.product_star_rating ? parseFloat(item.product_star_rating) : undefined,
      unit_terjual: item.product_num_ratings ? parseInt(item.product_num_ratings) * 100 : undefined,
      toko: item.seller_name,
      deskripsi_produk: item.product_description,
      bullet_points: item.bullet_points,
      product_photos: item.product_photos,
      specifications: item.specifications,
      kategori: item.category,
      ASIN: item.asin,
      discount: item.discount
    };
    localStorage.setItem("selectedProduct", JSON.stringify(fullProductData));
    window.location.reload();
  };

  // === RENDER BINTANG ===
  const renderStars = (rating?: number) => {
    if (!rating) return "☆☆☆☆☆";
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "★" : "") + "☆".repeat(empty);
  };

  const stars = renderStars(parseFloat(displayProduct?.product_star_rating || "0"));
  const discount = displayProduct?.discount || "0%";

  // === HANDLER LAIN ===
  const handleVariantClick = (index: number) => { setActiveVariant(index); setActiveSlide(0); };
  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((p: any) => p.asin === displayProduct?.asin);
    if (existing) existing.quantity = (existing.quantity || 1) + quantity;
    else cart.push({ ...displayProduct, quantity });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`Ditambahkan ke keranjang: ${quantity} item`);
  };
  const handleBuyNow = () => {
    if (!displayProduct) return;
    const selectedImage = variants[activeVariant]?.photo || displayProduct.product_photo;
    const checkoutItem = { ...displayProduct, quantity, selectedImage, product_price_num: parseInt(displayProduct.product_price.replace(/\D/g, '')) || 0 };
    localStorage.setItem("checkoutItem", JSON.stringify(checkoutItem));
    window.location.href = "/checkoutpage";
  };

  const goToSlide = (index: number) => {
    setActiveSlide(index);
    if (!isClient || window.innerWidth <= 768) return;
    const containerWidth = MAX_THUMBS * currentThumbWidth;
    const currentOffset = thumbStart * currentThumbWidth;
    const targetOffset = index * currentThumbWidth;
    if (targetOffset < currentOffset) setThumbStart(Math.max(0, index));
    else if (targetOffset + currentThumbWidth > currentOffset + containerWidth) setThumbStart(Math.min(carouselImages.length - MAX_THUMBS, index - MAX_THUMBS + 1));
  };

  const MAX_CHARS = 280;
  const fullDescription = displayProduct?.product_description || "";
  const isLongDescription = fullDescription.length > MAX_CHARS;
  const shortDescription = isLongDescription ? fullDescription.slice(0, MAX_CHARS) + "..." : fullDescription;

  const handleVisitStore = () => {
    const product = JSON.parse(localStorage.getItem("selectedProduct") || "{}");
    const categoryKey = categoryMap[product.kategori || ""] || "all";
    localStorage.setItem("currentStoreCategory", categoryKey);
    window.dispatchEvent(new CustomEvent("categoryChange", { detail: categoryKey }));
    window.location.href = "/toko";
  };

  if (loadingDetail || !displayProduct) {
    return <div style={{ textAlign: "center", padding: "40px" }}><p>Memuat detail produk...</p></div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
        .page-container { padding-top: 88px; padding-left: 16px; padding-right: 16px; min-height: 100vh; }
        @media (min-width: 769px) { .page-container { padding-left: 32px; padding-right: 32px; } }

        .product-card { max-width: 1200px; margin: 0 auto 32px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
        .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
        @media (max-width: 768px) { .product-grid { grid-template-columns: 1fr; gap: 0; } }

        .carousel-wrapper { position: relative; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.08); width: 100%; height: 540px; user-select: none; }
        @media (max-width: 768px) { .carousel-wrapper { height: 420px; border-radius: 0; } }
        .carousel { display: flex; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); height: 100%; }
        .carousel-slide { min-width: 100%; position: relative; overflow: hidden; height: 100%; display: flex; align-items: center; justify-content: center; background: #fff; }
        .carousel-slide img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }

        .discount-badge { position: absolute; background: linear-gradient(135deg, #f43f5e, #e11d48); color: white; font-weight: 800; font-size: 13px; padding: 6px 12px; border-radius: 12px; z-index: 10; box-shadow: 0 2px 8px rgba(244, 63, 94, 0.3); }

        .carousel-dots { display: flex; justify-content: center; gap: 8px; margin-top: 12px; }
        .dot { width: 9px; height: 9px; border-radius: 50%; background: #cbd5e1; transition: all 0.3s ease; cursor: pointer; }
        .dot.active { background: #10b981; transform: scale(1.3); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }

        .details-section { padding: 20px; background: white; display: flex; flex-direction: column; gap: 16px; }
        @media (min-width: 769px) { .details-section { padding: 0 28px 28px; } }

        .product-title { font-size: 20px; font-weight: 700; line-height: 1.35; color: #0f172a; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }
        @media (min-width: 769px) { .product-title { font-size: 22px; -webkit-line-clamp: 2; } }

        .rating-reviews { display: flex; align-items: center; gap: 8px; font-size: 14px; }
        .sold { color: #0ea5e9; font-size: 14px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; }
        .sold .icon { color: #0ea5e9; }
        .sold-text { color: #334155; font-size: 13px; font-weight: 600; }
        .rating-text { color: #64748b; font-weight: 500; }

        .price-section { display: flex; align-items: baseline; gap: 10px; margin: 8px 0; }
        .current-price { font-size: 28px; font-weight: 800; color: #dc2626; }
        .original-price { font-size: 16px; color: #94a3b8; text-decoration: line-through; font-weight: 500; }

        .description { font-size: 14px; color: #475569; line-height: 1.7; margin: 10px 0; }
        .see-more { color: #10b981; font-weight: 600; cursor: pointer; font-size: 13.5px; margin-top: 6px; display: inline-block; }

        .variant-section label { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 8px; display: block; }
        .color-options { display: flex; gap: 14px; flex-wrap: wrap; }
        .color-btn { width: 44px; height: 44px; border-radius: 14px; border: 2.5px solid transparent; cursor: pointer; position: relative; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
        .color-btn.active { border-color: #10b981; transform: scale(1.18); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25); }
        .color-btn img { width: 100%; height: 100%; object-fit: cover; border-radius: 11px; }

        .quantity-section { display: flex; align-items: center; gap: 12px; margin: 14px 0; background: #f8fafc; padding: 6px; border-radius: 12px; width: fit-content; }
        .quantity-section button { width: 36px; height: 36px; border: 1.5px solid #cbd5e1; background: white; font-size: 18px; font-weight: 700; cursor: pointer; border-radius: 10px; color: #475569; }
        .quantity-section input { width: 52px; height: 36px; text-align: center; border: 1.5px solid #cbd5e1; border-radius: 10px; font-weight: 700; font-size: 15px; background: white; }

        .action-buttons-desktop { display: flex; gap: 12px; margin: 16px 0; }
        @media (max-width: 768px) { .action-buttons-desktop { display: none; } }
        .btn-buy, .btn-cart { flex: 1; padding: 14px; border-radius: 14px; font-weight: 700; font-size: 15px; cursor: pointer; text-align: center; letter-spacing: 0.3px; }
        .btn-buy { background: linear-gradient(135deg, #ff3b30, #ff6b35); color: white; border: none; box-shadow: 0 4px 12px rgba(22, 101, 52, 0.3); }
        .btn-cart { background: white; color: #166534; border: 2.5px solid #166534; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

        .store-container { background: white; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 24px; box-shadow: 0 8px 25px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 18px; margin: 32px auto 0; max-width: 1200px; }
        .store-header { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .store-avatar { width: 68px; height: 68px; border-radius: 16px; overflow: hidden; flex-shrink: 0; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: 900; text-transform: uppercase; box-shadow: 0 6px 16px rgba(16,185,129,0.3); }
        .store-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .store-info h3 { font-size: 18px; font-weight: 700; margin: 0; color: #0f172a; }
        .store-badge { background: #ecfdf5; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1.5px solid #a7f3d0; text-transform: uppercase; }
        .store-status { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #10b981; font-weight: 600; }
        .visit-store-btn { background: linear-gradient(135deg, #ff3b30, #ff6b35); color: white; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; font-size: 14.5px; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.3); min-width: 140px; display: flex; align-items: center; justify-content: center; gap: 8px; }

        .store-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 16px; text-align: center; }
        .stat-value { font-size: 18px; font-weight: 800; color: #1e293b; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .store-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13.5px; color: #475569; }
        @media (max-width: 768px) { .store-detail-grid { grid-template-columns: 1fr; } }
        .detail-item strong { color: #1e293b; }
        .fasilitas-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
        .fasilitas-tag { background: #f0fdf4; color: #166534; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .sosmed-btn { display: flex; align-items: center; gap: 6px; color: #10b981; font-weight: 600; font-size: 13px; }

        .action-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 12px 16px; box-shadow: 0 -8px 25px rgba(0,0,0,0.12); display: flex; gap: 12px; z-index: 1000; border-top: 1px solid #e2e8f0; backdrop-filter: blur(10px); }
        @media (min-width: 769px) { .action-bar { display: none; } }
      `}</style>

      <div className="page-container">
        {/* PRODUCT CARD */}
        <div className="product-card">
          <div className="product-grid">
            <div className="image-section">
              <div className="carousel-wrapper">
                <div className="carousel" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                  {carouselImages.map((src, i) => (
                    <div key={i} className="carousel-slide">
                      <img src={src} alt={`${displayProduct.product_title} ${i + 1}`} onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/600x800/f3f4f6/9ca3af?text=No+Image")} />
                      {discount !== "0%" && <div className="discount-badge">{discount} OFF</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="carousel-dots">
                {carouselImages.map((_, i) => (
                  <div key={i} className={`dot ${activeSlide === i ? "active" : ""}`} onClick={() => goToSlide(i)} />
                ))}
              </div>
            </div>

            <div className="details-section">
              <h1 className="product-title">{displayProduct.product_title}</h1>
              <div className="rating-reviews">
                <div className="sold">
                  <ShoppingCart size={16} className="icon" />
                  <span className="sold-text">{displayProduct.product_sold || "Baru"}</span>
                </div>
              </div>
              <div className="price-section">
                <div className="current-price">{displayProduct.product_price}</div>
                {displayProduct.product_original_price && <div className="original-price">{displayProduct.product_original_price}</div>}
              </div>

              <div className="description">
                {showFullDetail ? fullDescription : shortDescription}
                {isLongDescription && !showFullDetail && (
                  <span className="see-more" onClick={() => setShowFullDetail(true)}>Lihat lebih banyak</span>
                )}
                {showFullDetail && (
                  <span className="see-more" onClick={() => setShowFullDetail(false)}>Sembunyikan</span>
                )}
              </div>

              <div className="variant-section">
                <label>Pilih Varian</label>
                <div className="color-options">
                  {variants.map((variant, i) => (
                    <button key={i} className={`color-btn ${activeVariant === i ? "active" : ""}`} onClick={() => handleVariantClick(i)} title={variant.name}>
                      <img src={variant.photo} alt={variant.name} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="quantity-section">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <div className="action-buttons-desktop">
                <button className="btn-buy" onClick={handleBuyNow}>Beli</button>
                <button className="btn-cart" onClick={handleAddToCart}>Tambahkan Keranjang</button>
              </div>
            </div>
          </div>
        </div>

        {/* TOKO SECTION */}
        <div className="store-container">
          {loadingStore ? (
            <p style={{ textAlign: "center", color: "#666" }}>Memuat info toko...</p>
          ) : storeData ? (
            <>
              <div className="store-header">
                <div className="store-avatar">
                  {storeData.profileImage ? (
                    <img src={storeData.profileImage} alt={storeData.nama_toko} />
                  ) : (
                    <>{storeData.nama_toko.charAt(0)}</>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3>{storeData.nama_toko}</h3>
                    <span className="store-badge">RESMI</span>
                  </div>
                  <div className="store-status">
                    <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                    Aktif beberapa menit lalu
                  </div>
                </div>
                <button className="visit-store-btn" onClick={handleVisitStore}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Kunjungi Toko
                </button>
              </div>

              <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, #e2e8f0 25%, #e2e8f0 75%, transparent)' }} />

              <div className="store-stats">
                <div>
                  <div className="stat-value">
                    <span style={{ color: '#fbbf24' }}>★</span>
                    {storeData.rating_toko}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>Rating Toko</div>
                </div>
                <div>
                  <div className="stat-value">
                    <span style={{ color: '#ff3b30' }}>Box</span>
                    {storeData.jumlah_review}+
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>Total Review</div>
                </div>
                <div>
                  <div className="stat-value">
                    <span style={{ color: '#ff3b30' }}>Check</span>
                    98%
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>Tingkat Respons</div>
                </div>
              </div>

            </>
          ) : null}
        </div>
      </div>

      <div className="action-bar">
        <button className="btn-buy" onClick={handleBuyNow}>Beli Langsung</button>
        <button className="btn-cart" onClick={handleAddToCart}> Keranjang</button>
      </div>
    </>
  );
}