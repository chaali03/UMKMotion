"use client";

// React and Hooks
import React, { useState, useEffect, useRef } from 'react';

// Leaflet Map
import 'leaflet/dist/leaflet.css';
import "./leaflet-custom.css";

// Animation
import { motion, AnimatePresence } from 'framer-motion';

// Components
import HomeHeader from '@/LandingPage/components/header/header';

// Icons
import { 
  MapPin, Star, Navigation, Phone, Clock, 
  ShoppingBag, X, ChevronRight, Filter, Search,
  TrendingUp, Heart, Share2, MessageCircle, Loader,
  Menu, ChevronLeft, ChevronDown, ChevronUp,
  Compass, MapPinned, Route, Car, Footprints as Walk, Bike,
  Info, Image as ImageIcon, ExternalLink, Copy,
  Zap, Award, Users, Eye, ArrowLeft, Home,
  CheckCircle, AlertCircle, Circle, Store,
  Maximize2, Minimize2
} from 'lucide-react';

// Types
import type { UMKMLocation } from './types';

// Import MapComponent directly
import MapboxComponent from './map/MapboxComponent';

// Loading component for Suspense
const MapLoading = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <Loader className="animate-spin h-8 w-8 md:h-12 md:w-12 text-purple-600 mx-auto mb-2 md:mb-4" />
      <p className="text-sm md:text-base text-gray-600">Memuat peta...</p>
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
    isOpen: true,
    placeId: undefined,
    products: [
      { id: "p1", name: "Nasi Goreng Spesial", price: 25000, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&h=200&fit=crop", stock: 50 },
      { id: "p2", name: "Ayam Bakar", price: 35000, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&h=200&fit=crop", stock: 30 },
      { id: "p3", name: "Soto Ayam", price: 20000, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&h=200&fit=crop", stock: 40 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
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
    isOpen: true,
    placeId: undefined,
    products: [
      { id: "p4", name: "Kemeja Batik Pria", price: 250000, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=200&fit=crop", stock: 25 },
      { id: "p5", name: "Dress Batik Wanita", price: 350000, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop", stock: 15 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=300&fit=crop",
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
    isOpen: false,
    placeId: undefined,
    products: [
      { id: "p6", name: "Meja Kayu Jati", price: 1500000, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop", stock: 10 },
      { id: "p7", name: "Kursi Minimalis", price: 750000, image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200&h=200&fit=crop", stock: 20 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&h=300&fit=crop",
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
    isOpen: true,
    placeId: undefined,
    products: [
      { id: "p8", name: "Kopi Gayo Premium", price: 45000, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&h=200&fit=crop", stock: 100 },
      { id: "p9", name: "Kopi Toraja", price: 50000, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop", stock: 80 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=300&fit=crop",
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
  const [showSidebar, setShowSidebar] = useState(false); // Default false di mobile
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'directions'>('list');
  const [selectedRoute, setSelectedRoute] = useState<'car' | 'walk' | 'bike'>('car');
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview');
  const [showMap, setShowMap] = useState(false); // State for map visibility

  const categories = [
    { id: "Semua", icon: Store, color: "purple" },
    { id: "Kuliner", icon: ShoppingBag, color: "red" },
    { id: "Fashion", icon: Award, color: "pink" },
    { id: "Kerajinan", icon: Zap, color: "orange" },
  ];

  // Ensure client-side only
  useEffect(() => {
    setIsClient(true);
    // Set sidebar visibility based on screen size
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Close sidebar when selecting UMKM on mobile
  useEffect(() => {
    if (selectedUMKM && window.innerWidth < 1024) {
      setShowSidebar(true);
    }
  }, [selectedUMKM]);

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

  // Add theme state
  const [localTheme, setLocalTheme] = useState<"light" | "dark">("light");

  // Calculate estimated time based on distance and route type
  const calculateTime = (distance: number, routeType: 'car' | 'walk' | 'bike') => {
    const speeds = { car: 40, walk: 5, bike: 15 }; // km/h
    const hours = distance / speeds[routeType];
    const minutes = Math.round(hours * 60);
    if (minutes < 60) return `${minutes} mnt`;
    return `${Math.floor(minutes / 60)} jam ${minutes % 60} mnt`;
  };

  const handleSelectUMKM = (umkm: UMKMLocation) => {
    setSelectedUMKM(umkm);
    setViewMode('detail');
    setShowSidebar(true);
  };

  const handleStartNavigation = () => {
    setViewMode('directions');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedUMKM(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 relative">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 z-20 relative">
        <HomeHeader 
          localTheme={localTheme}
          setLocalTheme={setLocalTheme}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex relative overflow-hidden z-10">
        
        {/* Sidebar Panel - Responsive */}
        <AnimatePresence>
          {showSidebar && (
            <>
              {/* Backdrop for mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSidebar(false)}
                className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              />
              
              <motion.div
                initial={{ x: -400 }}
                animate={{ x: 0 }}
                exit={{ x: -400 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed lg:relative left-0 top-0 bottom-0 w-full sm:w-[90%] md:w-[400px] lg:w-[420px] bg-white shadow-2xl z-30 flex flex-col"
              >
                {/* Search Header */}
                <div className="flex-shrink-0 p-3 md:p-4 border-b bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    {viewMode !== 'list' && (
                      <motion.button
                        onClick={handleBackToList}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </motion.button>
                    )}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                      <input
                        type="text"
                        placeholder="Cari UMKM terdekat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base rounded-lg bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
                      />
                    </div>
                    <motion.button
                      onClick={() => setShowSidebar(false)}
                      className="lg:hidden p-2 hover:bg-gray-100 rounded-full touch-manipulation"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Category Chips */}
                  <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-1 px-1">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <motion.button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium whitespace-nowrap transition-all text-sm md:text-base touch-manipulation ${
                            selectedCategory === cat.id
                              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span className="text-xs md:text-sm">{cat.id}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {viewMode === 'list' && (
                    <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm md:text-base font-semibold text-gray-800">
                          {filteredUMKM.length} UMKM Ditemukan
                        </h3>
                        <span className="text-xs md:text-sm text-gray-500">Terdekat</span>
                      </div>

                      {filteredUMKM.map((umkm, index) => (
                        <motion.div
                          key={umkm.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSelectUMKM(umkm)}
                          className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:shadow-lg transition-all group active:scale-98 touch-manipulation"
                        >
                          <div className="flex gap-3">
                            <div className="relative flex-shrink-0">
                              <img 
                                src={umkm.image} 
                                alt={umkm.name}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                                }}
                              />
                              {umkm.verified && (
                                <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                                  <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-sm md:text-base font-semibold text-gray-800 truncate group-hover:text-purple-600 transition-colors">
                                  {umkm.name}
                                </h4>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(umkm.id);
                                  }}
                                  className="flex-shrink-0 touch-manipulation p-1"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Heart className={`w-4 h-4 ${favorites.has(umkm.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                                </motion.button>
                              </div>

                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs md:text-sm font-medium">{umkm.rating}</span>
                                </div>
                                <span className="text-xs text-gray-500">({umkm.reviews})</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs md:text-sm text-gray-600 truncate">{umkm.category}</span>
                              </div>

                              <div className="flex items-center gap-3 md:gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Navigation className="w-3 h-3" />
                                  <span>{umkm.distance} km</span>
                                </div>
                                {umkm.isOpen !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <Circle className={`w-1.5 h-1.5 ${umkm.isOpen ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} />
                                    <span className={umkm.isOpen ? 'text-green-600' : 'text-red-600'}>
                                      {umkm.isOpen ? 'Buka' : 'Tutup'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {viewMode === 'detail' && selectedUMKM && (
                    <div>
                      {/* Image Gallery */}
                      <div className="relative h-40 md:h-48 lg:h-56 bg-gray-200">
                        <img 
                          src={selectedUMKM.image} 
                          alt={selectedUMKM.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                          }}
                        />
                        {selectedUMKM.photos && selectedUMKM.photos.length > 1 && (
                          <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 bg-black/70 backdrop-blur-sm text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 md:w-4 md:h-4" />
                            {selectedUMKM.photos.length} Foto
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-3 md:p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 pr-2">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-1">
                              {selectedUMKM.name}
                            </h2>
                            <span className="inline-block px-2 md:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm font-medium">
                              {selectedUMKM.category}
                            </span>
                          </div>
                          {selectedUMKM.verified && (
                            <div className="bg-blue-500 text-white px-2 md:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0">
                              <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              <span className="hidden sm:inline">Verified</span>
                              <span className="sm:hidden">✓</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 pb-3 md:pb-4 border-b">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                            <span className="text-lg md:text-xl font-bold">{selectedUMKM.rating}</span>
                          </div>
                          <button className="text-purple-600 hover:underline font-medium text-xs md:text-sm">
                            {selectedUMKM.reviews} reviews
                          </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <motion.button
                            onClick={handleStartNavigation}
                            className="flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors touch-manipulation"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center">
                              <Navigation className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">Rute</span>
                          </motion.button>

                          <motion.button
                            onClick={() => window.open(`tel:${selectedUMKM.phone}`)}
                            className="flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors touch-manipulation"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600 rounded-full flex items-center justify-center">
                              <Phone className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">Telepon</span>
                          </motion.button>

                          <motion.button
                            className="flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors touch-manipulation"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <Share2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">Bagikan</span>
                          </motion.button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-3 md:gap-4 mb-3 md:mb-4 border-b overflow-x-auto hide-scrollbar">
                          {(['overview', 'reviews', 'photos'] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`pb-2 font-medium transition-colors capitalize text-sm md:text-base whitespace-nowrap touch-manipulation ${
                                activeTab === tab
                                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'overview' && (
                          <div className="space-y-3 md:space-y-4">
                            <div>
                              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">{selectedUMKM.description}</p>
                            </div>

                            <div className="space-y-2 md:space-y-3">
                              <div className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 bg-gray-50 rounded-lg">
                                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs md:text-sm font-medium text-gray-800 mb-1">Alamat</p>
                                  <p className="text-xs md:text-sm text-gray-600 break-words">{selectedUMKM.address}</p>
                                  <p className="text-xs md:text-sm text-purple-600 mt-1">{selectedUMKM.distance} km dari Anda</p>
                                </div>
                                <button className="text-purple-600 hover:text-purple-700 flex-shrink-0 touch-manipulation p-1">
                                  <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </button>
                              </div>

                              <div className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 bg-gray-50 rounded-lg">
                                <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs md:text-sm font-medium text-gray-800 mb-1">Jam Operasional</p>
                                  <p className="text-xs md:text-sm text-gray-600">{selectedUMKM.openHours}</p>
                                  {selectedUMKM.isOpen !== undefined && (
                                    <p className={`text-xs md:text-sm mt-1 font-medium ${selectedUMKM.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                      {selectedUMKM.isOpen ? '● Buka sekarang' : '● Tutup'}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 bg-gray-50 rounded-lg">
                                <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs md:text-sm font-medium text-gray-800 mb-1">Telepon</p>
                                  <p className="text-xs md:text-sm text-gray-600 break-all">{selectedUMKM.phone}</p>
                                </div>
                                <button 
                                  onClick={() => window.open(`tel:${selectedUMKM.phone}`)}
                                  className="text-purple-600 hover:text-purple-700 flex-shrink-0 touch-manipulation p-1"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Products */}
                            {selectedUMKM.products && selectedUMKM.products.length > 0 && (
                              <div className="mt-4 md:mt-6">
                                <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-2 md:mb-3 flex items-center gap-2">
                                  <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                                  Produk ({selectedUMKM.products.length})
                                </h3>
                                <div className="grid grid-cols-2 gap-2 md:gap-3">
                                  {selectedUMKM.products.slice(0, 4).map((product) => (
                                    <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow touch-manipulation">
                                      <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-full h-20 md:h-24 object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image';
                                        }}
                                      />
                                      <div className="p-2">
                                        <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                        <p className="text-xs md:text-sm text-purple-600 font-semibold">
                                          Rp {product.price.toLocaleString('id-ID')}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {selectedUMKM.products.length > 4 && (
                                  <button className="w-full mt-2 md:mt-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium text-xs md:text-sm transition-colors touch-manipulation">
                                    Lihat Semua Produk →
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'reviews' && (
                          <div className="text-center py-6 md:py-8 text-gray-500">
                            <Users className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm md:text-base">Reviews akan segera hadir</p>
                          </div>
                        )}

                        {activeTab === 'photos' && (
                          <div className="grid grid-cols-2 gap-2">
                            {selectedUMKM.photos?.map((photo: string, idx: number) => (
                              <img 
                                key={idx}
                                src={photo} 
                                alt={`${selectedUMKM.name} ${idx + 1}`}
                                className="w-full h-24 md:h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity touch-manipulation"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image';
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {viewMode === 'directions' && selectedUMKM && (
                    <div className="p-3 md:p-4">
                      <div className="mb-4 md:mb-6">
                        <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3 md:mb-4">Pilih Moda Transportasi</h3>
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                          {(['car', 'walk', 'bike'] as const).map((mode) => {
                            const icons = { car: Car, walk: Walk, bike: Bike };
                            const labels = { car: 'Mobil', walk: 'Jalan', bike: 'Sepeda' };
                            const Icon = icons[mode];
                            
                            return (
                              <motion.button
                                key={mode}
                                onClick={() => setSelectedRoute(mode)}
                                className={`p-3 md:p-4 rounded-xl border-2 transition-all touch-manipulation ${
                                  selectedRoute === mode
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Icon className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-1.5 md:mb-2 ${
                                  selectedRoute === mode ? 'text-purple-600' : 'text-gray-600'
                                }`} />
                                <p className={`text-xs md:text-sm font-medium ${
                                  selectedRoute === mode ? 'text-purple-600' : 'text-gray-600'
                                }`}>
                                  {labels[mode]}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 md:mt-1">
                                  {calculateTime(selectedUMKM.distance, mode)}
                                </p>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-3 md:p-4 mb-3 md:mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs md:text-sm opacity-90">Jarak</p>
                            <p className="text-xl md:text-2xl font-bold">{selectedUMKM.distance} km</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs md:text-sm opacity-90">Estimasi Waktu</p>
                            <p className="text-xl md:text-2xl font-bold">
                              {calculateTime(selectedUMKM.distance, selectedRoute)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                        <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-green-50 rounded-lg">
                          <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-600 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-800">Lokasi Anda</p>
                            <p className="text-xs text-gray-600">Titik awal</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-red-50 rounded-lg">
                          <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-600 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{selectedUMKM.name}</p>
                            <p className="text-xs text-gray-600 truncate">{selectedUMKM.address}</p>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${selectedUMKM.lat},${selectedUMKM.lng}&travelmode=${selectedRoute === 'car' ? 'driving' : selectedRoute === 'walk' ? 'walking' : 'bicycling'}`,
                            '_blank'
                          );
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg flex items-center justify-center gap-2 touch-manipulation"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Navigation className="w-4 h-4 md:w-5 md:h-5" />
                        Mulai Navigasi
                      </motion.button>

                      <p className="text-xs text-gray-500 text-center mt-2 md:mt-3">
                        Akan membuka di Google Maps
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Map Container - Full Size */}
        <div className="flex-1 relative z-0">
          {isClient && (
            <MapboxComponent 
              center={userLocation}
              umkmLocations={filteredUMKM}
              selectedUMKM={selectedUMKM}
              onSelectUMKM={handleSelectUMKM}
            />
          )}

          {/* Floating Controls */}
          <div className="absolute top-2 md:top-4 left-2 md:left-4 z-30 flex flex-col gap-2">
            <motion.button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 md:p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors touch-manipulation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            </motion.button>
          </div>

          {/* Compass Button */}
          <div className="absolute top-2 md:top-4 right-2 md:right-4 z-30">
            <motion.button
              className="p-2 md:p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors touch-manipulation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                  });
                }
              }}
            >
              <Compass className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            </motion.button>
          </div>

          {/* Bottom Quick Info - Mobile Only */}
          {selectedUMKM && !showSidebar && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 z-20"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-3 md:p-4 max-w-md mx-auto">
                <div className="flex gap-3">
                  <img 
                    src={selectedUMKM.image} 
                    alt={selectedUMKM.name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm md:text-base font-bold text-gray-800 truncate mb-1">{selectedUMKM.name}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs md:text-sm font-medium">{selectedUMKM.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs md:text-sm text-gray-600">{selectedUMKM.distance} km</span>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => setShowSidebar(true)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white py-1.5 md:py-2 px-3 md:px-4 rounded-lg text-xs md:text-sm font-medium touch-manipulation"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Detail
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          handleStartNavigation();
                          setShowSidebar(true);
                        }}
                        className="flex-1 bg-white border-2 border-purple-600 text-purple-600 py-1.5 md:py-2 px-3 md:px-4 rounded-lg text-xs md:text-sm font-medium flex items-center justify-center gap-1 touch-manipulation"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Navigation className="w-3 h-3 md:w-4 md:h-4" />
                        Rute
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          .touch-manipulation {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
          @media (max-width: 640px) {
            .active\\:scale-98:active {
              transform: scale(0.98);
            }
          }
        `
      }} />
    </div>
  );
}