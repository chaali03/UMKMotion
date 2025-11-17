// src/components/ProductDetail/ProductRecommendations.tsx
"use client";

import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Heart, ShoppingCart, Star } from "lucide-react";

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

interface Toast {
  id: string;
  type: 'cart' | 'favorite';
  title: string;
  message: string;
}

export default function ProductRecommendations() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  const showToast = (type: 'cart' | 'favorite', title: string, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleAddToCart = (e: React.MouseEvent, item: Product) => {
    e.stopPropagation();
    const user = auth?.currentUser;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const productToAdd = {
      asin: item.ASIN,
      product_title: item.nama_produk,
      product_photo: item.thumbnail_produk || item.gambar_produk,
      product_price: item.product_price,
      product_price_num: item.harga_produk,
      quantity: 1,
      seller_name: item.toko,
    };
    const existing = cart.find((p: any) => p.asin === item.ASIN);
    if (existing) {
      existing.quantity += 1;
      showToast('cart', 'Jumlah diperbarui', `${item.nama_produk}`);
    } else {
      cart.push(productToAdd);
      showToast('cart', 'Ditambahkan ke Keranjang!', item.nama_produk);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { type: 'cart', count: cart.length } }));
  };

  const handleAddToFavorite = (e: React.MouseEvent, item: Product) => {
    e.stopPropagation();
    const user = auth?.currentUser;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const exists = favorites.some((f: any) => f.ASIN === item.ASIN);
    if (exists) {
      const idx = favorites.findIndex((f: any) => f.ASIN === item.ASIN);
      favorites.splice(idx, 1);
      showToast('favorite', 'Dihapus dari Favorit', item.nama_produk);
    } else {
      favorites.push({
        ASIN: item.ASIN,
        nama_produk: item.nama_produk,
        thumbnail_produk: item.thumbnail_produk,
        harga_produk: item.harga_produk,
        toko: item.toko,
      });
      showToast('favorite', 'Ditambahkan ke Favorit!', item.nama_produk);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { type: 'favorites', count: favorites.length } }));
  };

  const handleClick = (item: Product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(item));
    window.scrollTo(0, 0);
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={{ marginTop: "60px", padding: "0 16px" }}>
        <style>{`
          @keyframes shimmer { 0% { background-position: -1200px 0; opacity: 0.8; } 50% { opacity: 1; } 100% { background-position: 1200px 0; opacity: 0.8; } }
          .sk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto; }
          .sk-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
          .sk-img { height: 200px; background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%); background-size: 1200px 100%; animation: shimmer 1.8s ease-in-out infinite; }
          .sk-content { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
          .sk-line { height: 12px; background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%); background-size: 1200px 100%; animation: shimmer 1.8s ease-in-out infinite; border-radius: 6px; }
          .sk-title { height: 16px; width: 85%; }
          .sk-price { height: 14px; width: 60%; }
          .sk-btn { height: 40px; width: 100%; }
          @media (max-width: 768px) { .sk-grid { grid-template-columns: 1fr; } .sk-img { height: 140px; } }
        `}</style>
        <h2 className="section-title">Produk Lain Dari Kategori Ini</h2>
        <div className="sk-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="sk-card" style={{ animation: `fadeInUp 0.5s ease both ${i * 0.08}s` }}>
              <div className="sk-img" />
              <div className="sk-content">
                <div className="sk-line sk-title" />
                <div className="sk-line" style={{ width: '70%' }} />
                <div className="sk-line sk-price" />
                <div className="sk-line" style={{ width: '50%' }} />
                <div className="sk-line sk-btn" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-slide-in { 0% { transform: translateX(100%) translateY(20px); opacity: 0; } 100% { transform: translateX(0) translateY(0); opacity: 1; } }
        .toast-container { position: fixed; top: 90px; right: 15px; z-index: 100000; pointer-events: none; }
        .toast { background: rgba(255,255,255,0.95); border-radius: 14px; padding: 14px 18px; margin-bottom: 10px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.8); display: flex; align-items: center; gap: 10px; min-width: 280px; backdrop-filter: blur(20px); animation: toast-slide-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform-origin: right center; }
        .toast-favorite { border-left: 4px solid #ec4899; }
        .toast-cart { border-left: 4px solid #f59e0b; }
        .toast-icon { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 3px 8px rgba(0,0,0,0.2); }
        .toast-favorite .toast-icon { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); }
        .toast-cart .toast-icon { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .toast-title { font-weight: 700; color: #1f2937; margin-bottom: 3px; font-size: 0.85rem; }
        .toast-message { font-size: 0.75rem; color: #6b7280; }
      `}</style>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'favorite' ? 'toast-favorite' : 'toast-cart'}`}>
            <div className="toast-icon">
              {t.type === 'favorite' ? <Heart size={14} className="text-white" /> : <ShoppingCart size={14} className="text-white" />}
            </div>
            <div className="min-w-0">
              <div className="toast-title">{t.title}</div>
              <div className="toast-message truncate">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes card-in { 0% { opacity: 0; transform: translateY(16px) scale(0.96); } 55% { opacity: 1; transform: translateY(-2px) scale(1.01); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .section-title { font-size: 22px; font-weight: 800; margin: 0 0 28px; color: #0f172a; text-align: left !important; }
        .rec-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto; }
        .card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all .2s ease; cursor: pointer; position: relative; border: 1px solid #e5e7eb; animation: card-in 0.45s cubic-bezier(0.22, 0.61, 0.36, 1) both; }
        .card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .img-wrap { position: relative; height: 200px; overflow: hidden; background: #f3f4f6; }
        .img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: none; }
        .discount { position: absolute; top: 10px; left: 10px; background: #dc2626; color: #fff; font-size: 12px; font-weight: 900; padding: 6px 10px; border-radius: 8px; z-index: 10; }
        .info { padding: 16px; display:flex; flex-direction:column; gap:10px; }
        .name { font-size: 0.95rem; font-weight: 700; color: #1f2937; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.8rem; }
        .price-row { display:flex; align-items:center; gap:8px; }
        .price { font-size: 1.15rem; font-weight: 900; color: #dc2626; }
        .old-price { text-decoration: line-through; color: #9ca3af; font-weight: 500; font-size: 0.85rem; }
        .rating-row { display:flex; align-items:center; gap:12px; font-size:13px; color:#6b7280; }
        .stars { display:flex; gap:2px; color:#fbbf24; }
        .sold-badge { background: transparent; color:#6b7280; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:600; }
        .chips { display:flex; gap:8px; flex-wrap:wrap; margin-top:4px; }
        .chip { background:#f3f4f6; color:#374151; padding:6px 10px; font-size:12px; font-weight:600; border-radius:6px; }
        .store { display:flex; align-items:center; gap:8px; color:#f97316; font-weight:700; margin-top:8px; font-size:13px; }
        .store:before { content:'✓'; display:inline-flex; width:16px; height:16px; align-items:center; justify-content:center; background:#fed7aa; color:#f97316; border-radius:50%; font-size:11px; font-weight:900; }
        .divider { height:1px; background:#e5e7eb; margin:10px 0; }
        .actions { display:flex; align-items:center; gap:10px; }
        .btn-primary { flex:1; background:#f97316; color:#fff; font-weight:900; padding:12px 16px; border-radius:10px; border:none; cursor:pointer; font-size:15px; }
        .btn-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:#475569; color:#fff; border:none; cursor:pointer; }
        .btn-heart { background:#ec4899; }
        @media (max-width: 768px) { .rec-grid { grid-template-columns: 1fr; gap: 14px; } .img-wrap { height: 140px; } }
      `}</style>

      <div style={{ marginTop: "60px", padding: "0 16px" }}>
        <h2 className="section-title">Produk Lain Dari Kategori Ini</h2>

        <div className="rec-grid">
          {recommendations.map((item, idx) => (
            <div key={item.ASIN} className="card" style={{ animationDelay: `${idx * 0.08}s` }} onClick={() => handleClick(item)}>
              <div className="img-wrap">
                <img
                  src={item.thumbnail_produk || item.gambar_produk || "/placeholder.jpg"}
                  alt={item.nama_produk}
                  loading="lazy"
                />
              </div>

              <div className="product-info">
                <h3 className="name">{item.nama_produk}</h3>
                <div className="price-row">
                  <div className="price">{item.product_price}</div>
                  {item.discount && item.harga_asli && (
                    <span className="old-price">{formatToIDR(item.harga_asli)}</span>
                  )}
                </div>
                <div className="rating-row">
                  <div className="stars">{'★'.repeat(Math.min(5, Math.floor(item.rating_bintang ?? 0)))}</div>
                  <span className="sold-badge">{item.unit_terjual ? `${item.unit_terjual} terjual` : 'Baru'}</span>
                </div>
                <div className="chips">
                  <span className="chip">Gratis Ongkir</span>
                  {item.bonusText && (<span className="chip">{item.bonusText}</span>)}
                </div>
                <div className="store">{item.toko || 'UMKM Nusantara'}</div>
                <div className="divider"></div>
                <div className="actions">
                  <button className="btn-primary" onClick={(e) => { e.stopPropagation(); localStorage.setItem("checkoutItem", JSON.stringify({...item, product_price_num: item.harga_produk, quantity: 1})); window.location.href = "/checkoutpage"; }}>Beli Sekarang</button>
                  <button className="btn-icon" onClick={(e) => handleAddToCart(e, item)}><ShoppingCart size={18} /></button>
                  <button className="btn-icon btn-heart" onClick={(e) => handleAddToFavorite(e, item)}><Heart size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
