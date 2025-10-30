"use client";

// React and Hooks
import React, { useState, useEffect, useRef } from 'react';

// Leaflet Map
import 'leaflet/dist/leaflet.css';
import "./leaflet-custom.css";

// Animation
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import { 
  MapPin, Star, Navigation, Phone, Clock, 
  ShoppingBag, X, ChevronRight, Filter, Search,
  TrendingUp, Heart, Share2, MessageCircle, Loader
} from 'lucide-react';

// Types
import type { UMKMLocation } from './types';

// Import MapComponent directly
import MapboxComponent from './map/MapboxComponent';

// Loading component for Suspense
const MapLoading = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
      <p className="text-gray-600">Memuat peta...</p>
    </div>
  </div>
);

// Sample UMKM data
const umkmData: UMKMLocation[] = [
  {
    id: "1",
    name: "Warung Makan Bu Siti",
    category: "Kuliner",
    rating: 4.8,
    reviews: 245,
    distance: 0.5,
    address: "Jl. Merdeka No. 123, Jakarta Pusat",
    phone: "+62 812-3456-7890",
    openHours: "08:00 - 22:00",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    lat: -6.2088,
    lng: 106.8456,
    verified: true,
    description: "Warung makan tradisional dengan menu nusantara yang lezat dan harga terjangkau",
    placeId: undefined,
    products: [
      { id: "p1", name: "Nasi Goreng Spesial", price: 25000, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&h=200&fit=crop", stock: 50 },
      { id: "p2", name: "Ayam Bakar", price: 35000, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&h=200&fit=crop", stock: 30 },
      { id: "p3", name: "Soto Ayam", price: 20000, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&h=200&fit=crop", stock: 40 },
    ]
  },
  {
    id: "2",
    name: "Batik Nusantara",
    category: "Fashion",
    rating: 4.9,
    reviews: 189,
    distance: 1.2,
    address: "Jl. Sudirman No. 45, Jakarta Selatan",
    phone: "+62 813-9876-5432",
    openHours: "09:00 - 21:00",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=300&fit=crop",
    lat: -6.2185,
    lng: 106.8426,
    verified: true,
    description: "Koleksi batik modern dan tradisional berkualitas tinggi",
    placeId: undefined,
    products: [
      { id: "p4", name: "Kemeja Batik Pria", price: 250000, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=200&fit=crop", stock: 25 },
      { id: "p5", name: "Dress Batik Wanita", price: 350000, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop", stock: 15 },
    ]
  },
  {
    id: "3",
    name: "Kerajinan Kayu Jati",
    category: "Kerajinan",
    rating: 4.7,
    reviews: 156,
    distance: 2.1,
    address: "Jl. Gatot Subroto No. 78, Jakarta Barat",
    phone: "+62 821-5555-4444",
    openHours: "08:00 - 18:00",
    image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&h=300&fit=crop",
    lat: -6.2114,
    lng: 106.8294,
    verified: true,
    description: "Kerajinan tangan dari kayu jati berkualitas dengan desain unik",
    placeId: undefined,
    products: [
      { id: "p6", name: "Meja Kayu Jati", price: 1500000, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop", stock: 10 },
      { id: "p7", name: "Kursi Minimalis", price: 750000, image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200&h=200&fit=crop", stock: 20 },
    ]
  },
  {
    id: "4",
    name: "Kopi Nusantara",
    category: "Kuliner",
    rating: 4.6,
    reviews: 312,
    distance: 0.8,
    address: "Jl. Thamrin No. 12, Jakarta Pusat",
    phone: "+62 822-7777-8888",
    openHours: "07:00 - 23:00",
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop",
    lat: -6.1944,
    lng: 106.8229,
    verified: true,
    description: "Kedai kopi dengan biji kopi pilihan dari berbagai daerah Indonesia",
    placeId: undefined,
    products: [
      { id: "p8", name: "Kopi Gayo Premium", price: 45000, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&h=200&fit=crop", stock: 100 },
      { id: "p9", name: "Kopi Toraja", price: 50000, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop", stock: 80 },
    ]
  },
];

export default function RumahUMKM() {
  const [selectedUMKM, setSelectedUMKM] = useState<UMKMLocation | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([-6.2088, 106.8456]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);

  const categories = ["Semua", "Kuliner", "Fashion", "Kerajinan", "Teknologi"];

  // Ensure client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get user location
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          console.log('User location:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("Using default location (Jakarta):", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }, []);

  // Filter UMKM
  const filteredUMKM = umkmData.filter((umkm) => {
    const matchesSearch = umkm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         umkm.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || umkm.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.header 
        className="bg-white shadow-lg sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Rumah UMKM
              </h1>
              <p className="text-gray-600 text-sm mt-1">Temukan UMKM terdekat di sekitar Anda</p>
            </div>
            <motion.button
              className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari UMKM, kategori, atau produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Category Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 mt-4 flex-wrap">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full font-semibold transition-all ${
                        selectedCategory === cat
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                          : "bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* UMKM List */}
          <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {filteredUMKM.length} UMKM Ditemukan
              </h2>
            </div>

            {filteredUMKM.map((umkm, index) => (
              <motion.div
                key={umkm.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all ${
                  selectedUMKM?.id === umkm.id ? "ring-4 ring-purple-500" : "hover:shadow-xl"
                }`}
                onClick={() => setSelectedUMKM(umkm)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative h-48">
                  <img 
                    src={umkm.image} 
                    alt={umkm.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {umkm.verified && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        ✓ Verified
                      </span>
                    )}
                    <motion.button
                      className={`p-2 rounded-full ${favorites.has(umkm.id) ? 'bg-red-500' : 'bg-white'} shadow-lg`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(umkm.id);
                      }}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(umkm.id) ? 'text-white fill-white' : 'text-red-500'}`} />
                    </motion.button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {umkm.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{umkm.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-800">{umkm.rating}</span>
                    </div>
                    <span className="text-gray-500 text-sm">({umkm.reviews} reviews)</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <Navigation className="w-4 h-4" />
                    <span>{umkm.distance} km dari lokasi Anda</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{umkm.openHours}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-600">{umkm.products.length} Produk</span>
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ height: 'calc(100vh - 250px)', minHeight: '500px', width: '100%' }}
            >
              {isClient && (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <MapboxComponent 
                    center={userLocation}
                    umkmLocations={filteredUMKM}
                    selectedUMKM={selectedUMKM}
                    onSelectUMKM={setSelectedUMKM}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedUMKM && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUMKM(null)}
          >
            <motion.div
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Image */}
              <div className="relative h-64">
                <img 
                  src={selectedUMKM.image} 
                  alt={selectedUMKM.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x300?text=No+Image';
                  }}
                />
                <button
                  onClick={() => setSelectedUMKM(null)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold">
                    {selectedUMKM.category}
                  </span>
                  <div className="flex gap-2">
                    <motion.button
                      className="p-3 bg-white rounded-full shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="w-5 h-5 text-purple-600" />
                    </motion.button>
                    <motion.button
                      className={`p-3 rounded-full shadow-lg ${favorites.has(selectedUMKM.id) ? 'bg-red-500' : 'bg-white'}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleFavorite(selectedUMKM.id)}
                    >
                      <Heart className={`w-5 h-5 ${favorites.has(selectedUMKM.id) ? 'text-white fill-white' : 'text-red-500'}`} />
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Title & Rating */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-3xl font-bold text-gray-800">{selectedUMKM.name}</h2>
                    {selectedUMKM.verified && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xl font-bold">{selectedUMKM.rating}</span>
                      <span className="text-gray-600">({selectedUMKM.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span>Populer</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{selectedUMKM.description}</p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl">
                    <MapPin className="w-6 h-6 text-purple-600 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Alamat</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedUMKM.address}</p>
                    <p className="text-sm text-purple-600 mt-1">{selectedUMKM.distance} km</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                    <Phone className="w-6 h-6 text-green-600 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Telepon</p>
                    <p className="font-semibold text-gray-800">{selectedUMKM.phone}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl">
                    <Clock className="w-6 h-6 text-orange-600 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Jam Buka</p>
                    <p className="font-semibold text-gray-800">{selectedUMKM.openHours}</p>
                  </div>
                </div>

                {/* Products */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <ShoppingBag className="w-6 h-6 text-purple-600" />
                      Produk Tersedia
                    </h3>
                    <span className="text-sm text-gray-600">{selectedUMKM.products.length} produk</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedUMKM.products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-purple-500 transition-all cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-32 object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image';
                          }}
                        />
                        <div className="p-3">
                          <h4 className="font-semibold text-gray-800 text-sm mb-1">{product.name}</h4>
                          <p className="text-purple-600 font-bold mb-1">
                            Rp {product.price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-gray-600">Stok: {product.stock}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open(`tel:${selectedUMKM.phone}`)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Hubungi Penjual
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-white border-2 border-purple-600 text-purple-600 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedUMKM.lat},${selectedUMKM.lng}`, '_blank')}
                  >
                    <Navigation className="w-5 h-5" />
                    Petunjuk Arah
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}