"use client";

// React and Hooks
import React, { useState, useEffect, useRef } from 'react';

// Map styles
import "./mapbox-custom.css";

// Animation
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
  CheckCircle, Check, AlertCircle, Circle, Store,
  Maximize2, Minimize2, Layers, Grid3x3,
  Building2, MapIcon, LayoutGrid, List
} from 'lucide-react';

// Types
import type { UMKMLocation } from './types';

// Import lazy map components
import { LazyMapComponent, LazyMapboxComponent, withSuspense } from '@/utils/lazy-imports';

const MapComponent = withSuspense(LazyMapComponent, <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>);
const MapboxComponent = withSuspense(LazyMapboxComponent, <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>);

// Loading component for Suspense
const MapLoading = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <Loader className="animate-spin h-8 w-8 md:h-12 md:w-12 text-orange-600 mx-auto mb-2 md:mb-4" />
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
  // [lat, lon]
  const INDONESIA_CENTER: [number, number] = [-2.5, 118.0];
  const [userLocation, setUserLocation] = useState<[number, number]>(INDONESIA_CENTER);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasGeoPermission, setHasGeoPermission] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'directions'>('list');
  const [selectedRoute, setSelectedRoute] = useState<'car' | 'walk' | 'bike'>('car');
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview');
  const [showMap, setShowMap] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [outsideHandleLeft, setOutsideHandleLeft] = useState<number>(0);
  const galleryTrackRef = useRef<HTMLDivElement | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const categories = [
    { id: "Semua", icon: Store, color: "orange" },
    { id: "Kuliner", icon: ShoppingBag, color: "red" },
    { id: "Fashion", icon: Award, color: "pink" },
    { id: "Kerajinan", icon: Zap, color: "blue" },
  ];

  // Ensure client-side only
  useEffect(() => {
    setIsClient(true);
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

  // Compute outside handle position relative to the viewport (always outside the sidebar's right edge)
  useEffect(() => {
    const calc = () => {
      if (sidebarRef.current) {
        const rect = sidebarRef.current.getBoundingClientRect();
        const gap = 24; // desired gap outside the edge
        const handleWidth = 40; // px, matches w-10 on mobile
        const desired = rect.right + gap;
        const maxLeftInside = window.innerWidth - handleWidth - 12; // keep full handle visible with 12px margin
        const sidebarIsFullWidth = Math.abs(rect.right - window.innerWidth) < 2; // near full width
        const left = sidebarIsFullWidth ? maxLeftInside : Math.min(desired, maxLeftInside);
        setOutsideHandleLeft(left);
      }
    };
    calc();
    // Recalculate shortly after open animation
    if (showSidebar) {
      const id = window.setTimeout(calc, 300);
      return () => window.clearTimeout(id);
    }
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [showSidebar]);

  // Get user location (robust): quick fix, then refine; fallback to watch on error/timeout
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    // Require HTTPS or localhost for geolocation in most browsers
    const isSecureContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecureContext) {
      setUserLocation(INDONESIA_CENTER);
      setHasGeoPermission(false);
      return;
    }

    let tempWatchId: number | null = null;
    let cleared = false;

    const clearTempWatch = () => {
      if (tempWatchId != null) {
        try {
          const cw: unknown = (navigator as any)?.geolocation?.clearWatch;
          if (typeof cw === 'function') {
            (cw as (id: number) => void)(tempWatchId);
          }
        } catch {}
        tempWatchId = null;
      }
    };

    // 1) Try a fast, low-accuracy fix to place the camera quickly
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cleared) return;
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setHasGeoPermission(true);
      },
      () => {
        // 2) If it fails or times out, fall back to a temporary high-accuracy watch
        if (cleared) return;
        tempWatchId = navigator.geolocation.watchPosition(
          (p) => {
            if (cleared) return;
            setUserLocation([p.coords.latitude, p.coords.longitude]);
            setHasGeoPermission(true);
            clearTempWatch();
          },
          () => {
            // Final fallback to Indonesia center
            if (cleared) return;
            setUserLocation(INDONESIA_CENTER);
            setHasGeoPermission(false);
            clearTempWatch();
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000,
          }
        );
        // Safety stop after 12s
        window.setTimeout(() => {
          if (!cleared) {
            clearTempWatch();
          }
        }, 12000);
      },
      {
        enableHighAccuracy: false,
        timeout: 3500,
        maximumAge: 120000
      }
    );

    return () => {
      cleared = true;
      clearTempWatch();
    };
  }, []);

  useEffect(() => {
    if (selectedUMKM && window.innerWidth < 1024) {
      setShowSidebar(true);
    }
  }, [selectedUMKM]);

  // Sync gallery index with scroll position
  useEffect(() => {
    const track = galleryTrackRef.current;
    if (!track) return;
    const handler = () => {
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      setGalleryIndex(idx);
    };
    track.addEventListener('scroll', handler, { passive: true });
    return () => track.removeEventListener('scroll', handler as EventListener);
  }, [selectedUMKM]);

  // Filter UMKM
  const filteredUMKM = umkmData.filter((umkm) => {
    const matchesSearch = umkm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         umkm.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || umkm.category === selectedCategory;
    const matchesVerified = !verifiedOnly || !!umkm.verified;
    return matchesSearch && matchesCategory && matchesVerified;
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

  const [localTheme, setLocalTheme] = useState<"light" | "dark">("light");

  const calculateTime = (distance: number, routeType: 'car' | 'walk' | 'bike') => {
    const speeds = { car: 40, walk: 5, bike: 15 };
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
    <div className="relative w-full h-screen bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
      {/* Header with Glass Morphism Effect */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="container mx-auto px-4">
          <HomeHeader 
            localTheme={localTheme}
            setLocalTheme={setLocalTheme}
          />
        </div>
      </div>

      {/* Main Container - Lebih ke bawah lagi */}
      <div className="flex-1 flex relative overflow-hidden z-10 mt-16 md:mt-20 lg:mt-24 px-4 md:px-6 lg:px-8">
        
        {/* Sidebar Panel - Sheet (shadcn) */}
        <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
          <SheetContent side="left" className="w-full sm:w-[90%] md:w-[420px] lg:w-[440px] rounded-r-3xl border-r border-orange-100 overflow-hidden group">
            <div ref={sidebarRef} className="h-full flex flex-col bg-white/95 backdrop-blur-sm shadow-xl">
              {/* Search Header */}
              <div className="flex-shrink-0 p-4 md:p-5 border-b bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  {viewMode !== 'list' && (
                    <motion.button
                      onClick={handleBackToList}
                      className="p-2 hover:bg-white/80 rounded-full transition-colors touch-manipulation"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-5 h-5 text-orange-600" />
                    </motion.button>
                  )}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type="text"
                      placeholder="Cari UMKM terdekat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl bg-white border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all"
                    />
                  </div>
                  <motion.button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden p-2 hover:bg-white/80 rounded-full touch-manipulation"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5 text-gray-600" />
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
                            ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-lg shadow-orange-200'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
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
                  <div className="p-4 md:p-5 space-y-3 md:space-y-4 custom-scrollbar overflow-y-auto flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm md:text-base font-semibold bg-gradient-to-r from-orange-700 to-orange-500 bg-clip-text text-transparent">
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
                        className="bg-white border-2 border-gray-100 hover:border-orange-200 rounded-2xl p-3 cursor-pointer hover:shadow-xl transition-all group active:scale-98 touch-manipulation"
                      >
                        <div className="flex gap-3">
                          <div className="relative flex-shrink-0">
                            <img 
                              src={umkm.image} 
                              alt={umkm.name}
                              className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover ring-2 ring-orange-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                              }}
                            />
                            {/* Verified icon overlay removed per request */}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-sm md:text-base font-semibold text-gray-800 truncate group-hover:bg-gradient-to-r group-hover:from-orange-700 group-hover:to-orange-500 group-hover:bg-clip-text group-hover:text-transparent transition-all">
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
                                <Navigation className="w-3 h-3 text-orange-500" />
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
                    {/* Image Carousel */}
                    <div className="relative h-44 md:h-52 lg:h-60 bg-gradient-to-br from-orange-200 to-orange-100 overflow-hidden">
                      {(() => {
                        const slides = [
                          selectedUMKM.image,
                          ...((selectedUMKM.photos?.filter(p => p !== selectedUMKM.image)) || [])
                        ];
                        const total = slides.length;
                        return (
                          <>
                      <div
                        ref={galleryTrackRef}
                        className="h-full w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
                        style={{ WebkitOverflowScrolling: 'touch' as any }}
                      >
                        {slides.map((src, idx) => (
                          <img
                            key={idx}
                            src={src}
                            alt={`${selectedUMKM.name} ${idx + 1}`}
                            className="h-full w-full min-w-full flex-none object-cover snap-center"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x300?text=No+Image';
                            }}
                          />
                        ))}
                      </div>

                      {/* Photo count badge */}
                      {total > 1 && (
                        <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 bg-black/70 backdrop-blur-sm text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 md:w-4 md:h-4" />
                          {total} Foto
                        </div>
                      )}

                      {/* Prev/Next Controls */}
                      {total > 1 && (
                        <>
                          {(() => { const atStart = galleryIndex === 0; const atEnd = galleryIndex === total - 1; return (
                          <div className="gmap-carousel-nav z-20">
                          <button
                            aria-label="Prev"
                            className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/55 z-20 ${atStart ? 'opacity-40 cursor-not-allowed' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (atStart) return; const el = galleryTrackRef.current; if (!el) return;
                              const next = Math.max(0, galleryIndex - 1);
                              setGalleryIndex(next);
                              const left = next * el.clientWidth;
                              try { el.scrollTo({ left, behavior: 'smooth' }); } catch { el.scrollLeft = left; }
                            }}
                          >
                            ‹
                          </button>
                          <button
                            aria-label="Next"
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/55 z-20 ${atEnd ? 'opacity-40 cursor-not-allowed' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (atEnd) return; const el = galleryTrackRef.current; if (!el) return;
                              const next = Math.min(total - 1, galleryIndex + 1);
                              setGalleryIndex(next);
                              const left = next * el.clientWidth;
                              try { el.scrollTo({ left, behavior: 'smooth' }); } catch { el.scrollLeft = left; }
                            }}
                          >
                            ›
                          </button>
                          </div>
                          ); })()}
                        </>
                      )}

                      {/* Dots Indicator */}
                      {total > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                          {slides.map((_, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.preventDefault();
                                const el = galleryTrackRef.current; if (!el) return;
                                setGalleryIndex(i);
                                const left = i * el.clientWidth;
                                try { el.scrollTo({ left, behavior: 'smooth' }); } catch { el.scrollLeft = left; }
                              }}
                              className={`w-1.5 h-1.5 rounded-full ${galleryIndex === i ? 'bg-white' : 'bg-white/50'}`}
                              aria-label={`Slide ${i+1}`}
                            />
                          ))}
                        </div>
                      )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Details */}
                    <div className="p-3 md:p-4 pt-4 md:pt-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <h2 className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-700 to-orange-500 bg-clip-text text-transparent mb-2">
                            {selectedUMKM.name}
                          </h2>
                          <span className="inline-block px-2 md:px-3 py-1 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-full text-xs md:text-sm font-medium border border-orange-200">
                            {selectedUMKM.category}
                          </span>
                        </div>
                        {/* Verified pill removed per request */}
                      </div>

                      <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 border-b pb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                          <span className="text-lg md:text-xl font-bold">{selectedUMKM.rating}</span>
                        </div>
                        <button className="text-orange-600 hover:underline font-medium text-xs md:text-sm">
                          {selectedUMKM.reviews} reviews
                        </button>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <motion.button
                          onClick={handleStartNavigation}
                          className="flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl hover:shadow-md transition-all touch-manipulation border-2 border-orange-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                            <Navigation className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">Rute</span>
                        </motion.button>

                        <motion.button
                          onClick={() => window.open(`tel:${selectedUMKM.phone}`)}
                          className="flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 bg-green-50 rounded-xl hover:shadow-md transition-all touch-manipulation border-2 border-green-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600 rounded-full flex items-center justify-center shadow-md">
                            <Phone className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">Telepon</span>
                        </motion.button>

                        <motion.button
                          className="flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl hover:shadow-md transition-all touch-manipulation border-2 border-blue-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-md">
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
                            className={`pb-2 px-3 font-medium transition-all capitalize text-sm md:text-base whitespace-nowrap touch-manipulation rounded-t-lg ${
                              activeTab === tab
                                ? 'border-b-2 border-orange-500 text-orange-600'
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
                            <div className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl border border-orange-200">
                              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-medium text-gray-800 mb-1">Alamat</p>
                                <p className="text-xs md:text-sm text-gray-600 break-words">{selectedUMKM.address}</p>
                                <p className="text-xs md:text-sm text-orange-600 mt-1 font-medium">{selectedUMKM.distance} km dari Anda</p>
                              </div>
                              <button className="text-orange-600 hover:text-orange-700 flex-shrink-0 touch-manipulation p-1">
                                <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                            </div>

                            <div className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl border border-blue-200">
                              <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5" />
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

                            <div className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 bg-gray-50 rounded-xl border border-gray-200">
                              <Phone className="w-4 h-4 md:w-5 md:h-5 text-green-600 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-medium text-gray-800 mb-1">Telepon</p>
                                <p className="text-xs md:text-sm text-gray-600 break-all">{selectedUMKM.phone}</p>
                              </div>
                              <button 
                                onClick={() => window.open(`tel:${selectedUMKM.phone}`)}
                                className="text-green-600 hover:text-green-700 flex-shrink-0 touch-manipulation p-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Products */}
                          {selectedUMKM.products && selectedUMKM.products.length > 0 && (
                            <div className="mt-4 md:mt-6">
                              <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                                Produk ({selectedUMKM.products.length})
                              </h3>
                              <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {selectedUMKM.products.slice(0, 4).map((product) => (
                                  <div key={product.id} className="border-2 border-orange-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all touch-manipulation">
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
                                      <p className="text-xs md:text-sm bg-gradient-to-r from-orange-700 to-orange-500 bg-clip-text text-transparent font-bold">
                                        Rp {product.price.toLocaleString('id-ID')}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {selectedUMKM.products.length > 4 && (
                                <button className="w-full mt-2 md:mt-3 py-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white hover:shadow-md rounded-xl font-medium text-xs md:text-sm transition-all touch-manipulation">
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
                              className="w-full h-24 md:h-32 object-cover rounded-xl cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-orange-300 transition-all touch-manipulation"
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
                                  ? 'border-orange-500 bg-gradient-to-br from-orange-100 to-orange-50 shadow-md'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Icon className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-1.5 md:mb-2 ${
                                selectedRoute === mode ? 'text-orange-600' : 'text-gray-600'
                              }`} />
                              <p className={`text-xs md:text-sm font-medium ${
                                selectedRoute === mode ? 'text-orange-600' : 'text-gray-600'
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

                    <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl p-3 md:p-4 mb-3 md:mb-4 shadow-lg">
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
                      <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-600 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium text-gray-800">Lokasi Anda</p>
                          <p className="text-xs text-gray-600">Titik awal</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl border border-orange-200">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gradient-to-r from-orange-700 to-orange-500 rounded-full flex-shrink-0"></div>
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
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-400 text-white py-3 md:py-4 rounded-2xl font-bold text-base md:text-lg shadow-xl flex items-center justify-center gap-2 touch-manipulation hover:shadow-2xl"
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
            </div>
          </SheetContent>
        </Sheet>

        {/* Outside Handle when Sidebar is Open (computed position) */}
        {showSidebar && (
          <div className="fixed top-1/2 -translate-y-1/2 z-[60]" style={{ left: outsideHandleLeft }}>
            <motion.div
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              whileHover={{ x: 2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSidebar(false)}
              className="w-10 h-28 sm:w-8 bg-white/95 backdrop-blur-md shadow-2xl rounded-r-2xl border-2 border-orange-300 ring-1 ring-orange-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-orange-50"
            >
              <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 shadow-md flex items-center justify-center">
                <ChevronLeft className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="w-1.5 h-12 sm:h-10 rounded-full bg-gradient-to-b from-orange-400 to-amber-400 shadow-[0_0_12px_rgba(249,115,22,0.35)]"></div>
            </motion.div>
          </div>
        )}

        {/* Persistent Sidebar Handle - Visible when Sidebar is Closed */}
        {!showSidebar && (
          <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40">
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileHover={{ x: 2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSidebar(true)}
              className="ml-0 w-8 h-28 bg-white/95 backdrop-blur-md shadow-xl rounded-r-2xl border-2 border-orange-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-orange-50 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-orange-600" />
              <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-orange-400 to-amber-400"></div>
            </motion.div>
          </div>
        )}

        {/* Map Container - Full Screen below Header */}
        <div className={
          `fixed left-0 right-0 bottom-0 z-0 transition-all duration-300 ` +
          `top-[64px] md:top-[80px] lg:top-[96px]`
        }>
          {isClient && (
            <MapboxComponent 
              center={userLocation}
              zoom={hasGeoPermission ? 13 : 5}
              umkmLocations={filteredUMKM}
              selectedUMKM={selectedUMKM}
              onSelectUMKM={handleSelectUMKM}
            />
          )}

          {/* Floating Controls */}

          {/* Compass Button */}
          <div className={`absolute z-30 transition-all duration-300 ${
            showSidebar 
              ? 'top-4 md:top-6 right-4 md:right-6' 
              : 'top-6 right-6'
          }`}>
            <motion.button
              className="p-3 md:p-3.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation border-2 border-blue-200 hover:border-blue-300 group"
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
              <Compass className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </motion.button>
          </div>

          {/* Bottom Quick Info - Mobile & Tablet */}
          {selectedUMKM && (
            <div className={`lg:hidden ${
              showSidebar ? 'hidden' : 'block'
            }`}>
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 z-20"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-5 max-w-md mx-auto border-2 border-orange-200 hover:border-orange-300 transition-all duration-300">
                <div className="flex gap-3">
                  <img 
                    src={selectedUMKM.image} 
                    alt={selectedUMKM.name}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover flex-shrink-0 ring-2 ring-orange-300 shadow-md transition-transform duration-300 group-hover:scale-105"
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
                        className="flex-1 bg-gradient-to-r from-orange-600 to-orange-400 text-white py-2 md:py-2.5 px-4 md:px-5 rounded-xl text-sm md:text-base font-medium touch-manipulation shadow-md hover:shadow-lg hover:from-orange-500 hover:to-orange-300 transition-all duration-300 flex items-center justify-center gap-2"
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
                        className="flex-1 bg-white border-2 border-orange-500 text-orange-600 py-2 md:py-2.5 px-4 md:px-5 rounded-xl text-sm md:text-base font-medium flex items-center justify-center gap-2 touch-manipulation hover:bg-orange-50 transition-all duration-300"
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
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          body {
            overflow: ${showSidebar ? 'auto' : 'hidden'};
          }
        }
      `}</style>
            
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
            background: linear-gradient(to bottom, #ea580c, #fb923c);
            border-radius: 10px;
            border: 2px solid #fef3c7;
            transition: all 0.3s ease;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #c2410c, #f97316);
            transform: scale(1.05);
          }
          .touch-manipulation {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
            position: relative;
            overflow: hidden;
          }
          .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.7);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
          }
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
          .btn-hover-effect {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .btn-hover-effect:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
          }
          .btn-hover-effect:active {
            transform: translateY(0);
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