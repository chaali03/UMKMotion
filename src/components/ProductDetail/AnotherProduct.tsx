// src/components/ProductDetail/ProductLainnya.tsx
'use client';

import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Heart, ShoppingCart } from "lucide-react";

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

interface Toast {
  id: string;
  type: 'cart' | 'favorite';
  title: string;
  message: string;
}

export default function ProductLainnya() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

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
      product_price: `Rp${item.harga_produk.toLocaleString("id-ID")}`,
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

  const pilihProduk = (item: Product) => {
    try { localStorage.setItem("selectedProduct", JSON.stringify(item)); } catch {}
    window.location.href = '/buying';
  };

  if (loading) {
    return (
      <div className="mt-20 px-4 max-w-7xl mx-auto">
        <style>{`
          @keyframes shimmer { 0% { background-position: -1200px 0; opacity: 0.8; } 50% { opacity: 1; } 100% { background-position: 1200px 0; opacity: 0.8; } }
          .sk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
          .sk-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .sk-img { height: 120px; background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%); background-size: 1200px 100%; animation: shimmer 1.8s ease-in-out infinite; }
          .sk-content { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
          .sk-line { height: 10px; background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%); background-size: 1200px 100%; animation: shimmer 1.8s ease-in-out infinite; border-radius: 6px; }
          @media (max-width: 768px) { .sk-grid { grid-template-columns: 1fr; } }
        `}</style>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Produk Lainnya</h2>
        <div className="sk-grid">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="sk-card" style={{ animation: `fadeInUp 0.5s ease both ${i * 0.08}s` }}>
              <div className="sk-img" />
              <div className="sk-content">
                <div className="sk-line" style={{ width: '85%' }} />
                <div className="sk-line" style={{ width: '60%' }} />
                <div className="sk-line" style={{ width: '70%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) return null;

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
      <style jsx>{`
        @keyframes card-in { 0% { opacity: 0; transform: translateY(16px) scale(0.96); } 55% { opacity: 1; transform: translateY(-2px) scale(1.01); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .product-card {
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
          cursor: pointer;
          position: relative;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 240px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          margin: 3px;
          animation: card-in 0.45s cubic-bezier(0.22, 0.61, 0.36, 1) both;
        }
        .product-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); border-color: #e2e8f0; }
        .product-image { width: 100%; height: 140px; background: linear-gradient(135deg, rgba(234,88,12,0.10) 0%, rgba(251,146,60,0.08) 50%, rgba(253,186,116,0.06) 100%); overflow: hidden; position: relative; border-radius: 12px; margin: 8px; width: calc(100% - 16px); }
        .product-image img { width: 100%; height: 100%; object-fit: cover; transition: none; filter: brightness(1); }
        .discount-chip { position: absolute; top: 8px; left: 8px; display: inline-flex; align-items: center; padding: 5px 9px; border-radius: 10px; font-size: 0.65rem; font-weight: 900; color: white; background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%); border: 1px solid rgba(255,255,255,0.25); }
        .product-info { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 8px; flex-grow: 1; background: linear-gradient(180deg, transparent 0%, rgba(248,250,252,0.3) 100%); }
        .product-title { font-size: 0.9rem; font-weight: 700; color: #0f172a; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2rem; letter-spacing: -0.02em; }
        .price-large { font-size: 1.05rem; font-weight: 900; color: #0f172a; }
        .old-price { text-decoration: line-through; color: #94a3b8; font-weight: 600; font-size: 0.75rem; opacity: 0.9; }
        .rating-sold { display: flex; justify-content: space-between; align-items: center; gap: 6px; font-size: 0.75rem; color: #334155; }

        /* Responsive scaling */
        @media (min-width: 640px) {
          .product-image { height: 150px; }
          .product-title { font-size: 0.95rem; }
          .price-large { font-size: 1.1rem; }
        }
        @media (min-width: 768px) {
          .product-image { height: 170px; }
          .product-title { font-size: 1rem; }
          .price-large { font-size: 1.15rem; }
        }
        @media (min-width: 1024px) {
          .product-image { height: 190px; }
        }
        @media (min-width: 1280px) {
          .product-image { height: 200px; }
        }
      `}</style>

      <div className="mt-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          Produk Lainnya
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {products.map((item, idx) => {
            const diskon = item.discountPercent;

            return (
              <div key={item.ASIN} style={{ animationDelay: `${idx * 0.08}s` }} onClick={() => pilihProduk(item)} className="product-card">
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
                    <span>{item.unit_terjual ? `${item.unit_terjual} terjual` : 'Baru'}</span>
                  </div>
                  <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'8px'}}>
                    <span style={{background:'#f3f4f6', color:'#374151', padding:'6px 10px', fontSize:'12px', fontWeight:'600', borderRadius:'6px'}}>Gratis Ongkir</span>
                    {item.bonusText && (
                      <span style={{background:'#f3f4f6', color:'#374151', padding:'6px 10px', fontSize:'12px', fontWeight:'600', borderRadius:'6px'}}>{item.bonusText}</span>
                    )}
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#f97316', fontWeight:'700', marginTop:'8px', fontSize:'13px'}}>
                    <span style={{display:'inline-flex', width:'16px', height:'16px', alignItems:'center', justifyContent:'center', background:'#fed7aa', color:'#f97316', borderRadius:'50%', fontSize:'11px', fontWeight:'900'}}>✓</span>
                    {item.toko || 'UMKM Nusantara'}
                  </div>
                  <div style={{height:'1px', background:'#e5e7eb', margin:'10px 0'}}></div>
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <button onClick={(e) => { e.stopPropagation(); localStorage.setItem("checkoutItem", JSON.stringify({...item, product_price_num: item.harga_produk, quantity: 1})); window.location.href = "/checkoutpage"; }} style={{flex:1, background:'#f97316', color:'#fff', fontWeight:'900', padding:'12px 16px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'15px'}}>Beli Sekarang</button>
                    <button onClick={(e) => handleAddToCart(e, item)} style={{width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', background:'#475569', color:'#fff', border:'none', cursor:'pointer'}}><ShoppingCart size={18} /></button>
                    <button onClick={(e) => handleAddToFavorite(e, item)} style={{width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', background:'#ec4899', color:'#fff', border:'none', cursor:'pointer'}}><Heart size={18} /></button>
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