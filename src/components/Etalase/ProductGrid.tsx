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
  <div className="product-card" aria-busy>
    <div className="product-image" style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '60%', height: '60%', background: '#e2e8f0', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
    <div className="product-info">
      <div style={{ height: 16, width: '90%', background: '#e2e8f0', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 20, width: '60%', background: '#e2e8f0', borderRadius: 6, marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 14, width: '40%', background: '#e2e8f0', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `}</style>
  </div>
);

const ProductCard: React.FC<{ p: Product }> = ({ p }) => (
  <div className="product-card">
    <div className="product-image">
      {p.discountPercent ? <span className="discount-badge">-{p.discountPercent}%</span> : null}
      <img src={p.imageUrl || '/placeholder.webp'} alt={p.title} loading="lazy" />
    </div>
    <div className="product-info">
      <h3 className="product-title" title={p.title}>{p.title}</h3>
      <div className="price-section">
        <span className="price">{currency(p.price)}</span>
        {p.promoText ? <span className="promo-text">{p.promoText}</span> : null}
      </div>
      <div className="rating-section">
        {typeof p.rating === 'number' ? (
          <>
            <span className="star">★</span> {p.rating.toFixed(1)}
          </>
        ) : (
          <span className="star">★</span>
        )}
        {typeof p.sold === 'number' ? <span className="sold"> • Terjual {p.sold}</span> : null}
      </div>
      {p.storeName ? <div className="store-name">{p.storeName}</div> : null}
    </div>
  </div>
);

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
        console.debug('[Etalase] Firebase config check:', {
          hasDb: !!db,
          projectId: (db as any)?._delegate?.settings?.projectId || 'unknown'
        });
        
        // Try plain collection query first (no orderBy to avoid index requirement)
        let snap: any;
        try {
          // Direct collection query without orderBy (most reliable)
          snap = await getDocs(collection(db, 'products'));
          console.debug('[Etalase] Plain collection query successful, docs:', snap.docs.length);
        } catch (e1: any) {
          console.error('[Etalase] Plain collection query failed:', e1);
          // Try with orderBy as fallback (might need index)
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
              throw new Error(`Gagal mengambil produk dari Firebase: ${e3?.message || 'Unknown error'}. Pastikan collection "products" ada, Firestore rules mengizinkan read, dan Firebase config benar.`);
            }
          }
        }
        
        if (!snap) {
          throw new Error('Query tidak mengembalikan hasil. Pastikan collection "products" ada di Firestore.');
        }
        
        if (!snap.docs || snap.docs.length === 0) {
          console.warn('[Etalase] Collection "products" ada tapi kosong. Docs count:', snap.docs?.length || 0);
          console.warn('[Etalase] Pastikan Firestore rules mengizinkan read. Cek Rules di Firebase Console.');
          setError('Tidak ada produk ditemukan. Pastikan: 1) Produk sudah ditambahkan ke Firestore collection "products", 2) Firestore rules mengizinkan read.');
          setLoading(false);
          return;
        }
        
        console.debug('[Etalase] Successfully fetched', snap.docs.length, 'documents from Firestore');
        
        // Log first product structure for debugging
        if (snap.docs.length > 0) {
          const firstDoc = snap.docs[0];
          const firstData = firstDoc.data();
          console.debug('[Etalase] Sample product data structure:', {
            id: firstDoc.id,
            keys: Object.keys(firstData),
            sample: {
              title: firstData.deskripsi_produk || firstData.title || firstData.name || firstData.nama_produk || firstData.model_produk || firstData.product_title || 'N/A',
              price: firstData.harga_produk ?? firstData.harga ?? firstData.price ?? firstData.product_price,
              image: firstData.gambar_produk || (Array.isArray(firstData.galeri_gambar) && firstData.galeri_gambar[0]) || firstData.imageUrl || firstData.image || firstData.thumbnail || firstData.product_photo,
            },
            rawData: Object.fromEntries(Object.entries(firstData).slice(0, 10))
          });
        }
        
        const list: Product[] = snap.docs.map((d: any) => {
          const data = d.data() as any;
          
          // Map fields sesuai dengan struktur Firestore yang sebenarnya
          // Dari Firestore: gambar_produk, harga_produk, deskripsi_produk, galeri_gambar, harga_asli, dll
          return {
            id: d.id,
            title: data.deskripsi_produk || data.title || data.name || data.nama_produk || data.model_produk || data.product_title || data.product_name || `Produk ${d.id}`,
            price: ((): number => {
              const v = data.harga_produk ?? data.harga ?? data.price ?? data.product_price ?? data.harga_asli;
              if (typeof v === 'number') return v;
              if (typeof v === 'string') {
                // Remove currency symbols and parse
                const cleaned = v.replace(/[^\d,.-]/g, '').replace(',', '.');
                return Number(cleaned) || 0;
              }
              return 0;
            })(),
            imageUrl: data.gambar_produk || (Array.isArray(data.galeri_gambar) && data.galeri_gambar[0]) || data.imageUrl || data.image || data.thumbnail || data.thumbnail_produk || data.product_photo || data.photo || '/placeholder.webp',
            rating: ((): number | undefined => {
              const v = data.rating ?? data.rating_bintang ?? data.product_star_rating;
              return typeof v === 'number' ? v : undefined;
            })(),
            sold: typeof data.sold === 'number' ? data.sold : (typeof data.unit_terjual === 'number' ? data.unit_terjual : (typeof data.product_num_ratings === 'number' ? data.product_num_ratings : undefined)),
            storeName: data.storeName || data.seller || data.toko || data.seller_name || undefined,
            discountPercent: ((): number | undefined => {
              // Calculate discount from harga_asli and harga_produk
              if (data.harga_asli && data.harga_produk && data.harga_asli > data.harga_produk) {
                const discount = ((data.harga_asli - data.harga_produk) / data.harga_asli) * 100;
                return Math.round(discount);
              }
              const v = data.discountPercent ?? data.persentase_diskon ?? data.discount;
              return typeof v === 'number' ? v : (Number(v) || undefined);
            })(),
            category: data.category || data.sub_kategori || data.product_category || data.bahan || undefined,
            promoText: data.promoText || data.promo || undefined,
          } as Product;
        });
        
        if (!mounted) return;

        console.debug('[Etalase] Mapped products count:', list.length);

        if (list.length === 0) {
          console.warn('[Etalase] Products mapped but list is empty. Check data structure.');
          setError('Tidak ada produk ditemukan. Pastikan produk sudah ditambahkan ke Firestore collection "products".');
          setProducts([]);
        } else {
          console.debug('[Etalase] Successfully loaded', list.length, 'products');
          setProducts(list);
          setError(null); // Clear any previous errors
          // Save to cache for fast next view without reload effects
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items: list }));
          } catch {}
        }
      } catch (e: any) {
        if (!mounted) return;
        console.error('[Etalase] load products error:', e);
        const errorMsg = e?.message || 'Gagal memuat produk. Periksa konfigurasi Firebase dan pastikan collection "products" ada.';
        setError(errorMsg);
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
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        margin: '1rem',
        color: '#dc2626'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Error Memuat Produk</div>
        <div style={{ fontSize: '0.875rem' }}>{error}</div>
        <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.75rem' }}>
          Periksa console browser untuk detail error. Pastikan:
          <ul style={{ textAlign: 'left', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>Firebase config benar di .env</li>
            <li>Collection "products" ada di Firestore</li>
            <li>Firestore rules mengizinkan read</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          padding: 16px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .product-list {
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }
        }

        @media (max-width: 768px) {
          .product-list {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 12px;
          }
        }

        .product-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.25s ease;
          cursor: pointer;
          position: relative;
          border: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 320px;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          border-color: #e5e5e5;
        }

        .product-image {
          width: 100%;
          height: 160px;
          background: #f8f8f8;
          overflow: hidden;
          position: relative;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.04);
        }

        .discount-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: linear-gradient(135deg, #ff3b3b, #ff5e3a);
          color: white;
          font-weight: 900;
          font-size: 0.70rem;
          padding: 4px 10px 4px 8px;
          border-radius: 6px 0 0 6px;
          z-index: 10;
          clip-path: polygon(
            0% 0%,
            85% 0%,
            92% 20%,
            100% 20%,
            92% 40%,
            100% 60%,
            92% 80%,
            100% 100%,
            85% 100%,
            0% 100%
          );
          box-shadow: 
            0 2px 8px rgba(255, 59, 59, 0.4),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
        }

        .product-card:hover .discount-badge {
          transform: scale(1.08);
        }

        .product-info {
          padding: 10px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-grow: 1;
          justify-content: space-between;
        }

        .product-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.3;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .price-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .price {
          font-size: 1rem;
          font-weight: 800;
          color: #dc2626;
        }

        .promo-text {
          font-size: 0.70rem;
          color: #d97706;
          font-weight: 600;
          background: #fff7ed;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #fed7aa;
          display: inline-block;
          width: fit-content;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #525252;
        }

        .star {
          color: #f59e0b;
          font-size: 0.9rem;
        }

        .sold {
          color: #6b7280;
          font-size: 0.70rem;
        }

        .store-name {
          font-size: 0.70rem;
          color: #10b981;
          font-weight: 600;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .product-card {
            min-height: 300px;
          }

          .product-image {
            height: 140px;
          }

          .product-info {
            padding: 8px 10px 10px;
            gap: 4px;
          }

          .product-title {
            font-size: 0.85rem;
            line-height: 1.25;
          }

          .price {
            font-size: 0.95rem;
          }

          .rating-section {
            font-size: 0.70rem;
          }
        }
      `}</style>
      <section>
        <div className="product-list">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length > 0
              ? filtered.map((p) => <ProductCard key={p.id} p={p} />)
              : <span style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#666' }}>Tidak ada produk</span>}
        </div>
      </section>
    </>
  );
};

export default ProductGrid;
