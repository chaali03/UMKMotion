// src/components/ProductDetail/ProductRecommendations.tsx
'use client';

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export type Product = {
  ASIN: string;
  nama_produk: string;
  merek_produk?: string;
  kategori: string;
  harga_produk: number;
  gambar_produk?: string;
  thumbnail_produk?: string;
  toko?: string;
  rating_bintang?: number | null;
  unit_terjual?: number | null;
  persentase_diskon?: number | null;
  harga_asli?: number | null;
  bonusText?: string;
  discount?: string;
  product_price?: string;
};

export default function ProductRecommendations() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState<any>(null);

  // Baca produk yang lagi dibuka dari localStorage (sama kayak BuyComponent kamu)
  useEffect(() => {
    const loadCurrentProduct = () => {
      try {
        const stored = localStorage.getItem("selectedProduct");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentProduct(parsed);
        }
      } catch (err) {
        console.error("Gagal baca selectedProduct:", err);
      }
    };

    loadCurrentProduct();

    // Update kalau user ganti produk dari rekomendasi lain
    window.addEventListener("storage", loadCurrentProduct);
    return () => window.removeEventListener("storage", loadCurrentProduct);
  }, []);

  const formatToIDR = (harga: number) => "Rp " + harga.toLocaleString("id-ID");

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return "☆☆☆☆☆";
    const full = Math.min(5, Math.floor(rating));
    return "★★★★★".substring(0, full) + "☆☆☆☆☆".substring(0, 5 - full);
  };

  const getDiscount = (p: Product) => {
    if (p.persentase_diskon) return `${p.persentase_diskon}%`;
    if (p.harga_asli && p.harga_asli > p.harga_produk) {
      const disc = Math.round(((p.harga_asli - p.harga_produk) / p.harga_asli) * 100);
      return `${disc}%`;
    }
    return null;
  };

  const generateBonus = () => {
    const bonuses = ["Gratis Ongkir", "Hadiah Gratis", "Cashback 10%", "Beli 1 Gratis 1", "Diskon Member"];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
  };

  // Fetch rekomendasi
  useEffect(() => {
    if (!currentProduct?.kategori || !currentProduct?.ASIN || !db) {
      setLoading(false);
      return;
    }

    const fetchRecs = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          where("kategori", "==", currentProduct.kategori)
        );
        const snap = await getDocs(q);

        let products: Product[] = snap.docs
          .map((doc) => ({ ...doc.data(), ASIN: doc.id } as Product))
          .filter((p) => p.ASIN !== currentProduct.ASIN);

        products = products.map((p) => ({
          ...p,
          bonusText: generateBonus(),
          discount: getDiscount(p),
          product_price: formatToIDR(p.harga_produk),
        }));

        const shuffled = products.sort(() => 0.5 - Math.random()).slice(0, 6);
        setRecommendations(shuffled);
      } catch (err) {
        console.error("Error fetch rekomendasi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [currentProduct?.kategori, currentProduct?.ASIN]);

  // Klik rekomendasi → ganti produk utama
  const handleClick = (item: Product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(item));
    window.scrollTo(0, 0);
    window.location.reload(); // atau pake router.refresh() kalau pake Next.js
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Mencari produk serupa...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        .rec-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 24px;
          color: #0f172a;
        }
        .rec-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .rec-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          background: white;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .rec-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0,0,0,0.12);
          border-color: #10b981;
        }
        .rec-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }
        .rec-info {
          padding: 14px;
        }
        .rec-name {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .rec-price {
          font-size: 16px;
          font-weight: 800;
          color: #dc2626;
        }
        .rec-meta {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }
        .bonus {
          background: #fef3c7;
          color: #92400e;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 8px;
          display: inline-block;
          margin-top: 6px;
        }
        .discount-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #ef4444;
          color: white;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 8px;
        }
        .img-wrapper {
          position: relative;
        }
        @media (max-width: 768px) {
          .rec-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .rec-img { height: 140px; }
        }
      `}</style>

      <div>
        <h2 className="rec-title">PRODUK LAIN DARI KATEGORI INI</h2>
        <div className="rec-grid">
          {recommendations.map((item) => {
            const shortName = item.nama_produk.length > 50
              ? item.nama_produk.slice(0, 47) + "..."
              : item.nama_produk;

            const sold = item.unit_terjual
              ? `${(item.unit_terjual / 1000).toFixed(1)}K terjual`
              : "Baru";

            return (
              <div key={item.ASIN} className="rec-card" onClick={() => handleClick(item)}>
                <div className="img-wrapper">
                  <img
                    src={item.thumbnail_produk || item.gambar_produk || "/placeholder.jpg"}
                    alt={item.nama_produk}
                    className="rec-img"
                    loading="lazy"
                  />
                  {item.discount && (
                    <div className="discount-badge">{item.discount} OFF</div>
                  )}
                </div>
                <div className="rec-info">
                  <div className="rec-name">{shortName}</div>
                  <div className="rec-price">{item.product_price}</div>
                  <div className="rec-meta">
                    ★ {renderStars(item.rating_bintang)} • {sold}
                  </div>
                  {item.bonusText && <div className="bonus">{item.bonusText}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}