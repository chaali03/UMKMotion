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
  bonusText?: string;
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

  const generateBonusText = () => {
    const bonuses = ["Gratis Ongkir", "+Hadiah Gratis", "Cashback 10%", "Diskon Ekstra"];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
  };

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
              persentase_diskon: 10
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
              unit_terjual: 850
            }
          ];

          const transformed = mockData.map(p => ({
            ...p,
            bonusText: generateBonusText(),
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
          const data = doc.data();
          return { ...data, ASIN: doc.id } as Product;
        });

        const filtered = searchQuery
          ? products.filter(p =>
              p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.toko.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : products;

        const transformed = filtered.map(p => ({
          ...p,
          bonusText: generateBonusText(),
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
          padding: 40px 24px;
          max-width: 1600px;
          margin: 0 auto;
          min-height: 100vh;
        }

        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 28px;
          justify-content: center;
        }

        .product-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: pointer;
          position: relative;
          border: 2px solid transparent;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 480px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
        }

        .product-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(135deg, var(--brand-orange), var(--brand-blue));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .product-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08);
        }

        .product-card:hover::before {
          opacity: 1;
        }

        .discount-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          font-weight: 900;
          font-size: 0.85rem;
          padding: 8px 16px;
          border-radius: 12px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .cart-icon-badge {
          background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-ink) 100%);
          color: white;
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,17,81,0.2);
        }

        .cart-icon-badge:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 8px 20px rgba(0,17,81,0.3);
        }

        .cart-icon-badge svg {
          width: 24px;
          height: 24px;
          stroke: white;
          stroke-width: 2.5;
        }

        .product-image {
          width: 100%;
          height: 280px;
          background: linear-gradient(135deg, rgba(0,17,81,0.04) 0%, rgba(253,87,1,0.04) 100%);
          overflow: hidden;
          position: relative;
        }

        .product-image::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0,17,81,0.03) 0%,
            transparent 30%,
            transparent 70%,
            rgba(253,87,1,0.03) 100%
          );
          z-index: 1;
          pointer-events: none;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          filter: brightness(1.03) contrast(1.08) saturate(1.12);
        }

        .product-card:hover .product-image img {
          transform: scale(1.12);
          filter: brightness(1.06) contrast(1.1) saturate(1.2);
        }

        .product-info {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex-grow: 1;
        }

        .product-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--brand-blue-ink);
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 3rem;
          letter-spacing: -0.02em;
        }

        .rating-sold {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fbbf24;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .sold {
          font-size: 0.8rem;
          color: #64748b;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          padding: 6px 12px;
          border-radius: 100px;
          font-weight: 700;
          border: 1px solid #e2e8f0;
        }

        .price-large {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--brand-blue-ink);
          margin: 6px 0;
          letter-spacing: -0.02em;
        }

        .bonus-promo {
          font-size: 0.8rem;
          color: var(--brand-orange);
          font-weight: 800;
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          padding: 8px 14px;
          border-radius: 10px;
          border: 2px solid var(--brand-orange);
          display: inline-block;
          width: fit-content;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          box-shadow: 0 2px 8px rgba(253, 87, 1, 0.15);
        }

        .store-name {
          font-size: 0.85rem;
          color: var(--brand-orange);
          font-weight: 700;
          margin: 8px 0 0;
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 12px;
          border-top: 2px dashed #e2e8f0;
        }

        .store-name::before {
          content: '✓';
          background: linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-orange-500) 100%);
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 900;
          box-shadow: 0 2px 6px rgba(253, 87, 1, 0.3);
        }

        .action-buttons {
          margin-top: auto;
          padding-top: 14px;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .btn-buy {
          flex: 1;
          padding: 16px;
          border-radius: 16px;
          font-size: 0.95rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          border: none;
          background: linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-orange-500) 100%);
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          box-shadow: 0 4px 12px rgba(253, 87, 1, 0.3);
        }

        .btn-buy:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(253, 87, 1, 0.4);
        }

        .btn-buy:active {
          transform: translateY(-1px);
        }

        .btn-icon {
          width: 18px;
          height: 18px;
        }

        .load-more-wrapper {
          text-align: center;
          margin: 60px 0 40px;
        }

        .load-more-btn {
          background: linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-orange-500) 100%);
          color: white;
          border: none;
          padding: 18px 56px;
          border-radius: 100px;
          font-weight: 800;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(253, 87, 1, 0.3);
        }

        .load-more-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--brand-blue) 0%, rgba(0,17,81,0.9) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .load-more-btn:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(253, 87, 1, 0.4);
        }

        .load-more-btn:hover:not(:disabled)::before {
          opacity: 1;
        }

        .load-more-btn span {
          position: relative;
          z-index: 1;
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
           RESPONSIVE - SINGLE CARD ON MOBILE
           ======================================== */

        /* 🖥️ Ultra Wide Desktop (1920px+) - 6 columns */
        @media (min-width: 1920px) {
          .product-list { 
            grid-template-columns: repeat(6, 1fr); 
            gap: 32px;
          }
        }

        /* 🖥️ Large Desktop (1440px - 1919px) - 5 columns */
        @media (min-width: 1440px) and (max-width: 1919px) {
          .product-list { 
            grid-template-columns: repeat(5, 1fr); 
            gap: 28px;
          }
        }

        /* 🖥️ Desktop (1200px - 1439px) - 4 columns */
        @media (min-width: 1200px) and (max-width: 1439px) {
          .product-list { 
            grid-template-columns: repeat(4, 1fr); 
            gap: 24px;
          }
        }

        /* 💻 Small Desktop (1024px - 1199px) - 3 columns */
        @media (min-width: 1024px) and (max-width: 1199px) {
          .product-list { 
            grid-template-columns: repeat(3, 1fr); 
            gap: 24px;
          }
          .product-container { padding: 36px 20px; }
        }

        /* 📱 Tablet (768px - 1023px) - 3 columns */
        @media (min-width: 768px) and (max-width: 1023px) {
          .product-container { padding: 32px 18px; }
          .product-list { 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px;
          }
          .product-card { 
            min-height: 450px; 
            border-radius: 20px;
          }
          .product-image { height: 240px; }
          .product-info { padding: 20px; gap: 12px; }
          .product-title { font-size: 1.05rem; min-height: 2.8rem; }
          .price-large { font-size: 1.3rem; }
        }

        /* 📱 Small Tablet (640px - 767px) - 2 columns */
        @media (min-width: 640px) and (max-width: 767px) {
          .product-container { padding: 28px 16px; }
          .product-list { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 18px;
          }
          .product-card { 
            min-height: 440px;
            border-radius: 20px;
          }
          .product-image { height: 220px; }
          .product-info { padding: 18px; gap: 11px; }
          .product-title { font-size: 1rem; }
          .price-large { font-size: 1.25rem; }
        }

        /* 📱 MOBILE - SINGLE CARD (up to 639px) - 1 column */
        @media (max-width: 639px) {
          .product-container { 
            padding: 24px 16px; 
          }
          
          .product-list { 
            /* KEY CHANGE: Single column on mobile */
            grid-template-columns: 1fr; 
            gap: 24px;
            max-width: 500px;
            margin: 0 auto;
          }
          
          .product-card { 
            min-height: 500px;
            border-radius: 24px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          }
          
          .product-image { 
            height: 300px; 
          }
          
          .product-info { 
            padding: 24px; 
            gap: 14px; 
          }
          
          .product-title { 
            font-size: 1.15rem; 
            min-height: 3rem;
            line-height: 1.5;
            font-weight: 700;
          }
          
          .price-large { 
            font-size: 1.5rem; 
            margin: 8px 0;
            font-weight: 900;
          }
          
          .rating {
            font-size: 0.95rem;
            gap: 8px;
          }
          
          .sold {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
          
          .bonus-promo {
            font-size: 0.8rem;
            padding: 8px 14px;
          }
          
          .store-name {
            font-size: 0.9rem;
            padding-top: 12px;
          }
          
          .action-buttons {
            gap: 10px;
            padding-top: 14px;
          }
          
          .btn-buy { 
            padding: 16px 12px;
            font-size: 0.95rem;
            border-radius: 16px;
          }
          
          .cart-icon-badge { 
            width: 52px; 
            height: 52px;
            border-radius: 16px;
          }
          
          .cart-icon-badge svg { 
            width: 24px; 
            height: 24px; 
          }
          
          .discount-badge { 
            font-size: 0.85rem; 
            padding: 8px 16px; 
            top: 16px;
            left: 16px;
          }
          
          .btn-icon {
            width: 18px;
            height: 18px;
          }

          .load-more-btn {
            padding: 16px 48px;
            font-size: 1rem;
          }
        }

        /* 📱 Very Small Mobile (up to 380px) */
        @media (max-width: 380px) {
          .product-container { 
            padding: 20px 12px; 
          }
          
          .product-list {
            gap: 20px;
          }
          
          .product-card { 
            min-height: 480px;
          }
          
          .product-image { 
            height: 280px; 
          }
          
          .product-info { 
            padding: 20px; 
            gap: 12px; 
          }
          
          .product-title { 
            font-size: 1.05rem; 
          }
          
          .price-large { 
            font-size: 1.35rem; 
          }
          
          .btn-buy { 
            padding: 14px 10px;
            font-size: 0.9rem;
          }
          
          .cart-icon-badge { 
            width: 48px; 
            height: 48px; 
          }

          .load-more-btn {
            padding: 14px 40px;
            font-size: 0.95rem;
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
          <p style={{ textAlign: "center", color: "#666", fontSize: "1.1rem", padding: "40px 0" }}>
            Tidak ada produk ditemukan.
          </p>
        ) : (
          <>
            <div className="product-list">
              {displayedProducts.map((item) => {
                const shortTitle = item.nama_produk.length > 60 ? item.nama_produk.slice(0, 57) + "..." : item.nama_produk;
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
                    bonusText={item.bonusText || generateBonusText()}
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
  bonusText: string;
  product: Product;
  onProductClick: (p: Product) => void;
}

function ProductCard({ image, shortTitle, price, rating, sold, seller, discount, bonusText, product, onProductClick }: ProductCardProps) {
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

  return (
    <div className="product-card" onClick={() => onProductClick(product)}>
      <div className="discount-badge">{discount}</div>
      <div className="product-image">
        <img src={image} alt={shortTitle} loading="lazy" />
      </div>
      <div className="product-info">
        <div>
          <h3 className="product-title">{shortTitle}</h3>
          <div className="rating-sold">
            <div className="rating"><span>{rating}</span></div>
            <div className="sold">{sold}</div>
          </div>
          <div className="price-large">{price}</div>
          <p className="bonus-promo">{bonusText}</p>
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
          <div className="cart-icon-badge" onClick={handleAddToCart}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FetchData;