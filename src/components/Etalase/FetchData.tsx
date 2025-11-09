// src/components/Etalase/FetchData.tsx
'use client';

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase"; // ← PAKAI firebase.ts kamu
import { collection, getDocs, query, where } from "firebase/firestore";

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
  const [showRawData, setShowRawData] = useState(false);

  const PRODUCTS_PER_PAGE = 15;

  // Listener Kategori + Search
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

  // Format idr
  const formatToIDR = (harga: number) => {
    return "Rp " + harga.toLocaleString("id-ID");
  };

  // Render bintang
  const renderStars = (rating: number | null | undefined) => {
    if (!rating || rating === 0) return "☆☆☆☆☆";
    const full = Math.min(5, Math.max(0, Math.round(rating)));
    return "★★★★★".substring(0, full) + "☆☆☆☆☆".substring(0, 5 - full);
  };

  // Diskon
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

  // Random bonus
  const generateBonusText = () => {
    const bonuses = ["Gratis Ongkir", "+Hadiah Gratis", "Cashback 10%", "Diskon Ekstra"];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
  };

  // Klik produk
  const handleProductClick = (product: Product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = "/buyingpage";
  };

  // Fetch
  useEffect(() => {
    const fetchProducts = async () => {
      console.log("FETCH MULAI → Kategori:", category, "Search:", searchQuery);
      console.log("db object:", db);

      if (!db) {
        console.error("Firebase DB tidak terinisialisasi!");
        alert("Firebase gagal inisialisasi. Cek config!");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let q = query(collection(db, "products"));

        // Filter kategori
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
            others: "Lainnya"
          };
          const mapped = categoryMap[category as keyof typeof categoryMap];
          if (mapped) {
            console.log("Filter kategori:", mapped);
            q = query(collection(db, "products"), where("kategori", "==", mapped));
          }
        }

        console.log("Eksekusi getDocs...");
        const snapshot = await getDocs(q);
        console.log("Snapshot size:", snapshot.size);

        if (snapshot.empty) {
          console.warn("Collection 'products' kosong. Pakai MOCK DATA.");
          const mockData: Product[] = [
            {
              ASIN: "mock001",
              nama_produk: "Kopi Hitam Premium (MOCK)",
              merek_produk: "UMKM Jaya",
              kategori: "Kuliner",
              harga_produk: 25000,
              gambar_produk: "https://via.placeholder.com/300",
              thumbnail_produk: "https://via.placeholder.com/150",
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
              gambar_produk: "https://via.placeholder.com/300",
              thumbnail_produk: "https://via.placeholder.com/150",
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
          setLoading(false);
          return;
        }

        const products: Product[] = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Doc ID:", doc.id, "Data:", data);
          return { ...data, ASIN: doc.id } as Product;
        });

        // Filter search (client-side)
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

        console.log("SET ALL PRODUCTS:", transformed.length);
        setAllProducts(transformed);
        setDisplayedProducts(transformed.slice(0, PRODUCTS_PER_PAGE));
        setHasMore(transformed.length > PRODUCTS_PER_PAGE);
      } catch (err: any) {
        console.error("ERROR FETCH:", err);
        console.error("Error code:", err.code);
        console.error("Error message:", err.message);
        alert(`Gagal ambil data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchQuery]);

  // Load more
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
        .product-container {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f9f9f9;
          padding: 12px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .product-list {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          justify-content: center;
        }
        .product-card {
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          border: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 320px;
        }
        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
          border-color: #e0e0e0;
        }
        .discount-badge {
          position: absolute;
          top: 6px;
          left: 6px;
          background: linear-gradient(135deg, #ff3b3b, #ff5e3a);
          color: white;
          font-weight: 900;
          font-size: 0.70rem;
          padding: 4px 10px 4px 8px;
          border-radius: 6px 0 0 6px;
          z-index: 10;
          clip-path: polygon(0% 0%, 85% 0%, 92% 20%, 100% 20%, 92% 40%, 100% 60%, 92% 80%, 100% 100%, 85% 100%, 0% 100%);
          box-shadow: 0 2px 8px rgba(255, 59, 59, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 38px;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }
        .product-card:hover .discount-badge {
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(255, 59, 59, 0.6);
        }
        .cart-icon-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(243, 54, 54, 0.95);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 11;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
          transition: all 0.25s ease;
        }
        .cart-icon-badge:hover {
          background: #d72c2c;
          transform: scale(1.15);
          box-shadow: 0 6px 16px rgba(215, 44, 44, 0.5);
        }
        .cart-icon-badge svg {
          width: 20px;
          height: 20px;
          stroke: white;
          stroke-width: 2.3;
        }
        .product-image {
          width: 100%;
          height: 160px;
          background: #f8f8f8;
          overflow: hidden;
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .product-card:hover .product-image img {
          transform: scale(1.04);
        }
        .product-info {
          padding: 6px 8px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-grow: 1;
          justify-content: space-between;
        }
        .product-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.22;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rating-sold {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.65rem;
          color: #525252;
          gap: 4px;
          margin: 1px 0 0;
        }
        .rating {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #f59e0b;
          font-weight: 600;
        }
        .sold {
          color: #6b7280;
          font-size: 0.63rem;
        }
        .price-large {
          font-size: 0.98rem;
          font-weight: 800;
          color: #dc2626;
          margin: 1px 0 0;
        }
        .bonus-promo {
          font-size: 0.60rem;
          color: #d97706;
          font-weight: 600;
          background: #fff7ed;
          padding: 1px 4px;
          border-radius: 3px;
          border: 1px solid #fed7aa;
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          margin: 1px 0 0;
        }
        .store-name {
          font-size: 0.62rem;
          color: #10b981;
          font-weight: 600;
          margin: 1px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .store-name::before {
          content: "Checkmark ";
          font-weight: bold;
        }
        .action-buttons {
          margin: 4px 0 0;
        }
        .btn-buy {
          width: 100%;
          padding: 7px 8px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: #10b981;
          color: white;
        }
        .btn-buy:hover {
          background: #059669;
          transform: translateY(-1px);
        }
        .btn-icon {
          width: 15px;
          height: 15px;
        }
        .load-more-wrapper {
          text-align: center;
          margin: 28px 0 16px;
        }
        .load-more-btn {
          background: #f33636;
          color: white;
          border: none;
          padding: 10px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: 0.3s;
        }
        .load-more-btn:hover:not(:disabled) {
          background: #d72c2c;
          transform: translateY(-2px);
        }
        .load-more-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .product-list { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .product-image { height: 130px; }
          .product-info { padding: 5px 6px 6px; gap: 1px; }
          .product-title { font-size: 0.82rem; line-height: 1.2; }
          .price-large { font-size: 0.94rem; }
          .bonus-promo { font-size: 0.58rem; padding: 1px 3px; }
          .store-name { font-size: 0.60rem; }
          .rating-sold { font-size: 0.62rem; gap: 3px; }
          .cart-icon-badge { width: 36px; height: 36px; top: 5px; right: 5px; }
          .cart-icon-badge svg { width: 18px; height: 18px; }
          .discount-badge { font-size: 0.66rem; padding: 3px 8px 3px 6px; top: 5px; left: 5px; min-width: 34px; }
          .action-buttons { margin: 3px 0 0; }
          .btn-buy { padding: 6px 7px; font-size: 0.74rem; }
          .product-card { min-height: 300px; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .product-list { grid-template-columns: repeat(4, 1fr); gap: 10px; }
          .product-card { min-height: 310px; }
        }
      `}</style>

      <div className="product-container">
        {loading ? (
          <p style={{ textAlign: "center", color: "#666", margin: "28px 0", fontSize: "0.9rem" }}>
            Loading produk dari Firebase...
          </p>
        ) : displayedProducts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>Tidak ada produk ditemukan.</p>
        ) : (
          <>
            <div className="product-list">
              {displayedProducts.map((item) => {
                const shortTitle = item.nama_produk.length > 60 ? item.nama_produk.slice(0, 57) + "..." : item.nama_produk;
                const rating = renderStars(item.rating_bintang);
                const sold = item.unit_terjual != null 
                  ? `${(item.unit_terjual / 1000).toFixed(1)}K terjual` 
                  : "0 terjual";

                return (
                  <ProductCard
                    key={item.ASIN}
                    image={item.thumbnail_produk || item.gambar_produk || "https://via.placeholder.com/150"}
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
                  {loadingMore ? "Memuat..." : "Lihat Produk Lainnya"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// Produk Card 
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
      <div className="cart-icon-badge" onClick={handleAddToCart}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>
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
        </div>
      </div>
    </div>
  );
}

export default FetchData;