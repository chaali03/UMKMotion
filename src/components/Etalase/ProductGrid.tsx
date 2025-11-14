import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export type Product = {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  sold?: number;
  storeName?: string;
  discountPercent?: number;
  category?: string;
  promoText?: string;
};

const currency = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// Simple cache to avoid frequent reload-like refetches
const CACHE_KEY = 'etalase_products_v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const SkeletonCard: React.FC = () => (
  <div className="product-card skeleton-card" aria-busy>
    <div className="skeleton-image">
      <div className="skeleton-shine" />
    </div>
    <div className="product-info">
      <div className="skeleton-title" />
      <div className="skeleton-price" />
      <div className="skeleton-rating" />
    </div>
  </div>
);

const ProductCard: React.FC<{ p: Product }> = ({ p }) => {
  const originalPrice = p.discountPercent ? Math.round(p.price / (1 - p.discountPercent / 100)) : null;
  
  return (
    <div className="product-card">
      <div className="product-image-container">
        {p.discountPercent && (
          <span className="discount-badge">
            <span className="discount-text">-{p.discountPercent}%</span>
          </span>
        )}
        {p.promoText && (
          <span className="promo-badge">{p.promoText}</span>
        )}
        <div className="product-image">
          <img src={p.imageUrl || '/placeholder.webp'} alt={p.title} loading="lazy" />
        </div>
        <button className="quick-view-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
      
      <div className="product-info">
        <h3 className="product-title" title={p.title}>{p.title}</h3>
        
        <div className="price-section">
          {originalPrice && (
            <span className="original-price">{currency(originalPrice)}</span>
          )}
          <span className="price">{currency(p.price)}</span>
        </div>
        
        <div className="product-meta">
          <div className="rating-section">
            {typeof p.rating === 'number' && (
              <>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < Math.floor(p.rating!) ? 'filled' : ''}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-text">{p.rating.toFixed(1)}</span>
              </>
            )}
          </div>
          
          {typeof p.sold === 'number' && (
            <span className="sold-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              {p.sold} terjual
            </span>
          )}
        </div>
        
        {p.storeName && (
          <div className="store-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="store-name">{p.storeName}</span>
          </div>
        )}
      </div>
      
      <button className="add-to-cart-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <span>Tambah</span>
      </button>
    </div>
  );
};

const ProductGrid: React.FC<{ category?: string; search?: string }>= ({ category, search }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        setLoading(true);
        setError(null);

        // 1) Try load from cache first for instant UI without refetch
        try {
          const cached = sessionStorage.getItem(CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached) as { ts: number; items: Product[] };
            if (parsed && Array.isArray(parsed.items) && typeof parsed.ts === 'number') {
              const age = Date.now() - parsed.ts;
              if (age < CACHE_TTL_MS) {
                if (mounted) {
                  setProducts(parsed.items);
                  setLoading(false);
                }
              }
            }
          }
        } catch {}

        // Check if Firebase is initialized
        if (!db) {
          throw new Error('Firebase tidak terinisialisasi. Periksa konfigurasi Firebase.');
        }

        console.debug('[Etalase] fetching products from "products"…');
        
        // Try plain collection query first (no orderBy to avoid index requirement)
        let snap: any;
        try {
          snap = await getDocs(collection(db, 'products'));
          console.debug('[Etalase] Plain collection query successful, docs:', snap.docs.length);
        } catch (e1: any) {
          console.error('[Etalase] Plain collection query failed:', e1);
          try {
            const q1 = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(60));
            snap = await getDocs(q1);
            console.debug('[Etalase] Query with createdAt successful, docs:', snap.docs.length);
          } catch (e2: any) {
            console.error('[Etalase] Query with createdAt failed:', e2);
            try {
              const q2 = query(collection(db, 'products'), orderBy('updatedAt', 'desc'), limit(60));
              snap = await getDocs(q2);
              console.debug('[Etalase] Query with updatedAt successful, docs:', snap.docs.length);
            } catch (e3: any) {
              console.error('[Etalase] All query methods failed:', e3);
              throw new Error(`Gagal mengambil produk dari Firebase: ${e3?.message || 'Unknown error'}`);
            }
          }
        }
        
        if (!snap || !snap.docs || snap.docs.length === 0) {
          console.warn('[Etalase] Collection "products" ada tapi kosong.');
          setError('Tidak ada produk ditemukan.');
          setLoading(false);
          return;
        }
        
        const list: Product[] = snap.docs.map((d: any) => {
          const data = d.data() as any;
          
          return {
            id: d.id,
            title: data.deskripsi_produk || data.title || data.name || data.nama_produk || `Produk ${d.id}`,
            price: ((): number => {
              const v = data.harga_produk ?? data.harga ?? data.price ?? 0;
              if (typeof v === 'number') return v;
              if (typeof v === 'string') {
                const cleaned = v.replace(/[^\d,.-]/g, '').replace(',', '.');
                return Number(cleaned) || 0;
              }
              return 0;
            })(),
            imageUrl: data.gambar_produk || (Array.isArray(data.galeri_gambar) && data.galeri_gambar[0]) || data.imageUrl || '/placeholder.webp',
            rating: data.rating ?? data.rating_bintang,
            sold: data.sold || data.unit_terjual,
            storeName: data.storeName || data.seller || data.toko,
            discountPercent: ((): number | undefined => {
              if (data.harga_asli && data.harga_produk && data.harga_asli > data.harga_produk) {
                const discount = ((data.harga_asli - data.harga_produk) / data.harga_asli) * 100;
                return Math.round(discount);
              }
              return data.discountPercent ?? data.persentase_diskon;
            })(),
            category: data.category || data.sub_kategori,
            promoText: data.promoText || data.promo,
          } as Product;
        });
        
        if (!mounted) return;

        setProducts(list);
        setError(null);
        
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items: list }));
        } catch {}
      } catch (e: any) {
        if (!mounted) return;
        console.error('[Etalase] load products error:', e);
        setError(e?.message || 'Gagal memuat produk.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let res = products;
    if (category) {
      res = res.filter((p) => (p.category || '').toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((p) => p.title.toLowerCase().includes(q));
    }
    return res;
  }, [products, category, search]);

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3>Oops! Ada Masalah</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
          padding: 32px 24px;
          max-width: 1440px;
          margin: 0 auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(180deg, rgba(0,17,81,0.02), rgba(253,87,1,0.02));
          min-height: 100vh;
        }

        @media (max-width: 768px) {
          .product-list {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            padding: 20px 16px;
          }
        }

        @media (max-width: 480px) {
          .product-list {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 20px;
          }
        }

        /* Product Card */
        .product-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 
            0 10px 40px rgba(0, 0, 0, 0.08),
            0 2px 10px rgba(0, 0, 0, 0.06);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 420px;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .product-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 
            0 20px 60px rgba(0,17,81,0.12),
            0 12px 24px rgba(253,87,1,0.08);
        }

        /* Image Container */
        .product-image-container {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(0,17,81,0.08) 0%, rgba(253,87,1,0.08) 100%);
        }

        .product-image {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .product-card:hover .product-image img {
          transform: scale(1.15);
        }

        /* Badges */
        .discount-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-orange-500) 100%);
          color: white;
          padding: 8px 14px;
          border-radius: 100px;
          z-index: 10;
          font-weight: 700;
          font-size: 0.8rem;
          box-shadow: 0 6px 18px rgba(253, 87, 1, 0.32);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .promo-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, var(--brand-blue) 0%, rgba(0,17,81,0.85) 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          z-index: 10;
          font-weight: 600;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(0, 17, 81, 0.22);
        }

        /* Quick View Button */
        .quick-view-btn {
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .product-card:hover .quick-view-btn {
          opacity: 1;
          transform: scale(1);
        }

        .quick-view-btn:hover {
          background: white;
          transform: scale(1.1);
        }

        /* Product Info */
        .product-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-grow: 1;
        }

        .product-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1a202c;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 2.8rem;
        }

        /* Price Section */
        .price-section {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .price {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--brand-blue-ink);
        }

        .original-price {
          font-size: 0.95rem;
          color: #a0aec0;
          text-decoration: line-through;
        }

        /* Product Meta */
        .product-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stars {
          display: flex;
          gap: 2px;
        }

        .star {
          color: #e2e8f0;
          font-size: 1rem;
          transition: color 0.2s;
        }

        .star.filled {
          color: #fbbf24;
          text-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);
        }

        .rating-text {
          font-size: 0.85rem;
          color: #4a5568;
          font-weight: 600;
        }

        .sold-count {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #718096;
          background: #f7fafc;
          padding: 4px 8px;
          border-radius: 6px;
        }

        /* Store Info */
        .store-info {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          margin-top: auto;
        }

        .store-info svg {
          color: var(--brand-orange);
        }

        .store-name {
          font-size: 0.85rem;
          color: var(--brand-blue-ink);
          font-weight: 600;
        }

        /* Add to Cart Button */
        .add-to-cart-btn {
          position: absolute;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-orange-500) 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 100px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 18px rgba(253, 87, 1, 0.32);
        }

        .product-card:hover .add-to-cart-btn {
          bottom: 20px;
        }

        .add-to-cart-btn:hover {
          transform: translateX(-50%) scale(1.05);
          box-shadow: 0 8px 24px rgba(253, 87, 1, 0.4);
        }

        .add-to-cart-btn:active {
          transform: translateX(-50%) scale(0.98);
        }

        /* Skeleton Loading */
        .skeleton-card {
          background: white;
          min-height: 420px;
        }

        .skeleton-image {
          width: 100%;
          height: 200px;
          background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          position: relative;
          overflow: hidden;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .skeleton-title,
        .skeleton-price,
        .skeleton-rating {
          background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        .skeleton-title {
          height: 20px;
          width: 80%;
          margin-bottom: 12px;
        }

        .skeleton-price {
          height: 24px;
          width: 50%;
          margin-bottom: 12px;
        }

        .skeleton-rating {
          height: 16px;
          width: 40%;
        }

        /* Error Container */
        .error-container {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .error-icon {
          color: #f56565;
          margin-bottom: 20px;
          animation: shake 0.5s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .error-container h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 10px;
        }

        .error-container p {
          color: #718096;
          margin-bottom: 24px;
          max-width: 400px;
        }

        .retry-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 100px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .retry-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        /* Empty State */
        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 20px;
          text-align: center;
        }

        .empty-state svg {
          color: #cbd5e0;
          margin-bottom: 24px;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          color: #4a5568;
          font-weight: 600;
        }
      `}</style>
      
      <section>
        <div className="product-list">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length > 0
              ? filtered.map((p) => <ProductCard key={p.id} p={p} />)
              : (
                <div className="empty-state">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3>Tidak ada produk ditemukan</h3>
                </div>
              )}
        </div>
      </section>
    </>
  );
};

export default ProductGrid;