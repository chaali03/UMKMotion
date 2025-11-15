// src/components/ProductDetail/ProductRecommendations.tsx
"use client";

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

  useEffect(() => {
    const loadCurrentProduct = () => {
      try {
        const stored = localStorage.getItem("selectedProduct");
        if (stored) setCurrentProduct(JSON.parse(stored));
      } catch (err) {
        console.error(err);
      }
    };

    loadCurrentProduct();
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
    const bonuses = ["Gratis Ongkir", "Hadiah Gratis", "Cashback 10%", "Beli 1 Gratis 1", "Bonus Member"];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
  };

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
        let products = snap.docs
          .map((doc) => ({ ...doc.data(), ASIN: doc.id } as Product))
          .filter((p) => p.ASIN !== currentProduct.ASIN);

        products = products.map((p) => ({
          ...p,
          bonusText: generateBonus(),
          discount: getDiscount(p),
          product_price: formatToIDR(p.harga_produk),
        }));

        const selected = products.sort(() => 0.5 - Math.random()).slice(0, 6);
        setRecommendations(selected);
      } catch (err) {
        console.error("Error fetch rekomendasi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [currentProduct?.kategori, currentProduct?.ASIN]);

  const handleClick = (item: Product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(item));
    window.scrollTo(0, 0);
    window.location.reload();
  };

  if (loading) {
    return <div className=" py-16 text-gray-500">Mencari produk serupa...</div>;
  }

  if (recommendations.length === 0) return null;

  return (
    <>
      <style>{`
        .section-title {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 28px;
          color: #0f172a;
          text-align: left !important;  /* FIX: supaya ga center */
        }
        .rec-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .card {
          background: white;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }
        .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .img-wrap {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        .img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .card:hover .img-wrap img {
          transform: scale(1.1);
        }
        .discount {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #ef4444;
          color: white;
          font-size: 12px;
          font-weight: 800;
          padding: 6px 10px;
          border-radius: 12px;
          z-index: 10;
        }
        .info {
          padding: 16px;
        }
        .name {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .price {
          font-size: 17px;
          font-weight: 800;
          color: #dc2626;
        }
        .meta {
          font-size: 12px;
          color: #64748b;
          margin-top: 6px;
        }
        .bonus {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          display: inline-block;
          margin-top: 8px;
        }
        @media (max-width: 768px) {
          .rec-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .img-wrap { height: 160px; }
        }
      `}</style>

      <div style={{ marginTop: "60px", padding: "0 16px" }}>
        <h2 className="section-title">Produk Lain Dari Kategori Ini</h2>

        <div className="rec-grid">
          {recommendations.map((item) => (
            <div key={item.ASIN} className="card" onClick={() => handleClick(item)}>
              <div className="img-wrap">
                <img
                  src={item.thumbnail_produk || item.gambar_produk || "/placeholder.jpg"}
                  alt={item.nama_produk}
                  loading="lazy"
                />

                {item.discount && <div className="discount">{item.discount} OFF</div>}
              </div>

              <div className="info">
                <div className="name">{item.nama_produk}</div>
                <div className="price">{item.product_price}</div>
                <div className="meta">
                  ★ {renderStars(item.rating_bintang)} •{" "}
                  {item.unit_terjual ? `${(item.unit_terjual / 1000).toFixed(1)}K terjual` : "Baru"}
                </div>
                {item.bonusText && <div className="bonus">{item.bonusText}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
