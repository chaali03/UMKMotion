import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

type Product = {
  ASIN?: string;
  nama_produk?: string;
  merek_produk?: string;
  kategori?: string;
  harga_produk?: number;
  harga_final?: number;
  product_price?: string;
  gambar_produk?: string;
  thumbnail_produk?: string;
  galeri_gambar?: string[];
  toko?: string;
  deskripsi_produk?: string;
  rating_bintang?: number;
  unit_terjual?: number;
};

export default function ProductDetailPage() {
  const [asin, setAsin] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const hasLoggedViewRef = useRef(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const a = (window as any).PRODUCT_ASIN as string | undefined;
    if (a && typeof a === 'string') {
      setAsin(a);
    } else {
      // fallback to localStorage selectedProduct if navigating from Toko listing
      try {
        const lp = localStorage.getItem('selectedProduct');
        if (lp) {
          const parsed = JSON.parse(lp);
          setAsin(parsed?.ASIN || parsed?.asin || null);
          setProduct(parsed);
          setActiveImage(parsed?.thumbnail_produk || parsed?.gambar_produk || null);
          setLoading(false);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!asin) return;
      setLoading(true);
      setError(null);

      try {
        // Try by doc id first
        const ref = doc(db, 'products', asin);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as Product;
          setProduct(data);
          setActiveImage(data.thumbnail_produk || data.gambar_produk || null);
        } else {
          // Fallback: query by ASIN field
          const q = query(collection(db, 'products'), where('ASIN', '==', asin), limit(1));
          const qs = await getDocs(q);
          if (qs.docs.length) {
            const data = qs.docs[0].data() as Product;
            setProduct(data);
            setActiveImage(data.thumbnail_produk || data.gambar_produk || null);
          } else {
            setError('Produk tidak ditemukan.');
          }
        }
      } catch (e: any) {
        console.error('[ProductDetail] load error', e);
        setError('Gagal memuat data produk.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [asin]);

  useEffect(() => {
    const logView = async () => {
      if (hasLoggedViewRef.current) return;
      if (!user || !product) return;
      try {
        await addDoc(collection(db, 'users', user.uid, 'activities'), {
          type: 'product_view',
          productASIN: asin || product?.ASIN || null,
          title: product?.nama_produk || null,
          store: product?.toko || null,
          category: product?.kategori || null,
          image: product?.thumbnail_produk || product?.gambar_produk || null,
          createdAt: serverTimestamp(),
        });
        hasLoggedViewRef.current = true;
      } catch (e) {
        // swallow logging errors
      }
    };
    logView();
  }, [user, product, asin]);

  const toIDR = (n: number | undefined) => {
    if (typeof n !== 'number') return undefined;
    return 'Rp ' + n.toLocaleString('id-ID');
  };

  const priceText = () => {
    if (product?.product_price) return product.product_price;
    const n = (typeof product?.harga_final === 'number' ? product?.harga_final : product?.harga_produk) as number | undefined;
    return toIDR(n) || 'Rp —';
  };

  const soldUnits = () => {
    if (!product) return undefined;
    const candidates: any[] = [
      (product as any).unit_terjual,
      (product as any).sold,
      (product as any).jumlah_terjual,
      (product as any).terjual,
    ];
    for (const v of candidates) {
      if (typeof v === 'number' && !isNaN(v)) return v;
      if (typeof v === 'string' && v.trim()) {
        const m = v.match(/\d+/);
        if (m) return Number(m[0]);
      }
    }
    return undefined;
  };

  const handleAddToCart = () => {
    if (!product) return;
    try {
      const cartRaw = localStorage.getItem('cart_items');
      const cart = cartRaw ? JSON.parse(cartRaw) : [];
      cart.push({
        asin: asin || product.ASIN || 'unknown',
        product_title: product.nama_produk || 'Produk',
        product_photo: product.thumbnail_produk || product.gambar_produk || '/asset/placeholder/product.webp',
        quantity: 1,
        product_price: priceText(),
        product_price_num: typeof product.harga_final === 'number' ? product.harga_final : (product.harga_produk || 0),
        seller_name: product.toko || 'UMKM',
        category: product.kategori || 'Lainnya',
      });
      localStorage.setItem('cart_items', JSON.stringify(cart));
    } catch {}
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkoutpage';
  };

  const gallery = () => {
    const imgs: string[] = [];
    if (product?.galeri_gambar && Array.isArray(product.galeri_gambar)) imgs.push(...product.galeri_gambar);
    const main = product?.thumbnail_produk || product?.gambar_produk;
    if (main) imgs.unshift(main);
    return imgs.length ? imgs : ['/asset/placeholder/product.webp'];
  };

  return (
    <div className="p-6">
      {loading && (
        <div className="text-center text-slate-600">Memuat detail produk…</div>
      )}
      {!loading && error && (
        <div className="text-center text-red-600">{error}</div>
      )}
      {!loading && !error && product && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={activeImage || gallery()[0]}
                alt={product.nama_produk || 'Produk'}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = '/asset/placeholder/product.webp')}
              />
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {gallery().slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  className={`border rounded-lg overflow-hidden ${activeImage === img ? 'border-orange-500' : 'border-slate-200'}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`gambar-${idx}`} className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              {product.nama_produk || 'Produk'}
            </h2>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              {typeof product.rating_bintang === 'number' && (
                <span className="px-2 py-1 rounded-md bg-yellow-100 text-yellow-700">
                  {product.rating_bintang} ★
                </span>
              )}
              {typeof soldUnits() === 'number' && (
                <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                  {soldUnits()} terjual
                </span>
              )}
              {product.toko && (
                <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                  {product.toko}
                </span>
              )}
            </div>

            <div className="text-3xl font-extrabold text-orange-600">
              {priceText()}
            </div>

            <p className="text-slate-700 leading-relaxed">
              {product.deskripsi_produk || 'Tidak ada deskripsi produk.'}
            </p>

            <div className="flex gap-3 pt-2">
              <button onClick={handleAddToCart} className="px-4 py-2 rounded-xl border border-orange-500 text-orange-600 hover:bg-orange-50">
                Tambah ke Keranjang
              </button>
              <button onClick={handleBuyNow} className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg">
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}