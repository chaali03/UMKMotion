import React, { useEffect, useState } from "react";

function FetchData() {
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PRODUCTS_PER_PAGE = 15;

  // === Listen to Kategori & Search ===
  useEffect(() => {
    const handleCategoryChange = (e) => {
      setCategory(e.detail);
      setDisplayedProducts([]);
      setAllProducts([]);
    };
    const handleSearchChange = (e) => {
      setSearchQuery(e.detail);
      setDisplayedProducts([]);
      setAllProducts([]);
    };

    window.addEventListener("categoryChange", handleCategoryChange);
    window.addEventListener("searchChange", handleSearchChange);

    return () => {
      window.removeEventListener("categoryChange", handleCategoryChange);
      window.removeEventListener("searchChange", handleSearchChange);
    };
  }, []);

  // === Convert USD to IDR ===
  const convertToIDR = (priceText) => {
    if (!priceText) return "Harga tidak tersedia";
    const match = String(priceText).match(/[\d.,]+/);
    if (!match) return priceText;
    const usd = parseFloat(match[0].replace(",", ""));
    const idr = usd * 16000;
    return "Rp " + idr.toLocaleString("id-ID");
  };

  // === Render Stars ===
  const renderStars = (rating) => {
    if (!rating) return "N/A";
    const full = Math.round(Number(rating));
    return "★★★★★".substring(0, full) + "☆☆☆☆☆".substring(0, 5 - full);
  };

  // === Extract Discount ===
  const extractDiscount = (product) => {
    const priceStr = product.product_price;
    const originalPriceStr = product.product_original_price || product.product_price;
    if (priceStr && originalPriceStr && priceStr !== originalPriceStr) {
      const current = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
      const original = parseFloat(originalPriceStr.replace(/[^0-9.]/g, ""));
      if (original > current) {
        const discount = Math.round(((original - current) / original) * 100);
        return `${discount}%`;
      }
    }
    return product.product_discount || "55%";
  };

  // === Generate Bonus Text ===
  const generateBonusText = () => {
    const bonuses = [
      "Hemat s.d 15% Pakai Bonus",
      "Gratis Ongkir + Bonus",
      "Cashback 10% Pakai Bonus",
      "Diskon Ekstra Pakai Bonus"
    ];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
  };

  // === Fetch dari API Amazon ===
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setHasMore(true);
      try {
        const API_KEY = "986c36be1amsh402e5c0d7ab578bp138232jsn0d1fb915784b";
        const HOST = "real-time-amazon-data.p.rapidapi.com";

        let query = "";
        if (searchQuery) {
          query = searchQuery;
        } else if (category && category !== "all") {
          const map = {
            all: "best sellers",
            food: "grocery",
            services: "services",
            fashion: "clothing",
            craft: "handmade",
            beauty: "beauty",
            agriculture: "garden",
            electronics: "electronics",
            furniture: "furniture",
            others: "miscellaneous"
          };
          query = map[category] || "best sellers";
        } else {
          query = "best sellers";
        }

        const url = `https://${HOST}/search?query=${encodeURIComponent(query)}&page=1&country=US&sort_by=RELEVANCE`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": HOST,
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const result = await res.json();
        const apiProducts = result.data?.products || [];

        const transformed = apiProducts.map(p => ({
          product_title: p.product_title || "Produk Premium",
          product_photo: p.product_photo || "/asset/umkm/umkm1.jpg",
          product_price: p.product_price,
          product_original_price: p.product_original_price,
          product_star_rating: p.product_star_rating,
          product_num_ratings: p.product_num_ratings,
          seller_name: p.seller_name || "Toko Resmi",
          discount: extractDiscount(p),
          bonusText: generateBonusText()
        }));

        setAllProducts(transformed);
        setDisplayedProducts(transformed.slice(0, PRODUCTS_PER_PAGE));
        setHasMore(transformed.length > PRODUCTS_PER_PAGE);
      } catch (err) {
        console.error("Gagal fetch:", err);
        setAllProducts([]);
        setDisplayedProducts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [category, searchQuery]);

  // === Load More ===
  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const currentLength = displayedProducts.length;
    const moreProducts = allProducts.slice(currentLength, currentLength + PRODUCTS_PER_PAGE);

    setTimeout(() => {
      setDisplayedProducts(prev => [...prev, ...moreProducts]);
      setHasMore(currentLength + moreProducts.length < allProducts.length);
      setLoadingMore(false);
    }, 400);
  };

  return (
    <>
      <style jsx>{`
        .product-container {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f9f9f9;
          padding: 16px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .product-list {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          justify-content: center;
        }

        .product-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.25s ease;
          cursor: pointer;
          position: relative;
          border: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          border-color: #e5e5e5;
        }

        .discount-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #ef4444;
          color: white;
          font-weight: 800;
          font-size: 0.7rem;
          padding: 3px 8px;
          border-radius: 16px;
          z-index: 10;
          box-shadow: 0 1px 4px rgba(239, 68, 68, 0.3);
        }

        .product-image {
          width: 100%;
          height: 120px;
          background: #f8f8f8;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .product-info {
          padding: 10px 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .product-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-title.expanded {
          display: block;
          -webkit-line-clamp: unset;
          white-space: normal;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: #2563eb;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-top: 2px;
        }

        .toggle-btn:hover {
          text-decoration: underline;
        }

        .rating-sold {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          color: #525252;
          margin: 4px 0 6px 0;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #f59e0b;
          font-weight: 600;
        }

        .sold {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .price-large {
          font-size: 1.05rem;
          font-weight: 800;
          color: #dc2626;
          margin: 0;
        }

        .bonus-promo {
          font-size: 0.72rem;
          color: #dc2626;
          font-weight: 600;
          margin: 4px 0 6px 0;
          background: #fef2f2;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
          border: 1px dashed #fca5a5;
        }

        .store-name {
          font-size: 0.74rem;
          color: #10b981;
          font-weight: 600;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .store-name::before {
          content: "Checkmark ";
          font-weight: bold;
        }

        /* Load More Button */
        .load-more-wrapper {
          text-align: center;
          margin: 32px 0 20px;
        }

        .load-more-btn {
          background: #f33636;
          color: white;
          border: none;
          padding: 12px 36px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 4px 12px rgba(243, 54, 54, 0.2);
        }

        .load-more-btn:hover:not(:disabled) {
          background: #d72c2c;
          transform: translateY(-2px);
        }

        .load-more-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        /* Mobile: 2 kolom */
        @media (max-width: 768px) {
          .product-list {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .product-image {
            height: 100px;
          }
          .product-info {
            padding: 8px;
          }
          .price-large {
            font-size: 0.98rem;
          }
        }

        /* Tablet: 4 kolom */
        @media (min-width: 769px) and (max-width: 1024px) {
          .product-list {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>

      <div className="product-container">
        {loading ? (
          <p style={{ textAlign: "center", color: "#666", margin: "32px 0", fontSize: "0.95rem" }}>
            Loading produk...
          </p>
        ) : displayedProducts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>Tidak ada produk ditemukan.</p>
        ) : (
          <>
            <div className="product-list">
              {displayedProducts.map((item, i) => {
                const fullTitle = item.product_title;
                const shortTitle = fullTitle.length > 60 ? fullTitle.slice(0, 57) + "..." : fullTitle;
                const price = convertToIDR(item.product_price);
                const rating = renderStars(item.product_star_rating);
                const sold = item.product_num_ratings ? `${item.product_num_ratings}+ terjual` : "";
                const seller = item.seller_name;

                return (
                  <ProductCard
                    key={i}
                    image={item.product_photo}
                    fullTitle={fullTitle}
                    shortTitle={shortTitle}
                    price={price}
                    rating={rating}
                    sold={sold}
                    seller={seller}
                    discount={item.discount}
                    bonusText={item.bonusText}
                  />
                );
              })}
            </div>

            {hasMore && (
              <div className="load-more-wrapper">
                <button
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Memuat..." : "Lihat Produk Lainnya"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function ProductCard({ image, fullTitle, shortTitle, price, rating, sold, seller, discount, bonusText }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="product-card">
      <div className="discount-badge">{discount}</div>
      <div className="product-image">
        <img src={image} alt={fullTitle} loading="lazy" />
      </div>
      <div className="product-info">
        <h3 className={`product-title ${expanded ? "expanded" : ""}`}>
          {expanded ? fullTitle : shortTitle}
        </h3>
        {fullTitle.length > 60 && (
          <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Sembunyikan" : "Lihat lebih"}
          </button>
        )}
        <div className="rating-sold">
          <div className="rating">
            <span>{rating}</span>
          </div>
          <div className="sold">{sold}</div>
        </div>
        <div className="price-large">{price}</div>
        <p className="bonus-promo">{bonusText}</p>
        <p className="store-name" title={seller}>{seller}</p>
      </div>
    </div>
  );
}

export default FetchData;