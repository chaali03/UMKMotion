'use client';

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// Tipe produk sama kayak di FetchData
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

interface ProductRecommendationsProps {
  currentCategory: string;
  currentASIN: string;
  onProductClick: (product: Product) => void;
}

export default function ProductRecommendations({
  currentCategory,
  currentASIN,
  onProductClick,
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Format IDR
  const formatToIDR = (harga: number) => {
    return "Rp " + harga.toLocaleString("id-ID");
  };

  // Render bintang
  const renderStars = (rating: number | null | undefined) => {
    if (!rating || rating === 0) return "☆☆☆☆☆";
    const full = Math.min(5, Math.max(0, Math.round(rating)));
    return "★★★★★".substring(0, full) + "☆☆☆☆☆".substring(0, 5 - full);
  };

  // Hitung diskon
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

  // Generate bonus text
  const generateBonusText = () => {
    const bonuses = ["Gratis Ongkir", "+Hadiah Gratis", "Cashback 10%", "Diskon Ekstra"];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
  };

  // Fetch rekomendasi
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!db || !currentCategory || !currentASIN) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          where("kategori", "==", currentCategory)
        );

        const snapshot = await getDocs(q);
        const products: Product[] = snapshot.docs
          .map(doc => ({ ...doc.data(), ASIN: doc.id } as Product))
          .filter(p => p.ASIN !== currentASIN);

        // Transform & enrich data
        const enriched = products.map(p => ({
          ...p,
          bonusText: generateBonusText(),
          discount: getDiscount(p),
          product_price: formatToIDR(p.harga_produk),
        }));

        // Acak & ambil 6
        const shuffled = enriched.sort(() => 0.5 - Math.random()).slice(0, 6);
        setRecommendations(shuffled);
      } catch (err) {
        console.error("Gagal fetch rekomendasi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentCategory, currentASIN]);

  if (loading) {
    return (
      <div className="recommendation-container">
        <h2 className="section-title">Memuat rekomendasi...</h2>
        <p style={{ textAlign: "center", color: "#666", padding: "20px 0" }}>
          Sedang mencari produk serupa...
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendation-container">
        <h2 className="section-title">PRODUK LAIN DARI KATEGORI INI</h2>
        <p style={{ textAlign: "center", color: "#666", padding: "20px 0" }}>
          Belum ada produk lain di kategori ini.
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .recommendation-container {
          max-width: 1200px;
          margin: 0 auto 60px;
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 16px;
          color: #1a1a1a;
        }
        .recommendation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .rec-card {
          border: 1px solid #eee;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
          background: #fff;
          cursor: pointer;
        }
        .rec-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          border-color: #10b981;
        }
        .rec-image {
          width: 100%;
          height: 160px;
          overflow: hidden;
          background: #f8f8f8;
        }
        .rec-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .rec-card:hover .rec-image img {
          transform: scale(1.05);
        }
        .rec-info {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .rec-title {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .rec-price {
          font-size: 15px;
          font-weight: 800;
          color: #dc2626;
        }
        .rec-rating {
          font-size: 12px;
          color: #f59e0b;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .rec-category {
          font-size: 11px;
          color: #10b981;
          font-weight: 600;
          margin-top: 2px;
        }
        @media (max-width: 768px) {
          .recommendation-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .rec-image {
            height: 130px;
          }
          .rec-info {
            padding: 10px;
          }
          .rec-title {
            font-size: 12px;
          }
          .rec-price {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="recommendation-container">
        <h2 className="section-title">PRODUK LAIN DARI KATEGORI INI</h2>
        <div className="recommendation-grid">
          {recommendations.map((item) => {
            const shortTitle = item.nama_produk.length > 50
              ? item.nama_produk.slice(0, 47) + "..."
              : item.nama_produk;

            const rating = renderStars(item.rating_bintang);
            const sold = item.unit_terjual != null
              ? `${(item.unit_terjual / 1000).toFixed(1)}K terjual`
              : "0 terjual";

            return (
              <div
                key={item.ASIN}
                className="rec-card"
                onClick={() => onProductClick(item)}
              >
                <div className="rec-image">
                  <img
                    src={item.thumbnail_produk || item.gambar_produk}
                    alt={shortTitle}
                    loading="lazy"
                  />
                </div>
                <div className="rec-info">
                  <h3 className="rec-title">{shortTitle}</h3>
                  <div className="rec-price">
                    {item.product_price || formatToIDR(item.harga_produk)}
                  </div>
                  <div className="rec-rating">
                    ★ {rating} • {sold}
                  </div>
                  <div className="rec-category">{item.kategori}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}