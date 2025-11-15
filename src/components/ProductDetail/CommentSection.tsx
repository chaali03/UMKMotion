// src/components/ProductDetail/CommentSection.tsx
'use client';

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Ulasan = {
  nama?: string;
  foto?: string;
  rating?: number;
  tanggal?: any;
  isi?: string;
  foto_produk?: string[];
  verified?: boolean;
  helpful?: number;
  isDummy?: boolean;
  dummyId?: string;
};

export default function CommentSection() {
  const [ulasanList, setUlasanList] = useState<Ulasan[]>([]);
  const [filteredList, setFilteredList] = useState<Ulasan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentASIN, setCurrentASIN] = useState<string>("");

  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterMedia, setFilterMedia] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"terbaru" | "membantu">("terbaru");

  // Form dummy
  const [dummyNama, setDummyNama] = useState("");
  const [dummyRating, setDummyRating] = useState(5);
  const [dummyIsi, setDummyIsi] = useState("");

  useEffect(() => {
    const loadProduct = () => {
      try {
        const stored = localStorage.getItem("selectedProduct");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentASIN(parsed.ASIN || "");
        }
      } catch {}
    };
    loadProduct();
    window.addEventListener("storage", loadProduct);
    return () => window.removeEventListener("storage", loadProduct);
  }, []);

  useEffect(() => {
    if (!currentASIN || !db) {
      setLoading(false);
      return;
    }

    const fetchUlasan = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "products", currentASIN));
        if (snap.exists()) {
          const raw = (snap.data()?.ulasan || []) as Ulasan[];
          const valid = raw
            .filter(u => u.isi?.trim() || u.rating)
            .map(u => ({ ...u, isDummy: false }));

          const sorted = valid.sort((a, b) => {
            const da = a.tanggal?.toDate?.() || new Date(a.tanggal || 0);
            const db = b.tanggal?.toDate?.() || new Date(b.tanggal || 0);
            return db.getTime() - da.getTime();
          });

          setUlasanList(sorted);
          setFilteredList(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUlasan();
  }, [currentASIN]);

  useEffect(() => {
    let result = [...ulasanList];
    if (filterRating) result = result.filter(u => u.rating === filterRating);
    if (filterMedia) result = result.filter(u => u.foto_produk?.length);
    if (sortBy === "membantu") result = result.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
    setFilteredList(result);
  }, [ulasanList, filterRating, filterMedia, sortBy]);

  const kirimDummy = () => {
    if (!dummyNama.trim() || dummyIsi.trim().length < 10) return;
    const baru: Ulasan = {
      nama: dummyNama.trim(),
      foto: `https://i.pravatar.cc/80?u=${Date.now()}`,
      rating: dummyRating,
      tanggal: new Date(),
      isi: dummyIsi.trim(),
      verified: true,
      isDummy: true,
      dummyId: Date.now().toString()
    };
    setUlasanList(p => [baru, ...p]);
    setDummyNama(""); setDummyIsi(""); setDummyRating(5);
  };

  const hapusDummy = (id: string) => {
    if (confirm("Hapus ulasan ini?")) {
      setUlasanList(p => p.filter(u => u.dummyId !== id));
    }
  };

  const totalRating = ulasanList.reduce((a, b) => a + (b.rating || 0), 0);
  const avgRating = ulasanList.length ? (totalRating / ulasanList.length).toFixed(1) : "0.0";
  const ratingCount = ulasanList.reduce((acc, u) => {
    acc[u.rating || 0] = (acc[u.rating || 0] || 0) + 1;
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
    } catch { return "Baru saja"; }
  };

  const renderStars = (r: number = 5) => "★★★★★".substring(0, r) + "☆☆☆☆☆".substring(r, 5);

  if (loading) return <div className="py-16 text-center text-gray-500">Memuat ulasan...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-8">Ulasan Pembeli</h2>

      {/* Form Dummy - Kompak */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-10">
        <p className="text-sm font-medium text-slate-700 mb-3">Tulis Ulasan (Demo)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text" placeholder="Nama kamu"
            value={dummyNama} onChange={e => setDummyNama(e.target.value)}
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
            disabled={!dummyNama || dummyIsi.length < 10}
            className=" linear-gradient(135deg, #ff3b30, #ff6b35) text-white px-6 py-3 rounded-lg hover:bg-[#ff6b35] disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            Kirim
          </button>
        </div>
        <textarea
          placeholder="Tulis ulasan minimal 10 karakter..."
          value={dummyIsi} onChange={e => setDummyIsi(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Rating Summary - Kecil & Clean */}
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
                  <div className="bg-[#ff6b35] h-2 rounded-full transition-all" style={{ width: `${(ratingCount[n] || 0) / maxCount * 100}%` }} />
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
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm" onChange={e => setFilterMedia(e.target.value === "media")}>
              <option value="">Semua Ulasan</option>
              <option value="media">Dengan Media</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm" onChange={e => setFilterRating(e.target.value ? +e.target.value : null)}>
              <option value="">Semua Rating</option>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Bintang</option>)}
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm" onChange={e => setSortBy(e.target.value as any)}>
              <option value="terbaru">Terbaru</option>
              <option value="membantu">Paling Membantu</option>
            </select>
          </div>

          {/* List */}
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">Belum ada ulasan yang sesuai</div>
          ) : (
            filteredList.map((u, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 transition relative">
                {u.isDummy && (
          <button onClick={() => hapusDummy(u.dummyId!)} className="absolute top-4 right-4 text-red-600 hover:text-red-700 text-sm font-medium">
            Hapus
          </button>
                )}
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow">
                    <img src={u.foto || `https://i.pravatar.cc/80?u=${i}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-800">{u.nama || "Pengguna"}</h4>
                      <span className="text-xs text-gray-500">{formatTanggal(u.tanggal)}</span>
                    </div>
                    {u.verified && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Terverifikasi</span>}
                    <div className="text-amber-500 my-2">{renderStars(u.rating || 5)}</div>
                    <p className="text-gray-700 leading-relaxed text-sm">{u.isi}</p>
                    {u.isDummy && <span className="inline-block mt-2 text-xs text-purple-600 font-medium">Demo</span>}
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