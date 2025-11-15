// src/components/ProductDetail/ProductLainnya.tsx
'use client';

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export type Product = {
  ASIN: string;
  nama_produk: string;
  harga_produk: number;
  harga_asli?: number;
  persentase_diskon?: number;
  thumbnail_produk?: string;
  gambar_produk?: string;
  rating_bintang?: number;
  unit_terjual?: number;
  toko?: string;
  discountPercent?: number;
  bonusText?: string;
};

export default function ProductLainnya() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

  const renderStars = (rating?: number) => {
    if (!rating) return "☆☆☆☆☆";
    const full = Math.min(5, Math.floor(rating));
    return "★★★★★".substring(0, full) + "☆☆☆☆☆".substring(0, 5 - full);
  };

  const getRandomBonus = () => {
    const bonus = ["Gratis Ongkir", "Beli 1 Gratis 1", "Cashback 20%", "Hadiah Tumbler", "Diskon Member"];
    return bonus[Math.floor(Math.random() * bonus.length)];
  };

  const hitungDiskon = (p: Product): number | undefined => {
    if (p.persentase_diskon) return p.persentase_diskon;
    if (p.harga_asli && p.harga_asli > p.harga_produk) {
      return Math.round(((p.harga_asli - p.harga_produk) / p.harga_asli) * 100);
    }
    return undefined;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!db) return setLoading(false);

      try {
        const snap = await getDocs(collection(db, "products"));
        const all = snap.docs.map(doc => ({ ...doc.data(), ASIN: doc.id } as Product));

        const valid = all
          .filter(p => p.nama_produk && p.harga_produk && (p.thumbnail_produk || p.gambar_produk))
          .map(p => ({
            ...p,
            bonusText: getRandomBonus(),
            discountPercent: hitungDiskon(p)
          }))
          .sort(() => 0.5 - Math.random())
          .slice(0, 10);

        setProducts(valid);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const pilihProduk = (item: Product) => {
    try { localStorage.setItem("selectedProduct", JSON.stringify(item)); } catch {}
    window.location.href = '/buying';
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Mencari produk seru lainnya...</div>;
  }

  if (!products.length) return null;

  return (
    <>
      <style jsx>{`
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
          will-change: transform;
          margin: 3px;
        }
        .product-card:hover { transform: translateY(-5px) scale(1.02); border-color: rgba(253,87,1,0.5); background: linear-gradient(145deg, #ffffff 0%, #fcfcfc 100%); z-index: 10; }
        .product-image { width: 100%; height: 110px; background: linear-gradient(135deg, rgba(234,88,12,0.10) 0%, rgba(251,146,60,0.08) 50%, rgba(253,186,116,0.06) 100%); overflow: hidden; position: relative; border-radius: 10px; margin: 6px; width: calc(100% - 12px); }
        .product-image img { width: 100%; height: 100%; object-fit: cover; transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); filter: brightness(1); }
        .product-card:hover .product-image img { transform: scale(1.08) rotate(1deg); filter: brightness(1.05); }
        .discount-chip { position: absolute; top: 6px; left: 6px; display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 8px; font-size: 0.6rem; font-weight: 900; color: white; background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%); border: 1px solid rgba(255,255,255,0.2); }
        .product-info { padding: 8px; display: flex; flex-direction: column; gap: 6px; flex-grow: 1; background: linear-gradient(180deg, transparent 0%, rgba(248,250,252,0.3) 100%); }
        .product-title { font-size: 0.75rem; font-weight: 700; color: #0f172a; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 1.8rem; letter-spacing: -0.02em; }
        .price-large { font-size: 0.85rem; font-weight: 800; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .old-price { text-decoration: line-through; color: #94a3b8; font-weight: 500; font-size: 0.7rem; opacity: 0.8; }
        .rating-sold { display: flex; justify-content: space-between; align-items: center; gap: 4px; font-size: 0.65rem; color: #334155; }
      `}</style>

      <div className="mt-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          Produk Lainnya
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {products.map((item) => {
            const diskon = item.discountPercent;

            return (
              <div key={item.ASIN} onClick={() => pilihProduk(item)} className="product-card">
                <div className="product-image">
                  <img src={item.thumbnail_produk || item.gambar_produk || "/placeholder.jpg"} alt={item.nama_produk} loading="lazy" />
                  {diskon && (
                    <div className="discount-chip">-{diskon}%</div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{item.nama_produk}</h3>
                  <div>
                    <div className="price-large">{rupiah(item.harga_produk)}</div>
                    {diskon && item.harga_asli && (
                      <span className="old-price">{rupiah(item.harga_asli)}</span>
                    )}
                  </div>
                  <div className="rating-sold">
                    <span>★ {item.rating_bintang ?? '-'}</span>
                    <span>{item.unit_terjual ? `${(item.unit_terjual / 1000).toFixed(1)}K+ terjual` : 'Baru'}</span>
                  </div>
                  {item.bonusText && (
                    <div className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full w-fit">{item.bonusText}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
} 