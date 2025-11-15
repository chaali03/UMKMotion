"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../src/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  Heart, 
  Share2, 
  ShoppingBag,
  MessageCircle,
  Navigation,
  Award,
  Users,
  Camera,
  MapPinned,
  Verified,
  TrendingUp,
  Package,
  ChevronRight,
  Eye
} from "lucide-react";

interface UMKMData {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  openHours: string;
  images: string[];
  products: Product[];
  owner: string;
  established: string;
  distance: string;
  mapsLink?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export default function UMKMDetailPage() {
  const [loading, setLoading] = useState(true);
  const [umkmId, setUmkmId] = useState("");
  const [umkmData, setUmkmData] = useState<UMKMData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeTab, setActiveTab] = useState("produk");
  const autoVisitLoggedRef = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));

    const load = async () => {
      try {
        const id = (window as any).UMKM_ID as string;
        setUmkmId(id);
        if (!id) throw new Error('storeId missing');

        const storeRef = doc(db, 'stores', id);
        const storeSnap = await getDoc(storeRef);
        if (!storeSnap.exists()) throw new Error('Store not found');
        const s = storeSnap.data() as any;

        const q = query(collection(db, 'products'), where('storeId', '==', id));
        const ps = await getDocs(q);
        const products: Product[] = ps.docs.map(d => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.nama_produk || data.title || data.model_produk || `Produk ${d.id}`,
            price: typeof data.harga_final === 'number'
              ? data.harga_final
              : (Number(data.harga_final) || (typeof data.harga_produk === 'number' ? data.harga_produk : Number(data.harga_produk) || 0)),
            description: data.deskripsi_produk || '',
            image: data.gambar_produk || (Array.isArray(data.galeri_gambar) && data.galeri_gambar[0]) || '/placeholder.webp',
            category: data.kategori || data.sub_kategori || 'Lainnya',
          } as Product;
        });

        const imagesFromStore = [s.banner, s.profileImage, s.image].filter(Boolean) as string[];
        const productImages = products.map(p => p.image).filter(Boolean);
        const gallery = imagesFromStore.length ? imagesFromStore : (productImages.length ? productImages.slice(0, 5) : ['/placeholder.webp']);

        const detail: UMKMData = {
          id,
          name: s.name || s.toko || 'UMKM',
          category: s.category || 'UMKM',
          description: s.description || 'Profil UMKM',
          rating: typeof s.rating === 'number' ? s.rating : 4.8,
          reviewCount: typeof s.reviewCount === 'number' ? s.reviewCount : 0,
          address: s.address || s.lokasi || '-',
          phone: s.phone || s.telepon || '-',
          openHours: s.openHours || s.jam_operasional || '-',
          images: gallery,
          products,
          owner: s.owner || s.name || 'Owner',
          established: s.established || '2020',
          distance: s.distance || '—',
          mapsLink: s.mapsLink || undefined,
        };

        setUmkmData(detail);
      } catch (e) {
        console.error('[UMKMDetail] load error', e);
        setUmkmData(null);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => unsub();
  }, []);

  // Auto-log a visit each time page is opened (once per mount per store)
  useEffect(() => {
    const logVisit = async () => {
      if (autoVisitLoggedRef.current || !umkmData) return;
      autoVisitLoggedRef.current = true;
      
      try {
        const { trackUMKMVisit } = await import('@/lib/activity-tracker');
        await trackUMKMVisit({
          id: umkmData.id,
          nama_toko: umkmData.name,
          image: umkmData.images?.[0],
          profileImage: umkmData.images?.[0],
          kategori: umkmData.category,
          description: umkmData.description,
          address: umkmData.address,
          phone: umkmData.phone,
          rating: umkmData.rating,
          reviewCount: umkmData.reviewCount
        }, currentUser?.uid || null);
      } catch (e) {
        // swallow errors
      }
    };
    logVisit();
  }, [currentUser, umkmData]);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleFavorite = async () => {
    if (!currentUser || !umkmData) return;

    try {
      const favoriteRef = doc(db, "users", currentUser.uid, "favorites", umkmData.id);
      
      if (isFavorite) {
        setIsFavorite(false);
        showToastMessage("Dihapus dari favorit");
      } else {
        await setDoc(favoriteRef, {
          umkmId: umkmData.id,
          umkmName: umkmData.name,
          createdAt: serverTimestamp()
        });
        setIsFavorite(true);
        showToastMessage("Ditambahkan ke favorit ❤️");
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  const handleVisit = async () => {
    if (!umkmData) return;

    try {
      const { trackUMKMVisit } = await import('@/lib/activity-tracker');
      await trackUMKMVisit({
        id: umkmData.id,
        nama_toko: umkmData.name,
        image: umkmData.images?.[0],
        profileImage: umkmData.images?.[0],
        kategori: umkmData.category
      }, currentUser?.uid || null);
      showToastMessage("Kunjungan berhasil dicatat! 🎉");
    } catch (error) {
      console.error("Error logging visit:", error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: umkmData?.name,
        text: umkmData?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToastMessage("Link berhasil disalin! 📋");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <div className="text-slate-600 font-medium">Memuat detail UMKM...</div>
        </div>
      </div>
    );
  }

  if (!umkmData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">UMKM tidak ditemukan</h2>
          <p className="text-slate-600 mb-4">Data UMKM yang Anda cari tidak tersedia</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-sm"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:scale-105 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleFavorite}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${
                  isFavorite 
                    ? "bg-red-500 text-white shadow-lg shadow-red-200" 
                    : "bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-red-50 hover:text-red-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-white text-slate-600 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 hover:bg-slate-50 hover:scale-105 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero image removed as requested */}
        <div className="mb-2" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{umkmData.name}</h1>
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Verified className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-sm font-semibold shadow-lg">
                        {umkmData.category}
                      </span>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-slate-700">Sejak {umkmData.established}</span>
                      </div>
                    </div>
                    
                    {/* Rating with Stars */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(umkmData.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-900">{umkmData.rating}</span>
                        <span className="text-slate-600">({umkmData.reviewCount} ulasan)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 text-lg leading-relaxed">{umkmData.description}</p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{umkmData.products.length}</div>
                    <div className="text-sm text-slate-600">Produk</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{umkmData.reviewCount}</div>
                    <div className="text-sm text-slate-600">Pelanggan</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{umkmData.rating}</div>
                    <div className="text-sm text-slate-600">Rating</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <MapPinned className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Informasi Kontak</h3>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 mb-1">Alamat Lengkap</div>
                    <div className="text-slate-600 leading-relaxed">{umkmData.address}</div>
                  </div>
                </div>
                
                {umkmData.phone && umkmData.phone !== '-' && (
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 mb-1">Nomor Telepon</div>
                      <a href={`tel:${umkmData.phone}`} className="text-orange-600 hover:text-orange-700 font-medium text-lg">
                        {umkmData.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 mb-1">Jam Operasional</div>
                    <div className="text-slate-600">{umkmData.openHours}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Products Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Produk Unggulan</h3>
                </div>
                <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  {umkmData.products.length} Produk
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {umkmData.products.slice(0, 6).map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -4 }}
                    className="group border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer bg-white"
                    onClick={() => window.location.href = `/produk/${product.id}`}
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.webp'; }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <span className="text-white font-medium text-sm">Lihat Detail</span>
                          <ChevronRight className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-semibold text-slate-700">
                        {product.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                          Rp {product.price.toLocaleString('id-ID')}
                        </div>
                        <button className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 sticky top-24"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-5">Aksi Cepat</h3>
              <div className="space-y-3">
                <button
                  onClick={handleVisit}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
                >
                  <Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                  Catat Kunjungan
                </button>
                
                <a
                  href={`https://wa.me/${umkmData.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Chat WhatsApp
                </a>
                
                <a
                  href={umkmData.mapsLink ? umkmData.mapsLink : `https://maps.google.com/?q=${encodeURIComponent(umkmData.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
                >
                  <MapPin className="w-5 h-5 group-hover:bounce transition-transform" />
                  Buka di Maps
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}