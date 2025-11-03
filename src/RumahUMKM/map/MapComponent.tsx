"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../mapbox-custom.css';
import type { UMKMLocation } from '../types';
import { 
  MapPin, Navigation, Star, Phone, Clock, 
  Loader, AlertCircle, RefreshCw, Layers,
  Maximize2, Minimize2, Locate, Compass,
  ZoomIn, ZoomOut, Map as MapIcon, Satellite,
  Navigation2, Route, TrendingUp, Store,
  Heart, Share2, ExternalLink, X, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// @ts-ignore
maplibregl.workerClass = null;

interface MapboxComponentProps {
  center: [number, number];
  umkmLocations: UMKMLocation[];
  selectedUMKM: UMKMLocation | null;
  onSelectUMKM: (umkm: UMKMLocation) => void;
  zoom?: number;
}

// Custom Marker Component
const createCustomMarker = (umkm: UMKMLocation, isSelected: boolean) => {
  const el = document.createElement('div');
  el.className = `custom-marker ${isSelected ? 'selected' : ''}`;
  el.innerHTML = `
    <div class="marker-pin ${isSelected ? 'marker-selected' : ''}">
      <div class="marker-icon">
        ${umkm.verified ? 
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' :
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'
        }
      </div>
      <div class="marker-pulse"></div>
    </div>
    ${isSelected ? `
      <div class="marker-label">
        <span class="font-semibold">${umkm.name}</span>
      </div>
    ` : ''}
  `;
  return el;
};

// Enhanced Popup Content
const createPopupContent = (umkm: UMKMLocation) => {
  return `
    <div class="custom-popup">
      <div class="popup-image-container">
        <img src="${umkm.image}" alt="${umkm.name}" class="popup-image" />
        ${umkm.verified ? '<div class="verified-badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>' : ''}
      </div>
      <div class="popup-content">
        <div class="popup-header">
          <h3 class="popup-title">${umkm.name}</h3>
          <span class="popup-category">${umkm.category}</span>
        </div>
        <div class="popup-rating">
          <div class="rating-stars">
            ${'★'.repeat(Math.floor(umkm.rating))}${'☆'.repeat(5 - Math.floor(umkm.rating))}
          </div>
          <span class="rating-text">${umkm.rating} (${umkm.reviews} reviews)</span>
        </div>
        <div class="popup-info">
          <div class="info-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${umkm.distance} km</span>
          </div>
          <div class="info-item ${umkm.isOpen ? 'text-green-600' : 'text-red-600'}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>${umkm.isOpen ? 'Buka' : 'Tutup'}</span>
          </div>
        </div>
        <p class="popup-address">${umkm.address}</p>
      </div>
    </div>
  `;
};

// Map Style Options
const MAP_STYLES = [
  {
    id: 'basic',
    name: 'Basic',
    url: 'https://api.maptiler.com/maps/basic-v2/style.json?key=zmmYiAMYNdgJx6UqpbNU',
    icon: MapIcon
  },
  {
    id: 'streets',
    name: 'Streets',
    url: 'https://api.maptiler.com/maps/streets-v2/style.json?key=zmmYiAMYNdgJx6UqpbNU',
    icon: Route
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://api.maptiler.com/maps/hybrid/style.json?key=zmmYiAMYNdgJx6UqpbNU',
    icon: Satellite
  },
];

// Fallback public style (no API key required)
const FALLBACK_STYLE = {
  id: 'fallback',
  name: 'Fallback',
  url: 'https://demotiles.maplibre.org/style.json',
  icon: MapIcon
};

export default function MapboxComponent({
  center,
  umkmLocations,
  selectedUMKM,
  onSelectUMKM,
  zoom = 13
}: MapboxComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<{ [key: string]: maplibregl.Marker }>({});
  const userMarker = useRef<maplibregl.Marker | null>(null);

  const validCenter: [number, number] = Array.isArray(center) && 
    center.length === 2 && 
    typeof center[0] === 'number' && 
    typeof center[1] === 'number' ? 
    center : [106.8456, -6.2088];

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(MAP_STYLES[0]);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [userHeading, setUserHeading] = useState<number | null>(null);
  const errorHandledRef = useRef(false);
  const rafPending = useRef(false);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current) return;
    
    if (!map.current) {
      try {
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: currentStyle.url,
          center: [validCenter[1], validCenter[0]],
          zoom: zoom,
          maxPitch: 60,
          minPitch: 0,
          maxZoom: 20,
          minZoom: 2,
          attributionControl: false,
          fadeDuration: 150
        });

        // Add custom controls
        const navControl = new maplibregl.NavigationControl({
          showCompass: true,
          showZoom: false,
          visualizePitch: true
        });
        
        map.current.addControl(navControl, 'bottom-right');
        
        // Add scale control
        const scale = new maplibregl.ScaleControl({
          maxWidth: 100,
          unit: 'metric'
        });
        map.current.addControl(scale, 'bottom-left');

        // Handle map load
        map.current.once('load', () => {
          console.log('Map loaded successfully');
          setMapReady(true);
          
          // Throttle view state updates to reduce re-renders
          if (map.current) {
            const updateViewState = () => {
              if (rafPending.current) return;
              rafPending.current = true;
              requestAnimationFrame(() => {
                if (!map.current) return;
                setBearing(map.current.getBearing() || 0);
                setPitch(map.current.getPitch() || 0);
                rafPending.current = false;
              });
            };
            map.current.on('rotate', updateViewState);
            map.current.on('pitch', updateViewState);
          }
        });
        
        map.current.on('error', (e) => {
          if (errorHandledRef.current) return;
          // Log once
          console.error('Map error:', e);
          // Try switching to fallback style if current style fails (e.g., API key/rate limit)
          if (map.current && currentStyle.id !== FALLBACK_STYLE.id) {
            errorHandledRef.current = true;
            setMapError('Gagal memuat style peta, beralih ke style cadangan.');
            map.current.setStyle(FALLBACK_STYLE.url);
            setCurrentStyle({ ...FALLBACK_STYLE, icon: MapIcon as any });
            map.current.once('styledata', () => {
              setMapReady(true);
              setMapError(null);
            });
          } else {
            setMapError('Failed to load map. Please try refreshing the page.');
          }
        });
        
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map. Please try again later.');
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map center (debounced)
  useEffect(() => {
    if (!map.current || !mapReady) return;
    const id = window.setTimeout(() => {
      if (!map.current) return;
      map.current.flyTo({
        center: [validCenter[1], validCenter[0]],
        duration: 1000,
        essential: true
      });
    }, 150);
    return () => window.clearTimeout(id);
  }, [validCenter[0], validCenter[1], mapReady]);

  // Handle UMKM markers (create/update/remove) without fitting bounds
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Remove old markers
    Object.keys(markers.current).forEach(id => {
      if (!umkmLocations.find(umkm => umkm.id === id)) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    });

    // Add or update markers
    umkmLocations.forEach(umkm => {
      const isSelected = selectedUMKM?.id === umkm.id;
      
      if (markers.current[umkm.id]) {
        // Update existing marker
        markers.current[umkm.id].setLngLat([umkm.lng, umkm.lat]);
        const element = markers.current[umkm.id].getElement();
        element.className = `custom-marker ${isSelected ? 'selected' : ''}`;
        element.innerHTML = createCustomMarker(umkm, isSelected).innerHTML;
      } else {
        // Create new marker
        const el = createCustomMarker(umkm, isSelected);
        
        const popup = new maplibregl.Popup({ 
          offset: 35,
          closeButton: false,
          closeOnClick: false,
          className: 'custom-popup-container'
        }).setHTML(createPopupContent(umkm));
        
        const marker = new maplibregl.Marker(el)
          .setLngLat([umkm.lng, umkm.lat])
          .setPopup(popup)
          .addTo(map.current!);
        
        el.addEventListener('click', () => {
          onSelectUMKM(umkm);
        });
        
        // Show popup on hover
        el.addEventListener('mouseenter', () => {
          marker.togglePopup();
        });
        
        el.addEventListener('mouseleave', () => {
          if (!isSelected) {
            marker.togglePopup();
          }
        });
        
        markers.current[umkm.id] = marker;
      }
    });

  }, [umkmLocations, selectedUMKM, onSelectUMKM, mapReady]);

  // Fit bounds when the list of locations changes (not on selection)
  useEffect(() => {
    if (!map.current || !mapReady || umkmLocations.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    umkmLocations.forEach(umkm => bounds.extend([umkm.lng, umkm.lat]));
    bounds.extend([validCenter[1], validCenter[0]]);
    map.current.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 80, right: 80 },
      maxZoom: 15,
      duration: 900
    });
  }, [umkmLocations, mapReady]);

  // Handle user marker with pulse animation
  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (userMarker.current) {
      userMarker.current.setLngLat([validCenter[1], validCenter[0]]);
    } else {
      const el = document.createElement('div');
      el.className = 'user-marker-container';
      el.innerHTML = `
        <div class="user-marker-pulse"></div>
        <div class="user-marker-pulse" style="animation-delay: 0.5s;"></div>
        <div class="user-marker-dot">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </div>
        ${userHeading !== null ? `
          <div class="user-marker-heading" style="transform: rotate(${userHeading}deg)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15 10L12 8L9 10Z"/>
            </svg>
          </div>
        ` : ''}
      `;
      
      const popup = new maplibregl.Popup({ offset: 25, className: 'user-popup' })
        .setHTML(`
          <div class="text-center font-semibold text-blue-600">
            📍 Lokasi Anda
          </div>
        `);
      
      userMarker.current = new maplibregl.Marker(el)
        .setLngLat([validCenter[1], validCenter[0]])
        .setPopup(popup)
        .addTo(map.current);
    }
  }, [validCenter[0], validCenter[1], userHeading, mapReady]);

  // Change map style
  const handleStyleChange = useCallback((style: typeof MAP_STYLES[0]) => {
    if (map.current) {
      map.current.setStyle(style.url);
      setCurrentStyle(style);
      setShowStyleSelector(false);
      
      // Wait for style to load before re-adding markers
      map.current.once('styledata', () => {
        setMapReady(true);
        setMapError(null);
        errorHandledRef.current = false;
      });
    }
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (map.current) {
      map.current.zoomIn({ duration: 500 });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (map.current) {
      map.current.zoomOut({ duration: 500 });
    }
  }, []);

  // Center on user location
  const handleCenterUser = useCallback(() => {
    if (map.current) {
      map.current.flyTo({
        center: [validCenter[1], validCenter[0]],
        zoom: 16,
        duration: 1500,
        essential: true
      });
    }
  }, [validCenter]);

  // Reset bearing and pitch
  const handleResetBearing = useCallback(() => {
    if (map.current) {
      map.current.easeTo({
        bearing: 0,
        pitch: 0,
        duration: 1000
      });
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-[9999]' : 'h-full w-full'}`}>
      {/* Loading State */}
      <AnimatePresence>
        {!mapReady && !mapError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 via-blue-100 to-pink-100 z-[100]"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity }
                }}
                className="mb-4"
              >
                <MapIcon className="w-16 h-16 text-orange-600 mx-auto" />
              </motion.div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-gray-700 font-semibold text-lg"
              >
                Memuat peta...
              </motion.p>
              <div className="flex gap-1 justify-center mt-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2 bg-orange-600 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {mapError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-[100]"
          >
            <div className="text-center p-8 max-w-md">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Oops! Map Error
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {mapError}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="h-full w-full"
        style={{ 
          opacity: mapReady ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }} 
      />

      {/* Custom Controls Overlay - FIXED Z-INDEX */}
      {mapReady && (
        <>
          {/* Top Controls - Increased Z-Index */}
          <div className="absolute top-3 sm:top-4 md:top-5 lg:top-6 left-3 sm:left-4 md:left-5 lg:left-6 right-3 sm:right-4 md:right-5 lg:right-6 z-[60] flex items-start justify-between gap-2 pointer-events-none">
            {/* Map Style Selector */}
            <div className="pointer-events-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStyleSelector(!showStyleSelector)}
                className="bg-white/95 backdrop-blur-lg p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-orange-200 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" />
                <span className="text-xs sm:text-sm font-bold text-gray-700 hidden sm:inline">
                  {currentStyle.name}
                </span>
                <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${showStyleSelector ? 'rotate-90' : ''}`} />
              </motion.button>

              {/* Style Selector Dropdown */}
              <AnimatePresence>
                {showStyleSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 bg-white/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border-2 border-orange-200"
                  >
                    {MAP_STYLES.map((style) => {
                      const Icon = style.icon;
                      return (
                        <motion.button
                          key={style.id}
                          whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
                          onClick={() => handleStyleChange(style)}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 transition-colors ${
                            currentStyle.id === style.id ? 'bg-orange-50' : ''
                          }`}
                        >
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${currentStyle.id === style.id ? 'text-orange-600' : 'text-gray-600'}`} />
                          <span className={`text-xs sm:text-sm font-bold ${currentStyle.id === style.id ? 'text-orange-600' : 'text-gray-700'}`}>
                            {style.name}
                          </span>
                          {currentStyle.id === style.id && (
                            <motion.div
                              layoutId="selectedStyle"
                              className="ml-auto w-2 h-2 bg-orange-600 rounded-full"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fullscreen Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullscreen}
              className="bg-white/95 backdrop-blur-lg p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-blue-200 pointer-events-auto"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
              ) : (
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
              )}
            </motion.button>
          </div>

          {/* Right Side Controls - Increased Z-Index */}
          <div className="absolute right-3 sm:right-4 md:right-5 lg:right-6 top-20 sm:top-24 md:top-28 z-[60] flex flex-col gap-2 sm:gap-2.5">
            {/* Zoom In */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              className="bg-white/95 backdrop-blur-lg p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-orange-200"
            >
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" />
            </motion.button>

            {/* Zoom Out */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              className="bg-white/95 backdrop-blur-lg p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-orange-200"
            >
              <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" />
            </motion.button>

            {/* Center on User */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCenterUser}
              className="bg-white/95 backdrop-blur-lg p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-blue-200 mt-1 sm:mt-2"
            >
              <Locate className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
            </motion.button>

            {/* Reset Bearing */}
            {(bearing !== 0 || pitch !== 0) && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetBearing}
                className="bg-white/95 backdrop-blur-lg p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-orange-200"
              >
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700" style={{ transform: `rotate(${-bearing}deg)` }} />
              </motion.button>
            )}
          </div>

          {/* Bottom Info Bar - Increased Z-Index */}
          <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 left-3 sm:left-4 md:left-5 lg:left-6 z-[60]">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/95 backdrop-blur-lg px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl shadow-xl border-2 border-orange-200"
            >
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                  <span className="font-bold text-gray-800">{umkmLocations.length}</span>
                  <span className="font-semibold hidden sm:inline">UMKM</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-gray-300"></div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Navigation2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  <span className="font-semibold">Live</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Custom CSS */}
      <style>{`
        /* Custom Marker Styles */
        .custom-marker {
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 40 !important;
        }

        .custom-marker:hover {
          transform: translateY(-5px);
          z-index: 50 !important;
        }

        .custom-marker.selected {
          z-index: 1000 !important;
        }

        .marker-pin {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 10px 20px rgba(249, 115, 22, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: bounce 2s infinite;
        }

        .marker-pin.marker-selected {
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
          width: 50px;
          height: 50px;
          box-shadow: 0 15px 30px rgba(59, 130, 246, 0.5);
        }

        .marker-icon {
          color: white;
          transform: rotate(45deg);
          font-size: 20px;
        }

        .marker-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.4);
          animation: pulse 2s infinite;
        }

        .marker-label {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 6px 12px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          white-space: nowrap;
          font-size: 12px;
          animation: fadeIn 0.3s ease;
          z-index: 1000;
        }

        /* User Marker Styles */
        .user-marker-container {
          position: relative;
          width: 40px;
          height: 40px;
          z-index: 50 !important;
        }

        .user-marker-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(66, 133, 244, 0.3);
          animation: userPulse 2s infinite;
        }

        .user-marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          background: #4285F4;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
          z-index: 2;
        }

        .user-marker-heading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #4285F4;
          animation: fadeIn 0.3s ease;
        }

        /* Popup Styles */
        .custom-popup-container {
          z-index: 70 !important;
        }

        .custom-popup-container .maplibregl-popup-content {
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          min-width: 280px;
          max-width: 320px;
        }

        .custom-popup-container .maplibregl-popup-tip {
          border-top-color: white;
        }

        .custom-popup {
          font-family: system-ui, -apple-system, sans-serif;
        }

        .popup-image-container {
          position: relative;
          height: 160px;
          overflow: hidden;
        }

        .popup-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .custom-popup:hover .popup-image {
          transform: scale(1.1);
        }

        .verified-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #3b82f6;
          color: white;
          padding: 6px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .popup-content {
          padding: 16px;
          background: white;
        }

        .popup-header {
          margin-bottom: 8px;
        }

        .popup-title {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .popup-category {
          display: inline-block;
          background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .popup-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .rating-stars {
          color: #fbbf24;
          font-size: 14px;
        }

        .rating-text {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .popup-info {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .popup-address {
          font-size: 12px;
          color: #9ca3af;
          line-height: 1.5;
        }

        /* Animations */
        @keyframes bounce {
          0%, 100% {
            transform: rotate(-45deg) translateY(0);
          }
          50% {
            transform: rotate(-45deg) translateY(-10px);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        @keyframes userPulse {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(0.8);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Map Controls */
        .maplibregl-ctrl-group {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px);
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
          border: 2px solid rgba(249, 115, 22, 0.2) !important;
        }

        .maplibregl-ctrl-group button {
          border-radius: 0 !important;
        }

        .maplibregl-ctrl-group button:first-child {
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px !important;
        }

        .maplibregl-ctrl-group button:last-child {
          border-bottom-left-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
        }

        .maplibregl-ctrl-scale {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px);
          border-radius: 8px !important;
          border: 2px solid rgba(249, 115, 22, 0.2) !important;
          padding: 4px 8px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #f97316 !important;
        }

        /* Ensure controls are always visible */
        .maplibregl-ctrl-top-right,
        .maplibregl-ctrl-bottom-right,
        .maplibregl-ctrl-bottom-left {
          z-index: 55 !important;
        }
      `}</style>
    </div>
  );
}