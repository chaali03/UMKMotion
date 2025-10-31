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
  Heart, Share2, ExternalLink, X, ChevronRight,
  CheckCircle, Circle, ArrowRight, Sparkles
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

// Create custom marker element
const createCustomMarker = (umkm: UMKMLocation, isSelected: boolean) => {
  const el = document.createElement('div');
  // Ensure we don't have empty class names
  const className = ['custom-marker'];
  if (isSelected) className.push('selected');
  el.className = className.join(' ').trim();
  
  // Get category color
  const categoryColors: { [key: string]: string } = {
    'Kuliner': '#ef4444',
    'Fashion': '#ec4899',
    'Kerajinan': '#f59e0b',
    'Teknologi': '#3b82f6'
  };
  
  const color = categoryColors[umkm.category] || '#8b5cf6';
  
  el.innerHTML = `
    <div class="marker-container">
      <div class="marker-pin" style="background: ${color};">
        <div class="marker-inner">
          ${umkm.verified ? 
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' :
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="8"/></svg>'
          }
        </div>
        <div class="marker-tail" style="background: ${color};"></div>
      </div>
      ${isSelected ? `
        <div class="marker-label">
          <span class="label-text">${umkm.name}</span>
          <div class="label-arrow" style="border-top-color: white;"></div>
        </div>
      ` : ''}
      <div class="marker-pulse" style="background: ${color};"></div>
      ${umkm.isOpen ? '<div class="marker-status"></div>' : ''}
    </div>
  `;
  
  return el;
};

// Create enhanced popup content
const createPopupContent = (umkm: UMKMLocation) => {
  return `
    <div class="enhanced-popup">
      <div class="popup-image-wrapper">
        <img src="${umkm.image}" alt="${umkm.name}" class="popup-image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'"/>
        <div class="popup-overlay">
          ${umkm.verified ? `
            <div class="verified-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Verified
            </div>
          ` : ''}
          <div class="category-badge">${umkm.category}</div>
        </div>
      </div>
      
      <div class="popup-body">
        <h3 class="popup-title">${umkm.name}</h3>
        
        <div class="popup-rating">
          <div class="rating-stars">
            ${'★'.repeat(Math.floor(umkm.rating))}${'☆'.repeat(5 - Math.floor(umkm.rating))}
          </div>
          <span class="rating-value">${umkm.rating}</span>
          <span class="rating-count">(${umkm.reviews})</span>
        </div>

        <div class="popup-info-grid">
          <div class="info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${umkm.distance} km</span>
          </div>
          
          <div class="info-item ${umkm.isOpen ? 'text-green' : 'text-red'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>${umkm.isOpen ? 'Buka Sekarang' : 'Tutup'}</span>
          </div>
          
          <div class="info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>Hubungi</span>
          </div>
          
          <div class="info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span>${umkm.products?.length || 0} Produk</span>
          </div>
        </div>

        <p class="popup-description">${umkm.description}</p>

        <div class="popup-actions">
          <button class="action-btn primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
            Lihat Detail
          </button>
          <button class="action-btn secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Rute
          </button>
        </div>
      </div>
    </div>
  `;
};

// Map styles
const MAP_STYLES = [
  {
    id: 'basic',
    name: 'Basic',
    url: 'https://api.maptiler.com/maps/basic-v2/style.json?key=zmmYiAMYNdgJx6UqpbNU',
    icon: MapIcon,
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'streets',
    name: 'Streets',
    url: 'https://api.maptiler.com/maps/streets-v2/style.json?key=zmmYiAMYNdgJx6UqpbNU',
    icon: Route,
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    url: 'https://api.maptiler.com/maps/outdoor-v2/style.json?key=zmmYiAMYNdgJx6UqpbNU',
    icon: TrendingUp,
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://api.maptiler.com/maps/hybrid/style.json?key=zmmYiAMYNdgJx6UqpbNU',
    icon: Satellite,
    preview: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
];

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
    center : [-6.2088, 106.8456];

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(MAP_STYLES[0]);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current || map.current) return;
    
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
        antialias: true,
        fadeDuration: 300
      });

      const navControl = new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: false,
        visualizePitch: true
      });
      
      map.current.addControl(navControl, 'top-right');
      
      const scale = new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      });
      map.current.addControl(scale, 'bottom-left');

      map.current.once('load', () => {
        setMapReady(true);
        
        if (map.current) {
          map.current.on('rotate', () => {
            setBearing(map.current?.getBearing() || 0);
          });
          
          map.current.on('pitch', () => {
            setPitch(map.current?.getPitch() || 0);
          });

          map.current.on('zoom', () => {
            setCurrentZoom(map.current?.getZoom() || zoom);
          });
        }
      });
      
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map');
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map center
  useEffect(() => {
    if (map.current && mapReady) {
      map.current.flyTo({
        center: [validCenter[1], validCenter[0]],
        duration: 1500,
        essential: true
      });
    }
  }, [validCenter[0], validCenter[1], mapReady]);

  // Handle UMKM markers
  useEffect(() => {
    if (!map.current || !mapReady) return;

    Object.keys(markers.current).forEach(id => {
      if (!umkmLocations.find(umkm => umkm.id === id)) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    });

    umkmLocations.forEach(umkm => {
      const isSelected = selectedUMKM?.id === umkm.id;
      
      if (markers.current[umkm.id]) {
        markers.current[umkm.id].setLngLat([umkm.lng, umkm.lat]);
        const element = markers.current[umkm.id].getElement();
        const className = ['custom-marker'];
        if (isSelected) className.push('selected');
        element.className = className.join(' ').trim();
        element.innerHTML = createCustomMarker(umkm, isSelected).innerHTML;
      } else {
        const el = createCustomMarker(umkm, isSelected);
        
        const popup = new maplibregl.Popup({ 
          offset: 40,
          closeButton: false,
          closeOnClick: false,
          className: 'enhanced-popup-container',
          maxWidth: '360px'
        }).setHTML(createPopupContent(umkm));
        
        const marker = new maplibregl.Marker(el)
            .setLngLat([umkm.lng, umkm.lat])
            .setPopup(popup)
          .addTo(map.current!);
          
        el.addEventListener('click', (e) => {
          e.stopPropagation();
              onSelectUMKM(umkm);
          marker.togglePopup();
        });
        
        el.addEventListener('mouseenter', () => {
          if (!isSelected) {
            marker.togglePopup();
          }
        });
        
        el.addEventListener('mouseleave', () => {
          if (!isSelected) {
            marker.togglePopup();
          }
        });
        
          markers.current[umkm.id] = marker;
        }
    });

    if (umkmLocations.length > 0 && map.current) {
      const bounds = new maplibregl.LngLatBounds();
      umkmLocations.forEach(umkm => {
        bounds.extend([umkm.lng, umkm.lat]);
      });
      bounds.extend([validCenter[1], validCenter[0]]);
      
      map.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 80, right: 80 },
        maxZoom: 15,
        duration: 1500
      });
    }
  }, [umkmLocations, selectedUMKM, onSelectUMKM, mapReady]);

  // Handle user marker
  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (userMarker.current) {
      userMarker.current.setLngLat([validCenter[1], validCenter[0]]);
    } else {
      const el = document.createElement('div');
      el.className = 'user-marker-enhanced';
      el.innerHTML = `
        <div class="user-pulse-ring"></div>
        <div class="user-pulse-ring" style="animation-delay: 0.5s;"></div>
        <div class="user-pulse-ring" style="animation-delay: 1s;"></div>
        <div class="user-dot">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </div>
      `;
      
      const popup = new maplibregl.Popup({ 
        offset: 25, 
        className: 'user-popup-enhanced' 
      }).setHTML(`
        <div class="user-popup-content">
          <div class="user-popup-icon">📍</div>
          <span class="user-popup-text">Lokasi Anda</span>
        </div>
      `);
      
      userMarker.current = new maplibregl.Marker(el)
        .setLngLat([validCenter[1], validCenter[0]])
        .setPopup(popup)
        .addTo(map.current);
    }
  }, [validCenter[0], validCenter[1], mapReady]);

  const handleStyleChange = useCallback((style: typeof MAP_STYLES[0]) => {
    if (map.current) {
      setMapReady(false);
      map.current.setStyle(style.url);
      setCurrentStyle(style);
      setShowStyleSelector(false);
      
      map.current.once('styledata', () => {
        setMapReady(true);
      });
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    map.current?.zoomIn({ duration: 500 });
  }, []);

  const handleZoomOut = useCallback(() => {
    map.current?.zoomOut({ duration: 500 });
  }, []);

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

  const handleResetBearing = useCallback(() => {
    map.current?.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 1000
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  return (
    <div className={`map-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Loading State */}
      <AnimatePresence>
        {!mapReady && !mapError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="map-loading"
          >
            <div className="loading-content">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity }
                }}
                className="loading-icon"
              >
                <MapIcon className="w-16 h-16 text-purple-600" />
              </motion.div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="loading-text"
              >
                Memuat peta interaktif...
              </motion.p>
              <div className="loading-dots">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -15, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="loading-dot"
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
            className="map-error"
          >
            <div className="error-content">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="error-icon"
              >
                <AlertCircle className="w-20 h-20 text-red-500" />
              </motion.div>
              <h3 className="error-title">Oops! Map Error</h3>
              <p className="error-message">{mapError}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="error-button"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Container */}
      <div ref={mapContainer} className="map-container" />

      {/* Custom Controls */}
      {mapReady && (
        <>
          {/* Top Left - Style Selector */}
          <div className="control-panel top-left">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStyleSelector(!showStyleSelector)}
              className="control-button main"
            >
              <Layers className="w-5 h-5" />
              <span className="button-text">{currentStyle.name}</span>
              <ChevronRight className={`w-4 h-4 chevron ${showStyleSelector ? 'rotate' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showStyleSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="style-selector"
                >
                  {MAP_STYLES.map((style) => {
                    const Icon = style.icon;
                    return (
                      <motion.button
                        key={style.id}
                        whileHover={{ x: 5 }}
                        onClick={() => handleStyleChange(style)}
                        className={`style-option ${currentStyle.id === style.id ? 'active' : ''}`}
                      >
                        <div className="style-preview" style={{ background: style.preview }}></div>
                        <Icon className="style-icon" />
                        <span className="style-name">{style.name}</span>
                        {currentStyle.id === style.id && (
                          <CheckCircle className="check-icon" />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Top Right - Fullscreen */}
          <div className="control-panel top-right">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullscreen}
              className="control-button icon-only"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Right Side - Zoom & Location Controls */}
          <div className="control-panel right">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              className="control-button icon-only"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </motion.button>

            <div className="zoom-level">
              {currentZoom.toFixed(1)}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              className="control-button icon-only"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </motion.button>

            <div className="control-divider"></div>

            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCenterUser}
              className="control-button icon-only highlight"
              title="Center on My Location"
            >
              <Locate className="w-5 h-5" />
            </motion.button>

            {(bearing !== 0 || pitch !== 0) && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetBearing}
                className="control-button icon-only"
                title="Reset Bearing"
              >
                <Compass className="w-5 h-5" style={{ transform: `rotate(${-bearing}deg)` }} />
              </motion.button>
            )}
          </div>

          {/* Bottom - Info Bar */}
          <div className="control-panel bottom">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="info-bar"
            >
              <div className="info-item">
                <Store className="info-icon" />
                <span className="info-text">
                  <strong>{umkmLocations.length}</strong> UMKM
                </span>
              </div>
              <div className="info-divider"></div>
              <div className="info-item">
                <Navigation2 className="info-icon animate-pulse" />
                <span className="info-text">Live Tracking</span>
              </div>
              <div className="info-divider"></div>
              <div className="info-item">
                <Sparkles className="info-icon" />
                <span className="info-text">Interactive Map</span>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Styles */}
      <style jsx="true" global="true">{`
        .map-wrapper {
          position: relative;
          height: 100%;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .map-wrapper.fullscreen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          border-radius: 0;
        }

        .map-container {
          height: 100%;
          width: 100%;
        }

        /* Loading State */
        .map-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          z-index: 20;
        }

        .loading-content {
          text-align: center;
          color: white;
        }

        .loading-text {
          margin-top: 1rem;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .loading-dots {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .loading-dot {
          width: 0.5rem;
          height: 0.5rem;
          background: white;
          border-radius: 50%;
        }

        /* Error State */
        .map-error {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          z-index: 20;
        }

        .error-content {
          text-align: center;
          padding: 2rem;
          max-width: 400px;
        }

        .error-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 1rem 0 0.5rem;
        }

        .error-message {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .error-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 0.75rem;
          font-weight: 600;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
          border: none;
          cursor: pointer;
        }

        /* Control Panels */
        .control-panel {
          position: absolute;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-panel.top-left {
          top: 1rem;
          left: 1rem;
        }

        .control-panel.top-right {
          top: 1rem;
          right: 1rem;
        }

        .control-panel.right {
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
        }

        .control-panel.bottom {
          bottom: 1rem;
          left: 1rem;
        }

        .control-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 0.75rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          cursor: pointer;
          transition: all 0.3s ease;
          color: #374151;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .control-button:hover {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
          transform: translateY(-2px);
        }

        .control-button.icon-only {
          padding: 0.75rem;
        }

        .control-button.highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .control-button.main {
          min-width: 140px;
          justify-content: space-between;
        }

        .button-text {
          flex: 1;
          text-align: left;
        }

        .chevron {
          transition: transform 0.3s ease;
        }

        .chevron.rotate {
          transform: rotate(90deg);
        }

        .control-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin: 0.25rem 0;
        }

        .zoom-level {
          text-align: center;
          padding: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #667eea;
        }

        /* Style Selector */
        .style-selector {
          margin-top: 0.5rem;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 0.75rem;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .style-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 1rem;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .style-option:hover {
          background: rgba(102, 126, 234, 0.08);
        }

        .style-option.active {
          background: rgba(102, 126, 234, 0.12);
        }

        .style-preview {
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .style-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #6b7280;
        }

        .style-name {
          flex: 1;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .check-icon {
          width: 1.125rem;
          height: 1.125rem;
          color: #667eea;
        }

        /* Info Bar */
        .info-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1.25rem;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 0.75rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-icon {
          width: 1.125rem;
          height: 1.125rem;
          color: #667eea;
        }

        .info-text {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .info-text strong {
          color: #1f2937;
          font-weight: 700;
        }

        .info-divider {
          width: 1px;
          height: 1.25rem;
          background: rgba(0, 0, 0, 0.1);
        }

        /* Custom Markers */
        .marker-container {
          position: relative;
          cursor: pointer;
        }

        .marker-pin {
          position: relative;
          width: 40px;
          height: 50px;
          background: #667eea;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: markerBounce 2s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        .custom-marker:hover .marker-pin {
          transform: rotate(-45deg) scale(1.15);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
        }

        .custom-marker.selected .marker-pin {
          width: 50px;
          height: 62px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
        }

        .marker-inner {
          transform: rotate(45deg);
        }

        .marker-tail {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 12px;
          height: 12px;
          background: inherit;
          border-radius: 0 0 4px 0;
        }

        .marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: rgba(102, 126, 234, 0.3);
          border-radius: 50%;
          animation: markerPulse 2s ease-out infinite;
        }

        .marker-status {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 14px;
          height: 14px;
          background: #10b981;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
          animation: statusPulse 2s ease-in-out infinite;
        }

        .marker-label {
          position: absolute;
          top: -45px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 0.5rem 0.875rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          white-space: nowrap;
          animation: labelFadeIn 0.3s ease;
        }

        .label-text {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1f2937;
        }

        .label-arrow {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid white;
        }

        /* User Marker */
        .user-marker-enhanced {
          position: relative;
          width: 50px;
          height: 50px;
        }

        .user-pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(66, 133, 244, 0.25);
          animation: userPulseRing 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .user-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: #4285f4;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4);
          z-index: 2;
        }

        /* Popup Styles */
        .enhanced-popup-container .maplibregl-popup-content {
          padding: 0;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          min-width: 320px;
          max-width: 360px;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .enhanced-popup-container .maplibregl-popup-tip {
          border-top-color: white;
        }

        .enhanced-popup {
          font-family: system-ui, -apple-system, sans-serif;
        }

        .popup-image-wrapper {
          position: relative;
          height: 180px;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .popup-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .enhanced-popup:hover .popup-image {
          transform: scale(1.1);
        }

        .popup-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .verified-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          background: rgba(59, 130, 246, 0.95);
          backdrop-filter: blur(10px);
          color: white;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .category-badge {
          padding: 0.375rem 0.875rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          color: #667eea;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .popup-body {
          padding: 1.25rem;
          background: white;
        }

        .popup-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .popup-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .rating-stars {
          color: #fbbf24;
          font-size: 1rem;
          letter-spacing: 0.125rem;
        }

        .rating-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1f2937;
        }

        .rating-count {
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .popup-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 600;
        }

        .info-item.text-green {
          color: #10b981;
        }

        .info-item.text-red {
          color: #ef4444;
        }

        .popup-description {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .popup-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .action-btn.primary:hover {
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
          transform: translateY(-2px);
        }

        .action-btn.secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .action-btn.secondary:hover {
          background: rgba(102, 126, 234, 0.08);
        }

        .user-popup-enhanced .maplibregl-popup-content {
          background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          box-shadow: 0 8px 24px rgba(66, 133, 244, 0.3);
        }

        .user-popup-enhanced .maplibregl-popup-tip {
          border-top-color: #4285f4;
        }

        .user-popup-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .user-popup-icon {
          font-size: 1.25rem;
        }

        /* Animations */
        @keyframes markerBounce {
          0%, 100% {
            transform: rotate(-45deg) translateY(0);
          }
          50% {
            transform: rotate(-45deg) translateY(-12px);
          }
        }

        @keyframes markerPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes statusPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes labelFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes userPulseRing {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .control-panel.top-left,
          .control-panel.top-right,
          .control-panel.right,
          .control-panel.bottom {
            transform: scale(0.9);
          }

          .info-bar {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }

          .info-divider {
            width: 100%;
            height: 1px;
          }
        }
      `}</style>
    </div>
  );
}