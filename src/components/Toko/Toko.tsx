'use client';

import { useState, useEffect, useRef } from 'react';

// Dummy
const allProducts = [
  { id: "B001", title: "Buku Pelajaran Matematika SMP Kelas 7 Semester 1 Edisi Terbaru", price: 85000, rating: 4.9, sold: 8200, discount: 25, bonus: "Gratis Ongkir", img: "https://images.unsplash.com/photo-1544947950-fa07a87d2373?w=400", trending: true },
  { id: "N001", title: "Novel Laut Bercerita - Leila S. Chudori (Hardcover)", price: 119000, rating: 5.0, sold: 1100, discount: 15, bonus: "+Hadiah Gratis", img: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400", trending: true },
  { id: "A001", title: "Paket Alat Tulis Lengkap Anak Sekolah", price: 45000, rating: 4.8, sold: 3200, discount: 0, bonus: "Cashback 10%", img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400", trending: true },
  { id: "K001", title: "Komik Detektif Conan Vol. 101", price: 35000, rating: 4.9, sold: 2100, discount: 20, bonus: "Diskon Ekstra", img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400", trending: true },
  { id: "B002", title: "Buku Bahasa Inggris SMP Kelas 8", price: 78000, rating: 4.7, sold: 1500, discount: 30, bonus: "Gratis Ongkir", img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400", trending: false },
  { id: "N002", title: "Laskar Pelangi - Andrea Hirata", price: 95000, rating: 4.9, sold: 2800, discount: 10, bonus: "+Hadiah Gratis", img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", trending: false },
  { id: "S001", title: "Sejarah Indonesia Kelas 10", price: 68000, rating: 4.6, sold: 900, discount: 0, bonus: "Gratis Ongkir", img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400", trending: false },
  { id: "F001", title: "Fisika SMA Kelas 11", price: 92000, rating: 4.8, sold: 1200, discount: 18, bonus: "Diskon Ekstra", img: "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=400", trending: false },
];

const reviews = [
  { name: "Siti Aisyah", rating: 5, date: "2 hari lalu", text: "Buku pelajaran matematika sangat membantu anak saya belajar. Kualitas cetak bagus, gambar jelas, dan harga terjangkau!", images: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"] },
  { name: "Ahmad Rizki", rating: 5, date: "1 minggu lalu", text: "Novel Laut Bercerita sangat menyentuh. Packing rapi, buku datang dalam kondisi sempurna. Terima kasih Cendekia Press!", images: [] },
  { name: "Dewi Lestari", rating: 4, date: "3 hari lalu", text: "Paket alat tulis lengkap, cocok untuk anak SD. Tapi pensilnya agak keras. Secara keseluruhan oke!", images: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"] },
  { name: "Budi Santoso", rating: 5, date: "5 hari lalu", text: "Komik Conan selalu jadi favorit anak. Pengiriman cepat, bonus stiker juga ada. Mantap!", images: [] },
  { name: "Rina Melati", rating: 5, date: "1 bulan lalu", text: "Laskar Pelangi edisi hardcover, kertas tebal, cover cantik. Worth it banget!", images: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"] },
];

export default function TokoCendekia() {
  const [activeTab, setActiveTab] = useState<'beranda' | 'produk' | 'ulasan'>('beranda');
  const [modalOpen, setModalOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselWrapperRef = useRef<HTMLDivElement>(null);

  // Utils
  const formatIDR = (num: number) => "Rp " + num.toLocaleString("id-ID");
  const renderStars = (rating: number) => "Rating".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "Half Star" : "") + "☆".repeat(5 - Math.ceil(rating));
  const soldText = (sold: number) => sold > 999 ? (sold / 1000).toFixed(1) + "K terjual" : sold + " terjual";

  // Carousel Logic
  const trending = allProducts.filter(p => p.trending);
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

  // Animasi Produk Slide In
  const animateProducts = () => {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, i) => {
      card.classList.remove('visible');
      setTimeout(() => card.classList.add('visible'), i * 80);
    });
  };

  useEffect(() => {
    if (modalOpen || activeTab) {
      setTimeout(animateProducts, 100);
    }
  }, [modalOpen, activeTab]);

  // Handler
  const handleAddToCart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Produk ${id} ditambahkan ke keranjang!`);
  };

  const handleProductClick = (id: string) => {
    alert(`Menuju halaman produk: ${id}`);
  };

  // Render Card
  const renderTrendingCard = (p: typeof allProducts[0]) => {
    const shortTitle = p.title.length > 50 ? p.title.slice(0, 47) + "..." : p.title;
    return (
      <div key={p.id} className="trending-card" onClick={() => handleProductClick(p.id)}>
        <div className="trending-badge">Trending</div>
        <div className="trending-img"><img src={p.img} alt={shortTitle} loading="lazy" /></div>
        <div className="trending-info">
          <h3 className="trending-title">{shortTitle}</h3>
          <div className="trending-price">{formatIDR(p.price)}</div>
          <div className="trending-rating">{renderStars(p.rating)}</div>
          <div className="trending-sold">{soldText(p.sold)}</div>
        </div>
      </div>
    );
  };

  const renderProductCard = (p: typeof allProducts[0]) => {
    const shortTitle = p.title.length > 60 ? p.title.slice(0, 57) + "..." : p.title;
    return (
      <div key={p.id} className="product-card" data-id={p.id}>
        {p.discount > 0 && <div className="discount-badge">{p.discount}%</div>}
        <div className="cart-icon-badge" onClick={(e) => handleAddToCart(p.id, e)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <div className="product-image"><img src={p.img} alt={shortTitle} loading="lazy" /></div>
        <div className="product-info">
          <div>
            <h3 className="product-title">{shortTitle}</h3>
            <div className="rating-sold">
              <div className="rating">{renderStars(p.rating)}</div>
              <div className="sold">{soldText(p.sold)}</div>
            </div>
            <div className="price-large">{formatIDR(p.price)}</div>
            <p className="bonus-promo">{p.bonus}</p>
            <p className="store-name">Cendekia Press</p>
          </div>
          <div className="action-buttons">
            <button className="btn-buy" onClick={() => handleProductClick(p.id)}>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg> Beli
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReview = (r: typeof reviews[0], i: number) => (
    <div key={i} className="review-card">
      <div className="review-header">
        <img
          src={r.images[0] ? r.images[0].replace('w=100', 'w=80') : `https://randomuser.me/api/portraits/men/${i * 23}.jpg`}
          alt={r.name}
          className="review-avatar"
        />
        <div className="review-meta">
          <div className="review-name">{r.name}</div>
          <div className="review-date">{r.date}</div>
        </div>
        <div className="review-rating">{renderStars(r.rating)}</div>
      </div>
      <p className="review-text">{r.text}</p>
      {r.images.length > 0 && (
        <div className="review-images">
          {r.images.map((img, idx) => (
            <img key={idx} src={img} alt="Review" className="review-img" onClick={() => alert('Foto bukti pembelian')} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="container">
        {/* HEADER TOKO */}
        <div className="store-header">
          <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=60" alt="Cendekia Press" className="store-logo" />
          <div className="store-info">
            <div className="store-name">Cendekia Press <span className="verified">Verified</span></div>
            <div className="store-location">Yogyakarta, Indonesia</div>
            <div className="store-stats">
              <div className="stat-item"><span className="rating-stars">Rating</span> <strong>4.9</strong> <span style={{color:'#64748b'}}>(178)</span></div>
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

        {/* Tabs */}
        <div className="tabs">
          {(['beranda', 'produk', 'ulasan'] as const).map(tab => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                setTimeout(animateProducts, 100);
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>

        {/* Tab Konten */}
        {activeTab === 'beranda' && (
          <>
            <div className="trending-section">
              <h2 className="section-title">Produk Trending</h2>
              <div className="carousel-container">
                <button className="carousel-btn prev" onClick={() => scrollCarousel(-1)}>
                  <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div className="carousel-wrapper" ref={carouselWrapperRef}>
                  {trending.map(renderTrendingCard)}
                </div>
                <button className="carousel-btn next" onClick={() => scrollCarousel(1)}>
                  <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            <h2 className="section-title" style={{marginTop: '2rem'}}>Semua Produk</h2>
            <div className="product-list">
              {allProducts.map(renderProductCard)}
            </div>
          </>
        )}

        {activeTab === 'produk' && (
          <>
            <h2 className="section-title">Semua Produk</h2>
            <div className="product-list">
              {allProducts.map(renderProductCard)}
            </div>
          </>
        )}

        {activeTab === 'ulasan' && (
          <>
            <h2 className="section-title">Ulasan Pelanggan</h2>
            <div className="review-summary">
              <div className="review-score">4.9 <small>dari 178 ulasan</small></div>
              <div className="review-bars">
                <div className="bar-row">5 <div className="bar"><div className="bar-fill" style={{width:'85%'}}></div></div> 85%</div>
                <div className="bar-row">4 <div className="bar"><div className="bar-fill" style={{width:'10%'}}></div></div> 10%</div>
                <div className="bar-row">3 <div className="bar"><div className="bar-fill" style={{width:'3%'}}></div></div> 3%</div>
                <div className="bar-row">2 <div className="bar"><div className="bar-fill" style={{width:'1%'}}></div></div> 1%</div>
                <div className="bar-row">1 <div className="bar"><div className="bar-fill" style={{width:'1%'}}></div></div> 1%</div>
              </div>
            </div>
            <div>{reviews.map(renderReview)}</div>
          </>
        )}
      </div>

      {/* Floating chat */}
      <div className="chat-float" onClick={() => alert('Chat dibuka!')}>Chat</div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal active" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=60" alt="Logo" className="modal-logo" />
              <div className="modal-title">Cendekia Press</div>
              <div className="modal-subtitle">Buku & Percetakan • Rating 4.9 (178 ulasan)</div>

              <div className="modal-section">
                <h4>Deskripsi Toko</h4>
                <p>Penerbit dan toko buku terpercaya yang menyediakan berbagai koleksi buku pelajaran, novel, komik, dan alat tulis. Juga melayani jasa percetakan, fotokopi, dan café baca nyaman.</p>
              </div>

              <div className="modal-section">
                <h4>Alamat Lengkap</h4>
                <p>Jl. Kaliurang KM 5,2 No.27, Condongcatur, Sleman, Yogyakarta 55208</p>
                <a href="https://maps.app.goo.gl/6vX8kL3mP7vZfG8J7" target="_blank" style={{color:'var(--primary)',fontWeight:700,marginTop:'0.5rem',display:'inline-block'}}>Buka di Google Maps</a>
              </div>

              <div className="modal-section">
                <h4>Jam Operasional</h4>
                <p><strong>Senin - Minggu:</strong> 07:00 - 21:00 WIB</p>
              </div>

              <div className="modal-section">
                <h4>Kontak</h4>
                <p>Phone +62 274 5678 123</p>
                <p>Email hello@cendekiapress.id</p>
              </div>

              <div className="modal-section">
                <h4>Fasilitas</h4>
                <div className="modal-tags">
                  <span className="modal-tag">Toko Buku</span>
                  <span className="modal-tag">Percetakan</span>
                  <span className="modal-tag">Fotokopi</span>
                  <span className="modal-tag">Café Baca</span>
                </div>
              </div>

              <div className="modal-section">
                <h4>Metode Pembayaran</h4>
                <div className="modal-tags">
                  <span className="modal-tag">Cash</span>
                  <span className="modal-tag">Debit Card</span>
                  <span className="modal-tag">E-Wallet</span>
                  <span className="modal-tag">QRIS</span>
                </div>
              </div>

              <div className="modal-section">
                <h4>Sosial Media</h4>
                <div className="social-links">
                  <a href="#" target="_blank">@cendekiapress</a>
                  <a href="#" target="_blank">CendekiaPress</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
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

        /* TRENDING CAROUSEL */
        .trending-section { margin-bottom: 2.5rem; }
        .section-title { font-family: 'Poppins', sans-serif; font-size: 1.4rem; font-weight: 700; color: var(--secondary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''; width: 6px; height: 24px; background: var(--primary); border-radius: 3px; }
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
        .carousel-btn:hover { background: white; transform: translateY(-50%) scale(1.12); box-shadow: var(--shadow-lg); color: var(--primary); }
        .carousel-btn svg { width: 20px; height: 20px; stroke: currentColor; stroke-width: 2.5; fill: none; }
        .carousel-btn.prev { left: 16px; }
        .carousel-btn.next { right: 16px; }

        /* PRODUK GRID */
        .product-list { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; justify-content: center; margin-top: 1rem; }
        .product-card { background: var(--white); border-radius: 10px; overflow: hidden; box-shadow: var(--shadow-sm); transition: all 0.2s ease; cursor: pointer; position: relative; border: 1px solid var(--border); display: flex; flex-direction: column; height: 100%; min-height: 320px; opacity: 0; transform: translateX(-30px); transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .product-card.visible { opacity: 1; transform: translateX(0); }
        .product-card:hover { transform: translateY(-2px) scale(1.01); box-shadow: var(--shadow-lg); border-color: #e0e0e0; }

        .discount-badge { position: absolute; top: 6px; left: 6px; background: linear-gradient(135deg, var(--discount-from), var(--discount-to)); color: white; font-weight: 900; font-size: 0.70rem; padding: 4px 10px 4px 8px; border-radius: 6px 0 0 6px; z-index: 10; clip-path: polygon(0% 0%, 85% 0%, 92% 20%, 100% 20%, 92% 40%, 100% 60%, 92% 80%, 100% 100%, 85% 100%, 0% 100%); box-shadow: 0 2px 8px rgba(255,59,59,0.4); display: flex; align-items: center; justify-content: center; min-width: 38px; }
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

        /* ULASAN */
        .review-summary { display: flex; align-items: center; gap: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: var(--radius); margin-bottom: 1.5rem; box-shadow: var(--shadow-sm); }
        .review-score { text-align: center; font-size: 2.5rem; font-weight: 900; color: var(--warning); }
        .review-score small { display: block; font-size: 1rem; color: var(--text-light); font-weight: 500; }
        .review-bars { flex: 1; }
        .bar-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; font-size: 0.85rem; }
        .bar { height: 8px; background: #e2e8f0; border-radius: 4px; flex: 1; overflow: hidden; }
        .bar-fill { height: 100%; background: var(--warning); border-radius: 4px; }

        .review-card { background: var(--white); border-radius: var(--radius-sm); padding: 1.2rem; margin-bottom: 1rem; box-shadow: var(--shadow-sm); border: 1px solid #f1f5f9; }
        .review-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.6rem; }
        .review-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; }
        .review-meta { flex: 1; }
        .review-name { font-weight: 700; font-size: 0.95rem; color: var(--secondary); }
        .review-date { font-size: 0.78rem; color: #94a3b8; }
        .review-rating { color: var(--warning); font-weight: 600; font-size: 0.9rem; }
        .review-text { font-size: 0.92rem; color: var(--text); line-height: 1.55; margin: 0.5rem 0; }
        .review-images { display: flex; gap: 0.5rem; margin-top: 0.8rem; flex-wrap: wrap; }
        .review-img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer; box-shadow: var(--shadow-sm); transition: transform 0.2s ease; }
        .review-img:hover { transform: scale(1.05); }

        /* FLOATING CHAT */
        .chat-float { position: fixed; bottom: 1.5rem; right: 1.5rem; background: var(--primary); color: white; width: 62px; height: 62px; border-radius: 50%; box-shadow: var(--shadow-lg); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.55rem; z-index: 100; transition: all 0.3s ease; font-weight: 700; }
        .chat-float:hover { transform: scale(1.12); background: var(--primary-dark); }

        /* MODAL */
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); z-index: 9999; align-items: center; justify-content: center; padding: 1rem; opacity: 0; transition: opacity 0.4s ease; }
        .modal.active { display: flex; opacity: 1; }
        .modal-content { background: var(--white); max-width: 620px; width: 100%; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-lg); max-height: 90vh; overflow-y: auto; border: 1px solid #f1f5f9; transform: translateY(100px) scale(0.8); opacity: 0; transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .modal.active .modal-content { transform: translateY(0) scale(1); opacity: 1; }
        .modal-header { height: 150px; background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&auto=format&fit=crop&q=60'); background-size: cover; background-position: center; position: relative; }
        .modal-close { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.95); color: var(--secondary); border: none; width: 42px; height: 42px; border-radius: 50%; font-size: 1.35rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); transition: all 0.3s ease; font-weight: 700; z-index: 2; }
        .modal-close:hover { background: var(--danger); color: white; transform: rotate(180deg) scale(1.1); }
        .modal-body { padding: 2rem; }
        .modal-logo { width: 94px; height: 94px; border-radius: 18px; object-fit: cover; margin: -3.2rem auto 1rem; display: block; border: 5px solid white; box-shadow: var(--shadow-lg); position: relative; z-index: 2; }
        .modal-title { text-align: center; font-family: 'Poppins', sans-serif; font-size: 1.65rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--secondary); }
        .modal-subtitle { text-align: center; color: #64748b; font-size: 0.98rem; margin-bottom: 1.75rem; font-weight: 500; }
        .modal-section { margin-bottom: 1.8rem; }
        .modal-section h4 { font-weight: 700; color: var(--secondary); margin-bottom: 0.7rem; font-size: 1.08rem; }
        .modal-section p { color: #475569; font-size: 0.98rem; line-height: 1.6; }
        .modal-tags { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.8rem; }
        .modal-tag { background: #f0fdf4; color: var(--primary); padding: 0.45rem 0.9rem; border-radius: 10px; font-size: 0.88rem; font-weight: 600; border: 1px solid #dcfce7; }
        .social-links { display: flex; gap: 1.2rem; justify-content: center; margin-top: 1.2rem; }
        .social-links a { color: var(--primary); font-weight: 700; font-size: 1rem; transition: 0.2s; }
        .social-links a:hover { text-decoration: underline; transform: translateY(-1px); }

        @media (max-width: 768px) {
          .product-list { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .trending-card { min-width: 260px; }
          .store-header { flex-direction: column; text-align: center; }
          .store-actions { margin-top: 1rem; justify-content: center; }
          .carousel-btn { width: 44px; height: 44px; }
          .carousel-btn svg { width: 18px; height: 18px; }
          .review-summary { flex-direction: column; text-align: center; gap: 1rem; }
        }
      `}</style>
    </>
  );
}