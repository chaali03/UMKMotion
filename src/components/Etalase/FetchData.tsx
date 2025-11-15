// src/components/Etalase/FetchData.tsx
'use client';

import React, { useEffect, useRef, useState, Suspense } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const LazyRadio = React.lazy(() =>
  import('react-loader-spinner').then((m) => ({ default: m.Radio }))
);

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toasts, setToasts] = useState<Array<{id: string, type: 'cart' | 'favorite', title: string, message: string}>>([]);
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
<<<<<<< HEAD
        const m = v.match(/-?\d+(?:[\.,]\d+)?/);
=======
        const m = v.match(/-?\d+(?:[.,]\d+)?/);
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
        if (m) {
          const n = Number(m[0].replace(',', '.'));
          if (!isNaN(n)) return n;
        }
      }
    }
    return null;
  };

<<<<<<< HEAD
  // === NAVIGASI KE BUYING PAGE DENGAN ASIN ===
  const handleProductClick = (product: Product) => {
    if (!product.ASIN || product.ASIN === "unknown" || product.ASIN.length < 3) {
      alert("Produk tidak valid! ASIN tidak tersedia.");
      console.error("Invalid ASIN:", product.ASIN);
      return;
    }

    localStorage.setItem("selectedProduct", JSON.stringify(product));
    const url = `/buyingpage?asin=${encodeURIComponent(product.ASIN)}`;
    window.location.href = url;
=======
  const handleProductClick = (product: Product) => {
    window.location.href = `/product/${product.ASIN}`;
  };

  const showToast = (type: 'cart' | 'favorite', title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
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
        const seen = new Set<string>();
        const unique = transformed.filter((p) => {
          const keyUrl = normUrl(p.thumbnail_produk || p.gambar_produk);
          const keyName = normName(p.nama_produk);
          const key = keyUrl || `name:${keyName}`;
          if (!key) return true;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setAllProducts(unique);
        if (isLoggedIn) {
          setDisplayedProducts(unique);
          setHasMore(false);
        } else {
          const limitedProducts = unique.slice(0, 10);
          setDisplayedProducts(limitedProducts);
          setHasMore(unique.length > 10);
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04); }
          50% { box-shadow: 0 8px 30px rgba(253,87,1,0.15), 0 4px 12px rgba(253,87,1,0.08); }
        }
        
        .product-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(180deg, rgba(253, 87, 1, 0.02) 0%, rgba(253, 146, 66, 0.05) 100%);
          padding: 20px 12px;
          max-width: 1600px;
          margin: 0 auto;
          min-height: 100vh;
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: visible;
        }
        
        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
          gap: 12px;
          justify-content: center;
          padding: 5px 0;
          overflow: visible;
        }
        
        .product-card {
          background: linear-gradient(145deg, #ffffff 0%, #fefefe 100%);
          border-radius: 12px;
          overflow: visible;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          position: relative;
          border: 1px solid rgba(226, 232, 240, 0.6);
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 240px;
          box-shadow: none;
          backdrop-filter: blur(20px);
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
          will-change: transform;
          margin: 3px;
        }
        
        .product-card:nth-child(1) { animation-delay: 0.05s; }
        .product-card:nth-child(2) { animation-delay: 0.1s; }
        .product-card:nth-child(3) { animation-delay: 0.15s; }
        .product-card:nth-child(4) { animation-delay: 0.2s; }
        .product-card:nth-child(5) { animation-delay: 0.25s; }
        .product-card:nth-child(6) { animation-delay: 0.3s; }
        .product-card:nth-child(7) { animation-delay: 0.35s; }
        .product-card:nth-child(8) { animation-delay: 0.4s; }
        
        .product-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: none;
          border-color: rgba(253,87,1,0.5);
          background: linear-gradient(145deg, #ffffff 0%, #fcfcfc 100%);
          z-index: 10;
        }
        
        .product-card:active {
          transform: translateY(-3px) scale(1.015);
          transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .discount-badge {
          position: absolute;
          top: 6px;
          left: 6px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          font-weight: 800;
          font-size: 0.6rem;
          padding: 3px 6px;
          border-radius: 4px;
          z-index: 10;
          box-shadow: none;
          animation: float 3s ease-in-out infinite;
        }
        
        .product-image {
          width: 100%;
          height: 110px;
          background: linear-gradient(135deg, rgba(234, 88, 12, 0.10) 0%, rgba(251, 146, 60, 0.08) 50%, rgba(253, 186, 116, 0.06) 100%);
          overflow: hidden;
          position: relative;
          border-radius: 10px;
          margin: 6px;
          width: calc(100% - 12px);
          box-shadow: none;
        }
<<<<<<< HEAD

=======
        
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
        .discount-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 0.6rem;
          font-weight: 900;
          color: white;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
<<<<<<< HEAD

=======
        
        .product-card:hover .discount-chip {
          transform: scale(1.05);
          box-shadow: none;
        }
        
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
        .discount-chip-overlay {
          position: absolute;
          top: 6px;
          left: 6px;
          z-index: 5;
        }
        
        .favorite-icon-overlay {
          position: absolute;
          top: 6px;
          right: 6px;
          z-index: 6;
          display: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .favorite-icon-overlay:hover {
          transform: scale(1.15) rotate(5deg);
          box-shadow: none !important;
        }
        
        .favorite-icon-overlay:active {
          transform: scale(1.05) rotate(0deg);
        }
        
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: brightness(1);
        }
        
        .product-card:hover .product-image img {
          transform: scale(1.08) rotate(1deg);
          filter: brightness(1.05);
        }
        
        .product-info {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-grow: 1;
          background: linear-gradient(180deg, transparent 0%, rgba(248,250,252,0.3) 100%);
        }
        
        .product-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 1.8rem;
          letter-spacing: -0.02em;
          transition: color 0.3s ease;
        }
        
        .product-card:hover .product-title {
          color: var(--brand-orange, #FD5701);
        }
        
        .rating-sold {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 4px;
        }
        
        .rating {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #f59e0b;
          font-weight: 700;
          font-size: 0.65rem;
          text-shadow: 0 1px 2px rgba(245,158,11,0.2);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .product-card:hover .rating {
          transform: scale(1.05);
          text-shadow: 0 2px 4px rgba(245,158,11,0.3);
        }
        
        .sold {
          font-size: 0.6rem;
          color: #334155;
          background: rgba(255, 255, 255, 0.6);
          padding: 3px 5px;
          border-radius: 6px;
          font-weight: 600;
          border: none;
          box-shadow: none;
          backdrop-filter: saturate(120%) blur(6px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .product-card:hover .sold {
          transform: translateY(-1px);
          box-shadow: none;
        }
        
        .price-large {
          font-size: 0.85rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.03em;
          text-shadow: none;
          line-height: 1.1;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .product-card:hover .price-large {
          transform: scale(1.03);
        }
        
        .price-container {
          margin: 4px 0;
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
          font-size: 0.7rem;
          opacity: 0.8;
          letter-spacing: -0.01em;
          display: block;
          transition: opacity 0.3s ease;
        }
        
        .product-card:hover .old-price {
          opacity: 1;
        }
        
        .bonus-promo {
<<<<<<< HEAD
          font-size: 0.75rem;
          color: #ea580c;
          font-weight: 700;
=======
          font-size: 0.6rem;
          color: var(--brand-orange);
          font-weight: 600;
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
          background: #fff7ed;
          padding: 3px 5px;
          border-radius: 4px;
          border: 1px solid #fed7aa;
          display: inline-block;
          width: fit-content;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .product-card:hover .bonus-promo {
          transform: translateX(2px);
        }
        
        .store-name {
<<<<<<< HEAD
          font-size: 0.9rem;
          color: #ea580c;
          font-weight: 800;
          margin: 8px 0 0;
=======
          font-size: 0.65rem;
          color: var(--brand-orange);
          font-weight: 700;
          margin: 4px 0 0;
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
          display: flex;
          align-items: center;
          gap: 4px;
          padding-top: 6px;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
          letter-spacing: -0.01em;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .product-card:hover .store-name {
          color: #f97316;
          transform: translateX(2px);
        }
        
        .store-name::before {
          content: '✓';
          background: linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fd5701 100%);
          color: white;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.55rem;
          font-weight: 900;
          box-shadow: none;
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .product-card:hover .store-name::before {
          transform: scale(1.1) rotate(360deg);
        }
        
        .action-buttons {
          margin-top: auto;
          padding-top: 6px;
          display: flex;
          gap: 5px;
          align-items: center;
        }
        
        .btn-buy {
          flex: 1;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(255,255,255,0.2);
          background: linear-gradient(135deg, var(--brand-orange) 0%, #f97316 50%, #ea580c 100%);
          color: white;
          box-shadow: none;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          letter-spacing: -0.01em;
        }
        
        .btn-buy:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: none;
        }
        
        .btn-buy:active {
          transform: translateY(-1px) scale(1.01);
        }
        
        .btn-icon {
          width: 12px;
          height: 12px;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .btn-buy:hover .btn-icon {
          transform: rotate(15deg) scale(1.1);
        }
        
        .cart-icon-badge {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%);
          border-radius: 8px;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(255,255,255,0.1);
          position: relative;
          overflow: hidden;
        }
        
        .cart-icon-badge:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: none;
        }
        
        .cart-icon-badge:active {
          transform: scale(1.05) rotate(0deg);
        }
        
        .cart-icon-badge svg {
          width: 14px;
          height: 14px;
          stroke: white;
          stroke-width: 2.5;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .cart-icon-badge:hover svg {
          transform: scale(1.1);
        }
        
        .favorite-icon-badge {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid transparent;
          position: relative;
          overflow: hidden;
          color: #64748b;
        }
        
        .favorite-icon-badge.favorited {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .favorite-icon-badge:hover {
          transform: translateY(-2px) scale(1.08) rotate(-5deg);
          box-shadow: none;
          border-color: #ef4444;
        }
        
        .favorite-icon-badge:active {
          transform: translateY(-1px) scale(1.05) rotate(0deg);
        }
        
        .favorite-icon-badge svg {
          width: 14px;
          height: 14px;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .favorite-icon-badge:hover svg {
          transform: scale(1.15);
        }
        
        .engagement {
          font-size: 0.6rem;
          color: #64748b;
          transition: all 0.3s ease;
        }
        
        .product-card:hover .engagement {
          transform: translateY(-1px);
        }
        
        .engagement svg {
          color: #94a3b8;
          transition: all 0.3s ease;
        }
        
        .product-card:hover .engagement svg {
          color: #64748b;
        }
        
        .likes, .interactions {
          font-weight: 500;
        }
        
        .load-more-wrapper {
          text-align: center;
          margin: 30px 0 15px;
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s backwards;
        }
        
        .load-more-btn {
          background: linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-orange-500) 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-decoration: none;
          display: inline-block;
        }
        
        .load-more-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.05);
          box-shadow: none;
        }
        
        .load-more-btn:active:not(:disabled) {
          transform: translateY(-1px) scale(1.02);
        }
        
        .load-more-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .loader-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 40vh;
          padding: 30px 0;
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .tag-chip {
          animation: slideInFromLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }
        
        .tag-chip:nth-child(1) { animation-delay: 0.1s; }
        .tag-chip:nth-child(2) { animation-delay: 0.15s; }
        .tag-chip:nth-child(3) { animation-delay: 0.2s; }
        
        /* Responsive breakpoints untuk mobile */
        @media (min-width: 640px) {
          .product-list {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 14px;
          }
          .product-card {
            min-height: 260px;
          }
          .product-image {
            height: 120px;
          }
        }
        
        @media (min-width: 768px) {
          .product-list {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 16px;
          }
          .product-card {
            min-height: 280px;
          }
          .product-image {
            height: 130px;
          }
        }
        
        @media (min-width: 1024px) {
          .product-list {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 18px;
          }
          .product-card {
            min-height: 300px;
          }
          .product-image {
            height: 140px;
          }
        }
        
        @media (min-width: 1280px) {
          .product-list {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
          }
          .product-card {
            min-height: 320px;
          }
          .product-image {
            height: 150px;
          }
        }
        
        @media (min-width: 1536px) {
          .product-list {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 24px;
          }
          .product-card {
            min-height: 340px;
          }
          .product-image {
            height: 160px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        @keyframes pop-bounce {
          0% { transform: scale(1); }
          40% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes heart-bounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.3); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        @keyframes toast-slide-in {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes toast-slide-out {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        .cart-pop {
          animation: pop-bounce 0.35s ease;
        }
        
        .heart-pop {
          animation: heart-bounce 0.45s ease;
        }
        
        .toast-container {
          position: fixed;
          top: 80px;
          right: 10px;
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
        
        .toast.toast-out {
          animation: toast-slide-out 0.3s ease-in;
        }
        
        .toast-success {
          border-left: 3px solid #10b981;
        }
        
        .toast-cart {
          border-left: 3px solid #f59e0b;
        }
        
        .toast-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        }
        
        .toast-success .toast-icon {
          background: #10b981;
        }
        
        .toast-cart .toast-icon {
          background: #f59e0b;
        }
        
        .toast-content {
          flex: 1;
<<<<<<< HEAD
          padding: 16px 20px;
          border-radius: 16px;
          font-size: 0.95rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(255,255,255,0.2);
          background: linear-gradient(135deg, #fd5701 0%, #f97316 50%, #ea580c 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(253,87,1,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          letter-spacing: -0.01em;
=======
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
        }
        
        .toast-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
          font-size: 0.85rem;
        }
        
        .toast-message {
          font-size: 0.75rem;
<<<<<<< HEAD
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
          background: linear-gradient(135deg, #fd5701 0%, #ea580c 100%);
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

        @media (min-width: 1920px) {
          .product-list { grid-template-columns: repeat(4, 1fr); gap: 28px; }
          .product-card { min-height: 440px; }
          .product-image { height: 220px; }
        }
        @media (min-width: 1440px) and (max-width: 1919px) {
          .product-list { grid-template-columns: repeat(3, 1fr); gap: 24px; }
        }
        @media (min-width: 1200px) and (max-width: 1439px) {
          .product-list { grid-template-columns: repeat(3, 1fr); gap: 22px; }
        }
        @media (min-width: 1024px) and (max-width: 1199px) {
          .product-list { grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .product-container { padding: 28px 16px; }
        }
        @media (min-width: 900px) and (max-width: 1023px) {
          .product-container { padding: 24px 16px; }
          .product-list { grid-template-columns: repeat(2, 1fr); gap: 18px; }
          .product-card { min-height: 400px; }
          .product-image { height: 180px; }
          .product-info { padding: 14px; gap: 10px; }
          .product-title { font-size: 0.9rem; min-height: 2.5rem; }
          .price-large { font-size: 1.1rem; }
        }
        @media (min-width: 768px) and (max-width: 899px) {
          .product-container { padding: 20px 16px; }
          .product-list { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .product-card { min-height: 380px; border-radius: 16px; }
          .product-image { height: 170px; }
          .product-info { padding: 12px; gap: 8px; }
          .product-title { font-size: 0.85rem; min-height: 2.3rem; }
          .price-large { font-size: 1rem; }
          .btn-buy { padding: 10px 12px; font-size: 0.8rem; }
          .cart-icon-badge { width: 40px; height: 40px; }
        }
        @media (min-width: 640px) and (max-width: 767px) {
          .product-container { padding: 20px 16px; }
          .product-list { grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 600px; margin: 0 auto; }
          .product-card { min-height: 360px; border-radius: 16px; }
          .product-image { height: 160px; }
          .product-info { padding: 12px; gap: 8px; }
          .product-title { font-size: 0.85rem; min-height: 2.3rem; line-height: 1.3; }
          .price-large { font-size: 1rem; margin: 2px 0; }
          .rating { font-size: 0.75rem; gap: 4px; }
          .sold { font-size: 0.7rem; padding: 3px 6px; }
          .bonus-promo { font-size: 0.7rem; padding: 4px 8px; }
          .store-name { font-size: 0.75rem; padding-top: 8px; }
          .action-buttons { gap: 8px; padding-top: 10px; }
          .btn-buy { padding: 10px 12px; font-size: 0.8rem; border-radius: 10px; }
          .cart-icon-badge { width: 40px; height: 40px; border-radius: 10px; }
          .favorite-icon-badge { width: 40px; height: 40px; border-radius: 10px; }
          .cart-icon-badge svg { width: 18px; height: 18px; }
          .discount-badge { font-size: 0.7rem; padding: 4px 8px; top: 8px; left: 8px; }
        }
        @media (min-width: 480px) and (max-width: 639px) {
          .product-container { padding: 16px 12px; }
          .product-list { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .product-card { min-height: 340px; border-radius: 14px; }
          .product-image { height: 150px; }
          .product-info { padding: 10px; gap: 6px; }
          .product-title { font-size: 0.8rem; min-height: 2.1rem; }
          .price-large { font-size: 0.95rem; }
          .btn-buy { padding: 8px 10px; font-size: 0.75rem; }
          .cart-icon-badge { width: 36px; height: 36px; }
          .favorite-icon-badge { width: 36px; height: 36px; }
        }
        @media (max-width: 479px) {
          .product-container { padding: 12px 8px; }
          .product-list { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .product-card { min-height: 320px; border-radius: 12px; }
          .product-image { height: 140px; }
          .product-info { padding: 8px; gap: 6px; }
          .product-title { font-size: 0.75rem; min-height: 2rem; line-height: 1.2; }
          .price-large { font-size: 0.9rem; }
          .rating, .sold { font-size: 0.65rem; }
          .bonus-promo { font-size: 0.65rem; padding: 3px 6px; }
          .store-name { font-size: 0.7rem; }
          .btn-buy { padding: 8px; font-size: 0.7rem; border-radius: 8px; }
          .cart-icon-badge { width: 32px; height: 32px; border-radius: 8px; }
          .cart-icon-badge svg { width: 16px; height: 16px; }
          .discount-badge { font-size: 0.65rem; padding: 3px 6px; top: 6px; left: 6px; }
          .load-more-btn { padding: 12px 32px; font-size: 0.85rem; }
        }
        @media (max-width: 360px) {
          .product-container { padding: 10px 6px; }
          .product-list { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .product-card { min-height: 300px; }
          .product-image { height: 130px; }
          .product-info { padding: 6px; }
          .product-title { font-size: 0.7rem; }
          .price-large { font-size: 0.85rem; }
=======
          color: #6b7280;
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
        }
      `}</style>

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

      <div className="product-container">
        {loading ? (
          <div className="loader-wrap">
<<<<<<< HEAD
            {isClient && (
              <Suspense fallback={null}>
                <LazyRadio
                  visible={true}
                  height={80}
                  width={80}
                  colors="#FD5701"
                  ariaLabel="radio-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </Suspense>
            )}
=======
            {isClient ? (
              <React.Suspense fallback={null}>
                <LazyRadioAny visible={true} height={60} width={60} color="#FD5701" 
                  colors={["#FD5701", "#FD5701", "#FD5701"]} 
                  outerCircleColor="#FD5701" innerCircleColor="#FD5701" 
                  barColor="#FD5701" ariaLabel="radio-loading" 
                  wrapperStyle={{}} wrapperClass="" />
              </React.Suspense>
            ) : null}
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
          </div>
        ) : displayedProducts.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "30px 0", 
            animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
          }}>
            <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "12px" }}>
              Tidak ada produk ditemukan.
            </p>
            {!isLoggedIn && (
              <div style={{ 
                background: "linear-gradient(135deg, #fff5f5, #ffe0e0)", 
                padding: "16px", 
                borderRadius: "10px", 
                margin: "15px auto", 
                maxWidth: "350px",
                animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards'
              }}>
                <p style={{ color: "#f33636", fontWeight: "600", marginBottom: "8px", fontSize: "0.85rem" }}>
                  💡 Ingin melihat lebih banyak produk?
                </p>
                <p style={{ color: "#666", fontSize: "0.8rem", marginBottom: "12px" }}>
                  Masuk untuk mengakses katalog lengkap dan fitur eksklusif!
                </p>
                <a href="/login" style={{ 
                  display: "inline-block", 
                  background: "linear-gradient(135deg, #f33636, #ff6b6b)", 
                  color: "white", 
                  padding: "8px 16px", 
                  borderRadius: "6px", 
                  textDecoration: "none", 
                  fontWeight: "600", 
                  fontSize: "0.8rem",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 15px rgba(243, 54, 54, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  Masuk Sekarang
                </a>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="product-list">
              {displayedProducts.map((item) => {
                const shortTitle = item.nama_produk.length > 40 ? item.nama_produk.slice(0, 37) + "..." : item.nama_produk;
                const rating = renderStars(item.rating_bintang);
                const sold = item.unit_terjual != null ? `${item.unit_terjual} terjual` : "0 terjual";

                return (
                  <ProductCard
                    key={item.ASIN}
                    image={item.thumbnail_produk || item.gambar_produk || "/asset/placeholder/product.webp"}
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
                  />
                );
              })}
            </div>

            {hasMore && (
              <div className="load-more-wrapper">
                {isLoggedIn ? (
                  <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
                    <span>{loadingMore ? "Memuat..." : "Lihat Lebih Banyak"}</span>
                  </button>
                ) : (
                  <a className="load-more-btn" href="/login" style={{ textDecoration: 'none', color: 'white' }}>
                    <span>Masuk untuk Lihat Lebih Banyak</span>
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
}

function ProductCard({ image, shortTitle, price, rating, sold, seller, discount, product, onProductClick, isLoggedIn, showToast }: ProductCardProps) {
  const toIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");
  const initialSrc = image || "/asset/placeholder/product.webp";
  const [imgSrc, setImgSrc] = React.useState<string>(initialSrc);
<<<<<<< HEAD

=======
  const [cartPop, setCartPop] = React.useState(false);
  const [heartPop, setHeartPop] = React.useState(false);
  
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
  const handleImgError = () => {
    const alt1 = product.gambar_produk;
    if (imgSrc !== alt1 && alt1) {
      setImgSrc(alt1);
      return;
    }
<<<<<<< HEAD
    setImgSrc("/asset/placeholder/product.webp");
  };

=======
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
    setImgSrc("/asset/placeholder/product.webp");
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
        borderRadius: '8px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
        transform: 'scale(1)',
        transition: 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1), top 600ms cubic-bezier(0.16, 1, 0.3, 1), left 600ms cubic-bezier(0.16, 1, 0.3, 1), width 600ms, height 600ms, opacity 250ms',
      } as CSSStyleDeclaration);
      document.body.appendChild(flyImg);

      requestAnimationFrame(() => {
        const endTop = targetRect.top + targetRect.height / 2 - imgRect.height * 0.15;
        const endLeft = targetRect.left + targetRect.width / 2 - imgRect.width * 0.15;
        flyImg.style.top = endTop + 'px';
        flyImg.style.left = endLeft + 'px';
        flyImg.style.width = imgRect.width * 0.3 + 'px';
        flyImg.style.height = imgRect.height * 0.3 + 'px';
        flyImg.style.transform = 'scale(0.6) rotate(10deg)';
        setTimeout(() => {
          flyImg.style.opacity = '0';
          setTimeout(() => flyImg.remove(), 200);
        }, 620);
      });

      targetEl.classList.add('badge-pulse');
      setTimeout(() => targetEl.classList.remove('badge-pulse'), 600);
    } catch {}
  };

>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
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
      setTimeout(() => setCartPop(false), 400);
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
    setTimeout(() => setCartPop(false), 400);
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
    const delta = existing ? -1 : 1; // -1 jika hapus, +1 jika tambah
    
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

    // Update count di Firestore
    try {
      const { updateProductFavorites } = await import('../../lib/favorites');
      await updateProductFavorites(product.ASIN, delta);
      
      // Update tampilan lokal langsung
      if (product.likes !== undefined) {
        product.likes = Math.max(0, product.likes + delta);
      }
    } catch (error) {
      console.warn('Gagal update favorit ke Firestore:', error);
    }

    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 400);
  };

  const isFavorited = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    return favorites.some((p: Product) => p.ASIN === product.ASIN);
  };

  const hasDiscount = discount && discount !== "0%";
  const parsePercent = (d?: string) => {
<<<<<<< HEAD
    if (!d) return 0;
    const m = d.match(/(\d+(?:[\.,]\d+)?)/);
    return m ? parseFloat(m[1].replace(',', '.')) : 0;
=======
    if (!d) return undefined;
    const m = d.match(/(\d+(?:[.,]\d+)?)/);
    return m ? parseFloat(m[1].replace(',', '.')) : undefined;
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
  };

  let originalPrice: number | null = null;
  if (product.harga_asli && product.harga_asli > product.harga_produk) {
    originalPrice = product.harga_asli;
  }

<<<<<<< HEAD
  const percent = product.persentase_diskon ?? parsePercent(discount);
  let discountedPrice = product.harga_produk;

  if (hasDiscount && percent > 0) {
    if (originalPrice) {
      discountedPrice = Math.round(originalPrice * (1 - percent / 100));
    } else {
      originalPrice = product.harga_produk;
      discountedPrice = Math.round(product.harga_produk * (1 - percent / 100));
=======
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
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
    }
  }

  const showOldPrice = hasDiscount && originalPrice && originalPrice > discountedPrice;

  return (
    <div className="product-card" onClick={() => onProductClick(product)}>
      <div className="product-image">
<<<<<<< HEAD
        <img
          src={imgSrc}
          alt={shortTitle}
          loading="lazy"
          onError={handleImgError}
        />
=======
        <img src={imgSrc} alt={shortTitle} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={handleImgError} />
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
        {hasDiscount && (
          <div className="discount-chip-overlay">
            <span className="discount-chip">Diskon {discount}</span>
          </div>
        )}
<<<<<<< HEAD
        <div 
          className="favorite-icon-overlay"
          onClick={handleAddToFavorites}
          style={{
            display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 12,
            background: 'white', border: '1px solid #e2e8f0',
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            color: isFavorited() ? '#ef4444' : '#475569'
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill={isFavorited() ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
=======
        <div className={`favorite-icon-overlay ${heartPop ? 'heart-pop' : ''}`} onClick={handleAddToFavorites} aria-label="Tambah ke favorit" title="Favorit" style={{ 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: 28, 
          height: 28, 
          borderRadius: 8, 
          background: 'white', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 3px 8px rgba(0,0,0,0.1)', 
          color: isFavorited() ? '#ef4444' : '#475569' 
        }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill={isFavorited() ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
      </div>
      
      <div className="product-info">
        <div>
          <h3 className="product-title">{shortTitle}</h3>
<<<<<<< HEAD
          <div className="rating-sold" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
=======
          <div className="rating-sold" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
              <div className="rating"><span>{rating}</span></div>
              <div className="sold">{sold}</div>
            </div>
            <div className="engagement" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="likes" title="Suka" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#ef4444', fontSize: '0.55rem', fontWeight: 600 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{product.likes ?? 0}</span>
              </div>
              <div className="interactions" title="Interaksi" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#3b82f6', fontSize: '0.55rem', fontWeight: 600 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
                </svg>
                <span>{product.interactions ?? 0}</span>
              </div>
            </div>
          </div>
          
          <div className="price-container">
            {showOldPrice ? (
              <>
<<<<<<< HEAD
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
=======
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
                  <span className="price-large price-discounted">
                    {toIDR(discountedPrice)}
                  </span>
                </div>
                <span className="old-price">
                  {toIDR(originalPrice!)}
                </span>
              </>
            ) : (
              <span className="price-large">{toIDR(discountedPrice)}</span>
            )}
          </div>
          
          {Array.isArray(product.tags) && product.tags.length > 0 && (
<<<<<<< HEAD
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
=======
            <div className="tag-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 3 }}>
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
              {product.tags
                .filter(tag => !/\bdiskon\b/i.test(tag))
                .slice(0, 2)
                .map((tag, idx) => (
<<<<<<< HEAD
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex', alignItems: 'center', padding: '8px 14px',
                      borderRadius: 14, fontSize: 12, fontWeight: 800, color: '#374151',
                      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                      border: '1px solid #d1d5db',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                      e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)';
                    }}
                  >
=======
                  <span key={idx} className="tag-chip" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    padding: '3px 6px', 
                    borderRadius: 6, 
                    fontSize: '0.55rem', 
                    fontWeight: 700, 
                    color: '#374151', 
                    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)', 
                    border: '1px solid #d1d5db', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)', 
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', 
                    cursor: 'pointer' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)';
                  }}>
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
                    {tag}
                  </span>
                ))}
            </div>
          )}
          
          <p className="store-name" title={seller}>{seller}</p>
        </div>
        
        <div className="action-buttons">
          <button className="btn-buy" onClick={(e) => { e.stopPropagation(); onProductClick(product); }}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" />
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            Beli
          </button>
<<<<<<< HEAD
          <div className="cart-icon-badge" onClick={handleAddToCart}>
=======
          <div className={`cart-icon-badge ${cartPop ? 'cart-pop' : ''}`} onClick={handleAddToCart} aria-label="Tambah ke keranjang">
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
<<<<<<< HEAD
          <div 
            className={`favorite-icon-badge ${isFavorited() ? 'favorited' : ''}`} 
            onClick={handleAddToFavorites}
          >
=======
          <div className={`favorite-icon-badge ${isFavorited() ? 'favorited' : ''} ${heartPop ? 'heart-pop' : ''}`} onClick={handleAddToFavorites} aria-label="Tambah ke favorit">
>>>>>>> 29ec1b7b9fb647566693c79a9dba7ae7b1bcdf30
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