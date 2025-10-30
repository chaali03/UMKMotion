"use client";

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Star } from 'lucide-react';
import type { UMKMLocation } from '../types';

// Pastikan CSS Leaflet dimuat
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom marker icons
const defaultMarkerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const selectedMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map Controller Component
function MapController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
}

interface MapComponentProps {
  center: [number, number];
  umkmLocations: UMKMLocation[];
  selectedUMKM: UMKMLocation | null;
  onSelectUMKM: (umkm: UMKMLocation) => void;
  zoom?: number;
}

export default function MapComponent({ 
  center, 
  umkmLocations, 
  selectedUMKM,
  onSelectUMKM,
  zoom = 13
}: MapComponentProps) {
  // Ensure we're running in browser environment for Leaflet
  if (typeof window === 'undefined') {
    return null;
  }

  // Pastikan center adalah array dengan 2 nilai numerik yang valid
  const validCenter: [number, number] = Array.isArray(center) && center.length === 2 && 
    typeof center[0] === 'number' && typeof center[1] === 'number' ? 
    center : [-6.2088, 106.8456]; // Default ke Jakarta jika tidak valid

  return (
    <div style={{ height: "400px", width: "100%", position: "relative" }}>
      <MapContainer 
        center={validCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={validCenter} zoom={zoom} />
        <ZoomControl position="bottomright" />
        
        {umkmLocations.map((umkm) => (
          <Marker 
            key={umkm.id} 
            position={[umkm.lat, umkm.lng]}
            icon={
              selectedUMKM && selectedUMKM.id === umkm.id
                ? selectedMarkerIcon
                : defaultMarkerIcon
            }
            eventHandlers={{
              click: () => {
                if (onSelectUMKM) {
                  onSelectUMKM(umkm);
                }
              }
            }}
          >
            <Popup>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold">{umkm.name}</h3>
                <p className="text-sm">{umkm.address}</p>
                <p className="text-xs text-gray-500">{umkm.category}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* User location marker */}
        <Marker position={validCenter} icon={userLocationIcon}>
          <Popup>Lokasi Anda</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
