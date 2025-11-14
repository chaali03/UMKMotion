"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import maplibregl from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import '../mapbox-custom.css';
import type { UMKMLocation } from '../types';
import {
  MapPin, Layers, Search, X, Locate,
  Star, Clock, Phone, ExternalLink, Maximize2, Minimize2,
  Navigation, Share2, Heart, Globe, Instagram, Mail,
  Award, TrendingUp, DollarSign, Calendar, MessageCircle,
  Navigation2, Compass, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ========================================
// WORKER SETUP - ENHANCED
// ========================================
if (typeof window !== 'undefined') {
  try {
    // Define __publicField if not exists
    if (typeof (window as any).__publicField === 'undefined') {
      (window as any).__publicField = function(obj: any, key: string, value: any) {
        if (typeof obj === 'object' && obj !== null) {
          try {
            Object.defineProperty(obj, key, {
              enumerable: true,
              configurable: true,
              writable: true,
              value: value
            });
          } catch {
            obj[key] = value;
          }
        }
        return value;
      };
    }
    
    // Set MapLibre worker URL
    if (typeof maplibregl !== 'undefined' && maplibregl) {
      (maplibregl as any).workerUrl = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl-csp-worker.js';
      (maplibregl as any).workerCount = 2;
    }
  } catch (e) {
    console.warn('MapLibre worker setup warning:', e);
  }
}

interface MapboxComponentProps {
  center: [number, number];
  umkmLocations: UMKMLocation[];
  selectedUMKM: UMKMLocation | null;
  onSelectUMKM: (umkm: UMKMLocation) => void;
  zoom?: number;
}

// ========================================
// HELPER FUNCTIONS
// ========================================
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

const formatSpeed = (metersPerSecond: number): string => {
  const kmh = metersPerSecond * 3.6;
  return `${Math.round(kmh)} km/h`;
};

// Safe geolocation wrapper
const safeGeolocation = {
  getCurrentPosition: (success: PositionCallback, error?: PositionErrorCallback, options?: PositionOptions) => {
    if (navigator.geolocation && typeof navigator.geolocation.getCurrentPosition === 'function') {
      return navigator.geolocation.getCurrentPosition(success, error, options);
    }
    error?.(new Error('Geolocation not supported') as any);
  },
  watchPosition: (success: PositionCallback, error?: PositionErrorCallback, options?: PositionOptions): number | null => {
    if (navigator.geolocation && typeof navigator.geolocation.watchPosition === 'function') {
      return navigator.geolocation.watchPosition(success, error, options);
    }
    return null;
  },
  clearWatch: (watchId: number | null) => {
    if (watchId !== null && navigator.geolocation && typeof navigator.geolocation.clearWatch === 'function') {
      navigator.geolocation.clearWatch(watchId);
    }
  }
};

// ========================================
// MAP STYLES
// ========================================
const MAP_TYPES = [
  {
    id: 'osm',
    name: 'Streets',
    url: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
          maxzoom: 19
        }
      },
      layers: [{ id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 }],
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
    }
  },
  {
    id: 'esri-satellite',
    name: 'Satellite',
    url: {
      version: 8,
      sources: {
        esri_sat: {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Source: Esri, Maxar, Earthstar Geographics',
          maxzoom: 19
        }
      },
      layers: [{ id: 'esri_sat', type: 'raster', source: 'esri_sat' }],
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
    }
  },
  {
    id: 'esri-terrain',
    name: 'Terrain',
    url: {
      version: 8,
      sources: {
        esri_topo: {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Source: Esri, HERE, Garmin, Intermap, and the GIS user community',
          maxzoom: 19
        }
      },
      layers: [{ id: 'esri_topo', type: 'raster', source: 'esri_topo' }],
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
    }
  }
];

// ========================================
// CATEGORY COLORS
// ========================================
const CATEGORY_COLORS: { [key: string]: string } = {
  'Kuliner': '#ea4335',
  'Fashion': '#4285f4',
  'Kerajinan': '#fbbc04',
  'Teknologi': '#34a853',
  'Jasa': '#9334e6',
  'Pertanian': '#16a34a',
  'Kesehatan': '#dc2626',
  'Pendidikan': '#2563eb',
  'Default': '#ea4335'
};

// ========================================
// MARKER FUNCTION
// ========================================
const createGoogleMarker = (umkm: UMKMLocation, isSelected: boolean) => {
  const el = document.createElement('div');
  el.className = isSelected ? 'gmap-marker selected' : 'gmap-marker';

  const color = CATEGORY_COLORS[umkm.category] || CATEGORY_COLORS['Default'];

  el.innerHTML = `
    <div class="gmap-pin" style="background-color: ${color};">
      <div class="gmap-pin-top"></div>
    </div>
    <div class="gmap-shadow"></div>
  `;

  return el;
};

// ========================================
// POPUP FUNCTION
// ========================================
const createGooglePopup = (umkm: UMKMLocation) => {
  const stars = '★'.repeat(Math.floor(umkm.rating)) + '☆'.repeat(5 - Math.floor(umkm.rating));
  const photosLabel = umkm.photos && umkm.photos.length ? `${umkm.photos.length} Foto` : 'Foto';

  const openingHours = (umkm as any).openingHours || umkm.openHours || 'Jam tidak tersedia';
  const address = umkm.address || '';
  const phone = umkm.phone || '';
  const website = (umkm as any).website || '';
  const priceRange = (umkm as any).priceRange || 'Rp 10.000 - 50.000';
  const totalVisits = (umkm as any).totalVisits || '1.000+';
  const isOpen = umkm.isOpen !== false;

  const featuredProducts = (umkm as any).featuredProducts || (umkm.products ? umkm.products.slice(0, 3).map((p: any) => ({
    name: p.name,
    price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
    image: p.image
  })) : []);

  const galleryImages: string[] = (umkm as any).galleryImages || umkm.photos || [];

  const topReview = (umkm as any).topReview || {
    author: 'Pengguna Google',
    rating: Math.round(umkm.rating),
    text: umkm.description || 'Tempat yang bagus dengan pelayanan ramah.',
    date: '1 minggu yang lalu'
  };

  return `<div class="gmap-popup-enhanced">
    <div class="gmap-hero">
      <div class="gmap-hero-track">
        ${[umkm.image, ...(galleryImages || [])]
          .filter(Boolean)
          .slice(0, 5)
          .map(img => 
            `<img src="${img}"
                  alt="${umkm.name}"
                  class="gmap-hero-img"
                  loading="lazy" 
                  onerror="this.src='https://placehold.co/600x300/e5e3df/5f6368?text=UMKM'"/>`
          ).join('')}
      </div>
      <button class="gmap-hero-nav prev" onclick="const t=this.closest('.gmap-hero').querySelector('.gmap-hero-track'); t && t.scrollBy({left:-Math.max(280, t.clientWidth*0.9), behavior:'smooth'});" aria-label="Prev">‹</button>
      <button class="gmap-hero-nav next" onclick="const t=this.closest('.gmap-hero').querySelector('.gmap-hero-track'); t && t.scrollBy({left:Math.max(280, t.clientWidth*0.9), behavior:'smooth'});" aria-label="Next">›</button>
      <div class="gmap-hero-overlay">
        <div class="gmap-photo-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>${photosLabel}</span>
        </div>
        ${umkm.verified ? `
          <div class="gmap-verified-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Terverifikasi
          </div>
        ` : ''}
      </div>
      <button class="gmap-hero-favorite" onclick="this.classList.toggle('active')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </button>
    </div>
    <div class="gmap-content">
      <div class="gmap-header">
        <h3 class="gmap-title">${umkm.name}</h3>
        <div class="gmap-meta">
          <div class="gmap-chips">
            <span class="gmap-chip category">${umkm.category}</span>
            <span class="gmap-chip status ${isOpen ? 'open' : 'closed'}">
              <span class="status-dot"></span>
              ${isOpen ? 'Buka' : 'Tutup'}
            </span>
          </div>
        </div>
      </div>
      <div class="gmap-stats">
        <div class="gmap-rating-box">
          <div class="gmap-rating-main">
            <span class="gmap-rating-number">${umkm.rating}</span>
            <div class="gmap-stars">${stars}</div>
          </div>
          <div class="gmap-rating-meta">
            <span class="gmap-reviews">${umkm.reviews} ulasan</span>
            <span class="gmap-separator">•</span>
            <span class="gmap-visits">${totalVisits} pengunjung</span>
          </div>
        </div>
        <div class="gmap-price-range">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          ${priceRange}
        </div>
      </div>
      <div class="gmap-actions">
        <button class="gmap-action-btn primary" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${umkm.lat},${umkm.lng}', '_blank')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
          </svg>
          <span>Rute</span>
        </button>
        <button class="gmap-action-btn" onclick="window.open('tel:${phone}', '_blank')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
          </svg>
          <span>Telepon</span>
        </button>
        <button class="gmap-action-btn" onclick="navigator.share ? navigator.share({title: '${umkm.name}', text: '${umkm.description}', url: window.location.href}) : alert('Share tidak didukung')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Bagikan</span>
        </button>
        <button class="gmap-action-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"></path>
          </svg>
          <span>Simpan</span>
        </button>
      </div>
      <div class="gmap-details">
        <div class="gmap-detail-item">
          <svg class="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <div class="detail-content">
            <div class="detail-label">Jam Buka</div>
            <div class="detail-value">${openingHours}</div>
          </div>
        </div>
        <div class="gmap-detail-item">
          <svg class="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <div class="detail-content">
            <div class="detail-label">Alamat</div>
            <div class="detail-value">${address}</div>
          </div>
        </div>
        ${phone ? `
        <div class="gmap-detail-item">
          <svg class="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
          </svg>
          <div class="detail-content">
            <div class="detail-label">Telepon</div>
            <div class="detail-value clickable" onclick="window.open('tel:${phone}')">${phone}</div>
          </div>
        </div>
        ` : ''}
        ${website ? `
        <div class="gmap-detail-item">
          <svg class="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path>
          </svg>
          <div class="detail-content">
            <div class="detail-label">Website</div>
            <div class="detail-value clickable" onclick="window.open('${website}', '_blank')">${website}</div>
          </div>
        </div>
        ` : ''}
      </div>
      ${featuredProducts.length > 0 ? `
      <div class="gmap-section">
        <h4 class="gmap-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          Menu Unggulan
        </h4>
        <div class="gmap-products">
          ${featuredProducts.map((product: any) => `
            <div class="gmap-product-card">
              <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://placehold.co/200x150/e5e3df/5f6368?text=Product'"/>
              <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      <div class="gmap-section">
        <h4 class="gmap-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
          </svg>
          Ulasan Teratas
        </h4>
        <div class="gmap-review-card">
          <div class="review-header">
            <div class="review-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="review-meta">
              <div class="review-author">${topReview.author}</div>
              <div class="review-stars">${'★'.repeat(topReview.rating)}</div>
            </div>
            <div class="review-date">${topReview.date}</div>
          </div>
          <div class="review-text">${topReview.text}</div>
        </div>
      </div>
      ${galleryImages.length > 0 ? `
      <div class="gmap-section">
        <h4 class="gmap-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          Galeri Foto
        </h4>
        <div class="gmap-gallery">
          ${galleryImages.slice(0, 4).map((img: string, idx: number) => `
            <div class="gmap-gallery-item">
              <img src="${img}" alt="Gallery ${idx + 1}" loading="lazy" onerror="this.src='https://placehold.co/300x200/e5e3df/5f6368?text=Photo'"/>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      <div class="gmap-section">
        <h4 class="gmap-section-title">Tentang</h4>
        <div class="gmap-description">${umkm.description || 'UMKM yang menyediakan produk berkualitas dengan pelayanan terbaik.'}</div>
      </div>
      ${website ? `
      <div class="gmap-footer">
        <button class="gmap-footer-btn full" onclick="window.open('${website}', '_blank')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Kunjungi Website
        </button>
      </div>
      ` : ''}
    </div>
  </div>`;
};

// ========================================
// MAIN COMPONENT
// ========================================
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

  const [mapReady, setMapReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentMapType, setCurrentMapType] = useState(MAP_TYPES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const geoWatchId = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastUserLocationRef = useRef<{ lat: number; lon: number } | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
  } | null>(null);
  
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'low' | 'high' | 'off'>('off');
  const [nearestUMKM, setNearestUMKM] = useState<{ umkm: UMKMLocation; distance: number } | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [compassHeading, setCompassHeading] = useState(0);

  const filteredLocations = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return umkmLocations;
    return umkmLocations.filter((umkm) => {
      const rawValues = [
        umkm.name,
        umkm.category,
        umkm.address,
        (umkm as any).city,
        Array.isArray((umkm as any).tags) ? (umkm as any).tags.join(' ') : undefined
      ];
      const normalizedValues = rawValues
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
        .map((value) => value.toLowerCase());

      return normalizedValues.some((value) => value.includes(keyword));
    });
  }, [searchQuery, umkmLocations]);

  const validCenter: [number, number] = Array.isArray(center) && center.length === 2 ? center : [-6.2088, 106.8456];

  useEffect(() => {
    if (userLocation && umkmLocations.length > 0) {
      let nearest = null;
      let minDistance = Infinity;

      umkmLocations.forEach(umkm => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          umkm.lat,
          umkm.lng
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = { umkm, distance };
        }
      });

      setNearestUMKM(nearest);
    }
  }, [userLocation, umkmLocations]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setCompassHeading(event.alpha);
      }
    };

    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (!mapReady) {
      setOverlayVisible(true);
      return;
    }
    const timeout = window.setTimeout(() => setOverlayVisible(false), 320);
    return () => window.clearTimeout(timeout);
  }, [mapReady]);

  useEffect(() => {
    const cls = 'map-fullscreen-active';
    if (typeof document !== 'undefined') {
      if (isFullscreen) {
        document.body.classList.add(cls);
      } else {
        document.body.classList.remove(cls);
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove(cls);
      }
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current || map.current) return;

    setIsInitializing(true);

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: currentMapType.url as any,
        center: [validCenter[1], validCenter[0]],
        zoom: zoom,
        fadeDuration: 100,
        attributionControl: false,
        cooperativeGestures: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        maxTileCacheSize: 50,
        refreshExpiredTiles: true,
        crossSourceCollisions: false
      });

      map.current.addControl(
        new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 
        'bottom-left'
      );

      map.current.on('error', (e) => {
        console.warn('Map error:', e);
      });

      map.current.on('styleimagemissing', (e: any) => {
        const id = (e?.id ?? '').toString();
        if (!id || (map.current && map.current.hasImage(id))) return;
        
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size; 
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.clearRect(0, 0, size, size);
          ctx.beginPath();
          ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
          ctx.fillStyle = '#9ca3af';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#6b7280';
          ctx.stroke();
          
          const data = ctx.getImageData(0, 0, size, size);
          try {
            if (id && map.current && !map.current.hasImage(id)) {
              map.current.addImage(id, data, { pixelRatio: 2 });
            }
          } catch (err) {
            console.warn('Failed to add placeholder image:', err);
          }
        }
      });

      map.current.once('load', () => {
        setIsInitializing(false);
        
        map.current?.jumpTo({
          center: [validCenter[1], validCenter[0]],
          zoom: zoom,
          bearing: 0,
          pitch: 0
        });
        
        setMapReady(true);
      });

      const loadTimeout = setTimeout(() => {
        if (!mapReady) {
          setMapReady(true);
          setIsInitializing(false);
        }
      }, 10000);

      return () => {
        clearTimeout(loadTimeout);
      };
      
    } catch (error) {
      console.error('Map initialization error:', error);
      setMapReady(true);
      setIsInitializing(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

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
      } else {
        const el = createGoogleMarker(umkm, isSelected);
        
        const popup = new maplibregl.Popup({ 
          offset: 25,
          closeButton: true,
          className: 'gmap-popup-container-enhanced',
          maxWidth: '380px'
        }).setHTML(createGooglePopup(umkm));
        
        const marker = new maplibregl.Marker(el)
          .setLngLat([umkm.lng, umkm.lat])
          .setPopup(popup)
          .addTo(map.current!);
          
        el.addEventListener('click', () => {
          onSelectUMKM(umkm);
          marker.togglePopup();
        });
        
        markers.current[umkm.id] = marker;
      }
    });
  }, [umkmLocations, selectedUMKM, onSelectUMKM, mapReady]);

  useEffect(() => {
    if (!map.current || !mapReady) return;
    
    setGpsStatus('searching');
    safeGeolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        
        setGpsStatus(accuracy < 20 ? 'high' : 'low');
        setUserLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy || 0,
          speed: speed,
          heading: heading
        });
        
        if (!userMarker.current) {
          const el = document.createElement('div');
          el.className = 'gmap-user-location';
          el.innerHTML = `
            <div class="user-accuracy-circle" style="width: ${Math.min(accuracy * 2, 200)}px; height: ${Math.min(accuracy * 2, 200)}px;"></div>
            <div class="user-pulse-ring"></div>
            ${heading !== null ? `<div class="user-direction-arrow" style="transform: rotate(${heading}deg);"></div>` : ''}
            <div class="user-outer-circle">
              <div class="user-inner-dot"></div>
            </div>
          `;
          userMarker.current = new maplibregl.Marker({ 
            element: el, 
            anchor: 'center',
            pitchAlignment: 'map',
            rotationAlignment: 'map'
          })
            .setLngLat([longitude, latitude])
            .addTo(map.current!);
        } else {
          userMarker.current.setLngLat([longitude, latitude]);
          const el = userMarker.current.getElement();
          const accuracyEl = el.querySelector('.user-accuracy-circle') as HTMLElement;
          if (accuracyEl) {
            const size = Math.min(accuracy * 2, 200);
            accuracyEl.style.width = `${size}px`;
            accuracyEl.style.height = `${size}px`;
          }
          
          if (heading !== null) {
            let arrowEl = el.querySelector('.user-direction-arrow') as HTMLElement;
            if (!arrowEl) {
              arrowEl = document.createElement('div');
              arrowEl.className = 'user-direction-arrow';
              el.querySelector('.user-pulse-ring')?.after(arrowEl);
            }
            arrowEl.style.transform = `rotate(${heading}deg)`;
          }
        }
      },
      () => {
        setGpsStatus('off');
      },
      { enableHighAccuracy: true, timeout: 3500, maximumAge: 60000 }
    );
  }, [mapReady]);

  useEffect(() => {
    if (!map.current) return;
    const handler = () => setIsFollowing(false);
    map.current.on('dragstart', handler);
    return () => { 
      map.current && map.current.off('dragstart', handler); 
    };
  }, [mapReady]);

  const handleMapTypeChange = useCallback((mapType: typeof MAP_TYPES[0]) => {
    if (map.current) {
      setMapReady(false);
      const currentCenter = map.current.getCenter();
      const currentZoom = map.current.getZoom();

      try {
        map.current.setStyle(mapType.url as any);
        setCurrentMapType(mapType);
        
        map.current.once('styledata', () => {
          setTimeout(() => {
            map.current?.jumpTo({
              center: currentCenter,
              zoom: currentZoom,
              bearing: 0,
              pitch: 0
            });
            setMapReady(true);
          }, 300);
        });
      } catch (error) {
        console.error('Style change error:', error);
        setMapReady(true);
      }
    }
  }, []);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();

  const handleLocateMe = () => {
    const m = map.current;
    if (!m) {
      alert('Peta belum siap');
      return;
    }

    const toggleOn = !isFollowing;
    setIsLocating(true);

    if (toggleOn) {
      setGpsStatus('searching');
      safeGeolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy, speed, heading } = pos.coords;

          lastUserLocationRef.current = { lat: latitude, lon: longitude };
          setGpsStatus(accuracy < 20 ? 'high' : 'low');
          setUserLocation({
            lat: latitude,
            lng: longitude,
            accuracy: accuracy || 0,
            speed: speed,
            heading: heading
          });

          if (userMarker.current) {
            userMarker.current.setLngLat([longitude, latitude]);
            const el = userMarker.current.getElement();
            const accuracyEl = el.querySelector('.user-accuracy-circle') as HTMLElement;
            if (accuracyEl) {
              const size = Math.min(accuracy * 2, 200);
              accuracyEl.style.width = `${size}px`;
              accuracyEl.style.height = `${size}px`;
            }
            
            if (heading !== null) {
              let arrowEl = el.querySelector('.user-direction-arrow') as HTMLElement;
              if (!arrowEl) {
                arrowEl = document.createElement('div');
                arrowEl.className = 'user-direction-arrow';
                el.querySelector('.user-pulse-ring')?.after(arrowEl);
              }
              arrowEl.style.transform = `rotate(${heading}deg)`;
            }
          } else {
            const el = document.createElement('div');
            el.className = 'gmap-user-location';
            el.innerHTML = `
              <div class="user-accuracy-circle" style="width: ${Math.min(accuracy * 2, 200)}px; height: ${Math.min(accuracy * 2, 200)}px;"></div>
              <div class="user-pulse-ring"></div>
              ${heading !== null ? `<div class="user-direction-arrow" style="transform: rotate(${heading}deg);"></div>` : ''}
              <div class="user-outer-circle">
                <div class="user-inner-dot"></div>
              </div>
            `;
            userMarker.current = new maplibregl.Marker({ 
              element: el, 
              anchor: 'center',
              pitchAlignment: 'map',
              rotationAlignment: 'map'
            })
              .setLngLat([longitude, latitude])
              .addTo(m);
          }

          const initialZoom = m.getZoom();
          m.flyTo({
            center: [longitude, latitude],
            zoom: initialZoom < 15 ? 16.5 : initialZoom,
            duration: 1000,
            essential: true
          });

          setIsFollowing(true);
          setIsLocating(false);

          if (geoWatchId.current == null) {
            const watchId = safeGeolocation.watchPosition(
              (p) => {
                const { latitude: lat, longitude: lon, accuracy: acc, speed: spd, heading: hdg } = p.coords;
                lastUserLocationRef.current = { lat, lon };
                
                setGpsStatus(acc < 20 ? 'high' : 'low');
                setUserLocation({
                  lat,
                  lng: lon,
                  accuracy: acc || 0,
                  speed: spd,
                  heading: hdg
                });
                
                if (userMarker.current) {
                  userMarker.current.setLngLat([lon, lat]);
                  
                  const el = userMarker.current.getElement();
                  const accuracyCircle = el?.querySelector('.user-accuracy-circle') as HTMLElement;
                  if (accuracyCircle && acc) {
                    const size = Math.min(acc * 2, 200);
                    accuracyCircle.style.width = `${size}px`;
                    accuracyCircle.style.height = `${size}px`;
                  }
                  
                  if (hdg !== null) {
                    let arrowEl = el.querySelector('.user-direction-arrow') as HTMLElement;
                    if (!arrowEl) {
                      arrowEl = document.createElement('div');
                      arrowEl.className = 'user-direction-arrow';
                      el.querySelector('.user-pulse-ring')?.after(arrowEl);
                    }
                    arrowEl.style.transform = `rotate(${hdg}deg)`;
                  }
                }

                if (isFollowing && m) {
                  m.easeTo({
                    center: [lon, lat],
                    duration: 320,
                    essential: false
                  });
                }
              },
              () => {
                setGpsStatus('off');
              },
              { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
            );
            geoWatchId.current = watchId;
          }
        },
        () => {
          setIsLocating(false);
          setGpsStatus('off');
          alert('Tidak dapat mengakses lokasi');
        },
        { enableHighAccuracy: true, timeout: 12000 }
      );
    } else {
      // Stop tracking
      safeGeolocation.clearWatch(geoWatchId.current);
      geoWatchId.current = null;
      setIsLocating(false);
      setIsFollowing(false);
      setGpsStatus('off');
    }
  };

  useEffect(() => {
    return () => {
      safeGeolocation.clearWatch(geoWatchId.current);
      geoWatchId.current = null;
    };
  }, []);

  const showLoader = overlayVisible || isInitializing || !mapReady;
  const revealMap = mapReady && !showLoader;

  return (
    <div className={`gmap-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="gmap-loader"
            className="gmap-loader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <motion.div
              className="loader-wrap"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="loader-icon">
                <MapPin size={48} strokeWidth={2} />
              </div>
              <p>Memuat peta interaktif...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {mapReady && (
        <div className="gmap-search-wrapper">
          <motion.div
            className="gmap-search-box"
            layout
            initial={false}
            animate={isSearchOpen ? 'open' : 'closed'}
            variants={{
              open: { width: 'min(280px, 70vw)', paddingLeft: 14, paddingRight: 8 },
              closed: { width: 48, paddingLeft: 0, paddingRight: 0 }
            }}
            transition={{ duration: 0.18 }}
            onClick={() => { if (!isSearchOpen) setIsSearchOpen(true); }}
          >
            <Search className="gmap-search-icon" size={18} />
            <motion.input
              type="text"
              placeholder="Cari UMKM"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="gmap-search-input"
              ref={searchInputRef}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }
              }}
              animate={isSearchOpen ? { opacity: 1, width: 'auto' } : { opacity: 0, width: 0 }}
            />
            {isSearchOpen && searchQuery && (
              <button onClick={() => setSearchQuery('')} className="gmap-search-clear">
                <X size={16} />
              </button>
            )}
            {isSearchOpen && !searchQuery && (
              <button onClick={() => setIsSearchOpen(false)} className="gmap-search-close">
                <X size={16} />
              </button>
            )}
          </motion.div>
        </div>
      )}

      {mapReady && gpsStatus !== 'off' && (
        <motion.div
          className={`gps-status-indicator ${gpsStatus}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="gps-icon">
            {gpsStatus === 'searching' && <Activity size={14} className="searching-icon" />}
            {gpsStatus === 'low' && <Navigation size={14} />}
            {gpsStatus === 'high' && <Navigation2 size={14} />}
          </div>
          <span>
            {gpsStatus === 'searching' && 'Mencari lokasi...'}
            {gpsStatus === 'low' && `Akurasi: ${userLocation?.accuracy.toFixed(0)}m`}
            {gpsStatus === 'high' && 'GPS Akurat'}
          </span>
        </motion.div>
      )}

      <AnimatePresence>
        {showUserInfo && userLocation && (
          <motion.div
            className="user-info-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="info-header">
              <Compass size={18} />
              <span>Informasi Lokasi</span>
              <button onClick={() => setShowUserInfo(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="info-content">
              <div className="info-row">
                <span className="info-label">Koordinat:</span>
                <span className="info-value">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Akurasi:</span>
                <span className="info-value">{userLocation.accuracy.toFixed(1)} m</span>
              </div>
              {userLocation.speed !== null && (
                <div className="info-row">
                  <span className="info-label">Kecepatan:</span>
                  <span className="info-value">{formatSpeed(userLocation.speed)}</span>
                </div>
              )}
              {userLocation.heading !== null && (
                <div className="info-row">
                  <span className="info-label">Arah:</span>
                  <span className="info-value">{Math.round(userLocation.heading)}°</span>
                </div>
              )}
              {nearestUMKM && (
                <div className="info-row highlight">
                  <span className="info-label">Terdekat:</span>
                  <span className="info-value">
                    {nearestUMKM.umkm.name} - {formatDistance(nearestUMKM.distance)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mapReady && nearestUMKM && userLocation && !showUserInfo && (
        <motion.div
          className="nearest-umkm-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => {
            onSelectUMKM(nearestUMKM.umkm);
            if (map.current) {
              map.current.flyTo({
                center: [nearestUMKM.umkm.lng, nearestUMKM.umkm.lat],
                zoom: 17,
                duration: 1000
              });
            }
          }}
        >
          <MapPin size={16} />
          <div className="nearest-info">
            <div className="nearest-name">{nearestUMKM.umkm.name}</div>
            <div className="nearest-distance">{formatDistance(nearestUMKM.distance)}</div>
          </div>
        </motion.div>
      )}

      <div ref={mapContainer} className={`gmap-view ${revealMap ? 'is-visible' : 'is-hidden'}`} />

      {mapReady && (
        <div className={`gmap-toolbar ${isToolbarOpen ? 'open' : 'closed'}`}>
          <button 
            className="toolbar-toggle" 
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
          >
            <svg className="toggle-icon" width="16" height="16" viewBox="0 0 24 24">
              <path d="M12 16l-6-8h12z" fill="currentColor"/>
            </svg>
          </button>

          <div className="toolbar-content">
            <button onClick={handleZoomOut} className="toolbar-btn">−</button>

            <div className="gmap-segment">
              {MAP_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleMapTypeChange(type)}
                  className={`segment-btn ${currentMapType.id === type.id ? 'active' : ''}`}
                >
                  {type.name}
                </button>
              ))}
            </div>

            <button 
              onClick={handleLocateMe}
              className={`toolbar-icon ${isFollowing ? 'active' : ''} ${isLocating ? 'loading' : ''}`}
              disabled={isLocating}
              title="Lokasi Saya"
            >
              <Locate size={18} />
            </button>

            {userLocation && (
              <button 
                onClick={() => setShowUserInfo(!showUserInfo)}
                className={`toolbar-icon ${showUserInfo ? 'active' : ''}`}
                title="Info Lokasi"
              >
                <Activity size={18} />
              </button>
            )}

            <button 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              className="toolbar-icon"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <button onClick={handleZoomIn} className="toolbar-btn">+</button>
          </div>
        </div>
      )}

      {/* Menggunakan dangerouslySetInnerHTML untuk menghindari warning jsx/global */}
      <div dangerouslySetInnerHTML={{ __html: `
        <style>
          .gmap-container {
            position: relative;
            height: 100%;
            width: 100%;
            border-radius: 16px;
            overflow: hidden;
            background: #e5e3df;
            font-family: 'Roboto', -apple-system, sans-serif;
          }

          .gmap-container.fullscreen {
            position: fixed;
            inset: 0;
            z-index: 9999;
            border-radius: 0;
          }

          .gmap-view {
            height: 100%;
            width: 100%;
            opacity: 0;
            transition: opacity 0.4s ease;
          }

          .gmap-view.is-hidden { opacity: 0; }
          .gmap-view.is-visible { opacity: 1; }

          .gmap-loader-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #fff7ed 0%, #fde7d3 100%);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(6px);
          }

          .loader-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 18px;
            color: #ea580c;
            font-weight: 600;
          }

          .loader-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FD5701;
          }

          .loader-wrap p {
            font-size: 15px;
            margin: 0;
            letter-spacing: 0.02em;
          }

          .gmap-search-wrapper {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 10;
          }

          .gmap-search-box {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 16px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            height: 46px;
            cursor: pointer;
          }

          .gmap-search-icon { color: #70757a; flex-shrink: 0; }
          
          .gmap-search-input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 14px;
            color: #202124;
            background: transparent;
          }

          .gmap-search-clear, .gmap-search-close {
            background: none;
            border: none;
            padding: 4px;
            cursor: pointer;
            color: #70757a;
            display: flex;
          }

          .gps-status-indicator {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            font-size: 13px;
            font-weight: 500;
            z-index: 10;
          }

          .gps-status-indicator.searching {
            color: #f59e0b;
            background: #fffbeb;
          }

          .gps-status-indicator.low {
            color: #ef4444;
            background: #fef2f2;
          }

          .gps-status-indicator.high {
            color: #10b981;
            background: #f0fdf4;
          }

          .gps-icon {
            display: flex;
            align-items: center;
          }

          .searching-icon {
            animation: rotate 2s linear infinite;
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .user-info-panel {
            position: absolute;
            bottom: 20px;
            left: 10px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            width: min(320px, calc(100vw - 20px));
            z-index: 10;
            overflow: hidden;
          }

          .info-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
            color: white;
            font-weight: 600;
            font-size: 14px;
          }

          .info-header button {
            margin-left: auto;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            display: flex;
          }

          .info-content {
            padding: 12px 16px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f1f3f4;
            font-size: 13px;
          }

          .info-row:last-child {
            border-bottom: none;
          }

          .info-row.highlight {
            background: #f0f9ff;
            margin: 0 -16px;
            padding: 12px 16px;
            border-radius: 8px;
          }

          .info-label {
            color: #5f6368;
            font-weight: 500;
          }

          .info-value {
            color: #202124;
            font-weight: 600;
          }

          .nearest-umkm-badge {
            position: absolute;
            top: 70px;
            left: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            cursor: pointer;
            z-index: 10;
            transition: all 0.2s;
          }

          .nearest-umkm-badge:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transform: translateY(-2px);
          }

          .nearest-umkm-badge svg {
            color: #1a73e8;
            flex-shrink: 0;
          }

          .nearest-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .nearest-name {
            font-size: 13px;
            font-weight: 600;
            color: #202124;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
          }

          .nearest-distance {
            font-size: 12px;
            color: #5f6368;
          }

          .gmap-toolbar {
            position: absolute;
            top: 70px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            padding: 6px;
            z-index: 10;
          }

          .toolbar-toggle {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }

          .toggle-icon { transition: transform 0.2s; }
          .gmap-toolbar.open .toggle-icon { transform: rotate(180deg); }
          .gmap-toolbar.closed .toolbar-content { display: none; }

          .toolbar-content {
            display: grid;
            gap: 8px;
          }

          .toolbar-btn, .toolbar-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border: 1px solid #e8eaed;
            border-radius: 8px;
            cursor: pointer;
            color: #5f6368;
            transition: all 0.2s;
          }

          .toolbar-btn:hover, .toolbar-icon:hover { background: #f8f9fa; }
          .toolbar-icon.active { background: #1a73e8; color: white; }
          .toolbar-icon.loading { animation: pulse 1.5s infinite; }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          .gmap-segment {
            display: flex;
            flex-direction: column;
            background: #f1f3f4;
            padding: 4px;
            border-radius: 8px;
            gap: 4px;
          }

          .segment-btn {
            padding: 8px;
            font-size: 12px;
            background: transparent;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            color: #5f6368;
            transition: all 0.2s;
          }

          .segment-btn:hover { background: white; }
          .segment-btn.active {
            background: white;
            color: #1a73e8;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .gmap-marker {
            cursor: pointer;
            position: relative;
          }

          .gmap-pin {
            width: 24px;
            height: 32px;
            position: relative;
            transition: transform 0.2s ease;
          }

          .gmap-pin-top {
            width: 100%;
            height: 100%;
            background: inherit;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid rgba(0,0,0,0.2);
          }

          .gmap-shadow {
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 6px;
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
            filter: blur(2px);
          }

          .gmap-marker:hover .gmap-pin {
            transform: scale(1.15);
          }

          .gmap-user-location {
            position: relative;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .user-accuracy-circle {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(66, 133, 244, 0.12);
            border: 1px solid rgba(66, 133, 244, 0.25);
            border-radius: 50%;
            pointer-events: none;
            transition: all 0.3s ease;
          }

          .user-pulse-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 44px;
            height: 44px;
            background: transparent;
            border: 3px solid rgba(66, 133, 244, 0.6);
            border-radius: 50%;
            animation: userPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            pointer-events: none;
          }

          @keyframes userPulse {
            0% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 1;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.3);
              opacity: 0.5;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }

          .user-direction-arrow {
            position: absolute;
            top: 50%;
            left: 50%;
            margin-left: -10px;
            margin-top: -30px;
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 20px solid #1a73e8;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            transform-origin: 10px 30px;
            transition: transform 0.3s ease;
            z-index: 5;
          }

          .user-outer-circle {
            position: relative;
            width: 22px;
            height: 22px;
            background: white;
            border-radius: 50%;
            box-shadow: 
              0 0 0 1px rgba(0, 0, 0, 0.05),
              0 2px 4px rgba(0, 0, 0, 0.15),
              0 4px 12px rgba(66, 133, 244, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            transition: transform 0.2s ease;
          }

          .user-inner-dot {
            width: 14px;
            height: 14px;
            background: #4285f4;
            border-radius: 50%;
            position: relative;
            transition: background 0.2s ease;
          }

          .user-inner-dot::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(66, 133, 244, 0.4) 0%, transparent 70%);
            border-radius: 50%;
            animation: dotGlow 2s ease-in-out infinite;
          }

          @keyframes dotGlow {
            0%, 100% {
              opacity: 0.6;
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.1);
            }
          }

          .gmap-user-location:hover .user-outer-circle {
            transform: scale(1.15);
          }

          .gmap-user-location:hover .user-inner-dot {
            background: #1a73e8;
          }

          @media (max-width: 640px) {
            .gmap-search-wrapper { width: calc(100% - 20px); }
            .gmap-toolbar { top: 66px; }
            .nearest-umkm-badge { 
              top: 66px;
              max-width: calc(100vw - 80px);
            }
            .nearest-name {
              max-width: 150px;
            }
          }

          /* Global Popup Styles */
          .gmap-popup-enhanced {
            font-family: 'Roboto', sans-serif;
            background: white;
            max-height: 600px;
            overflow-y: auto;
          }

          .gmap-popup-container-enhanced .maplibregl-popup-content {
            padding: 0;
            border-radius: 12px;
            box-shadow: 0 6px 18px rgba(0,0,0,0.18);
            overflow: hidden;
            min-width: 320px;
            max-width: 380px;
          }

          .gmap-popup-container-enhanced .maplibregl-popup-close-button {
            font-size: 24px;
            color: white;
            padding: 12px;
            right: 8px;
            top: 8px;
            background: rgba(0,0,0,0.3);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
          }

          .gmap-hero {
            position: relative;
            height: 190px;
            overflow: hidden;
          }

          .gmap-hero-track {
            display: flex;
            gap: 8px;
            height: 100%;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
          }

          .gmap-hero-track::-webkit-scrollbar { display: none; }

          .gmap-hero-img {
            flex: 0 0 100%;
            width: 100%;
            height: 100%;
            object-fit: cover;
            scroll-snap-align: center;
          }

          .gmap-hero-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: none;
            background: rgba(0,0,0,0.5);
            color: white;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .gmap-hero-nav:hover {
            background: rgba(0,0,0,0.7);
          }

          .gmap-hero-nav.prev { left: 8px; }
          .gmap-hero-nav.next { right: 8px; }

          .gmap-hero-overlay {
            position: absolute;
            bottom: 12px;
            left: 12px;
            right: 12px;
            display: flex;
            gap: 8px;
          }

          .gmap-photo-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(0,0,0,0.7);
            color: white;
            font-size: 12px;
            padding: 6px 10px;
            border-radius: 8px;
          }

          .gmap-verified-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #1a73e8;
            color: white;
            font-size: 11px;
            padding: 6px 10px;
            border-radius: 8px;
          }

          .gmap-hero-favorite {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: white;
            border: none;
            cursor: pointer;
            color: #666;
            transition: all 0.2s;
          }

          .gmap-hero-favorite:hover {
            transform: scale(1.1);
          }

          .gmap-hero-favorite.active { color: #ea4335; }

          .gmap-content { padding: 14px; }

          .gmap-title {
            font-size: 18px;
            font-weight: 600;
            color: #202124;
            margin: 0 0 8px 0;
          }

          .gmap-chips {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
          }

          .gmap-chip {
            font-size: 12px;
            padding: 6px 10px;
            border-radius: 999px;
            font-weight: 500;
          }

          .gmap-chip.category {
            background: #fff7ed;
            color: #f97316;
          }

          .gmap-chip.status {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .gmap-chip.status.open {
            background: #e6f4ea;
            color: #137333;
          }

          .gmap-chip.status.closed {
            background: #fce8e6;
            color: #d93025;
          }

          .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
          }

          .gmap-stats {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e8eaed;
            margin-bottom: 12px;
          }

          .gmap-rating-number {
            font-size: 22px;
            font-weight: 700;
            color: #202124;
          }

          .gmap-stars {
            color: #fbbc04;
            font-size: 14px;
          }

          .gmap-rating-meta {
            display: flex;
            gap: 6px;
            font-size: 13px;
            color: #5f6368;
            margin-top: 4px;
          }

          .gmap-price-range {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 13px;
            color: #2563eb;
          }

          .gmap-actions {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          }

          .gmap-action-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 10px 6px;
            background: #f8f9fa;
            border: 1px solid #e8eaed;
            border-radius: 8px;
            cursor: pointer;
            font-size: 11px;
            color: #5f6368;
            transition: all 0.2s;
          }

          .gmap-action-btn:hover {
            background: #e8eaed;
          }

          .gmap-action-btn.primary {
            background: #1a73e8;
            color: white;
            border-color: #1a73e8;
          }

          .gmap-action-btn.primary:hover {
            background: #1557b0;
          }

          .gmap-details {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
          }

          .gmap-detail-item {
            display: flex;
            gap: 12px;
          }

          .detail-icon {
            color: #5f6368;
            flex-shrink: 0;
          }

          .detail-label {
            font-size: 11px;
            color: #5f6368;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .detail-value {
            font-size: 14px;
            color: #202124;
          }

          .detail-value.clickable {
            color: #1a73e8;
            cursor: pointer;
          }

          .detail-value.clickable:hover {
            text-decoration: underline;
          }

          .gmap-section {
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e8eaed;
          }

          .gmap-section:last-child {
            border-bottom: none;
          }

          .gmap-section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
          }

          .gmap-products {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .gmap-product-card {
            background: #f8f9fa;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.2s;
          }

          .gmap-product-card:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transform: translateY(-2px);
          }

          .product-img {
            width: 100%;
            height: 80px;
            object-fit: cover;
          }

          .product-info {
            padding: 8px;
          }

          .product-name {
            font-size: 12px;
            font-weight: 500;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .product-price {
            font-size: 11px;
            color: #137333;
            font-weight: 600;
          }

          .gmap-review-card {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
          }

          .review-header {
            display: flex;
            gap: 10px;
            margin-bottom: 8px;
          }

          .review-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #e8eaed;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #5f6368;
          }

          .review-author {
            font-size: 13px;
            font-weight: 600;
          }

          .review-stars {
            color: #fbbc04;
            font-size: 12px;
          }

          .review-date {
            font-size: 11px;
            color: #5f6368;
            margin-left: auto;
          }

          .review-text {
            font-size: 13px;
            color: #202124;
            line-height: 1.5;
          }

          .gmap-gallery {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
          }

          .gmap-gallery-item {
            aspect-ratio: 1;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.2s;
          }

          .gmap-gallery-item:hover {
            transform: scale(1.05);
          }

          .gmap-gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .gmap-description {
            font-size: 13px;
            color: #5f6368;
            line-height: 1.6;
          }

          .gmap-footer-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            background: #1a73e8;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .gmap-footer-btn:hover {
            background: #1557b0;
          }

          @media (max-width: 640px) {
            .gmap-actions {
              grid-template-columns: repeat(2, 1fr);
            }

            .gmap-products {
              grid-template-columns: repeat(2, 1fr);
            }

            .gmap-gallery {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        </style>
      ` }} />
    </div>
  );
}