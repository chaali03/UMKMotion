'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// === TIPE STORE DARI FIREBASE ===
interface StoreData {
  nama_toko: string;
  image?: string;
  banner?: string;
  kategori: string;
  deskripsi_toko: string;
  lokasi_toko: string;
  no_telp: string;
  email: string;
  profileImage?: string;
  jam_operasional: string;
  hari_operasional: string;
  rating_toko: number;
  jumlah_review: number;
  maps_link: string;
  fasilitas: string[];
  metode_pembayaran: string[];
  social: {
    instagram?: string;
    whatsapp?: string;
  };
}

// === TIPE PRODUK ===
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
  rating_bintang?: number;
  unit_terjual?: number;
  persentase_diskon?: number;
  bonusText?: string;
  product_price?: string;
};

// === KATEGORI MAP ===
const categoryMap: Record<string, string> = {
  Kuliner: "food",
  Fashion: "fashion",
  Kerajinan: "craft",
  Kesehatan: "beauty",
  Pertanian: "agriculture",
  Elektronik: "electronics",
  Furnitur: "furniture",
  Edukasi: "education",
};

const reverseCategoryMap: Record<string, string> = Object.fromEntries(
  Object.entries(categoryMap).map(([k, v]) => [v, k])
);

// === STAR SVG ===
const StarFull = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#f97316" stroke="#f97316" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const StarHalf = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#f97316" stroke="#f97316" strokeWidth="2">
    <path d="M12 2v15.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77" fill="none" stroke="#e2e8f0"/>
  </svg>
);

const StarEmpty = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const renderStars = (rating: number) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {Array(full).fill(0).map((_, i) => <StarFull key={`f${i}`} />)}
      {half ? <StarHalf /> : null}
      {Array(empty).fill(0).map((_, i) => <StarEmpty key={`e${i}`} />)}
    </div>
  );
};

export default function TokoDinamis() {
  const [activeTab, setActiveTab] = useState<'beranda' | 'produk' | 'ulasan'>('produk');
  const [modalOpen, setModalOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselWrapperRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>("");

  // === AMBIL KATEGORI & TOKO DARI selectedProduct ===
  useEffect(() => {
    const selected = localStorage.getItem("selectedProduct");
    if (selected) {
      const product: Product = JSON.parse(selected);
      const catKey = categoryMap[product.kategori] || "all";
      setCurrentCategory(catKey);
      localStorage.setItem("currentStoreCategory", catKey);

      // Cari toko berdasarkan nama
      fetchStoreByName(product.toko);
    } else {
      const savedCat = localStorage.getItem("currentStoreCategory");
      if (savedCat) setCurrentCategory(savedCat);
    }
  }, []);

  // === FETCH TOKO BERDASARKAN NAMA ===
  const fetchStoreByName = async (storeName: string) => {
    if (!db || !storeName) return;

    try {
      const q = query(collection(db, "stores"), where("nama_toko", "==", storeName));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data() as StoreData;
        setStore(data);
      } else {
        console.warn("Toko tidak ditemukan:", storeName);
        // Fallback dummy
        setStore({
          nama_toko: storeName,
          kategori: "UMKM",
          deskripsi_toko: "Toko UMKM lokal",
          lokasi_toko: "Yogyakarta",
          no_telp: "+62 274 5678 123",
          email: "info@toko.com",
          jam_operasional: "07:00 - 21:00",
          hari_operasional: "Senin - Minggu",
          rating_toko: 4.9,
          jumlah_review: 178,
          maps_link: "https://maps.app.goo.gl/6vX8kL3mP7vZfG8J7",
          fasilitas: ["Parkir", "WiFi"],
          metode_pembayaran: ["Cash", "QRIS"],
          social: { instagram: "toko" }
        });
      }
    } catch (err) {
      console.error("Gagal fetch toko:", err);
    }
  };

  // === FETCH PRODUK BERDASARKAN KATEGORI ===
  const fetchProductsByCategory = async (catKey: string) => {
    if (!db || !catKey || catKey === "all") {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const kategoriNama = reverseCategoryMap[catKey] || "Kuliner";
      const q = query(collection(db, "products"), where("kategori", "==", kategoriNama));
      const snapshot = await getDocs(q);

      const productsData: Product[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ASIN: doc.id,
          nama_produk: data.nama_produk || "Produk Tanpa Nama",
          merek_produk: data.merek_produk || "",
          kategori: data.kategori || "",
          harga_produk: data.harga_produk || 0,
          gambar_produk: data.gambar_produk || "",
          thumbnail_produk: data.thumbnail_produk || data.gambar_produk || "",
          toko: data.toko || "UMKM",
          deskripsi_produk: data.deskripsi_produk || "",
          rating_bintang: data.rating_bintang || 0,
          unit_terjual: data.unit_terjual || 0,
          persentase_diskon: data.persentase_diskon || 0,
          bonusText: ["Gratis Ongkir", "+Hadiah", "Cashback"][Math.floor(Math.random() * 3)],
          product_price: `Rp ${(data.harga_produk || 0).toLocaleString("id-ID")}`,
        } as Product;
      });

      setProducts(productsData);
      const reversed = [...productsData].reverse();
      setTrending(reversed.slice(0, 6));
    } catch (error) {
      console.error("Gagal fetch produk:", error);
    } finally {
      setLoading(false);
    }
  };

  // === INIT: Fetch produk setelah kategori diketahui ===
  useEffect(() => {
    if (currentCategory && currentCategory !== "all") {
      fetchProductsByCategory(currentCategory);
    } else {
      setLoading(false);
    }
  }, [currentCategory]);

  // === CAROUSEL ===
  const cardWidth = 316;
  const maxIndex = Math.max(0, trending.length - 3);
  const scrollCarousel = (dir: number) => {
    setCarouselIndex(prev => Math.max(0, Math.min(maxIndex, prev + dir)));
  };

  useEffect(() => {
    if (carouselWrapperRef.current) {
      carouselWrapperRef.current.style.transform = `translateX(-${carouselIndex * cardWidth}px)`;
    }
  }, [carouselIndex]);

  // === HANDLER ===
  const handleAddToCart = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: Product) => item.ASIN === p.ASIN);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...p, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Ditambahkan ke keranjang!");
  };

  const handleProductClick = (p: Product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(p));
    window.location.href = "/buyingpage";
  };

  // === ANIMASI SLIDE IN ===
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card').forEach(card => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [products, activeTab]);

  // === RENDER CARD ===
  const renderTrendingCard = (p: Product) => {
    const shortTitle = p.nama_produk.length > 50 ? p.nama_produk.slice(0, 47) + "..." : p.nama_produk;
    return (
      <div key={p.ASIN} className="trending-card" onClick={() => handleProductClick(p)}>
        <div className="trending-badge">Terbaru</div>
        <div className="trending-img">
          <img src={p.thumbnail_produk} alt={shortTitle} loading="lazy" />
        </div>
        <div className="trending-info">
          <h3 className="trending-title">{shortTitle}</h3>
          <div className="trending-price">{p.product_price}</div>
          <div className="trending-rating">{renderStars(p.rating_bintang || 0)}</div>
          <div className="trending-sold">
            {(p.unit_terjual || 0) > 999 
              ? ((p.unit_terjual || 0) / 1000).toFixed(1) + "K terjual" 
              : (p.unit_terjual || 0) + " terjual"
            }
          </div>
        </div>
      </div>
    );
  };

  const renderProductCard = (p: Product) => {
    const shortTitle = p.nama_produk.length > 60 ? p.nama_produk.slice(0, 57) + "..." : p.nama_produk;
    return (
      <div key={p.ASIN} className="product-card" data-id={p.ASIN}>
        {p.persentase_diskon > 0 && <div className="discount-badge">{p.persentase_diskon}%</div>}
        <div className="cart-icon-badge" onClick={(e) => handleAddToCart(p, e)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <div className="product-image">
          <img src={p.thumbnail_produk} alt={shortTitle} loading="lazy" />
        </div>
        <div className="product-info">
          <div>
            <h3 className="product-title">{shortTitle}</h3>
            <div className="rating-sold">
              <div className="rating">{renderStars(p.rating_bintang || 0)}</div>
              <div className="sold">
                {(p.unit_terjual || 0) > 999 
                  ? ((p.unit_terjual || 0) / 1000).toFixed(1) + "K terjual" 
                  : (p.unit_terjual || 0) + " terjual"
                }
              </div>
            </div>
            <div className="price-large">{p.product_price}</div>
            <p className="bonus-promo">{p.bonusText}</p>
            <p className="store-name">Checkmark {p.toko}</p>
          </div>
          <div className="action-buttons">
            <button className="btn-buy" onClick={() => handleProductClick(p)}>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg> Beli
            </button>
          </div>
        </div>
      </div>
    );
  };

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8', fontSize: '1.2rem' }}>
        Memuat toko dan produk {currentCategory ? reverseCategoryMap[currentCategory] : ""}...
      </div>
    );
  }

  return (
    <>
      <div className="container">
        {/* HEADER TOKO - DINAMIS */}
        <div className="store-header">
          <img 
            src={store?.profileImage || store?.image || "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=60"} 
            alt={store?.nama_toko} 
            className="store-logo" 
          />
          <div className="store-info">
            <div className="store-name">
              {store?.nama_toko || "Toko UMKM"} <span className="verified">Verified</span>
            </div>
            <div className="store-location">{store?.lokasi_toko || "Yogyakarta"}</div>
            <div className="store-stats">
              <div className="stat-item">
                <span className="rating-stars">{renderStars(store?.rating_toko || 4.9)}</span>
                <strong>{store?.rating_toko || 4.9}</strong>
                <span style={{color:'#64748b'}}>({store?.jumlah_review || 178})</span>
              </div>
              <div className="stat-item"><span>Terjual</span> <strong>1.2k+</strong></div>
              <div className="stat-item"><span>Proses</span> <strong>±1 jam</strong></div>
            </div>
          </div>
          <div className="store-actions">
            <button className="btn btn-primary">+ Follow</button>
            <button className="btn btn-outline">Chat Penjual</button>
            <button className="btn btn-secondary" onClick={() => setModalOpen(true)}>Lihat Detail</button>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {(['beranda', 'produk', 'ulasan'] as const).map(tab => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>

        {/* TAB: PRODUK */}
        {activeTab === 'produk' && (
          <>
            <h2 className="section-title">
              Kategori: {currentCategory ? reverseCategoryMap[currentCategory] : "Semua"}
            </h2>
            <div className="product-list">
              {products.length > 0 ? products.map(renderProductCard) : (
                <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  Belum ada produk di kategori ini.
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB: BERANDA */}
        {activeTab === 'beranda' && (
          <>
            <div className="trending-section">
              <h2 className="section-title">Produk Terbaru</h2>
              <div className="carousel-container">
                <button className="carousel-btn prev" onClick={() => scrollCarousel(-1)} disabled={carouselIndex === 0}>
                  <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div className="carousel-wrapper" ref={carouselWrapperRef}>
                  {trending.length > 0 ? trending.map(renderTrendingCard) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      Belum ada produk terbaru
                    </div>
                  )}
                </div>
                <button className="carousel-btn next" onClick={() => scrollCarousel(1)} disabled={carouselIndex === maxIndex}>
                  <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            <h2 className="section-title" style={{marginTop: '2rem'}}>Semua Produk</h2>
            <div className="product-list">
              {products.length > 0 ? products.map(renderProductCard) : (
                <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  Belum ada produk tersedia
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB: ULASAN */}
        {activeTab === 'ulasan' && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            Fitur ulasan coming soon!
          </div>
        )}
      </div>

      {/* FLOATING CHAT */}
      <div className="chat-float" onClick={() => alert('Chat dibuka!')}>Chat</div>

      {/* MODAL DETAIL TOKO */}
      {modalOpen && store && (
        <div className="modal active" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${store.banner || store.image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&auto=format&fit=crop&q=60'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <img src={store.profileImage || store.image || "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=60"} alt={store.nama_toko} className="modal-logo" />
              <div className="modal-title">{store.nama_toko}</div>
              <div className="modal-subtitle">{store.kategori} • Rating {store.rating_toko} ({store.jumlah_review} ulasan)</div>

              <div className="modal-section">
                <h4>Deskripsi Toko</h4>
                <p>{store.deskripsi_toko}</p>
              </div>

              <div className="modal-section">
                <h4>Alamat Lengkap</h4>
                <p>{store.lokasi_toko}</p>
                <a href={store.maps_link} target="_blank" style={{color:'var(--primary)',fontWeight:700,marginTop:'0.5rem',display:'inline-block'}}>Buka di Google Maps</a>
              </div>

              <div className="modal-section">
                <h4>Jam Operasional</h4>
                <p><strong>{store.hari_operasional}:</strong> {store.jam_operasional} WIB</p>
              </div>

              <div className="modal-section">
                <h4>Kontak</h4>
                <p>Phone {store.no_telp}</p>
                <p>Email {store.email}</p>
              </div>

              <div className="modal-section">
                <h4>Fasilitas</h4>
                <div className="modal-tags">
                  {store.fasilitas.map(f => <span key={f} className="modal-tag">{f}</span>)}
                </div>
              </div>

              <div className="modal-section">
                <h4>Metode Pembayaran</h4>
                <div className="modal-tags">
                  {store.metode_pembayaran.map(m => <span key={m} className="modal-tag">{m}</span>)}
                </div>
              </div>

              {(store.social.instagram || store.social.whatsapp) && (
                <div className="modal-section">
                  <h4>Sosial Media</h4>
                  <div className="social-links">
                    {store.social.instagram && <a href={`https://instagram.com/${store.social.instagram}`} target="_blank">@{store.social.instagram}</a>}
                    {store.social.whatsapp && <a href={`https://wa.me/${store.social.whatsapp.replace('+', '')}`} target="_blank">WhatsApp</a>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STYLE — 100% SAMA DENGAN ASLI */}
      <style >{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Poppins:wght@600;700&display=swap');

        :root {
          --primary: #00a844;
          --primary-dark: #008738;
          --secondary: #1a1a1a;
          --text: #1a1a1a;
          --text-light: #555;
          --text-sold: #6b7280;
          --bg: #f8fafc;
          --white: #ffffff;
          --border: #e2e8f0;
          --danger: #dc2626;
          --warning: #f97316;
          --bonus-bg: #fff7ed;
          --bonus-border: #fed7aa;
          --discount-from: #ff3b3b;
          --discount-to: #ff5e3a;
          --trending-badge: #dc2626;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
          --shadow-lg: 0 12px 32px rgba(0,0,0,0.14);
          --radius: 14px;
          --radius-sm: 10px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; padding-bottom: 80px; overflow-x: hidden; }

        .container { max-width: 1400px; margin: 0 auto; padding: 0 1rem; }

        /* CUSTOM SCROLLBAR */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.3); border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.5); background-clip: content-box; }

        /* HEADER TOKO */
        .store-header { background: var(--white); border-radius: var(--radius); padding: 1.75rem; margin: 2rem 0 1.5rem; box-shadow: var(--shadow-md); display: flex; align-items: center; gap: 1.5rem; position: relative; overflow: hidden; border: 1px solid #f0f0f0; }
        .store-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, var(--primary), #22c55e); border-radius: var(--radius) var(--radius) 0 0; }
        .store-logo { width: 90px; height: 90px; border-radius: 18px; object-fit: cover; border: 4px solid #fff; box-shadow: var(--shadow-md); transition: all 0.3s ease; }
        .store-logo:hover { transform: scale(1.06); box-shadow: var(--shadow-lg); }
        .store-info { flex: 1; }
        .store-name { font-family: 'Poppins', sans-serif; font-size: 1.55rem; font-weight: 700; color: var(--secondary); display: flex; align-items: center; gap: 0.5rem; }
        .verified { color: var(--primary); font-size: 1.25rem; font-weight: 700; }
        .store-location { font-size: 0.95rem; color: var(--text-light); margin: 0.4rem 0; display: flex; align-items: center; gap: 0.3rem; font-weight: 500; }
        .store-stats { display: flex; gap: 1.75rem; margin-top: 0.75rem; font-size: 0.92rem; font-weight: 500; }
        .stat-item { display: flex; align-items: center; gap: 0.4rem; }
        .rating-stars { color: var(--warning); font-weight: 700; }

        .store-actions { display: flex; gap: 0.8rem; align-items: center; }
        .btn { padding: 0.7rem 1.3rem; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.92rem; cursor: pointer; transition: all 0.25s ease; display: inline-flex; align-items: center; gap: 0.5rem; border: none; box-shadow: var(--shadow-sm); }
        .btn-primary { background: var(--primary); color: white; font-weight: 700; }
        .btn-primary:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary); font-weight: 600; }
        .btn-outline:hover { background: #f0fdf4; transform: translateY(-2px); box-shadow: var(--shadow-sm); }
        .btn-secondary { background: #f8fafc; color: var(--secondary); font-weight: 600; border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
        .btn-secondary:hover { background: #e2e8f0; transform: translateY(-1px); }
        .btn-secondary::after { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0; background: rgba(255,255,255,0.3); border-radius: 50%; transform: translate(-50%, -50%); transition: width 0.6s ease, height 0.6s ease; }
        .btn-secondary:active::after { width: 300px; height: 300px; }

        /* TABS */
        .tabs { display: flex; gap: 2.5rem; margin-bottom: 1.5rem; padding: 0.5rem 0; border-bottom: 2px solid #f1f5f9; flex-wrap: wrap; }
        .tab { font-weight: 700; color: #94a3b8; cursor: pointer; position: relative; padding: 0.5rem 0; transition: color 0.25s; font-size: 1rem; }
        .tab::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 3px; background: var(--primary); border-radius: 2px; transition: width 0.35s ease; }
        .tab.active { color: var(--primary); }
        .tab.active::after { width: 100%; }

        /* SECTION TITLE */
        .section-title { font-family: 'Poppins', sans-serif; font-size: 1.4rem; font-weight: 700; color: var(--secondary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''; width: 6px; height: 24px; background: var(--primary); border-radius: 3px; }

        /* CAROUSEL */
        .carousel-container { position: relative; overflow: hidden; border-radius: 16px; box-shadow: var(--shadow-md); background: var(--white); }
        .carousel-wrapper { display: flex; transition: transform 0.5s ease; }
        .trending-card { min-width: 300px; background: var(--white); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-md); transition: all 0.3s ease; position: relative; cursor: pointer; margin: 0 8px; }
        .trending-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
        .trending-badge { position: absolute; top: 12px; left: 12px; background: var(--trending-badge); color: white; font-weight: 900; font-size: 0.75rem; padding: 6px 12px; border-radius: 8px; z-index: 10; box-shadow: 0 2px 8px rgba(220,38,38,0.4); }
        .trending-img { height: 200px; overflow: hidden; }
        .trending-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .trending-card:hover .trending-img img { transform: scale(1.06); }
        .trending-info { padding: 1rem; }
        .trending-title { font-size: 1.05rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .trending-price { font-size: 1.2rem; font-weight: 800; color: var(--danger); margin-bottom: 0.4rem; }
        .trending-rating { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--warning); font-weight: 600; }
        .trending-sold { font-size: 0.8rem; color: var(--text-sold); margin-top: 0.3rem; }

        .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.95); color: var(--secondary); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-md); z-index: 10; transition: all 0.3s ease; backdrop-filter: blur(8px); border: 1px solid rgba(0,0,0,0.05); }
        .carousel-btn:hover { background: white; transform: translateY(-50%) scale(1.12); box-shadow: var(--shadow-lg); color: var(--primary); }
        .carousel-btn svg { width: 20px; height: 20px; stroke: currentColor; stroke-width: 2.5; fill: none; }
        .carousel-btn.prev { left: 16px; }
        .carousel-btn.next { right: 16px; }

        /* PRODUCT GRID */
        .product-list { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; justify-content: center; margin-top: 1rem; }
        .product-card { background: var(--white); border-radius: 10px; overflow: hidden; box-shadow: var(--shadow-sm); transition: all 0.2s ease; cursor: pointer; position: relative; border: 1px solid var(--border); display: flex; flex-direction: column; height: 100%; min-height: 320px; opacity: 0; transform: translateX(-30px); transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .product-card.visible { opacity: 1; transform: translateX(0); }
        .product-card:hover { transform: translateY(-2px) scale(1.01); box-shadow: var(--shadow-lg); border-color: #e0e0e0; }

        .discount-badge { position: absolute; top: 6px; left: 6px; background: linear-gradient(135deg, var(--discount-from), .var(--discount-to)); color: white; font-weight: 900; font-size: 0.70rem; padding: 4px 10px 4px 8px; border-radius: 6px 0 0 6px; z-index: 10; clip-path: polygon(0% 0%, 85% 0%, 92% 20%, 100% 20%, 92% 40%, 100% 60%, 92% 80%, 100% 100%, 85% 100%, 0% 100%); box-shadow: 0 2px 8px rgba(255,59,59,0.4); display: flex; align-items: center; justify-content: center; min-width: 38px; }
        .cart-icon-badge { position: absolute; top: 6px; right: 6px; background: rgba(243,54,54,0.95); color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 11; box-shadow: 0 2px 10px rgba(0,0,0,0.25); transition: all 0.25s ease; }
        .cart-icon-badge:hover { background: #d72c2c; transform: scale(1.15); }
        .cart-icon-badge svg { width: 20px; height: 20px; stroke: white; stroke-width: 2.3; }

        .product-image { width: 100%; height: 160px; background: #f8f8f8; overflow: hidden; }
        .product-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
        .product-card:hover .product-image img { transform: scale(1.04); }

        .product-info { padding: 6px 8px 8px; display: flex; flex-direction: column; gap: 2px; flex-grow: 1; justify-content: space-between; }
        .product-title { font-size: 0.98rem; font-weight: 700; color: var(--text); line-height: 1.22; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }
        .rating-sold { display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; color: var(--text-light); gap: 4px; margin: 1px 0 0; }
        .rating { display: flex; align-items: center; gap: 2px; color: var(--warning); font-weight: 600; }
        .sold { color: var(--text-sold); font-size: 0.63rem; }
        .price-large { font-size: 0.98rem; font-weight: 800; color: var(--danger); margin: 1px 0 0; }
        .bonus-promo { font-size: 0.60rem; color: #d97706; font-weight: 600; background: var(--bonus-bg); padding: 1px 4px; border-radius: 3px; border: 1px solid var(--bonus-border); display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; margin: 1px 0 0; }
        .store-name { font-size: 0.62rem; color: var(--primary); font-weight: 600; margin: 1px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .store-name::before { content: "Checkmark "; font-weight: bold; }

        .action-buttons { margin: 4px 0 0; }
        .btn-buy { width: 100%; padding: 6px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; transition: all 0.2s ease; border: none; background: var(--primary); color: white; }
        .btn-buy:hover { background: var(--primary-dark); transform: translateY(-1px); }
        .btn-icon { width: 14px; height: 14px; }

        /* FLOATING CHAT */
        .chat-float { position: fixed; bottom: 1.5rem; right: 1.5rem; background: var(--primary); color: white; width: 62px; height: 62px; border-radius: 50%; box-shadow: var(--shadow-lg); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.55rem; z-index: 100; transition: all 0.3s ease; font-weight: 700; }
        .chat-float:hover { transform: scale(1.12); background: var(--primary-dark); }

        /* MODAL */
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); z-index: 9999; align-items: center; justify-content: center; padding: 1rem; opacity: 0; transition: opacity 0.4s ease; }
        .modal.active { display: flex; opacity: 1; }
        .modal-content { background: var(--white); max-width: 620px; width: 100%; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-lg); max-height: 90vh; overflow-y: auto; border: 1px solid #f1f5f9; transform: translateY(100px) scale(0.8); opacity: 0; transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .modal.active .modal-content { transform: translateY(0) scale(1); opacity: 1; }
        .modal-header { height: 150px; background-size: cover; background-position: center; position: relative; }
        .modal-close { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.95); color: var(--secondary); border: none; width: 42px; height: 42px; border-radius: 50%; font-size: 1.35rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); transition: all 0.3s ease; font-weight: 700; z-index: 2; }
        .modal-close:hover { background: var(--danger); color: white; transform: rotate(180deg) scale(1.1); }
        .modal-body { padding: 2rem; }
        .modal-logo { width: 94px; height: 94px; border-radius: 18px; object-fit: cover; margin: -3.2rem auto 1rem; display: block; border: 5px solid white; box-shadow: var(--shadow-lg); position: relative; z-index: 2; }
        .modal-title { text-align: center; font-family: 'Poppins', sans-serif; font-size: 1.65rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--secondary); }
        .modal-subtitle { text-align: center; color: #64748b; font-size: 0.98rem; margin-bottom: 1.75rem; font-weight: 500; }
        .modal-section { margin-bottom: 1.,B 8rem; }
        .modal-section h4 { font-weight: 700; color: var(--secondary); margin-bottom: 0.7rem; font-size: 1.08rem; }
        .modal-section p { color: #475569; font-size: 0.98rem; line-height: 1.6; }
        .modal-tags { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.8rem; }
        .modal-tag { background: #f0fdf4; color: var(--primary); padding: 0.45rem 0.9rem; border-radius: 10px; font-size: 0.88rem; font-weight: 600; border: 1px solid #dcfce7; }
        .social-links { display: flex; gap: 1.2rem; justify-content: center; margin-top: 1.2rem; }
        .social-links a { color: var(--primary); font-weight: 700; font-size: 1rem; transition: 0.2s; }
        .social-links a:hover { text-decoration: underline; transform: translateY(-1px); }

        @media (max-width: 768px) {
          .product-list { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .btn-buy { padding: 5px 6px; font-size: 0.70rem; }
          .trending-card { min-width: 260px; }
          .store-header { flex-direction: column; text-align: center; }
          .store-actions { margin-top: 1rem; justify-content: center; }
          .carousel-btn { width: 44px; height: 44px; }
          .carousel-btn svg { width: 18px; height: 18px; }
          .modal-content { transform: translateY(120px) scale(0.75); }
          .modal.active .modal-content { transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}