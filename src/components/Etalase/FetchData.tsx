// src/components/Etalase/FetchData.tsx
'use client';

import React, { useEffect, useRef, useState } from "react";

import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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
  ulasan?: Array<{
    nama_pengulas: string;
    rating: number;
    tanggal: string;
    isi: string;
  }>;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toasts, setToasts] = useState<Array<{id: string, type: 'cart' | 'favorite', title: string, message: string}>>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const loadStartRef = useRef<number>(0);
  const MIN_SPINNER_MS = 600;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsub();
  }, []);

  const PRODUCTS_PER_PAGE = 16;

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
        const m = v.match(/-?\d+(?:[.,]\d+)?/);
        if (m) {
          const n = Number(m[0].replace(',', '.'));
          if (!isNaN(n)) return n;
        }
      }
    }
    return null;
  };

  const handleProductClick = (product: Product) => {
    try {
      localStorage.setItem('selectedProduct', JSON.stringify(product));
    } catch {}
    window.location.href = '/buying';
  };

  const showToast = (type: 'cart' | 'favorite', title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
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

          const normUrl = (u?: string) => {
            if (!u) return '';
            let s = u.trim().toLowerCase();
            s = s.replace(/^https?:\/\//, '');
            const q = s.indexOf('?');
            if (q !== -1) s = s.substring(0, q);
            s = s.replace(/(_\d+x\d+|@\dx)\.(webp|jpg|jpeg|png)$/i, '.$2');
            return s;
          };
          const normName = (t?: string) => (t || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
          const seenMock = new Set<string>();
          const uniqueMock = transformed.filter((p) => {
            const keyUrl = normUrl(p.thumbnail_produk || p.gambar_produk);
            const keyName = normName(p.nama_produk);
            const key = keyUrl || `name:${keyName}`;
            if (!key) return true;
            if (seenMock.has(key)) return false;
            seenMock.add(key);
            return true;
          });

          setAllProducts(uniqueMock);
          if (isLoggedIn) {
            setDisplayedProducts(uniqueMock);
            setHasMore(false);
          } else {
            const limitedProducts = uniqueMock.slice(0, 8);
            setDisplayedProducts(limitedProducts);
            setHasMore(uniqueMock.length > 8);
          }
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
          const ulasan = Array.isArray(data?.ulasan) 
            ? Array.from(new Map(data.ulasan.map((u: any) => [JSON.stringify(u), u])).values())
            : undefined;
          return { ...data, ASIN: doc.id, tags, persentase_diskon, harga_asli, likes, interactions, ulasan } as Product;
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
        if (isLoggedIn) {
          setDisplayedProducts(transformed);
          setHasMore(false);
        } else {
          const limitedProducts = transformed.slice(0, 10);
          setDisplayedProducts(limitedProducts);
          setHasMore(transformed.length > 10);
        }
      } catch (err: any) {
        console.error("ERROR FETCH:", err);
        alert(`Gagal ambil data: ${err.message}`);
      } finally {
        finishLoading();
      }
    };

    fetchProducts();
  }, [category, searchQuery, isLoggedIn]);

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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          box-sizing: border-box;
        }
        
        /* Animasi utama */
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(40px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes slideInFromLeft {
          from { 
            opacity: 0; 
            transform: translateX(-30px) rotate(-2deg); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0) rotate(0); 
          }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.85) rotateX(10deg); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) rotateX(0); 
          }
        }
        
        @keyframes shimmer {
          0% { 
            background-position: -1000px 0; 
          }
          100% { 
            background-position: 1000px 0; 
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          33% { 
            transform: translateY(-8px) rotate(1deg); 
          }
          66% { 
            transform: translateY(-4px) rotate(-1deg); 
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06); 
          }
          50% { 
            box-shadow: 0 8px 35px rgba(253,87,1,0.25), 0 4px 15px rgba(253,87,1,0.15); 
          }
        }
        
        @keyframes gradient-shift {
          0% { 
            background-position: 0% 50%; 
          }
          50% { 
            background-position: 100% 50%; 
          }
          100% { 
            background-position: 0% 50%; 
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes card-hover {
          0% {
            transform: translateY(0) rotate(0);
          }
          100% {
            transform: translateY(-8px) rotate(0.5deg);
          }
        }
        
        @keyframes image-zoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }
        
        /* Container utama */
        .product-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, 
            rgba(253, 87, 1, 0.02) 0%, 
            rgba(253, 146, 66, 0.04) 25%, 
            rgba(255, 237, 213, 0.03) 50%, 
            rgba(253, 186, 116, 0.02) 75%, 
            rgba(253, 87, 1, 0.01) 100%);
          padding: 16px 12px;
          max-width: 1800px;
          margin: 0 auto;
          min-height: 100vh;
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
        }
        
        .product-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(253, 87, 1, 0.3) 50%, 
            transparent 100%);
          animation: slide-in-right 1s ease-out;
        }
        
        /* Grid produk - Responsif berdasarkan ukuran layar */
        .product-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          justify-content: center;
          padding: 16px 0;
          position: relative;
        }
        
        /* Desktop/large: baru pakai layout banyak kolom */
        @media (min-width: 1200px) {
          .product-list {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }
        
        /* Kartu produk - Ukuran responsif */
        .product-card {
          background: linear-gradient(145deg, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(255, 255, 255, 0.98) 100%);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 380px;
          box-shadow: 
            0 6px 20px rgba(0, 0, 0, 0.08),
            0 3px 12px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          animation: scaleIn 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) backwards;
          will-change: transform;
        }
        
        /* Stagger animation untuk kartu */
        .product-card:nth-child(1) { animation-delay: 0.05s; }
        .product-card:nth-child(2) { animation-delay: 0.1s; }
        .product-card:nth-child(3) { animation-delay: 0.15s; }
        .product-card:nth-child(4) { animation-delay: 0.2s; }
        .product-card:nth-child(5) { animation-delay: 0.25s; }
        .product-card:nth-child(6) { animation-delay: 0.3s; }
        .product-card:nth-child(7) { animation-delay: 0.35s; }
        .product-card:nth-child(8) { animation-delay: 0.4s; }
        .product-card:nth-child(9) { animation-delay: 0.45s; }
        .product-card:nth-child(10) { animation-delay: 0.5s; }
        
        .product-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            rgba(253, 87, 1, 0.03) 0%, 
            transparent 50%);
          opacity: 0;
          transition: opacity 0.4s ease;
          border-radius: 16px;
          pointer-events: none;
        }
        
        .product-card:hover {
          animation: card-hover 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          border-color: rgba(253, 87, 1, 0.3);
          box-shadow: 
            0 20px 45px rgba(0, 0, 0, 0.15),
            0 12px 25px rgba(253, 87, 1, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          transform: translateY(-10px) scale(1.02) rotate(0.5deg);
        }
        
        .product-card:hover::before {
          opacity: 1;
        }
        
        .product-card:active {
          transform: translateY(-6px) scale(1.01);
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Badge diskon */
        .discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          font-weight: 800;
          font-size: 0.7rem;
          padding: 5px 8px;
          border-radius: 8px;
          z-index: 20;
          box-shadow: 0 3px 12px rgba(239, 68, 68, 0.3);
          animation: float 4s ease-in-out infinite;
          border: 1px solid rgba(255, 255, 255, 0.3);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        /* Container gambar */
        .product-image {
          width: 100%;
          height: 180px;
          background: linear-gradient(135deg, 
            rgba(234, 88, 12, 0.08) 0%, 
            rgba(251, 146, 60, 0.06) 50%, 
            rgba(253, 186, 116, 0.04) 100%);
          overflow: hidden;
          position: relative;
          border-radius: 14px 14px 0 0;
          margin: 0;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
        
        .product-image::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.02));
          pointer-events: none;
        }
        
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          filter: brightness(0.98) contrast(1.05);
          transform-origin: center;
        }
        
        .product-card:hover .product-image img {
          animation: image-zoom 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          filter: brightness(1.05) contrast(1.1);
        }
        
        /* Overlay icons - Hanya tampil di mobile */
        .discount-chip-overlay {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 15;
        }
        
        .discount-chip {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 800;
          color: white;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 3px 12px rgba(239, 68, 68, 0.3);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }
        
        .product-card:hover .discount-chip {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
        }
        
        /* Favorite icon di atas gambar - Hanya tampil di mobile */
        .favorite-icon-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 15;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(20px);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
        }
        
        .favorite-icon-overlay:hover {
          transform: scale(1.15) rotate(8deg);
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }
        
        .favorite-icon-overlay:active {
          transform: scale(1.05) rotate(0deg);
        }
        
        /* Informasi produk */
        .product-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-grow: 1;
          background: linear-gradient(180deg, 
            transparent 0%, 
            rgba(248, 250, 252, 0.4) 100%);
        }
        
        .product-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 2.5rem;
          letter-spacing: -0.02em;
          transition: color 0.3s ease;
        }
        
        .product-card:hover .product-title {
          color: #fd5701;
          background: linear-gradient(135deg, #fd5701 0%, #f97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Rating dan sold */
        .rating-sold {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
        }
        
        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #f59e0b;
          font-weight: 700;
          font-size: 0.75rem;
          text-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .product-card:hover .rating {
          transform: scale(1.08);
          text-shadow: 0 3px 6px rgba(245, 158, 11, 0.4);
        }
        
        .sold {
          font-size: 0.7rem;
          color: #475569;
          background: rgba(255, 255, 255, 0.8);
          padding: 5px 8px;
          border-radius: 8px;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          backdrop-filter: saturate(180%) blur(10px);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .product-card:hover .sold {
          transform: translateY(-2px);
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
        }
        
        /* Harga */
        .price-container {
          margin: 6px 0;
        }
        
        .price-large {
          font-size: 1.1rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.03em;
          line-height: 1.2;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .product-card:hover .price-large {
          transform: scale(1.05);
        }
        
        .price-discounted {
          color: #ef4444 !important;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
        }
        
        .old-price {
          text-decoration: line-through !important;
          color: #94a3b8 !important;
          font-weight: 500;
          font-size: 0.8rem;
          opacity: 0.8;
          letter-spacing: -0.01em;
          display: block;
          margin-top: 2px;
          transition: opacity 0.3s ease;
        }
        
        .product-card:hover .old-price {
          opacity: 1;
        }
        
        /* Tags */
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 6px;
        }
        
        .tag-chip {
          display: inline-flex;
          align-items: center;
          padding: 5px 8px;
          border-radius: 8px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #374151;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%);
          border: 1px solid #d1d5db;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
          animation: slideInFromLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) backwards;
        }
        
        .tag-chip:nth-child(1) { animation-delay: 0.2s; }
        .tag-chip:nth-child(2) { animation-delay: 0.25s; }
        .tag-chip:nth-child(3) { animation-delay: 0.3s; }
        
        .tag-chip:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        
        /* Nama toko */
        .store-name {
          font-size: 0.75rem;
          color: #fd5701;
          font-weight: 700;
          margin: 6px 0 0;
          display: flex;
          align-items: center;
          gap: 5px;
          padding-top: 10px;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
          letter-spacing: -0.01em;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .product-card:hover .store-name {
          color: #f97316;
          transform: translateX(3px);
        }
        
        .store-name::before {
          content: '✓';
          background: linear-gradient(135deg, #fd5701 0%, #f97316 50%, #ea580c 100%);
          color: white;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 900;
          box-shadow: 0 2px 6px rgba(253, 87, 1, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .product-card:hover .store-name::before {
          transform: scale(1.2) rotate(360deg);
        }
        
        /* Action buttons */
        .action-buttons {
          margin-top: auto;
          padding-top: 14px;
          display: flex;
          gap: 6px;
          align-items: center;
        }
        
        .btn-buy {
          flex: 1;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: linear-gradient(135deg, #fd5701 0%, #f97316 50%, #ea580c 100%);
          color: white;
          box-shadow: 0 5px 15px rgba(253, 87, 1, 0.3);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          letter-spacing: -0.01em;
          position: relative;
          overflow: hidden;
        }
        
        .btn-buy::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.4), 
            transparent);
          transition: left 0.6s ease;
        }
        
        .btn-buy:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 25px rgba(253, 87, 1, 0.4);
        }
        
        .btn-buy:hover::before {
          left: 100%;
        }
        
        .btn-buy:active {
          transform: translateY(-1px) scale(1.01);
        }
        
        .btn-icon {
          width: 14px;
          height: 14px;
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .btn-buy:hover .btn-icon {
          transform: rotate(15deg) scale(1.1);
        }
        
        /* Icon buttons */
        .cart-icon-badge {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%);
          border-radius: 12px;
          box-shadow: 0 3px 15px rgba(100, 116, 139, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }
        
        .cart-icon-badge:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 5px 20px rgba(100, 116, 139, 0.4);
        }
        
        .cart-icon-badge:active {
          transform: scale(1.05) rotate(0deg);
        }
        
        .cart-icon-badge svg {
          width: 18px;
          height: 18px;
          stroke: white;
          stroke-width: 2.5;
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .cart-icon-badge:hover svg {
          transform: scale(1.1);
        }
        
        .favorite-icon-badge {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.8);
          position: relative;
          overflow: hidden;
          color: #64748b;
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
        }
        
        .favorite-icon-badge.favorited {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .favorite-icon-badge:hover {
          transform: translateY(-2px) scale(1.08) rotate(-5deg);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
          border-color: #ef4444;
        }
        
        .favorite-icon-badge:active {
          transform: translateY(-1px) scale(1.05) rotate(0deg);
        }
        
        .favorite-icon-badge svg {
          width: 18px;
          height: 18px;
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .favorite-icon-badge:hover svg {
          transform: scale(1.15);
        }
        
        /* Load more */
        .load-more-wrapper {
          text-align: center;
          margin: 40px 0 25px;
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.5s backwards;
        }
        
        .load-more-btn {
          background: linear-gradient(135deg, #fd5701 0%, #f97316 100%);
          color: white;
          border: none;
          padding: 14px 35px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 5px 20px rgba(253, 87, 1, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .load-more-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.3), 
            transparent);
          transition: left 0.6s ease;
        }
        
        .load-more-btn:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 10px 30px rgba(253, 87, 1, 0.4);
        }
        
        .load-more-btn:hover::before {
          left: 100%;
        }
        
        .load-more-btn:active:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
        }
        
        .load-more-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }
        
        /* Loader */
        .loader-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          padding: 40px 0;
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        /* Animasi khusus */
        @keyframes pop-bounce {
          0% { transform: scale(1); }
          25% { transform: scale(1.15); }
          50% { transform: scale(0.95); }
          75% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes heart-bounce {
          0% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(0.9); }
          75% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes toast-slide-in {
          0% { 
            transform: translateX(100%) translateY(20px); 
            opacity: 0; 
          }
          100% { 
            transform: translateX(0) translateY(0); 
            opacity: 1; 
          }
        }
        
        @keyframes toast-slide-out {
          0% { 
            transform: translateX(0) translateY(0); 
            opacity: 1; 
          }
          100% { 
            transform: translateX(100%) translateY(-20px); 
            opacity: 0; 
          }
        }
        
        .cart-pop {
          animation: pop-bounce 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .heart-pop {
          animation: heart-bounce 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Toast notifications */
        .toast-container {
          position: fixed;
          top: 90px;
          right: 15px;
          z-index: 9999;
          pointer-events: none;
        }
        
        .toast {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 14px;
          padding: 14px 18px;
          margin-bottom: 10px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 280px;
          backdrop-filter: blur(20px);
          animation: toast-slide-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-origin: right center;
        }
        
        .toast.toast-out {
          animation: toast-slide-out 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .toast-success {
          border-left: 4px solid #10b981;
        }
        
        .toast-cart {
          border-left: 4px solid #f59e0b;
        }
        
        .toast-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 13px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
        }
        
        .toast-success .toast-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .toast-cart .toast-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        
        .toast-content {
          flex: 1;
        }
        
        .toast-title {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 3px;
          font-size: 0.85rem;
        }
        
        .toast-message {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 50px 16px;
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .empty-state-content {
          background: linear-gradient(135deg, #fff5f5, #ffe0e0);
          padding: 35px 25px;
          border-radius: 18px;
          margin: 0 auto;
          max-width: 350px;
          animation: scaleIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s backwards;
          box-shadow: 0 8px 30px rgba(243, 54, 54, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        
        /* ========== RESPONSIVE DESIGN YANG LEBIH BAIK ========== */
        
        /* Tablet */
        @media (max-width: 1024px) {
          .product-list {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 14px;
          }
          
          .product-card {
            min-height: 350px;
          }
          
          .product-image {
            height: 160px;
          }
          
          .product-info {
            padding: 14px;
          }
        }
        
        /* Mobile Landscape */
        @media (max-width: 768px) {
          .product-container {
            padding: 14px 10px;
          }
          
          .product-list {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
          }
          
          .product-card {
            min-height: 320px;
            border-radius: 14px;
          }
          
          .product-image {
            height: 140px;
            border-radius: 12px 12px 0 0;
          }
          
          .product-info {
            padding: 12px;
            gap: 8px;
          }
          
          .product-title {
            font-size: 0.85rem;
            min-height: 2.2rem;
          }
          
          .price-large {
            font-size: 1rem;
          }
          
          .action-buttons {
            padding-top: 12px;
            flex-direction: column;
          }
          
          .btn-buy {
            padding: 10px 12px;
            font-size: 0.75rem;
            border-radius: 10px;
          }
          
          .cart-icon-badge,
          .favorite-icon-badge {
            width: 100%;
            height: 38px;
            border-radius: 10px;
          }
          
          .load-more-btn {
            padding: 12px 30px;
            font-size: 0.8rem;
          }
        }
        
        /* Mobile Portrait - Ukuran lebih kecil */
        @media (max-width: 640px) {
          .product-container {
            padding: 10px 6px;
          }
          
          .product-list {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          
          .product-card {
            min-height: auto;
            border-radius: 10px;
          }
          
          .product-image {
            height: 120px;
            border-radius: 8px 8px 0 0;
          }
          
          .product-info {
            padding: 10px;
            gap: 6px;
          }
          
          .product-title {
            font-size: 0.8rem;
            min-height: 2rem;
          }
          
          .rating-sold {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
          }
          
          .rating {
            font-size: 0.7rem;
          }
          
          .sold {
            font-size: 0.65rem;
            padding: 3px 6px;
          }
          
          .price-large {
            font-size: 0.95rem;
            font-weight: 900;
          }
          
          .old-price {
            font-size: 0.75rem;
          }
          
          .store-name {
            font-size: 0.7rem;
            padding-top: 6px;
          }
          
          .action-buttons {
            padding-top: 10px;
            gap: 6px;
            flex-direction: row;
          }
          
          .btn-buy {
            flex: 1;
            padding: 8px 10px;
            font-size: 0.7rem;
            border-radius: 6px;
          }
          
          .cart-icon-badge,
          .favorite-icon-badge {
            width: 36px;
            height: 36px;
            border-radius: 6px;
            flex-shrink: 0;
          }
          
          .btn-icon {
            width: 12px;
            height: 12px;
          }
          
          .cart-icon-badge svg,
          .favorite-icon-badge svg {
            width: 16px;
            height: 16px;
          }
          
          .discount-chip {
            padding: 4px 6px;
            font-size: 0.6rem;
            border-radius: 6px;
          }
          
          .favorite-icon-overlay {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            top: 6px;
            right: 6px;
          }
          
          .load-more-btn {
            padding: 8px 20px;
            font-size: 0.7rem;
          }
        }
        
        /* Hide favorite overlay on desktop and tablet */
        @media (min-width: 769px) {
          .favorite-icon-overlay {
            display: none;
          }
        }
        
        /* Show favorite overlay only on mobile */
        @media (max-width: 768px) {
          .favorite-icon-overlay {
            display: flex;
          }
          
          /* Hide bottom favorite button on mobile */
          .favorite-icon-badge {
            display: none;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={toast.type === 'cart' ? 'toast toast-cart' : 'toast toast-success'}>
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

      <div className="product-container">
        {loading ? (
          <div className="loader-wrap">
            {isClient ? (
              <React.Suspense fallback={
                <div style={{
                  width: 50,
                  height: 50,
                  background: 'linear-gradient(135deg, #fd5701, #f97316)',
                  borderRadius: '50%',
                  animation: 'pulse-glow 2s ease-in-out infinite'
                }}></div>
              }>
                <LazyRadioAny 
                  visible={true} 
                  height={70} 
                  width={70} 
                  color="#FD5701" 
                  colors={["#FD5701", "#f97316", "#ea580c"]} 
                  outerCircleColor="#FD5701" 
                  innerCircleColor="#f97316" 
                  barColor="#ea580c" 
                  ariaLabel="radio-loading" 
                  wrapperStyle={{}} 
                  wrapperClass="" 
                />
              </React.Suspense>
            ) : null}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <div style={{ 
                fontSize: '2.5rem', 
                marginBottom: '14px',
                animation: 'float 3s ease-in-out infinite'
              }}>
                🛍️
              </div>
              <p style={{ 
                color: "#ef4444", 
                fontSize: "1rem", 
                fontWeight: "700",
                marginBottom: "6px" 
              }}>
                Tidak ada produk ditemukan
              </p>
              <p style={{ 
                color: "#666", 
                fontSize: "0.8rem", 
                marginBottom: "18px",
                lineHeight: 1.5
              }}>
                Coba ubah kata kunci pencarian atau filter kategori
              </p>
              {!isLoggedIn && (
                <>
                  <p style={{ 
                    color: "#f33636", 
                    fontWeight: "600", 
                    marginBottom: "10px", 
                    fontSize: "0.8rem" 
                  }}>
                     Ingin melihat lebih banyak produk?
                  </p>
                  <p style={{ 
                    color: "#666", 
                    fontSize: "0.75rem", 
                    marginBottom: "18px",
                    lineHeight: 1.4
                  }}>
                    Masuk untuk mengakses katalog lengkap dan fitur eksklusif!
                  </p>
                  <a href="/login" style={{ 
                    display: "inline-flex", 
                    alignItems: "center",
                    gap: "6px",
                    background: "linear-gradient(135deg, #ef4444, #f87171)", 
                    color: "white", 
                    padding: "10px 20px", 
                    borderRadius: "10px", 
                    textDecoration: "none", 
                    fontWeight: "700", 
                    fontSize: "0.8rem",
                    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    boxShadow: "0 3px 12px rgba(239, 68, 68, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(239, 68, 68, 0.3)';
                  }}
                  >
                    <span>Masuk Sekarang</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"/>
                      <path d="M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="product-list">
              {displayedProducts.map((item) => {
                const shortTitle = item.nama_produk.length > 50 ? item.nama_produk.slice(0, 47) + "..." : item.nama_produk;
                const rating = renderStars(item.rating_bintang);
                const sold = item.unit_terjual != null ? `${item.unit_terjual} terjual` : "0 terjual";

                return (
                  <ProductCard
                    key={item.ASIN}
                    image={item.thumbnail_produk || item.gambar_produk || "https://via.placeholder.com/300x300?text=Produk"}
                    shortTitle={shortTitle}
                    price={item.product_price || formatToIDR(item.harga_produk)}
                    rating={rating}
                    sold={sold}
                    seller={item.toko}
                    discount={item.discount || getDiscount(item)}
                    product={item}
                    onProductClick={handleProductClick}
                    isLoggedIn={isLoggedIn}
                    showToast={showToast}
                    isHovered={hoveredCard === item.ASIN}
                    onHoverChange={(hovered) => setHoveredCard(hovered ? item.ASIN : null)}
                  />
                );
              })}
            </div>

            {hasMore && (
              <div className="load-more-wrapper">
                {isLoggedIn ? (
                  <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? (
                      <>
                        <div style={{
                          width: '14px',
                          height: '14px',
                          border: '2px solid transparent',
                          borderTop: '2px solid currentColor',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span>Memuat...</span>
                      </>
                    ) : (
                      <>
                        <span>Lihat Lebih Banyak</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14"/>
                          <path d="M5 12h14"/>
                        </svg>
                      </>
                    )}
                  </button>
                ) : (
                  <a className="load-more-btn" href="/login">
                    <span>Masuk untuk Lihat Lebih Banyak</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"/>
                      <path d="M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                )}
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
  isLoggedIn: boolean;
  showToast: (type: 'cart' | 'favorite', title: string, message: string) => void;
  isHovered?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

export function ProductCard({ 
  image, 
  shortTitle, 
  price, 
  rating, 
  sold, 
  seller, 
  discount, 
  product, 
  onProductClick, 
  isLoggedIn, 
  showToast,
  isHovered,
  onHoverChange 
}: ProductCardProps) {
  const toIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");
  const initialSrc = (image && image.trim()) || (product.thumbnail_produk as any) || (product.gambar_produk as any) || "https://via.placeholder.com/300x300?text=Produk";
  const [imgSrc, setImgSrc] = React.useState<string>(initialSrc);
  const [cartPop, setCartPop] = React.useState(false);
  const [heartPop, setHeartPop] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  const handleImgError = () => {
    const gallery = (product as any)?.galeri_gambar;
    const alt1 = (product as any)?.gambar_produk || (Array.isArray(gallery) ? gallery[0] : undefined);
    if (imgSrc && alt1 && imgSrc !== alt1) {
      setImgSrc(alt1);
      return;
    }
    const thumb = (product as any)?.thumbnail_produk;
    if (thumb && imgSrc !== thumb) {
      try {
        const u = new URL(thumb, window.location.origin);
        setImgSrc(u.origin + u.pathname);
        return;
      } catch {
        setImgSrc(thumb);
        return;
      }
    }
    setImgSrc("https://via.placeholder.com/300x300?text=Produk");
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const flyToNavbar = (target: 'cart' | 'favorites') => {
    try {
      const cardImg = (document.querySelector('.product-card img[src="' + imgSrc.replace(/"/g, '"') + '"]') as HTMLImageElement) || null;
      const targetEl = document.getElementById(target === 'cart' ? 'nav-cart-btn-desktop' : 'nav-fav-btn-desktop')
        || document.getElementById(target === 'cart' ? 'nav-cart-btn-mobile' : 'nav-fav-btn-mobile');
      if (!targetEl) return;

      const imgRect = (cardImg || (document.activeElement as any))?.getBoundingClientRect?.() || { top: window.innerHeight/2, left: window.innerWidth/2, width: 60, height: 60 } as DOMRect;
      const targetRect = targetEl.getBoundingClientRect();

      const flyImg = document.createElement('img');
      flyImg.src = imgSrc;
      flyImg.alt = 'flying';
      Object.assign(flyImg.style, {
        position: 'fixed',
        zIndex: '9999',
        pointerEvents: 'none',
        top: imgRect.top + 'px',
        left: imgRect.left + 'px',
        width: imgRect.width + 'px',
        height: imgRect.height + 'px',
        borderRadius: '10px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
        transform: 'scale(1)',
        transition: 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94), top 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94), left 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94), width 800ms, height 800ms, opacity 300ms',
      } as CSSStyleDeclaration);
      document.body.appendChild(flyImg);

      requestAnimationFrame(() => {
        const endTop = targetRect.top + targetRect.height / 2 - imgRect.height * 0.15;
        const endLeft = targetRect.left + targetRect.width / 2 - imgRect.width * 0.15;
        flyImg.style.top = endTop + 'px';
        flyImg.style.left = endLeft + 'px';
        flyImg.style.width = imgRect.width * 0.3 + 'px';
        flyImg.style.height = imgRect.height * 0.3 + 'px';
        flyImg.style.transform = 'scale(0.6) rotate(15deg)';
        setTimeout(() => {
          flyImg.style.opacity = '0';
          setTimeout(() => flyImg.remove(), 300);
        }, 820);
      });

      targetEl.classList.add('badge-pulse');
      setTimeout(() => targetEl.classList.remove('badge-pulse'), 800);
    } catch {}
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      try {
        const pending = {
          type: 'cart' as const,
          product,
          returnUrl: window.location.href,
          createdAt: Date.now(),
        };
        localStorage.setItem('pendingAction', JSON.stringify(pending));
      } catch {}
      window.location.href = "/login";
      return;
    }
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((p: Product) => p.ASIN === product.ASIN);
    if (existing) {
      showToast('cart', 'Sudah di Keranjang', shortTitle);
      setCartPop(true);
      setTimeout(() => setCartPop(false), 500);
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { type: 'cart', count: cart.length }
      }));
      return;
    } else {
      cart.push({ ...product, quantity: 1 });
      showToast('cart', 'Ditambahkan ke Keranjang!', shortTitle);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    flyToNavbar('cart');

    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { type: 'cart', count: cart.length }
    }));

    setCartPop(true);
    setTimeout(() => setCartPop(false), 500);
  };

  const handleAddToFavorites = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      try {
        const pending = {
          type: 'favorites' as const,
          product,
          returnUrl: window.location.href,
          createdAt: Date.now(),
        };
        localStorage.setItem('pendingAction', JSON.stringify(pending));
      } catch {}
      window.location.href = "/login";
      return;
    }
    
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const existing = favorites.find((p: Product) => p.ASIN === product.ASIN);
    const delta = existing ? -1 : 1;
    
    if (existing) {
      favorites = favorites.filter((p: Product) => p.ASIN !== product.ASIN);
      showToast('favorite', 'Dihapus dari Favorit', shortTitle);
    } else {
      favorites.push(product);
      showToast('favorite', 'Ditambahkan ke Favorit!', shortTitle);
    }
    
    localStorage.setItem("favorites", JSON.stringify(favorites));
    flyToNavbar('favorites');

    window.dispatchEvent(new CustomEvent('favoritesUpdated', {
      detail: { type: 'favorites', count: favorites.length }
    }));

    try {
      const { updateProductFavorites } = await import('../../lib/favorites');
      await updateProductFavorites(product.ASIN, delta);
      
      if (product.likes !== undefined) {
        product.likes = Math.max(0, product.likes + delta);
      }
    } catch (error) {
      console.warn('Gagal update favorit ke Firestore:', error);
    }

    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 600);
  };

  const isFavorited = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    return favorites.some((p: Product) => p.ASIN === product.ASIN);
  };

  const hasDiscount = discount && discount !== "0%";
  const parsePercent = (d?: string) => {
    if (!d) return undefined;
    const m = d.match(/(\d+(?:[.,]\d+)?)/);
    return m ? parseFloat(m[1].replace(',', '.')) : undefined;
  };

  let originalPrice: number | null = null;
  if (product.harga_asli && typeof product.harga_asli === 'number' && product.harga_asli > product.harga_produk) {
    originalPrice = product.harga_asli;
  }

  const percent = (typeof product.persentase_diskon === 'number' ? product.persentase_diskon : parsePercent(discount)) || 0;
  let discountedPrice = product.harga_produk;

  if (hasDiscount) {
    if (originalPrice && originalPrice > product.harga_produk) {
      discountedPrice = product.harga_produk;
    } else if (percent > 0) {
      if (originalPrice) {
        discountedPrice = Math.max(0, Math.round(originalPrice * (1 - percent / 100)));
      } else {
        originalPrice = product.harga_produk;
        discountedPrice = Math.max(0, Math.round(originalPrice * (1 - percent / 100)));
      }
    }
  }

  const showOldPrice = hasDiscount && originalPrice && originalPrice > discountedPrice;

  return (
    <div 
      className="product-card" 
      onClick={() => onProductClick(product)}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <div className="product-image">
        {!imageLoaded && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
            borderRadius: 'inherit',
            animation: 'shimmer 2s infinite linear'
          }}></div>
        )}
        <img 
          src={imgSrc} 
          alt={shortTitle} 
          loading="lazy" 
          decoding="async" 
          referrerPolicy="no-referrer" 
          onError={handleImgError}
          onLoad={handleImageLoad}
          style={{ 
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.4s ease'
          }}
        />
        {hasDiscount && (
          <div className="discount-chip-overlay" aria-label={`Diskon ${discount}`}>
            <span className="discount-chip">🔥 {discount} OFF</span>
          </div>
        )}
        {/* Favorite icon di atas gambar - hanya tampil di mobile */}
        <div 
          className={`favorite-icon-overlay ${heartPop ? 'heart-pop' : ''}`} 
          onClick={handleAddToFavorites} 
          aria-label="Tambah ke favorit" 
          title="Favorit"
        >
          <svg 
            viewBox="0 0 24 24" 
            width="16" 
            height="16" 
            fill={isFavorited() ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
      </div>
      
      <div className="product-info">
        <div>
          <h3 className="product-title">{shortTitle}</h3>
          
          <div className="rating-sold">
            <div className="rating" title={`Rating: ${product.rating_bintang || 0}/5`}>
              <span>{rating}</span>
              <span style={{ 
                fontSize: '0.65rem', 
                color: '#6b7280',
                marginLeft: '3px'
              }}>
                {product.rating_bintang ? product.rating_bintang.toFixed(1) : '0.0'}
              </span>
            </div>
            <div className="sold" title="Jumlah terjual">
              {sold}
            </div>
          </div>
          
          <div className="price-container">
            {showOldPrice ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="price-large price-discounted">
                    {toIDR(discountedPrice)}
                  </span>
                </div>
                <span className="old-price">
                  {toIDR(originalPrice as number)}
                </span>
              </>
            ) : (
              <span className="price-large">{toIDR(discountedPrice)}</span>
            )}
          </div>
          
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="tag-list">
              {product.tags
                .filter(tag => !/\bdiskon\b/i.test(tag))
                .slice(0, 2)
                .map((tag, idx) => (
                  <span key={idx} className="tag-chip" title={tag}>
                    {tag}
                  </span>
                ))}
            </div>
          )}
          
          <p className="store-name" title={seller}>
            {seller}
          </p>
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn-buy" 
            onClick={(e) => { e.stopPropagation(); onProductClick(product); }} 
            aria-label="Beli produk"
          >
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" />
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            Beli Sekarang
          </button>
          <div 
            className={`cart-icon-badge ${cartPop ? 'cart-pop' : ''}`} 
            onClick={handleAddToCart} 
            aria-label="Tambah ke keranjang"
            title="Keranjang"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          {/* Favorite icon di bawah - hanya tampil di desktop/tablet */}
          <div 
            className={`favorite-icon-badge ${isFavorited() ? 'favorited' : ''} ${heartPop ? 'heart-pop' : ''}`} 
            onClick={handleAddToFavorites} 
            aria-label="Tambah ke favorit"
            title="Favorit"
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