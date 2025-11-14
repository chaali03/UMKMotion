// components/AllReviews.tsx
import React, { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Star, MessageCircle } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyAb8ETVtNgh1hHhO_6D8Oj5ElNIMMixCuc",
  authDomain: "umkmotion-a39b9.firebaseapp.com",
  projectId: "umkmotion-a39b9",
  storageBucket: "umkmotion-a39b9.firebasestorage.app",
  messagingSenderId: "437792595769",
  appId: "1:437792595769:web:ce18f9d1cc7bba5e7d12e8"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Ulasan {
  nama: string;
  pesan: string;
  rating: number;
  tanggal: string;
  produk: string;
}

export default function AllReviews() {
  const [ulasanList, setUlasanList] = useState<Ulasan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Daftar semua kemungkinan key
  const namaKeys = ['nama', 'userName', 'pembeli', 'pengguna', 'user', 'customer', 'name', 'username', 'author', 'reviewer', 'buyer'];
  const textKeys = ['pesan', 'text', 'ulasan', 'message', 'comment', 'review', 'teks', 'isi', 'content', 'feedback', 'keterangan'];
  const ratingKeys = ['rating', 'bintang', 'stars', 'score', 'nilai'];
  const dateKeys = ['tanggal', 'waktu', 'date', 'time', 'created', 'timestamp', 'createdAt'];

  const getValue = (obj: any, keys: string[]) => {
    if (!obj) return null;
    for (const key of keys) {
      if (Object.hasOwnProperty.call(obj, key) && obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }
    return null;
  };

  const normalizeUlasan = (item: any, produkNama: string): Ulasan | null => {
    if (!item) return null;

    const rawText = getValue(item, textKeys);
    if (!rawText || typeof rawText !== 'string') return null;

    const pesan = rawText.trim();
    if (!pesan || pesan === '{}' || pesan.includes('[object Object]')) return null;

    const nama = getValue(item, namaKeys) || "Pengunjung";
    const rawRating = getValue(item, ratingKeys);
    const rating = typeof rawRating === 'number' ? Math.max(1, Math.min(5, rawRating)) : 5;
    const tanggal = getValue(item, dateKeys) || "Beberapa waktu lalu";

    return {
      nama: String(nama),
      pesan,
      rating,
      tanggal: String(tanggal),
      produk: produkNama
    };
  };

  useEffect(() => {
    const fetchAllUlasan = async () => {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(collection(db, "products"));
        const allUlasan: Ulasan[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const namaProduk = data.nama_produk || "Produk Tidak Diketahui";

          if (data.ulasan && Array.isArray(data.ulasan)) {
            data.ulasan.forEach((item) => {
              const normalized = normalizeUlasan(item, namaProduk);
              if (normalized) {  // INI YANG TADI SALAH: normalizedodni → normalized
                allUlasan.push(normalized);
              }
            });
          }
        });

        // Urutkan dari terbaru
        allUlasan.sort((a, b) => b.tanggal.localeCompare(a.tanggal, undefined, { numeric: true }));

        setUlasanList(allUlasan);
      } catch (err: any) {
        console.error("Gagal fetch ulasan:", err);
        setError(err.message || "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUlasan();
  }, []);

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={18}
          className={i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Mengambil semua ulasan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-md text-center">
          <p className="font-bold text-xl mb-2">Gagal Memuat Ulasan</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
            UMKMotion Reviews
          </h1>
          <p className="text-gray-600 mt-4 text-lg">
            Semua ulasan dari semua produk — lengkap, akurat, dan cantik
          </p>
        </div>

        {/* Total Stats */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 text-center">
          <div className="flex items-center justify-center gap-4">
            <MessageCircle className="text-emerald-500" size={36} />
            <div>
              <p className="text-gray-600 text-sm">Total Ulasan</p>
              <p className="text-5xl font-bold text-emerald-600">{ulasanList.length}</p>
            </div>
          </div>
        </div>

        {/* Daftar Ulasan */}
        <div className="space-y-6">
          {ulasanList.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-20 text-center">
              <MessageCircle size={80} className="mx-auto text-gray-300 mb-6" />
              <p className="text-gray-500 text-xl">Belum ada ulasan</p>
            </div>
          ) : (
            ulasanList.map((u, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-emerald-700">{u.nama}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {u.produk} • {u.tanggal}
                    </p>
                  </div>
                  {renderStars(u.rating)}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed italic pl-2 border-l-4 border-emerald-500">
                  "{u.pesan}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}