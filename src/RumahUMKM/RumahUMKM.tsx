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
  Star, Navigation, Phone, 
  X, ChevronRight, Search,
  Heart, Share2, Loader,
  ChevronLeft,
  Compass, Car, Footprints as Walk, Bike,
  Image as ImageIcon, ExternalLink,
  Users, ArrowLeft,
  Circle,
  MapPin, Clock, Copy,
  Sparkles, Utensils, Wrench, Shirt, Palette, HeartPulse, Sprout, Laptop, Armchair, GraduationCap, ShoppingBag
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

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

// Firestore-loaded UMKM data
const JAKARTA_CENTER: [number, number] = [-6.2, 106.816];
const VALID_CATEGORIES = new Set(["Kuliner", "Fashion", "Kerajinan", "Teknologi"]);

// Parse open hours like "08:00 - 21:00" into today's status
function isCurrentlyOpen(openHours?: string): boolean {
  if (!openHours) return false;
  // Accept formats: "08:00 - 21:00" or "08:00-21:00"
  const m = openHours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return false;
  const [, h1, m1, h2, m2] = m;
  const now = new Date();
  const start = new Date(now);
  start.setHours(parseInt(h1, 10), parseInt(m1, 10), 0, 0);
  const end = new Date(now);
  end.setHours(parseInt(h2, 10), parseInt(m2, 10), 0, 0);
  // Handle overnight e.g., 21:00 - 02:00
  if (end <= start) {
    if (now >= start) return true;
    const yesterdayStart = new Date(start);
    yesterdayStart.setDate(start.getDate() - 1);
    return now < end && now.getDate() === end.getDate();
  }
  return now >= start && now <= end;
}

function mapStoreToUMKM(data: any, id: string): UMKMLocation {
  const lat = typeof data.lat === 'number' ? data.lat : (typeof data.latitude === 'number' ? data.latitude : JAKARTA_CENTER[0]);
  const lng = typeof data.lng === 'number' ? data.lng : (typeof data.longitude === 'number' ? data.longitude : JAKARTA_CENTER[1]);
  const photos = [data.banner, data.image, data.profileImage].filter(Boolean);
  const category = data.kategori || 'Kerajinan';
  return {
    id,
    name: data.nama_toko || data.name || 'UMKM',
    category: VALID_CATEGORIES.has(category) ? category : 'Kerajinan',
    rating: typeof data.rating_toko === 'number' ? data.rating_toko : 4.8,
    reviews: typeof data.jumlah_review === 'number' ? data.jumlah_review : 0,
    distance: 0,
    address: data.lokasi_toko || data.alamat || '',
    phone: data.no_telp || data.phone || '',
    openHours: data.jam_operasional || '08:00 - 21:00',
    image: data.profileImage || data.image || photos[0] || '/LogoNavbar.webp',
    lat, lng,
    verified: true,
    description: data.deskripsi_toko || data.deskripsi || 'UMKM lokal',
    isOpen: isCurrentlyOpen(data.jam_operasional || '08:00 - 21:00'),
    photos: photos as string[],
    products: [],
  } as UMKMLocation;
}

export default function RumahUMKM() {
  const [selectedUMKM, setSelectedUMKM] = useState<UMKMLocation | null>(null);
  // [lat, lon]
  const INDONESIA_CENTER: [number, number] = [-2.5, 118.0];
  const [userLocation, setUserLocation] = useState<[number, number]>(INDONESIA_CENTER);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
  const [umkmList, setUmkmList] = useState<UMKMLocation[]>([]);
  const [loadingStores, setLoadingStores] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  // Helper: choose the best image for list cards
  const pickImage = (u: UMKMLocation): string => {
    const candidates = [u.image, ...(u.photos || [])].filter(Boolean);
    const first = candidates.find((s) => typeof s === 'string' && s.length > 0);
    return first || '/LogoNavbar.webp';
  };

  // (filteredUMKM is defined later; this earlier duplicate is removed)

  const categories = [
    { id: 'all', label: 'Semua', icon: Sparkles, color: 'orange' },
    { id: 'food', label: 'Kuliner', icon: Utensils, color: 'red' },
    { id: 'service', label: 'Jasa', icon: Wrench, color: 'blue' },
    { id: 'fashion', label: 'Fashion', icon: Shirt, color: 'pink' },
    { id: 'craft', label: 'Kerajinan', icon: Palette, color: 'blue' },
    { id: 'beauty', label: 'Kesehatan', icon: HeartPulse, color: 'teal' },
    { id: 'agriculture', label: 'Pertanian', icon: Sprout, color: 'green' },
    { id: 'electronics', label: 'Elektronik', icon: Laptop, color: 'cyan' },
    { id: 'furniture', label: 'Furniture', icon: Armchair, color: 'amber' },
    { id: 'education', label: 'Edukasi', icon: GraduationCap, color: 'indigo' },
  ];

  const idToLabel: Record<string, string> = {
    all: 'Semua',
    food: 'Kuliner',
    service: 'Jasa',
    fashion: 'Fashion',
    craft: 'Kerajinan',
    beauty: 'Kesehatan',
    agriculture: 'Pertanian',
    electronics: 'Elektronik',
    furniture: 'Furniture',
    education: 'Edukasi',
  };

  // Load UMKM list from Firestore stores collection
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'stores'));
        const items: UMKMLocation[] = snap.docs.map(d => mapStoreToUMKM(d.data(), d.id));
        if (mounted) setUmkmList(items);
      } catch (e) {
        if (mounted) setUmkmList([]);
      } finally {
        if (mounted) setLoadingStores(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Update distances whenever userLocation or list changes
  useEffect(() => {
    setUmkmList(prev => prev.map(u => ({
      ...u,
      distance: haversine(userLocation, [u.lat, u.lng])
    })));
  }, [userLocation]);

  // Recalculate open/closed every minute so the label stays accurate
  useEffect(() => {
    // initial sync
    setUmkmList(prev => prev.map(u => ({ ...u, isOpen: isCurrentlyOpen(u.openHours) })));
    const id = window.setInterval(() => {
      setUmkmList(prev => prev.map(u => ({ ...u, isOpen: isCurrentlyOpen(u.openHours) })));
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Distance helper
  const haversine = (a: [number, number], b: [number, number]) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return Math.round(R * c * 10) / 10;
  };

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

  // Filter UMKM + sort by nearest
  const filteredUMKM = React.useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    const expectedLabel = idToLabel[selectedCategory] || 'Semua';
    const withDistance = umkmList.map(u => ({
      ...u,
      distance: userLocation ? haversine(userLocation, [u.lat, u.lng]) : u.distance,
    }));
    const filtered = withDistance.filter((umkm: UMKMLocation) => {
      const hay = [umkm.name, umkm.category, umkm.address].filter(Boolean).map(s => s!.toLowerCase());
      const matchesSearch = !q || hay.some(s => s.includes(q));
      const matchesCategory = selectedCategory === 'all' || umkm.category === expectedLabel;
      const matchesVerified = !verifiedOnly || !!umkm.verified;
      return matchesSearch && matchesCategory && matchesVerified;
    });
    return filtered.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
  }, [umkmList, userLocation, searchQuery, selectedCategory, verifiedOnly]);

  const categoryCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    umkmList.forEach((u) => {
      const label = (u.category as string) || 'Semua';
      map[label] = (map[label] || 0) + 1;
    });
    // Also compute 'Semua'
    map['Semua'] = umkmList.length;
    return map;
  }, [umkmList]);

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

  // Fetch products for selected UMKM from Firestore
  useEffect(() => {
    const loadProducts = async (storeId: string) => {
      setLoadingProducts(true);
      try {
        const q = query(collection(db, 'products'), where('storeId', '==', storeId));
        const snap = await getDocs(q);
        let docs = snap.docs;
        // Fallback: if no products by storeId, try match by toko name
        if (docs.length === 0 && selectedUMKM?.name) {
          const q2 = query(collection(db, 'products'), where('toko', '==', selectedUMKM.name));
          const snap2 = await getDocs(q2);
          docs = snap2.docs;
        }
        const sanitize = (u?: string) => {
          if (!u) return '';
          let s = String(u).trim();
          if (s.startsWith('http://')) s = 'https://' + s.slice(7);
          try {
            const url = new URL(s, window.location.origin);
            // drop query to avoid hotlink protection params
            return url.origin + url.pathname;
          } catch {
            return s;
          }
        };
        const productsRaw = docs.map((d) => {
          const x: any = d.data();
          const gallery = Array.isArray(x.galeri_gambar) ? x.galeri_gambar : [];
          const candidates = [x.thumbnail_produk, x.gambar_produk, gallery[0]].map(sanitize).filter(Boolean) as string[];
          const image = candidates[0] || '/asset/placeholder/product.webp';
          const altImage = candidates[1];
          return {
            id: d.id,
            name: x.nama_produk || x.name || 'Produk',
            price: typeof x.harga_produk === 'number' ? x.harga_produk : (parseInt(x.harga_produk) || 0),
            image,
            stock: typeof x.jumlah_unit === 'number' ? x.jumlah_unit : 0,
            description: x.deskripsi_produk || '',
            category: x.kategori || undefined,
            discount: typeof x.persentase_diskon === 'number' ? x.persentase_diskon : undefined,
            _altImage: altImage,
          } as any;
        });
        // Deduplicate by normalized image URL; fallback to normalized name
        const normUrl = (u?: string) => {
          if (!u) return '';
          let s = u.trim().toLowerCase();
          s = s.replace(/^https?:\/\//, '');
          const q = s.indexOf('?');
          if (q !== -1) s = s.substring(0, q);
          s = s.replace(/(_\d+x\d+|@\dx)\.(webp|jpg|jpeg|png)$/i, '.$2');
          return s;
        };
        const normName = (t?: string) => (t || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
        const seen = new Set<string>();
        const products = productsRaw.filter((p) => {
          const keyUrl = normUrl(p.image);
          const keyName = normName(p.name);
          const key = keyUrl || `name:${keyName}`;
          if (!key) return true;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setSelectedUMKM((prev) => (prev ? { ...prev, products } : prev));
      } finally {
        setLoadingProducts(false);
      }
    };

    if (selectedUMKM?.id) {
      loadProducts(selectedUMKM.id);
    }
  }, [selectedUMKM?.id]);

  const handleStartNavigation = () => {
    setViewMode('directions');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedUMKM(null);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      {/* Header with Enhanced Glass Morphism Effect */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-b border-orange-200/50 shadow-lg shadow-orange-100/50">
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
          <SheetContent side="left" className="w-full sm:w-[90%] md:w-[420px] lg:w-[440px] rounded-r-3xl border-r-2 border-orange-200/60 overflow-hidden group shadow-2xl">
            <div ref={sidebarRef} className="h-full flex flex-col bg-gradient-to-br from-white via-orange-50/30 to-amber-50/40 backdrop-blur-xl">
              {/* Search Header */}
              <div className="flex-shrink-0 p-4 md:p-5 border-b-2 bg-gradient-to-br from-orange-50 via-amber-50/80 to-orange-100/60 border-orange-200/60 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  {viewMode !== 'list' && (
                    <motion.button
                      onClick={handleBackToList}
                      className="p-2 hover:bg-white/80 rounded-full transition-colors touch-manipulation"
                      aria-label="Kembali ke daftar"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-5 h-5 text-orange-600" />
                    </motion.button>
                  )}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-4 h-4 md:w-5 md:h-5 z-10" />
                    <input
                      type="text"
                      placeholder="Cari UMKM terdekat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl bg-white/90 backdrop-blur-sm border-2 border-orange-200/60 focus:border-orange-500 focus:ring-4 focus:ring-orange-200/40 focus:outline-none transition-all shadow-sm hover:shadow-md"
                    />
                  </div>
                  <motion.button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden p-2 hover:bg-white/80 rounded-full touch-manipulation"
                    aria-label="Tutup panel UMKM"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>

                {/* Category Chips removed per request */}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {viewMode === 'list' && (
                  <div className="p-4 md:p-5 space-y-3 md:space-y-4 custom-scrollbar overflow-y-auto flex-1">
                    {loadingStores ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader className="animate-spin h-8 w-8 text-orange-600" />
                        <p className="text-sm text-gray-600 font-medium">Memuat UMKM...</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm md:text-base font-bold bg-gradient-to-r from-orange-700 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                            {filteredUMKM.length} UMKM Ditemukan
                          </h3>
                          <span className="text-xs md:text-sm text-gray-500 font-medium">Terdekat</span>
                        </div>

                    {filteredUMKM.map((umkm, index) => (
                      <motion.div
                        key={umkm.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                        onClick={() => handleSelectUMKM(umkm)}
                        className="bg-white/90 backdrop-blur-sm border-2 border-orange-100/60 hover:border-orange-300 rounded-2xl p-3 cursor-pointer hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 group active:scale-[0.98] touch-manipulation hover:-translate-y-1"
                      >
                        <div className="flex gap-3">
                          <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                            <img 
                              src={pickImage(umkm)} 
                              alt={umkm.name}
                              className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover object-[center_65%] ring-2 ring-orange-200/60 group-hover:ring-orange-400 transition-all duration-300 shadow-md"
                              width={80}
                              height={80}
                              loading={index === 0 ? 'eager' : 'lazy'}
                              fetchPriority={index === 0 ? 'high' : undefined as any}
                              decoding="async"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                              }}
                            />
                            {/* Verified icon overlay removed per request */}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h4 className="text-sm md:text-base font-bold text-gray-900 truncate group-hover:bg-gradient-to-r group-hover:from-orange-700 group-hover:via-orange-600 group-hover:to-amber-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                {umkm.name}
                              </h4>
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(umkm.id);
                                }}
                                className="flex-shrink-0 touch-manipulation p-1"
                                aria-label={favorites.has(umkm.id) ? 'Hapus dari favorit' : 'Tambah ke favorit'}
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
                      </>
                    )}
                  </div>
                )}

                {viewMode === 'detail' && selectedUMKM && (
                  <div>
                    {/* Image Carousel */}
                    <div className="relative h-44 md:h-52 lg:h-60 bg-gradient-to-br from-orange-300 via-orange-200 to-amber-200 overflow-hidden shadow-inner">
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
                            src={/w=\d+&h=\d+/.test(src) ? src.replace(/w=\d+&h=\d+/, 'w=600&h=300') : src}
                            alt={`${selectedUMKM.name} ${idx + 1}`}
                            className="h-full w-full min-w-full flex-none object-cover snap-center"
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            width={600}
                            height={300}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x300?text=No+Image';
                            }}
                          />
                        ))}
                      </div>

                      {/* Photo count badge */}
                      {total > 1 && (
                        <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 bg-white/85 backdrop-blur-sm text-gray-800 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm flex items-center gap-1 shadow-sm">
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
                            className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/85 text-gray-800 flex items-center justify-center hover:bg-white z-20 shadow-sm ${atStart ? 'opacity-40 cursor-not-allowed' : ''}`}
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
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/85 text-gray-800 flex items-center justify-center hover:bg-white z-20 shadow-sm ${atEnd ? 'opacity-40 cursor-not-allowed' : ''}`}
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
                      <div className="grid grid-cols-3 gap-2.5 mb-4">
                        <motion.button
                          onClick={handleStartNavigation}
                          className="flex flex-col items-center gap-1.5 md:gap-2 p-2.5 md:p-3 bg-gradient-to-br from-orange-50 via-orange-100/80 to-amber-50 rounded-xl hover:shadow-lg transition-all duration-300 touch-manipulation border-2 border-orange-200/60 hover:border-orange-300 group"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                            <Navigation className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-gray-800 group-hover:text-orange-700 transition-colors">Rute</span>
                        </motion.button>

                        <motion.button
                          onClick={() => window.open(`tel:${selectedUMKM.phone}`)}
                          className="flex flex-col items-center gap-1.5 md:gap-2 p-2.5 md:p-3 bg-gradient-to-br from-green-50 via-emerald-50/80 to-green-100/60 rounded-xl hover:shadow-lg transition-all duration-300 touch-manipulation border-2 border-green-200/60 hover:border-green-300 group"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-600 via-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                            <Phone className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-gray-800 group-hover:text-green-700 transition-colors">Telepon</span>
                        </motion.button>

                        <motion.button
                          className="flex flex-col items-center gap-1.5 md:gap-2 p-2.5 md:p-3 bg-gradient-to-br from-blue-50 via-sky-50/80 to-blue-100/60 rounded-xl hover:shadow-lg transition-all duration-300 touch-manipulation border-2 border-blue-200/60 hover:border-blue-300 group"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 via-sky-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                            <Share2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">Bagikan</span>
                        </motion.button>
                      </div>

                      {/* Tabs */}
                      <div className="flex gap-1 md:gap-2 mb-3 md:mb-4 border-b-2 border-orange-100/60 overflow-x-auto hide-scrollbar">
                        {(['overview', 'reviews', 'photos'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2.5 px-4 font-semibold transition-all duration-300 capitalize text-sm md:text-base whitespace-nowrap touch-manipulation rounded-t-xl relative ${
                              activeTab === tab
                                ? 'text-orange-700'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {tab}
                            {activeTab === tab && (
                              <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-full"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      {activeTab === 'overview' && (
                        <div className="space-y-3 md:space-y-4">
                          <div>
                            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">{selectedUMKM.description}</p>
                          </div>

                          <div className="space-y-3 md:space-y-4">
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-br from-orange-50 via-orange-100/60 to-amber-50 rounded-xl border-2 border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-md">
                                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-bold text-gray-900 mb-1.5">Alamat</p>
                                <p className="text-xs md:text-sm text-gray-700 break-words leading-relaxed">{selectedUMKM.address}</p>
                                <p className="text-xs md:text-sm text-orange-700 mt-2 font-bold flex items-center gap-1">
                                  <Navigation className="w-3 h-3" />
                                  {selectedUMKM.distance} km dari Anda
                                </p>
                              </div>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-orange-600 hover:text-orange-700 flex-shrink-0 touch-manipulation p-1.5 hover:bg-orange-100 rounded-lg transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </motion.button>
                            </motion.div>

                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-br from-blue-50 via-sky-50/60 to-blue-100/40 rounded-xl border-2 border-blue-200/60 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-sky-500 rounded-lg shadow-md">
                                <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs md:text-sm font-bold text-gray-900 mb-1.5">Jam Operasional</p>
                                <p className="text-xs md:text-sm text-gray-700 font-medium">{selectedUMKM.openHours}</p>
                                {selectedUMKM.isOpen !== undefined && (
                                  <p className={`text-xs md:text-sm mt-2 font-bold flex items-center gap-1.5 ${selectedUMKM.isOpen ? 'text-green-700' : 'text-red-600'}`}>
                                    <Circle className={`w-2 h-2 ${selectedUMKM.isOpen ? 'fill-green-500' : 'fill-red-500'}`} />
                                    {selectedUMKM.isOpen ? 'Buka sekarang' : 'Tutup'}
                                  </p>
                                )}
                              </div>
                            </motion.div>

                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-br from-green-50 via-emerald-50/60 to-green-100/40 rounded-xl border-2 border-green-200/60 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-md">
                                <Phone className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-bold text-gray-900 mb-1.5">Telepon</p>
                                <p className="text-xs md:text-sm text-gray-700 break-all font-medium">{selectedUMKM.phone}</p>
                              </div>
                              <motion.button 
                                onClick={() => window.open(`tel:${selectedUMKM.phone}`)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-green-600 hover:text-green-700 flex-shrink-0 touch-manipulation p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </motion.button>
                            </motion.div>
                          </div>

                          {/* Products */}
                          {selectedUMKM.products && selectedUMKM.products.length > 0 && (
                            <div className="mt-4 md:mt-6">
                              <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                                Produk ({selectedUMKM.products.length})
                              </h3>
                              <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {selectedUMKM.products.slice(0, 4).map((product) => {
                                  const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="Arial" font-size="18">No Image</text></svg>';
                                  const toProxy = (u?: string) => (u && /^https?:/i.test(u) ? `/api/proxy-image?url=${encodeURIComponent(u)}` : u);
                                  const initialSrc = toProxy(product.image) || placeholder;
                                  const altProxied = toProxy((product as any)?._altImage);
                                  return (
                                  <div key={product.id} className="border-2 border-orange-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all touch-manipulation">
                                    <img
                                      src={initialSrc}
                                      alt={product.name}
                                      className="w-full h-20 md:h-24 object-cover bg-slate-50"
                                      loading="lazy"
                                      decoding="async"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        if (altProxied && img.src !== altProxied) {
                                          img.src = altProxied;
                                        } else {
                                          img.src = placeholder;
                                        }
                                      }}
                                    />
                                    <div className="p-2">
                                      <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                      <p className="text-xs md:text-sm bg-gradient-to-r from-orange-700 to-orange-500 bg-clip-text text-transparent font-bold">
                                        Rp {product.price.toLocaleString('id-ID')}
                                      </p>
                                    </div>
                                  </div>
                                );})}
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
                      className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 touch-manipulation transition-all duration-300 hover:from-orange-500 hover:via-orange-400 hover:to-amber-400"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Navigation className="w-5 h-5 md:w-6 md:h-6" />
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
              transition={{ duration: 0.3, type: "spring" }}
              whileHover={{ x: 3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSidebar(false)}
              className="w-10 h-28 sm:w-8 bg-white/95 backdrop-blur-xl shadow-2xl rounded-r-2xl border-2 border-orange-300/80 ring-2 ring-orange-200/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 transition-all duration-300"
            >
              <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500 shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300">
                <ChevronLeft className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="w-1.5 h-12 sm:h-10 rounded-full bg-gradient-to-b from-orange-400 via-orange-300 to-amber-400 shadow-[0_0_12px_rgba(249,115,22,0.4)]"></div>
            </motion.div>
          </div>
        )}

        {/* Persistent Sidebar Handle - Visible when Sidebar is Closed */}
        {!showSidebar && (
          <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40">
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ x: 3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSidebar(true)}
              className="ml-0 w-8 h-28 bg-white/95 backdrop-blur-xl shadow-xl rounded-r-2xl border-2 border-orange-200/60 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 transition-all duration-300 hover:border-orange-300"
            >
              <ChevronRight className="w-4 h-4 text-orange-600 group-hover:text-orange-700 transition-colors" />
              <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-orange-400 via-orange-300 to-amber-400 shadow-[0_0_8px_rgba(249,115,22,0.3)]"></div>
            </motion.div>
          </div>
        )}

        {/* Map Container - Full Screen below Header */}
        <div className={
          `fixed left-0 right-0 bottom-0 z-0 transition-all duration-300 ` +
          `top-[64px] md:top-[80px] lg:top-[96px]`
        }>
          {/* Defer map until user enables */}
          {isClient && showMap ? (
            <MapboxComponent 
              center={userLocation}
              zoom={hasGeoPermission ? 13 : 5}
              umkmLocations={filteredUMKM}
              selectedUMKM={selectedUMKM}
              onSelectUMKM={handleSelectUMKM}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 px-4"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-200 to-amber-200 rounded-2xl shadow-lg mb-2">
                  <Compass className="w-8 h-8 md:w-10 md:h-10 text-orange-600" />
                </div>
                <p className="text-sm md:text-base text-gray-700 font-medium">Peta belum dimuat untuk mempercepat loading.</p>
                <motion.button
                  onClick={() => setShowMap(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white px-6 py-3.5 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Navigation className="w-5 h-5" />
                  Tampilkan Peta
                </motion.button>
              </motion.div>
            </div>
          )}

          {/* Floating Controls */}

          {/* Compass Button */}
          <div className={`absolute z-30 transition-all duration-300 ${
            showSidebar 
              ? 'top-4 md:top-6 right-4 md:right-6' 
              : 'top-6 right-6'
          }`}>
            <motion.button
              className="p-3 md:p-3.5 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 touch-manipulation border-2 border-blue-200/60 hover:border-blue-400 group"
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Arahkan ke lokasi saya"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                  });
                }
              }}
            >
              <Compass className="w-5 h-5 md:w-6 md:h-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
            </motion.button>
          </div>

          {/* Bottom Quick Info - Mobile & Tablet */}
          {selectedUMKM && (
            <div className={`lg:hidden ${
              showSidebar ? 'hidden' : 'block'
            }`}>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 z-20"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 md:p-5 max-w-md mx-auto border-2 border-orange-200/60 hover:border-orange-300 transition-all duration-300 hover:shadow-orange-200/50">
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
                    <div className="flex gap-2.5">
                      <motion.button
                        onClick={() => setShowSidebar(true)}
                        className="flex-1 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white py-2.5 md:py-3 px-4 md:px-5 rounded-xl text-sm md:text-base font-bold touch-manipulation shadow-lg hover:shadow-xl hover:from-orange-500 hover:via-orange-400 hover:to-amber-400 transition-all duration-300 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Detail
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          handleStartNavigation();
                          setShowSidebar(true);
                        }}
                        className="flex-1 bg-white/90 backdrop-blur-sm border-2 border-orange-400/80 text-orange-700 py-2.5 md:py-3 px-4 md:px-5 rounded-xl text-sm md:text-base font-bold flex items-center justify-center gap-2 touch-manipulation hover:bg-orange-50/80 transition-all duration-300 shadow-md hover:shadow-lg"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Navigation className="w-3.5 h-3.5 md:w-4 md:h-4" />
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