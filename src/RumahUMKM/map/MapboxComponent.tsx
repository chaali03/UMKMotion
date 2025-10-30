"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../mapbox-custom.css';
import type { UMKMLocation } from '../types';

// Ganti dengan token Mapbox Anda
// Anda perlu mendaftar di mapbox.com untuk mendapatkan token
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

interface MapboxComponentProps {
  center: [number, number];
  umkmLocations: UMKMLocation[];
  selectedUMKM: UMKMLocation | null;
  onSelectUMKM: (umkm: UMKMLocation) => void;
  zoom?: number;
}

export default function MapboxComponent({
  center,
  umkmLocations,
  selectedUMKM,
  onSelectUMKM,
  zoom = 13
}: MapboxComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const userMarker = useRef<mapboxgl.Marker | null>(null);

  // Validasi koordinat center
  const validCenter: [number, number] = Array.isArray(center) && 
    center.length === 2 && 
    typeof center[0] === 'number' && 
    typeof center[1] === 'number' ? 
    center : [106.8456, -6.2088]; // Default: Jakarta

  useEffect(() => {
    // Inisialisasi peta jika belum ada
    if (!map.current && mapContainer.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'https://api.maptiler.com/maps/basic-v2/style.json?key=get_your_own_key',
          center: [validCenter[1], validCenter[0]], // Mapbox menggunakan format [lng, lat]
          zoom: zoom
        });

        // Tambahkan kontrol navigasi
        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        
        // Tambahkan event listener untuk error
        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
        });
        
        // Tambahkan event listener untuk load
        map.current.on('load', () => {
          console.log('Mapbox loaded successfully');
        });
      } catch (error) {
        console.error('Error initializing Mapbox:', error);
      }
    }

    // Update center peta jika berubah
    if (map.current) {
      map.current.setCenter([validCenter[1], validCenter[0]]);
    }

    return () => {
      // Cleanup saat komponen unmount
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [validCenter[0], validCenter[1], zoom]);

  // Menangani marker lokasi UMKM
  useEffect(() => {
    if (!map.current) return;

    // Hapus marker yang tidak ada lagi di data
    Object.keys(markers.current).forEach(id => {
      if (!umkmLocations.find(umkm => umkm.id === id)) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    });

    // Tambah atau update marker untuk setiap lokasi UMKM
    umkmLocations.forEach(umkm => {
      const markerColor = selectedUMKM && selectedUMKM.id === umkm.id ? '#FF0000' : '#3FB1CE';
      
      if (markers.current[umkm.id]) {
        // Update posisi marker yang sudah ada
        const markerElement = markers.current[umkm.id].getElement();
        markers.current[umkm.id].setLngLat([umkm.lng, umkm.lat]);
        if (markerElement) {
          markerElement.style.color = markerColor;
        }
      } else {
        // Buat marker baru
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = markerColor;
        el.style.width = '25px';
        el.style.height = '25px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        
        // Buat popup untuk marker
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div>
              <h3 style="font-weight: 600; margin-bottom: 4px;">${umkm.name}</h3>
              <p style="font-size: 14px; margin-bottom: 4px;">${umkm.address}</p>
              <p style="font-size: 12px; color: #666;">${umkm.category}</p>
            </div>
          `);
        
        // Buat marker dan tambahkan ke peta
        const mapInstance = map.current;
        if (mapInstance) {
          const marker = new mapboxgl.Marker(el)
            .setLngLat([umkm.lng, umkm.lat])
            .setPopup(popup)
            .addTo(mapInstance);
          
          // Tambahkan event listener untuk klik
          marker.getElement().addEventListener('click', () => {
            if (onSelectUMKM) {
              onSelectUMKM(umkm);
            }
          });
          
          // Simpan marker di ref
          markers.current[umkm.id] = marker;
        }
      }
    });
  }, [umkmLocations, selectedUMKM, onSelectUMKM]);

  // Menangani marker lokasi pengguna
  useEffect(() => {
    if (!map.current) return;
    const mapInstance = map.current;

    if (userMarker.current) {
      // Update posisi marker pengguna
      userMarker.current.setLngLat([validCenter[1], validCenter[0]]);
    } else {
      // Buat marker pengguna baru
      const el = document.createElement('div');
      el.className = 'user-marker';
      el.style.backgroundColor = '#4285F4';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
      
      // Buat popup untuk marker pengguna
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML('<div>Lokasi Anda</div>');
      
      // Buat marker dan tambahkan ke peta
      userMarker.current = new mapboxgl.Marker(el)
        .setLngLat([validCenter[1], validCenter[0]])
        .setPopup(popup)
        .addTo(mapInstance);
    }
  }, [validCenter[0], validCenter[1]]);

  return (
    <div style={{ height: "400px", width: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ height: "100%", width: "100%", position: "absolute" }} />
    </div>
  );
}