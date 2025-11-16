"use client";
import React, { useEffect, useState, useRef } from "react";
// @ts-ignore - qrcode does not ship TypeScript types in this project
import QRCode from "qrcode";
import { motion, AnimatePresence, type Variants } from "framer-motion";

import { auth, db, storage } from "../../src/lib/firebase";
import { onAuthStateChanged, updateProfile, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, limit, deleteDoc, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getUserBadges, getUserGamificationStats } from "../../src/lib/gamification";
import Harga from "../Pricing/harga";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  Camera, Loader2, LogOut, Save, User, Mail, Phone, FileText, Trophy,
  Award, Star, Zap, CheckCircle, History, DollarSign, Store,
  Edit2, X, Shield, ShieldCheck, ShieldAlert, Lock, Smartphone, AlertTriangle,
  CheckCircle2, Clock, Key, Eye, EyeOff, Menu, ChevronLeft, ChevronRight, ArrowLeft,
  MapPin, Plus, Users, Navigation, Search
} from "lucide-react";
import { followStore, unfollowStore, isFollowingStore, getFollowing, getFollowerCount, getUserFollowers } from "../../src/lib/follow";

// Interfaces
interface UserProfileData {
  nickname?: string;
  fullName?: string;
  bio?: string;
  address?: string;
  photoURL?: string;
  email?: string | null;
  twoFactorEnabled?: boolean;
  lastPasswordChange?: Date | null;
  securityScore?: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  rarity: string;
  points: number;
}

interface UserBadge {
  badgeId: string;
  earnedAt: Date;
  fromMission?: string;
}

interface SecurityTip {
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  title: string;
  desc: string;
}

interface AddressItem {
  id: string;
  label: string;
  recipient?: string;
  phone?: string;
  addressLine?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  location?: { lat: number; lng: number } | null;
  isPrimary?: boolean;
  isBackup1?: boolean;
  isBackup2?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export default function ProfilePage() {
  // State Management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<UserProfileData>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [gamificationStats, setGamificationStats] = useState<any>({});
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "badges">("profile");
  const [activeMenu, setActiveMenu] = useState<"profile" | "history" | "store" | "pricing">("profile");
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [totpSecret, setTotpSecret] = useState<string>("");
  const [totpQRCode, setTotpQRCode] = useState<string>("");
  const [totpCode, setTotpCode] = useState<string>("");
  const [isSettingUpTOTP, setIsSettingUpTOTP] = useState(false);
  const [showTOTPLoginPrompt, setShowTOTPLoginPrompt] = useState(false);
  const [loginOTPCode, setLoginOTPCode] = useState<string>("");
  const [isVerifyingLoginOTP, setIsVerifyingLoginOTP] = useState(false);
  const [postLoginIdToken, setPostLoginIdToken] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [historyTab, setHistoryTab] = useState<'all' | 'product' | 'visit' | 'consultation'>('all');
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [addrForm, setAddrForm] = useState<Partial<AddressItem>>({ label: '', recipient: '', phone: '', addressLine: '', city: '', province: '', postalCode: '', location: null });
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const mapMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapSearch, setMapSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [following, setFollowing] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);

  // Open activity destination
  const openActivity = async (a: any) => {
    try {
      // Product view - simpan ke localStorage dan redirect
      if ((a.type === 'product_view' || a.productASIN) && a.productASIN) {
        // Simpan product data ke localStorage untuk BuyingPage
        const productData = {
          ASIN: a.productASIN,
          nama_produk: a.productName || a.title || '',
          toko: a.store || a.storeName || '',
          kategori: a.category || '',
          gambar_produk: a.image || ''
        };
        localStorage.setItem("selectedProduct", JSON.stringify(productData));
        
        // Redirect ke buying page (route yang benar)
        window.location.href = '/buying';
        return; 
      } 
      
      // UMKM visit - always redirect to toko page
      if (a.type === 'visit' || a.storeId || a.store || a.storeName) {
        const storeName = a.store || a.storeName || 'UMKM';
        
        // Simpan data UMKM lengkap ke localStorage untuk Toko.tsx
        const productData = { 
          toko: storeName,
          nama_produk: a.storeName || storeName,
          image: a.image,
          description: a.description,
          address: a.address,
          phone: a.phone,
          rating: a.rating,
          reviewCount: a.reviewCount
        };
        localStorage.setItem("selectedProduct", JSON.stringify(productData));
        
        // Redirect ke toko page
        window.location.href = '/toko';
        return;
      }
      
      // Consultant chat - redirect to ConsultantChat
      if ((a.type === 'consult_chat' || a.type === 'consult_chat_message') && a.consultantId) {
        const consultantId = typeof a.consultantId === 'number' ? a.consultantId : parseInt(String(a.consultantId));
        if (!isNaN(consultantId) && consultantId > 0) {
          window.location.href = `/ConsultantChat?consultant=${consultantId}`;
          return;
        }
      }
      
      // Fallback
      console.warn('Unknown activity type or missing data:', a);
    } catch (error) {
      console.error('Error opening activity:', error);
    }
  };

  // Responsive Handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth State Observer
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }

      setCurrentUser(user);
      setCanEdit(true);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      setProfileData({
        nickname: userData.nickname || "",
        fullName: userData.fullName || "",
        bio: userData.bio || "",
        photoURL: userData.photoURL || user.photoURL || "",
        email: user.email,
        twoFactorEnabled: userData.twoFactorEnabled || false,
        lastPasswordChange: userData.lastPasswordChange?.toDate() || null,
        securityScore: userData.securityScore || 0
      });

      try {
        const idToken = await user.getIdToken(false);
        if (userData.twoFactorEnabled) {
          setPostLoginIdToken(idToken);
          setShowTOTPLoginPrompt(true);
        } else {
          await fetch('/api/session-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ idToken })
          });
        }
      } catch (e) {}

      const [userBadgesData, badgesData, statsData] = await Promise.all([
        getUserBadges(user.uid),
        fetchAllBadges(),
        getUserGamificationStats(user.uid)
      ]);

      setUserBadges(userBadgesData);
      setBadges(badgesData);
      setGamificationStats(statsData);

      try {
        let loadedActivities: any[] = [];
        
        // Load from Firestore
        if (db) {
          try {
            const q = query(collection(db, 'users', user.uid, 'activities'), orderBy('createdAt', 'desc'), limit(100));
            const snap = await getDocs(q);
            loadedActivities = snap.docs.map(d => {
              const data: any = d.data();
              const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : 
                               data.createdAt ? new Date(data.createdAt) : new Date();
              
              // Debug consultant data
              if (data.type === 'consult_chat' || data.type === 'consult_chat_message') {
                console.log('Loading consultant activity:', {
                  id: d.id,
                  type: data.type,
                  consultantId: data.consultantId,
                  consultantName: data.consultantName,
                  image: data.image,
                  title: data.title
                });
              }
              
              return {
                id: d.id,
                type: data.type || 'other',
                title: data.title || '',
                store: data.store || data.storeName || null,
                storeName: data.storeName || data.store || null,
                storeId: data.storeId || null,
                productASIN: data.productASIN || null,
                productName: data.productName || data.title || null,
                consultantId: data.consultantId !== undefined && data.consultantId !== null ? Number(data.consultantId) : null,
                consultantName: data.consultantName || data.title || null,
                image: data.image || null,
                category: data.category || null,
                createdAt,
                timestamp: data.createdAt,
                dateAdded: createdAt.toLocaleString('id-ID')
              };
            });
          } catch (e) {
            console.warn('Failed to load activities from Firestore:', e);
          }
        }
        
        // Load from localStorage as fallback
        try {
          const localActivities = JSON.parse(localStorage.getItem('user_activities') || '[]');
          const localMapped = localActivities.map((a: any) => {
            // Debug consultant data from localStorage
            if (a.type === 'consult_chat' || a.type === 'consult_chat_message') {
              console.log('Loading consultant activity from localStorage:', {
                id: a.id,
                type: a.type,
                consultantId: a.consultantId,
                consultantName: a.consultantName,
                image: a.image,
                title: a.title
              });
            }
            
            return {
              id: a.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: a.type || 'other',
              title: a.title || '',
              store: a.store || null,
              storeName: a.store || a.storeName || null,
              storeId: a.storeId || null,
              productASIN: a.productASIN || null,
              productName: a.productName || a.title || null,
              consultantId: a.consultantId !== undefined && a.consultantId !== null ? Number(a.consultantId) : null,
              consultantName: a.consultantName || a.title || null,
              image: a.image || null,
              category: a.category || null,
              createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
              dateAdded: a.createdAt ? new Date(a.createdAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')
            };
          });
          
          // Merge and deduplicate (prioritize Firestore)
          // Only add local activities that don't exist in Firestore
          const firestoreIds = new Set(loadedActivities.map((a: any) => a.id));
          const localOnly = localMapped.filter((a: any) => !firestoreIds.has(a.id));
          const allActivities = [...loadedActivities, ...localOnly];
          
          // Deduplicate by content (not just ID) - keep most recent
          const uniqueActivities = allActivities.filter((activity, index, self) => {
            const foundIndex = self.findIndex((a) => {
              // For product views - match by ASIN and type
              if (activity.type === 'product_view' && a.type === 'product_view') {
                return a.productASIN === activity.productASIN;
              }
              // For visits - match by storeId (preferred) or store name
              if (activity.type === 'visit' && a.type === 'visit') {
                if (activity.storeId && a.storeId) {
                  return a.storeId === activity.storeId;
                }
                if (activity.store && a.store) {
                  return a.store === activity.store || a.storeName === activity.store;
                }
                return false;
              }
              // For consultant chat - don't deduplicate, keep all entries
              if ((activity.type === 'consult_chat' || activity.type === 'consult_chat_message') && 
                  (a.type === 'consult_chat' || a.type === 'consult_chat_message')) {
                return false; // Don't deduplicate consultant chats
              }
              // Otherwise match by ID
              return a.id === activity.id;
            });
            // Keep the first occurrence (most recent due to sorting)
            return foundIndex === index;
          });
          
          // Sort by date (most recent first)
          uniqueActivities.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
          });
          
          setActivities(uniqueActivities.slice(0, 100));
        } catch (e) {
          console.warn('Failed to load activities from localStorage:', e);
          setActivities(loadedActivities);
        }
      } catch (e) {
        console.warn('Failed to load activities:', e);
        setActivities([]);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Address Helpers
  const loadAddresses = async (uid?: string) => {
    const userId = uid || currentUser?.uid;
    if (!db || !userId) return;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'addresses'));
      const list: AddressItem[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setAddresses(list);
    } catch {}
  };

  const loadFollowing = async (uid?: string) => {
    const userId = uid || currentUser?.uid;
    if (!userId) return;
    try {
      const followingList = await getFollowing(userId);
      setFollowing(followingList);
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const loadFollowerCount = async (uid?: string) => {
    const userId = uid || currentUser?.uid;
    if (!userId) return;
    try {
      // For user profile, we can track followers differently
      // For now, we'll use a simple count
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setFollowerCount(data.followerCount || 0);
      }
    } catch (error) {
      console.error('Error loading follower count:', error);
    }
  };

  const loadFollowers = async (uid?: string) => {
    const userId = uid || currentUser?.uid;
    if (!userId) return;
    setIsLoadingFollowers(true);
    try {
      const followersList = await getUserFollowers(userId);
      setFollowers(followersList);
      setFollowerCount(followersList.length);
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      loadAddresses(currentUser.uid);
      loadFollowing(currentUser.uid);
      loadFollowers(currentUser.uid);
    }
  }, [currentUser?.uid]);

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddrForm({
      label: '',
      recipient: '',
      phone: '',
      addressLine: '',
      city: '',
      province: '',
      postalCode: '',
      location: null,
      isPrimary: addresses.length === 0
    });
    setShowAddressModal(true);
    setTimeout(initMap, 50);
  };

  const openEditAddress = (a: AddressItem) => {
    setEditingAddress(a);
    setAddrForm({ ...a });
    setShowAddressModal(true);
    setTimeout(initMap, 50);
  };

  const saveAddress = async () => {
    if (!currentUser?.uid) return;
    const id = editingAddress?.id || Date.now().toString();
    const data = {
      label: (addrForm.label || '').trim() || 'Alamat',
      recipient: (addrForm.recipient || '').trim(),
      phone: (addrForm.phone || '').trim(),
      addressLine: (addrForm.addressLine || '').trim(),
      city: (addrForm.city || '').trim(),
      province: (addrForm.province || '').trim(),
      postalCode: (addrForm.postalCode || '').trim(),
      location: addrForm.location || null,
      isPrimary: !!addrForm.isPrimary,
      isBackup1: !!addrForm.isBackup1,
      isBackup2: !!addrForm.isBackup2,
      updatedAt: serverTimestamp(),
      ...(editingAddress ? {} : { createdAt: serverTimestamp() })
    };

    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'addresses', id), data, { merge: true });

      const others = addresses.filter((a: AddressItem) => a.id !== id);
      if (data.isPrimary) {
        await Promise.all(others.map((a: AddressItem) =>
          setDoc(doc(db, 'users', currentUser.uid, 'addresses', a.id), { isPrimary: false }, { merge: true })
        ));
      }
      if (data.isBackup1) {
        await Promise.all(others.map((a: AddressItem) =>
          setDoc(doc(db, 'users', currentUser.uid, 'addresses', a.id), { isBackup1: false }, { merge: true })
        ));
      }
      if (data.isBackup2) {
        await Promise.all(others.map((a: AddressItem) =>
          setDoc(doc(db, 'users', currentUser.uid, 'addresses', a.id), { isBackup2: false }, { merge: true })
        ));
      }
      await loadAddresses();
      setShowAddressModal(false);
    } catch (e) {
      setModalTitle('Gagal menyimpan alamat');
      setModalMessage('Periksa koneksi dan coba lagi.');
      setShowErrorModal(true);
    }
  };

  const deleteAddressById = async (id: string) => {
    if (!currentUser?.uid) return;
    if (!confirm('Hapus alamat ini?')) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'addresses', id));
      await loadAddresses();
    } catch {}
  };

  const setPrimary = async (id: string) => {
    if (!currentUser?.uid) return;
    try {
      await Promise.all(addresses.map(a =>
        setDoc(doc(db, 'users', currentUser.uid, 'addresses', a.id), { isPrimary: a.id === id }, { merge: true })
      ));
      await loadAddresses();
    } catch {}
  };

  const setBackup1 = async (id: string) => {
    if (!currentUser?.uid) return;
    try {
      await Promise.all(addresses.map(a =>
        setDoc(doc(db, 'users', currentUser.uid, 'addresses', a.id), { isBackup1: a.id === id }, { merge: true })
      ));
      await loadAddresses();
    } catch {}
  };

  const setBackup2 = async (id: string) => {
    if (!currentUser?.uid) return;
    try {
      await Promise.all(addresses.map(a =>
        setDoc(doc(db, 'users', currentUser.uid, 'addresses', a.id), { isBackup2: a.id === id }, { merge: true })
      ));
      await loadAddresses();
    } catch {}
  };

  const initMap = () => {
    try {
      const center: [number, number] = addrForm.location ?
        [addrForm.location.lng, addrForm.location.lat] :
        [106.8166, -6.2000];

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(12);
      } else if (mapContainerRef.current) {
        mapInstanceRef.current = new maplibregl.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: ' OpenStreetMap contributors'
              }
            },
            layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
          },
          center: center,
          zoom: 12
        });

        mapInstanceRef.current.on('click', (e: maplibregl.MapMouseEvent) => {
          const lat = e.lngLat.lat;
          const lng = e.lngLat.lng;
          placeMarker(lat, lng);
        });
      }

      if (addrForm.location) {
        placeMarker(addrForm.location.lat!, addrForm.location.lng!);
      }
    } catch {}
  };

  const placeMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    if (!mapMarkerRef.current) {
      mapMarkerRef.current = new maplibregl.Marker({ color: '#ff6b35' });
      mapMarkerRef.current.addTo(mapInstanceRef.current);
    }

    mapMarkerRef.current.setLngLat([lng, lat]);
    setAddrForm(f => ({ ...f, location: { lat, lng } }));
    mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 14 });
  };

  const searchPlace = async (query?: string) => {
    const q = (query || mapSearch).trim();
    if (!q) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5&countrycodes=id`);
      const data = await res.json();
      if (data && Array.isArray(data)) {
        setSearchResults(data);
        setShowSearchResults(true);
        if (data[0] && query) {
          // Auto-select first result if called with query
          selectSearchResult(data[0]);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (e) {
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const addr = result.address || {};

    placeMarker(lat, lon);

    // Auto-fill address fields
    setAddrForm(f => ({
      ...f,
      addressLine: result.display_name || '',
      city: addr.city || addr.town || addr.village || addr.district || '',
      province: addr.state || addr.region || '',
      postalCode: addr.postcode || '',
      location: { lat, lng: lon }
    }));

    setMapSearch(result.display_name || '');
    setShowSearchResults(false);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setModalTitle('Tidak Didukung');
      setModalMessage('Geolokasi tidak didukung di browser Anda.');
      setShowErrorModal(true);
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        placeMarker(lat, lng);
        
        // Reverse geocode to get address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          const data = await res.json();
          
          if (data) {
            const addr = data.address || {};
            setAddrForm(f => ({
              ...f,
              addressLine: data.display_name || '',
              city: addr.city || addr.town || addr.village || addr.district || '',
              province: addr.state || addr.region || '',
              postalCode: addr.postcode || '',
              location: { lat, lng }
            }));
            setMapSearch(data.display_name || '');
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        setModalTitle('Gagal Mendapatkan Lokasi');
        setModalMessage('Tidak dapat mendapatkan lokasi Anda. Pastikan izin lokasi diaktifkan.');
        setShowErrorModal(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleMapSearchChange = (value: string) => {
    setMapSearch(value);
  };

  // Debounce effect for map search
  useEffect(() => {
    if (mapSearch.trim().length > 2) {
      const timer = setTimeout(() => {
        searchPlace();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [mapSearch]);

  // Calculate Security Score
  const calculateSecurityScore = (data: UserProfileData): number => {
    let score = 0;
    if (data.email) score += 30;
    if (data.twoFactorEnabled) score += 40;
    if (data.fullName && data.bio) score += 20;
    if (data.lastPasswordChange) {
      const daysSinceChange = (Date.now() - data.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceChange <= 90) score += 10;
    }
    return Math.min(score, 100);
  };

  useEffect(() => {
    setSecurityScore(calculateSecurityScore(profileData));
  }, [profileData]);

  // TOTP Functions
  const startTOTPSetup = async () => {
    if (!currentUser) return;
    try {
      setIsSettingUpTOTP(true);
      const generateBase32Secret = (length: number = 32) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        const bytes = new Uint8Array(length);
        window.crypto.getRandomValues(bytes);
        let out = '';
        for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
        return out;
      };
      const secret = generateBase32Secret(32);
      setTotpSecret(secret);
      try {
        const issuer = encodeURIComponent('UMKMotion');
        const account = encodeURIComponent(currentUser.email || currentUser.uid || 'user');
        const otpAuthUrl = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
        const dataUrl = await QRCode.toDataURL(otpAuthUrl, { width: 220, margin: 1 });
        setTotpQRCode(dataUrl);
      } catch {
        setTotpQRCode('');
      }
      setTotpCode("");
      setShowTOTPSetup(true);
    } catch (e) {
      setModalTitle('Error TOTP');
      setModalMessage('Gagal menyiapkan TOTP. Coba lagi.');
      setShowErrorModal(true);
    } finally {
      setIsSettingUpTOTP(false);
    }
  };

  const base32ToBytes = (b32: string): Uint8Array => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    const cleaned = b32.replace(/=+$/, '').toUpperCase().replace(/[^A-Z2-7]/g, '');
    for (let i = 0; i < cleaned.length; i++) {
      const val = alphabet.indexOf(cleaned[i]);
      if (val < 0) continue;
      bits += val.toString(2).padStart(5, '0');
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }
    return new Uint8Array(bytes);
  };

  const hmacSha1 = async (key: Uint8Array, msg: Uint8Array): Promise<ArrayBuffer> => {
    const cryptoKey = await crypto.subtle.importKey('raw', key.buffer as ArrayBuffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    return crypto.subtle.sign('HMAC', cryptoKey, msg.buffer as ArrayBuffer);
  };

  const hotp = async (secretB32: string, counter: number, digits = 6): Promise<string> => {
    const key = base32ToBytes(secretB32);
    const ctr = new ArrayBuffer(8);
    const view = new DataView(ctr);
    const hi = Math.floor(counter / 0x100000000);
    const lo = counter >>> 0;
    view.setUint32(0, hi);
    view.setUint32(4, lo);
    const hmac = new Uint8Array(await hmacSha1(key, new Uint8Array(ctr)));
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
    return (code % 10 ** digits).toString().padStart(digits, '0');
  };

  const verifyTotp = async (secretB32: string, token: string, step = 30, windowSkew = 1): Promise<boolean> => {
    const time = Math.floor(Date.now() / 1000);
    const counter = Math.floor(time / step);
    for (let w = -windowSkew; w <= windowSkew; w++) {
      const code = await hotp(secretB32, counter + w, 6);
      if (code === token) return true;
    }
    return false;
  };

  const verifyTOTPSetup = async () => {
    if (!currentUser || !totpSecret || totpCode.length !== 6) return;
    try {
      const isValid = await verifyTotp(totpSecret, totpCode);
      if (!isValid) {
        setModalTitle('Verifikasi TOTP Gagal');
        setModalMessage('Kode tidak valid. Periksa waktu perangkat dan coba lagi.');
        setShowErrorModal(true);
        return;
      }
      const updatedData = { ...profileData, twoFactorEnabled: true } as UserProfileData;
      const newSecurityScore = calculateSecurityScore(updatedData);
      await setDoc(doc(db, "users", currentUser.uid), {
        ...updatedData,
        securityScore: newSecurityScore,
        totpSecret,
        totpEnabled: true,
        twoFactorEnabledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      setProfileData(updatedData);
      setShowTOTPSetup(false);
      setModalTitle('TOTP Diaktifkan');
      setModalMessage('Autentikasi aplikasi (TOTP) berhasil diaktifkan.');
      setShowSuccessModal(true);
    } catch (e) {
      setModalTitle('Error TOTP');
      setModalMessage('Gagal menyimpan konfigurasi TOTP.');
      setShowErrorModal(true);
    }
  };

  const handleVerifyLoginTOTP = async () => {
    if (!postLoginIdToken) return;
    setIsVerifyingLoginOTP(true);
    try {
      const resp = await fetch('/api/verify-totp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken: postLoginIdToken, otp: loginOTPCode })
      });
      if (resp.ok) {
        setShowTOTPLoginPrompt(false);
        setLoginOTPCode("");
        setModalTitle('Login Berhasil');
        setModalMessage('Verifikasi 2FA sukses. Sesi aman telah dibuat.');
        setShowSuccessModal(true);
      } else {
        const data = await resp.json().catch(() => ({ error: 'Verifikasi gagal' }));
        setModalTitle('Verifikasi Gagal');
        setModalMessage(data.error || 'Kode OTP tidak valid atau kedaluwarsa. Coba lagi.');
        setShowErrorModal(true);
      }
    } catch (e) {
      setModalTitle('Kesalahan Jaringan');
      setModalMessage('Tidak dapat memverifikasi OTP. Periksa koneksi Anda dan coba lagi.');
      setShowErrorModal(true);
    } finally {
      setIsVerifyingLoginOTP(false);
    }
  };

  const fetchAllBadges = async (): Promise<Badge[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "badges"));
      return querySnapshot.docs.map(doc => ({ ...doc.data() } as Badge));
    } catch (error) {
      console.error("Error fetching badges:", error);
      return [];
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser || !canEdit) {
      setModalTitle('Akses Dibatasi');
      setModalMessage('Anda tidak diizinkan untuk mengedit profil ini.');
      setShowErrorModal(true);
      return;
    }

    setSaving(true);
    try {
      let photoURL = profileData.photoURL;
      if (previewImage && fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const imageRef = ref(storage, `profile-images/${currentUser.uid}`);
        await uploadBytes(imageRef, file);
        photoURL = await getDownloadURL(imageRef);
      }

      const updatedData = { ...profileData, photoURL };
      const newSecurityScore = calculateSecurityScore(updatedData);

      const idToken = await currentUser.getIdToken(false);

      const updateResp = await fetch('/api/profile-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nickname: updatedData.nickname,
          fullName: updatedData.fullName,
          bio: updatedData.bio,
          photoURL: photoURL,
          idToken: idToken
        })
      });

      if (!updateResp.ok) {
        const errorData = await updateResp.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to update profile');
      }

      await updateProfile(currentUser, {
        displayName: updatedData.nickname || updatedData.fullName,
        photoURL
      });

      setProfileData(prev => ({ ...prev, photoURL, securityScore: newSecurityScore }));
      setPreviewImage(null);
      setIsEditingPersonal(false);
      setIsEditingBio(false);
      setModalTitle('Profil Diperbarui');
      setModalMessage('Profil berhasil diperbarui!');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setModalTitle('Error');
      setModalMessage(error.message || 'Gagal memperbarui profil. Silakan coba lagi.');
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setModalTitle('Email Terkirim');
      setModalMessage('Email untuk reset kata sandi telah dikirim.');
      setShowSuccessModal(true);
    } catch (error) {
      setModalTitle('Error');
      setModalMessage('Gagal mengirim email reset kata sandi.');
      setShowErrorModal(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };


  // Helper Functions
  const getBadgeData = (badgeId: string) => badges.find(b => b.id === badgeId);

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      common: 'border-gray-300 bg-gray-50',
      uncommon: 'border-green-300 bg-green-50',
      rare: 'border-blue-300 bg-blue-50',
      epic: 'border-purple-300 bg-purple-50',
      legendary: 'border-yellow-300 bg-yellow-50',
    };
    return colors[rarity] || colors.common;
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.trim().split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-indigo-500'];
    if (!name) return colors[0];
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getSecurityLevel = (score: number) => {
    if (score >= 90) return { level: 'Sangat Aman', color: 'text-green-600', icon: <ShieldCheck className="w-4 h-4 text-green-600" /> };
    if (score >= 70) return { level: 'Aman', color: 'text-blue-600', icon: <Shield className="w-4 h-4 text-blue-600" /> };
    if (score >= 50) return { level: 'Cukup Aman', color: 'text-yellow-600', icon: <ShieldAlert className="w-4 h-4 text-yellow-600" /> };
    return { level: 'Kurang Aman', color: 'text-red-600', icon: <AlertTriangle className="w-4 h-4 text-red-600" /> };
  };

  const getSecurityRecommendations = (data: UserProfileData) => {
    const recommendations: string[] = [];
    if (!data.twoFactorEnabled) recommendations.push('Aktifkan autentikasi dua faktor (2FA)');
    if (!data.fullName || !data.bio) recommendations.push('Lengkapi profil Anda');
    const daysSincePasswordChange = data.lastPasswordChange ? (Date.now() - data.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24) : 999;
    if (daysSincePasswordChange > 90) recommendations.push('Perbarui kata sandi secara berkala');
    return recommendations;
  };

  const displayName = profileData.nickname || profileData.fullName || currentUser?.displayName || 'Pengguna';

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-slate-600 text-sm">Memuat profil...</p>
        </div>
      </div>
    );
  }

  // Sidebar Animation Variants
  const sidebarVariants: Variants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    },
    closed: {
      x: isMobile ? -280 : 0,
      opacity: isMobile ? 0 : 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  } as Variants;

  const navItemVariants: Variants = {
    open: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    closed: {
      x: -20,
      opacity: 0,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      }
    }
  } as Variants;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-sans">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - POSISI KONTEN LEBIH KE BAWAH */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile
            ? (isSidebarOpen ? '280px' : '0px')
            : (isSidebarOpen ? '280px' : '80px')
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }}
        className={`${isMobile ? 'fixed' : 'sticky'} top-0 h-screen bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col z-50 overflow-hidden border-r border-gray-200/50`}
        style={{
          left: isMobile && !isSidebarOpen ? '-100%' : '0',
          boxShadow: isSidebarOpen ? '0 0 50px rgba(0,0,0,0.1)' : '0 0 20px rgba(0,0,0,0.05)'
        }}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center h-24 pt-12 pb-4 border-b border-gray-100 px-4 flex-shrink-0">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.img
                key="logo-full"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 20
                }}
                src="/LogoNavbar.webp"
                alt="UMKMotion"
                className="h-12 w-auto drop-shadow-lg"
              />
            ) : (
              <motion.div
                key="logo-mini"
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 20
                }}
                className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl"
              >
                U
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Mini Card - MARGIN TOP LEBIH BESAR mt-2 */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="px-4 py-3 border-b border-gray-100 overflow-hidden mt-2"
            >
              <motion.div 
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ring-4 ring-white ${getAvatarColor(displayName)}`}>
                  {profileData.photoURL ? (
                    <img src={profileData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">{displayName}</div>
                  <div className="text-xs text-gray-500 truncate">{profileData.email}</div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pt-4 pb-6 px-3 mt-4">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-gray-500 uppercase font-bold mb-4 px-3 tracking-wider"
              >
                Menu Navigasi
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div 
            className="space-y-2"
            variants={sidebarVariants}
            initial="closed"
            animate={isSidebarOpen ? "open" : "closed"}
          >
            {[
              { label: 'Profil', icon: User, menu: 'profile', gradient: 'from-orange-500 to-red-500', bgHover: 'hover:bg-orange-50' },
              { label: 'Riwayat', icon: History, menu: 'history', gradient: 'from-blue-500 to-cyan-500', bgHover: 'hover:bg-blue-50' },
              { label: 'Toko', icon: Store, menu: 'store', gradient: 'from-green-500 to-emerald-500', bgHover: 'hover:bg-green-50' },
              { label: 'Harga', icon: DollarSign, menu: 'pricing', gradient: 'from-purple-500 to-pink-500', bgHover: 'hover:bg-purple-50' },
            ].map((item) => (
              <motion.button
                key={item.menu}
                variants={navItemVariants}
                onClick={() => {
                  setActiveMenu(item.menu as any);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                whileHover={{ 
                  scale: 1.03,
                  x: isSidebarOpen ? 5 : 0,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-3 py-3.5 rounded-xl font-bold transition-all duration-300 relative group overflow-hidden ${
                  activeMenu === item.menu 
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl shadow-${item.gradient.split('-')[1]}-500/30` 
                    : `text-gray-700 ${item.bgHover}`
                } ${isSidebarOpen ? 'px-4 justify-start' : 'px-0 justify-center'}`}
                title={!isSidebarOpen ? item.label : ''}
              >
                {activeMenu === item.menu && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                <item.icon size={22} className="flex-shrink-0 relative z-10" />
                
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden text-sm relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {!isSidebarOpen && !isMobile && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </motion.button>
            ))}
          </motion.div>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-3 flex-shrink-0">
          <motion.button
            onClick={handleSignOut}
            whileHover={{ 
              scale: 1.03,
              transition: { type: "spring", stiffness: 400, damping: 17 }
            }}
            whileTap={{ scale: 0.95 }}
            className={`group w-full flex items-center gap-3 p-3.5 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all relative overflow-hidden ${
              isSidebarOpen ? 'justify-start' : 'justify-center'
            }`}
            title={!isSidebarOpen ? 'Keluar' : ''}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <LogOut size={22} className="flex-shrink-0 relative z-10" />
            
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 text-left overflow-hidden relative z-10"
                >
                  <div className="text-sm font-bold whitespace-nowrap">Keluar Akun</div>
                  <div className="text-xs text-red-500 whitespace-nowrap">Akhiri sesi Anda</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            {!isSidebarOpen && !isMobile && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                Keluar Akun
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900"></div>
              </div>
            )}
          </motion.button>
        </div>
      </motion.aside>

      {/* Toggle Button - Desktop Only */}
      {!isMobile && (
        <motion.button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex fixed top-28 z-[60] w-11 h-11 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl hover:shadow-orange-500/50 transition-all items-center justify-center group"
          animate={{
            left: isSidebarOpen ? '268px' : '68px'
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
          }}
          whileHover={{
            scale: 1.15,
            rotate: isSidebarOpen ? -5 : 5,
            transition: { type: "spring", stiffness: 400, damping: 17 }
          }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isSidebarOpen ? 0 : 180 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            <ChevronLeft size={22} />
          </motion.div>
        </motion.button>
      )}

      {/* Mobile Menu Toggle */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 right-4 z-40 lg:hidden w-14 h-14 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl shadow-2xl flex items-center justify-center"
          whileHover={{
            scale: 1.1,
            rotate: 5,
            transition: { type: "spring", stiffness: 400, damping: 17 }
          }}
          whileTap={{ scale: 0.9, rotate: -5 }}
        >
          <motion.div
            animate={{ rotate: isSidebarOpen ? 180 : 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            {isSidebarOpen ? <X size={26} /> : <Menu size={26} />}
          </motion.div>
        </motion.button>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 lg:mb-8 pr-16 sm:pr-0"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.button 
                  onClick={() => window.history.back()} 
                  className="p-2.5 bg-white text-orange-600 hover:bg-orange-50 rounded-xl shadow-sm border border-orange-100 transition-all"
                  whileHover={{ scale: 1.05, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Kembali"
                >
                  <ArrowLeft size={20} />
                </motion.button>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent truncate">
                    {activeMenu === 'profile' && 'Profil Saya'}
                    {activeMenu === 'history' && 'Riwayat'}
                    {activeMenu === 'store' && 'Toko Saya'}
                    {activeMenu === 'pricing' && 'Pricing'}
                  </h1>
                  {activeMenu === 'profile' && (
                    <p className="text-slate-600 mt-0.5 text-sm line-clamp-1">
                      Kelola informasi profil dan lihat pencapaian Anda
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.header>

          {/* Profile Content */}
          {activeMenu === 'profile' && (
            <>
              {/* Security Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl p-6 text-white mb-8 relative overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl translate-y-16 -translate-x-16"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getSecurityLevel(securityScore).icon}
                      <div>
                        <h3 className="text-xl font-bold">Keamanan Akun</h3>
                        <p className="text-sm text-gray-300">Tingkatkan keamanan untuk perlindungan maksimal</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <motion.div 
                        className="text-4xl font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      >
                        {securityScore}%
                      </motion.div>
                      <div className={`text-sm font-medium ${getSecurityLevel(securityScore).color}`}>
                        {getSecurityLevel(securityScore).level}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="w-full bg-slate-700/50 rounded-full h-3 backdrop-blur-sm">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${securityScore}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                        className={`h-3 rounded-full ${
                          securityScore >= 90 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                          securityScore >= 70 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                          securityScore >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                          'bg-gradient-to-r from-red-500 to-red-400'
                        } shadow-lg`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Email', status: profileData.email, icon: Mail },
                      { label: '2FA', status: profileData.twoFactorEnabled, icon: Lock },
                      { label: 'Profil', status: (profileData.fullName && profileData.bio), icon: User }
                    ].map((item, idx) => (
                      <motion.div 
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (idx * 0.1) }}
                        className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all"
                      >
                        <div className="flex justify-center mb-2">
                          {item.status ? 
                            <CheckCircle2 className="w-6 h-6 text-green-400" /> : 
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                          }
                        </div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-gray-300">
                          {item.status ? 'Aktif' : 'Belum aktif'}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Tabs */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 bg-white rounded-xl p-2 mb-6 shadow-lg border border-gray-100"
              >
                {[
                  { id: 'profile', label: 'Profil', icon: User, gradient: 'from-orange-500 via-red-500 to-pink-500' },
                  { id: 'security', label: 'Keamanan', icon: Shield, gradient: 'from-blue-500 via-indigo-500 to-purple-500' },
                  { id: 'badges', label: `Badge (${userBadges.length})`, icon: Award, gradient: 'from-purple-500 via-pink-500 to-red-500' }
                ].map((tab, idx) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "profile" | "security" | "badges")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 relative overflow-hidden ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl`
                        : "text-slate-600 hover:text-slate-900 hover:bg-gray-50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabBg"
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <tab.icon className="w-5 h-5 relative z-10" />
                    <span className="hidden sm:inline relative z-10">{tab.label}</span>
                    <span className="sm:hidden relative z-10">{tab.label.split(' ')[0]}</span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Tab Content - Profile */}
              {activeTab === "profile" ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  <div className="lg:col-span-2 space-y-6">
                    {/* Photo Section */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative group">
                          <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white ${getAvatarColor(displayName)} transition-transform group-hover:scale-105`}>
                            {previewImage || profileData.photoURL ? (
                              <img src={previewImage || profileData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              getInitials(displayName)
                            )}
                          </div>
                          <motion.button
                            onClick={() => canEdit && fileInputRef.current?.click()}
                            disabled={!canEdit}
                            className={`absolute bottom-0 right-0 w-10 h-10 rounded-full border-3 border-white flex items-center justify-center transition-all ${canEdit ? 'bg-gradient-to-r from-orange-500 to-red-500 cursor-pointer hover:from-orange-600 hover:to-red-600' : 'bg-gray-300 cursor-not-allowed'} shadow-lg`}
                            whileHover={canEdit ? { scale: 1.1, rotate: 5 } : {}}
                            whileTap={canEdit ? { scale: 0.95 } : {}}
                          >
                            <Camera size={18} className="text-white" />
                          </motion.button>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-900 mb-1">Upload foto baru</div>
                          <div className="text-sm text-gray-500">
                            Minimal 800×800 px. Format JPG atau PNG.
                          </div>
                        </div>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} disabled={!canEdit} className="hidden" />
                    </motion.div>
                    
                    {/* Personal Info */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Informasi Pribadi</h3>
                        <motion.button 
                          onClick={() => canEdit && setIsEditingPersonal(!isEditingPersonal)}
                          disabled={!canEdit}
                          className={`flex items-center gap-2 font-bold text-sm px-3 py-2 rounded-lg transition ${canEdit ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
                          whileHover={canEdit ? { scale: 1.05 } : {}}
                          whileTap={canEdit ? { scale: 0.95 } : {}}
                        >
                          <Edit2 size={16} />
                          Edit
                        </motion.button>
                      </div>

                      {isEditingPersonal ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm text-gray-600 font-medium mb-2">Nama Panggilan</label>
                              <input 
                                type="text" 
                                value={profileData.nickname || ""}
                                onChange={(e) => setProfileData({...profileData, nickname: e.target.value})}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 font-medium mb-2">Nama Lengkap</label>
                              <input 
                                type="text" 
                                value={profileData.fullName || ""}
                                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm text-gray-600 font-medium mb-2">Alamat</label>
                            <textarea 
                              value={profileData.address || ""}
                              onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[80px] resize-y transition-all"
                              placeholder="Masukkan alamat lengkap Anda..."
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm text-gray-600 font-medium mb-2">Email</label>
                            <input 
                              type="email" 
                              value={profileData.email || ""}
                              disabled
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <motion.button 
                              onClick={() => setIsEditingPersonal(false)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <X size={16} />
                              Batal
                            </motion.button>
                            <motion.button 
                              onClick={() => { handleSave(); setIsEditingPersonal(false); }}
                              disabled={saving || !canEdit}
                              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold text-sm hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 shadow-lg"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                              Simpan
                            </motion.button>
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600 font-medium mb-1">Nama Panggilan</div>
                            <div className="text-sm text-gray-900 font-medium">{profileData.nickname || '-'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 font-medium mb-1">Nama Lengkap</div>
                            <div className="text-sm text-gray-900 font-medium">{profileData.fullName || '-'}</div>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-sm text-gray-600 font-medium mb-1">Alamat</div>
                            <div className="text-sm text-gray-900 font-medium whitespace-pre-wrap">{profileData.address || '-'}</div>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-sm text-gray-600 font-medium mb-1">Email</div>
                            <div className="text-sm text-gray-900 font-medium break-all">{profileData.email || '-'}</div>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Bio Section */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Deskripsi</h3>
                        <motion.button 
                          onClick={() => canEdit && setIsEditingBio(!isEditingBio)}
                          disabled={!canEdit}
                          className={`flex items-center gap-2 font-bold text-sm px-3 py-2 rounded-lg transition ${canEdit ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`}
                          whileHover={canEdit ? { scale: 1.05 } : {}}
                          whileTap={canEdit ? { scale: 0.95 } : {}}
                        >
                          <Edit2 size={16} />
                          Edit
                        </motion.button>
                      </div>

                      {isEditingBio ? (
                        <>
                          <textarea 
                            value={profileData.bio || ""}
                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[120px] resize-y transition-all"
                            placeholder="Ceritakan tentang diri Anda..."
                          />
                          <div className="flex justify-end gap-2 mt-4">
                            <motion.button 
                              onClick={() => setIsEditingBio(false)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <X size={16} />
                              Batal
                            </motion.button>
                            <motion.button 
                              onClick={() => { handleSave(); setIsEditingBio(false); }}
                              disabled={saving || !canEdit}
                              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold text-sm hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 shadow-lg"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                              Simpan
                            </motion.button>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {profileData.bio || 'Belum ada deskripsi. Klik Edit untuk menambahkan.'}
                        </p>
                      )}
                    </motion.div>

                    {/* Follower/Following Section */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-blue-500" />
                        Follow & Follower
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          onClick={() => setShowFollowersModal(true)}
                          className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-3xl font-bold text-blue-600 mb-1">{followerCount}</div>
                          <div className="text-sm text-gray-600 font-medium">Follower</div>
                          <div className="text-xs text-blue-500 mt-1">Klik untuk lihat</div>
                        </motion.button>
                        <motion.button
                          onClick={() => setShowFollowingModal(true)}
                          className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-3xl font-bold text-green-600 mb-1">{following.length}</div>
                          <div className="text-sm text-gray-600 font-medium">Following</div>
                          <div className="text-xs text-green-500 mt-1">Klik untuk lihat</div>
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Address Section - ALAMAT SAYA */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-6 shadow-xl border-2 border-orange-300 hover:shadow-2xl transition-all"
                      style={{ minHeight: '200px' }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <MapPin size={24} className="text-white" />
                            </div>
                            Alamat Saya
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">Kelola alamat pengiriman Anda</p>
                        </div>
                        <motion.button 
                          onClick={openAddAddress}
                          disabled={!canEdit}
                          className={`flex items-center justify-center gap-2 font-bold text-sm px-5 py-2.5 rounded-lg transition ${canEdit ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                          whileHover={canEdit ? { scale: 1.05 } : {}}
                          whileTap={canEdit ? { scale: 0.95 } : {}}
                        >
                          <Plus size={18} />
                          Tambah Alamat
                        </motion.button>
                      </div>

                      <div className="space-y-3">
                        {(addresses.length === 0 ? [
                          {
                            id: 'placeholder',
                            label: 'Belum ada alamat',
                            recipient: displayName,
                            phone: '',
                            addressLine: 'Tambahkan alamat pengiriman Anda untuk memudahkan proses checkout',
                            city: '',
                            province: '',
                            postalCode: '',
                            isPrimary: true,
                          },
                        ] : addresses).map((addr: any, idx: number) => (
                          <motion.div
                            key={addr.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-5 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all bg-white relative"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin size={18} className="text-orange-500 flex-shrink-0" />
                                  <span className="font-bold text-lg text-gray-900">{addr.label || 'Alamat'}</span>
                                  {addr.isPrimary && (
                                    <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                                      Utama
                                    </span>
                                  )}
                                  {addr.isBackup1 && (
                                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-sm">
                                      Cadangan 1
                                    </span>
                                  )}
                                  {addr.isBackup2 && (
                                    <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full shadow-sm">
                                      Cadangan 2
                                    </span>
                                  )}
                                </div>
                                {addr.recipient && (
                                  <p className="text-sm text-gray-800 font-semibold mb-1.5 flex items-center gap-2">
                                    <User size={14} className="text-gray-400" />
                                    {addr.recipient}
                                  </p>
                                )}
                                {addr.phone && (
                                  <p className="text-sm text-gray-600 mb-1.5 flex items-center gap-2">
                                    <Phone size={14} className="text-gray-400" />
                                    {addr.phone}
                                  </p>
                                )}
                                {addr.addressLine && (
                                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">{addr.addressLine}</p>
                                )}
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin size={14} className="text-gray-400" />
                                  {[addr.city, addr.province, addr.postalCode].filter(Boolean).join(', ') || 'Lokasi belum ditentukan'}
                                </p>
                              </div>
                              <div className="flex gap-2 ml-4 flex-shrink-0">
                                <motion.button
                                  onClick={() => addr.id === 'placeholder' ? openAddAddress() : openEditAddress(addr)}
                                  disabled={!canEdit}
                                  className={`p-2.5 rounded-lg transition ${canEdit ? 'text-orange-500 hover:bg-orange-50 border border-orange-200' : 'text-gray-300 cursor-not-allowed border border-gray-200'}`}
                                  whileHover={canEdit ? { scale: 1.1 } : {}}
                                  whileTap={canEdit ? { scale: 0.9 } : {}}
                                  title={addr.id === 'placeholder' ? 'Tambah alamat' : 'Edit alamat'}
                                >
                                  <Edit2 size={18} />
                                </motion.button>
                                {addr.id !== 'placeholder' && (
                                  <motion.button
                                    onClick={() => deleteAddressById(addr.id)}
                                    disabled={!canEdit}
                                    className={`p-2.5 rounded-lg transition ${canEdit ? 'text-red-500 hover:bg-red-50 border border-red-200' : 'text-gray-300 cursor-not-allowed border border-gray-200'}`}
                                    whileHover={canEdit ? { scale: 1.1 } : {}}
                                    whileTap={canEdit ? { scale: 0.9 } : {}}
                                    title="Hapus alamat"
                                  >
                                    <X size={18} />
                                  </motion.button>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                              {addr.id !== 'placeholder' && !addr.isPrimary && (
                                <motion.button
                                  onClick={() => setPrimary(addr.id)}
                                  disabled={!canEdit}
                                  className={`text-xs px-3 py-1 rounded-lg transition ${canEdit ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                  whileHover={canEdit ? { scale: 1.05 } : {}}
                                  whileTap={canEdit ? { scale: 0.95 } : {}}
                                >
                                  Set Utama
                                </motion.button>
                              )}
                              {addr.id !== 'placeholder' && !addr.isBackup1 && (
                                <motion.button
                                  onClick={() => setBackup1(addr.id)}
                                  disabled={!canEdit}
                                  className={`text-xs px-3 py-1 rounded-lg transition ${canEdit ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                  whileHover={canEdit ? { scale: 1.05 } : {}}
                                  whileTap={canEdit ? { scale: 0.95 } : {}}
                                >
                                  Set Cadangan 1
                                </motion.button>
                              )}
                              {addr.id !== 'placeholder' && !addr.isBackup2 && (
                                <motion.button
                                  onClick={() => setBackup2(addr.id)}
                                  disabled={!canEdit}
                                  className={`text-xs px-3 py-1 rounded-lg transition ${canEdit ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                  whileHover={canEdit ? { scale: 1.05 } : {}}
                                  whileTap={canEdit ? { scale: 0.95 } : {}}
                                >
                                  Set Cadangan 2
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  <div className="space-y-6">
                    {/* Security Recommendations */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 shadow-xl border border-orange-100 hover:shadow-2xl transition-shadow"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-orange-500" />
                        Rekomendasi Keamanan
                      </h3>
                      <div className="space-y-3">
                        {getSecurityRecommendations(profileData).length === 0 ? (
                          <div className="text-center py-4">
                            <ShieldCheck className="w-12 h-12 mx-auto text-green-500 mb-2" />
                            <p className="text-green-600 font-medium">Akun Anda sudah aman!</p>
                            <p className="text-xs text-gray-500">Semua fitur keamanan telah diaktifkan</p>
                          </div>
                        ) : (
                          getSecurityRecommendations(profileData).map((rec, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + (index * 0.1) }}
                              className="flex items-start gap-2 p-3 bg-white rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm font-medium text-gray-900">{rec}</p>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 shadow-xl border border-green-100 hover:shadow-2xl transition-shadow"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
                      <div className="space-y-3">
                        {!profileData.twoFactorEnabled && (
                          <motion.button
                            onClick={startTOTPSetup}
                            disabled={isSettingUpTOTP}
                            className="w-full flex items-center gap-3 p-3 bg-white hover:bg-green-50 rounded-lg border border-green-200 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Lock className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div className="text-left flex-1">
                              <div className="text-sm font-bold text-green-900">Aktifkan 2FA</div>
                              <div className="text-xs text-green-600">Tingkatkan keamanan +40%</div>
                            </div>
                            {isSettingUpTOTP && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
                          </motion.button>
                        )}
                        
                        <motion.button
                          onClick={handleResetPassword}
                          className="w-full flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all shadow-sm hover:shadow-md"
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Key className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          <div className="text-left flex-1">
                            <div className="text-sm font-bold text-gray-900">Reset Password</div>
                            <div className="text-xs text-gray-600">Perbarui kata sandi Anda</div>
                          </div>
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ) : null}

              {/* Tab Content - Security */}
              {activeTab === "security" ? (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Security Settings */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-shadow"
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-blue-600" />
                      Pengaturan Keamanan
                    </h3>
                    
                    <div className="space-y-4">
                      {/* 2FA */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="font-bold text-gray-900">Autentikasi Dua Faktor (2FA)</h4>
                              <p className="text-sm text-gray-600">Lapisan keamanan tambahan dengan Aplikasi Authenticator.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {profileData.twoFactorEnabled ? (
                              <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                Aktif
                              </span>
                            ) : (
                              <motion.button
                                onClick={startTOTPSetup}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                                disabled={isSettingUpTOTP}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {isSettingUpTOTP ? 'Menyiapkan…' : 'Aktifkan TOTP'}
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>

                      {/* Password */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <Key className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-bold text-gray-900">Kata Sandi</h4>
                              <p className="text-sm text-gray-600">
                                {profileData.lastPasswordChange 
                                  ? `Terakhir diubah ${Math.floor((Date.now() - (profileData.lastPasswordChange?.getTime() || Date.now())) / (1000 * 60 * 60 * 24))} hari lalu`
                                  : 'Belum pernah diubah'
                                }
                              </p>
                            </div>
                          </div>
                          <motion.button
                            onClick={handleResetPassword}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Reset
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}

              {activeTab === "badges" ? (
                // Tab Content - Badges
                <motion.div
                  key="badges"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Earned Badges */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-shadow"
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-orange-600" />
                      Badge yang Diperoleh ({userBadges.length})
                    </h3>
                    
                    {userBadges.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <Award className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                        <p className="font-bold text-lg">Belum ada badge yang diperoleh</p>
                        <p className="text-sm">Selesaikan misi untuk mendapatkan badge!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {userBadges.map((userBadge, idx) => {
                          const badge = getBadgeData(userBadge.badgeId);
                          if (!badge) return null;

                          return (
                            <motion.div
                              key={userBadge.badgeId}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              whileHover={{ scale: 1.05, y: -5 }}
                              className={`relative p-4 rounded-xl border-2 text-center transition-all duration-300 shadow-lg ${getRarityColor(badge.rarity)}`}
                            >
                              <motion.div 
                                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: idx * 0.05 + 0.2, type: "spring", stiffness: 500 }}
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                              </motion.div>
                              
                              <div className="text-5xl mb-3">{badge.icon}</div>
                              <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{badge.name}</h4>
                              <p className="text-xs text-slate-600 mb-2 line-clamp-2">{badge.description}</p>
                              
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                                <span className="font-bold">{badge.points} poin</span>
                              </div>
                              
                              <div className="text-xs text-green-600 font-medium">
                                {userBadge.earnedAt.toLocaleDateString()}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>

                  {/* All Available Badges */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-shadow"
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Star className="w-6 h-6 text-slate-400" />
                      Semua Badge Tersedia ({badges.length})
                    </h3>

                    {badges.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <Award className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                        <p className="font-bold text-lg">Belum ada badge tersedia</p>
                        <p className="text-sm">Tunggu pembaruan konten untuk melihat badge baru.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {badges.map((badge, idx) => (
                          <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="relative p-4 rounded-xl border-2 text-center transition-all duration-300 border-slate-200 bg-slate-50 hover:bg-white shadow-md hover:shadow-xl"
                          >
                            <div className="text-5xl mb-3 opacity-70 group-hover:opacity-100 transition-opacity">{badge.icon}</div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{badge.name}</h4>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-2">{badge.description}</p>
                            <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                              <Zap className="w-3.5 h-3.5 text-yellow-500" />
                              <span className="font-bold">{badge.points} poin</span>
                            </div>
                            <div className="text-xs text-slate-500 capitalize font-medium">{badge.rarity}</div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ) : null}
            </>
          )}

          {/* History/Riwayat */}
          {activeMenu === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl px-4 py-4 sm:px-6 sm:py-5 text-white shadow-xl"
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4 mb-1 sm:mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-white/15 flex items-center justify-center">
                      <History size={28} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-2xl font-bold leading-snug truncate">Riwayat Aktivitas</h2>
                      <p className="text-blue-100 text-xs sm:text-sm mt-1">Jejak aktivitas Anda di platform</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="text-xl sm:text-3xl font-bold leading-none">{activities.length}</div>
                    <div className="text-[11px] sm:text-sm text-blue-100 mt-0.5">Total Aktivitas</div>
                  </div>
                </div>
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl px-2 py-2 shadow-lg border border-gray-200 overflow-hidden"
              >
                <div className="flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100 pb-1" style={{ scrollBehavior: 'smooth' }}>
                  {[
                    { id: 'all', label: 'Semua', icon: History, count: activities.length },
                    { id: 'product', label: 'Produk Dilihat', icon: Store, count: activities.filter(a => a.type === 'product_view' || a.productASIN).length },
                    { id: 'visit', label: 'UMKM Dikunjungi', icon: Store, count: activities.filter(a => a.type === 'visit').length },
                    { id: 'consultation', label: 'Konsultasi', icon: User, count: activities.filter(a => a.type === 'consult_chat' || a.type === 'consult_chat_message').length },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setHistoryTab(tab.id as any)}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
                          historyTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon size={18} />
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          historyTab === tab.id ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Activities List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3 sm:space-y-4"
              >
                {(() => {
                  const filtered = activities.filter(a => {
                    if (historyTab === 'all') return true;
                    if (historyTab === 'product') return a.type === 'product_view' || a.productASIN;
                    if (historyTab === 'visit') return a.type === 'visit';
                    if (historyTab === 'consultation') return a.type === 'consult_chat' || a.type === 'consult_chat_message';
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-white rounded-xl px-4 py-8 sm:p-12 text-center shadow-lg border border-gray-200">
                        <History size={48} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">Belum ada aktivitas</h3>
                        <p className="text-sm sm:text-base text-gray-500">Mulai jelajahi produk, kunjungi UMKM, atau chat dengan konsultan</p>
                      </div>
                    );
                  }

                  return filtered.map((activity, idx) => {
                    // Get accurate display name based on activity type
                    let displayName = 'Aktivitas';
                    if (activity.type === 'product_view' || activity.productASIN) {
                      displayName = activity.productName || activity.title || 'Produk';
                    } else if (activity.type === 'visit') {
                      // For visit, prioritize storeName, then store, then title
                      displayName = activity.storeName || activity.store || activity.title || 'UMKM';
                    } else if (activity.type === 'consult_chat' || activity.type === 'consult_chat_message') {
                      displayName = activity.consultantName || activity.title || 'Konsultan';
                    } else {
                      displayName = activity.title || activity.productName || activity.storeName || activity.store || activity.consultantName || 'Aktivitas';
                    }
                    
                    const displayType = activity.type === 'product_view' || activity.productASIN ? 'Produk dilihat' :
                                       activity.type === 'visit' ? 'UMKM dikunjungi' :
                                       activity.type === 'consult_chat' || activity.type === 'consult_chat_message' ? 'Konsultasi dengan konsultan' :
                                       'Aktivitas';
                    const displayTime = activity.createdAt instanceof Date ? 
                                       activity.createdAt.toLocaleString('id-ID') :
                                       activity.timestamp?.toDate ? 
                                       new Date(activity.timestamp.toDate()).toLocaleString('id-ID') :
                                       activity.dateAdded || 
                                       'Waktu tidak diketahui';
                    const hasImage = activity.image;
                    
                    return (
                      <motion.div
                        key={activity.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => openActivity(activity)}
                        className="bg-white rounded-xl p-4 sm:p-5 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Image or Icon */}
                          {hasImage ? (
                            <div className="flex-shrink-0">
                              <img 
                                src={activity.image} 
                                alt={displayName}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"

                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className={`hidden w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center ${
                                activity.type === 'product_view' || activity.productASIN ? 'bg-orange-100' :
                                activity.type === 'visit' ? 'bg-green-100' :
                                'bg-blue-100'
                              }`}>
                                {activity.type === 'product_view' || activity.productASIN ? (
                                  <Store size={24} className="text-orange-600" />
                                ) : activity.type === 'visit' ? (
                                  <Store size={24} className="text-green-600" />
                                ) : (
                                  <User size={24} className="text-blue-600" />
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className={`flex-shrink-0 p-2.5 sm:p-3 rounded-lg ${
                              activity.type === 'product_view' || activity.productASIN ? 'bg-orange-100' :
                              activity.type === 'visit' ? 'bg-green-100' :
                              'bg-blue-100'
                            }`}>
                              {activity.type === 'product_view' || activity.productASIN ? (
                                <Store size={24} className="text-orange-600" />
                              ) : activity.type === 'visit' ? (
                                <Store size={24} className="text-green-600" />
                              ) : (
                                <User size={24} className="text-blue-600" />
                              )}
                            </div>
                          )}
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base line-clamp-2">
                              {displayName}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 flex items-center gap-2 flex-wrap">
                              <span>{displayType}</span>
                              {activity.type === 'product_view' && activity.productASIN && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  ASIN: {activity.productASIN}
                                </span>
                              )}
                            </p>
                            {activity.store && activity.type === 'product_view' && (
                              <p className="text-[11px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 flex items-center gap-1">
                                <Store size={12} />
                                Toko: {activity.store}
                              </p>
                            )}
                            {activity.type === 'visit' && (activity.storeName || activity.store) && (
                              <p className="text-[11px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 flex items-center gap-1">
                                <Store size={12} />
                                {activity.storeName || activity.store}
                              </p>
                            )}
                            {activity.consultantName && (activity.type === 'consult_chat' || activity.type === 'consult_chat_message') && (
                              <p className="text-[11px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 flex items-center gap-1">
                                <User size={12} />
                                Konsultan: {activity.consultantName}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1.5 sm:mb-2">
                              {activity.category && (
                                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] sm:text-xs rounded-full">
                                  {activity.category}
                                </span>
                              )}
                              {activity.storeId && activity.type === 'visit' && (
                                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[11px] sm:text-xs rounded-full">
                                  ID: {activity.storeId}
                                </span>
                              )}
                              {activity.consultantId && (activity.type === 'consult_chat' || activity.type === 'consult_chat_message') && (
                                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] sm:text-xs rounded-full">
                                  ID: {activity.consultantId}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Clock size={12} />
                              {displayTime}
                            </p>
                          </div>
                          
                          {/* Arrow */}
                          <div className="flex-shrink-0 flex items-center">
                            <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </motion.div>
            </motion.div>
          )}

          {/* Pricing */}
          {activeMenu === 'pricing' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="-mx-4 sm:-mx-6 lg:-mx-8"
            >
              <Harga hideFooter />
            </motion.div>
          )}

          {/* Store */}
          {activeMenu === 'store' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-12 text-center border border-gray-200"
            >
              <Store size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Toko Saya</h2>
              <p className="text-gray-600">Fitur toko akan segera hadir</p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddressModal(false);
                setShowSearchResults(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Store size={24} className="text-orange-500" />
                  {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                </h2>
                <motion.button
                  onClick={() => {
                    setShowAddressModal(false);
                    setShowSearchResults(false);
                  }}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} className="text-gray-600" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Label Alamat <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addrForm.label || ''}
                        onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                        placeholder="Contoh: Rumah, Kantor, Kos"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Penerima
                      </label>
                      <input
                        type="text"
                        value={addrForm.recipient || ''}
                        onChange={(e) => setAddrForm({ ...addrForm, recipient: e.target.value })}
                        placeholder="Nama lengkap penerima"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        value={addrForm.phone || ''}
                        onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cari Lokasi di Peta <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            value={mapSearch}
                            onChange={(e) => handleMapSearchChange(e.target.value)}
                            onFocus={() => {
                              if (searchResults.length > 0) setShowSearchResults(true);
                            }}
                            placeholder="Cari alamat, jalan, atau tempat..."
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          />
                          {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 size={20} className="animate-spin text-orange-500" />
                            </div>
                          )}
                          {!isSearching && mapSearch && (
                            <button
                              onClick={() => {
                                setMapSearch('');
                                setSearchResults([]);
                                setShowSearchResults(false);
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                            >
                              <X size={16} className="text-gray-400" />
                            </button>
                          )}

                          {/* Search Results Dropdown */}
                          {showSearchResults && searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto top-full">
                              {searchResults.map((result, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => selectSearchResult(result)}
                                  className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-sm text-gray-900 line-clamp-1">
                                    {result.display_name}
                                  </div>
                                  {result.address && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {[
                                        result.address.city || result.address.town,
                                        result.address.state || result.address.region
                                      ].filter(Boolean).join(', ')}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <motion.button
                          type="button"
                          onClick={useCurrentLocation}
                          disabled={isLoadingLocation}
                          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2 whitespace-nowrap"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isLoadingLocation ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              <span className="hidden sm:inline">Mencari...</span>
                            </>
                          ) : (
                            <>
                              <Navigation size={18} />
                              <span className="hidden sm:inline">Lokasi Saya</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alamat Lengkap <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={addrForm.addressLine || ''}
                        onChange={(e) => setAddrForm({ ...addrForm, addressLine: e.target.value })}
                        placeholder="Jalan, nomor rumah, RT/RW, dll"
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Kota
                        </label>
                        <input
                          type="text"
                          value={addrForm.city || ''}
                          onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                          placeholder="Kota"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Provinsi
                        </label>
                        <input
                          type="text"
                          value={addrForm.province || ''}
                          onChange={(e) => setAddrForm({ ...addrForm, province: e.target.value })}
                          placeholder="Provinsi"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kode Pos
                      </label>
                      <input
                        type="text"
                        value={addrForm.postalCode || ''}
                        onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })}
                        placeholder="Kode pos"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!addrForm.isPrimary}
                          onChange={(e) => setAddrForm({ ...addrForm, isPrimary: e.target.checked, isBackup1: false, isBackup2: false })}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Set sebagai alamat utama</span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column - Map */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Peta Lokasi
                      </label>
                      <div
                        ref={mapContainerRef}
                        className="w-full h-96 rounded-lg border border-gray-300 overflow-hidden bg-gray-100"
                        style={{ minHeight: '384px' }}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                         Klik pada peta atau gunakan pencarian untuk menentukan lokasi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <motion.button
                  onClick={() => {
                    setShowAddressModal(false);
                    setShowSearchResults(false);
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={saveAddress}
                  disabled={!addrForm.label || !addrForm.addressLine || !addrForm.location}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="inline-block animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="inline-block mr-2" />
                      Simpan Alamat
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{modalTitle}</h3>
                <p className="text-gray-600 mb-6">{modalMessage}</p>
                <motion.button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  OK
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{modalTitle}</h3>
                <p className="text-gray-600 mb-6">{modalMessage}</p>
                <motion.button
                  onClick={() => setShowErrorModal(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  OK
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Followers Modal */}
      <AnimatePresence>
        {showFollowersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFollowersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users size={24} className="text-blue-500" />
                  Follower ({followerCount})
                </h2>
                <motion.button
                  onClick={() => setShowFollowersModal(false)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} className="text-gray-600" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingFollowers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-blue-500" />
                  </div>
                ) : followers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 font-medium">Belum ada follower</p>
                    <p className="text-sm text-gray-500 mt-2">Mulai berinteraksi untuk mendapatkan follower</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {followers.map((follower, idx) => (
                      <motion.div
                        key={follower.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(follower.userName || 'User')}`}>
                          {follower.userPhoto ? (
                            <img src={follower.userPhoto} alt={follower.userName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            getInitials(follower.userName || 'User')
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{follower.userName || 'User'}</p>
                          {follower.followedAt && (
                            <p className="text-xs text-gray-500">
                              Mengikuti sejak {follower.followedAt?.toDate ? 
                                new Date(follower.followedAt.toDate()).toLocaleDateString('id-ID') : 
                                'baru-baru ini'}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Following Modal */}
      <AnimatePresence>
        {showFollowingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFollowingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Store size={24} className="text-green-500" />
                  Following ({following.length})
                </h2>
                <motion.button
                  onClick={() => setShowFollowingModal(false)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} className="text-gray-600" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {following.length === 0 ? (
                  <div className="text-center py-12">
                    <Store size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 font-medium">Belum mengikuti toko</p>
                    <p className="text-sm text-gray-500 mt-2">Mulai ikuti toko favorit Anda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {following.map((follow, idx) => (
                      <motion.div
                        key={follow.storeId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => {
                          localStorage.setItem("selectedProduct", JSON.stringify({ toko: follow.storeName || follow.storeId }));
                          window.location.href = "/toko";
                        }}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                          <Store size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{follow.storeName || follow.storeId}</p>
                          {follow.followedAt && (
                            <p className="text-xs text-gray-500">
                              Diikuti sejak {follow.followedAt?.toDate ? 
                                new Date(follow.followedAt.toDate()).toLocaleDateString('id-ID') : 
                                'baru-baru ini'}
                            </p>
                          )}
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOTP Setup Modal */}
      <AnimatePresence>
        {showTOTPSetup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            >
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                >
                  <Lock className="w-14 h-14 mx-auto text-slate-800 mb-3" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Aktifkan TOTP 2FA</h3>
                <p className="text-sm text-gray-600">Scan QR atau masukkan secret key di aplikasi Authenticator.</p>
              </div>

              <div className="space-y-4">
                {totpQRCode && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center p-4 bg-slate-50 rounded-xl border-2 border-slate-200"
                  >
                    <img src={totpQRCode} alt="QR Code" className="w-56 h-56 rounded-lg shadow-lg" />
                  </motion.div>
                )}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200 rounded-xl p-4"
                >
                  <p className="text-sm text-gray-600 font-bold mb-2">Secret Key:</p>
                  <div className="bg-white border border-slate-300 rounded-lg p-3 font-mono text-sm text-center break-all select-all cursor-pointer hover:bg-slate-50 transition shadow-inner">
                    {totpSecret}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Salin dan masukkan ke aplikasi Authenticator Anda</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm text-gray-600 font-bold mb-2">Kode 6 digit</label>
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all shadow-inner"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 pt-2"
                >
                  <motion.button
                    onClick={() => setShowTOTPSetup(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    onClick={verifyTOTPSetup}
                    disabled={totpCode.length !== 6}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-bold hover:from-slate-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Verifikasi
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}