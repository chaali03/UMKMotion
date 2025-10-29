"use client";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import type { UMKMLocation } from "./types";
import { 
  MapPin, Star, Navigation, Phone, Clock, 
  ShoppingBag, X, ChevronRight, Filter, Search,
  TrendingUp, Heart, Share2, MessageCircle
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./leaflet-custom.css";
import L from "leaflet";
// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Marker customization handled via Google Maps defaults for now

// Sample UMKM data (in production, this would come from API)
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
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    lat: -6.2088,
    lng: 106.8456,
    verified: true,
    description: "Warung makan tradisional dengan menu nusantara yang lezat dan harga terjangkau",
    placeId: undefined,
    products: [
      { id: "p1", name: "Nasi Goreng Spesial", price: 25000, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200", stock: 50 },
      { id: "p2", name: "Ayam Bakar", price: 35000, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200", stock: 30 },
      { id: "p3", name: "Soto Ayam", price: 20000, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200", stock: 40 },
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
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400",
    lat: -6.2185,
    lng: 106.8426,
    verified: true,
    description: "Koleksi batik modern dan tradisional berkualitas tinggi",
    placeId: undefined,
    products: [
      { id: "p4", name: "Kemeja Batik Pria", price: 250000, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200", stock: 25 },
      { id: "p5", name: "Dress Batik Wanita", price: 350000, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200", stock: 15 },
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
    image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400",
    lat: -6.2114,
    lng: 106.8294,
    verified: true,
    description: "Kerajinan tangan dari kayu jati berkualitas dengan desain unik",
    placeId: undefined,
    products: [
      { id: "p6", name: "Meja Kayu Jati", price: 1500000, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200", stock: 10 },
      { id: "p7", name: "Kursi Minimalis", price: 750000, image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200", stock: 20 },
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
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",
    lat: -6.1944,
    lng: 106.8229,
    verified: true,
    description: "Kedai kopi dengan biji kopi pilihan dari berbagai daerah Indonesia",
    placeId: undefined,
    products: [
      { id: "p8", name: "Kopi Gayo Premium", price: 45000, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200", stock: 100 },
      { id: "p9", name: "Kopi Toraja", price: 50000, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200", stock: 80 },
    ]
  },
];

// Map controller component (Leaflet)
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

// Convert lat/lng to XYZ tile numbers
function latLngToTile(lat: number, lng: number, z: number) {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, z);
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
  );
  return { x, y };
}

// Ensure map correctly calculates size after animations or container resizes
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const timer = window.setTimeout(invalidate, 300);
    window.addEventListener('resize', invalidate);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', invalidate);
    };
  }, [map]);
  return null;
}

export default function RumahUMKM() {
  const [selectedUMKM, setSelectedUMKM] = useState<UMKMLocation | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([-6.2088, 106.8456]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const mapRef = useRef<any>(null);
  const [placeDetails, setPlaceDetails] = useState<any | null>(null);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [tileIndex, setTileIndex] = useState<number>(0);
  const [tileDiag, setTileDiag] = useState<string>("");
  const mapTilerKey = (import.meta as any).env?.PUBLIC_MAPTILER_KEY as string | undefined;
  const baseProviders = [
    {
      key: "carto",
      attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> / &copy; OSM contributors',
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      subdomains: ["a", "b", "c", "d"],
      loadedMsg: "Carto tiles loaded",
      errorMsg: "Carto tiles error — switching",
    },
    {
      key: "osm",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      maxNativeZoom: 19,
      loadedMsg: "OSM tiles loaded",
      errorMsg: "OSM tiles error — switching",
    },
    {
      key: "osm_de",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      url: "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c"],
      loadedMsg: "OSM.de tiles loaded",
      errorMsg: "OSM.de tiles error — switching",
    },
    {
      key: "osm_hot",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of Humanitarian OpenStreetMap Team',
      url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c"],
      loadedMsg: "OSM HOT tiles loaded",
      errorMsg: "OSM HOT tiles error",
    },
  ];
  const tileProviders = (
    mapTilerKey
      ? [
          {
            key: "maptiler",
            attribution:
              '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            url: `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${mapTilerKey}`,
            loadedMsg: "MapTiler tiles loaded",
            errorMsg: "MapTiler tiles error — switching",
          },
          ...baseProviders,
        ]
      : baseProviders
  ) as any[];

  const categories = ["Semua", "Kuliner", "Fashion", "Kerajinan", "Teknologi"];

  // Auto-timeout to switch provider if no tiles load after 4s
  useEffect(() => {
    let switched = false;
    const timer = window.setTimeout(() => {
      if (!switched) {
        setTileDiag(`Timeout loading ${tileProviders[tileIndex].key} — switching`);
        setTileIndex((i) => Math.min(i + 1, tileProviders.length - 1));
      }
    }, 4000);
    return () => {
      switched = true;
      window.clearTimeout(timer);
    };
  }, [tileIndex]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.log("Using default location");
        }
      );
    }
  }, []);

  // Fetch Place Details using SerpAPI (primary)
  useEffect(() => {
    async function fetchDetails(pid: string) {
      try {
        setLoadingPlace(true);
        setPlaceError(null);
        setPlaceDetails(null);
        const serpKey = import.meta.env.PUBLIC_SERPAPI_KEY;
        if (!serpKey) {
          throw new Error("PUBLIC_SERPAPI_KEY tidak ditemukan di .env");
        }
        const serpUrl = `https://serpapi.com/search.json?engine=google_maps&type=place&google_maps_url=${encodeURIComponent(
          `https://www.google.com/maps/place/?q=place_id:${pid}`
        )}&api_key=${encodeURIComponent(serpKey)}`;
        const serpRes = await fetch(serpUrl);
        if (!serpRes.ok) {
          const text = await serpRes.text();
          throw new Error(`SerpAPI ${serpRes.status}: ${text}`);
        }
        const serp = await serpRes.json();
        const pr = serp.place_results || {};
        const mapped = {
          id: pr.place_id || pid,
          displayName: pr.title ? { text: pr.title } : undefined,
          formattedAddress: pr.address,
          location: pr.gps_coordinates
            ? { latitude: pr.gps_coordinates.latitude, longitude: pr.gps_coordinates.longitude }
            : undefined,
          internationalPhoneNumber: pr.phone,
          websiteUri: pr.website,
          regularOpeningHours: pr.opening_hours?.schedules?.length
            ? { weekdayDescriptions: (pr.opening_hours.schedules || []).map((s: any) => s.day || "") }
            : undefined,
          rating: typeof pr.rating === "number" ? pr.rating : undefined,
          userRatingCount: pr.reviews || undefined,
        } as any;
        setPlaceDetails(mapped);
      } catch (e: any) {
        setPlaceError(e?.message || "Gagal memuat Place Details");
      } finally {
        setLoadingPlace(false);
      }
    }
    if (selectedUMKM?.placeId) {
      fetchDetails(selectedUMKM.placeId);
    } else {
      setPlaceDetails(null);
      setPlaceError(null);
    }
  }, [selectedUMKM?.placeId]);

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
          <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
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
                  <img src={umkm.image} alt={umkm.name} className="w-full h-full object-cover" />
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
            >
              <div className="relative h-[calc(100vh-250px)]">
                <MapContainer
                  key={`map-${tileProviders[tileIndex].key}`}
                  center={userLocation}
                  zoom={13}
                  minZoom={3}
                  maxZoom={19}
                  className="h-full w-full"
                  ref={mapRef}
                  whenReady={() => {
                    const map = mapRef.current;
                    if (map) {
                      map.invalidateSize();
                      window.setTimeout(() => map.invalidateSize(), 300);
                    }
                  }}
                >
                  <TileLayer
                    key={`tiles-${tileProviders[tileIndex].key}`}
                    attribution={tileProviders[tileIndex].attribution}
                    url={tileProviders[tileIndex].url}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    errorTileUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect width='100%25' height='100%25' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='16'%3ENo tile%3C/text%3E%3C/svg%3E"
                    {...((tileProviders[tileIndex] as any).subdomains ? { subdomains: (tileProviders[tileIndex] as any).subdomains } : {})}
                    {...((tileProviders[tileIndex] as any).maxNativeZoom ? { maxNativeZoom: (tileProviders[tileIndex] as any).maxNativeZoom } : {})}
                    eventHandlers={{
                      tileload: () => {
                        setTileDiag(tileProviders[tileIndex].loadedMsg);
                      },
                      tileerror: () => {
                        setTileDiag(tileProviders[tileIndex].errorMsg);
                        setTileIndex((i) => Math.min(i + 1, tileProviders.length - 1));
                      }
                    }}
                  />
                  <MapResizer />
                  <MapController center={selectedUMKM ? [selectedUMKM.lat, selectedUMKM.lng] : userLocation} />
                  {filteredUMKM.map((umkm) => (
                    <Marker
                      key={umkm.id}
                      position={[umkm.lat, umkm.lng]}
                      eventHandlers={{
                        click: () => setSelectedUMKM(umkm),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-lg mb-1">{umkm.name}</h3>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{umkm.rating}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{umkm.address}</p>
                          <button
                            onClick={() => setSelectedUMKM(umkm)}
                            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
                {tileDiag && (
                  <div className="absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded bg-white/80 text-gray-700 shadow">
                    {tileDiag}
                  </div>
                )}
                {/* Tile diagnostic preview */}
                <div className="absolute bottom-2 right-2 text-[11px] px-2 py-1 rounded bg-white/80 text-gray-700 shadow max-w-[60%]">
                  {(() => {
                    const z = 13;
                    const { x, y } = latLngToTile(userLocation[0], userLocation[1], z);
                    const provider = tileProviders[tileIndex];
                    const url = provider.url
                      .replace("{z}", String(z))
                      .replace("{x}", String(x))
                      .replace("{y}", String(y))
                      .replace("{r}", "")
                      .replace("{s}.", "a.");
                    return (
                      <div className="flex items-center gap-2">
                        <span className="truncate">{provider.key} tile:</span>
                        <a className="text-purple-600 underline truncate" href={url} target="_blank" rel="noreferrer">open</a>
                        <img src={url} alt="tile" className="w-10 h-10 object-cover rounded border" />
                      </div>
                    );
                  })()}
                </div>
              </div>
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
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Image */}
              <div className="relative h-64">
                <img src={selectedUMKM.image} alt={selectedUMKM.name} className="w-full h-full object-cover" />
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

                  {selectedUMKM.placeId && (
                    <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
                      <h4 className="font-semibold text-gray-800 mb-2">Google Place Details</h4>
                      {loadingPlace && (
                        <p className="text-sm text-gray-600">Memuat data dari Google...</p>
                      )}
                      {!loadingPlace && placeError && (
                        <p className="text-sm text-red-600">{placeError}</p>
                      )}
                      {!loadingPlace && !placeError && placeDetails && (
                        <div className="text-sm text-gray-700 space-y-1">
                          {placeDetails.displayName?.text && (
                            <p><span className="font-semibold">Nama: </span>{placeDetails.displayName.text}</p>
                          )}
                          {placeDetails.formattedAddress && (
                            <p><span className="font-semibold">Alamat: </span>{placeDetails.formattedAddress}</p>
                          )}
                          {typeof placeDetails.rating === 'number' && (
                            <p><span className="font-semibold">Rating (Google): </span>{placeDetails.rating} ({placeDetails.userRatingCount || 0} ulasan)</p>
                          )}
                          {placeDetails.internationalPhoneNumber && (
                            <p><span className="font-semibold">Telepon: </span>{placeDetails.internationalPhoneNumber}</p>
                          )}
                          {placeDetails.websiteUri && (
                            <p><span className="font-semibold">Website: </span><a className="text-purple-600 underline" href={placeDetails.websiteUri} target="_blank" rel="noreferrer">{placeDetails.websiteUri}</a></p>
                          )}
                          {placeDetails.regularOpeningHours?.weekdayDescriptions && (
                            <div className="mt-2">
                              <p className="font-semibold">Jam buka:</p>
                              <ul className="list-disc ml-5">
                                {placeDetails.regularOpeningHours.weekdayDescriptions.map((line: string, idx: number) => (
                                  <li key={idx}>{line}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl">
                    <MapPin className="w-6 h-6 text-purple-600 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Alamat</p>
                    <p className="font-semibold text-gray-800">{selectedUMKM.address}</p>
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
                        className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-purple-500 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <img src={product.image} alt={product.name} className="w-full h-32 object-cover" />
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
                  >
                    <MessageCircle className="w-5 h-5" />
                    Hubungi Penjual
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-white border-2 border-purple-600 text-purple-600 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
