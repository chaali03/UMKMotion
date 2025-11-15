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

  const hitungDiskon = (p: Product): number | null => {
    if (p.persentase_diskon) return p.persentase_diskon;
    if (p.harga_asli && p.harga_asli > p.harga_produk) {
      return Math.round(((p.harga_asli - p.harga_produk) / p.harga_asli) * 100);
    }
    return null;
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
    localStorage.setItem("selectedProduct", JSON.stringify(item));
    window.scrollTo(0, 0);
    window.location.reload();
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Mencari produk seru lainnya...</div>;
  }

  if (!products.length) return null;

  return (
    <>
      <style jsx>{`
        .discount-badge {
          position: absolute;
          top: 10px;
          left: -6px;
          background: linear-gradient(135deg, #ff3b30, #ff6b35);
          color: white;
          font-weight: 900;
          font-size: 13px;
          padding: 6px 12px 6px 16px;
          border-radius: 0 20px 20px 0;
          box-shadow: 0 4px 12px rgba(255, 59, 48, 0.4);
          z-index: 20;
          animation: pulse 2s infinite;
        }
        .discount-badge::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -8px;
          width: 0;
          height: 0;
          border-left: 8px solid #c41e1e;
          border-top: 8px solid transparent;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .card:hover img {
          transform: scale(1.08);
        }
      `}</style>

      <div className="mt-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          Produk Lainnya
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {products.map((item) => {
            const diskon = item.discountPercent;

            return (
              <div
                key={item.ASIN}
                onClick={() => pilihProduk(item)}
                className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
              >
                {/* Gambar + Diskon */}
                <div className=" aspect-video bg-gray-50 overflow-hidden">
                  <img
                    src={item.thumbnail_produk || item.gambar_produk || "/placeholder.jpg"}
                    alt={item.nama_produk}
                    className="w-full h-full object-cover transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* DISKON BADGE KEREN */}
                  {diskon && (
                    <div className="discount-badge">
                      -{diskon}%
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-tight">
                    {item.nama_produk}
                  </h3>

                  {/* Harga */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-red-600">
                      {rupiah(item.harga_produk)}
                    </span>
                    {diskon && item.harga_asli && (
                      <span className="text-xs text-gray-400 line-through">
                        {rupiah(item.harga_asli)}
                      </span>
                    )}
                  </div>

                  {/* Rating & Terjual */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      {item.rating_bintang || "-"}
                    </span>
                    <span>
                      {item.unit_terjual
                        ? `${(item.unit_terjual / 1000).toFixed(1)}K+ terjual`
                        : "Baru"}
                    </span>
                  </div>

                  {/* Bonus */}
                  <div className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full w-fit">
                    {item.bonusText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
} 