// src/components/Etalase/FetchData.tsx
'use client';

import React, { useEffect, useRef, useState } from "react";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const LazyRadio = React.lazy(() =>
  import('react-loader-spinner').then((m) => ({ default: m.Radio }))
);
const LazyRadioAny = LazyRadio as unknown as any;

export type Product = {
  ASIN: string;
  nama_produk: string;
  merek_produk: string;
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
};

function FetchData() {
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const loadStartRef = useRef<number>(0);
  const MIN_SPINNER_MS = 600;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const PRODUCTS_PER_PAGE = 18;

  useEffect(() => {
    const handleCategoryChange = (e: CustomEvent<string>) => {
      setCategory(e.detail);
      setSearchQuery("");
      setDisplayedProducts([]);
      setAllProducts([]);
    };

    const handleSearchChange = (e: CustomEvent<string>) => {
      setSearchQuery(e.detail);
      setDisplayedProducts([]);
      setAllProducts([]);
    };

    window.addEventListener("categoryChange", handleCategoryChange as EventListener);
    window.addEventListener("searchChange", handleSearchChange as EventListener);

    return () => {
      window.removeEventListener("categoryChange", handleCategoryChange as EventListener);
      window.removeEventListener("searchChange", handleSearchChange as EventListener);
    };
  }, []);

  const formatToIDR = (harga: number) => {
    return "Rp " + harga.toLocaleString("id-ID");
  };

  const renderStars = (rating: number | null | undefined) => {
    if (!rating || rating === 0) return "☆☆☆☆☆";
    const full = Math.min(5, Math.max(0, Math.round(rating)));
    return "★★★★★".substring(0, full) + "☆☆☆☆☆".substring(0, 5 - full);
  };

  const getDiscount = (product: Product) => {
    if (product.persentase_diskon != null && product.persentase_diskon > 0) {
      return `${product.persentase_diskon}%`;
    }
    if (product.harga_asli && product.harga_asli > product.harga_produk) {
      const diskon = Math.round(((product.harga_asli - product.harga_produk) / product.harga_asli) * 100);
      return `${diskon}%`;
    }
    return "0%";
  };

  // Normalize various Firestore field names to our Product shape
  const normalizeTags = (data: any): string[] | undefined => {
    const cands = [data?.tags, data?.tag, data?.promoTags, data?.labels, data?.label, data?.promo_labels];
    const arr = cands.find((v) => Array.isArray(v)) as string[] | undefined;
    if (arr && arr.length) return arr.filter(Boolean).map((t) => String(t));
    const single = [data?.promo, data?.badge, data?.labelText].find((v) => typeof v === 'string');
    return single ? [String(single)] : undefined;
  };

  const coalesceNumber = (...vals: any[]): number | null => {
    for (const v of vals) {
      if (typeof v === 'number' && !isNaN(v)) return v;
      if (typeof v === 'string' && v.trim()) {
        // Extract leading number from strings like '10%', '10 persen', '10.5'
        const m = v.match(/-?\d+(?:[\.,]\d+)?/);
        if (m) {
          const n = Number(m[0].replace(',', '.'));
          if (!isNaN(n)) return n;
        }
      }
    }
    return null;
  };

  // Kita tidak lagi men-generate bonusText; tag akan langsung dipakai dari Firestore

  const handleProductClick = (product: Product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = "/buyingpage";
  };

  useEffect(() => {
    const fetchProducts = async () => {
      console.log("FETCH MULAI → Kategori:", category, "Search:", searchQuery);

      if (!db) {
        console.error("Firebase DB tidak terinisialisasi!");
        alert("Firebase gagal inisialisasi. Cek config!");
        setLoading(false);
        return;
      }

      setLoading(true);
      loadStartRef.current = performance.now();
      const finishLoading = () => {
        const elapsed = performance.now() - loadStartRef.current;
        const wait = Math.max(0, MIN_SPINNER_MS - elapsed);
        setTimeout(() => setLoading(false), wait);
      };

      try {
        let q = query(collection(db, "products"));

        if (category && category !== "all") {
          const categoryMap: Record<string, string> = {
            food: "Kuliner",
            fashion: "Fashion",
            craft: "Kerajinan",
            beauty: "Kesehatan",
            agriculture: "Pertanian",
            electronics: "Elektronik",
            furniture: "Furnitur",
            education: "Edukasi",
          };
          const mapped = categoryMap[category as keyof typeof categoryMap];
          if (mapped) {
            q = query(collection(db, "products"), where("kategori", "==", mapped));
          }
        }

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          const mockData: Product[] = [
            {
              ASIN: "mock001",
              nama_produk: "Kopi Hitam Premium (MOCK)",
              merek_produk: "UMKM Jaya",
              kategori: "Kuliner",
              harga_produk: 25000,
              gambar_produk: "https://via.placeholder.com/400x400",
              thumbnail_produk: "https://via.placeholder.com/400x400",
              toko: "Toko Kopi Jaya",
              deskripsi_produk: "Kopi asli dari petani lokal.",
              rating_bintang: 4.5,
              unit_terjual: 1200,
              persentase_diskon: 10,
              tags: ["Gratis Ongkir", "Produk Lokal"],
              likes: 245,
              interactions: 89
            },
            {
              ASIN: "mock002",
              nama_produk: "Kaos Polos Premium (MOCK)",
              merek_produk: "Fashion UMKM",
              kategori: "Fashion",
              harga_produk: 75000,
              gambar_produk: "https://via.placeholder.com/400x400",
              thumbnail_produk: "https://via.placeholder.com/400x400",
              toko: "Toko Baju Jaya",
              deskripsi_produk: "Kaos nyaman untuk daily wear.",
              rating_bintang: 4.8,
              unit_terjual: 850,
              tags: ["Cashback 5%", "Kualitas Premium"],
              likes: 156,
              interactions: 42
            }
          ];

          const transformed = mockData.map(p => ({
            ...p,
            discount: getDiscount(p),
            product_price: formatToIDR(p.harga_produk),
          }));

          setAllProducts(transformed);
          setDisplayedProducts(transformed.slice(0, PRODUCTS_PER_PAGE));
          setHasMore(transformed.length > PRODUCTS_PER_PAGE);
          finishLoading();
          return;
        }

        const products: Product[] = snapshot.docs.map(doc => {
          const data = doc.data() as any;
          const tags = normalizeTags(data);
          const persentase_diskon = coalesceNumber(
            data?.persentase_diskon,
            data?.persentaseDiskon,
            data?.discountPercent,
            data?.diskon_persen,
            data?.diskon,
            data?.discount
          );
          const harga_asli = coalesceNumber(data?.harga_asli, data?.hargaAsli, data?.original_price, data?.hargaCoret);
          const likes = coalesceNumber(data?.likes, data?.favorites, data?.hearts) ?? undefined;
          const interactions = coalesceNumber(data?.interactions, data?.views, data?.engagements) ?? undefined;
          return { ...data, ASIN: doc.id, tags, persentase_diskon, harga_asli, likes, interactions } as Product;
        });

        const filtered = searchQuery
          ? products.filter(p =>
              p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.toko.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : products;

        const transformed = filtered.map(p => ({
          ...p,
          discount: getDiscount(p),
          product_price: formatToIDR(p.harga_produk),
        }));

        setAllProducts(transformed);
        setDisplayedProducts(transformed.slice(0, PRODUCTS_PER_PAGE));
        setHasMore(transformed.length > PRODUCTS_PER_PAGE);
      } catch (err: any) {
        console.error("ERROR FETCH:", err);
        alert(`Gagal ambil data: ${err.message}`);
      } finally {
        finishLoading();
      }
    };

    fetchProducts();
  }, [category, searchQuery]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const start = displayedProducts.length;
    const more = allProducts.slice(start, start + PRODUCTS_PER_PAGE);
    setTimeout(() => {
      setDisplayedProducts(prev => [...prev, ...more]);
      setHasMore(start + more.length < allProducts.length);
      setLoadingMore(false);
    }, 400);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .product-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(180deg, rgba(0,17,81,0.02) 0%, rgba(253,87,1,0.02) 100%);
          padding: 32px 20px;
          max-width: 1600px;
          margin: 0 auto;
          min-height: 100vh;
        }

        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          justify-content: center;
        }

        .product-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: pointer;
          position: relative;
          border: 1.5px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 420px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03);
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
          border-color: var(--brand-orange);
        }

        .discount-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          font-weight: 800;
          font-size: 0.75rem;
          padding: 6px 12px;
          border-radius: 8px;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .product-image {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, rgba(0,17,81,0.03) 0%, rgba(253,87,1,0.03) 100%);
          overflow: hidden;
          position: relative;
        }
        .discount-chip {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 800;
          color: #ef4444;
          background: #fee2e2;
          border: 1px solid #fecaca;
          box-shadow: 0 2px 6px rgba(239,68,68,0.2);
        }
        .discount-chip-overlay {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 5;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.4s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.08);
        }

        .product-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-grow: 1;
        }

        .product-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--brand-blue-ink);
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 2.7rem;
        }

        .rating-sold {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #fbbf24;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .sold {
          font-size: 0.75rem;
          color: #64748b;
          background: #f8fafc;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
        }

        .price-large {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--brand-blue-ink);
          margin: 4px 0;
        }

        .bonus-promo {
          font-size: 0.75rem;
          color: var(--brand-orange);
          font-weight: 700;
          background: #fff7ed;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #fed7aa;
          display: inline-block;
          width: fit-content;
        }

        .store-name {
          font-size: 0.8rem;
          color: var(--brand-orange);
          font-weight: 600;
          margin: 4px 0 0;
          display: flex;
          align-items: center;
          gap: 6px;
          padding-top: 10px;
          border-top: 1px dashed #e2e8f0;
        }

        .store-name::before {
          content: '✓';
          background: var(--brand-orange);
          color: white;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 900;
        }

        .action-buttons {
          margin-top: auto;
          padding-top: 12px;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn-buy {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-orange-500) 100%);
          color: white;
        }

        .btn-buy:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(253, 87, 1, 0.3);
        }

        .btn-icon {
          width: 16px;
          height: 16px;
        }

        .cart-icon-badge {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--brand-orange) 0%, #f97316 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .cart-icon-badge:hover {
          transform: scale(1.05);
        }

        .cart-icon-badge svg {
          width: 20px;
          height: 20px;
          stroke: white;
          stroke-width: 2.5;
        }

        .favorite-icon-badge {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
          color: #64748b;
        }

        .favorite-icon-badge.favorited {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .favorite-icon-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.25);
          border-color: #ef4444;
        }

        .favorite-icon-badge svg {
          width: 20px;
          height: 20px;
        }

        .engagement {
          font-size: 0.75rem;
          color: #64748b;
        }

        .engagement svg {
          color: #94a3b8;
        }

        .likes, .interactions {
          font-weight: 500;
        }

        .load-more-wrapper {
          text-align: center;
          margin: 40px 0 20px;
        }

        .load-more-btn {
          background: linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-orange-500) 100%);
          color: white;
          border: none;
          padding: 14px 40px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .load-more-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(253, 87, 1, 0.3);
        }

        .load-more-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loader-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          padding: 40px 0;
        }

        /* ========================================
           RESPONSIVE DESIGN OPTIMIZATION - DIUBAH UNTUK 3 CARD DI DESKTOP
           ======================================== */

        /* 🖥️ Ultra Wide Desktop (1920px+) - 4 columns (tetap 4 untuk layar sangat lebar) */
        @media (min-width: 1920px) {
          .product-list { 
            grid-template-columns: repeat(4, 1fr); 
            gap: 28px;
          }
          .product-card { min-height: 440px; }
          .product-image { height: 220px; }
        }

        /* 🖥️ Large Desktop (1440px - 1919px) - 3 columns */
        @media (min-width: 1440px) and (max-width: 1919px) {
          .product-list { 
            grid-template-columns: repeat(3, 1fr); 
            gap: 24px;
          }
        }

        /* 🖥️ Desktop (1200px - 1439px) - 3 columns */
        @media (min-width: 1200px) and (max-width: 1439px) {
          .product-list { 
            grid-template-columns: repeat(3, 1fr); 
            gap: 22px;
          }
        }

        /* 💻 Small Desktop (1024px - 1199px) - 3 columns */
        @media (min-width: 1024px) and (max-width: 1199px) {
          .product-list { 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px;
          }
          .product-container { padding: 28px 16px; }
        }

        /* 📱 Tablet Landscape (900px - 1023px) - 2 columns */
        @media (min-width: 900px) and (max-width: 1023px) {
          .product-container { padding: 24px 16px; }
          .product-list { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 18px;
          }
          .product-card { min-height: 400px; }
          .product-image { height: 180px; }
          .product-info { padding: 14px; gap: 10px; }
          .product-title { font-size: 0.9rem; min-height: 2.5rem; }
          .price-large { font-size: 1.1rem; }
        }

        /* 📱 Tablet Portrait (768px - 899px) - 2 columns */
        @media (min-width: 768px) and (max-width: 899px) {
          .product-container { padding: 20px 16px; }
          .product-list { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 16px;
          }
          .product-card { 
            min-height: 380px;
            border-radius: 16px;
          }
          .product-image { height: 170px; }
          .product-info { padding: 12px; gap: 8px; }
          .product-title { font-size: 0.85rem; min-height: 2.3rem; }
          .price-large { font-size: 1rem; }
          .btn-buy { padding: 10px 12px; font-size: 0.8rem; }
          .cart-icon-badge { width: 40px; height: 40px; }
        }

        /* 📱 MOBILE - 2 CARD (640px - 767px) */
        @media (min-width: 640px) and (max-width: 767px) {
          .product-container { 
            padding: 20px 16px; 
          }
          .product-list { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 16px;
            max-width: 600px;
            margin: 0 auto;
          }
          .product-card { 
            min-height: 360px;
            border-radius: 16px;
          }
          .product-image { 
            height: 160px; 
          }
          .product-info { 
            padding: 12px; 
            gap: 8px; 
          }
          .product-title { 
            font-size: 0.85rem; 
            min-height: 2.3rem;
            line-height: 1.3;
          }
          .price-large { 
            font-size: 1rem; 
            margin: 2px 0;
          }
          .rating {
            font-size: 0.75rem;
            gap: 4px;
          }
          .sold {
            font-size: 0.7rem;
            padding: 3px 6px;
          }
          .bonus-promo {
            font-size: 0.7rem;
            padding: 4px 8px;
          }
          .store-name {
            font-size: 0.75rem;
            padding-top: 8px;
          }
          .action-buttons {
            gap: 8px;
            padding-top: 10px;
          }
          .btn-buy { 
            padding: 10px 12px;
            font-size: 0.8rem;
            border-radius: 10px;
          }
          .cart-icon-badge { 
            width: 40px; 
            height: 40px;
            border-radius: 10px;
          }
          .favorite-icon-badge { 
            width: 40px; 
            height: 40px;
            border-radius: 10px;
          }
          .cart-icon-badge svg { 
            width: 18px; 
            height: 18px; 
          }
          .discount-badge { 
            font-size: 0.7rem; 
            padding: 4px 8px; 
            top: 8px;
            left: 8px;
          }
        }

        /* 📱 Small Mobile (480px - 639px) - 2 columns lebih kecil */
        @media (min-width: 480px) and (max-width: 639px) {
          .product-container { 
            padding: 16px 12px; 
          }
          .product-list { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 12px;
          }
          .product-card { 
            min-height: 340px;
            border-radius: 14px;
          }
          .product-image { 
            height: 150px; 
          }
          .product-info { 
            padding: 10px; 
            gap: 6px; 
          }
          .product-title { 
            font-size: 0.8rem; 
            min-height: 2.1rem;
          }
          .price-large { 
            font-size: 0.95rem; 
          }
          .btn-buy { 
            padding: 8px 10px;
            font-size: 0.75rem;
          }
          .cart-icon-badge { 
            width: 36px; 
            height: 36px; 
          }
          .favorite-icon-badge { 
            width: 36px; 
            height: 36px; 
          }
        }

        /* 📱 Very Small Mobile (up to 479px) - 2 columns compact */
        @media (max-width: 479px) {
          .product-container { 
            padding: 12px 8px; 
          }
          .product-list { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 10px;
          }
          .product-card { 
            min-height: 320px;
            border-radius: 12px;
          }
          .product-image { 
            height: 140px; 
          }
          .product-info { 
            padding: 8px; 
            gap: 6px; 
          }
          .product-title { 
            font-size: 0.75rem; 
            min-height: 2rem;
            line-height: 1.2;
          }
          .price-large { 
            font-size: 0.9rem; 
          }
          .rating, .sold {
            font-size: 0.65rem;
          }
          .bonus-promo {
            font-size: 0.65rem;
            padding: 3px 6px;
          }
          .store-name {
            font-size: 0.7rem;
          }
          .btn-buy { 
            padding: 8px;
            font-size: 0.7rem;
            border-radius: 8px;
          }
          .cart-icon-badge { 
            width: 32px; 
            height: 32px;
            border-radius: 8px;
          }
          .cart-icon-badge svg { 
            width: 16px; 
            height: 16px; 
          }
          .discount-badge { 
            font-size: 0.65rem; 
            padding: 3px 6px; 
            top: 6px;
            left: 6px;
          }
          .load-more-btn {
            padding: 12px 32px;
            font-size: 0.85rem;
          }
        }

        /* 📱 Extra Small Mobile (up to 360px) - Tetap 2 columns tapi lebih compact */
        @media (max-width: 360px) {
          .product-container { 
            padding: 10px 6px; 
          }
          .product-list { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 8px;
          }
          .product-card { 
            min-height: 300px;
          }
          .product-image { 
            height: 130px; 
          }
          .product-info { 
            padding: 6px; 
          }
          .product-title { 
            font-size: 0.7rem; 
          }
          .price-large { 
            font-size: 0.85rem; 
          }
        }
      `}</style>

      <div className="product-container">
        {loading ? (
          <div className="loader-wrap">
            {isClient ? (
              <React.Suspense fallback={null}>
                <LazyRadioAny
                  visible={true}
                  height={80}
                  width={80}
                  color="#FD5701"
                  colors={["#FD5701", "#FD5701", "#FD5701"]}
                  outerCircleColor="#FD5701"
                  innerCircleColor="#FD5701"
                  barColor="#FD5701"
                  ariaLabel="radio-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </React.Suspense>
            ) : null}
          </div>
        ) : displayedProducts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", fontSize: "1rem", padding: "40px 0" }}>
            Tidak ada produk ditemukan.
          </p>
        ) : (
          <>
            <div className="product-list">
              {displayedProducts.map((item) => {
                const shortTitle = item.nama_produk.length > 50 ? item.nama_produk.slice(0, 47) + "..." : item.nama_produk;
                const rating = renderStars(item.rating_bintang);
                const sold = item.unit_terjual != null 
                  ? `${item.unit_terjual} terjual` 
                  : "0 terjual";

                return (
                  <ProductCard
                    key={item.ASIN}
                    image={item.thumbnail_produk || item.gambar_produk || "https://via.placeholder.com/400x400"}
                    shortTitle={shortTitle}
                    price={item.product_price || formatToIDR(item.harga_produk)}
                    rating={rating}
                    sold={sold}
                    seller={item.toko}
                    discount={item.discount || getDiscount(item)}
                    product={item}
                    onProductClick={handleProductClick}
                  />
                );
              })}
            </div>

            {hasMore && (
              <div className="load-more-wrapper">
                <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
                  <span>{loadingMore ? "Memuat..." : "Lihat Lebih Banyak"}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

interface ProductCardProps {
  image: string;
  shortTitle: string;
  price: string;
  rating: string;
  sold: string;
  seller: string;
  discount: string;
  product: Product;
  onProductClick: (p: Product) => void;
}

function ProductCard({ image, shortTitle, price, rating, sold, seller, discount, product, onProductClick }: ProductCardProps) {
  const toIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((p: Product) => p.ASIN === product.ASIN);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Berhasil ditambahkan ke keranjang!");
  };

  const handleAddToFavorites = (e: React.MouseEvent) => {
    e.stopPropagation();
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const existing = favorites.find((p: Product) => p.ASIN === product.ASIN);
    if (existing) {
      // Remove from favorites
      favorites = favorites.filter((p: Product) => p.ASIN !== product.ASIN);
      alert("Dihapus dari favorit!");
    } else {
      // Add to favorites
      favorites.push(product);
      alert("Ditambahkan ke favorit!");
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  const isFavorited = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    return favorites.some((p: Product) => p.ASIN === product.ASIN);
  };

  // Only show discount badge if there's actual discount
  const hasDiscount = discount && discount !== "0%";

  return (
    <div className="product-card" onClick={() => onProductClick(product)}>
      <div className="product-image">
        <img src={image} alt={shortTitle} loading="lazy" />
        {hasDiscount && (
          <div className="discount-chip-overlay" aria-label={`Diskon ${discount}`}>
            <span className="discount-chip">Diskon {discount}</span>
          </div>
        )}
      </div>
      <div className="product-info">
        <div>
          <h3 className="product-title">{shortTitle}</h3>
          <div className="rating-sold" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="rating"><span>{rating}</span></div>
              <div className="sold">{sold}</div>
            </div>
            <div className="engagement" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="likes" title="Suka" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{typeof product.likes === 'number' ? product.likes : 0}</span>
              </div>
              <div className="interactions" title="Interaksi" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
                </svg>
                <span>{typeof product.interactions === 'number' ? product.interactions : 0}</span>
              </div>
            </div>
          </div>
          <div className="price-large" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{price}</span>
            {hasDiscount && product.harga_asli && product.harga_asli > product.harga_produk && (
              <span className="old-price" style={{
                textDecoration: 'line-through', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem'
              }}>
                {toIDR(product.harga_asli as number)}
              </span>
            )}
          </div>
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="tag-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {product.tags
                .filter(tag => !/\bdiskon\b/i.test(tag))
                .slice(0, 4)
                .map((tag, idx) => (
                <span key={idx} className="tag-chip" style={{
                  display: 'inline-flex', alignItems: 'center', padding: '4px 8px',
                  borderRadius: 9999, fontSize: 12, fontWeight: 600, color: '#0f172a',
                  background: '#f1f5f9', border: '1px solid #e2e8f0'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="store-name" title={seller}>{seller}</p>
        </div>
        <div className="action-buttons">
          <button className="btn-buy" onClick={(e) => { e.stopPropagation(); onProductClick(product); }} aria-label="Beli produk">
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" />
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            Beli
          </button>
          <div className="cart-icon-badge" onClick={handleAddToCart} aria-label="Tambah ke keranjang">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div 
            className={`favorite-icon-badge ${isFavorited() ? 'favorited' : ''}`} 
            onClick={handleAddToFavorites}
            aria-label="Tambah ke favorit"
          >
            <svg viewBox="0 0 24 24" fill={isFavorited() ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FetchData;