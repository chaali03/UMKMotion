'use client';
import { useState, useEffect, useRef } from 'react';
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { followStore, unfollowStore, isFollowingStore, getFollowerCount } from "@/lib/follow";
import { onAuthStateChanged } from "firebase/auth";
import { trackUMKMVisit } from "@/lib/activity-tracker";
// NavbarHome akan ditambahkan di halaman yang menggunakan component ini

// === TIPE DATA ===
interface Review {
  nama: string;
  rating: number;
  ulasan: string;
  tanggal: string;
  avatar?: string;
  productASIN?: string;
}

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
  social: { instagram?: string; whatsapp?: string };
  reviews?: Review[];
}

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
  tags?: string[];
  harga_asli?: number;
  likes?: number;
};

// === STAR COMPONENT ===
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
  const [activeTab, setActiveTab] = useState<'beranda' | 'produk' | 'ulasan'>('beranda');
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [store, setStore] = useState<StoreData | null>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [storeId, setStoreId] = useState<string>('');

  // Format tanggal WIB
  const formatWIB = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Navigasi ke halaman pembelian
  const goToBuyingPage = (product: Product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = "/beli";
  };

  // Handler tambah ke keranjang
  const handleAddToCart = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: any) => item.ASIN === p.ASIN);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({
        ASIN: p.ASIN,
        nama_produk: p.nama_produk,
        harga_produk: p.harga_produk,
        gambar_produk: p.gambar_produk,
        thumbnail_produk: p.thumbnail_produk,
        quantity: 1
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Trigger custom event untuk update cart counter
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success message
    alert(`${p.nama_produk} berhasil ditambahkan ke keranjang!`);
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Ambil toko dari selectedProduct → lalu ambil semua produk dari toko itu
  useEffect(() => {
    const selected = localStorage.getItem("selectedProduct");
    if (selected) {
      const product: Product = JSON.parse(selected);
      fetchStoreAndAllProducts(product.toko);
    } else {
      setLoading(false);
    }
  }, []);

  // Check follow status and load follower count
  useEffect(() => {
    if (currentUser && storeId) {
      checkFollowStatus();
      loadFollowerCount();
    }
  }, [currentUser, storeId]);

  const fetchStoreAndAllProducts = async (storeName: string) => {
    if (!db || !storeName) return;
    setLoading(true);

    try {
      // 1. Fetch toko
      const storeQuery = query(collection(db, "stores"), where("nama_toko", "==", storeName));
      const storeSnap = await getDocs(storeQuery);

      let storeData: StoreData = {
        nama_toko: storeName, kategori: "UMKM", deskripsi_toko: "Toko UMKM lokal",
        lokasi_toko: "Yogyakarta", no_telp: "+62 274 5678 123", email: "info@toko.com",
        jam_operasional: "07:00 - 21:00", hari_operasional: "Senin - Minggu",
        rating_toko: 4.9, jumlah_review: 178, maps_link: "https://maps.app.goo.gl/example",
        fasilitas: ["Parkir", "WiFi"], metode_pembayaran: ["Cash", "QRIS"],
        social: { instagram: "toko_umkm" },
        reviews: []
      };

      if (!storeSnap.empty) {
        const storeDoc = storeSnap.docs[0];
        storeData = { ...storeData, ...storeDoc.data() } as StoreData;
        setStoreId(storeDoc.id);
        
        // Track UMKM visit
        try {
          await trackUMKMVisit({
            id: storeDoc.id,
            nama_toko: storeData.nama_toko,
            image: storeData.image || storeData.banner || storeData.profileImage,
            profileImage: storeData.profileImage || storeData.image || storeData.banner,
            kategori: storeData.kategori,
            description: storeData.deskripsi_toko,
            address: storeData.lokasi_toko,
            phone: storeData.no_telp,
            rating: storeData.rating_toko,
            reviewCount: storeData.jumlah_review
          }, auth?.currentUser?.uid || null);
        } catch (e) {
          console.warn('Failed to track UMKM visit:', e);
        }
      }
      setStore(storeData);
      setAllReviews(storeData.reviews || []);
      setFilteredReviews(storeData.reviews || []);

      // 2. Fetch SEMUA produk dari toko ini
      const productsQuery = query(collection(db, "products"), where("toko", "==", storeName));
      const productsSnap = await getDocs(productsQuery);

      console.log(`Found ${productsSnap.docs.length} products for store: ${storeName}`);

      const productsList: Product[] = productsSnap.docs.map(doc => {
        const data = doc.data();
        const normalizeTags = (data: any): string[] | undefined => {
          const cands = [data?.tags, data?.tag, data?.promoTags, data?.labels, data?.label, data?.promo_labels];
          const arr = cands.find((v) => Array.isArray(v)) as string[] | undefined;
          if (arr && arr.length) return arr.filter(Boolean).map((t) => String(t));
          const single = [data?.promo, data?.badge, data?.labelText].find((v) => typeof v === 'string');
          return single ? [String(single)] : undefined;
        };
        return {
          ASIN: doc.id,
          nama_produk: data.nama_produk || "Produk",
          merek_produk: data.merek_produk || "",
          kategori: data.kategori || "",
          harga_produk: data.harga_produk || 0,
          gambar_produk: data.gambar_produk || "",
          thumbnail_produk: data.thumbnail_produk || data.gambar_produk || "",
          toko: data.toko || storeName,
          deskripsi_produk: data.deskripsi_produk || "",
          rating_bintang: data.rating_bintang || 4.5 + Math.random() * 0.5,
          unit_terjual: data.unit_terjual || Math.floor(Math.random() * 1200),
          persentase_diskon: data.persentase_diskon || 0,
          harga_asli: data.harga_asli || data.hargaAsli || data.original_price || null,
          tags: normalizeTags(data) || ["Gratis Ongkir", "+Hadiah", "Cashback"].slice(0, Math.floor(Math.random() * 3) + 1),
          bonusText: ["Gratis Ongkir", "+Hadiah", "Cashback"][Math.floor(Math.random() * 3)],
          product_price: `Rp ${(data.harga_produk || 0).toLocaleString("id-ID")}`,
        } as Product;
      });

      // Shuffle produk secara random (seperti FetchData.tsx)
      const shuffled = [...productsList].sort(() => Math.random() - 0.5);
      console.log(`Setting ${shuffled.length} products (all products from store)`);
      setAllProducts(shuffled);
      setProducts(shuffled);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter ulasan
  useEffect(() => {
    if (selectedRating === null) {
      setFilteredReviews(allReviews);
    } else {
      setFilteredReviews(allReviews.filter(r => Math.floor(r.rating) === selectedRating));
    }
  }, [selectedRating, allReviews]);

  // Filter produk berdasarkan kategori
  useEffect(() => {
    if (selectedCategory === 'all') {
      setProducts(allProducts);
    } else {
      // Filter langsung dengan nama kategori dari produk
      const filtered = allProducts.filter(p => p.kategori === selectedCategory);
      console.log(`Filtering by category ${selectedCategory}: ${filtered.length} products`);
      setProducts(filtered);
    }
  }, [selectedCategory, allProducts]);

  const checkFollowStatus = async () => {
    if (!currentUser?.uid || !storeId) return;
    try {
      const following = await isFollowingStore(currentUser.uid, storeId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const loadFollowerCount = async () => {
    if (!storeId) return;
    try {
      const count = await getFollowerCount(storeId);
      setFollowerCount(count);
    } catch (error) {
      console.error('Error loading follower count:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser?.uid) {
      alert('Silakan login terlebih dahulu untuk mengikuti toko');
      return;
    }
    if (!storeId || !store) return;

    try {
      if (isFollowing) {
        await unfollowStore(currentUser.uid, storeId);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        await followStore(currentUser.uid, storeId, store.nama_toko);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Gagal mengubah status follow. Silakan coba lagi.');
    }
  };

  // Get unique categories from products
  const getCategories = () => {
    const categories = new Set<string>();
    allProducts.forEach(p => {
      if (p.kategori) categories.add(p.kategori);
    });
    return Array.from(categories).sort();
  };

  const categories = getCategories();

  // Helper functions for product card
  const formatToIDR = (harga: number) => {
    return "Rp " + harga.toLocaleString("id-ID");
  };

  const getDiscount = (product: Product) => {
    if (product.persentase_diskon != null && product.persentase_diskon > 0) {
      return `${product.persentase_diskon}%`;
    }
    if (product.harga_asli && product.harga_asli > product.harga_produk) {
      const diskon = Math.round(((product.harga_asli - product.harga_produk) / product.harga_asli) * 100);
      return `${diskon}%`;
    }
    return "0%";
  };

  const renderStarsString = (rating: number | null | undefined) => {
    if (!rating || rating === 0) return "☆☆☆☆☆";
    const full = Math.min(5, Math.max(0, Math.round(rating)));
    return "★★★★★".substring(0, full) + "☆☆☆☆☆".substring(0, 5 - full);
  };

  const renderProductCard = (p: Product) => {
    return <ProductCardComponent key={p.ASIN} product={p} onProductClick={goToBuyingPage} onAddToCart={handleAddToCart} currentUser={currentUser} />;
  };

  // Product Card Component (same as FetchData.tsx)
  const ProductCardComponent = ({ product, onProductClick, onAddToCart, currentUser }: { product: Product; onProductClick: (p: Product) => void; onAddToCart: (p: Product, e: React.MouseEvent) => void; currentUser: any }) => {
    const shortTitle = product.nama_produk.length > 50 ? product.nama_produk.slice(0, 47) + "..." : product.nama_produk;
    const rating = renderStarsString(product.rating_bintang);
    const sold = product.unit_terjual != null ? `${product.unit_terjual} terjual` : "0 terjual";
    const toIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");
    const initialSrc = (product.thumbnail_produk && product.thumbnail_produk.trim()) || (product.gambar_produk && product.gambar_produk.trim()) || "https://via.placeholder.com/300x300?text=Produk";
    const [imgSrc, setImgSrc] = useState<string>(initialSrc);
    const [cartPop, setCartPop] = useState(false);
    const [heartPop, setHeartPop] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const handleImgError = () => {
      const alt1 = product.gambar_produk;
      if (imgSrc && alt1 && imgSrc !== alt1) {
        setImgSrc(alt1);
        return;
      }
      const thumb = product.thumbnail_produk;
      if (thumb && imgSrc !== thumb) {
        try {
          const u = new URL(thumb, window.location.origin);
          setImgSrc(u.origin + u.pathname);
          return;
        } catch {
          setImgSrc(thumb);
          return;
        }
      }
      setImgSrc("https://via.placeholder.com/300x300?text=Produk");
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
    };

    const flyToNavbar = (target: 'cart' | 'favorites') => {
      try {
        const cardImg = (document.querySelector('.product-card img[src="' + imgSrc.replace(/"/g, '"') + '"]') as HTMLImageElement) || null;
        const targetEl = document.getElementById(target === 'cart' ? 'nav-cart-btn-desktop' : 'nav-fav-btn-desktop')
          || document.getElementById(target === 'cart' ? 'nav-cart-btn-mobile' : 'nav-fav-btn-mobile');
        if (!targetEl) return;

        const imgRect = (cardImg || (document.activeElement as any))?.getBoundingClientRect?.() || { top: window.innerHeight/2, left: window.innerWidth/2, width: 60, height: 60 } as DOMRect;
        const targetRect = targetEl.getBoundingClientRect();

        const flyImg = document.createElement('img');
        flyImg.src = imgSrc;
        flyImg.alt = 'flying';
        Object.assign(flyImg.style, {
          position: 'fixed',
          zIndex: '9999',
          pointerEvents: 'none',
          top: imgRect.top + 'px',
          left: imgRect.left + 'px',
          width: imgRect.width + 'px',
          height: imgRect.height + 'px',
          borderRadius: '10px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          transform: 'scale(1)',
          transition: 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94), top 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94), left 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94), width 800ms, height 800ms, opacity 300ms',
        } as CSSStyleDeclaration);
        document.body.appendChild(flyImg);

        requestAnimationFrame(() => {
          const endTop = targetRect.top + targetRect.height / 2 - imgRect.height * 0.15;
          const endLeft = targetRect.left + targetRect.width / 2 - imgRect.width * 0.15;
          flyImg.style.top = endTop + 'px';
          flyImg.style.left = endLeft + 'px';
          flyImg.style.width = imgRect.width * 0.3 + 'px';
          flyImg.style.height = imgRect.height * 0.3 + 'px';
          flyImg.style.transform = 'scale(0.6) rotate(15deg)';
          setTimeout(() => {
            flyImg.style.opacity = '0';
            setTimeout(() => flyImg.remove(), 300);
          }, 820);
        });

        targetEl.classList.add('badge-pulse');
        setTimeout(() => targetEl.classList.remove('badge-pulse'), 800);
      } catch {}
    };

    const handleAddToCartClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddToCart(product, e);
      flyToNavbar('cart');
      setCartPop(true);
      setTimeout(() => setCartPop(false), 500);
    };

    const handleAddToFavorites = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!currentUser) {
        try {
          const pending = {
            type: 'favorites' as const,
            product,
            returnUrl: window.location.href,
            createdAt: Date.now(),
          };
          localStorage.setItem('pendingAction', JSON.stringify(pending));
        } catch {}
        window.location.href = "/login";
        return;
      }
      
      let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      const existing = favorites.find((p: Product) => p.ASIN === product.ASIN);
      
      if (existing) {
        favorites = favorites.filter((p: Product) => p.ASIN !== product.ASIN);
      } else {
        favorites.push(product);
      }
      
      localStorage.setItem("favorites", JSON.stringify(favorites));
      flyToNavbar('favorites');

      window.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: { type: 'favorites', count: favorites.length }
      }));

      setHeartPop(true);
      setTimeout(() => setHeartPop(false), 600);
    };

    const isFavorited = () => {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      return favorites.some((p: Product) => p.ASIN === product.ASIN);
    };

    const discount = getDiscount(product);
    const hasDiscount = discount && discount !== "0%";
    const parsePercent = (d?: string) => {
      if (!d) return undefined;
      const m = d.match(/(\d+(?:[.,]\d+)?)/);
      return m ? parseFloat(m[1].replace(',', '.')) : undefined;
    };

    let originalPrice: number | null = null;
    if (product.harga_asli && typeof product.harga_asli === 'number' && product.harga_asli > product.harga_produk) {
      originalPrice = product.harga_asli;
    }

    const percent = (typeof product.persentase_diskon === 'number' ? product.persentase_diskon : parsePercent(discount)) || 0;
    let discountedPrice = product.harga_produk;

    if (hasDiscount) {
      if (originalPrice && originalPrice > product.harga_produk) {
        discountedPrice = product.harga_produk;
      } else if (percent > 0) {
        if (originalPrice) {
          discountedPrice = Math.max(0, Math.round(originalPrice * (1 - percent / 100)));
        } else {
          originalPrice = product.harga_produk;
          discountedPrice = Math.max(0, Math.round(originalPrice * (1 - percent / 100)));
        }
      }
    }

    const showOldPrice = hasDiscount && originalPrice && originalPrice > discountedPrice;

    return (
      <div 
        className="product-card" 
        onClick={() => onProductClick(product)}
      >
        <div className="product-image">
          {!imageLoaded && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
              backgroundSize: '200% 100%',
              borderRadius: 'inherit',
              animation: 'shimmer 2s infinite linear'
            }}></div>
          )}
          <img 
            src={imgSrc} 
            alt={shortTitle} 
            loading="lazy" 
            decoding="async" 
            referrerPolicy="no-referrer" 
            onError={handleImgError}
            onLoad={handleImageLoad}
            style={{ 
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.4s ease'
            }}
          />
          {hasDiscount && (
            <div className="discount-chip-overlay" aria-label={`Diskon ${discount}`}>
              <span className="discount-chip">🔥 {discount} OFF</span>
            </div>
          )}
          {/* Favorite icon di atas gambar - hanya tampil di mobile */}
          <div 
            className={`favorite-icon-overlay ${heartPop ? 'heart-pop' : ''}`} 
            onClick={handleAddToFavorites} 
            aria-label="Tambah ke favorit" 
            title="Favorit"
          >
            <svg 
              viewBox="0 0 24 24" 
              width="16" 
              height="16" 
              fill={isFavorited() ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        </div>
        
        <div className="product-info">
          <div>
            <h3 className="product-title">{shortTitle}</h3>
            
            <div className="rating-sold">
              <div className="rating" title={`Rating: ${product.rating_bintang || 0}/5`}>
                <span>{rating}</span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  color: '#6b7280',
                  marginLeft: '3px'
                }}>
                  {product.rating_bintang ? product.rating_bintang.toFixed(1) : '0.0'}
                </span>
              </div>
              <div className="sold" title="Jumlah terjual">
                {sold}
              </div>
            </div>
            
            <div className="price-container">
              {showOldPrice ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="price-large price-discounted">
                      {toIDR(discountedPrice)}
                    </span>
                  </div>
                  <span className="old-price">
                    {toIDR(originalPrice as number)}
                  </span>
                </>
              ) : (
                <span className="price-large">{toIDR(discountedPrice)}</span>
              )}
            </div>
            
            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <div className="tag-list">
                {product.tags
                  .filter(tag => !/\bdiskon\b/i.test(tag))
                  .slice(0, 2)
                  .map((tag, idx) => (
                    <span key={idx} className="tag-chip" title={tag}>
                      {tag}
                    </span>
                  ))}
              </div>
            )}
            
            <p className="store-name" title={product.toko}>
              {product.toko}
            </p>
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn-buy" 
              onClick={(e) => { e.stopPropagation(); onProductClick(product); }} 
              aria-label="Beli produk"
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              Beli Sekarang
            </button>
            <div 
              className={`cart-icon-badge ${cartPop ? 'cart-pop' : ''}`} 
              onClick={handleAddToCartClick} 
              aria-label="Tambah ke keranjang"
              title="Keranjang"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            {/* Favorite icon di bawah - hanya tampil di desktop/tablet */}
            <div 
              className={`favorite-icon-badge ${isFavorited() ? 'favorited' : ''} ${heartPop ? 'heart-pop' : ''}`} 
              onClick={handleAddToFavorites} 
              aria-label="Tambah ke favorit"
              title="Favorit"
            >
              <svg viewBox="0 0 24 24" fill={isFavorited() ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewCard = (r: Review) => {
    const product = r.productASIN ? products.find(p => p.ASIN === r.productASIN) : null;
    return (
      <div key={`${r.tanggal}-${r.nama}`} className="review-card-new">
        <div className="review-header-new">
          <img src={r.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random()*70)}`} alt={r.nama} className="review-avatar-new" />
          <div className="review-meta-new">
            <div className="review-name-new">{r.nama}</div>
            <div className="review-date-new">{formatWIB(r.tanggal)}</div>
          </div>
          <div className="review-rating-new">{renderStars(r.rating)}</div>
        </div>
        {product && (
          <div className="reviewed-product">
            <img src={product.thumbnail_produk} alt={product.nama_produk} />
            <div className="product-info-mini">
              <div className="product-name-mini">
                {product.nama_produk.length > 50 ? product.nama_produk.slice(0,47)+"..." : product.nama_produk}
              </div>
            </div>
          </div>
        )}
        <p className="review-text-new">{r.ulasan}</p>
      </div>
    );
  };

  if (loading) {
    return <div className="container" style={{textAlign:'center', padding:'4rem', color:'#94a3b8', fontSize:'1.2rem'}}>Memuat toko dan semua produk...</div>;
  }

  return (
    <>
      <div className="container">
        {/* HEADER TOKO */}
        <div className="store-header">
          <img src={store?.profileImage || store?.image || "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400"} alt={store?.nama_toko} className="store-logo" />
          <div className="store-info">
            <div className="store-name">{store?.nama_toko} <span className="verified">Verified</span></div>
            <div className="store-location">{store?.lokasi_toko}</div>
            <div className="store-stats">
              <div className="stat-item"><span className="rating-stars">{renderStars(store?.rating_toko || 4.9)}</span><strong>{store?.rating_toko || 4.9}</strong> <span style={{color:'#64748b'}}>({store?.jumlah_review || 178})</span></div>
              <div className="stat-item"><span>Terjual</span> <strong>1.2k+</strong></div>
              <div className="stat-item"><span>Follower</span> <strong>{followerCount}</strong></div>
              <div className="stat-item"><span>Proses</span> <strong>±1 jam</strong></div>
            </div>
          </div>
          <div className="store-actions">
            <button 
              className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
              onClick={handleFollow}
            >
              {isFollowing ? '✓ Following' : '+ Follow'}
            </button>
            <button className="btn btn-outline">Chat Penjual</button>
            <button className="btn btn-secondary" onClick={() => setModalOpen(true)}>Lihat Detail</button>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {(['beranda', 'produk', 'ulasan'] as const).map(tab => (
            <div key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>

        {/* BERANDA */}
        {activeTab === 'beranda' && (
          <>
            <div className="category-filter-section">
              <h2 className="section-title">Produk Toko ({products.length})</h2>
              <div className="category-filter">
                <button 
                  className={`category-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  Semua
                </button>
                {categories.map(cat => {
                  return (
                    <button
                      key={cat}
                      className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="product-list" style={{marginTop:'1rem'}}>
              {products.length > 0 ? products.map(renderProductCard) : <div style={{gridColumn:'1/-1', padding:'2rem', textAlign:'center', color:'#94a3b8'}}>Belum ada produk tersedia</div>}
            </div>
          </>
        )}

        {/* PRODUK */}
        {activeTab === 'produk' && (
          <>
            <div className="category-filter-section">
              <h2 className="section-title">Produk Toko ({products.length})</h2>
              <div className="category-filter">
                <button 
                  className={`category-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  Semua
                </button>
                {categories.map(cat => {
                  return (
                    <button
                      key={cat}
                      className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="product-list" style={{marginTop:'1rem'}}>
              {products.length > 0 ? products.map(renderProductCard) : <div style={{gridColumn:'1/-1', padding:'2rem', textAlign:'center', color:'#94a3b8'}}>Belum ada produk</div>}
            </div>
          </>
        )}

        {/* ULASAN */}
        {activeTab === 'ulasan' && (
          <div className="reviews-section-new">
            <h2 className="section-title">Ulasan Pelanggan ({allReviews.length})</h2>
            <div className="rating-filter">
              <button className={`filter-btn ${selectedRating === null ? 'active' : ''}`} onClick={() => setSelectedRating(null)}>Semua ({allReviews.length})</button>
              {[5,4,3,2,1].map(star => {
                const count = allReviews.filter(r => Math.floor(r.rating) === star).length;
                return count > 0 && (
                  <button key={star} className={`filter-btn ${selectedRating === star ? 'active' : ''}`} onClick={() => setSelectedRating(star)}>
                    {renderStars(star)} {count}
                  </button>
                );
              })}
            </div>
            <div className="review-list-new">
              {filteredReviews.length > 0 ? filteredReviews.map(renderReviewCard) : <div className="no-reviews">Belum ada ulasan.</div>}
            </div>
          </div>
        )}
      </div>

      {/* FLOATING CHAT */}
      <div className="chat-float" onClick={() => window.location.href='/chat'}>Chat</div>

      {/* MODAL DETAIL TOKO */}
      {modalOpen && store && (
        <div className="modal active" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${store.banner || store.image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920'})`}}>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <img src={store.profileImage || store.image} alt={store.nama_toko} className="modal-logo" />
              <div className="modal-title">{store.nama_toko}</div>
              <div className="modal-subtitle">{store.kategori} • Rating {store.rating_toko} ({store.jumlah_review} ulasan)</div>
              <div className="modal-section"><h4>Deskripsi Toko</h4><p>{store.deskripsi_toko}</p></div>
              <div className="modal-section"><h4>Alamat</h4><p>{store.lokasi_toko}</p><a href={store.maps_link} target="_blank" style={{color:'var(--primary)',fontWeight:700}}>Buka di Google Maps</a></div>
              <div className="modal-section"><h4>Jam Operasional</h4><p><strong>{store.hari_operasional}:</strong> {store.jam_operasional} WIB</p></div>
              <div className="modal-section"><h4>Kontak</h4><p>{store.no_telp}</p><p>{store.email}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Poppins:wght@600;700&display=swap');
        :root {
          --primary: #00a844; --primary-dark: #008738; --secondary: #1a1a1a; --text: #1a1a1a;
          --text-light: #555; --text-sold: #6b7280; --bg: #f8fafc; --white: #ffffff; --border: #e2e8f0;
          --danger: #dc2626; --warning: #f97316; --bonus-bg: #fff7ed; --bonus-border: #fed7aa;
          --discount-from: #ff3b3b; --discount-to: #ff5e3a; --trending-badge: #dc2626;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.12); --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
          --shadow-lg: 0 12px 32px rgba(0,0,0,0.14); --radius: 14px; --radius-sm: 10px;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; padding-bottom: 80px; overflow-x: hidden; }
        .container { max-width: 1400px; margin: 0 auto; padding: 0 1rem; }

        .store-header { background: var(--white); border-radius: var(--radius); padding: 1.75rem; margin: 2rem 0 1.5rem; box-shadow: var(--shadow-md); display: flex; align-items: center; gap: 1.5rem; position: relative; overflow: hidden; border: 1px solid #f0f0f0; }
        .store-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, var(--primary), #22c55e); border-radius: var(--radius) var(--radius) 0 0; }
        .store-logo { width: 90px; height: 90px; border-radius: 18px; object-fit: cover; border: 4px solid #fff; box-shadow: var(--shadow-md); transition: all 0.3s ease; }
        .store-logo:hover { transform: scale(1.06); box-shadow: var(--shadow-lg); }
        .store-info { flex: 1; }
        .store-name { font-family: 'Poppins', sans-serif; font-size: 1.55rem; font-weight: 700; color: var(--secondary); display: flex; align-items: center; gap: 0.5rem; }
        .verified { color: var(--primary); font-size: 1.25rem; font-weight: 700; }
        .store-location { font-size: 0.95rem; color: var(--text-light); margin: 0.4rem 0; font-weight: 500; }
        .store-stats { display: flex; gap: 1.75rem; margin-top: 0.75rem; font-size: 0.92rem; font-weight: 500; }
        .stat-item { display: flex; align-items: center; gap: 0.4rem; }
        .rating-stars { color: var(--warning); font-weight: 700; }
        .store-actions { display: flex; gap: 0.8rem; align-items: center; }
        .btn { padding: 0.7rem 1.3rem; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.92rem; cursor: pointer; transition: all 0.25s ease; display: inline-flex; align-items: center; gap: 0.5rem; border: none; box-shadow: var(--shadow-sm); }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-dark); transform: translateY(-2px); }
        .btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary); }
        .btn-outline:hover { background: #f0fdf4; }
        .btn-secondary { background: #f8fafc; color: var(--secondary); border: 1px solid #e2e8f0; }
        .btn-secondary:hover { background: #e2e8f0; }

        .tabs { display: flex; gap: 2.5rem; margin-bottom: 1.5rem; padding: 0.5rem 0; border-bottom: 2px solid #f1f5f9; }
        .tab { font-weight: 700; color: #94a3b8; cursor: pointer; position: relative; padding: 0.5rem 0; transition: color 0.25s; font-size: 1rem; }
        .tab::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 3px; background: var(--primary); border-radius: 2px; transition: width 0.35s ease; }
        .tab.active { color: var(--primary); }
        .tab.active::after { width: 100%; }

        .section-title { font-family: 'Poppins', sans-serif; font-size: 1.4rem; font-weight: 700; color: var(--secondary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-title::before { content: ''; width: 6px; height: 24px; background: var(--primary); border-radius: 3px; }

        .category-filter-section { margin-top: 1rem; margin-bottom: 1.5rem; }
        .category-filter { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; padding: 0.5rem 0; }
        .category-filter-btn { padding: 0.6rem 1.2rem; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .category-filter-btn:hover { background: #f1f5f9; border-color: var(--primary); transform: translateY(-2px); }
        .category-filter-btn.active { background: linear-gradient(135deg, var(--primary) 0%, #22c55e 100%); border-color: var(--primary); color: white; font-weight: 700; box-shadow: 0 4px 12px rgba(0, 168, 68, 0.3); }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes card-hover { 0% { transform: translateY(0) rotate(0); } 100% { transform: translateY(-8px) rotate(0.5deg); } }
        @keyframes image-zoom { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
        @keyframes shimmer { 
          0% { background-position: -1000px 0; } 
          100% { background-position: 1000px 0; } 
        }
        @keyframes pop-bounce { 0% { transform: scale(1); } 25% { transform: scale(1.15); } 50% { transform: scale(0.95); } 75% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes heart-bounce { 0% { transform: scale(1); } 25% { transform: scale(1.3); } 50% { transform: scale(0.9); } 75% { transform: scale(1.1); } 100% { transform: scale(1); } }
        
        .product-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 1rem; }
        .product-card { background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%); border-radius: 16px; overflow: hidden; transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); cursor: pointer; position: relative; border: 1px solid rgba(255, 255, 255, 0.8); display: flex; flex-direction: column; height: 100%; min-height: 380px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08), 0 3px 12px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); animation: fadeInUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) backwards; will-change: transform; }
        .product-card:hover { animation: card-hover 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; border-color: rgba(253, 87, 1, 0.3); box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15), 0 12px 25px rgba(253, 87, 1, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9); transform: translateY(-10px) scale(1.02) rotate(0.5deg); }
        .product-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(253, 87, 1, 0.03) 0%, transparent 50%); opacity: 0; transition: opacity 0.4s ease; border-radius: 16px; pointer-events: none; }
        .product-card:hover::before { opacity: 1; }
        .product-card:nth-child(1) { animation-delay: 0.05s; }
        .product-card:nth-child(2) { animation-delay: 0.1s; }
        .product-card:nth-child(3) { animation-delay: 0.15s; }
        .product-card:nth-child(4) { animation-delay: 0.2s; }
        .product-card:nth-child(5) { animation-delay: 0.25s; }
        .product-card:nth-child(6) { animation-delay: 0.3s; }
        .product-card:nth-child(7) { animation-delay: 0.35s; }
        .product-card:nth-child(8) { animation-delay: 0.4s; }
        .product-card:nth-child(9) { animation-delay: 0.45s; }
        .product-card:nth-child(10) { animation-delay: 0.5s; }
        
        .discount-chip-overlay { position: absolute; top: 10px; left: 10px; z-index: 15; }
        .discount-chip { display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 10px; font-size: 0.7rem; font-weight: 800; color: white; background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 3px 12px rgba(239, 68, 68, 0.3); transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); backdrop-filter: blur(10px); }
        .product-card:hover .discount-chip { transform: scale(1.1) translateY(-2px); box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4); }
        
        .favorite-icon-overlay { position: absolute; top: 10px; right: 10px; z-index: 15; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; background: rgba(255, 255, 255, 0.95); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 3px 15px rgba(0, 0, 0, 0.15); backdrop-filter: blur(20px); transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); cursor: pointer; }
        .favorite-icon-overlay:hover { transform: scale(1.15) rotate(8deg); background: rgba(255, 255, 255, 1); box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2); }
        .favorite-icon-overlay:active { transform: scale(1.05) rotate(0deg); }
        
        .product-image { width: 100%; height: 180px; background: linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(251, 146, 60, 0.06) 50%, rgba(253, 186, 116, 0.04) 100%); overflow: hidden; position: relative; border-radius: 14px 14px 0 0; margin: 0; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5); }
        .product-image::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 60%; background: linear-gradient(transparent, rgba(0, 0, 0, 0.02)); pointer-events: none; }
        .product-image img { width: 100%; height: 100%; object-fit: cover; transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); filter: brightness(0.98) contrast(1.05); transform-origin: center; }
        .product-card:hover .product-image img { animation: image-zoom 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; filter: brightness(1.05) contrast(1.1); }
        
        .product-info { padding: 16px; display: flex; flex-direction: column; gap: 10px; flex-grow: 1; background: linear-gradient(180deg, transparent 0%, rgba(248, 250, 252, 0.4) 100%); }
        .product-title { font-size: 0.9rem; font-weight: 700; color: #0f172a; line-height: 1.4; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; min-height: 2.5rem; letter-spacing: -0.02em; transition: color 0.3s ease; }
        .product-card:hover .product-title { color: #fd5701; background: linear-gradient(135deg, #fd5701 0%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .rating-sold { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
        .rating { display: flex; align-items: center; gap: 4px; color: #f59e0b; font-weight: 700; font-size: 0.75rem; text-shadow: 0 2px 4px rgba(245, 158, 11, 0.3); transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .product-card:hover .rating { transform: scale(1.08); text-shadow: 0 3px 6px rgba(245, 158, 11, 0.4); }
        .sold { font-size: 0.7rem; color: #475569; background: rgba(255, 255, 255, 0.8); padding: 5px 8px; border-radius: 8px; font-weight: 600; border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08); backdrop-filter: saturate(180%) blur(10px); transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .product-card:hover .sold { transform: translateY(-2px); box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12); }
        
        .price-container { margin: 6px 0; }
        .price-large { font-size: 1.1rem; font-weight: 900; color: #0f172a; margin: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.03em; line-height: 1.2; transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .product-card:hover .price-large { transform: scale(1.05); }
        .price-discounted { color: #ef4444 !important; background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
        .old-price { text-decoration: line-through !important; color: #94a3b8 !important; font-weight: 500; font-size: 0.8rem; opacity: 0.8; letter-spacing: -0.01em; display: block; margin-top: 2px; transition: opacity 0.3s ease; }
        .product-card:hover .old-price { opacity: 1; }
        
        .tag-list { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
        .tag-chip { display: inline-flex; align-items: center; padding: 5px 8px; border-radius: 8px; font-size: 0.65rem; font-weight: 700; color: #374151; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%); border: 1px solid #d1d5db; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8); transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); cursor: pointer; animation: fadeInUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) backwards; }
        .tag-chip:nth-child(1) { animation-delay: 0.2s; }
        .tag-chip:nth-child(2) { animation-delay: 0.25s; }
        .tag-chip:nth-child(3) { animation-delay: 0.3s; }
        .tag-chip:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9); }
        
        .store-name { font-size: 0.75rem; color: #fd5701; font-weight: 700; margin: 6px 0 0; display: flex; align-items: center; gap: 5px; padding-top: 10px; border-top: 1px solid rgba(226, 232, 240, 0.8); letter-spacing: -0.01em; transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .product-card:hover .store-name { color: #f97316; transform: translateX(3px); }
        .store-name::before { content: '✓'; background: linear-gradient(135deg, #fd5701 0%, #f97316 50%, #ea580c 100%); color: white; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 900; box-shadow: 0 2px 6px rgba(253, 87, 1, 0.3); border: 1px solid rgba(255, 255, 255, 0.3); transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .product-card:hover .store-name::before { transform: scale(1.2) rotate(360deg); }
        
        .action-buttons { margin-top: auto; padding-top: 14px; display: flex; gap: 6px; align-items: center; }
        .btn-buy { flex: 1; padding: 12px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer; transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); border: 1px solid rgba(255, 255, 255, 0.3); background: linear-gradient(135deg, #fd5701 0%, #f97316 50%, #ea580c 100%); color: white; box-shadow: 0 5px 15px rgba(253, 87, 1, 0.3); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); letter-spacing: -0.01em; position: relative; overflow: hidden; }
        .btn-buy::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent); transition: left 0.6s ease; }
        .btn-buy:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 25px rgba(253, 87, 1, 0.4); }
        .btn-buy:hover::before { left: 100%; }
        .btn-buy:active { transform: translateY(-1px) scale(1.01); }
        .btn-icon { width: 14px; height: 14px; transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .btn-buy:hover .btn-icon { transform: rotate(15deg) scale(1.1); }
        
        .cart-icon-badge { width: 44px; height: 44px; background: linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%); border-radius: 12px; box-shadow: 0 3px 15px rgba(100, 116, 139, 0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); border: 1px solid rgba(255, 255, 255, 0.2); position: relative; overflow: hidden; }
        .cart-icon-badge:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 5px 20px rgba(100, 116, 139, 0.4); }
        .cart-icon-badge:active { transform: scale(1.05) rotate(0deg); }
        .cart-icon-badge svg { width: 18px; height: 18px; stroke: white; stroke-width: 2.5; transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .cart-icon-badge:hover svg { transform: scale(1.1); }
        .cart-pop { animation: pop-bounce 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        
        .favorite-icon-badge { width: 44px; height: 44px; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); border: 1px solid rgba(255, 255, 255, 0.8); position: relative; overflow: hidden; color: #64748b; box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1); }
        .favorite-icon-badge.favorited { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; animation: pop-bounce 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .favorite-icon-badge:hover { transform: translateY(-2px) scale(1.08) rotate(-5deg); box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15); border-color: #ef4444; }
        .favorite-icon-badge:active { transform: translateY(-1px) scale(1.05) rotate(0deg); }
        .favorite-icon-badge svg { width: 18px; height: 18px; transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .favorite-icon-badge:hover svg { transform: scale(1.15); }
        .heart-pop { animation: heart-bounce 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }

        .chat-float { position: fixed; bottom: 1.5rem; right: 1.5rem; background: var(--primary); color: white; width: 62px; height: 62px; border-radius: 50%; box-shadow: var(--shadow-lg); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.55rem; z-index: 100; transition: all 0.3s ease; font-weight: 700; }
        .chat-float:hover { transform: scale(1.12); background: var(--primary-dark); }

        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); z-index: 9999; align-items: center; justify-content: center; padding: 1rem; opacity: 0; transition: opacity 0.4s ease; }
        .modal.active { display: flex; opacity: 1; }
        .modal-content { background: var(--white); max-width: 620px; width: 100%; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-lg); max-height: 90vh; overflow-y: auto; }
        .modal-header { height: 150px; background-size: cover; background-position: center; position: relative; }
        .modal-close { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.95); color: var(--secondary); border: none; width: 42px; height: 42px; border-radius: 50%; font-size: 1.35rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); }
        .modal-close:hover { background: var(--danger); color: white; }
        .modal-body { padding: 2rem; }
        .modal-logo { width: 94px; height: 94px; border-radius: 18px; object-fit: cover; margin: -3.2rem auto 1rem; display: block; border: 5px solid white; box-shadow: var(--shadow-lg); }
        .modal-title { text-align: center; font-family: 'Poppins', sans-serif; font-size: 1.65rem; font-weight: 700; }
        .modal-subtitle { text-align: center; color: #64748b; font-size: 0.98rem; margin-bottom: 1.75rem; }

        .reviews-section-new { margin-top: 1.5rem; }
        .rating-filter { display: flex; gap: 0.75rem; flex-wrap: wrap; margin: 1.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0; }
        .filter-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; font-weight: 600; color: #475569; cursor: pointer; }
        .filter-btn:hover { background: #f1f5f9; }
        .filter-btn.active { background: #dcfce7; border-color: #22c55e; color: #166534; font-weight: 700; }
        .review-list-new { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1rem; }
        .review-card-new { background: white; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .review-header-new { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
        .review-avatar-new { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid #f1f5f9; }
        .review-meta-new { flex: 1; }
        .review-name-new { font-weight: 700; font-size: 0.95rem; }
        .review-date-new { font-size: 0.8rem; color: #94a3b8; }
        .review-rating-new { margin-left: auto; }
        .reviewed-product { display: flex; align-items: center; gap: 0.75rem; margin: 0.75rem 0; padding: 0.75rem; background: #f8fafc; border-radius: 8px; }
        .reviewed-product img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
        .product-name-mini { font-weight: 600; line-height: 1.3; }
        .review-text-new { font-size: 0.95rem; color: #475569; line-height: 1.55; }
        .no-reviews { text-align: center; padding: 3rem; color: #94a3b8; }

        @media (min-width: 769px) {
          .favorite-icon-overlay { display: none; }
        }
        @media (max-width: 768px) {
          .favorite-icon-overlay { display: flex; }
          .favorite-icon-badge { display: none; }
          .product-list { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .store-header { flex-direction: column; text-align: center; }
          .store-actions { margin-top: 1rem; justify-content: center; }
          .category-filter { gap: 0.5rem; }
          .category-filter-btn { padding: 0.5rem 1rem; font-size: 0.85rem; }
          .product-card { min-height: 320px; border-radius: 14px; }
          .product-image { height: 140px; border-radius: 12px 12px 0 0; }
          .product-info { padding: 12px; gap: 8px; }
          .product-title { font-size: 0.85rem; min-height: 2.2rem; }
          .price-large { font-size: 1rem; }
          .action-buttons { padding-top: 12px; flex-direction: column; }
          .btn-buy { padding: 10px 12px; font-size: 0.75rem; border-radius: 10px; }
          .cart-icon-badge, .favorite-icon-badge { width: 100%; height: 38px; border-radius: 10px; }
          .favorite-icon-overlay { width: 28px; height: 28px; border-radius: 6px; top: 6px; right: 6px; }
        }
        @media (max-width: 640px) {
          .product-list { grid-template-columns: 1fr; gap: 8px; }
          .product-card { min-height: auto; border-radius: 10px; }
          .product-image { height: 120px; border-radius: 8px 8px 0 0; }
          .product-info { padding: 10px; gap: 6px; }
          .product-title { font-size: 0.8rem; min-height: 2rem; }
          .price-large { font-size: 0.95rem; }
          .action-buttons { padding-top: 10px; gap: 6px; flex-direction: row; }
          .btn-buy { flex: 1; padding: 8px 10px; font-size: 0.7rem; border-radius: 6px; }
          .cart-icon-badge, .favorite-icon-badge { width: 36px; height: 36px; border-radius: 6px; flex-shrink: 0; }
          .btn-icon { width: 12px; height: 12px; }
          .cart-icon-badge svg, .favorite-icon-badge svg { width: 16px; height: 16px; }
          .discount-chip { padding: 4px 6px; font-size: 0.6rem; border-radius: 6px; }
        }
      `}</style>
    </>
  );
}