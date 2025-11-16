"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import maplibregl from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import '../mapbox-custom.css';
import type { UMKMLocation } from '../types';
import {
  Layers, Locate,
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
        // Safely handle undefined/null objects - return early
        if (obj == null || typeof obj !== 'object') {
          return value;
        }
        try {
          Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: value
          });
        } catch {
          if (obj != null) obj[key] = value;
        }
        return value;
      };
    }
    // Ensure bare identifier exists as a global var for chunks that reference it directly
    try {
      const g: any = globalThis as any;
      if (typeof g.__publicField !== 'function') g.__publicField = (window as any).__publicField;
      // Use indirect eval to create a real global var in the page scope
      const defineBare = "var __publicField = (typeof __publicField==='function'? __publicField : (" + g.__publicField.toString() + "))";
      // eslint-disable-next-line no-eval
      (0, eval)(defineBare);
    } catch {}

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
  user?: {
    uid?: string;
    email?: string | null;
    displayName?: string | null;
    nickname?: string | null;
    photoURL?: string | null;
  } | null;
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
// Enhanced geolocation with high accuracy settings
const safeGeolocation = {
  getCurrentPosition: (success: PositionCallback, error?: PositionErrorCallback, options?: PositionOptions) => {
    if (navigator.geolocation && typeof navigator.geolocation.getCurrentPosition === 'function') {
      const enhancedOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
        ...options
      };
      return navigator.geolocation.getCurrentPosition(success, error, enhancedOptions);
    }
    error?.(new Error('Geolocation not supported') as any);
  },
  watchPosition: (success: PositionCallback, error?: PositionErrorCallback, options?: PositionOptions): number | null => {
    if (navigator.geolocation && typeof navigator.geolocation.watchPosition === 'function') {
      const enhancedOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000, // Allow 1 second old position
        ...options
      };
      return navigator.geolocation.watchPosition(success, error, enhancedOptions);
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
          attribution: ' OpenStreetMap contributors',
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
// Helper functions for avatar
const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U';
  const cleanName = name.trim();
  if (cleanName.length === 0) return 'U';
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  if (words.length === 0) return 'U';
  if (words.length === 1) {
    return cleanName.substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name: string | null | undefined): string => {
  if (!name) return '#f97316'; // orange-500
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#f97316', // orange-500
    '#3b82f6', // blue-500
    '#a855f7', // purple-500
    '#22c55e', // green-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
    '#14b8a6', // teal-500
    '#ef4444', // red-500
    '#f59e0b', // amber-500
    '#06b6d4', // cyan-500
  ];
  return colors[Math.abs(hash) % colors.length];
};

export default function MapboxComponent({
  center,
  umkmLocations,
  selectedUMKM,
  onSelectUMKM,
  zoom = 13,
  user = null
}: MapboxComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<{ [key: string]: maplibregl.Marker }>({});
  const userMarker = useRef<maplibregl.Marker | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentMapType, setCurrentMapType] = useState(MAP_TYPES[0]);
  const [isLocating, setIsLocating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [radius, setRadius] = useState(5); // Radius dalam km
  const [showRadiusControl, setShowRadiusControl] = useState(false);
  
  // Default collapsed di mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 640;
      setShowRadiusControl(!isMobile);
    }
  }, []);
  const geoWatchId = useRef<number | null>(null);
  const lastUserLocationRef = useRef<{ lat: number; lon: number } | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
    altitude: number | null;
    altitudeAccuracy: number | null;
    timestamp: number;
  } | null>(null);
  
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'low' | 'medium' | 'high' | 'excellent' | 'off'>('off');
  const [locationHistory, setLocationHistory] = useState<Array<{lat: number, lng: number, accuracy: number, timestamp: number}>>([]);
  const [averageAccuracy, setAverageAccuracy] = useState<number>(0);
  const [nearestUMKM, setNearestUMKM] = useState<{ umkm: UMKMLocation; distance: number } | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);

  const validCenter: [number, number] = Array.isArray(center) && center.length === 2 ? center : [-6.2088, 106.8456];

  // Filter UMKM berdasarkan radius dari lokasi user atau center map
  const filteredLocations = useMemo(() => {
    const searchCenter = userLocation 
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : { lat: validCenter[0], lng: validCenter[1] };
    
    const radiusInMeters = radius * 1000; // Convert km to meters
    
    return umkmLocations.filter((umkm) => {
      const distance = calculateDistance(
        searchCenter.lat,
        searchCenter.lng,
        umkm.lat,
        umkm.lng
      );
      return distance <= radiusInMeters;
    });
  }, [userLocation, umkmLocations, radius, validCenter]);

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

  // Update radius circle di map
  useEffect(() => {
    if (!map.current || !mapReady) return;

    const searchCenter = userLocation 
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : { lat: validCenter[0], lng: validCenter[1] };

    // Add circle source and layer
    const sourceId = 'radius-circle';
    const layerId = 'radius-circle-layer';

    if (map.current.getSource(sourceId)) {
      // Update existing source data and radius
      (map.current.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [searchCenter.lng, searchCenter.lat]
        },
        properties: {}
      });
      // Update circle radius
      if (map.current.getLayer(layerId)) {
        map.current.setPaintProperty(layerId, 'circle-radius', radius * 1000);
      }
    } else {
      // Add new source and layer
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [searchCenter.lng, searchCenter.lat]
          },
          properties: {}
        }
      });

      map.current.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': radius * 1000, // Radius dalam meter
          'circle-color': '#4285f4',
          'circle-opacity': 0.1,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#4285f4',
          'circle-stroke-opacity': 0.3
        }
      });
    }
  }, [mapReady, userLocation, radius, validCenter]);

  // Update markers berdasarkan filteredLocations
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Remove markers that are not in filteredLocations
    Object.keys(markers.current).forEach(id => {
      if (!filteredLocations.find(umkm => umkm.id === id)) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    });

    // Add or update markers for filtered locations
    filteredLocations.forEach(umkm => {
      const isSelected = selectedUMKM?.id === umkm.id;
      
      if (markers.current[umkm.id]) {
        markers.current[umkm.id].setLngLat([umkm.lng, umkm.lat]);
        // Update popup content
        const popup = new maplibregl.Popup({ 
          offset: 25,
          closeButton: true,
          className: 'gmap-popup-container-enhanced',
          maxWidth: '380px'
        }).setHTML(createGooglePopup(umkm));
        markers.current[umkm.id].setPopup(popup);
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
  }, [filteredLocations, selectedUMKM, onSelectUMKM, mapReady]);

  // Update user marker avatar when isFollowing or user changes
  useEffect(() => {
    if (!userMarker.current || !user) return;
    
    const getDisplayName = (): string => {
      if (!user) return '';
      if (user.nickname && user.nickname.trim()) return user.nickname.trim();
      if (user.displayName && user.displayName.trim()) return user.displayName.trim();
      if (user.email) return user.email.split('@')[0];
      return '';
    };
    
    const displayName = getDisplayName();
    const showProfile = isFollowing && displayName;
    const initials = showProfile ? getInitials(displayName) : '';
    const avatarColor = showProfile ? getAvatarColor(displayName) : '';
    
    const userDot = userMarker.current.getElement().querySelector('.user-dot') as HTMLElement;
    if (userDot) {
      if (showProfile) {
        userDot.innerHTML = `
          <div class="user-profile-avatar" style="width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 3px solid white; background-color: ${avatarColor};">
            ${initials}
          </div>
          ${userLocation?.heading !== null && userLocation?.heading !== undefined ? `<div class="user-direction-arrow" style="transform: rotate(${userLocation.heading}deg)"></div>` : ''}
        `;
      } else {
        userDot.innerHTML = `
          <div class="user-dot-inner"></div>
          ${userLocation?.heading !== null && userLocation?.heading !== undefined ? `<div class="user-direction-arrow" style="transform: rotate(${userLocation.heading}deg)"></div>` : ''}
        `;
      }
    }
  }, [isFollowing, user, userLocation?.heading]);

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
          heading: heading,
          altitude: null,
          altitudeAccuracy: null,
          timestamp: Date.now()
        });
        
        if (!userMarker.current) {
          const el = document.createElement('div');
          el.className = 'gmap-user-location';
          
          // Get user display info
          const getDisplayName = (): string => {
            if (!user) return '';
            if (user.nickname && user.nickname.trim()) return user.nickname.trim();
            if (user.displayName && user.displayName.trim()) return user.displayName.trim();
            if (user.email) return user.email.split('@')[0];
            return '';
          };
          
          el.innerHTML = `
            <div class="user-accuracy-circle" style="width: ${Math.min(Math.max(accuracy, 20), 120)}px; height: ${Math.min(Math.max(accuracy, 20), 120)}px;"></div>
            <div class="user-pulse-ring"></div>
            <div class="user-dot">
              <div class="user-dot-inner"></div>
              ${heading !== null ? `<div class="user-direction-arrow" style="transform: rotate(${heading}deg)"></div>` : ''}
            </div>
          `;
          el.addEventListener('click', () => {
            if (!map.current || !lastUserLocationRef.current) return;
            snapCenter(map.current, lastUserLocationRef.current.lon, lastUserLocationRef.current.lat);
          });
          userMarker.current = new maplibregl.Marker({ 
            element: el, 
            anchor: 'center',
            offset: [0, -10],
          })
            .setLngLat([longitude, latitude])
            .addTo(map.current!);
        } else {
          userMarker.current.setLngLat([longitude, latitude]);
          const accuracyCircle = userMarker.current.getElement().querySelector('.user-accuracy-circle') as HTMLElement;
          if (accuracyCircle) {
            const size = Math.min(Math.max(accuracy, 20), 120);
            accuracyCircle.style.width = size + 'px';
            accuracyCircle.style.height = size + 'px';
          }
          const directionArrow = userMarker.current.getElement().querySelector('.user-direction-arrow') as HTMLElement;
          if (directionArrow && heading !== null) {
            directionArrow.style.transform = `rotate(${heading}deg)`;
          } else if (heading !== null) {
            const userDot = userMarker.current.getElement().querySelector('.user-dot') as HTMLElement;
            if (userDot) {
              const arrow = document.createElement('div');
              arrow.className = 'user-direction-arrow';
              arrow.style.transform = `rotate(${heading}deg)`;
              userDot.appendChild(arrow);
            }
          }
        }
      },
      () => {
        setGpsStatus('off');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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

  // Keep a fixed, very close zoom while following the user
  const FOLLOW_ZOOM = 18; 

  // Helper: center to lat/lon at the DEVICE SCREEN CENTER (not just map viewport center)
  const snapCenter = (m: maplibregl.Map, lon: number, lat: number) => {
    try { m.setPadding({ top: 0, right: 0, bottom: 0, left: 0 }); } catch {}
    try { m.resize(); } catch {}
    // Compute pixel offset so that the target sits at window center, even if the map canvas is offset
    const rect = m.getContainer().getBoundingClientRect();
    const vv = (window as any).visualViewport;
    const viewportWidth = vv?.width ?? window.innerWidth;
    const viewportHeight = vv?.height ?? window.innerHeight;
    const viewportLeft = vv?.pageLeft ?? 0;
    const viewportTop = vv?.pageTop ?? 0;
    const desiredX = Math.round(viewportLeft + viewportWidth / 2);
    // No vertical bias: keep exactly at device center; VisualViewport accounts for browser UI bars
    const desiredY = Math.round(viewportTop + viewportHeight / 2);
    const mapCenterX = Math.round(rect.left + rect.width / 2);
    const mapCenterY = Math.round(rect.top + rect.height / 2);
    const deltaX = desiredX - mapCenterX;
    const deltaY = desiredY - mapCenterY;
    // Use easeTo with offset and duration 0 to snap instantly with a pixel offset
    m.easeTo({
      center: [lon, lat],
      zoom: Math.min(FOLLOW_ZOOM, m.getMaxZoom()),
      bearing: 0,
      pitch: 0,
      offset: [deltaX, deltaY],
      duration: 0,
      animate: false,
      essential: false
    });
  };

  // Enhanced accuracy classification
  const getAccuracyStatus = (accuracy: number): 'excellent' | 'high' | 'medium' | 'low' => {
    if (accuracy <= 5) return 'excellent';
    if (accuracy <= 10) return 'high';
    if (accuracy <= 20) return 'medium';
    return 'low';
  };

  // Update location history and calculate average accuracy
  const updateLocationHistory = (lat: number, lng: number, accuracy: number) => {
    const timestamp = Date.now();
    setLocationHistory(prev => {
      const newHistory = [...prev, { lat, lng, accuracy, timestamp }]
        .filter(loc => timestamp - loc.timestamp < 30000) // Keep last 30 seconds
        .slice(-10); // Keep last 10 readings
      
      // Calculate average accuracy
      const avgAcc = newHistory.reduce((sum, loc) => sum + loc.accuracy, 0) / newHistory.length;
      setAverageAccuracy(avgAcc);
      
      return newHistory;
    });
  };

  const handleLocateMe = () => {
    const m = map.current;
    if (!m) {
      alert('Peta belum siap');
      return;
    }

    const toggleOn = !isFollowing;
    setIsLocating(true);

    if (toggleOn) {
      // Enter follow mode immediately and prepare camera like Google Maps
      setIsFollowing(true);
      try { m.setPadding({ top: 0, right: 0, bottom: 0, left: 0 }); } catch {}
      try { m.resize(); } catch {}
      // Smooth zoom and bearing reset like Google Maps
      m.easeTo({ 
        center: m.getCenter(), 
        zoom: Math.min(FOLLOW_ZOOM, m.getMaxZoom()), 
        bearing: 0, 
        pitch: 0,
        duration: 1000,
        easing: (t) => t * (2 - t)
      });
      // If we already have a last known location, jump instantly to it
      if (lastUserLocationRef.current) {
        const { lat, lon } = lastUserLocationRef.current;
        snapCenter(m, lon, lat);
      }
      setGpsStatus('searching');
      safeGeolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy, speed, heading, altitude, altitudeAccuracy } = pos.coords;
          const timestamp = Date.now();

          lastUserLocationRef.current = { lat: latitude, lon: longitude };
          const accuracyStatus = getAccuracyStatus(accuracy || 999);
          setGpsStatus(accuracyStatus);
          
          const locationData = {
            lat: latitude,
            lng: longitude,
            accuracy: accuracy || 0,
            speed: speed,
            heading: heading,
            altitude: altitude,
            altitudeAccuracy: altitudeAccuracy,
            timestamp
          };
          
          setUserLocation(locationData);
          updateLocationHistory(latitude, longitude, accuracy || 0);

          if (userMarker.current) {
            userMarker.current.setLngLat([longitude, latitude]);
          }

          const initialZoom = m.getZoom();
          // Instantly center to the indicator without animation
          snapCenter(m, longitude, latitude);

          setIsFollowing(true);
          setIsLocating(false);

          if (geoWatchId.current == null) {
            const watchId = safeGeolocation.watchPosition(
              (p) => {
                const { latitude: lat, longitude: lon, accuracy: acc, speed: spd, heading: hdg, altitude: alt, altitudeAccuracy: altAcc } = p.coords;
                const ts = Date.now();
                
                lastUserLocationRef.current = { lat, lon };
                const accStatus = getAccuracyStatus(acc || 999);
                setGpsStatus(accStatus);
                
                const newLocationData = {
                  lat,
                  lng: lon,
                  accuracy: acc || 0,
                  speed: spd,
                  heading: hdg,
                  altitude: alt,
                  altitudeAccuracy: altAcc,
                  timestamp: ts
                };
                
                setUserLocation(newLocationData);
                updateLocationHistory(lat, lon, acc || 0);
                
                if (userMarker.current) {
                  userMarker.current.setLngLat([lon, lat]);
                  // Update accuracy circle (clamped)
                  const accuracyCircle = userMarker.current.getElement().querySelector('.user-accuracy-circle') as HTMLElement;
                  if (accuracyCircle && typeof acc === 'number') {
                    const size = Math.min(Math.max(acc, 20), 120);
                    accuracyCircle.style.width = size + 'px';
                    accuracyCircle.style.height = size + 'px';
                    const opacity = Math.max(0.1, Math.min(0.3, (50 - acc) / 50));
                    accuracyCircle.style.backgroundColor = `rgba(66, 133, 244, ${opacity})`;
                  }
                  // Update direction arrow (preserve avatar if exists)
                  const directionArrow = userMarker.current.getElement().querySelector('.user-direction-arrow') as HTMLElement;
                  if (directionArrow && typeof hdg === 'number') {
                    directionArrow.style.transform = `rotate(${hdg}deg)`;
                  } else if (typeof hdg === 'number') {
                    // If arrow doesn't exist, add it (preserve avatar)
                    const userDot = userMarker.current.getElement().querySelector('.user-dot') as HTMLElement;
                    if (userDot) {
                      const arrow = document.createElement('div');
                      arrow.className = 'user-direction-arrow';
                      arrow.style.transform = `rotate(${hdg}deg)`;
                      userDot.appendChild(arrow);
                    }
                  }
                }

                if (isFollowing && m) {
                  // Real-time smooth following like Google Maps - focus on user indicator
                  const distance = lastUserLocationRef.current ? 
                    Math.sqrt(Math.pow(lon - lastUserLocationRef.current.lon, 2) + Math.pow(lat - lastUserLocationRef.current.lat, 2)) : 0;
                  
                  // Adjust animation duration based on movement distance for natural feel
                  const duration = Math.min(1200, Math.max(300, distance * 100000));
                  
                  m.easeTo({
                    center: [lon, lat],
                    zoom: Math.min(FOLLOW_ZOOM, m.getMaxZoom()),
                    bearing: 0, // Keep north up for consistency
                    pitch: 0,   // Keep flat view
                    duration: duration,
                    easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // Smooth ease-in-out
                    essential: true
                  });
                }
              },
              (error) => {
                console.warn('Geolocation error:', error);
                setGpsStatus('off');
              },
              { 
                enableHighAccuracy: true, 
                maximumAge: 500, 
                timeout: 8000 
              }
            );
            geoWatchId.current = watchId;
          }
        },
        (error) => {
          console.warn('Initial location error:', error);
          // Fallback: start a temporary high-accuracy watch to get the first fix
          setGpsStatus('searching');
          try {
            const tmpWatch = safeGeolocation.watchPosition(
              (p) => {
                const { latitude: lat, longitude: lon, accuracy: acc, speed: spd, heading: hdg, altitude: alt, altitudeAccuracy: altAcc } = p.coords;
                const ts = Date.now();
                lastUserLocationRef.current = { lat, lon };
                setGpsStatus(getAccuracyStatus(acc || 999));
                setUserLocation({
                  lat,
                  lng: lon,
                  accuracy: acc || 0,
                  speed: spd,
                  heading: hdg,
                  altitude: alt,
                  altitudeAccuracy: altAcc,
                  timestamp: ts
                });
                updateLocationHistory(lat, lon, acc || 0);
                if (userMarker.current) userMarker.current.setLngLat([lon, lat]);
                if (isFollowing && map.current) {
                  map.current.easeTo({ center: [lon, lat], zoom: FOLLOW_ZOOM, duration: 500, essential: false });
                }
                // Got first fix: clear temp watch
                if (geoWatchId.current == null) {
                  geoWatchId.current = tmpWatch as unknown as number;
                }
                safeGeolocation.clearWatch(tmpWatch as unknown as number);
                setIsLocating(false);
              },
              (e2) => {
                console.warn('Fallback watch error:', e2);
                setIsLocating(false);
                setGpsStatus('off');
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
            );
          } catch {
            setIsLocating(false);
            setGpsStatus('off');
          }
        },
        { 
          enableHighAccuracy: true, 
          timeout: 8000,
          maximumAge: 1000
        }
      );
    } else {
      // Stop tracking
      safeGeolocation.clearWatch(geoWatchId.current);
      geoWatchId.current = null;
      setIsLocating(false);
      setIsFollowing(false);
      setGpsStatus('off');
      setLocationHistory([]);
      setAverageAccuracy(0);
    }
  };

  // Add compass functionality
  useEffect(() => {
    let compassWatchId: number | null = null;
    
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      // iOS 13+ permission request
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        })
        .catch(() => {
          // Fallback for older browsers
          window.addEventListener('deviceorientation', handleDeviceOrientation);
        });
    } else {
      // Older browsers or non-iOS
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    function handleDeviceOrientation(event: DeviceOrientationEvent) {
      if (event.alpha !== null) {
        setCompassHeading(event.alpha);
      }
    }

    return () => {
      safeGeolocation.clearWatch(geoWatchId.current);
      geoWatchId.current = null;
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
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
                <Navigation2 size={48} strokeWidth={2} />
              </div>
              <p>Memuat peta interaktif...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Radius Control */}
      {mapReady && (
        <div className="gmap-radius-control">
          <motion.div
            className="radius-control-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="radius-header">
              <button
                className="radius-toggle-btn"
                onClick={() => setShowRadiusControl(!showRadiusControl)}
                title="Atur Radius Pencarian"
              >
                <Navigation size={18} className="radius-icon" />
                <span className="radius-text">Radius: {radius} km</span>
                <span className="radius-count">{filteredLocations.length}</span>
              </button>
            </div>
            
            <AnimatePresence>
              {showRadiusControl && (
                <motion.div
                  className="radius-control-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="radius-slider-wrapper">
                    <label className="radius-label">
                      Radius Pencarian: <strong>{radius} km</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="radius-slider"
                    />
                    <div className="radius-presets">
                      {[1, 3, 5, 10, 20].map((preset) => (
                        <button
                          key={preset}
                          className={`radius-preset-btn ${radius === preset ? 'active' : ''}`}
                          onClick={() => setRadius(preset)}
                        >
                          {preset} km
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="radius-info">
                    <div className="radius-info-item">
                      <span className="info-label">Lokasi Pencarian:</span>
                      <span className="info-value">
                        {userLocation ? 'Lokasi Saya' : 'Pusat Peta'}
                      </span>
                    </div>
                    <div className="radius-info-item">
                      <span className="info-label">UMKM Ditemukan:</span>
                      <span className="info-value highlight">{filteredLocations.length}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
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
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(8px);
          }

          .loader-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            color: #202124;
            font-weight: 600;
          }

          .loader-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            position: relative;
          }

          .loader-icon::before {
            content: '';
            position: absolute;
            width: 80px;
            height: 80px;
            border: 4px solid #f0f0f0;
            border-top: 4px solid #4285f4;
            border-radius: 50%;
            animation: spin-loader 1s linear infinite;
          }

          .loader-icon::after {
            content: '';
            position: absolute;
            width: 60px;
            height: 60px;
            border: 3px solid transparent;
            border-right: 3px solid #34a853;
            border-radius: 50%;
            animation: spin-loader-reverse 1.5s linear infinite;
            top: 10px;
            left: 10px;
          }

          @keyframes spin-loader {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes spin-loader-reverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }

          .loader-wrap p {
            font-size: 14px;
            margin: 0;
            letter-spacing: 0.02em;
            color: #5f6368;
            font-weight: 500;
          }

          .gmap-radius-control {
            position: absolute;
            top: 60px;
            left: 10px;
            z-index: 10;
            min-width: 280px;
            max-width: calc(100vw - 20px);
          }

          .radius-control-panel {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.15);
            overflow: hidden;
          }

          .radius-header {
            padding: 0;
          }

          .radius-toggle-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            background: white;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            color: #202124;
            transition: background 0.2s;
          }

          .radius-toggle-btn:hover {
            background: #f8f9fa;
          }

          .radius-toggle-btn svg {
            color: #4285f4;
            flex-shrink: 0;
          }

          .radius-text {
            flex: 1;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .radius-count {
            background: #4285f4;
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }

          .radius-control-content {
            padding: 16px;
            border-top: 1px solid #e8eaed;
            overflow: hidden;
          }

          .radius-slider-wrapper {
            margin-bottom: 16px;
          }

          .radius-label {
            display: block;
            font-size: 13px;
            color: #5f6368;
            margin-bottom: 12px;
            font-weight: 500;
          }

          .radius-label strong {
            color: #4285f4;
            font-size: 16px;
          }

          .radius-slider {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #e8eaed;
            outline: none;
            -webkit-appearance: none;
            margin-bottom: 12px;
          }

          .radius-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #4285f4;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .radius-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #4285f4;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .radius-presets {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .radius-preset-btn {
            flex: 1;
            min-width: 50px;
            padding: 8px 12px;
            background: #f8f9fa;
            border: 1px solid #e8eaed;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            color: #5f6368;
            cursor: pointer;
            transition: all 0.2s;
          }

          .radius-preset-btn:hover {
            background: #e8eaed;
          }

          .radius-preset-btn.active {
            background: #4285f4;
            color: white;
            border-color: #4285f4;
          }

          .radius-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-top: 12px;
            border-top: 1px solid #e8eaed;
          }

          .radius-info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
          }

          .info-label {
            color: #5f6368;
            font-weight: 500;
          }

          .info-value {
            color: #202124;
            font-weight: 600;
          }

          .info-value.highlight {
            color: #4285f4;
            font-size: 16px;
          }

          .gps-status-indicator {
            position: absolute;
            top: 280px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 12px;
            font-weight: 600;
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 0, 0, 0.08);
            z-index: 10;
            min-width: 200px;
          }

          .gps-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .gps-status-text {
            font-weight: 700;
            font-size: 13px;
          }

          .gps-details {
            display: flex;
            gap: 8px;
            font-size: 10px;
            font-weight: 500;
            opacity: 0.8;
          }

          .accuracy {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .avg-accuracy {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .speed {
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .altitude {
            background: rgba(139, 92, 246, 0.1);
            color: #8b5cf6;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .heading {
            background: rgba(236, 72, 153, 0.1);
            color: #ec4899;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .direction {
            background: rgba(34, 197, 94, 0.1);
            color: #22c55e;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .gps-status-indicator.searching {
            color: #f59e0b;
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border: 2px solid rgba(245, 158, 11, 0.3);
            box-shadow: 0 8px 32px rgba(245, 158, 11, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5);
          }

          .gps-status-indicator.low {
            color: #ef4444;
            background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
          }

          .gps-status-indicator.medium {
            color: #f59e0b;
            background: linear-gradient(135deg, #fffbeb 0%, #fed7aa 100%);
          }

          .gps-status-indicator.high {
            color: #10b981;
            background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
          }

          .gps-status-indicator.excellent {
            color: #059669;
            background: linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%);
            border: 1px solid rgba(5, 150, 105, 0.2);
          }

          .excellent-icon {
            animation: pulse-glow 2s ease-in-out infinite;
          }

          @keyframes pulse-glow {
            0%, 100% { 
              transform: scale(1);
              filter: drop-shadow(0 0 3px rgba(5, 150, 105, 0.5));
            }
            50% { 
              transform: scale(1.1);
              filter: drop-shadow(0 0 8px rgba(5, 150, 105, 0.8));
            }
          }

          .gps-icon {
            display: flex;
            align-items: center;
          }

          .searching-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
          }

          .radar-pulse {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 2px solid #f59e0b;
            border-radius: 50%;
            animation: radar-pulse 2s ease-out infinite;
          }

          .radar-pulse::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 1px solid rgba(245, 158, 11, 0.4);
            border-radius: 50%;
            animation: radar-pulse 2s ease-out infinite 0.5s;
          }

          .radar-pulse::after {
            content: '';
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            border: 1px solid rgba(245, 158, 11, 0.2);
            border-radius: 50%;
            animation: radar-pulse 2s ease-out infinite 1s;
          }

          @keyframes radar-pulse {
            0% {
              transform: scale(0.5);
              opacity: 1;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }

          .searching-icon {
            position: relative;
            z-index: 2;
            animation: gps-rotate 3s linear infinite;
            filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3));
          }

          @keyframes gps-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .searching-text {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .text-primary {
            font-weight: 700;
            background: linear-gradient(45deg, #f59e0b, #d97706);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .dots {
            display: flex;
            gap: 1px;
          }

          .dots span {
            animation: dot-bounce 1.4s ease-in-out infinite;
            font-weight: bold;
            color: #f59e0b;
          }

          .dots span:nth-child(1) { animation-delay: 0s; }
          .dots span:nth-child(2) { animation-delay: 0.2s; }
          .dots span:nth-child(3) { animation-delay: 0.4s; }

          @keyframes dot-bounce {
            0%, 60%, 100% {
              transform: translateY(0);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-8px);
              opacity: 1;
            }
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

          

          .gmap-toolbar {
            position: absolute;
            top: 140px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: rgba(255,255,255,0.9);
            border-radius: 14px;
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
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: visible;
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
}

.user-direction-arrow {
  position: absolute;
  top: -12px;
  left: 50%;
  transform-origin: 50% 32px;
  margin-left: -3px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 16px solid #1a73e8;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  z-index: 11;
  transition: transform 0.3s ease;
}

.user-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  z-index: 3;
  pointer-events: none;
}

.crosshair-h, .crosshair-v {
  position: absolute;
  background: rgba(26, 115, 232, 0.6);
  animation: crosshair-fade 2s ease-in-out infinite;
}

.crosshair-h {
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  margin-top: -0.5px;
}

.crosshair-v {
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  margin-left: -0.5px;
}

@keyframes crosshair-fade {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

.gmap-user-location:hover .user-dot {
  transform: scale(1.15);
  background: #1a73e8;
  box-shadow: 0 4px 16px rgba(26, 115, 232, 0.5);
}

.gmap-user-location:hover .user-accuracy-circle {
  border-color: rgba(26, 115, 232, 0.5);
  background: rgba(26, 115, 232, 0.2);
}

.gmap-user-location:hover .crosshair-h,
.gmap-user-location:hover .crosshair-v {
  background: rgba(26, 115, 232, 0.9);
}
          }

          .crosshair-h {
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            margin-top: -0.5px;
          }

          .crosshair-v {
            left: 50%;
            top: 0;
            bottom: 0;
            width: 1px;
            margin-left: -0.5px;
          }

          @keyframes crosshair-fade {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
          }

          .gmap-user-location:hover .user-dot {
            transform: scale(1.15);
            background: #1a73e8;
            box-shadow: 0 4px 16px rgba(26, 115, 232, 0.5);
          }

          .gmap-user-location:hover .user-accuracy-circle {
            border-color: rgba(26, 115, 232, 0.5);
            background: rgba(26, 115, 232, 0.2);
          }

          .gmap-user-location:hover .crosshair-h,
          .gmap-user-location:hover .crosshair-v {
            background: rgba(26, 115, 232, 0.9);
          }

          @media (max-width: 640px) {
            .gmap-radius-control {
              width: auto;
              min-width: auto;
              max-width: calc(100vw - 100px);
              top: 50px;
            }
            
            .gps-status-indicator {
              top: 240px;
            }
            
            .radius-control-panel {
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            }
            
            .radius-toggle-btn {
              font-size: 10px;
              padding: 4px 6px;
              gap: 4px;
              white-space: nowrap;
            }
            
            .radius-toggle-btn .radius-icon {
              width: 14px;
              height: 14px;
              flex-shrink: 0;
            }
            
            .radius-text {
              font-size: 9px;
              flex: 0 1 auto;
              min-width: 0;
            }
            
            /* Hide text on very small screens, show only icon and count */
            @media (max-width: 480px) {
              .radius-text {
                display: none;
              }
              
              .radius-toggle-btn {
                padding: 4px 5px;
                gap: 3px;
              }
            }
            
            .radius-count {
              font-size: 8px;
              padding: 1px 4px;
              border-radius: 4px;
              flex-shrink: 0;
              min-width: 18px;
              text-align: center;
            }
            
            .radius-control-content {
              padding: 8px;
            }
            
            .radius-slider-wrapper {
              margin-bottom: 10px;
            }
            
            .radius-label {
              font-size: 11px;
              margin-bottom: 6px;
            }
            
            .radius-label strong {
              font-size: 13px;
            }
            
            .radius-slider {
              margin-bottom: 6px;
              height: 4px;
            }
            
            .radius-slider::-webkit-slider-thumb {
              width: 16px;
              height: 16px;
            }
            
            .radius-slider::-moz-range-thumb {
              width: 16px;
              height: 16px;
            }
            
            .radius-presets {
              gap: 3px;
              display: grid;
              grid-template-columns: repeat(5, 1fr);
            }
            
            .radius-preset-btn {
              font-size: 9px;
              padding: 4px 2px;
              min-width: auto;
            }
            
            .radius-info {
              padding-top: 8px;
              gap: 4px;
            }
            
            .radius-info-item {
              font-size: 10px;
              flex-wrap: wrap;
            }
            
            .info-label {
              font-size: 9px;
            }
            
            .info-value {
              font-size: 10px;
            }
            
            .info-value.highlight {
              font-size: 12px;
            }
            
            .gmap-toolbar { 
              top: 110px;
              right: 8px;
            }
            
            .toolbar-btn, .toolbar-icon {
              width: 34px;
              height: 34px;
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