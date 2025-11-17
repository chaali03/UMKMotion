// src/components/ProductDetail/CommentSection.tsx
'use client';

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Ulasan = {
  id?: string;
  nama?: string;
  foto?: string;
  rating?: number;
  tanggal?: any;
  isi?: string;
  komentar?: string; // Field baru
  foto_produk?: string[];
  verified?: boolean;
  helpful?: number;
  isDummy?: boolean;
  dummyId?: string;
  productASIN?: string;
};

export default function CommentSection() {
  const [ulasanList, setUlasanList] = useState<Ulasan[]>([]);
  const [filteredList, setFilteredList] = useState<Ulasan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentASIN, setCurrentASIN] = useState<string>("");

  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterMedia, setFilterMedia] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"terbaru" | "membantu">("terbaru");

  // Form dummy
  const [dummyNama, setDummyNama] = useState("");
  const [dummyRating, setDummyRating] = useState(5);
  const [dummyIsi, setDummyIsi] = useState("");

  // Fungsi untuk mendapatkan product ASIN
  const getCurrentProductASIN = (): string => {
    try {
      const stored = localStorage.getItem("selectedProduct");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.ASIN) return parsed.ASIN;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const asinFromUrl = urlParams.get('asin');
      if (asinFromUrl) return asinFromUrl;

      const pathMatch = window.location.pathname.match(/\/product\/([A-Z0-9]+)/);
      if (pathMatch && pathMatch[1]) return pathMatch[1];

      return "";
    } catch (err) {
      console.error("Error getting ASIN:", err);
      return "";
    }
  };

  useEffect(() => {
    const loadProduct = () => {
      const asin = getCurrentProductASIN();
      setCurrentASIN(asin);
    };

    loadProduct();
    window.addEventListener("storage", loadProduct);
    return () => window.removeEventListener("storage", loadProduct);
  }, []);

  // Normalisasi data ulasan - handle field yang berbeda
  const normalizeUlasan = (rawData: any[]): Ulasan[] => {
    return rawData.map(item => {
      // Handle field yang berbeda: 'komentar' vs 'isi'
      const komentar = item.komentar || item.isi || "";
      
      // Handle rating yang mungkin number atau string
      const rating = typeof item.rating === 'number' ? item.rating : 
                    typeof item.rating === 'string' ? parseFloat(item.rating) : 0;
      
      // Handle tanggal dari Firestore timestamp
      let tanggal = item.tanggal;
      if (item.tanggal && typeof item.tanggal === 'object' && 
          ('_seconds' in item.tanggal || 'seconds' in item.tanggal)) {
        const seconds = item.tanggal._seconds || item.tanggal.seconds;
        const nanoseconds = item.tanggal._nanoseconds || item.tanggal.nanoseconds || 0;
        tanggal = new Date(seconds * 1000 + nanoseconds / 1000000);
      }

      return {
        id: item.id,
        nama: item.nama || "Anonymous",
        foto: item.foto || `https://i.pravatar.cc/80?u=${item.id || Math.random()}`,
        rating: Math.min(5, Math.max(1, rating)), // Clamp antara 1-5
        tanggal: tanggal,
        isi: komentar,
        komentar: komentar,
        foto_produk: item.foto_produk || [],
        verified: item.verified || false,
        helpful: item.helpful || 0,
        isDummy: false
      };
    });
  };

  // Fetch ulasan
  useEffect(() => {
    if (!currentASIN) {
      console.log("No ASIN found, waiting...");
      setLoading(false);
      return;
    }

    if (!db) {
      setError("Firebase tidak terinisialisasi");
      setLoading(false);
      return;
    }

    const fetchUlasan = async () => {
      setLoading(true);
      setError("");
      
      try {
        console.log("Fetching reviews for ASIN:", currentASIN);
        
        let ulasan: Ulasan[] = [];
        
        try {
          // Coba query dari collection reviews
          const reviewsRef = collection(db, "reviews");
          const q = query(
            reviewsRef, 
            where("productASIN", "==", currentASIN),
            orderBy("tanggal", "desc")
          );
          
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const rawData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            ulasan = normalizeUlasan(rawData);
            console.log(`Found ${ulasan.length} reviews from reviews collection`);
          }
        } catch (collectionError) {
          console.log("Reviews collection not found or error:", collectionError);
        }

        // Fallback ke document products
        if (ulasan.length === 0) {
          console.log("Trying fallback to products collection...");
          const productDoc = await getDoc(doc(db, "products", currentASIN));
          
          if (productDoc.exists()) {
            const productData = productDoc.data();
            const rawUlasan = (productData?.ulasan || productData?.reviews || []) as any[];
            
            if (rawUlasan.length > 0) {
              ulasan = normalizeUlasan(rawUlasan);
              
              // Sort by date untuk fallback data
              ulasan.sort((a, b) => {
                const dateA = a.tanggal?.toDate?.() || new Date(a.tanggal || 0);
                const dateB = b.tanggal?.toDate?.() || new Date(b.tanggal || 0);
                return dateB.getTime() - dateA.getTime();
              });
              
              console.log(`Found ${ulasan.length} reviews from products collection`);
            }
          }
        }

        // Filter hanya ulasan yang valid (punya komentar atau rating)
        ulasan = ulasan.filter(u => u.isi?.trim() || u.rating);

        setUlasanList(ulasan);
        setFilteredList(ulasan);

      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Gagal memuat ulasan. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    };

    fetchUlasan();
  }, [currentASIN]);

  // Filter dan sort ulasan
  useEffect(() => {
    let result = [...ulasanList];
    
    if (filterRating) {
      result = result.filter(u => u.rating === filterRating);
    }
    
    if (filterMedia) {
      result = result.filter(u => u.foto_produk?.length);
    }
    
    if (sortBy === "membantu") {
      result = result.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
    } else if (sortBy === "terbaru") {
      result = result.sort((a, b) => {
        const dateA = a.tanggal?.toDate?.() || new Date(a.tanggal || 0);
        const dateB = b.tanggal?.toDate?.() || new Date(b.tanggal || 0);
        return dateB.getTime() - dateA.getTime();
      });
    }
    
    setFilteredList(result);
  }, [ulasanList, filterRating, filterMedia, sortBy]);

  const kirimDummy = () => {
    if (!dummyNama.trim() || dummyIsi.trim().length < 10) {
      alert("Nama harus diisi dan ulasan minimal 10 karakter");
      return;
    }
    
    const baru: Ulasan = {
      nama: dummyNama.trim(),
      foto: `https://i.pravatar.cc/80?u=${Date.now()}`,
      rating: dummyRating,
      tanggal: new Date(),
      isi: dummyIsi.trim(),
      komentar: dummyIsi.trim(),
      verified: true,
      isDummy: true,
      dummyId: `dummy-${Date.now()}`,
      productASIN: currentASIN
    };
    
    setUlasanList(prev => [baru, ...prev]);
    setDummyNama(""); 
    setDummyIsi(""); 
    setDummyRating(5);
  };

  const hapusDummy = (id: string) => {
    if (confirm("Hapus ulasan ini?")) {
      setUlasanList(prev => prev.filter(u => u.dummyId !== id));
    }
  };

  // Hitung statistik rating
  const totalRating = ulasanList.reduce((a, b) => a + (b.rating || 0), 0);
  const avgRating = ulasanList.length ? (totalRating / ulasanList.length).toFixed(1) : "0.0";
  
  const ratingCount = ulasanList.reduce((acc, u) => {
    const rating = u.rating || 0;
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const maxCount = Math.max(...Object.values(ratingCount), 1);

  const formatTanggal = (ts: any) => {
    try {
      const d = ts?.toDate?.() || new Date(ts || Date.now());
      const diff = Date.now() - d.getTime();
      const days = Math.floor(diff / 86400000);
      if (days === 0) return "Hari ini";
      if (days < 30) return `${days} hari lalu`;
      return format(d, "dd MMM yyyy", { locale: id });
    } catch { 
      return "Baru saja"; 
    }
  };

  const renderStars = (r: number = 5) => 
    "★★★★★".slice(0, r) + "☆☆☆☆☆".slice(r);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <style>{`
          @keyframes shimmer { 0% { background-position: -1200px 0; opacity: 0.8; } 50% { opacity: 1; } 100% { background-position: 1200px 0; opacity: 0.8; } }
          .sk-line { background: linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%); background-size: 1200px 100%; animation: shimmer 1.8s ease-in-out infinite; }
          .sk-item { animation: fadeInUp 0.5s ease both; }
        `}</style>
        <div className="sk-line h-8 rounded w-1/3 mb-8" />
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <div className="sk-line h-32 rounded" style={{ animation: 'fadeInUp 0.5s ease both 0s' }} />
            <div className="space-y-3">
              {[1,2,3,4,5].map((n, i) => (
                <div key={n} className="sk-line h-4 rounded" style={{ animation: `fadeInUp 0.5s ease both ${i * 0.08}s` }} />
              ))}
            </div>
          </div>
          <div className="md:col-span-3 space-y-4">
            {[1,2,3].map((n, i) => (
              <div key={n} className="sk-line h-32 rounded" style={{ animation: `fadeInUp 0.5s ease both ${(i + 1) * 0.08}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-8">Ulasan Pembeli</h2>

      {/* ... */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form Dummy */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-10">
        <p className="text-sm font-medium text-slate-700 mb-3">Tulis Ulasan (Demo)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text" 
            placeholder="Nama kamu"
            value={dummyNama} 
            onChange={e => setDummyNama(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Rating:</span>
            <div className="flex gap-1 text-2xl">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setDummyRating(n)}>
                  <span className={n <= dummyRating ? "text-amber-500" : "text-gray-300"}>★</span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={kirimDummy}
            disabled={!dummyNama.trim() || dummyIsi.trim().length < 10}
            className="bg-gradient-to-r from-[#ff3b30] to-[#ff6b35] text-white px-6 py-3 rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            Kirim
          </button>
        </div>
        <textarea
          placeholder="Tulis ulasan minimal 10 karakter..."
          value={dummyIsi} 
          onChange={e => setDummyIsi(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Rating Summary */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <div className="text-4xl font-bold text-slate-800">{avgRating}</div>
            <div className="text-2xl text-amber-500 my-1">★★★★★</div>
            <p className="text-sm text-gray-600">{ulasanList.length} ulasan</p>
          </div>
          <div className="mt-5 space-y-3">
            {[5,4,3,2,1].map(n => (
              <div key={n} className="flex items-center gap-3 text-sm">
                <span className="w-3 text-slate-600">{n}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#ff6b35] h-2 rounded-full transition-all" 
                    style={{ width: `${((ratingCount[n] || 0) / maxCount) * 100}%` }} 
                  />
                </div>
                <span className="w-10 text-right text-gray-600">{ratingCount[n] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daftar Ulasan */}
        <div className="md:col-span-3 space-y-5">
          {/* Filter */}
          <div className="flex flex-wrap gap-3">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm" 
              onChange={e => setFilterMedia(e.target.value === "media")}
            >
              <option value="">Semua Ulasan</option>
              <option value="media">Dengan Media</option>
            </select>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm" 
              onChange={e => setFilterRating(e.target.value ? +e.target.value : null)}
            >
              <option value="">Semua Rating</option>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Bintang</option>)}
            </select>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm" 
              onChange={e => setSortBy(e.target.value as any)}
            >
              <option value="terbaru">Terbaru</option>
              <option value="membantu">Paling Membantu</option>
            </select>
          </div>

          {/* List Ulasan */}
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
              {ulasanList.length === 0 ? "Belum ada ulasan untuk produk ini" : "Tidak ada ulasan yang sesuai dengan filter"}
            </div>
          ) : (
            filteredList.map((u) => (
              <div key={u.id || u.dummyId} className="bg-white border border-gray-200 rounded-xl p-5 transition relative">
                {u.isDummy && (
                  <button 
                    onClick={() => hapusDummy(u.dummyId!)} 
                    className="absolute top-4 right-4 text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Hapus
                  </button>
                )}
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow">
                    <img 
                      src={u.foto || `https://i.pravatar.cc/80?u=${u.id}`} 
                      alt={u.nama || "User"} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-800">{u.nama || "Pengguna"}</h4>
                      <span className="text-xs text-gray-500">{formatTanggal(u.tanggal)}</span>
                    </div>
                    {u.verified && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Terverifikasi</span>
                    )}
                    <div className="text-amber-500 my-2">
                      {renderStars(u.rating || 5)}
                      <span className="ml-2 text-sm text-gray-600">{u.rating}/5</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {u.isi || u.komentar || "Tidak ada komentar"}
                    </p>
                    {u.helpful > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {u.helpful} orang merasa ini membantu
                      </div>
                    )}
                    {u.isDummy && (
                      <span className="inline-block mt-2 text-xs text-purple-600 font-medium">Demo</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}