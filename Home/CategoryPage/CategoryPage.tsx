"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Filter, MapPin, Star, Store, ShoppingBag, Grid, List } from "lucide-react";
import { db } from "../../src/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface CategoryItem {
  id: string;
  name: string;
  type: "umkm" | "product";
  description: string;
  rating: number;
  distance?: string;
  price?: number;
  image: string;
  store?: string;
  category: string;
}

export default function CategoryPage() {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("rating");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      const categoryParam = (window as any).CATEGORY || "Kuliner";
      setCategory(categoryParam);
      
      try {
        const results: CategoryItem[] = [];
        
        // Fetch products by category
        const productsQuery = query(
          collection(db, "products"),
          where("kategori", "==", categoryParam)
        );
        const productsDocs = await getDocs(productsQuery);
        productsDocs.docs.forEach((d) => {
          const p = d.data();
          results.push({
            id: d.id,
            name: p.nama_produk || "Produk",
            type: "product",
            description: p.deskripsi_produk || "",
            rating: p.rating_bintang || 0,
            price: p.harga_final || p.harga_produk || 0,
            store: p.toko || "",
            image: p.gambar_produk || "/api/placeholder/300/200",
            category: p.kategori || categoryParam
          });
        });
        
        // Fetch stores (if category matches)
        const storesQuery = query(collection(db, "stores"));
        const storesDocs = await getDocs(storesQuery);
        storesDocs.docs.forEach((d) => {
          const s = d.data();
          results.push({
            id: d.id,
            name: s.name || "UMKM",
            type: "umkm",
            description: s.description || "",
            rating: s.rating || 0,
            distance: "N/A",
            image: s.image || s.profileImage || "/api/placeholder/300/200",
            category: categoryParam
          });
        });
        
        setItems(results);
      } catch (err) {
        console.error("Error fetching category data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, []);

  const filteredAndSortedItems = items
    .filter(item => filterType === "all" || item.type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "distance":
          if (!a.distance || !b.distance) return 0;
          return parseFloat(a.distance) - parseFloat(b.distance);
        case "price":
          if (!a.price || !b.price) return 0;
          return a.price - b.price;
        default:
          return 0;
      }
    });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "makanan":
      case "minuman":
        return "🍽️";
      case "fashion":
        return "👕";
      case "kerajinan":
        return "🎨";
      default:
        return "🏪";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600">Memuat kategori...</div>
        </div>
      </div>
    );
  }

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
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-2xl">{getCategoryIcon(category)}</span>
              Kategori {category.charAt(0).toUpperCase() + category.slice(1)}
            </h1>
            <p className="text-slate-600">Temukan UMKM dan produk terbaik</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { key: "all", label: "Semua" },
              { key: "umkm", label: "UMKM" },
              { key: "product", label: "Produk" }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                  filterType === filter.key
                    ? "bg-orange-500 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="rating">Rating Tertinggi</option>
              <option value="distance">Terdekat</option>
              <option value="price">Harga Terendah</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-sm text-slate-600 mb-6">
          Menampilkan {filteredAndSortedItems.length} hasil
        </div>

        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-500 mb-2">Tidak ada hasil ditemukan</div>
            <div className="text-sm text-slate-400">Coba ubah filter atau kata kunci pencarian</div>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredAndSortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  viewMode === "list" ? "p-4" : "overflow-hidden"
                }`}
                onClick={() => {
                  if (item.type === "umkm") {
                    window.location.href = `/umkm/${item.id}`;
                  } else {
                    window.location.href = `/produk/${item.id}`;
                  }
                }}
              >
                {viewMode === "grid" ? (
                  <>
                    <div className="h-48 bg-slate-200 flex items-center justify-center">
                      {item.type === "umkm" ? (
                        <Store className="w-12 h-12 text-slate-400" />
                      ) : (
                        <ShoppingBag className="w-12 h-12 text-slate-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{item.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-slate-700">{item.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          item.type === "umkm" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}>
                          {item.type === "umkm" ? "UMKM" : "Produk"}
                        </span>
                        {item.distance && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{item.distance}</span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center justify-between">
                        {item.store && (
                          <div className="text-xs text-slate-500">di {item.store}</div>
                        )}
                        {item.price && (
                          <div className="text-lg font-bold text-orange-600">
                            Rp {item.price.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      {item.type === "umkm" ? (
                        <Store className="w-8 h-8 text-slate-400" />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-slate-900">{item.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-slate-700">{item.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          item.type === "umkm" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}>
                          {item.type === "umkm" ? "UMKM" : "Produk"}
                        </span>
                        {item.distance && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{item.distance}</span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-slate-600 text-sm mb-2 line-clamp-1">{item.description}</p>
                      
                      <div className="flex items-center justify-between">
                        {item.store && (
                          <div className="text-xs text-slate-500">di {item.store}</div>
                        )}
                        {item.price && (
                          <div className="text-lg font-bold text-orange-600">
                            Rp {item.price.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
}
