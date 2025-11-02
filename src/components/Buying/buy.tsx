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
  asin: string;
  product_url?: string;
}

const fallback: Product = {
  product_title: "TrendPlain 160z/470ml Glass Oil Sprayer for Cooking – 2 in 1 Olive Oil Dispenser Bottle for Kitchen Gadgets and Air Fryer Accessories, Salad, BBQ - Black Global Recycled Standard",
  product_photo: "https://via.placeholder.com/600x800/2563eb/ffffff?text=Oil+Sprayer",
  product_price: "Rp 143.840",
  product_original_price: "Rp 299.000",
  product_star_rating: "5.0",
  product_num_ratings: "2",
  seller_name: "UMKMotion Official",
  discount: "52%",
  asin: "B0CJF94M8J",
  product_url: "#",
};

export default function BuyingPage() {
  const [product, setProduct] = useState<Product>(fallback);
  const [quantity, setQuantity] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // === RATING DATA – TYPE FIX ===
  const [ratingData] = useState<{
    average: number;
    totalRatings: number;
    totalReviews: number;
    satisfaction: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  }>({
    average: 5.0,
    totalRatings: 2,
    totalReviews: 0,
    satisfaction: 100,
    distribution: { 5: 2, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedProduct");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProduct(parsed);
        } catch (err) {
          console.error("Gagal parse produk:", err);
        }
      }
    }
  }, []);

  const renderStars = (rating?: string) => {
    if (!rating) return "☆☆☆☆☆";
    const num = parseFloat(rating) || 0;
    const full = Math.floor(num);
    const half = num % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "★" : "") + "☆".repeat(empty);
  };

  const stars = renderStars(product.product_star_rating);
  const discount = product.discount || "0%";

  const carouselImages = [product.product_photo, product.product_photo, product.product_photo];

  const colors = [
    { name: "Black", hex: "#1a1a1a" },
    { name: "Gray", hex: "#d4d4d8" },
    { name: "Yellow", hex: "#fbbf24" },
    { name: "Purple", hex: "#c084fc" },
  ];

  const tabs = [
    { id: "description", label: "Product Description" },
    { id: "specs", label: "Specifications" },
    { id: "reviews", label: "Customer Reviews" },
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
    window.location.href = "/checkout";
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

  const goToSlide = (index: number) => setActiveSlide(index);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background: #f5f5f5; color: #1a1a1a; line-height: 1.5; }

        .page-container { padding-top: 80px; padding-left: 16px; padding-right: 16px; min-height: 100vh; }
        @media (min-width: 769px) { .page-container { padding-left: 24px; padding-right: 24px; } }

        .product-card { max-width: 1200px; margin: 0 auto 32px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 16px; }
        @media (max-width: 768px) { .product-card { margin: 0 0 32px; padding: 12px; border-radius: 12px; } }

        .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .product-grid { grid-template-columns: 1fr; gap: 14px; } }

        .carousel-wrapper { position: relative; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); user-select: none; cursor: zoom-in; }
        .carousel { display: flex; transition: transform 0.4s ease; }
        .carousel-slide { min-width: 100%; position: relative; overflow: hidden; }
        .carousel-slide img { width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: contain; background: white; transition: transform 0.4s ease; }
        @media (min-width: 769px) { .carousel-slide.zoomed img { transform: scale(2); } }

        .discount-badge { position: absolute; top: 8px; right: 8px; background: #10b981; color: white; font-weight: 700; font-size: 11px; padding: 3px 8px; border-radius: 6px; z-index: 10; }

        .carousel-dots { display: flex; justify-content: center; gap: 6px; margin-top: 8px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #ddd; transition: 0.3s; cursor: pointer; }
        .dot.active { background: #10b981; transform: scale(1.2); }

        .thumbnails-desktop { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 8px; }
        @media (max-width: 768px) { .thumbnails-desktop { display: none; } }
        .thumb { height: 50px; border: 2px solid #e5e7eb; border-radius: 6px; overflow: hidden; cursor: pointer; background: white; }
        .thumb:hover, .thumb.active { border-color: #10b981; transform: scale(1.05); }
        .thumb img { width: 100%; height: 100%; object-fit: contain; }

        .details-section { display: flex; flex-direction: column; gap: 10px; padding: 0 4px; }
        .product-title { font-size: 17px; font-weight: 700; line-height: 1.3; color: #111; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }
        @media (min-width: 769px) { .product-title { font-size: 20px; -webkit-line-clamp: 2; } }

        .rating-reviews { display: flex; align-items: center; gap: 6px; font-size: 12px; }
        .stars { color: #fbbf24; font-size: 14px; }
        .rating-text { color: #666; font-weight: 500; }

        .price-section { display: flex; align-items: baseline; gap: 6px; }
        .current-price { font-size: 22px; font-weight: 800; color: #dc2626; }
        .original-price { font-size: 14px; color: #999; text-decoration: line-through; }

        .description { font-size: 12.5px; color: #444; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }

        .variant-section label { font-size: 12px; font-weight: 600; color: #333; margin-bottom: 4px; }
        .color-options { display: flex; gap: 8px; }
        .color-btn { width: 26px; height: 26px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
        .color-btn.active, .color-btn:hover { border-color: #10b981; }

        .quantity-section { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
        .quantity-section button { width: 30px; height: 30px; border: 1px solid #ddd; background: #f9f9f9; font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 6px; }
        .quantity-section input { width: 40px; height: 30px; text-align: center; border: 1px solid #ddd; border-radius: 6px; font-weight: 600; }

        .action-buttons-desktop { display: flex; gap: 8px; margin: 10px 0; }
        @media (max-width: 768px) { .action-buttons-desktop { display: none; } }
        .btn-buy, .btn-cart { flex: 1; padding: 10px; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; text-align: center; }
        .btn-buy { background: #166534; color: white; border: none; }
        .btn-cart { background: white; color: #166534; border: 2px solid #166534; }
        .btn-wishlist { width: 38px; height: 38px; border: 2px solid #ddd; background: white; border-radius: 10px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

        .action-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 10px 12px; box-shadow: 0 -4px 12px rgba(0,0,0,0.1); display: flex; gap: 8px; z-index: 1000; border-top: 1px solid #eee; }
        @media (min-width: 769px) { .action-bar { display: none; } }

        .item-info { font-size: 11.5px; color: #666; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .item-info strong { color: #333; }

        .tabs { display: flex; gap: 4px; border-bottom: 1px solid #eee; margin: 12px 0 8px; overflow-x: auto; scrollbar-width: none; }
        .tabs::-webkit-scrollbar { display: none; }
        .tab { padding: 6px 10px; background: none; border: none; font-weight: 600; font-size: 11.5px; color: #666; cursor: pointer; white-space: nowrap; border-bottom: 2px solid transparent; }
        .tab.active { color: #111; border-bottom-color: #10b981; }

        .tab-content { font-size: 12.5px; color: #444; line-height: 1.5; padding-bottom: 8px; }

        /* === RATING SECTION – 3 KOLOM GRID (TOKOPEDIA STYLE) === */
        .rating-container {
          max-width: 1200px;
          margin: 0 auto 100px;
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          font-family: 'Inter', sans-serif;
          animation: fadeIn 0.6s ease;
        }
        @media (max-width: 768px) {
          .rating-container { margin: 0 0 100px; padding: 16px; border-radius: 12px; }
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .rating-grid {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .rating-grid { grid-template-columns: 1fr; gap: 16px; }
        }

        .rating-main { text-align: left; }
        .big-rating {
          font-size: 48px;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .big-star { color: #fbbf24; font-size: 36px; }
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
        .rating-meta { font-size: 14px; color: #666; }

        .progress-section { display: flex; flex-direction: column; gap: 10px; }
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

        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

        .star-label { width: 20px; text-align: right; color: #666; font-weight: 500; }
        .progress-bar-wrapper { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .progress-bar { height: 100%; background: #10b981; border-radius: 4px; width: 0; }
        .progress-bar.filled { animation: fillProgress 1s ease forwards; }
        @keyframes fillProgress { from { width: 0; } to { width: var(--width); } }

        .count-section { display: flex; flex-direction: column; gap: 10px; font-size: 13px; color: #666; }
        .count-row { display: flex; justify-content: space-between; opacity: 0; animation: slideIn 0.5s ease forwards; }
        .count-row:nth-child(1) { animation-delay: 0.1s; }
        .count-row:nth-child(2) { animation-delay: 0.2s; }
        .count-row:nth-child(3) { animation-delay: 0.3s; }
        .count-row:nth-child(4) { animation-delay: 0.4s; }
        .count-row:nth-child(5) { animation-delay: 0.5s; }

        .count-star { color: #fbbf24; font-size: 12px; }
        .count-value { font-weight: 600; color: #444; }
      `}</style>

      <div className="page-container">
        {/* PRODUCT CARD */}
        <div className="product-card">
          <div className="product-grid">
            {/* CAROUSEL */}
            <div>
              <div className="carousel-wrapper" onMouseEnter={() => window.innerWidth > 768 && setIsZoomed(true)} onMouseLeave={() => setIsZoomed(false)} onMouseMove={handleMouseMove} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <div className="carousel" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                  {carouselImages.map((src, i) => (
                    <div key={i} className={`carousel-slide ${isZoomed ? 'zoomed' : ''}`}>
                      <img src={src} alt={`${product.product_title} ${i + 1}`} style={{ transform: isZoomed ? `scale(2)` : 'scale(1)', transformOrigin: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : 'center' }} />
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
              <div className="thumbnails-desktop">
                {carouselImages.map((src, i) => (
                  <div key={i} className={`thumb ${activeSlide === i ? "active" : ""}`} onClick={() => goToSlide(i)}>
                    <img src={src} alt={`Thumb ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* DETAILS */}
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

              <p className="description">
                This gaming chair is designed to provide exceptional comfort during extended sessions...
              </p>

              <div className="variant-section">
                <label>Color Available</label>
                <div className="color-options">
                  {colors.map((color, i) => (
                    <button key={i} className={`color-btn ${activeColor === i ? "active" : ""}`} style={{ background: color.hex }} title={color.name} onClick={() => setActiveColor(i)} />
                  ))}
                </div>
              </div>

              <div className="quantity-section">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <div className="action-buttons-desktop">
                <button className="btn-buy" onClick={handleBuyNow}>Buy Now</button>
                <button className="btn-cart" onClick={handleAddToCart}>Add To Cart</button>
              </div>

              <div className="item-info">
                <div><strong>Item Code:</strong> {product.asin}</div>
                <div><strong>Tags:</strong> Furniture, Office, Gaming Chair, Chair</div>
              </div>

              <div className="tabs">
                {tabs.map((tab) => (
                  <button key={tab.id} className={`tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {activeTab === "description" && <p>This gaming chair is designed to provide exceptional comfort...</p>}
                {activeTab === "specs" && <p>Spesifikasi: Tinggi adjustable, bahan kulit premium...</p>}
                {activeTab === "reviews" && <p>{product.product_num_ratings} ulasan | {product.product_star_rating} stars</p>}
              </div>
            </div>
          </div>
        </div>

        {/* === RATING SECTION – 3 KOLOM GRID (FIXED) === */}
        <div className="rating-container">
          <div className="rating-grid">
            {/* KOLOM 1: RATING UTAMA */}
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

            {/* KOLOM 2: PROGRESS BAR */}
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

            {/* KOLOM 3: JUMLAH PER BINTANG */}
            <div className="count-section">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingData.distribution[star as keyof typeof ratingData.distribution];
                return (
                  <div key={star} className="count-row">
                    <span>
                      <span className="count-star">★</span> {star}
                    </span>
                    <span className="count-value">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE ACTION BAR */}
      <div className="action-bar">
        <button className="btn-buy" onClick={handleBuyNow}>Buy Now</button>
        <button className="btn-cart" onClick={handleAddToCart}>Add To Cart</button>
        <button className="btn-wishlist">Heart</button>
      </div>
    </>
  );
}