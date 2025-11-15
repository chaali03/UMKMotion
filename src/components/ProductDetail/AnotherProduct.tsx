// src/components/ProductDetail/ProductLainnya.tsx
'use client';

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

export type Product = {
  ASIN: string;
  nama_produk: string;
  kategori: string;
  harga_produk: number;
  thumbnail_produk?: string;
  gambar_produk?: string;
  rating_bintang?: number;
  unit_terjual?: number;
  toko?: string;
  discount?: string;
  product_price?: string;
  bonusText?: string;
};

export default function AnotherProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const formatToIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");

  const renderStars = (rating?: number) => {
    if (!rating) return "☆☆☆☆☆";
    const full = Math.min(5, Math.floor(rating));
    return "★★★★★".substring(0, full) + "☆☆☆☆☆".substring(0, 5 - full);
  };

  const randomBonus = () => {
    const list = ["Gratis Ongkir", "Beli 1 Gratis 1", "Cashback 20%", "Hadiah Tumbler", "Diskon Member"];
    return list[Math.floor(Math.random() * list.length)];
  };

  const getDiscount = (p: any) => {
    if (p.persentase_diskon) return `${p.persentase_diskon}%`;
    if (p.harga_asli && p.harga_asli > p.harga_produk) {
      return `${Math.round(((p.harga_asli - p.harga_produk) / p.harga_asli) * 100)}%`;
    }
    return null;
  };

  useEffect(() => {
    const fetchRandomProducts = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        // Ambil semua produk dulu
        const snapshot = await getDocs(collection(db, "products"));
        let allProducts = snapshot.docs.map(doc => ({
          ...doc.data(),
          ASIN: doc.id
        } as Product));

        // Enrich + filter yang valid
        const validProducts = allProducts
          .filter(p => p.nama_produk && p.harga_produk && (p.thumbnail_produk || p.gambar_produk))
          .map(p => ({
            ...p,
            product_price: formatToIDR(p.harga_produk),
            discount: getDiscount(p),
            bonusText: randomBonus()
          }));

        // Acak total, ambil 8
        const shuffled = validProducts
          .sort(() => 0.5 - Math.random())
          .slice(0, 8);

        setProducts(shuffled);
      } catch (err) {
        console.error("Gagal ambil produk random:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomProducts();
  }, []);

  const handleClick = (item: Product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(item));
    window.scrollTo(0, 0);
    window.location.reload();
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Mencari produk seru lainnya...</div>;
  }

  if (products.length === 0) return null;

  return (
    <>
      <style>{`
        .section-title {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 28px;
          color: #0f172a;
          text-align: left !important;
        }
        .lainnya-grid {
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
          .lainnya-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .img-wrap { height: 160px; }
        }
      `}</style>

      <div style={{ marginTop: "80px", padding: "0 16px" }}>
        <h2 className="section-title">
          Produk Lainnya
        </h2>
        <div className="lainnya-grid">
          {products.map((item) => (
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
                  ★ {renderStars(item.rating_bintang)} • {item.unit_terjual ? `${(item.unit_terjual / 1000).toFixed(1)}K terjual` : "Baru"}
                </div>
                <div className="bonus">{item.bonusText}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}