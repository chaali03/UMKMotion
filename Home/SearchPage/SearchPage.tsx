"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Store, ArrowLeft } from "lucide-react";
import { db } from "../../src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Product } from "../../src/components/Etalase/FetchData";
import { ProductCard } from "../../src/components/Etalase/FetchData";

type SearchResult =
  | {
      id: string;
      type: "product";
      product: Product;
    }
  | {
      id: string;
      type: "umkm";
      name: string;
      category: string;
      description: string;
      rating: number;
      distance?: string;
      image: string;
    };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "umkm" | "product">("all");

  useEffect(() => {
    // Get query from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    const initial = (searchQuery || '').trim();
    setQuery(initial);
    // Jika tidak ada q di URL, kita tetap load semua produk/UMKM
    performSearch(initial);
  }, []);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    
    try {
      const searchLower = searchQuery.toLowerCase();
      const results: SearchResult[] = [];
      
      const productsSnap = await getDocs(collection(db, "products"));
      productsSnap.docs.forEach((d) => {
        const raw = d.data() as any;
        const name = (raw.nama_produk || "").toLowerCase();
        const desc = (raw.deskripsi_produk || "").toLowerCase();
        const cat = (raw.kategori || "").toLowerCase();
        
        if (name.includes(searchLower) || desc.includes(searchLower) || cat.includes(searchLower)) {
          const product: Product = {
            ASIN: d.id,
            nama_produk: raw.nama_produk || "Produk",
            merek_produk: raw.merek_produk || "",
            kategori: raw.kategori || "Lainnya",
            harga_produk: raw.harga_produk || raw.harga_final || 0,
            gambar_produk: raw.gambar_produk || raw.thumbnail_produk || "/asset/placeholder/product.webp",
            thumbnail_produk: raw.thumbnail_produk || raw.gambar_produk || "/asset/placeholder/product.webp",
            toko: raw.toko || "",
            deskripsi_produk: raw.deskripsi_produk || "",
            rating_bintang: raw.rating_bintang ?? null,
            unit_terjual: raw.unit_terjual ?? raw.terjual ?? null,
            persentase_diskon: raw.persentase_diskon ?? null,
            harga_asli: raw.harga_asli ?? raw.harga_final ?? null,
            tags: raw.tags,
            likes: raw.likes,
            interactions: raw.interactions,
            discount: raw.discount,
            product_price: raw.product_price,
            ulasan: Array.isArray(raw.ulasan) ? raw.ulasan : undefined,
          };

          results.push({
            id: d.id,
            type: "product",
            product,
          });
        }
      });
      
      const storesSnap = await getDocs(collection(db, "stores"));
      storesSnap.docs.forEach((d) => {
        const s = d.data();
        const name = (s.name || "").toLowerCase();
        const desc = (s.description || "").toLowerCase();
        
        if (name.includes(searchLower) || desc.includes(searchLower)) {
          results.push({
            id: d.id,
            type: "umkm",
            name: s.name || "UMKM",
            category: s.category || "Lainnya",
            description: s.description || "",
            rating: s.rating || 0,
            distance: "N/A",
            image: s.image || s.profileImage || "/api/placeholder/200/150",
          });
        }
      });
      
      setResults(results);
    } catch (err) {
      console.error("Error searching:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
      // Update URL
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const filteredResults = results.filter(result => 
    filter === "all" || result.type === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Hasil Pencarian</h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari UMKM atau produk..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {([
            { key: "all", label: "Semua" },
            { key: "product", label: "Produk" },
            { key: "umkm", label: "UMKM" },
          ] as { key: "all" | "product" | "umkm"; label: string }[]).map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                filter === filterOption.key
                  ? "bg-orange-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-slate-600">Mencari...</div>
            </div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-500 mb-2">Tidak ada hasil untuk "{query}"</div>
            <div className="text-sm text-slate-400">Coba kata kunci yang berbeda</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-slate-600 mb-4">
              Ditemukan {filteredResults.length} hasil untuk "{query}"
            </div>
            
            {filteredResults.map((result, index) => (
              result.type === "product" ? (
                <ProductCard
                  key={result.id}
                  image={result.product.thumbnail_produk || result.product.gambar_produk || "/asset/placeholder/product.webp"}
                  shortTitle={
                    result.product.nama_produk.length > 50
                      ? result.product.nama_produk.slice(0, 47) + "..."
                      : result.product.nama_produk
                  }
                  price={
                    (result.product as any).product_price ||
                    `Rp ${result.product.harga_produk.toLocaleString("id-ID")}`
                  }
                  rating={
                    result.product.rating_bintang
                      ? "★★★★★" // teks tidak dipakai langsung, ProductCard hitung ulang rating visualnya sendiri
                      : "☆☆☆☆☆"
                  }
                  sold={
                    typeof result.product.unit_terjual === "number"
                      ? `${result.product.unit_terjual.toLocaleString("id-ID")} terjual`
                      : "0 terjual"
                  }
                  seller={result.product.toko}
                  discount={
                    result.product.persentase_diskon && result.product.persentase_diskon > 0
                      ? `${result.product.persentase_diskon}%`
                      : "0%"
                  }
                  product={result.product}
                  // Di SearchPage: klik kartu atau tombol dalam kartu selalu arah ke /login
                  onProductClick={() => {
                    window.location.href = "/login";
                  }}
                  isLoggedIn={false}
                  showToast={() => {}}
                />
              ) : (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    window.location.href = `/umkm/${result.id}`;
                  }}
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                      {result.image ? (
                        <img
                          src={result.image}
                          alt={result.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{result.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                            <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-medium text-[11px]">
                              UMKM
                            </span>
                            {result.category && (
                              <>
                                <span>•</span>
                                <span>{result.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span>{result.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {result.description && (
                        <p className="text-slate-600 text-xs sm:text-sm mb-2 line-clamp-2">
                          {result.description}
                        </p>
                      )}

                      {result.distance && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          <span>{result.distance}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
}
