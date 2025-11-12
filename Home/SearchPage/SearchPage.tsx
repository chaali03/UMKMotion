"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Star, ShoppingBag, Store, ArrowLeft } from "lucide-react";
import { db } from "../../src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface SearchResult {
  id: string;
  name: string;
  type: "umkm" | "product";
  category: string;
  description: string;
  rating: number;
  distance?: string;
  price?: number;
  image: string;
  store?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Get query from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, []);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    
    try {
      const searchLower = searchQuery.toLowerCase();
      const results: SearchResult[] = [];
      
      // Search products
      const productsSnap = await getDocs(collection(db, "products"));
      productsSnap.docs.forEach((d) => {
        const p = d.data();
        const name = (p.nama_produk || "").toLowerCase();
        const desc = (p.deskripsi_produk || "").toLowerCase();
        const cat = (p.kategori || "").toLowerCase();
        
        if (name.includes(searchLower) || desc.includes(searchLower) || cat.includes(searchLower)) {
          results.push({
            id: d.id,
            name: p.nama_produk || "Produk",
            type: "product",
            category: p.kategori || "Lainnya",
            description: p.deskripsi_produk || "",
            rating: p.rating_bintang || 0,
            price: p.harga_final || p.harga_produk || 0,
            store: p.toko || "",
            image: p.gambar_produk || "/api/placeholder/200/150"
          });
        }
      });
      
      // Search stores
      const storesSnap = await getDocs(collection(db, "stores"));
      storesSnap.docs.forEach((d) => {
        const s = d.data();
        const name = (s.name || "").toLowerCase();
        const desc = (s.description || "").toLowerCase();
        
        if (name.includes(searchLower) || desc.includes(searchLower)) {
          results.push({
            id: d.id,
            name: s.name || "UMKM",
            type: "umkm",
            category: s.category || "Lainnya",
            description: s.description || "",
            rating: s.rating || 0,
            distance: "N/A",
            image: s.image || s.profileImage || "/api/placeholder/200/150"
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
          {[
            { key: "all", label: "Semua" },
            { key: "umkm", label: "UMKM" },
            { key: "product", label: "Produk" }
          ].map((filterOption) => (
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
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => {
                  if (result.type === "umkm") {
                    window.location.href = `/umkm/${result.id}`;
                  } else {
                    window.location.href = `/produk/${result.id}`;
                  }
                }}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    {result.type === "umkm" ? (
                      <Store className="w-8 h-8 text-slate-400" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{result.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            result.type === "umkm" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                          }`}>
                            {result.type === "umkm" ? "UMKM" : "Produk"}
                          </span>
                          <span>•</span>
                          <span>{result.category}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-slate-700">{result.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">{result.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        {result.distance && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{result.distance}</span>
                          </div>
                        )}
                        {result.store && (
                          <div>di {result.store}</div>
                        )}
                      </div>
                      
                      {result.price && (
                        <div className="text-lg font-bold text-orange-600">
                          Rp {result.price.toLocaleString('id-ID')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
}
