"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Tag, Clock, MapPin, Star, Gift, Percent, Zap } from "lucide-react";
import { db } from "../../src/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface PromoItem {
  id: string;
  title: string;
  description: string;
  discount: string;
  originalPrice?: number;
  discountedPrice?: number;
  validUntil: Date;
  umkmName: string;
  umkmId: string;
  category: string;
  image: string;
  isFlashSale?: boolean;
  isNew?: boolean;
  distance?: string;
}

export default function PromoPage() {
  const [loading, setLoading] = useState(true);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchPromos = async () => {
      setLoading(true);
      try {
        const promosList: PromoItem[] = [];
        
        // Fetch products with discount (persentase_diskon exists and > 0)
        const productsSnap = await getDocs(collection(db, "products"));
        productsSnap.docs.forEach((d) => {
          const p = d.data();
          const discount = p.persentase_diskon;
          
          if (discount && discount > 0) {
            const originalPrice = p.harga_awal || 0;
            const discountedPrice = p.harga_final || p.harga_produk || 0;
            
            promosList.push({
              id: d.id,
              title: `Diskon ${discount}% ${p.nama_produk || 'Produk'}`,
              description: p.deskripsi_produk || "Produk dengan harga spesial",
              discount: `${discount}% OFF`,
              originalPrice,
              discountedPrice,
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              umkmName: p.toko || "UMKM",
              umkmId: p.storeId || "unknown",
              category: p.kategori || "Lainnya",
              image: p.gambar_produk || "/api/placeholder/300/200",
              isFlashSale: discount >= 20,
              isNew: false,
              distance: "N/A"
            });
          }
        });
        
        setPromos(promosList);
      } catch (err) {
        console.error("Error fetching promos:", err);
        // Fallback mock data
        setPromos([
          {
            id: "1",
            title: "Diskon Spesial",
            description: "Produk pilihan dengan harga terbaik",
            discount: "20% OFF",
            originalPrice: 50000,
            discountedPrice: 40000,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            umkmName: "UMKM Lokal",
            umkmId: "1",
            category: "Lainnya",
            image: "/api/placeholder/300/200"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPromos();
  }, []);

  const filteredPromos = promos.filter(promo => 
    selectedCategory === "all" || promo.category.toLowerCase() === selectedCategory
  );

  const getTimeRemaining = (validUntil: Date) => {
    const now = new Date();
    const diff = validUntil.getTime() - now.getTime();
    
    if (diff <= 0) return "Berakhir";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} hari lagi`;
    return `${hours} jam lagi`;
  };

  const handlePromoClick = (promo: PromoItem) => {
    window.location.href = `/umkm/${promo.umkmId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600">Memuat promo...</div>
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
            onClick={() => window.location.href = "/etalase"}
            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Gift className="w-7 h-7 text-orange-600" />
              Promo & Diskon
            </h1>
            <p className="text-slate-600">Penawaran terbaik dari UMKM partner</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Semua", icon: Gift },
            { key: "makanan", label: "Makanan", icon: Tag },
            { key: "minuman", label: "Minuman", icon: Tag },
            { key: "fashion", label: "Fashion", icon: Tag },
            { key: "kerajinan", label: "Kerajinan", icon: Tag }
          ].map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category.key
                    ? "bg-orange-500 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Flash Sale Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-6 h-6" />
              <h2 className="text-xl font-bold">Flash Sale</h2>
            </div>
            <p className="text-red-100">Diskon hingga 40% untuk waktu terbatas!</p>
          </div>
          <div className="text-right">
            <div className="text-red-100 text-sm">Berakhir dalam</div>
            <div className="text-2xl font-bold">23:45:12</div>
          </div>
        </div>
      </motion.div>

      {/* Promo Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredPromos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-500 mb-2">Tidak ada promo tersedia</div>
            <div className="text-sm text-slate-400">Coba kategori lain atau kembali lagi nanti</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromos.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => handlePromoClick(promo)}
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-200 flex items-center justify-center">
                  <Tag className="w-12 h-12 text-slate-400" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {promo.isFlashSale && (
                      <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Flash Sale
                      </div>
                    )}
                    {promo.isNew && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        Baru
                      </div>
                    )}
                  </div>
                  
                  {/* Discount Badge */}
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {promo.discount}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">{promo.title}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{promo.description}</p>
                  
                  {/* Price */}
                  {promo.originalPrice && promo.discountedPrice && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-orange-600">
                        Rp {promo.discountedPrice.toLocaleString('id-ID')}
                      </span>
                      {promo.originalPrice !== promo.discountedPrice && (
                        <span className="text-sm text-slate-500 line-through">
                          Rp {promo.originalPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* UMKM Info */}
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                    <span>{promo.umkmName}</span>
                    {promo.distance && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{promo.distance}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Valid Until */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className={`${
                      getTimeRemaining(promo.validUntil).includes('jam') ? 'text-red-600 font-medium' : 'text-slate-600'
                    }`}>
                      {getTimeRemaining(promo.validUntil)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Tidak Menemukan Promo yang Dicari?</h3>
        <p className="text-slate-600 mb-4">Jelajahi lebih banyak UMKM dan temukan penawaran menarik lainnya</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/rumah-umkm"
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            Jelajahi UMKM
          </a>
          <a
            href="/etalase"
            className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            Lihat Produk
          </a>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
