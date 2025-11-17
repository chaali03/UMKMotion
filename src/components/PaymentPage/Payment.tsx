// src/components/Checkoutpage/Payment.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks?: Record<string, (result?: unknown) => void>) => void;
    };
  }
}

interface CheckoutItem {
  asin: string;
  product_title: string;
  product_photo: string;
  selectedImage: string;
  product_price: string;
  product_price_num: number;
  quantity: number;
  seller_name?: string;
  seller_location?: {
    address: string;
    lat: number;
    lng: number;
  };
  weightKg?: number;
}

interface UserAddress {
  id: string;
  label: string;
  name: string;
  phone: string;
  fullAddress: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  lat: number;
  lng: number;
  isPrimary: boolean;
}

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minPurchase: number;
  maxDiscount?: number;
  validUntil: string;
  icon: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  type: 'instant' | 'same-day' | 'regular';
  provider: string;
  price: number;
  estimatedTime: string;
  icon: string;
  color: string;
  isCOD: boolean;
  distance?: number;
  source?: 'instant' | 'rajaongkir' | 'fallback';
}

type WeightCategory = 'light' | 'medium' | 'heavy';

const getWeightCategory = (weightKg: number): WeightCategory => {
  if (weightKg <= 1.5) return 'light';
  if (weightKg <= 4) return 'medium';
  return 'heavy';
};

const estimateWeightKg = (item: CheckoutItem): number => {
  if (item.weightKg && item.weightKg > 0) return item.weightKg;
  const base = item.product_price_num;
  if (base <= 100_000) return 0.8;
  if (base <= 300_000) return 1.6;
  if (base <= 600_000) return 2.8;
  return 4.5;
};

const formatWeightLabel = (weightKg: number, showCategory = true) => {
  if (weightKg <= 0) return '0 kg';
  const base = `${weightKg.toFixed(1)} kg`;
  if (!showCategory) return base;
  const category = getWeightCategory(weightKg);
  const label =
    category === 'light' ? 'Ringan' : category === 'medium' ? 'Sedang' : 'Berat';
  return `${base} • ${label}`;
};

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  cashback?: number;
  category: string;
}

type WarningModalState = {
  title: string;
  message: string;
  icon?: string;
  accent?: 'info' | 'danger' | 'success';
  actionLabel?: string;
  action?: () => void;
};

// ============= DUMMY DATA =============
const dummyVouchers: Voucher[] = [
  {
    id: 'v1',
    code: 'WELCOME50K',
    title: 'Welcome Bonus',
    description: 'Potongan Rp50.000 min. belanja Rp200.000',
    discount: 50000,
    discountType: 'fixed',
    minPurchase: 200000,
    validUntil: '2024-12-31',
    icon: '🎁'
  },
  {
    id: 'v2',
    code: 'DISKON20',
    title: 'Diskon 20%',
    description: 'Diskon 20% max Rp100.000',
    discount: 20,
    discountType: 'percentage',
    minPurchase: 100000,
    maxDiscount: 100000,
    validUntil: '2024-12-31',
    icon: '🔥'
  },
  {
    id: 'v3',
    code: 'ONGKIR10K',
    title: 'Gratis Ongkir',
    description: 'Gratis ongkir Rp10.000',
    discount: 10000,
    discountType: 'fixed',
    minPurchase: 50000,
    validUntil: '2024-12-31',
    icon: '🚚'
  }
];

const paymentMethods: PaymentMethod[] = [
  // E-Wallet
  { id: 'gopay', name: 'GoPay', icon: '🟢', color: '#00AA13', cashback: 50000, category: 'ewallet' },
  { id: 'ovo', name: 'OVO', icon: '🟣', color: '#4C3494', cashback: 25000, category: 'ewallet' },
  { id: 'dana', name: 'DANA', icon: '🔵', color: '#118EEA', category: 'ewallet' },
  { id: 'shopeepay', name: 'ShopeePay', icon: '🟠', color: '#EE4D2D', cashback: 50000, category: 'ewallet' },
  { id: 'linkaja', name: 'LinkAja', icon: '🔴', color: '#E31E24', category: 'ewallet' },
  
  // Bank Transfer
  { id: 'bca', name: 'BCA Virtual Account', icon: '🏦', color: '#0066AE', category: 'bank' },
  { id: 'mandiri', name: 'Mandiri Virtual Account', icon: '🏦', color: '#00549F', category: 'bank' },
  { id: 'bni', name: 'BNI Virtual Account', icon: '🏦', color: '#F37021', category: 'bank' },
  { id: 'bri', name: 'BRI Virtual Account', icon: '🏦', color: '#003A70', category: 'bank' },
  
  // Others
  { id: 'qris', name: 'QRIS', icon: '📱', color: '#2C3E50', category: 'qris' },
  { id: 'cod', name: 'COD (Cash on Delivery)', icon: '💵', color: '#27AE60', category: 'cod' },
  { id: 'alfamart', name: 'Alfamart', icon: '🏪', color: '#E31E24', category: 'retail' },
  { id: 'indomaret', name: 'Indomaret', icon: '🏪', color: '#FFD700', category: 'retail' },
];

const Payment: React.FC = () => {
  // ===== STATES =====
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[] | null>(null);
  
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isInsurance, setIsInsurance] = useState(true);
  const [distance, setDistance] = useState<number>(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSnapReady, setIsSnapReady] = useState(false);
  const [warningModal, setWarningModal] = useState<WarningModalState | null>(null);
  const snapStateRef = useRef<'idle' | 'opening' | 'opened'>('idle');
  
  // ===== MODALS =====
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  // ===== FORM STATES =====
  const [searchVoucher, setSearchVoucher] = useState('');
  const [searchPayment, setSearchPayment] = useState('');
  const [paymentCategory, setPaymentCategory] = useState('all');

  // ===== NEW ADDRESS FORM =====
  const [newAddress, setNewAddress] = useState({
    label: '',
    name: '',
    phone: '',
    fullAddress: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    isPrimary: false
  });

  // ===== REFS =====
  const mapRef = useRef<HTMLDivElement>(null);

  const buildActiveItems = useCallback((): CheckoutItem[] => {
    if (checkoutItems && checkoutItems.length > 0) {
      return checkoutItems;
    }
    if (checkoutItem) {
      return [{ ...checkoutItem, quantity }];
    }
    return [];
  }, [checkoutItems, checkoutItem, quantity]);

  const activeItems = useMemo(() => buildActiveItems(), [buildActiveItems]);

  const sellerLocation = useMemo(() => {
    return activeItems[0]?.seller_location || null;
  }, [activeItems]);

  const primaryItem = useMemo(() => activeItems[0] || null, [activeItems]);

  const isMultiCart = Boolean(checkoutItems && checkoutItems.length > 0);

  // ===== LOAD DATA =====
  useEffect(() => {
    loadCheckoutData();
    loadUserAddresses();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined' || !import.meta.env.DEV) return;
    const policy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://*.midtrans.com",
      "frame-src 'self' blob: https://app.sandbox.midtrans.com https://*.midtrans.com https://*.firebaseapp.com https://*.google.com https://*.gstatic.com https://accounts.google.com https://apis.google.com",
      "connect-src 'self' https://app.sandbox.midtrans.com https://api.midtrans.com https://api.sandbox.midtrans.com",
      "img-src 'self' data: blob: https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:"
    ].join('; ');
    let meta = document.head.querySelector<HTMLMetaElement>('meta[data-checkout-csp]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.dataset.checkoutCsp = 'true';
      document.head.appendChild(meta);
    }
    meta.content = policy;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const clientKey = import.meta.env.PUBLIC_MIDTRANS_CLIENT_KEY || import.meta.env.MIDTRANS_CLIENT_KEY;
    if (!clientKey) return;

    const existing = document.getElementById('midtrans-snap-script');
    if (existing) {
      setIsSnapReady(true);
      return;
    }

    const isProduction = (import.meta.env.PUBLIC_MIDTRANS_IS_PRODUCTION || import.meta.env.MIDTRANS_IS_PRODUCTION) === 'true';
    const script = document.createElement('script');
    script.src = `https://${isProduction ? 'app.midtrans.com' : 'app.sandbox.midtrans.com'}/snap/snap.js`;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    script.id = 'midtrans-snap-script';
    script.onload = () => setIsSnapReady(true);
    script.onerror = () => {
      setPaymentError('Gagal memuat gateway pembayaran. Coba refresh halaman.');
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  const loadCheckoutData = () => {
    const storedMulti = localStorage.getItem('checkoutItems');
    if (storedMulti) {
      try {
        const list: CheckoutItem[] = JSON.parse(storedMulti);
        if (Array.isArray(list) && list.length > 0) {
          const withSeller = list.map((it) => {
            const located = {
              ...it,
              seller_location: it.seller_location || {
                address: 'Jakarta Selatan, DKI Jakarta',
                lat: -6.2615,
                lng: 106.8106
              }
            };
            return {
              ...located,
              selectedImage: located.selectedImage || located.product_photo,
              weightKg: estimateWeightKg(located)
            };
          });
          setCheckoutItems(withSeller);
          return;
        }
      } catch {}
    }
    const stored = localStorage.getItem('checkoutItem');
    if (stored) {
      const item: CheckoutItem = JSON.parse(stored);
      if (!item.seller_location) {
        item.seller_location = {
          address: 'Jakarta Selatan, DKI Jakarta',
          lat: -6.2615,
          lng: 106.8106
        };
      }
      item.selectedImage = item.selectedImage || item.product_photo;
      item.weightKg = estimateWeightKg(item);
      setCheckoutItem(item);
      setQuantity(item.quantity);
    }
  };

  const loadUserAddresses = () => {
    const stored = localStorage.getItem('userAddresses');
    if (stored) {
      const addresses: UserAddress[] = JSON.parse(stored);
      setUserAddresses(addresses);
      const primary = addresses.find(a => a.isPrimary) || addresses[0];
      setSelectedAddress(primary || null);
    } else {
      // Show add address modal if no address
      setShowAddAddressModal(true);
    }
  };

  // ===== CALCULATE DISTANCE =====
  const calculateDistance = useCallback(() => {
    if (!selectedAddress || !sellerLocation) return 0;

    const R = 6371; // Radius bumi dalam km
    const dLat = deg2rad(sellerLocation.lat - selectedAddress.lat);
    const dLng = deg2rad(sellerLocation.lng - selectedAddress.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(selectedAddress.lat)) * 
      Math.cos(deg2rad(sellerLocation.lat)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = R * c;
    const rounded = Math.round(dist * 10) / 10;
    
    setDistance(rounded);
    return rounded;
  }, [selectedAddress, sellerLocation]);

  const deg2rad = (deg: number) => deg * (Math.PI/180);

  const generateFallbackOptions = useCallback((range: number) => {
    const options: DeliveryOption[] = [];
    const safeRange = Math.max(1, range);

    if (safeRange <= 30) {
      options.push(
        {
          id: 'gosend-instant',
          name: 'GoSend Instant',
          type: safeRange <= 10 ? 'instant' : 'same-day',
          provider: 'Gojek',
          price: Math.max(15000, safeRange * 2500),
          estimatedTime: safeRange <= 10 ? '1-2 jam' : 'Hari ini',
          icon: '🏍️',
          color: '#00AA13',
          isCOD: true,
          distance: safeRange,
          source: 'instant',
        },
        {
          id: 'grab-express',
          name: 'GrabExpress',
          type: safeRange <= 10 ? 'instant' : 'same-day',
          provider: 'Grab',
          price: Math.max(16000, safeRange * 2700),
          estimatedTime: safeRange <= 10 ? '1-2 jam' : 'Hari ini',
          icon: '🚗',
          color: '#00B14F',
          isCOD: true,
          distance: safeRange,
          source: 'instant',
        },
      );
    }

    const regularTiers = [
      {
        id: 'jne-reg',
        name: 'JNE Regular',
        provider: 'JNE',
        price: safeRange < 50 ? 10000 : safeRange < 100 ? 15000 : 25000,
        eta: '2-3 hari',
      },
      {
        id: 'jne-yes',
        name: 'JNE YES',
        provider: 'JNE',
        price: safeRange < 50 ? 20000 : safeRange < 100 ? 30000 : 45000,
        eta: '1 hari',
      },
      {
        id: 'sicepat-reg',
        name: 'SiCepat REG',
        provider: 'SiCepat',
        price: safeRange < 50 ? 9000 : safeRange < 100 ? 14000 : 23000,
        eta: '2-3 hari',
      },
      {
        id: 'jnt-reg',
        name: 'J&T Express',
        provider: 'J&T',
        price: safeRange < 50 ? 8000 : safeRange < 100 ? 13000 : 22000,
        eta: '2-4 hari',
      },
    ];

    regularTiers.forEach((tier) => {
      options.push({
        id: tier.id,
        name: tier.name,
        type: safeRange > 30 ? 'regular' : tier.name.toLowerCase().includes('yes') ? 'same-day' : 'regular',
        provider: tier.provider,
        price: tier.price,
        estimatedTime: tier.eta,
        icon: '📦',
        color: tier.provider === 'JNE' ? '#E31E24' : tier.provider === 'J&T' ? '#E74C3C' : '#1E3A8A',
        isCOD: tier.provider !== 'POS',
        distance: safeRange,
        source: 'fallback',
      });
    });

    return options.sort((a, b) => a.price - b.price);
  }, []);

  const loadShippingOptions = useCallback(
    async (currentDistance: number) => {
      if (!selectedAddress) return;
      const fallback = generateFallbackOptions(currentDistance);
      setShippingLoading(true);
      setShippingError(null);

      try {
        const snapshot = buildActiveItems();
        const resolvedWeight = snapshot.reduce((sum, it) => {
          const perUnit = it.weightKg || estimateWeightKg(it);
          return sum + perUnit * (it.quantity || 1);
        }, 0);

        const weightGrams = Math.max(1, Math.round(Math.max(resolvedWeight, 0.5) * 1000));

        const payload = {
          destinationCity: selectedAddress.city || selectedAddress.province || selectedAddress.fullAddress,
          distanceKm: currentDistance,
          weight: weightGrams,
        };

        const res = await fetch('/api/shipping/options', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();
        const options: DeliveryOption[] = Array.isArray(data.options) ? data.options : [];
        const normalized = options.length ? options.map((opt) => ({
          ...opt,
          distance: opt.distance ?? currentDistance,
        })) : fallback;

        setDeliveryOptions(normalized);
        setSelectedDelivery(normalized[0] || null);
      } catch (error: any) {
        setShippingError(error?.message || 'Gagal memuat ongkos kirim otomatis. Menggunakan estimasi lokal.');
        setDeliveryOptions(fallback);
        setSelectedDelivery(fallback[0] || null);
      } finally {
        setShippingLoading(false);
      }
    },
    [selectedAddress, generateFallbackOptions, buildActiveItems],
  );

  useEffect(() => {
    const dist = calculateDistance();
    if (dist > 0 && selectedAddress) {
      loadShippingOptions(dist);
    }
  }, [selectedAddress, sellerLocation, calculateDistance, loadShippingOptions]);

  // ===== CALCULATIONS =====
  const productTotal = activeItems.reduce(
    (sum, it) => sum + (it.product_price_num * (it.quantity || 1)),
    0
  );

  const totalWeightKg = activeItems.reduce((sum, it) => {
    const perUnit = it.weightKg || estimateWeightKg(it);
    return sum + perUnit * (it.quantity || 1);
  }, 0);

  const totalQuantity = activeItems.reduce((sum, it) => sum + (it.quantity || 1), 0);
  const totalWeightLabel = totalWeightKg > 0 ? formatWeightLabel(totalWeightKg) : '0 kg';
  
  const insuranceCost = isInsurance ? 5000 : 0;
  const deliveryCost = selectedDelivery?.price || 0;
  
  let voucherDiscount = 0;
  if (selectedVoucher && productTotal >= selectedVoucher.minPurchase) {
    if (selectedVoucher.discountType === 'fixed') {
      voucherDiscount = selectedVoucher.discount;
    } else {
      voucherDiscount = Math.min(
        (productTotal * selectedVoucher.discount) / 100,
        selectedVoucher.maxDiscount || Infinity
      );
    }
  }

  const cashbackAmount = selectedPayment?.cashback || 0;
  const subtotal = productTotal + deliveryCost + insuranceCost - voucherDiscount;
  const totalPayment = subtotal;

  const formatPrice = (price: number) => `Rp${price.toLocaleString('id-ID')}`;

  const showWarning = useCallback(
    (payload: WarningModalState) => {
      setWarningModal(payload);
    },
    [],
  );

  const closeWarning = useCallback(() => setWarningModal(null), []);

  // ===== HANDLERS =====
  const parseGatewayError = useCallback((err: any) => {
    const raw = err?.message || err?.toString?.() || '';
    if (!raw) return 'Terjadi kesalahan saat memproses pembayaran.';
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.error) return parsed.error as string;
    } catch {}
    return raw.replace('Error:', '').trim() || 'Terjadi kesalahan saat memproses pembayaran.';
  }, []);

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.fullAddress) {
      showWarning({
        title: 'Lengkapi alamat terlebih dahulu',
        message: 'Nama penerima, nomor telepon, dan alamat lengkap wajib diisi.',
        icon: '📮',
        accent: 'info',
      });
      return;
    }

    const address: UserAddress = {
      id: Date.now().toString(),
      ...newAddress,
      lat: -6.2 + Math.random() * 0.2,
      lng: 106.8 + Math.random() * 0.2
    };

    const updated = [...userAddresses, address];
    if (address.isPrimary || userAddresses.length === 0) {
      updated.forEach(a => a.isPrimary = a.id === address.id);
    }

    setUserAddresses(updated);
    localStorage.setItem('userAddresses', JSON.stringify(updated));
    setSelectedAddress(address);
    setShowAddAddressModal(false);
    
    // Reset form
    setNewAddress({
      label: '',
      name: '',
      phone: '',
      fullAddress: '',
      district: '',
      city: '',
      province: '',
      postalCode: '',
      isPrimary: false
    });
  };

  const finalizeOrder = useCallback((orderId: string) => {
    const snapshotItems = buildActiveItems();
    if (!snapshotItems.length) return;

    const orderWeight = snapshotItems.reduce((sum, item) => {
      const perUnit = item.weightKg || estimateWeightKg(item);
      return sum + perUnit * (item.quantity || 1);
    }, 0);

    const weightCategory = getWeightCategory(orderWeight);
    const transportMode = orderWeight <= 3 ? 'motor' : 'truck';

    const serializedItems = snapshotItems.map((item) => {
      const totalItemWeight = (item.weightKg || estimateWeightKg(item)) * (item.quantity || 1);
      return {
        asin: item.asin,
        title: item.product_title,
        image: item.selectedImage || item.product_photo,
        quantity: item.quantity || 1,
        price: item.product_price_num,
        weightKg: Number(totalItemWeight.toFixed(2)),
      };
    });

    const orderData = {
      orderId,
      createdAt: new Date().toISOString(),
      items: serializedItems,
      address: selectedAddress,
      delivery: selectedDelivery,
      voucher: selectedVoucher,
      payment: selectedPayment,
      insurance: isInsurance,
      cashback: cashbackAmount,
      total: totalPayment,
      weightKg: Number(orderWeight.toFixed(2)),
      weightCategory,
      transportMode,
      statusSeed: Date.now(),
    };

    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    try {
      const existing = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const next = [orderData, ...(Array.isArray(existing) ? existing : [])].slice(0, 20);
      localStorage.setItem('userOrders', JSON.stringify(next));
    } catch {}

    window.dispatchEvent(new CustomEvent('ordersUpdated'));
    setShowSuccessModal(true);
    setTimeout(() => {
      window.location.href = '/profile#orders';
    }, 2200);
  }, [buildActiveItems, selectedAddress, selectedDelivery, selectedVoucher, selectedPayment, isInsurance, cashbackAmount, totalPayment]);

  const handlePayNow = async () => {
    if (!selectedAddress) {
      showWarning({
        title: 'Alamat belum dipilih',
        message: 'Silakan pilih atau tambahkan alamat pengiriman sebelum melanjutkan.',
        icon: '📍',
        accent: 'info',
      });
      return;
    }
    if (!selectedDelivery) {
      showWarning({
        title: 'Metode pengiriman kosong',
        message: 'Pilih salah satu layanan pengiriman agar pesanan bisa diproses.',
        icon: '🚚',
        accent: 'info',
      });
      return;
    }
    if (!selectedPayment) {
      showWarning({
        title: 'Metode pembayaran belum dipilih',
        message: 'Pilih metode pembayaran favoritmu terlebih dahulu.',
        icon: '💳',
        accent: 'info',
      });
      return;
    }

    const itemsPayload = buildActiveItems();

    if (!itemsPayload.length) {
      showWarning({
        title: 'Produk tidak ditemukan',
        message: 'Keranjangmu kosong. Tambahkan produk sebelum checkout.',
        icon: '🛒',
        accent: 'info',
      });
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    const orderId = `UMKM-${Date.now()}`;
    const derivedEmail = `${(selectedAddress.name || 'guest')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.') || 'guest'}@guest.umkmotion.id`;

    const itemDetails = itemsPayload.map((item) => ({
      id: item.asin,
      name: item.product_title.slice(0, 50),
      price: Math.round(item.product_price_num),
      quantity: item.quantity || 1,
    }));

    if (selectedDelivery) {
      itemDetails.push({
        id: 'shipping',
        name: `Ongkir ${selectedDelivery.name}`,
        price: selectedDelivery.price,
        quantity: 1,
      });
    }

    if (isInsurance && insuranceCost > 0) {
      itemDetails.push({
        id: 'insurance',
        name: 'Asuransi Pengiriman',
        price: insuranceCost,
        quantity: 1,
      });
    }

    if (voucherDiscount > 0 && selectedVoucher) {
      itemDetails.push({
        id: selectedVoucher.id,
        name: `Voucher ${selectedVoucher.code}`,
        price: -voucherDiscount,
        quantity: 1,
      });
    }

    try {
      const res = await fetch('/api/payments/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          grossAmount: totalPayment,
          items: itemDetails,
          customer: {
            name: selectedAddress.name,
            email: derivedEmail,
            phone: selectedAddress.phone,
          },
          shippingAddress: selectedAddress,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const snapToken: string | undefined = data.token;
      const redirectUrl: string | undefined = data.redirect_url;

    if (window.snap && snapToken && isSnapReady) {
      if (snapStateRef.current !== 'idle') {
        showWarning({
          title: 'Jendela pembayaran masih terbuka',
          message: 'Selesaikan atau tutup jendela Snap yang sudah muncul sebelum mencoba lagi.',
          icon: '🪟',
          accent: 'info',
        });
        setPaymentLoading(false);
        return;
      }
      snapStateRef.current = 'opening';
      try {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            snapStateRef.current = 'opened';
            finalizeOrder(orderId);
            snapStateRef.current = 'idle';
          },
          onPending: () => {
            snapStateRef.current = 'opened';
            finalizeOrder(orderId);
            snapStateRef.current = 'idle';
          },
          onError: (result: any) => {
            console.error('Midtrans error', result);
            setPaymentError('Pembayaran gagal diproses. Coba lagi.');
            snapStateRef.current = 'idle';
          },
          onClose: () => {
            setPaymentError('Pembayaran dibatalkan sebelum selesai.');
            snapStateRef.current = 'idle';
          },
        });
      } catch (err) {
        snapStateRef.current = 'idle';
        const rawMessage = err instanceof Error ? err.message : String(err || '');
        const friendly = rawMessage.includes('PopupInView')
          ? 'Jendela pembayaran Snap masih terbuka. Tutup atau selesaikan jendela sebelumnya sebelum mencoba lagi.'
          : parseGatewayError(err);
        showWarning({
          title: 'Tidak dapat membuka pembayaran',
          message: friendly,
          icon: '🪟',
          accent: 'info',
        });
        console.error('snap.pay error', err);
        setPaymentLoading(false);
        return;
      }
      } else if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('Token pembayaran tidak tersedia.');
      }
    } catch (error: any) {
      console.error('handlePayNow error', error);
      const friendly = parseGatewayError(error);
      setPaymentError(friendly);
      showWarning({
        title: 'Pembayaran gagal',
        message: friendly.includes('Midtrans server key')
          ? 'MIDTRANS_SERVER_KEY belum dikonfigurasi di server. Tambahkan env MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY lalu rebuild.'
          : friendly,
        icon: '⚠️',
        accent: 'danger',
      });
    } finally {
      if (snapStateRef.current !== 'opened') {
        snapStateRef.current = 'idle';
      }
      setPaymentLoading(false);
    }
  };

  const filteredPayments = paymentMethods.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchPayment.toLowerCase());
    const matchCategory = paymentCategory === 'all' || p.category === paymentCategory;
    return matchSearch && matchCategory;
  });

  if (!primaryItem) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Memuat data pembayaran...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
          --primary: #10b981;
          --primary-dark: #059669;
          --secondary: #3b82f6;
          --danger: #ef4444;
          --warning: #f59e0b;
          --dark: #1f2937;
          --gray: #6b7280;
          --light-gray: #f3f4f6;
          --border: #e5e7eb;
          --white: #ffffff;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
          --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
          --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
          --shadow-xl: 0 20px 40px rgba(0,0,0,0.15);
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          color: var(--dark);
          min-height: 100vh;
        }

        .payment-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        /* ===== HEADER ===== */
        .payment-header {
          text-align: center;
          margin-bottom: 3rem;
          animation: slideDown 0.6s ease;
        }

        .payment-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .payment-header p {
          color: var(--gray);
          font-size: 1.1rem;
        }

        /* ===== LAYOUT ===== */
        .payment-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          align-items: start;
        }

        /* ===== CARD ===== */
        .card {
          background: var(--white);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border);
          transition: all 0.3s ease;
          animation: fadeUp 0.6s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--dark);
        }

        .card-title-icon {
          font-size: 1.5rem;
        }

        /* ===== ADDRESS SECTION ===== */
        .address-empty {
          text-align: center;
          padding: 3rem 2rem;
        }

        .address-empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .address-empty h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--dark);
        }

        .address-empty p {
          color: var(--gray);
          margin-bottom: 1.5rem;
        }

        .address-card {
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          position: relative;
          transition: all 0.3s ease;
        }

        .address-card:hover {
          border-color: var(--primary);
          transform: scale(1.01);
        }

        .address-primary-badge {
          position: absolute;
          top: -10px;
          right: 20px;
          background: var(--primary);
          color: white;
          padding: 0.25rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .address-label {
          display: inline-block;
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .address-name {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
          color: var(--dark);
        }

        .address-phone {
          color: var(--gray);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .address-full {
          color: var(--dark);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .btn-outline {
          background: white;
          color: var(--primary);
          border: 2px solid var(--primary);
        }

        .btn-outline:hover {
          background: var(--primary);
          color: white;
        }

        .btn-secondary {
          background: var(--light-gray);
          color: var(--dark);
        }

        .btn-secondary:hover {
          background: var(--border);
        }

        /* ===== PRODUCT SECTION ===== */
        .product-item {
          display: flex;
          gap: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px dashed var(--border);
          margin-bottom: 1.5rem;
        }

        .product-image {
          width: 100px;
          height: 100px;
          border-radius: 16px;
          object-fit: cover;
          border: 2px solid var(--border);
          transition: all 0.3s ease;
        }

        .product-image:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-lg);
        }

        .product-info {
          flex: 1;
        }

        .product-weight {
          margin-top: 0.85rem;
          font-size: 0.95rem;
          color: var(--dark);
          font-weight: 600;
        }

        .product-weight span {
          display: inline-block;
          margin-left: 0.35rem;
          color: var(--primary);
          font-weight: 700;
        }

        .product-seller {
          color: var(--gray);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .product-title {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
          line-height: 1.5;
          color: var(--dark);
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .qty-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 2px solid var(--border);
          background: white;
          font-weight: 700;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qty-btn:hover {
          border-color: var(--primary);
          background: var(--primary);
          color: white;
          transform: scale(1.1);
        }

        .qty-input {
          width: 60px;
          height: 36px;
          text-align: center;
          border: 2px solid var(--border);
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
        }

        .qty-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .product-price {
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--primary);
          text-align: right;
          margin-top: 1rem;
        }

        /* Multi item list */
        .multi-list { display: flex; flex-direction: column; gap: 12px; }
        .multi-row { display: grid; grid-template-columns: 56px 1fr auto; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px dashed var(--border); }
        .multi-row:last-child { border-bottom: none; }
        .multi-thumb { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; border: 1px solid var(--border); }
        .multi-title { font-weight: 700; color: var(--dark); font-size: 0.95rem; }
        .multi-meta { color: var(--gray); font-size: 0.8rem; }
        .multi-weight { margin-left: 8px; padding: 2px 8px; border-radius: 999px; background: rgba(16,185,129,0.12); color: #047857; font-weight: 600; font-size: 0.72rem; }
        .multi-price { font-weight: 800; color: var(--primary); font-size: 1rem; }

        /* ===== DELIVERY SECTION ===== */
        .delivery-distance {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #93c5fd;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: #1e40af;
          font-weight: 600;
        }

        .delivery-option-card {
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          background: white;
        }

        .delivery-option-card.selected {
          border-color: var(--primary);
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
        }

        .delivery-option-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }

        .delivery-badge {
          position: absolute;
          top: -10px;
          right: 15px;
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .delivery-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .delivery-icon {
          font-size: 2rem;
        }

        .delivery-name {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--dark);
        }

        .delivery-provider {
          font-size: 0.85rem;
          color: var(--gray);
        }

        .delivery-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.75rem;
        }

        .delivery-price {
          font-weight: 800;
          font-size: 1.2rem;
          color: var(--primary);
        }

        .delivery-time {
          font-size: 0.9rem;
          color: var(--gray);
        }

        /* ===== VOUCHER SECTION ===== */
        .voucher-selector {
          border: 2px dashed var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
        }

        .voucher-selector:hover {
          border-color: var(--warning);
          background: #fffbeb;
          transform: translateY(-2px);
        }

        .voucher-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .voucher-icon {
          font-size: 2rem;
        }

        .voucher-selected {
          border: 2px solid var(--warning);
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }

        .voucher-card {
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          position: relative;
          overflow: hidden;
        }

        .voucher-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          background: var(--warning);
        }

        .voucher-card:hover {
          border-color: var(--warning);
          transform: translateX(4px);
          box-shadow: var(--shadow-md);
        }

        .voucher-card.selected {
          border-color: var(--warning);
          background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
        }

        .voucher-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .voucher-title {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--dark);
        }

        .voucher-code {
          background: var(--warning);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .voucher-desc {
          color: var(--gray);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .voucher-valid {
          font-size: 0.8rem;
          color: var(--gray);
        }

        /* ===== PAYMENT SECTION ===== */
        .payment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 1rem;
        }

        .payment-card {
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          position: relative;
        }

        .payment-card:hover {
          border-color: var(--primary);
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .payment-card.selected {
          border-color: var(--primary);
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
        }

        .payment-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }

        .payment-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--dark);
        }

        .payment-cashback-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--danger);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        /* ===== SUMMARY ===== */
        .summary-card {
          position: sticky;
          top: 2rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-size: 0.95rem;
          color: var(--dark);
        }

        .summary-item.highlight {
          color: var(--primary);
          font-weight: 700;
        }

        .summary-item.discount {
          color: var(--danger);
          font-weight: 700;
        }

        .summary-divider {
          border-top: 2px dashed var(--border);
          margin: 1.5rem 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--dark);
          margin: 1.5rem 0;
        }

        .summary-cashback {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #fbbf24;
          border-radius: 12px;
          padding: 1rem;
          margin: 1rem 0;
          text-align: center;
          font-weight: 700;
          color: #92400e;
        }

        /* ===== INSURANCE ===== */
        .insurance-checkbox {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .insurance-checkbox:hover {
          border-color: var(--primary);
          background: #f0fdf4;
        }

        .insurance-checkbox input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--primary);
        }

        .insurance-label {
          flex: 1;
          font-size: 0.95rem;
          color: var(--dark);
        }

        /* ===== MODAL ===== */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease;
        }

        .modal {
          background: white;
          border-radius: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .modal-large {
          max-width: 900px;
        }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--dark);
        }

        .modal-close {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: var(--light-gray);
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: var(--danger);
          color: white;
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 2rem;
          overflow-y: auto;
          max-height: calc(90vh - 200px);
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .warning-modal {
          text-align: center;
          padding: 2.5rem 2rem;
          max-width: 420px;
        }

        .warning-icon {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 1rem;
        }

        .warning-icon.info {
          background: #eff6ff;
          color: #2563eb;
        }

        .warning-icon.danger {
          background: #fee2e2;
          color: #b91c1c;
        }

        .warning-icon.success {
          background: #dcfce7;
          color: #15803d;
        }

        .warning-modal h3 {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 0.5rem;
        }

        .warning-modal p {
          color: #64748b;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
        }

        /* ===== FORM ===== */
        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--dark);
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid var(--border);
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        /* ===== SUCCESS MODAL ===== */
        .success-modal {
          text-align: center;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 3rem;
          color: white;
          animation: scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .success-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 0.5rem;
        }

        .success-subtitle {
          color: var(--gray);
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .success-details {
          background: var(--light-gray);
          border-radius: 16px;
          padding: 1.5rem;
          margin: 2rem 0;
          text-align: left;
        }

        /* ===== SEARCH ===== */
        .search-box {
          margin-bottom: 1.5rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid var(--border);
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        /* ===== TABS ===== */
        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid var(--border);
          overflow-x: auto;
        }

        .tab {
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          font-weight: 600;
          color: var(--gray);
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tab:hover {
          color: var(--primary);
        }

        .tab.active {
          color: var(--primary);
        }

        .tab.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary);
          border-radius: 2px;
        }

        /* ===== ANIMATIONS ===== */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes scaleUp {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        /* ===== LOADING ===== */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 1rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--light-gray);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .payment-layout {
            grid-template-columns: 1fr;
          }

          .summary-card {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .payment-header h1 {
            font-size: 2rem;
          }

          .card {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .payment-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .modal {
            width: 95%;
          }

          .product-item {
            flex-direction: column;
          }

          .product-price {
            text-align: left;
          }
        }

        /* ===== UTILITIES ===== */
        .text-center { text-align: center; }
        .mt-1 { margin-top: 1rem; }
        .mt-2 { margin-top: 2rem; }
        .mb-1 { margin-bottom: 1rem; }
        .mb-2 { margin-bottom: 2rem; }
        .gap-1 { gap: 1rem; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
      `}</style>

      <div className="payment-container">
        {/* ===== HEADER ===== */}
        <div className="payment-header">
          <h1>💳 Checkout Payment</h1>
          <p>Selesaikan pembayaran dengan aman dan mudah</p>
        </div>

        {/* ===== MAIN LAYOUT ===== */}
        <div className="payment-layout">
          {/* ===== LEFT COLUMN ===== */}
          <div>
            {/* ===== ADDRESS CARD ===== */}
            <div className="card">
              <div className="card-title">
                <span className="card-title-icon">📍</span>
                Alamat Pengiriman
              </div>

              {!selectedAddress ? (
                <div className="address-empty">
                  <div className="address-empty-icon">📦</div>
                  <h3>Belum Ada Alamat</h3>
                  <p>Tambahkan alamat pengiriman untuk melanjutkan</p>
                  <button className="btn btn-primary" onClick={() => setShowAddAddressModal(true)}>
                    ➕ Tambah Alamat Baru
                  </button>
                </div>
              ) : (
                <div>
                  <div className="address-card">
                    {selectedAddress.isPrimary && (
                      <div className="address-primary-badge">⭐ Utama</div>
                    )}
                    <div className="address-label">{selectedAddress.label}</div>
                    <div className="address-name">{selectedAddress.name}</div>
                    <div className="address-phone">📱 {selectedAddress.phone}</div>
                    <div className="address-full">
                      {selectedAddress.fullAddress}, {selectedAddress.district}, {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}
                    </div>
                    <button className="btn btn-outline" onClick={() => setShowAddressModal(true)}>
                      🔄 Ganti Alamat
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ===== PRODUCT CARD ===== */}
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-title">
                <span className="card-title-icon">🛍️</span>
                Produk yang Dibeli
              </div>

              {isMultiCart ? (
                <div className="multi-list">
                  {checkoutItems!.map((item) => {
                    const totalItemWeight =
                      (item.weightKg || estimateWeightKg(item)) * (item.quantity || 1);
                    return (
                      <div key={item.asin} className="multi-row">
                        <img
                          src={item.selectedImage || item.product_photo}
                          alt={item.product_title}
                          className="multi-thumb"
                        />
                        <div>
                          <div className="multi-title">{item.product_title}</div>
                          <div className="multi-meta">
                            Qty {item.quantity || 1} • {formatPrice(item.product_price_num)}
                            <span className="multi-weight">
                              {formatWeightLabel(totalItemWeight, false)}
                            </span>
                          </div>
                        </div>
                        <div className="multi-price">
                          {formatPrice(item.product_price_num * (item.quantity || 1))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="product-item">
                  <img 
                    src={primaryItem!.selectedImage || primaryItem!.product_photo} 
                    alt={primaryItem!.product_title}
                    className="product-image"
                  />
                  <div className="product-info">
                    <div className="product-seller">
                      🏪 {primaryItem!.seller_name || 'Official Store'}
                    </div>
                    <div className="product-title">{primaryItem!.product_title}</div>
                    <div className="quantity-control">
                      <button 
                        className="qty-btn"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        aria-label="Kurangi jumlah"
                      >
                        −
                      </button>
                      <input 
                        type="number"
                        className="qty-input"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <button 
                        className="qty-btn"
                        onClick={() => setQuantity(quantity + 1)}
                        aria-label="Tambah jumlah"
                      >
                        +
                      </button>
                    </div>
                    <div className="product-weight">
                      Berat estimasi:
                      <span>
                        {formatWeightLabel(
                          (primaryItem!.weightKg || estimateWeightKg(primaryItem!)) *
                            (primaryItem!.quantity || 1)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="product-price">{formatPrice(productTotal)}</div>
            </div>

            {/* ===== DELIVERY CARD ===== */}
            {selectedAddress && distance > 0 && (
              <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-title">
                  <span className="card-title-icon">🚚</span>
                  Pilih Pengiriman
                </div>

                <div className="delivery-distance">
                  📏 Jarak: <strong>{distance} km</strong> dari {sellerLocation?.address || 'lokasi penjual'}
                </div>

                {shippingLoading ? (
                  <p style={{ textAlign: 'center', color: '#64748b' }}>Mengambil opsi pengiriman...</p>
                ) : deliveryOptions.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b' }}>Belum ada opsi pengiriman tersedia.</p>
                ) : (
                  <div>
                    {selectedDelivery && (
                      <div className="delivery-option-card selected" style={{ marginBottom: '1rem' }}>
                        {selectedDelivery.type === 'instant' && (
                          <div className="delivery-badge">⚡ TERCEPAT</div>
                        )}
                        {selectedDelivery.isCOD && (
                          <div className="delivery-badge" style={{ right: 'auto', left: '15px' }}>
                            💵 COD
                          </div>
                        )}
                        <div className="delivery-header">
                          <div className="delivery-icon">{selectedDelivery.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div className="delivery-name">{selectedDelivery.name}</div>
                            <div className="delivery-provider">{selectedDelivery.provider}</div>
                          </div>
                        </div>
                        <div className="delivery-details">
                          <div className="delivery-price">{formatPrice(selectedDelivery.price)}</div>
                          <div className="delivery-time">⏱️ {selectedDelivery.estimatedTime}</div>
                        </div>
                      </div>
                    )}
                    <button 
                      className="btn btn-outline"
                      onClick={() => setShowDeliveryModal(true)}
                    >
                      📋 Lihat Semua Opsi ({deliveryOptions.length})
                    </button>
                  </div>
                )}
                {shippingError && (
                  <p style={{ color: '#dc2626', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                    {shippingError}
                  </p>
                )}
              </div>
            )}

            {/* ===== VOUCHER CARD ===== */}
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-title">
                <span className="card-title-icon">🎟️</span>
                Voucher & Promo
              </div>

              <div 
                className={`voucher-selector ${selectedVoucher ? 'voucher-selected' : ''}`}
                onClick={() => setShowVoucherModal(true)}
              >
                <div className="voucher-content">
                  <div style={{ flex: 1 }}>
                    {selectedVoucher ? (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                          {selectedVoucher.icon} {selectedVoucher.title}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                          {selectedVoucher.description}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.5rem' }}>
                          -{formatPrice(voucherDiscount)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                          🎁 Pilih Voucher
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                          Dapatkan diskon hingga Rp100.000
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>→</div>
                </div>
              </div>
            </div>

            {/* ===== INSURANCE ===== */}
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-title">
                <span className="card-title-icon">🛡️</span>
                Proteksi
              </div>

              <div className="insurance-checkbox" onClick={() => setIsInsurance(!isInsurance)}>
                <input 
                  type="checkbox"
                  checked={isInsurance}
                  onChange={(e) => setIsInsurance(e.target.checked)}
                />
                <div className="insurance-label">
                  <strong>Asuransi Pengiriman ({formatPrice(insuranceCost)})</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                    Ganti rugi 100% jika paket rusak atau hilang
                  </div>
                </div>
              </div>
            </div>

            {/* ===== PAYMENT METHOD CARD ===== */}
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-title">
                <span className="card-title-icon">💰</span>
                Metode Pembayaran
              </div>

              {!selectedPayment ? (
                <button 
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => setShowPaymentModal(true)}
                >
                  💳 Pilih Metode Pembayaran
                </button>
              ) : (
                <div>
                  <div 
                    className="payment-card selected"
                    style={{ marginBottom: '1rem' }}
                  >
                    {selectedPayment.cashback && (
                      <div className="payment-cashback-badge">
                        💰 Cashback {formatPrice(selectedPayment.cashback)}
                      </div>
                    )}
                    <div className="payment-icon">{selectedPayment.icon}</div>
                    <div className="payment-name">{selectedPayment.name}</div>
                  </div>
                  <button 
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                    onClick={() => setShowPaymentModal(true)}
                  >
                    🔄 Ganti Metode
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT COLUMN - SUMMARY ===== */}
          <div>
            <div className="card summary-card">
              <div className="card-title">
                <span className="card-title-icon">📊</span>
                Ringkasan Pembayaran
              </div>

              <div className="summary-item">
                <span>Subtotal Produk ({totalQuantity} item)</span>
                <span>{formatPrice(productTotal)}</span>
              </div>

              <div className="summary-item">
                <span>Berat Total</span>
                <span>{totalWeightLabel}</span>
              </div>

              {selectedDelivery && (
                <div className="summary-item">
                  <span>Ongkos Kirim ({selectedDelivery.name})</span>
                  <span>{formatPrice(deliveryCost)}</span>
                </div>
              )}

              {isInsurance && (
                <div className="summary-item">
                  <span>Asuransi Pengiriman</span>
                  <span>{formatPrice(insuranceCost)}</span>
                </div>
              )}

              {voucherDiscount > 0 && (
                <div className="summary-item discount">
                  <span>Diskon Voucher</span>
                  <span>-{formatPrice(voucherDiscount)}</span>
                </div>
              )}

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total Bayar</span>
                <span>{formatPrice(totalPayment)}</span>
              </div>

              {cashbackAmount > 0 && (
                <div className="summary-cashback">
                  🎉 Kamu akan dapat cashback {formatPrice(cashbackAmount)}!
                </div>
              )}

              <button 
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '1.1rem', padding: '1rem', opacity: paymentLoading ? 0.7 : 1 }}
                onClick={handlePayNow}
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Memproses Pembayaran...' : '🚀 Bayar Sekarang'}
              </button>
              {paymentError && (
                <p style={{ color: '#dc2626', marginTop: '0.75rem', fontSize: '0.9rem', textAlign: 'center' }}>
                  {paymentError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ===== MODAL: ADD ADDRESS ===== */}
        {showAddAddressModal && (
          <div className="modal-overlay" onClick={() => setShowAddAddressModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">➕ Tambah Alamat Baru</div>
                <button className="modal-close" onClick={() => setShowAddAddressModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Label Alamat *</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Rumah, Kantor, Apartemen"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Penerima *</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="Nama lengkap"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Telepon *</label>
                    <input 
                      type="tel"
                      className="form-input"
                      placeholder="08xxxxxxxxxx"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Lengkap *</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Jalan, No. Rumah, RT/RW"
                    value={newAddress.fullAddress}
                    onChange={(e) => setNewAddress({...newAddress, fullAddress: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kecamatan</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="Kecamatan"
                      value={newAddress.district}
                      onChange={(e) => setNewAddress({...newAddress, district: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kota</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="Kota"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Provinsi</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="Provinsi"
                      value={newAddress.province}
                      onChange={(e) => setNewAddress({...newAddress, province: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kode Pos</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="12345"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                    />
                  </div>
                </div>

                <div className="insurance-checkbox" onClick={() => setNewAddress({...newAddress, isPrimary: !newAddress.isPrimary})}>
                  <input 
                    type="checkbox"
                    checked={newAddress.isPrimary}
                    onChange={(e) => setNewAddress({...newAddress, isPrimary: e.target.checked})}
                  />
                  <div className="insurance-label">
                    Jadikan alamat utama
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddAddressModal(false)}>
                  Batal
                </button>
                <button className="btn btn-primary" onClick={handleAddAddress}>
                  💾 Simpan Alamat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MODAL: SELECT ADDRESS ===== */}
        {showAddressModal && (
          <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">📍 Pilih Alamat Pengiriman</div>
                <button className="modal-close" onClick={() => setShowAddressModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {userAddresses.map(address => (
                  <div 
                    key={address.id}
                    className="address-card"
                    style={{ 
                      marginBottom: '1rem', 
                      cursor: 'pointer',
                      border: selectedAddress?.id === address.id ? '2px solid var(--primary)' : '2px solid var(--border)'
                    }}
                    onClick={() => {
                      setSelectedAddress(address);
                      setShowAddressModal(false);
                    }}
                  >
                    {address.isPrimary && <div className="address-primary-badge">⭐ Utama</div>}
                    <div className="address-label">{address.label}</div>
                    <div className="address-name">{address.name}</div>
                    <div className="address-phone">📱 {address.phone}</div>
                    <div className="address-full">
                      {address.fullAddress}, {address.district}, {address.city}
                    </div>
                  </div>
                ))}
                
                <button 
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={() => {
                    setShowAddressModal(false);
                    setShowAddAddressModal(true);
                  }}
                >
                  ➕ Tambah Alamat Baru
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MODAL: SELECT DELIVERY ===== */}
        {showDeliveryModal && (
          <div className="modal-overlay" onClick={() => setShowDeliveryModal(false)}>
            <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">🚚 Pilih Metode Pengiriman</div>
                <button className="modal-close" onClick={() => setShowDeliveryModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="delivery-distance">
                  📏 Jarak pengiriman: <strong>{distance} km</strong>
                </div>

                {/* Instant Delivery */}
                {deliveryOptions.filter(d => d.type === 'instant').length > 0 && (
                  <>
                    <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                      ⚡ Pengiriman Instan
                    </h3>
                    {deliveryOptions
                      .filter(d => d.type === 'instant')
                      .map(delivery => (
                        <div 
                          key={delivery.id}
                          className={`delivery-option-card ${selectedDelivery?.id === delivery.id ? 'selected' : ''}`}
                          style={{ marginBottom: '1rem' }}
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowDeliveryModal(false);
                          }}
                        >
                          {delivery.isCOD && (
                            <div className="delivery-badge">💵 COD</div>
                          )}
                          <div className="delivery-header">
                            <div className="delivery-icon">{delivery.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div className="delivery-name">{delivery.name}</div>
                              <div className="delivery-provider">{delivery.provider}</div>
                            </div>
                          </div>
                          <div className="delivery-details">
                            <div className="delivery-price">{formatPrice(delivery.price)}</div>
                            <div className="delivery-time">⏱️ {delivery.estimatedTime}</div>
                          </div>
                        </div>
                      ))}
                  </>
                )}

                {/* Same Day */}
                {deliveryOptions.filter(d => d.type === 'same-day').length > 0 && (
                  <>
                    <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
                      🚀 Same Day
                    </h3>
                    {deliveryOptions
                      .filter(d => d.type === 'same-day')
                      .map(delivery => (
                        <div 
                          key={delivery.id}
                          className={`delivery-option-card ${selectedDelivery?.id === delivery.id ? 'selected' : ''}`}
                          style={{ marginBottom: '1rem' }}
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowDeliveryModal(false);
                          }}
                        >
                          {delivery.isCOD && (
                            <div className="delivery-badge">💵 COD</div>
                          )}
                          <div className="delivery-header">
                            <div className="delivery-icon">{delivery.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div className="delivery-name">{delivery.name}</div>
                              <div className="delivery-provider">{delivery.provider}</div>
                            </div>
                          </div>
                          <div className="delivery-details">
                            <div className="delivery-price">{formatPrice(delivery.price)}</div>
                            <div className="delivery-time">⏱️ {delivery.estimatedTime}</div>
                          </div>
                        </div>
                      ))}
                  </>
                )}

                {/* Regular */}
                {deliveryOptions.filter(d => d.type === 'regular').length > 0 && (
                  <>
                    <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--gray)' }}>
                      📦 Regular
                    </h3>
                    {deliveryOptions
                      .filter(d => d.type === 'regular')
                      .map(delivery => (
                        <div 
                          key={delivery.id}
                          className={`delivery-option-card ${selectedDelivery?.id === delivery.id ? 'selected' : ''}`}
                          style={{ marginBottom: '1rem' }}
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowDeliveryModal(false);
                          }}
                        >
                          {delivery.isCOD && (
                            <div className="delivery-badge">💵 COD</div>
                          )}
                          <div className="delivery-header">
                            <div className="delivery-icon">{delivery.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div className="delivery-name">{delivery.name}</div>
                              <div className="delivery-provider">{delivery.provider}</div>
                            </div>
                          </div>
                          <div className="delivery-details">
                            <div className="delivery-price">{formatPrice(delivery.price)}</div>
                            <div className="delivery-time">⏱️ {delivery.estimatedTime}</div>
                          </div>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== MODAL: SELECT VOUCHER ===== */}
        {showVoucherModal && (
          <div className="modal-overlay" onClick={() => setShowVoucherModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">🎟️ Pilih Voucher</div>
                <button className="modal-close" onClick={() => setShowVoucherModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="search-box">
                  <input 
                    type="text"
                    className="search-input"
                    placeholder="Cari kode voucher..."
                    value={searchVoucher}
                    onChange={(e) => setSearchVoucher(e.target.value)}
                  />
                </div>

                {dummyVouchers
                  .filter(v => 
                    v.code.toLowerCase().includes(searchVoucher.toLowerCase()) ||
                    v.title.toLowerCase().includes(searchVoucher.toLowerCase())
                  )
                  .map(voucher => {
                    const canUse = productTotal >= voucher.minPurchase;
                    return (
                      <div 
                        key={voucher.id}
                        className={`voucher-card ${selectedVoucher?.id === voucher.id ? 'selected' : ''}`}
                        style={{ 
                          opacity: canUse ? 1 : 0.5,
                          cursor: canUse ? 'pointer' : 'not-allowed'
                        }}
                        onClick={() => {
                          if (canUse) {
                            setSelectedVoucher(voucher);
                            setShowVoucherModal(false);
                          }
                        }}
                      >
                        <div className="voucher-header">
                          <div className="voucher-icon">{voucher.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div className="voucher-title">{voucher.title}</div>
                            <div className="voucher-code">{voucher.code}</div>
                          </div>
                        </div>
                        <div className="voucher-desc">{voucher.description}</div>
                        <div className="voucher-valid">
                          {canUse ? (
                            `✅ Valid hingga ${new Date(voucher.validUntil).toLocaleDateString('id-ID')}`
                          ) : (
                            `❌ Min. belanja ${formatPrice(voucher.minPurchase)}`
                          )}
                        </div>
                      </div>
                    );
                  })}

                {selectedVoucher && (
                  <button 
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: '1rem' }}
                    onClick={() => {
                      setSelectedVoucher(null);
                      setShowVoucherModal(false);
                    }}
                  >
                    🗑️ Hapus Voucher
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== MODAL: SELECT PAYMENT ===== */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">💳 Pilih Metode Pembayaran</div>
                <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="search-box">
                  <input 
                    type="text"
                    className="search-input"
                    placeholder="Cari metode pembayaran..."
                    value={searchPayment}
                    onChange={(e) => setSearchPayment(e.target.value)}
                  />
                </div>

                <div className="tabs">
                  {['all', 'ewallet', 'bank', 'qris', 'cod', 'retail'].map(cat => (
                    <button 
                      key={cat}
                      className={`tab ${paymentCategory === cat ? 'active' : ''}`}
                      onClick={() => setPaymentCategory(cat)}
                    >
                      {cat === 'all' ? 'Semua' :
                       cat === 'ewallet' ? 'E-Wallet' :
                       cat === 'bank' ? 'Transfer Bank' :
                       cat === 'qris' ? 'QRIS' :
                       cat === 'cod' ? 'COD' : 'Retail'}
                    </button>
                  ))}
                </div>

                <div className="payment-grid">
                  {filteredPayments.map(payment => (
                    <div 
                      key={payment.id}
                      className={`payment-card ${selectedPayment?.id === payment.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowPaymentModal(false);
                      }}
                    >
                      {payment.cashback && (
                        <div className="payment-cashback-badge">
                          💰 {formatPrice(payment.cashback)}
                        </div>
                      )}
                      <div className="payment-icon">{payment.icon}</div>
                      <div className="payment-name">{payment.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MODAL: SUCCESS ===== */}
        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-body success-modal">
                <div className="success-icon">✓</div>
                <div className="success-title">Pembayaran Berhasil!</div>
                <div className="success-subtitle">Pesananmu sedang diproses</div>

                <div className="success-details">
                  {primaryItem && (
                    <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                      <img 
                        src={primaryItem.selectedImage || primaryItem.product_photo}
                        alt={primaryItem.product_title}
                        style={{ width: '80px', height: '80px', borderRadius: '12px', marginBottom: '0.5rem' }}
                      />
                      <div style={{ fontWeight: 600 }}>{primaryItem.product_title}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                        {isMultiCart
                          ? `${totalQuantity} item`
                          : `${quantity} item`}
                      </div>
                    </div>
                  )}

                  <div className="summary-item">
                    <span>Total Pembayaran</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {formatPrice(totalPayment)}
                    </span>
                  </div>

                  <div className="summary-item">
                    <span>Berat Total</span>
                    <span>{totalWeightLabel}</span>
                  </div>
                  
                  {cashbackAmount > 0 && (
                    <div className="summary-item highlight">
                      <span>💰 Cashback Diterima</span>
                      <span>{formatPrice(cashbackAmount)}</span>
                    </div>
                  )}

                  <div style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: '1rem', textAlign: 'center' }}>
                    Metode: <strong>{selectedPayment?.name}</strong><br/>
                    Pengiriman: <strong>{selectedDelivery?.name}</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                  <button 
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => window.location.href = '/etalase'}
                  >
                    🛍️ Lanjut Belanja
                  </button>
                  <button 
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => window.location.href = '/profile#orders'}
                  >
                    📦 Lihat Pesananku
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {warningModal && (
          <div className="modal-overlay" onClick={closeWarning}>
            <div className="modal warning-modal" onClick={(e) => e.stopPropagation()}>
              <div className={`warning-icon ${warningModal.accent || 'info'}`}>
                {warningModal.icon || '⚠️'}
              </div>
              <h3>{warningModal.title}</h3>
              <p>{warningModal.message}</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  warningModal.action?.();
                  closeWarning();
                }}
              >
                {warningModal.actionLabel || 'Mengerti'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Payment;