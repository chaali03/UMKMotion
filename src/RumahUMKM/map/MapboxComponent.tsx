"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../mapbox-custom.css';
import type { UMKMLocation } from '../types';
import {
  MapPin, Layers, Search, X, Locate,
  Star, Clock, Phone, ExternalLink, Maximize2, Minimize2,
  Navigation, Share2, Heart, Globe, Instagram, Mail,
  Award, TrendingUp, DollarSign, Calendar, MessageCircle
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

// Google Maps style marker
const createGoogleMarker = (umkm: UMKMLocation, isSelected: boolean) => {
  const el = document.createElement('div');
  el.className = isSelected ? 'gmap-marker selected' : 'gmap-marker';

  const categoryColors: { [key: string]: string } = {
    'Kuliner': '#ea4335',
    'Fashion': '#4285f4',
    'Kerajinan': '#fbbc04',
    'Teknologi': '#34a853'
  };

  const color = categoryColors[umkm.category] || '#ea4335';

  el.innerHTML = `
    <div class="gmap-pin" style="background-color: ${color};">
      <div class="gmap-pin-top"></div>
    </div>
    <div class="gmap-shadow"></div>
  `;

  return el;
};

// Enhanced Google Maps style popup with rich details
const createGooglePopup = (umkm: UMKMLocation) => {
  const stars = '★'.repeat(Math.floor(umkm.rating)) + '☆'.repeat(5 - Math.floor(umkm.rating));
  const photosLabel = umkm.photos && umkm.photos.length ? `${umkm.photos.length} Foto` : 'Foto';

  // Use existing fields with safe fallbacks
  const openingHours = (umkm as any).openingHours || umkm.openHours || 'Jam tidak tersedia';
  const address = umkm.address || '';
  const phone = umkm.phone || '';
  const website = (umkm as any).website || '';
  const priceRange = (umkm as any).priceRange || '';
  const totalVisits = (umkm as any).totalVisits || '';
  const isOpen = umkm.isOpen !== false;

  // Featured products derived from umkm.products if present
  const featuredProducts = (umkm as any).featuredProducts || (umkm.products ? umkm.products.map((p: any) => ({
    name: p.name,
    price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
    image: p.image
  })) : []);

  // Gallery images use umkm.photos if available
  const galleryImages: string[] = (umkm as any).galleryImages || umkm.photos || [];

  // Optional top review (fallback sample)
  const topReview = (umkm as any).topReview || {
    author: 'Pengguna',
    rating: Math.round(umkm.rating),
    text: umkm.description || 'Belum ada ulasan.',
    date: ''
  };

  return `<div class="gmap-popup-enhanced">
    <!-- Hero Carousel with Overlay Info -->
    <div class="gmap-hero">
      <div class="gmap-hero-track">
        ${[umkm.image, ...(galleryImages || [])].filter(Boolean).slice(0, 5).map(img => 
          `<img src="${img}" alt="${umkm.name}" class="gmap-hero-img" onerror="this.src='https://via.placeholder.com/600x300?text=UMKM'"/>`
        ).join('')}
      </div>
      <button class="gmap-hero-nav prev" onclick="const t=this.closest('.gmap-hero').querySelector('.gmap-hero-track'); t && t.scrollBy({left:-Math.max(280, t.clientWidth*0.9), behavior:'smooth'});" aria-label="Prev">
        ‹
      </button>
      <button class="gmap-hero-nav next" onclick="const t=this.closest('.gmap-hero').querySelector('.gmap-hero-track'); t && t.scrollBy({left:Math.max(280, t.clientWidth*0.9), behavior:'smooth'});" aria-label="Next">
        ›
      </button>
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

    <!-- Main Content -->
    <div class="gmap-content">
      <!-- Header -->
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

      <!-- Rating & Stats -->
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

      <!-- Quick Actions -->
      <div class="gmap-actions">
        <button class="gmap-action-btn primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
          </svg>
          <span>Rute</span>
        </button>
        <button class="gmap-action-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
          </svg>
          <span>Telepon</span>
        </button>
        <button class="gmap-action-btn">
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

      <!-- Detailed Info -->
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

        <div class="gmap-detail-item">
          <svg class="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
          </svg>
          <div class="detail-content">
            <div class="detail-label">Telepon</div>
            <div class="detail-value clickable">${phone}</div>
          </div>
        </div>

        <div class="gmap-detail-item">
          <svg class="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path>
          </svg>
          <div class="detail-content">
            <div class="detail-label">Website</div>
            <div class="detail-value clickable">${website}</div>
          </div>
        </div>
      </div>

      <!-- Featured Products -->
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
              <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/200x150?text=Product'"/>
              <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Top Review -->
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

      <!-- Photo Gallery -->
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
            <div class="gmap-gallery-item ${idx === 3 ? 'has-more' : ''}">
              <img src="${img}" alt="Gallery ${idx + 1}" onerror="this.src='https://via.placeholder.com/300x200?text=Photo'"/>
              ${idx === 3 ? `<div class="gallery-more">+${(umkm.photos?.length || 0) - 3}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Description -->
      <div class="gmap-section">
        <h4 class="gmap-section-title">Tentang</h4>
        <div class="gmap-description">${umkm.description || 'UMKM yang menyediakan produk berkualitas dengan pelayanan terbaik. Kami berkomitmen untuk memberikan pengalaman terbaik bagi setiap pelanggan.'}</div>
      </div>

      <!-- Footer Actions -->
      <div class="gmap-footer">
        <button class="gmap-footer-btn full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Kunjungi Website
        </button>
      </div>
    </div>
  </div>
  `;
};

const MAP_TYPES = [
  { id: 'default', name: 'Default', url: 'https://api.maptiler.com/maps/streets-v2/style.json?key=zmmYiAMYNdgJx6UqpbNU' },
  { id: 'satellite', name: 'Satellite', url: 'https://api.maptiler.com/maps/hybrid/style.json?key=zmmYiAMYNdgJx6UqpbNU' },
  { id: 'terrain', name: 'Terrain', url: 'https://api.maptiler.com/maps/outdoor-v2/style.json?key=zmmYiAMYNdgJx6UqpbNU' }
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

  const validCenter: [number, number] = Array.isArray(center) && center.length === 2 ? center : [38.883333, -77.0];

  const [mapReady, setMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentMapType, setCurrentMapType] = useState(MAP_TYPES[0]);
  const [showMapTypeSelector, setShowMapTypeSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const geoWatchId = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Toggle fullscreen body class
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

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: currentMapType.url,
        center: [validCenter[1], validCenter[0]],
        zoom: zoom,
        fadeDuration: 0,
        attributionControl: false,
        cooperativeGestures: true,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        maxTileCacheSize: 1024
      });

      // Provide placeholder images for any missing sprite icons to avoid maplibre errors
      try {
        map.current.on('styleimagemissing', (e: any) => {
          const id = (e?.id ?? '').toString();
          if (map.current && map.current.hasImage(id)) return;
          // draw a simple circle placeholder (even for blank IDs)
          const size = 32;
          const canvas = document.createElement('canvas');
          canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0,0,size,size);
            ctx.beginPath(); ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI*2);
            ctx.fillStyle = '#9ca3af'; // gray
            ctx.fill();
            ctx.lineWidth = 2; ctx.strokeStyle = '#6b7280'; ctx.stroke();
            const data = ctx.getImageData(0,0,size,size);
            try { id && map.current?.addImage(id, data, { pixelRatio: 2 }); } catch {}
            // also try to satisfy the notorious single-space id
            if (id.trim() === '' && !(map.current?.hasImage(' ') ?? true)) {
              try { map.current?.addImage(' ', data, { pixelRatio: 2 }); } catch {}
            }
          }
        });
      } catch {}

      map.current.addControl(
        new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 
        'bottom-left'
      );

      map.current.once('load', () => {
        map.current?.jumpTo({
          center: [validCenter[1], validCenter[0]],
          zoom: zoom,
          bearing: 0,
          pitch: 0
        });
        
        try {
          const style = map.current!.getStyle();
          style.layers?.forEach((lyr) => {
            if ((lyr as any).type === 'raster') {
              map.current!.setPaintProperty(lyr.id, 'raster-fade-duration', 100);
            }
          });
          // proactively add a simple 'office' placeholder if requested by style
          if (map.current && !map.current.hasImage('office')) {
            const size = 32;
            const canvas = document.createElement('canvas');
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0,0,size,size);
              ctx.fillStyle = '#1a73e8';
              ctx.fillRect(8, 8, size-16, size-16);
              const data = ctx.getImageData(0,0,size,size);
              try { map.current.addImage('office', data, { pixelRatio: 2 }); } catch {}
            }
          }
          // also register a placeholder for the single-space id if ever requested by style
          if (map.current && !map.current.hasImage(' ')) {
            const size = 32;
            const canvas = document.createElement('canvas');
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0,0,size,size);
              ctx.beginPath(); ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI*2);
              ctx.fillStyle = '#9ca3af';
              ctx.fill();
              ctx.lineWidth = 2; ctx.strokeStyle = '#6b7280'; ctx.stroke();
              const data = ctx.getImageData(0,0,size,size);
              try { map.current.addImage(' ', data, { pixelRatio: 2 }); } catch {}
            }
          }
        } catch {}
        setMapReady(true);
      });
      
    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

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

  // Create a distinct user marker once if geolocation is available (no follow)
  useEffect(() => {
    if (!map.current || !mapReady || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!userMarker.current) {
          const el = document.createElement('div');
          el.className = 'gmap-user-marker';
          el.innerHTML = `
            <div class="gmap-user-glow" style="background-color: #1a73e8;"></div>
            <div class="gmap-user-arrow" aria-hidden="true"></div>
            <div class="gmap-user-dot" title="Lokasi Anda" style="background-color: #1a73e8;">
              <div class="gmap-user-core" style="background-color: #ffffff;"></div>
            </div>
            <div class="gmap-user-ring" style="background-color: #1a73e8;"></div>
          `;
          el.style.zIndex = '10000';
          el.style.pointerEvents = 'none';
          userMarker.current = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([longitude, latitude])
            .addTo(map.current!);
        } else {
          userMarker.current.setLngLat([longitude, latitude]);
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 3500, maximumAge: 120000 }
    );
  }, [mapReady]);

  // Pause follow when user drags map
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
      const currentBearing = map.current.getBearing();
      const currentPitch = map.current.getPitch();

      map.current.setStyle(mapType.url);
      setCurrentMapType(mapType);
      setShowMapTypeSelector(false);
      map.current.once('styledata', () => {
        map.current?.jumpTo({ center: currentCenter, zoom: currentZoom, bearing: currentBearing, pitch: currentPitch });
        setMapReady(true);
      });
    }
  }, []);

  useEffect(() => {
    if (map.current && mapReady) {
      map.current.jumpTo({ center: [validCenter[1], validCenter[0]], zoom, bearing: 0, pitch: 0 });
    }
  }, [validCenter[0], validCenter[1], zoom, mapReady]);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();

  // 🎯 FUNGSI UTAMA UNTUK LOKASI TERKINI
  const handleLocateMe = () => {
    const m = map.current;
    if (!navigator.geolocation || !m) {
      alert('Geolocation tidak didukung oleh browser Anda');
      return;
    }

    const toggleOn = !isFollowing;
    setIsLocating(true);

    if (toggleOn) {
      // Aktifkan mode follow - dapatkan posisi terkini
      // util jarak (meter)
      const toRad = (d: number) => (d * Math.PI) / 180;
      const distMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371000;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
        return 2 * R * Math.asin(Math.sqrt(a));
      };

      // konversi akurasi (meter) -> pixel untuk circle-radius
      const metersPerPixelAtLat = (zoom: number, lat: number) => 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
      const updateAccuracyCircle = (lat: number, lon: number, accuracyM: number) => {
        if (!m) return;
        const srcId = 'user-accuracy-src';
        const layerId = 'user-accuracy-circle';
        const data = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [lon, lat] } }] } as any;
        if (m.getSource(srcId)) {
          (m.getSource(srcId) as any).setData(data);
        } else {
          m.addSource(srcId, { type: 'geojson', data });
          m.addLayer({
            id: layerId,
            type: 'circle',
            source: srcId,
            paint: {
              'circle-color': 'rgba(26,115,232,0.15)',
              'circle-stroke-color': 'rgba(26,115,232,0.35)',
              'circle-stroke-width': 1.2,
              'circle-opacity': 1,
              'circle-radius': 20
            }
          });
        }
        const z = m.getZoom() ?? 17;
        const px = Math.max(6, Math.min(300, accuracyM / Math.max(0.0001, metersPerPixelAtLat(z, lat))));
        try { m.setPaintProperty(layerId, 'circle-radius', px); } catch {}
      };

      // state lokal untuk smoothing & filter
      let lastLat: number | null = null;
      let lastLon: number | null = null;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy, heading } = pos.coords as GeolocationCoordinates & { accuracy: number, heading: number | null };

          // Buat atau update user marker
          if (userMarker.current) {
            userMarker.current.setLngLat([longitude, latitude]);
          } else {
            const el = document.createElement('div');
            el.className = 'gmap-user-marker';
            el.innerHTML = `
              <div class="gmap-user-glow"></div>
              <div class="gmap-user-arrow" aria-hidden="true"></div>
              <div class="gmap-user-dot" title="Lokasi Anda">
                <div class="gmap-user-core"></div>
              </div>
              <div class="gmap-user-ring"></div>
            `;
            el.style.zIndex = '10000';
            el.style.pointerEvents = 'none';
            userMarker.current = new maplibregl.Marker(el)
              .setLngLat([longitude, latitude])
              .addTo(m);
          }

          // Rotate arrow by heading if available
          try {
            const root = userMarker.current?.getElement();
            const arrow = root?.querySelector('.gmap-user-arrow') as HTMLElement | null;
            if (arrow && typeof heading === 'number' && !Number.isNaN(heading)) {
              arrow.style.transform = `translate(-50%, -100%) rotate(${heading}deg)`;
            }
          } catch {}

          // Update accuracy circle
          if (typeof accuracy === 'number') updateAccuracyCircle(latitude, longitude, Math.max(accuracy, 5));

          // Zoom dan pusat ke lokasi user dengan animasi smooth
          // Hanya center jika akurasi cukup baik atau zoom belum dekat
          if ((accuracy ?? 9999) <= 50 || (m.getZoom() ?? 0) < 15) {
            m.flyTo({ 
              center: [longitude, latitude], 
              zoom: 19, 
              duration: 1000,
              essential: true
            });
          }
          lastLat = latitude; lastLon = longitude;

          // Mulai real-time tracking
          if (geoWatchId.current == null) {
            geoWatchId.current = navigator.geolocation.watchPosition(
              (p) => {
                const { latitude: rawLat, longitude: rawLon, accuracy: acc, heading: hdg } = p.coords as GeolocationCoordinates & { accuracy: number, heading: number | null };

                // Filter berdasarkan akurasi (abaikan update jika > 60m)
                if ((acc ?? 9999) > 60) return;

                // Smoothing adaptif: semakin akurat, semakin responsif
                // alpha tinggi = ikut cepat
                const alpha = acc != null ? Math.max(0.2, Math.min(0.75, 0.8 - Math.min(acc, 50) / 100)) : 0.4;

                // Noise threshold adaptif (1-3m)
                const minMove = acc != null ? Math.max(1, Math.min(3, acc / 20)) : 2;

                let lat = rawLat, lon = rawLon;
                if (lastLat != null && lastLon != null) {
                  if (distMeters(lastLat, lastLon, rawLat, rawLon) < minMove) return;
                  lat = alpha * rawLat + (1 - alpha) * lastLat;
                  lon = alpha * rawLon + (1 - alpha) * lastLon;
                }
                lastLat = lat; lastLon = lon;

                userMarker.current?.setLngLat([lon, lat]);

                // Update heading pada arrow jika ada
                try {
                  const root = userMarker.current?.getElement();
                  const arrow = root?.querySelector('.gmap-user-arrow') as HTMLElement | null;
                  if (arrow && typeof hdg === 'number' && !Number.isNaN(hdg)) {
                    arrow.style.transform = `translate(-50%, -100%) rotate(${hdg}deg)`;
                  }
                } catch {}

                // Update akurasi circle
                if (typeof acc === 'number') updateAccuracyCircle(lat, lon, Math.max(acc, 5));

                // Ikuti pergerakan user jika mode follow aktif (lebih responsif)
                if (isFollowing) {
                  // Hanya geser center, biarkan zoom level user apa adanya
                  m.easeTo({ center: [lon, lat], duration: 250 });
                }
              },
              (error) => {
                console.error('Watch position error:', error);
              },
              { 
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 30000 
              }
            );
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          // fallback handled earlier in separate getCurrentPosition call if present
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
      );
    } else {
      // Matikan mode follow
      if (geoWatchId.current != null) {
        try { navigator.geolocation.clearWatch(geoWatchId.current); } catch {}
        geoWatchId.current = null;
      }
      setIsLocating(false);
      setIsFollowing(false);
    }
  };

  // Cleanup geolocation watch
  useEffect(() => {
    return () => {
      if (geoWatchId.current != null && navigator.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(geoWatchId.current);
        geoWatchId.current = null;
      }
    };
  }, []);

  return (
    <div className={`gmap-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Search */}
      <div className="gmap-search-wrapper">
        <motion.div
          className="gmap-search-box"
          layout
          initial={false}
          animate={isSearchOpen ? 'open' : 'closed'}
          variants={{
            open: { width: 'min(280px, 70vw)', paddingLeft: 14, paddingRight: 8, borderRadius: 12, boxShadow: '0 6px 14px rgba(0,0,0,0.14)', backgroundColor: '#ffffff' },
            closed: { width: 48, paddingLeft: 0, paddingRight: 0, borderRadius: 26, boxShadow: '0 4px 10px rgba(0,0,0,0.14)', backgroundColor: '#1a73e8' }
          }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ justifyContent: isSearchOpen ? 'flex-start' : 'center', gap: isSearchOpen ? 12 : 0 }}
          onClick={() => { if (!isSearchOpen) setIsSearchOpen(true); }}
        >
          <Search
            className="gmap-search-icon"
            size={18}
            style={{
              color: isSearchOpen ? '#70757a' : '#ffffff',
              transform: isSearchOpen ? 'none' : 'translateX(14px)'
            }}
          />
          <motion.input
            type="text"
            placeholder="Cari UMKM di peta"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="gmap-search-input"
            ref={searchInputRef}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                setIsSearchOpen(false);
                setSearchQuery('');
                searchInputRef.current?.blur();
              }
            }}
            animate={isSearchOpen ? { opacity: 1, width: 'auto' } : { opacity: 0, width: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ pointerEvents: isSearchOpen ? 'auto' : 'none' }}
          />
          {isSearchOpen && !!searchQuery && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSearchQuery(''); searchInputRef.current?.focus(); }}
              className="gmap-search-clear"
              aria-label="Clear"
            >
              <X size={16} />
            </button>
          )}
          {isSearchOpen && !searchQuery && (
            <button
              type="button"
              className="gmap-search-close"
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(false);
                setSearchQuery('');
                searchInputRef.current?.blur();
              }}
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          )}
        </motion.div>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="gmap-view" />

    {/* Controls */}
    {mapReady && (
      <>
        {/* Toolbar Horizontal: zoom-out | map types | locate | fullscreen | zoom-in */}
        <div className={`gmap-toolbar top-right ${isToolbarOpen ? 'open' : 'closed'}`}>
          <button 
            className="toolbar-toggle" 
            aria-label={isToolbarOpen ? 'Tutup toolbar' : 'Buka toolbar'}
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
          >
            <svg className="toggle-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 16l-6-8h12z" fill="currentColor"/>
            </svg>
          </button>

          <div className={`toolbar-content ${isToolbarOpen ? 'open' : 'closed'}`} aria-hidden={!isToolbarOpen}>
            <button onClick={handleZoomOut} className="toolbar-btn toolbar-item" aria-label="Zoom out">−</button>

            <div className="gmap-segment toolbar-item">
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
              className={`toolbar-icon toolbar-item ${isFollowing ? 'active' : ''} ${isLocating ? 'loading' : ''}`}
              aria-label="Lokasi saya"
              disabled={isLocating}
            >
              {isLocating ? (
                <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="15" />
                </svg>
              ) : (
                <Locate size={18} />
              )}
            </button>

            <button onClick={() => setIsFullscreen(!isFullscreen)} className="toolbar-icon toolbar-item" aria-label="Fullscreen">
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <button onClick={handleZoomIn} className="toolbar-btn toolbar-item" aria-label="Zoom in">+</button>
          </div>
        </div>
      </>
    )}

    <style>{`
      /* Container */
      .gmap-container {
        position: relative;
        height: 100%;
        width: 100%;
        border-radius: 16px;
        overflow: hidden;
        background: #e5e3df;
        font-family: 'Roboto', -apple-system, sans-serif;
      }
        /* Container */
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
        }

        .maplibregl-canvas { 
          will-change: transform; 
          transform: translateZ(0); 
        }

        /* Search Bar */
        .gmap-search-wrapper {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
          width: auto;
        }

        /* Lower search bar slightly on mobile and tablet */
        @media (max-width: 640px) {
          .gmap-search-wrapper { top: 24px; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .gmap-search-wrapper { top: 18px; }
        }

        .gmap-search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          background: rgba(255,255,255,0.9);
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
          height: 46px;
          overflow: hidden;
          transition: box-shadow 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;
        }

        .gmap-search-icon {
          color: #70757a;
          flex-shrink: 0;
        }

        .gmap-search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          color: #202124;
          background: transparent;
          transition: color 0.2s ease;
        }

        .gmap-search-input::placeholder {
          color: #8a8f94;
          transition: color 0.2s ease;
        }

        .gmap-search-clear, .gmap-search-close {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #70757a;
          display: flex;
          align-items: center;
        }

        .gmap-search-clear:hover, .gmap-search-close:hover {
          color: #202124;
        }

        /* Controls */
        .gmap-control { position: absolute; z-index: 10; }

        .gmap-control.bottom-left {
          top: 70px; 
          left: 10px;
          bottom: auto;
        }

        .gmap-control.bottom-right {
          bottom: 120px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: floatIn 300ms cubic-bezier(.2,.8,.2,1) both;
        }

        /* Entrance + pulse animations */
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseRing {
          0% { opacity: 0.5; transform: scale(0.92); }
          60% { opacity: 0.08; transform: scale(1.25); }
          100% { opacity: 0; transform: scale(1.32); }
        }

        @keyframes bump {
          0%, 100% { transform: scale(1); }
          40% { transform: scale(1.06); }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 10px 24px rgba(0,0,0,0.16); }
          50% { box-shadow: 0 14px 30px rgba(26,115,232,0.35); }
        }

        /* Toolbar */
        .gmap-toolbar {
          position: absolute;
          top: 300px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 14px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.12);
          padding: 6px;
          backdrop-filter: saturate(140%) blur(6px);
          animation: floatIn 300ms cubic-bezier(.2,.8,.2,1) both;
        }

        .gmap-toolbar.top-right { left: auto; bottom: auto; }

        @media (max-width: 640px) { .gmap-toolbar { top: 140px; } }
        @media (min-width: 641px) and (max-width: 1024px) { .gmap-toolbar { top: 160px; } }

        /* Collapsible states */
        .gmap-toolbar.open { 
          opacity: 1; 
          transform: translateY(0); 
          flex-direction: column; 
          align-items: stretch; 
        }
        .gmap-toolbar.closed {
          padding: 6px;
          gap: 0;
          border-radius: 9999px;
        }
        .gmap-toolbar.closed > :not(.toolbar-toggle) { display: none; }

        /* Toggle button */
        .toolbar-toggle {
          width: 52px; height: 52px;
          display: flex; align-items: center; justify-content: center;
          background: white; border: 1px solid rgba(0,0,0,0.06);
          border-radius: 9999px; color: #334155; cursor: pointer;
          font-size: 18px; line-height: 1; font-weight: 600;
          transition: transform .18s ease, box-shadow .2s, background .2s, color .2s;
          box-shadow: 0 10px 24px rgba(0,0,0,0.16);
          margin-left: auto; /* push toggle to the right in row layout */
          align-self: flex-end; /* keep it at the right in column layout */
          position: relative;
          animation: bump 2.1s ease-in-out infinite, glowPulse 2.1s ease-in-out infinite;
        }
        .toolbar-toggle:hover { background: #f8fafc; color: #111827; }
        .toolbar-toggle:active { transform: scale(0.96); }
        .toggle-icon { transition: transform .18s ease; }
        .gmap-toolbar.open .toggle-icon { transform: rotate(180deg); }

        /* Make triangle a bit larger visually */
        .toolbar-toggle .toggle-icon { width: 18px; height: 18px; }

        /* Attention pulse to hint click */
        .toolbar-toggle::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 9999px;
          border: 2px solid rgba(26,115,232,0.28);
          animation: pulseRing 1.4s ease-out infinite;
          pointer-events: none;
        }

        /* Second staggered ring for stronger hint */
        .toolbar-toggle::before {
          content: "";
          position: absolute;
          inset: -10px;
          border-radius: 9999px;
          border: 2px solid rgba(26,115,232,0.22);
          animation: pulseRing 1.4s ease-out infinite;
          animation-delay: .5s;
          pointer-events: none;
        }

        /* When open, remove attention animations and rings */
        .gmap-toolbar.open .toolbar-toggle { animation: none; }
        .gmap-toolbar.open .toolbar-toggle::after,
        .gmap-toolbar.open .toolbar-toggle::before { animation: none; opacity: 0; }

        .toolbar-content {
          overflow: hidden;
          display: grid;
          gap: 8px;
          transition: max-height .28s cubic-bezier(.2,.8,.2,1), opacity .22s ease, transform .22s ease;
          will-change: max-height, transform, opacity;
          margin-top: 6px; /* small breathing space under toggle */
        }

        .toolbar-btn {
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          background: white; border: 1px solid rgba(0,0,0,0.06);
          border-radius: 10px; color: #334155;
          font-size: 20px; font-weight: 300; cursor: pointer;
          transition: transform .12s ease, box-shadow .2s, background .2s, color .2s;
        }

        /* When toolbar drops down, make items stretch nicely */
        .gmap-toolbar.open .toolbar-btn,
        .gmap-toolbar.open .toolbar-icon,
        .gmap-toolbar.open .gmap-segment { width: 100%; }
        .gmap-toolbar.open .gmap-segment { 
          justify-content: flex-start; 
          flex-direction: column; 
          gap: 6px;
        }
        .gmap-toolbar.open .segment-btn { 
          width: 100%; 
          text-align: center; 
        }
        .toolbar-btn:hover { background: #f8fafc; color: #111827; box-shadow: 0 6px 14px rgba(0,0,0,0.12); }
        .toolbar-btn:active { transform: scale(0.96); }

        .toolbar-icon {
          width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          background: white; border: 1px solid rgba(0,0,0,0.06);
          border-radius: 10px; color: #4b5563; cursor: pointer;
          transition: transform .12s ease, box-shadow .2s, background .2s, color .2s;
        }
        .toolbar-icon:hover { background: #f8fafc; color: #111827; box-shadow: 0 6px 14px rgba(0,0,0,0.12); }
        .toolbar-icon:active { transform: scale(0.96); }

        .toolbar-icon.active { background: #1a73e8; color: #fff; border-color: rgba(26,115,232,0.25); box-shadow: 0 10px 24px rgba(26,115,232,0.35); }
        .toolbar-icon.loading { opacity: .85; cursor: progress; }

        .gmap-segment { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; gap: 4px; border: 1px solid rgba(0,0,0,0.06); }
        .segment-btn { padding: 8px 10px; font-size: 12px; color: #334155; background: transparent; border: none; border-radius: 8px; cursor: pointer; transition: background .2s, color .2s; }
        .segment-btn:hover { background: rgba(255,255,255,0.9); color: #111827; }
        .segment-btn.active { background: #ffffff; color: #1a73e8; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }

        @media (max-width: 640px) {
          .gmap-control.top-right { top: 86px; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .gmap-control.top-right { top: 78px; }
        }

        /* Align the bottom-left control just below search bar on small screens */
        @media (max-width: 640px) {
          .gmap-control.bottom-left { top: 86px; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .gmap-control.bottom-left { top: 78px; }
        }

        /* Map Type Selector */
        .gmap-type-selector {
          position: relative;
        }

        .gmap-type-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border: none;
          border-radius: 2px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #202124;
          transition: box-shadow 0.2s;
        }

        .gmap-type-btn:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .gmap-type-menu {
          position: absolute;
          top: calc(100% + 8px); /* open downward under the button */
          left: 0;
          background: white;
          border-radius: 2px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          overflow: hidden;
          min-width: 140px;
        }

        .gmap-type-option {
          display: block;
          width: 100%;
          padding: 12px 16px;
          background: white;
          border: none;
          text-align: left;
          font-size: 14px;
          color: #202124;
          cursor: pointer;
          transition: background 0.2s;
        }

        .gmap-type-option:hover {
          background: #f1f3f4;
        }

        .gmap-type-option.active {
          background: #e8f0fe;
          color: #1a73e8;
          font-weight: 500;
        }

        /* Zoom Control */
        .gmap-zoom-control {
          background: rgba(255,255,255,0.9);
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          backdrop-filter: saturate(140%) blur(6px);
          overflow: hidden;
          animation: floatIn 320ms cubic-bezier(.2,.8,.2,1) both;
        }

        .gmap-zoom-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 20px;
          font-weight: 300;
          color: #4b5563;
          transition: background 0.2s, transform 0.12s ease, color 0.2s;
        }

        .gmap-zoom-btn:hover {
          background: rgba(0,0,0,0.05);
          color: #111827;
        }

        .gmap-zoom-btn:active { transform: scale(0.96); }

        .gmap-zoom-divider {
          height: 1px;
          background: rgba(0,0,0,0.08);
        }

        /* 🎯 LOCATE BUTTON - STYLING UTAMA */
        .gmap-locate-btn,
        .gmap-fullscreen-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.14);
          backdrop-filter: saturate(140%) blur(6px);
          cursor: pointer;
          color: #4b5563;
          transition: transform 0.12s ease, box-shadow 0.2s, background 0.2s, color 0.2s;
          animation: floatIn 360ms cubic-bezier(.2,.8,.2,1) both;
        }

        .gmap-locate-btn {
          background: #1a73e8;
          color: #fff;
          border-color: rgba(26,115,232,0.2);
        }

        .gmap-locate-btn:hover {
          background: #165fcb;
          box-shadow: 0 12px 26px rgba(26,115,232,0.35);
        }

        .gmap-locate-btn.loading {
          opacity: 0.85;
          cursor: progress;
        }

        .gmap-locate-btn.active {
          background: #0f5ed7;
          box-shadow: 0 16px 32px rgba(26,115,232,0.45);
          position: relative;
        }

        /* Active pulse ring for locate */
        .gmap-locate-btn.active::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 14px;
          border: 2px solid rgba(26,115,232,0.35);
          animation: pulseRing 1.6s ease-out infinite;
          pointer-events: none;
        }

        /* Loading Spinner */
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .gmap-fullscreen-btn:hover {
          background: #f1f3f4;
        }

        /* 🎯 USER LOCATION MARKER - UNIK (TEAL) DAN MENYALA */
        .gmap-user-marker { 
          position: relative;
          width: 48px;
          height: 48px;
          z-index: 1000;
        }

        .gmap-user-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 44px;
          height: 44px;
          background: radial-gradient(circle, rgba(26,115,232,0.35) 0%, rgba(26,115,232,0) 70%);
          border-radius: 50%;
          filter: blur(2px);
          animation: userGlow 2.2s ease-in-out infinite;
        }

        .gmap-user-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 18px;
          height: 18px;
          background: #1a73e8; /* blue */
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(26,115,232,0.65);
          z-index: 2;
        }

        .gmap-user-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 6px;
          height: 6px;
          background: #ffffff;
          border-radius: 50%;
        }

        .gmap-user-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          border: 2px solid rgba(26,115,232,0.55);
          border-radius: 50%;
          animation: userRing 1.8s ease-out infinite;
        }

        @keyframes userRing {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
          70% { transform: translate(-50%, -50%) scale(1.25); opacity: 0.1; }
          100% { transform: translate(-50%, -50%) scale(1.35); opacity: 0; }
        }

        @keyframes userGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.2; }
        }

        /* Small navigation arrow above the dot */
        .gmap-user-arrow {
          position: absolute;
          top: calc(50% - 20px);
          left: 50%;
          transform: translate(-50%, -100%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 10px solid #1a73e8; /* blue */
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));
        }

        /* Label and pill for extra distinction */
        .gmap-user-label {
          position: absolute;
          top: calc(50% + 28px);
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: #6b7280; /* gray-500 */
          background: #fff;
          padding: 2px 6px;
          border-radius: 9999px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          white-space: nowrap;
          user-select: none;
          pointer-events: none;
        }

        .gmap-user-pill {
          position: absolute;
          top: calc(50% + 12px);
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          color: #fff;
          background: #1a73e8; /* blue */
          padding: 2px 6px;
          border-radius: 9999px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
          white-space: nowrap;
          user-select: none;
          pointer-events: none;
        }

        /* Nudge the entire controls stack slightly upward */
        .gmap-zoom-controls,
        .gmap-locate-btn,
        .gmap-fullscreen-btn {
          position: relative;
          top: -10px; /* move up a bit */
        }

        /* Markers */
        .gmap-marker {
          cursor: pointer;
          position: relative;
        }

        .gmap-pin {
          width: 24px;
          height: 32px;
          position: relative;
          animation: markerDrop 0.5s ease;
        }

        @keyframes markerDrop {
          0% { transform: translateY(-200px); opacity: 0; }
          60% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
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

        /* Enhanced Popup Styles */
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
          color: #fff;
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
          transition: background 0.2s;
          z-index: 10;
        }

        .gmap-popup-container-enhanced .maplibregl-popup-close-button:hover {
          background: rgba(0,0,0,0.5);
        }

        .gmap-popup-container-enhanced .maplibregl-popup-tip {
          border-top-color: white;
        }

        /* Popup Enhanced */
        .gmap-popup-enhanced {
          font-family: 'Roboto', -apple-system, sans-serif;
          background: #fff;
          max-height: 600px;
          overflow-y: auto;
        }

        /* Make popup more compact on mobile */
        @media (max-width: 640px) {
          .gmap-hero { height: 130px; }
          .gmap-content { padding: 8px; }
          .gmap-title { font-size: 15px; }
          .gmap-stats { padding: 8px 0 8px; margin-bottom: 8px; }
          .gmap-rating-number { font-size: 17px; }
          .gmap-stars { font-size: 11px; }
          .gmap-rating-meta { font-size: 11px; gap: 4px; }
          .gmap-price-range { padding: 5px 8px; font-size: 11px; }
          .gmap-actions { gap: 8px; margin-bottom: 8px; }
          .gmap-action-btn { padding: 8px 6px; font-size: 10.5px; border-radius: 9px; }
          .gmap-hero-nav { width: 26px; height: 26px; font-size: 16px; }
        }

        /* Slightly compact on tablets */
        @media (min-width: 641px) and (max-width: 1024px) {
          .gmap-hero { height: 160px; }
          .gmap-content { padding: 10px; }
          .gmap-title { font-size: 16px; }
          .gmap-rating-number { font-size: 19px; }
          .gmap-stars { font-size: 12.5px; }
          .gmap-stats { padding: 10px 0 10px; }
          .gmap-action-btn { padding: 10px 7px; }
        }

        /* Hero Image */
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
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .gmap-hero-track::-webkit-scrollbar { display: none; }

        .gmap-hero-img {
          flex: 0 0 100%;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          scroll-snap-align: center;
          border: 0;
        }

        .gmap-hero-nav {
          position: absolute;
          top: 70%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(0,0,0,0.35);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          line-height: 1;
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
          align-items: flex-end;
        }

        .gmap-photo-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(32,33,36,0.76);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 10px;
          border-radius: 8px;
        }

        .gmap-photo-badge:hover {
          background: rgba(32,33,36,0.9);
        }

        .gmap-verified-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(26,115,232,0.9);
          backdrop-filter: blur(10px);
          color: #fff;
          font-size: 11px;
          font-weight: 600;
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
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #666;
        }

        .gmap-hero-favorite:hover {
          background: white;
          transform: scale(1.1);
        }

        .gmap-hero-favorite.active {
          color: #ea4335;
        }

        .gmap-hero-favorite svg {
          fill: currentColor;
          stroke: none;
        }

        /* Content */
        .gmap-content {
          padding: 14px;
        }

        /* Header */
        .gmap-header {
          margin-bottom: 12px;
        }

        .gmap-title {
          font-size: 18px;
          font-weight: 600;
          color: #202124;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }

        .gmap-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gmap-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .gmap-chip {
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .gmap-chip.category {
          background: #fff7ed;
          color: #f97316;
          border: 1px solid #fed7aa;
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
          color: #c5221f;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Stats */
        .gmap-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0 12px;
          border-bottom: 1px solid #e8eaed;
          margin-bottom: 12px;
        }

        .gmap-rating-box {
          flex: 1;
        }

        .gmap-rating-main {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .gmap-rating-number {
          font-size: 22px;
          font-weight: 700;
          color: #202124;
        }

        .gmap-stars {
          color: #fbbc04;
          font-size: 14px;
          letter-spacing: 2px;
        }

        .gmap-rating-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #5f6368;
        }
        .gmap-rating-meta .gmap-reviews { color: #f97316; }

        .gmap-separator {
          color: #dadce0;
        }

        .gmap-price-range {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #2563eb;
        }

        /* Actions */
        .gmap-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }

        .gmap-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 8px;
          background: #f8f9fa;
          border: 1px solid #e8eaed;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
          color: #5f6368;
          font-size: 12px;
          font-weight: 500;
        }

        .gmap-action-btn:hover {
          background: #fff7ed;
          border-color: #fed7aa;
          color: #f97316;
        }

        .gmap-action-btn.primary {
          background: #f97316;
          border-color: #f97316;
          color: white;
        }

        .gmap-action-btn.primary:hover {
          background: #ea580c;
        }

        /* Details */
        .gmap-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .gmap-detail-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .detail-icon {
          flex-shrink: 0;
          color: #5f6368;
          margin-top: 2px;
        }

        .detail-content {
          flex: 1;
          min-width: 0;
        }

        .detail-label {
          font-size: 11px;
          color: #5f6368;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .detail-value {
          font-size: 14px;
          color: #202124;
          line-height: 1.4;
        }

        .detail-value.clickable {
          color: #1a73e8;
          cursor: pointer;
          text-decoration: none;
        }

        .detail-value.clickable:hover {
          text-decoration: underline;
        }

        /* Sections */
        .gmap-section {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e8eaed;
        }

        .gmap-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .gmap-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #202124;
          margin: 0 0 10px 0;
        }

        .gmap-section-title svg {
          color: #5f6368;
        }

        /* Products */
        .gmap-products {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .gmap-product-card {
          background: #f8f9fa;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }

        .gmap-product-card:hover {
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }

        .product-img {
          width: 100%;
          height: 80px;
          object-fit: cover;
          display: block;
        }

        .product-info {
          padding: 8px;
        }

        .product-name {
          font-size: 12px;
          font-weight: 500;
          color: #202124;
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

        /* Review Card */
        .gmap-review-card {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
        }

        .review-header {
          display: flex;
          align-items: center;
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
          flex-shrink: 0;
        }

        .review-meta {
          flex: 1;
          min-width: 0;
        }

        .review-author {
          font-size: 13px;
          font-weight: 600;
          color: #202124;
          margin-bottom: 2px;
        }

        .review-stars {
          color: #fbbc04;
          font-size: 12px;
        }

        .review-date {
          font-size: 11px;
          color: #5f6368;
        }

        .review-text {
          font-size: 13px;
          color: #202124;
          line-height: 1.5;
        }

        /* Gallery */
        .gmap-gallery {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }

        .gmap-gallery-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .gmap-gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .gmap-gallery-item.has-more::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
        }

        .gallery-more {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          font-weight: 600;
          z-index: 1;
        }

        /* Description */
        .gmap-description {
          font-size: 13px;
          color: #5f6368;
          line-height: 1.6;
        }

        /* Footer */
        .gmap-footer {
          display: flex;
          gap: 8px;
          padding-top: 12px;
        }

        .gmap-footer-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f97316;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .gmap-footer-btn:hover { 
          background: #ea580c; 
        }

        /* Scrollbar */
        .gmap-popup-enhanced::-webkit-scrollbar {
          width: 6px;
        }

        .gmap-popup-enhanced::-webkit-scrollbar-track {
          background: #f1f3f4;
        }

        .gmap-popup-enhanced::-webkit-scrollbar-thumb {
          background: #dadce0;
          border-radius: 3px;
        }

        .gmap-popup-enhanced::-webkit-scrollbar-thumb:hover {
          background: #bdc1c6;
        }

        /* Attribution */
        .maplibregl-ctrl-bottom-left,
        .maplibregl-ctrl-bottom-right {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .maplibregl-ctrl-scale {
          background: rgba(255,255,255,0.8);
          border: none;
          border-radius: 2px;
          padding: 2px 6px;
          font-size: 11px;
          color: #202124;
        }

        .maplibregl-ctrl-compass {
          display: none !important;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .gmap-search-wrapper {
            width: calc(100% - 20px);
          }

          .gmap-control.bottom-right {
            bottom: 80px;
          }

          .gmap-popup-container-enhanced .maplibregl-popup-content {
            min-width: 300px;
          }

          .gmap-actions {
            grid-template-columns: repeat(2, 1fr);
          }

          .gmap-products {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}