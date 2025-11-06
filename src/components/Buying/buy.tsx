'use client';

import React, { useState, useEffect } from "react";

interface Product {
  product_title: string;
  product_photo: string;
  product_price: string;
  product_original_price?: string;
  product_star_rating?: string;
  product_num_ratings?: string;
  seller_name?: string;
  discount?: string;
  bonusText?: string;
  asin: string;
  product_url?: string;
  product_description?: string;
  bullet_points?: string[];
  product_photos?: string[];
  specifications?: Array<{ name: string; value: string }>;
  category?: string;
}

const fallback: Product = {
  product_title: "TrendPlain 160z/470ml Glass Oil Sprayer for Cooking – 2 in 1 Olive Oil Dispenser Bottle for Kitchen Gadgets and Air Fryer Accessories, Salad, BBQ - Black Global Recycled Standard",
  product_photo: "https://via.placeholder.com/600x800/2563eb/ffffff?text=Oil+Sprayer",
  product_price: "Rp 143.840",
  product_original_price: "Rp 299.000",
  product_star_rating: "5.0",
  product_num_ratings: "13",
  seller_name: "UMKMotion Official",
  discount: "52%",
  asin: "B0CJF94M8J",
  product_url: "#",
  product_description: "Ini adalah deskripsi produk yang sangat panjang...",
  bullet_points: [
    "Kapasitas 470ml, cukup untuk penggunaan sehari-hari",
    "2 in 1: spray & tuang langsung",
    "Bahan kaca borosilikat tahan panas",
    "Nozzle anti bocor & anti sumbat",
    "Mudah dibersihkan, aman untuk dishwasher",
    "Desain ergonomis, nyaman digenggam"
  ],
  product_photos: Array(12).fill(null).map((_, i) => `https://via.placeholder.com/600x800/10b981/ffffff?text=Img+${i + 1}`),
  specifications: [
    { name: "Bahan", value: "Kaca Borosilikat + Silikon Food Grade" },
    { name: "Kapasitas", value: "470ml / 16oz" },
    { name: "Berat", value: "380g" },
    { name: "Dimensi", value: "7 x 7 x 24 cm" },
    { name: "Warna", value: "Hitam Transparan" },
    { name: "Sertifikasi", value: "FDA, LFGB, Global Recycled Standard" }
  ],
  category: "Dapur"
};

export default function BuyingPage() {
  const [product, setProduct] = useState<Product>(fallback);
  const [quantity, setQuantity] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const MAX_THUMBS = 8;
  const THUMB_WIDTH_DESKTOP = 120;
  const THUMB_GAP = 8;
  const thumbItemWidthDesktop = THUMB_WIDTH_DESKTOP + THUMB_GAP;

  const [thumbStart, setThumbStart] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [currentThumbWidth, setCurrentThumbWidth] = useState(thumbItemWidthDesktop);

  const carouselImages = (product.product_photos || [product.product_photo]).slice(0, MAX_THUMBS);
  const hasMoreThanThumbs = (product.product_photos?.length || 0) > MAX_THUMBS;

  const [ratingData, setRatingData] = useState({
    average: 5.0,
    totalRatings: 13,
    totalReviews: 4,
    satisfaction: 100,
    distribution: { 5: 13, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<1 | 2 | 3 | 4 | 5, number>,
  });

  useEffect(() => {
    setIsClient(true);
    const updateThumbWidth = () => {
      setCurrentThumbWidth(window.innerWidth <= 768 ? 0 : thumbItemWidthDesktop);
    };
    updateThumbWidth();
    window.addEventListener('resize', updateThumbWidth);
    return () => window.removeEventListener('resize', updateThumbWidth);
  }, []);

  // === BACA REKOMENDASI ===
  useEffect(() => {
    const recs = localStorage.getItem("recommendedProducts");
    if (recs) {
      try {
        const parsed = JSON.parse(recs);
        setRecommendations(parsed);
      } catch (err) {
        console.error("Gagal parse rekomendasi:", err);
      }
    }
    setLoadingRecs(false);
  }, []);

  // === LOAD DETAIL PRODUK ===
  useEffect(() => {
    const loadProductDetail = async () => {
      if (typeof window === "undefined") return;

      const stored = localStorage.getItem("selectedProduct");
      if (!stored) {
        setLoadingDetail(false);
        return;
      }

      try {
        const localProduct = JSON.parse(stored);
        setProduct(localProduct);
        setLoadingDetail(false);
      } catch (err) {
        console.error("Gagal load produk:", err);
        setLoadingDetail(false);
      }
    };

    loadProductDetail();
  }, []);

  // === RENDER BINTANG ===
  const renderStars = (rating?: string) => {
    if (!rating) return "☆☆☆☆☆";
    const num = parseFloat(rating) || 0;
    const full = Math.floor(num);
    const half = num % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "★" : "") + "☆".repeat(empty);
  };

  // === HANDLE KLIK REKOMENDASI ===
  const handleRecommendationClick = (item: Product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(item));
    window.location.reload();
  };

  const stars = renderStars(product.product_star_rating);
  const discount = product.discount || "0%";

  const colors = [
    { name: "Black", hex: "#1a1a1a" },
    { name: "Gray", hex: "#d4d4d8" },
    { name: "Yellow", hex: "#fbbf24" },
    { name: "Purple", hex: "#c084fc" },
  ];

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((p: any) => p.asin === product.asin);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`Ditambahkan ke keranjang: ${quantity} item`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/checkoutpage";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth <= 768 || !isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe && activeSlide < carouselImages.length - 1) setActiveSlide(activeSlide + 1);
    if (isRightSwipe && activeSlide > 0) setActiveSlide(activeSlide - 1);
  };

  const goToSlide = (index: number) => {
    setActiveSlide(index);
    if (!isClient || window.innerWidth <= 768) return;

    const containerWidth = MAX_THUMBS * currentThumbWidth;
    const currentOffset = thumbStart * currentThumbWidth;
    const targetOffset = index * currentThumbWidth;

    if (targetOffset < currentOffset) {
      setThumbStart(Math.max(0, index));
    } else if (targetOffset + currentThumbWidth > currentOffset + containerWidth) {
      setThumbStart(Math.min(carouselImages.length - MAX_THUMBS, index - MAX_THUMBS + 1));
    }
  };

  const MAX_CHARS = 280;
  const fullDescription = product.product_description || "Deskripsi produk tidak tersedia.";
  const isLongDescription = fullDescription.length > MAX_CHARS;
  const shortDescription = isLongDescription ? fullDescription.slice(0, MAX_CHARS) + "..." : fullDescription;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background: #f5f5f5; color: #1a1a1a; line-height: 1.5; }

        .page-container { padding-top: 80px; padding-left: 16px; padding-right: 16px; min-height: 100vh; }
        @media (min-width: 769px) { .page-container { padding-left: 24px; padding-right: 24px; } }

        .product-card { max-width: 1200px; margin: 0 auto 32px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        @media (max-width: 768px) { .product-card { margin: 0 0 32px; border-radius: 0; box-shadow: none; } }

        .product-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 24px; 
          align-items: start;
        }
        @media (max-width: 768px) { 
          .product-grid { 
            grid-template-columns: 1fr; 
            gap: 0; 
          } 
        }

        .image-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .carousel-wrapper { 
          position: relative; 
          border-radius: 12px; 
          overflow: hidden; 
          background: white; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.05); 
          user-select: none; 
          cursor: zoom-in;
          width: 100%;
          height: 520px;
        }
        @media (max-width: 768px) {
          .carousel-wrapper { height: 400px; border-radius: 0; }
        }

        .carousel { 
          display: flex; 
          transition: transform 0.4s ease; 
          height: 100%;
        }

        .carousel-slide { 
          min-width: 100%; 
          position: relative; 
          overflow: hidden;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
        }

        .carousel-slide img { 
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          margin: auto;
          transition: transform 0.4s ease;
          display: block;
        }

        @media (min-width: 769px) { 
          .carousel-slide.zoomed img { 
            transform: scale(2);
          } 
        }

        .discount-badge { 
          position: absolute; 
          top: 12px; 
          right: 12px; 
          background: #10b981; 
          color: white; 
          font-weight: 700; 
          font-size: 12px; 
          padding: 4px 10px; 
          border-radius: 8px; 
          z-index: 10; 
        }

        .carousel-dots { 
          display: flex; 
          justify-content: center; 
          gap: 6px; 
          margin-top: 8px; 
        }

        .dot { 
          width: 8px; 
          height: 8px; 
          border-radius: 50%; 
          background: #ddd; 
          transition: 0.3s; 
          cursor: pointer; 
        }

        .dot.active { 
          background: #10b981; 
          transform: scale(1.2); 
        }

        .thumbnail-carousel-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 4px;
        }
        @media (max-width: 768px) {
          .thumbnail-carousel-container { display: none; }
        }

        .thumbnail-track-wrapper {
          flex: 1;
          overflow: hidden;
          border-radius: 8px;
        }

        .thumbnail-track {
          display: flex;
          gap: 8px;
          width: max-content;
          transition: transform 0.3s ease;
        }

        .thumb {
          width: 120px;
          height: 65px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          background: white;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .thumb:hover, .thumb.active {
          border-color: #10b981;
          transform: scale(1.05);
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .thumb-nav {
          width: 36px;
          height: 36px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          flex-shrink: 0;
          transition: all 0.2s ease;
          z-index: 10;
          font-size: 16px;
        }

        .thumb-nav:hover {
          background: #f0fdf4;
          border-color: #10b981;
          color: #166534;
        }

        .details-section { 
          padding: 16px;
          background: white;
          display: flex; 
          flex-direction: column; 
          gap: 14px; 
        }
        @media (min-width: 769px) {
          .details-section { padding: 0 24px 24px; }
        }

        .product-title { 
          font-size: 18px; 
          font-weight: 700; 
          line-height: 1.3; 
          color: #111; 
          display: -webkit-box; 
          -webkit-line-clamp: 3; 
          -webkit-box-orient: vertical; 
          overflow: hidden; 
          text-overflow: ellipsis; 
        }
        @media (min-width: 769px) { 
          .product-title { 
            font-size: 20px; 
            -webkit-line-clamp: 2; 
          } 
        }

        .rating-reviews { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          font-size: 13px; 
        }

        .stars { 
          color: #fbbf24; 
          font-size: 15px; 
        }

        .rating-text { 
          color: #666; 
          font-weight: 500; 
        }

        .price-section { 
          display: flex; 
          align-items: baseline; 
          gap: 8px; 
        }

        .current-price { 
          font-size: 24px; 
          font-weight: 800; 
          color: #dc2626; 
        }

        .original-price { 
          font-size: 15px; 
          color: #999; 
          text-decoration: line-through; 
        }

        .description { 
          font-size: 13px; 
          color: #444; 
          line-height: 1.6; 
          margin: 8px 0; 
        }

        .see-more { 
          color: #10b981; 
          font-weight: 600; 
          cursor: pointer; 
          font-size: 13px; 
          margin-top: 4px; 
          display: inline-block; 
        }

        .see-more:hover { 
          text-decoration: underline; 
        }

        .variant-section label { 
          font-size: 13px; 
          font-weight: 600; 
          color: #333; 
          margin-bottom: 6px; 
        }

        .color-options { 
          display: flex; 
          gap: 10px; 
        }

        .color-btn { 
          width: 28px; 
          height: 28px; 
          border-radius: 50%; 
          border: 2px solid transparent; 
          cursor: pointer; 
        }

        .color-btn.active, .color-btn:hover { 
          border-color: #10b981; 
        }

        .quantity-section { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          margin: 10px 0; 
        }

        .quantity-section button { 
          width: 32px; 
          height: 32px; 
          border: 1px solid #ddd; 
          background: #f9f9f9; 
          font-size: 16px; 
          font-weight: 600; 
          cursor: pointer; 
          border-radius: 6px; 
        }

        .quantity-section input { 
          width: 44px; 
          height: 32px; 
          text-align: center; 
          border: 1px solid #ddd; 
          border-radius: 6px; 
          font-weight: 600; 
        }

        .action-buttons-desktop { 
          display: flex; 
          gap: 10px; 
          margin: 12px 0; 
        }

        @media (max-width: 768px) { 
          .action-buttons-desktop { 
            display: none; 
          } 
        }

        .btn-buy, .btn-cart { 
          flex: 1; 
          padding: 12px; 
          border-radius: 10px; 
          font-weight: 600; 
          font-size: 14px; 
          cursor: pointer; 
          text-align: center; 
        }

        .btn-buy { 
          background: #166534; 
          color: white; 
          border: none; 
        }

        .btn-cart { 
          background: white; 
          color: #166534; 
          border: 2px solid #166534; 
        }

        .item-info { 
          font-size: 12px; 
          color: #666; 
          line-height: 1.5; 
        }

        .item-info strong { 
          color: #333; 
        }

        .detail-section { 
          margin-top: 16px; 
          padding: 16px; 
          background: #f9f9f9; 
          border-radius: 12px; 
          font-size: 13px; 
          line-height: 1.6; 
          color: #444; 
        }

        .detail-title { 
          font-weight: 600; 
          color: #1a1a1a; 
          margin-bottom: 10px; 
          font-size: 14px; 
        }

        .bullet-list { 
          padding-left: 18px; 
          margin: 8px 0; 
        }

        .bullet-list li { 
          margin: 5px 0; 
        }

        .spec-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 10px; 
        }

        .spec-table td { 
          padding: 7px 0; 
          border-bottom: 1px solid #eee; 
        }

        .spec-table td:first-child { 
          color: #666; 
          width: 40%; 
        }

        .spec-table td:last-child { 
          font-weight: 600; 
        }

        .rating-container { 
          max-width: 1200px; 
          background: white; 
          border-radius: 16px; 
          padding: 20px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
          animation: fadeIn 0.6s ease; 
          margin: 0 auto 40px;
        }

        @media (max-width: 768px) { 
          .rating-container { 
            padding: 16px; 
            border-radius: 12px; 
          } 
        }

        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        .section-title { 
          font-size: 18px; 
          font-weight: 700; 
          margin: 0 0 16px; 
          color: #1a1a1a; 
        }

        .rating-grid { 
          display: grid; 
          grid-template-columns: 1fr 2fr 1fr; 
          gap: 24px; 
          align-items: start; 
        }

        @media (max-width: 768px) { 
          .rating-grid { 
            grid-template-columns: 1fr; 
            gap: 16px; 
          } 
        }

        .big-rating { 
          font-size: 48px; 
          font-weight: 800; 
          color: #1a1a1a; 
          line-height: 1; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
        }

        .big-star { 
          color: #fbbf24; 
          font-size: 36px; 
        }

        .satisfaction { 
          background: #ecfdf5; 
          color: #166534; 
          padding: 6px 12px; 
          border-radius: 8px; 
          font-size: 13px; 
          font-weight: 600; 
          margin: 8px 0; 
          display: inline-block; 
        }

        .progress-row { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-size: 13px; 
          opacity: 0; 
          animation: slideIn 0.5s ease forwards; 
        }

        .progress-row:nth-child(1) { animation-delay: 0.1s; }
        .progress-row:nth-child(2) { animation-delay: 0.2s; }
        .progress-row:nth-child(3) { animation-delay: 0.3s; }
        .progress-row:nth-child(4) { animation-delay: 0.4s; }
        .progress-row:nth-child(5) { animation-delay: 0.5s; }

        @keyframes slideIn { 
          from { opacity: 0; transform: translateX(-10px); } 
          to { opacity: 1; transform: translateX(0); } 
        }

        .progress-bar-wrapper { 
          flex: 1; 
          height: 8px; 
          background: #e5e7eb; 
          border-radius: 4px; 
          overflow: hidden; 
        }

        .progress-bar { 
          height: 100%; 
          background: #10b981; 
          border-radius: 4px; 
          width: 0; 
        }

        .progress-bar.filled { 
          animation: fillProgress 1s ease forwards; 
        }

        @keyframes fillProgress { 
          from { width: 0; } 
          to { width: var(--width); } 
        }

        .action-bar { 
          position: fixed; 
          bottom: 0; 
          left: 0; 
          right: 0; 
          background: white; 
          padding: 10px 12px; 
          box-shadow: 0 -4px 12px rgba(0,0,0,0.1); 
          display: flex; 
          gap: 8px; 
          z-index: 1000; 
          border-top: 1px solid #eee; 
        }

        @media (min-width: 769px) { 
          .action-bar { 
            display: none; 
          } 
        }

        .recommendation-container {
          max-width: 1200px;
          margin: 0 auto 60px;
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .recommendation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .rec-card {
          border: 1px solid #eee;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
          background: #fff;
          cursor: pointer;
        }

        .rec-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          border-color: #10b981;
        }

        .rec-image {
          width: 100%;
          height: 160px;
          overflow: hidden;
          background: #f8f8f8;
        }

        .rec-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .rec-card:hover .rec-image img {
          transform: scale(1.05);
        }

        .rec-info {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rec-title {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rec-price {
          font-size: 15px;
          font-weight: 800;
          color: #dc2626;
        }

        .rec-rating {
          font-size: 12px;
          color: #f59e0b;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 768px) {
          .recommendation-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .rec-image { height: 130px; }
          .rec-info { padding: 10px; }
          .rec-title { font-size: 12px; }
          .rec-price { font-size: 14px; }
        }
      `}</style>

      <div className="page-container">
        {/* PRODUCT CARD */}
        <div className="product-card">
          <div className="product-grid">
            {/* IMAGE SECTION */}
            <div className="image-section">
              <div
                className="carousel-wrapper"
                onMouseEnter={() => window.innerWidth > 768 && setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="carousel" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                  {carouselImages.map((src, i) => (
                    <div key={i} className={`carousel-slide ${isZoomed ? "zoomed" : ""}`}>
                      <img
                        src={src}
                        alt={`${product.product_title} ${i + 1}`}
                        style={{
                          transform: isZoomed ? `scale(2)` : "scale(1)",
                          transformOrigin: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : "center",
                        }}
                      />
                      <div className="discount-badge">{discount} OFF</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="carousel-dots">
                {carouselImages.map((_, i) => (
                  <div key={i} className={`dot ${activeSlide === i ? "active" : ""}`} onClick={() => goToSlide(i)} />
                ))}
              </div>

              <div className="thumbnail-carousel-container">
                {hasMoreThanThumbs && thumbStart > 0 && (
                  <button className="thumb-nav thumb-nav-left" onClick={() => setThumbStart(Math.max(0, thumbStart - 1))}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                )}
                <div className="thumbnail-track-wrapper">
                  <div
                    className="thumbnail-track"
                    style={{ transform: `translateX(-${thumbStart * currentThumbWidth}px)` }}
                  >
                    {carouselImages.map((src, index) => (
                      <div
                        key={index}
                        className={`thumb ${activeSlide === index ? "active" : ""}`}
                        onClick={() => goToSlide(index)}
                      >
                        <img src={src} alt={`Thumb ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
                {hasMoreThanThumbs && thumbStart < carouselImages.length - MAX_THUMBS && (
                  <button className="thumb-nav thumb-nav-right" onClick={() => setThumbStart(Math.min(carouselImages.length - MAX_THUMBS, thumbStart + 1))}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* DETAIL SECTION */}
            <div className="details-section">
              <h1 className="product-title">{product.product_title}</h1>
              <div className="rating-reviews">
                <div className="stars">{stars}</div>
                <span className="rating-text">{product.product_star_rating} ({product.product_num_ratings} Reviews)</span>
              </div>
              <div className="price-section">
                <div className="current-price">{product.product_price}</div>
                {product.product_original_price && <div className="original-price">{product.product_original_price}</div>}
              </div>

              <div className="description">
                {showFullDetail ? fullDescription : shortDescription}
                {isLongDescription && !showFullDetail && (
                  <span className="see-more" onClick={() => setShowFullDetail(true)}>
                    Lihat lebih banyak
                  </span>
                )}
                {showFullDetail && (
                  <span className="see-more" onClick={() => setShowFullDetail(false)}>
                    Sembunyikan
                  </span>
                )}
              </div>

              <div className="variant-section">
                <label>Color Available</label>
                <div className="color-options">
                  {colors.map((color, i) => (
                    <button
                      key={i}
                      className={`color-btn ${activeColor === i ? "active" : ""}`}
                      style={{ background: color.hex }}
                      title={color.name}
                      onClick={() => setActiveColor(i)}
                    />
                  ))}
                </div>
              </div>

              <div className="quantity-section">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <div className="action-buttons-desktop">
                <button className="btn-buy" onClick={handleBuyNow}>Beli</button>
                <button className="btn-cart" onClick={handleAddToCart}>Tambahkan Keranjang</button>
              </div>

              <div className="item-info">
                <div><strong>Item Code:</strong> {product.asin}</div>
                <div><strong>Tags:</strong> Kitchen, Oil Sprayer, Cooking Gadget</div>
              </div>

              {(product.bullet_points || product.specifications) && (
                <div className="detail-section">
                  <div className="detail-title">Detail Produk</div>
                  
                  {product.bullet_points && product.bullet_points.length > 0 && (
                    <ul className="bullet-list">
                      {product.bullet_points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  )}

                  {product.specifications && product.specifications.length > 0 && (
                    <table className="spec-table">
                      <tbody>
                        {product.specifications.map((spec, i) => (
                          <tr key={i}>
                            <td>{spec.name}</td>
                            <td>{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RATING & REVIEW */}
        <div className="rating-container">
          <h2 className="section-title">ULASAN PEMBELI</h2>
          <div className="rating-grid">
            <div className="rating-main">
              <div className="big-rating">
                <span className="big-star">★</span>
                {ratingData.average.toFixed(1)} / 5.0
              </div>
              <div className="satisfaction">
                {ratingData.satisfaction}% pembeli merasa puas
              </div>
              <div className="rating-meta">
                {ratingData.totalRatings} rating • {ratingData.totalReviews} ulasan
              </div>
            </div>

            <div className="progress-section">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingData.distribution[star as keyof typeof ratingData.distribution];
                const total = ratingData.totalRatings || 1;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={star} className="progress-row">
                    <span className="star-label">{star}</span>
                    <div className="progress-bar-wrapper">
                      <div
                        className="progress-bar filled"
                        style={{ "--width": `${percentage}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="count-section">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingData.distribution[star as keyof typeof ratingData.distribution];
                return (
                  <div key={star} className="count-row">
                    <span><span className="count-star">★</span> {star}</span>
                    <span className="count-value">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* REKOMENDASI DARI KATEGORI LAIN */}
        {!loadingRecs && (
          <div className="recommendation-container">
            <h2 className="section-title">
              {recommendations.length > 0 ? "KAMU MUNGKIN SUKA (DARI KATEGORI LAIN)" : "BELUM ADA REKOMENDASI"}
            </h2>

            {recommendations.length > 0 ? (
              <div className="recommendation-grid">
                {recommendations.map((item, i) => {
                  const shortTitle = item.product_title.length > 50 
                    ? item.product_title.slice(0, 47) + "..." 
                    : item.product_title;

                  return (
                    <div
                      key={i}
                      className="rec-card"
                      onClick={() => handleRecommendationClick(item)}
                    >
                      <div className="rec-image">
                        <img 
                          src={item.product_photo || "/asset/umkm/umkm1.jpg"} 
                          alt={shortTitle} 
                          loading="lazy" 
                        />
                      </div>
                      <div className="rec-info">
                        <h3 className="rec-title">{shortTitle}</h3>
                        <div className="rec-price">{item.product_price || "Rp -"}</div>
                        <div className="rec-rating">
                          ★ {renderStars(item.product_star_rating)} ({item.product_num_ratings || 0})
                        </div>
                        <div style={{ fontSize: "11px", color: "#10b981", fontWeight: "600", marginTop: "2px" }}>
                          {item.category || "Lainnya"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#666", fontSize: "14px", padding: "20px 0" }}>
                Belum ada rekomendasi. Coba klik produk lain.
              </p>
            )}
          </div>
        )}
      </div>

      {/* MOBILE ACTION BAR */}
      <div className="action-bar">
        <button className="btn-buy" onClick={handleBuyNow}>Beli Langsung</button>
        <button className="btn-cart" onClick={handleAddToCart}>+ Keranjang</button>
      </div>
    </>
  );
}