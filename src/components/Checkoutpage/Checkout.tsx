// src/components/Checkoutpage/Checkout.tsx
import React, { useState, useEffect, useRef } from 'react';

interface CheckoutItem {
  asin: string;
  product_title: string;
  product_photo: string;
  selectedImage: string;
  product_price: string;
  product_price_num: number;
  product_original_price?: string;
  product_original_price_num?: number;
  quantity: number;
  seller_name?: string;
  category?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  size?: string;
  text?: string;
  cashback?: boolean;
}

interface PaymentGroup {
  title: string;
  icon: string;
  items: PaymentMethod[];
}

interface ShippingOption {
  name: string;
  price: number;
  detail: string;
}

const paymentGroups: PaymentGroup[] = [
  {
    title: "E-Wallet",
    icon: `<svg viewBox="0 0 24 24"><path d="M19 7h-1V6a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V10a3 3 0 0 0-3-3zm1 11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1z"/></svg>`,
    items: [
      { id: 'gopay', name: 'GoPay', icon: 'Go', color: '#00b14f', size: '0.9rem', cashback: true },
      { id: 'ovo', name: 'OVO', icon: 'OVO', color: '#6f42c1' },
      { id: 'dana', name: 'DANA', icon: 'DANA', color: '#2e86de' },
      { id: 'shopeepay', name: 'ShopeePay', icon: 'SPay', color: '#ee4d2d', size: '0.7rem', cashback: true },
      { id: 'linkaja', name: 'LinkAja', icon: 'LA', color: '#e74c3c' },
    ]
  },
  {
    title: "Bank Transfer",
    icon: `<svg viewBox="0 0 24 24"><path d="M21 7h-3V6a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM8 7h8v1H8zm12 10H4V9h16z"/></svg>`,
    items: [
      { id: 'bca', name: 'BCA', icon: 'BCA', color: '#10b981' },
      { id: 'bni', name: 'BNI', icon: 'BNI', color: '#e67e22' },
      { id: 'mandiri', name: 'Mandiri', icon: 'MDR', color: '#f1c40f', text: '#2c3e50' },
      { id: 'bri', name: 'BRI', icon: 'BRI', color: '#2980b9' },
      { id: 'cimb', name: 'CIMB Niaga', icon: 'CN', color: '#c0392b' },
      { id: 'permata', name: 'Permata', icon: 'P', color: '#8e44ad' },
      { id: 'danamon', name: 'Danamon', icon: 'D', color: '#27ae60' },
      { id: 'bsi', name: 'BSI', icon: 'BSI', color: '#16a085' },
      { id: 'mega', name: 'Bank Mega', icon: 'M', color: '#34495e' },
    ]
  },
  {
    title: "QRIS",
    icon: `<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h4v2H7v-2zm6 0h4v2h-4v-2zm-6 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>`,
    items: [{ id: 'qris', name: 'QRIS', icon: 'QR', color: '#2c3e50' }]
  },
  {
    title: "Retail Outlet",
    icon: `<svg viewBox="0 0 24 24"><path d="M21 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM4 9h16v6H4V9zm3 8v2h10v-2H7z"/></svg>`,
    items: [
      { id: 'indomaret', name: 'Indomaret', icon: 'I', color: '#27ae60' },
      { id: 'alfamart', name: 'Alfamart', icon: 'A', color: '#3498db' },
    ]
  },
  {
    title: "Lainnya",
    icon: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17v-2h2v2h-2zm1-4c-1.85 0-3.43-1.15-4.06-2.75l1.81-.72C10.21 12.7 11.03 13 12 13c1.66 0 3-1.34 3-3s-1.34-3-3-3c-1.54 0-2.85.94-3.41 2.28l-1.81-.72C7.57 6.15 9.15 5 11 5c2.76 0 5 2.24 5 5s-2.24 5-5 5z"/></svg>`,
    items: [{ id: 'cod', name: 'COD', icon: 'COD', color: '#95a5a6' }]
  }
];

const shippingOptions: ShippingOption[] = [
  { name: 'Ekonomi', price: 10000, detail: 'Bisa COD • Estimasi 7 - 11 Nov' },
  { name: 'Standard', price: 23000, detail: 'Bisa COD • Estimasi besok - 9 Nov' },
];

const Checkout: React.FC = () => {
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [isInsurance, setIsInsurance] = useState(true);
  const [currentCashback, setCurrentCashback] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState(paymentGroups[1].items[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('checkoutItem');
    if (stored) {
      try {
        const item: CheckoutItem = JSON.parse(stored);
        setCheckoutItem(item);
        setQuantity(item.quantity);
      } catch (err) {
        console.error('Gagal parse checkoutItem:', err);
        alert('Data produk tidak valid. Kembali ke halaman produk.');
      }
    } else {
      alert('Tidak ada produk yang dipilih. Kembali ke halaman produk.');
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsShippingOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!checkoutItem) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
        <p>Memuat data checkout...</p>
      </div>
    );
  }

  const cashbackAmount = 50000;
  const insuranceCost = 19100;
  const productTotal = checkoutItem.product_price_num * quantity;
  const shippingCost = shippingOptions[selectedShipping].price;
  const total = productTotal + shippingCost + (isInsurance ? insuranceCost : 0) - currentCashback;

  const formatPrice = (price: number) => `Rp${price.toLocaleString('id-ID')}`;

  const selectPayment = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setCurrentCashback(method.cashback ? cashbackAmount : 0);
    setIsSidebarOpen(false);
  };

  const selectShippingOption = (index: number) => {
    setSelectedShipping(index);
    setIsShippingOpen(false);
  };

  const handlePayNow = () => {
    const orderData = {
      ...checkoutItem,
      quantity,
      total,
      paymentMethod: selectedMethod.name,
      shipping: shippingOptions[selectedShipping].name,
      insurance: isInsurance,
      cashback: currentCashback,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    setShowSuccessModal(true);
  };

  const goToEtalase = () => {
    setShowSuccessModal(false);
    window.location.href = '../etalase';
  };

  const filteredPayments = paymentGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab =
          activeTab === 'all' ||
          (activeTab === 'bank' && group.title === 'Bank Transfer') ||
          (activeTab === 'ewallet' && group.title === 'E-Wallet') ||
          (activeTab === 'retail' && group.title === 'Retail Outlet') ||
          ['QRIS', 'Lainnya'].includes(group.title);
        return matchesSearch && matchesTab;
      }),
    }))
    .filter(group => group.items.length > 0);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .fontInter { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1f2937; min-height: 100vh; }

        @keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes tabLine { to { transform: scaleX(1); } }
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { transform: translateY(100px); } to { transform: translateY(0); } }

        .pageHeader { text-align: center; padding: 2rem 1rem 1rem; max-width: 1200px; margin: 0 auto; opacity: 0; animation: fadeDown 0.6s ease forwards; }
        .pageHeader h1 { font-size: 1.875rem; font-weight: 800; color: #1f2937; }

        .mainWrapper { max-width: 1200px; margin: 0 auto 3rem; padding: 0 1rem; display: grid; grid-template-columns: 1fr 420px; gap: 2rem; }

        .card { background: #ffffff; border-radius: 20px; padding: 1.75rem; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0; }
        .card:nth-child(1) { animation: fadeUp 0.6s 0.1s ease forwards; }
        .card:nth-child(2) { animation: fadeUp 0.6s 0.2s ease forwards; }
        .card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }

        .addressHeader { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #10b981; margin-bottom: 0.75rem; font-size: 1rem; }
        .addressHeader svg { width: 20px; height: 20px; fill: #10b981; animation: pulse 2s infinite; }
        .addressText { font-size: 0.95rem; color: #6b7280; margin-bottom: 1rem; line-height: 1.7; }
        .changeBtn { background: #d1fae5; color: #10b981; border: none; padding: 0.5rem 1rem; border-radius: 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .changeBtn:hover { background: #a7f3d0; transform: scale(1.05); }

        .productItem { display: flex; gap: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px dashed #e5e7eb; margin-bottom: 1.25rem; }
        .productImg { width: 80px; height: 80px; border-radius: 16px; object-fit: cover; border: 1px solid #e5e7eb; transition: all 0.3s; }
        .productImg:hover { transform: scale(1.08); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .productInfo { flex: 1; }
        .productShop { font-size: 0.875rem; color: #6b7280; }
        .productName { font-weight: 600; font-size: 1.1rem; margin: 0.5rem 0; line-height: 1.5; }
        .quantityControl { display: flex; align-items: center; gap: 1rem; }
        .qtyBtn { width: 40px; height: 40px; border: 2px solid #e5e7eb; background: white; border-radius: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
        .qtyBtn:hover { border-color: #10b981; background: #ecfdf5; color: #10b981; transform: scale(1.1); }
        .qtyInput { width: 60px; height: 40px; text-align: center; border: 2px solid #e5e7eb; border-radius: 12px; padding: 0; font-weight: 700; font-size: 1rem; background: white; }
        .qtyInput:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
        .price { font-weight: 800; font-size: 1.5rem; white-space: nowrap; color: #1f2937; text-align: right; }

        .shippingWrapper { position: relative; margin: 1.25rem 0; }
        .shippingSelect { width: 100%; padding: 1rem; border: 1.5px solid #e5e7eb; border-radius: 16px; background: white; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; }
        .shippingSelect:hover { border-color: #94a3b8; background: #f9fafb; }
        .shippingSelect.active { border-color: #10b981; border-bottom-color: transparent; border-bottom-left-radius: 0; border-bottom-right-radius: 0; background: #ecfdf5; }
        .shippingDisplay { display: flex; flex-direction: column; gap: 0.25rem; }
        .shippingName { font-weight: 600; font-size: 0.95rem; }
        .shippingDetail { font-size: 0.8rem; color: #6b7280; }
        .arrowIcon { width: 20px; height: 20px; fill: #9ca3af; transition: all 0.2s; }
        .shippingSelect:hover .arrowIcon { fill: #10b981; }
        .shippingSelect.active .arrowIcon { transform: rotate(180deg); fill: #10b981; }
        .rotate180 { transform: rotate(180deg); }
        .shippingDropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1.5px solid #10b981; border-top: none; border-radius: 0 0 16px 16px; max-height: 0; overflow: hidden; z-index: 10; box-shadow: 0 12px 30px rgba(0,0,0,0.15); opacity: 0; visibility: hidden; transition: all 0.3s; }
        .shippingDropdown.open { max-height: 500px; opacity: 1; visibility: visible; }
        .shippingOption { padding: 0.875rem 1rem; border-bottom: 1px solid #f3f4f6; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; }
        .shippingOption:hover { background: #f9fafb; padding-left: 1.25rem; }
        .shippingOption.selected { background: #ecfdf5; border-left: 4px solid #10b981; padding-left: calc(1rem - 4px); }
        .optionLeft { display: flex; flex-direction: column; gap: 0.25rem; }
        .optionName { font-weight: 600; font-size: 0.95rem; }
        .optionPrice { font-weight: 700; color: #1f2937; }
        .optionDetail { font-size: 0.8rem; color: #6b7280; }
        .checkmarkIcon { width: 18px; height: 18px; fill: none; stroke: #10b981; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; opacity: 0; transform: scale(0.8); transition: all 0.25s; }
        .shippingOption.selected .checkmarkIcon { opacity: 1; transform: scale(1); }

        .shippingFrom { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #6b7280; margin: 0.75rem 0; padding: 0.5rem; background: #f9fafb; border-radius: 8px; transition: all 0.3s; }
        .shippingFrom:hover { background: #f1f5f9; }

        .refundNote { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: linear-gradient(135deg, #ffe5e5, #fff1f1); border: 1px solid #f8b4b4; border-radius: 10px; font-size: 0.9rem; color: #b91c1c; transition: all 0.25s; box-shadow: 0 2px 6px rgba(249, 113, 113, 0.15); }
        .refundNote:hover { background: linear-gradient(135deg, #ffdede, #ffeaea); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(249, 113, 113, 0.25); }
        .refundNote input { width: 21px; height: 21px; cursor: pointer; accent-color: #ef4444; }

        .rightPanel { display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; transition: all 0.3s; }
        .rightPanel:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }
        .summaryHeader { padding: 1.75rem 1.75rem 0; font-weight: 700; font-size: 1.1rem; color: #1f2937; }
        .paymentTrigger { margin: 1.25rem 1.75rem 0; padding: 1.25rem; border: 1.5px solid #e5e7eb; border-radius: 16px; background: white; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.3s; }
        .paymentTrigger:hover { border-color: #10b981; background: #ecfdf5; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16,185,129,0.2); }
        .paymentTrigger:hover .rightArrowIcon { fill: #10b981; transform: translateX(4px); }
        .selectedMethod { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; }
        .paymentIcon { width: 36px; height: 36px; background: #10b981; border-radius: 10px; color: white; font-weight: bold; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
        .rightArrowIcon { width: 20px; height: 20px; fill: #9ca3af; transition: all 0.2s; }
        .promoBanner { margin: 1.5rem 1.75rem; padding: 1rem; background: #fef3c7; border-radius: 16px; text-align: center; font-size: 0.9rem; color: #92400e; font-weight: 600; transition: all 0.3s; }
        .promoBanner:hover { background: #fde68a; transform: scale(1.02); }
        .summaryFooter { margin-top: auto; padding: 1.75rem; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-top: 1px dashed #e5e7eb; }
        .summaryItem { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem; color: #6b7280; opacity: 0; transform: translateX(-20px); animation: fadeInRight 0.5s forwards; }
        .summaryItem:nth-child(1) { animation-delay: 0.1s; }
        .summaryItem:nth-child(2) { animation-delay: 0.2s; }
        .summaryItem:nth-child(3) { animation-delay: 0.3s; }
        .cashbackRow { color: #f59e0b; font-weight: 700; }
        .totalRow { display: flex; justify-content: space-between; padding-top: 1rem; margin-top: 1rem; border-top: 2px dashed #e5e7eb; font-weight: 800; font-size: 1.5rem; opacity: 0; transform: translateY(10px); animation: fadeUp 0.5s 0.4s forwards; }
        .payBtn { width: 100%; margin-top: 1.5rem; padding: 1.1rem; background: #10b981; color: white; font-weight: 700; font-size: 1.1rem; border: none; border-radius: 16px; cursor: pointer; transition: all 0.3s; box-shadow: 0 6px 16px rgba(16,185,129,0.3); }
        .payBtn:hover { background: #059669; transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 30px rgba(16,185,129,0.4); }

        .summaryCard { background: #ffffff; border-radius: 20px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-top: 1.5rem; overflow: hidden; }

        .paymentOverlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(8px); opacity: 0; transition: opacity 0.4s ease; }
        .paymentOverlay.open { display: flex; opacity: 1; }
        .paymentSidebar { background: white; width: 90%; max-width: 480px; height: 90vh; border-radius: 20px; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.15); overflow: hidden; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .paymentOverlay.open .paymentSidebar { transform: translateX(0); }
        .sidebarHeader { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .sidebarHeader h3 { font-weight: 700; font-size: 1.1rem; }
        .closeSidebar { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s; }
        .closeSidebar:hover { background: #f3f4f6; color: #1f2937; transform: rotate(90deg); }
        .sidebarSearch { padding: 1rem; flex-shrink: 0; }
        .searchInput { width: 100%; padding: 0.75rem 1rem; border: 1.5px solid #e5e7eb; border-radius: 12px; font-size: 0.95rem; background: #f9fafb; transition: all 0.3s; }
        .searchInput:focus { outline: none; border-color: #10b981; background: white; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
        .sidebarTabs { display: flex; border-bottom: 1px solid #e5e7eb; overflow-x: auto; flex-shrink: 0; }
        .sidebarTabs::-webkit-scrollbar { display: none; }
        .tabBtn { padding: 0.75rem 1rem; font-size: 0.9rem; font-weight: 600; color: #6b7280; background: none; border: none; cursor: pointer; white-space: nowrap; position: relative; transition: all 0.3s; }
        .tabBtn.active { color: #10b981; }
        .tabBtn.active::after { content: ""; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: #10b981; border-radius: 2px; transform: scaleX(0); animation: tabLine 0.3s ease forwards; }
        .sidebarBody { flex: 1; overflow-y: auto; padding: 1rem; }
        .promoNotice { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 0.75rem 1rem; margin: 0.5rem 0 1rem; font-size: 0.85rem; color: #92400e; text-align: center; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; animation: fadeUp 0.5s ease; }
        .promoNotice svg { width: 18px; height: 18px; fill: #f59e0b; }
        .paymentSection { margin: 1.5rem 0 0.75rem; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; color: #10b981; letter-spacing: 0.5px; display: flex; align-items: center; gap: 0.5rem; opacity: 0; transform: translateY(-10px); animation: fadeDown 0.4s ease forwards; }
        .paymentSection svg { width: 16px; height: 16px; fill: currentColor; }
        .paymentGrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
        .paymentOption { flex-direction: column; text-align: center; padding: 1rem 0.5rem; border-radius: 16px; transition: all 0.2s; opacity: 0; transform: translateY(10px); position: relative; }
        .paymentOption.visible { opacity: 1; transform: translateY(0); }
        .paymentOption .icon { width: 44px; height: 44px; margin: 0 auto 0.5rem; font-size: 0.85rem; border-radius: 12px; }
        .paymentOption span { font-size: 0.85rem; font-weight: 600; color: #1f2937; }
        .paymentOption:hover { background: #ecfdf5; transform: translateY(-4px) scale(1.03); box-shadow: 0 8px 20px rgba(16,185,129,0.15); }
        .cashbackBadge { position: absolute; top: -8px; right: -8px; background: #f59e0b; color: white; font-size: 0.65rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 8px; box-shadow: 0 2px 6px rgba(245,158,11,0.3); }
        .cashbackBadgeInline { background: #f59e0b; color: white; padding: 2px 6px; border-radius: 6px; font-size: 0.7rem; margin-left: 8px; }

        .mobileFixedBar { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 1rem; border-top: 1px solid #e5e7eb; box-shadow: 0 -4px 20px rgba(0,0,0,0.1); z-index: 999; display: none; }
        .totalBar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; padding: 0 0.5rem; }
        .totalLabel { font-size: 0.95rem; color: #6b7280; font-weight: 600; }
        .totalAmount { font-size: 1.4rem; font-weight: 800; color: #1f2937; }
        .mobilePayBtn { width: 100%; padding: 1rem; background: #10b981; color: white; font-weight: 700; font-size: 1.1rem; border: none; border-radius: 16px; cursor: pointer; }

        /* ==== MODAL SUKSES – CEKLIS TIDAK KEPOTONG ==== */
        .successOverlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
          z-index: 10000; backdrop-filter: blur(10px); opacity: 0; visibility: hidden;
          transition: all 0.4s ease;
        }
        .successOverlay.open { opacity: 1; visibility: visible; }

        .successModal {
          background: white; width: 90%; max-width: 380px; border-radius: 20px;
          overflow: visible;   /* penting supaya badge keluar */
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          transform: translateY(100px); transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
        }
        .successOverlay.open .successModal { transform: translateY(0); }

        .successCheckBadge {
          position: absolute; top: -32px; left: 50%; transform: translateX(-50%);
          width: 60px; height: 60px; background: #10b981; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(16,185,129,0.4); z-index: 20;
        }
        .successCheckBadge svg {
          width: 36px; height: 36px; fill: white;
        }

        .successHeader {
          background: white; padding: 3rem 1.5rem 1.5rem; text-align: center;
          position: relative; border-bottom: 1px solid #f3f4f6;
        }
        .successTitle { font-size: 1.25rem; font-weight: 800; color: #1f2937; margin-bottom: 0.25rem; }
        .successSubtitle { font-size: 0.875rem; color: #6b7280; }

        .successBody { padding: 1.5rem; }
        .successProduct { display: flex; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px dashed #e5e7eb; }
        .successImg { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; border: 1px solid #e5e7eb; }
        .successInfo { flex: 1; }
        .successName { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem; line-height: 1.4; }
        .successQty { font-size: 0.8rem; color: #6b7280; }

        .successSummary { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; color: #4b5563; }
        .successSummary.total { font-weight: 800; font-size: 1.1rem; color: #10b981; padding-top: 0.75rem; border-top: 2px dashed #e5e7eb; margin-top: 0.5rem; }

        .successFooter { padding: 1.25rem; background: #f9fafb; text-align: center; }
        .successBtn {
          width: 100%; padding: 0.9rem; background: #10b981; color: white; font-weight: 700;
          font-size: 1rem; border: none; border-radius: 12px; cursor: pointer;
          transition: all 0.3s; box-shadow: 0 6px 16px rgba(16,185,129,0.3);
        }
        .successBtn:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 10px 25px rgba(16,185,129,0.4); }

        @media (max-width: 992px) {
          .mainWrapper { grid-template-columns: 1fr; gap: 1.5rem; }
          .rightPanel { display: none; }
          .mobileFixedBar { display: block; }
          .productItem { flex-direction: column; }
          .productImg { width: 80px; height: 80px; align-self: flex-start; }
          .price { font-size: 1.4rem; margin-top: 0.5rem; }
          .summaryFooter { padding: 1.5rem; }
          .paymentGrid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (min-width: 993px) {
          .mobileFixedBar { display: none; }
          .summaryCard { display: none; }
          .paymentOverlay { align-items: stretch; justify-content: flex-end; }
          .paymentSidebar { width: 420px; height: 100vh; border-radius: 0; border-left: 1px solid #e5e7eb; }
          .sidebarHeader { padding: 2rem 1.5rem 1rem; }
          .rightPanel { animation: fadeUp 0.6s 0.3s ease forwards; }
        }
      `}</style>

      <div className="fontInter">
        <header className="pageHeader"><h1>Checkout</h1></header>

        <div className="mainWrapper">
          <div>
            <div className="card">
              <div className="addressHeader">
                <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                ALAMAT PENGIRIMAN
              </div>
              <div className="addressText">
                <strong>Rumah - Endang Sarasvati</strong><br />
                Jl. Melati No. 45, RT 02 RW 03, Kel. Sukamaju, Kec. Cilandak,
              </div>
              <button className="changeBtn">Ganti</button>
            </div>

            <div className="card">
              <div className="productItem">
                <img src={checkoutItem.selectedImage} alt={checkoutItem.product_title} className="productImg" />
                <div className="productInfo">
                  <div className="productShop">{checkoutItem.seller_name || 'Toko Tidak Diketahui'}</div>
                  <div className="productName">{checkoutItem.product_title}</div>
                  <div className="quantityControl">
                    <button className="qtyBtn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <input type="number" className="qtyInput" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                    <button className="qtyBtn" onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>
                </div>
                <div className="price">{formatPrice(productTotal)}</div>
              </div>

              <div className="shippingWrapper" ref={dropdownRef}>
                <div className={`shippingSelect ${isShippingOpen ? 'active' : ''}`} onClick={() => setIsShippingOpen(!isShippingOpen)}>
                  <div className="shippingDisplay">
                    <div className="shippingName">{shippingOptions[selectedShipping].name}</div>
                    <div className="shippingDetail">{formatPrice(shippingCost)} • {shippingOptions[selectedShipping].detail}</div>
                  </div>
                  <svg className={`arrowIcon ${isShippingOpen ? 'rotate180' : ''}`} viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
                <div className={`shippingDropdown ${isShippingOpen ? 'open' : ''}`}>
                  {shippingOptions.map((opt, i) => (
                    <div key={i} className={`shippingOption ${selectedShipping === i ? 'selected' : ''}`} onClick={() => selectShippingOption(i)}>
                      <div className="optionLeft">
                        <div className="optionName">{opt.name}</div>
                        <div className="optionPrice">{formatPrice(opt.price)}</div>
                        <div className="optionDetail">{opt.detail}</div>
                      </div>
                      <svg className="checkmarkIcon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shippingFrom">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
                Dikirim dari Jakarta Selatan • Berat 2.0 kg
              </div>

              <div className="refundNote">
                <input type="checkbox" checked={isInsurance} onChange={e => setIsInsurance(e.target.checked)} />
                Ganti rugi jika rusak/kecurian ({formatPrice(insuranceCost)})
              </div>
            </div>

            <div className="summaryCard">
              <div className="summaryHeader">Ringkasan Pembayaran</div>
              <div className="paymentTrigger" onClick={() => setIsSidebarOpen(true)}>
                <div className="selectedMethod">
                  <div className="paymentIcon" style={{ background: selectedMethod.color, fontSize: selectedMethod.size || '0.8rem' }}>
                    {selectedMethod.icon}
                  </div>
                  <span>{selectedMethod.name}</span>
                  {selectedMethod.cashback && <span className="cashbackBadgeInline">Cashback</span>}
                </div>
                <svg className="rightArrowIcon" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </div>
              <div className="promoBanner">Pakai promo biar makin hemat!</div>
              <div className="summaryFooter">
                <div className="summaryItem"><span>Total Harga Produk</span><span>{formatPrice(productTotal)}</span></div>
                <div className="summaryItem"><span>Ongkir</span><span>{formatPrice(shippingCost)}</span></div>
                {isInsurance && <div className="summaryItem"><span>Asuransi</span><span>{formatPrice(insuranceCost)}</span></div>}
                {currentCashback > 0 && <div className={`summaryItem cashbackRow`}><span>Cashback</span><span>-{formatPrice(currentCashback)}</span></div>}
                <div className="totalRow"><span>Total Bayar</span><span>{formatPrice(total)}</span></div>
              </div>
            </div>
          </div>

          <div className="rightPanel">
            <div className="summaryHeader">Ringkasan Pembayaran</div>
            <div className="paymentTrigger" onClick={() => setIsSidebarOpen(true)}>
              <div className="selectedMethod">
                <div className="paymentIcon" style={{ background: selectedMethod.color, fontSize: selectedMethod.size || '0.8rem' }}>
                  {selectedMethod.icon}
                </div>
                <span>{selectedMethod.name}</span>
                {selectedMethod.cashback && <span className="cashbackBadgeInline">Cashback</span>}
              </div>
              <svg className="rightArrowIcon" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </div>
            <div className="promoBanner">Pakai promo biar makin hemat!</div>
            <div className="summaryFooter">
              <div className="summaryItem"><span>Total Harga Produk</span><span>{formatPrice(productTotal)}</span></div>
              <div className="summaryItem"><span>Ongkir</span><span>{formatPrice(shippingCost)}</span></div>
              {isInsurance && <div className="summaryItem"><span>Asuransi</span><span>{formatPrice(insuranceCost)}</span></div>}
              {currentCashback > 0 && <div className={`summaryItem cashbackRow`}><span>Cashback</span><span>-{formatPrice(currentCashback)}</span></div>}
              <div className="totalRow"><span>Total Bayar</span><span>{formatPrice(total)}</span></div>
              <button className="payBtn" onClick={handlePayNow}>Bayar Sekarang</button>
            </div>
          </div>
        </div>

        <div className="mobileFixedBar">
          <div className="totalBar">
            <div className="totalLabel">Total Bayar</div>
            <div className="totalAmount">{formatPrice(total)}</div>
          </div>
          <button className="mobilePayBtn" onClick={handlePayNow}>Bayar Sekarang</button>
        </div>

        {/* ==== POPUP SUKSES – CEKLIS TIDAK KEPOTONG ==== */}
        <div className={`successOverlay ${showSuccessModal ? 'open' : ''}`} onClick={() => setShowSuccessModal(false)}>
          <div className="successModal" onClick={e => e.stopPropagation()}>
            <div className="successCheckBadge">
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="successHeader">
              <div className="successTitle">Pembayaran Berhasil!</div>
              <div className="successSubtitle">Pesananmu sedang diproses</div>
            </div>
            <div className="successBody">
              <div className="successProduct">
                <img src={checkoutItem.selectedImage} alt={checkoutItem.product_title} className="successImg" />
                <div className="successInfo">
                  <div className="successName">{checkoutItem.product_title}</div>
                  <div className="successQty">Jumlah: {quantity} barang</div>
                </div>
              </div>
              <div className="successSummary"><span>Produk</span><span>{formatPrice(productTotal)}</span></div>
              <div className="successSummary"><span>Ongkir ({shippingOptions[selectedShipping].name})</span><span>{formatPrice(shippingCost)}</span></div>
              {isInsurance && <div className="successSummary"><span>Asuransi</span><span>{formatPrice(insuranceCost)}</span></div>}
              {currentCashback > 0 && <div className="successSummary" style={{ color: '#f59e0b', fontWeight: 700 }}><span>Cashback</span><span>-{formatPrice(currentCashback)}</span></div>}
              <div className="successSummary total"><span>Total Bayar</span><span>{formatPrice(total)}</span></div>
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>
                Metode: <strong>{selectedMethod.name}</strong>
              </div>
            </div>
            <div className="successFooter">
              <button className="successBtn" onClick={goToEtalase}>Lanjut ke Etalase</button>
            </div>
          </div>
        </div>

        {/* SIDEBAR PEMBAYARAN */}
        <div className={`paymentOverlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}>
          <div className="paymentSidebar" onClick={e => e.stopPropagation()}>
            <div className="sidebarHeader">
              <h3>Pilih Metode Pembayaran</h3>
              <button className="closeSidebar" onClick={() => setIsSidebarOpen(false)}>×</button>
            </div>
            <div className="sidebarSearch">
              <input type="text" className="searchInput" placeholder="Cari BCA, GoPay, dll..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="sidebarTabs">
              {['all', 'bank', 'ewallet', 'retail'].map(tab => (
                <button key={tab} className={`tabBtn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab === 'all' ? 'Semua' : tab === 'bank' ? 'Bank' : tab === 'ewallet' ? 'E-Wallet' : 'Retail'}
                </button>
              ))}
            </div>
            <div className="sidebarBody">
              <div className="promoNotice">
                <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Dapatkan cashback Rp50.000 dengan GoPay atau ShopeePay!
              </div>

              {filteredPayments.map((group, groupIndex) => (
                <React.Fragment key={group.title}>
                  <div className="paymentSection" dangerouslySetInnerHTML={{ __html: `${group.icon} ${group.title}` }} />
                  <div className="paymentGrid">
                    {group.items.map((method, i) => (
                      <div
                        key={method.id}
                        className="paymentOption visible"
                        onClick={() => selectPayment(method)}
                        style={{ animationDelay: `${groupIndex * 100 + i * 30}ms` }}
                      >
                        <div className="icon" style={{ background: method.color, color: method.text || 'white', fontSize: method.size || '0.85rem' }}>
                          {method.icon}
                        </div>
                        <span>{method.name}</span>
                        {method.cashback && <div className="cashbackBadge">Cashback</div>}
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;