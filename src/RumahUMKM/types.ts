// Type definitions for Rumah UMKM

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  description?: string;
  category?: string;
  discount?: number;
}

export interface UMKMLocation {
  id: string;
  name: string;
  category: "Kuliner" | "Fashion" | "Kerajinan" | "Teknologi";
  rating: number;
  reviews: number;
  distance: number;
  address: string;
  phone: string;
  openHours: string;
  image: string;
  lat: number;
  lng: number;
  placeId?: string;
  products: Product[];
  description: string;
  verified: boolean;
  isOpen?: boolean;
  photos?: string[];
  owner?: {
    name: string;
    avatar?: string;
    joinDate?: string;
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  tags?: string[];
  gallery?: string[];
}

export interface MapViewport {
  center: [number, number];
  zoom: number;
}

export interface FilterOptions {
  category: string;
  minRating?: number;
  maxDistance?: number;
  verified?: boolean;
  openNow?: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export type CategoryType = "Semua" | "Kuliner" | "Fashion" | "Kerajinan" | "Teknologi";

export interface MarkerIconConfig {
  category: string;
  isActive: boolean;
  size?: number;
  color?: string;
}
