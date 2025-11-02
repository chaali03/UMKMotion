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

  const convertToIDR = (priceText) => {
    if (!priceText) return null;
    const match = String(priceText).match(/[\d.,]+/);
    if (!match) return null;
    const usd = parseFloat(match[0].replace(",", ""));
    if (isNaN(usd) || usd <= 0) return null;
    const idr = usd * 16000;
    return "Rp " + idr.toLocaleString("id-ID");
  };

  const renderStars = (rating) => {
    if (!rating) return "N/A";
    const full = Math.round(Number(rating));
    return "★★★★★".substring(0, full) + "☆☆☆☆☆".substring(0, 5 - full);
  };

  const extractDiscount = (product) => {
    const priceStr = product.product_price;
    const originalPriceStr = product.product_original_price || product.product_price;
    if (priceStr && originalPriceStr && priceStr !== originalPriceStr) {
      const current = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
      const original = parseFloat(originalPriceStr.replace(/[^0-9.]/g, ""));
      if (original > current && current > 0) {
        const discount = Math.round(((original - current) / original) * 100);
        return `${discount}%`;
      }
    }
    return product.product_discount || "69%";
  };

  const generateBonusText = () => {
    const bonuses = [
      "Gratis Ongkir",
      "+Hadiah Gratis",
      "Cashback 10%",
      "Diskon Ekstra"
    ];
    return bonuses[Math.floor(Math.random() * bonuses.length)];
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setHasMore(true);
      try {
        const API_KEY = "393a29388emsh561d8e403683269p1e70d3jsnd26b2d32346f";
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

        const transformed = apiProducts
          .map(p => {
            const priceIDR = convertToIDR(p.product_price);
            if (!priceIDR) return null;

            return {
              product_title: p.product_title || "Produk Premium",
              product_photo: p.product_photo || "/asset/umkm/umkm1.jpg",
              product_price: priceIDR,
              product_original_price: p.product_original_price,
              product_star_rating: p.product_star_rating,
              product_num_ratings: p.product_num_ratings,
              seller_name: p.seller_name || "Toko Resmi",
              discount: extractDiscount(p),
              bonusText: generateBonusText(),
              asin: p.asin,
              product_url: p.product_url
            };
          })
          .filter(Boolean);

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
          padding: 12px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .product-list {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          justify-content: center;
        }

        .product-card {
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          border: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 320px;
        }

        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
          border-color: #e0e0e0;
        }

        /* === DISKON BADGE === */
        .discount-badge {
          position: absolute;
          top: 6px;
          left: 6px;
          background: linear-gradient(135deg, #ff3b3b, #ff5e3a);
          color: white;
          font-weight: 900;
          font-size: 0.70rem;
          padding: 4px 10px 4px 8px;
          border-radius: 6px 0 0 6px;
          z-index: 10;
          clip-path: polygon(
            0% 0%,
            85% 0%,
            92% 20%,
            100% 20%,
            92% 40%,
            100% 60%,
            92% 80%,
            100% 100%,
            85% 100%,
            0% 100%
          );
          box-shadow: 
            0 2px 8px rgba(255, 59, 59, 0.4),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 38px;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .product-card:hover .discount-badge {
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(255, 59, 59, 0.6);
        }

        /* === CART ICON === */
        .cart-icon-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(243, 54, 54, 0.95);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 11;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
          transition: all 0.25s ease;
        }

        .cart-icon-badge:hover {
          background: #d72c2c;
          transform: scale(1.15);
          box-shadow: 0 6px 16px rgba(215, 44, 44, 0.5);
        }

        .cart-icon-badge svg {
          width: 20px;
          height: 20px;
          stroke: white;
          stroke-width: 2.3;
        }

        /* GAMBAR */
        .product-image {
          width: 100%;
          height: 160px;
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
          transform: scale(1.04);
        }

        /* INFO */
        .product-info {
          padding: 6px 8px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-grow: 1;
          justify-content: space-between;
        }

        .product-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.22;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rating-sold {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.65rem;
          color: #525252;
          gap: 4px;
          margin: 1px 0 0;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #f59e0b;
          font-weight: 600;
        }

        .sold {
          color: #6b7280;
          font-size: 0.63rem;
        }

        .price-large {
          font-size: 0.98rem;
          font-weight: 800;
          color: #dc2626;
          margin: 1px 0 0;
        }

        .bonus-promo {
          font-size: 0.60rem;
          color: #d97706;
          font-weight: 600;
          background: #fff7ed;
          padding: 1px 4px;
          border-radius: 3px;
          border: 1px solid #fed7aa;
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          margin: 1px 0 0;
        }

        .store-name {
          font-size: 0.62rem;
          color: #10b981;
          font-weight: 600;
          margin: 1px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .store-name::before {
          content: "Checkmark ";
          font-weight: bold;
        }

        .action-buttons {
          margin: 4px 0 0;
        }

        .btn-buy {
          width: 100%;
          padding: 7px 8px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: #10b981;
          color: white;
        }

        .btn-buy:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .btn-icon {
          width: 15px;
          height: 15px;
        }

        .load-more-wrapper {
          text-align: center;
          margin: 28px 0 16px;
        }

        .load-more-btn {
          background: #f33636;
          color: white;
          border: none;
          padding: 10px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: 0.3s;
        }

        .load-more-btn:hover:not(:disabled) {
          background: #d72c2c;
          transform: translateY(-2px);
        }

        .load-more-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .product-list {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .product-image {
            height: 130px;
          }

          .product-info {
            padding: 5px 6px 6px;
            gap: 1px;
          }

          .product-title {
            font-size: 0.82rem;
            line-height: 1.2;
          }

          .price-large {
            font-size: 0.94rem;
          }

          .bonus-promo {
            font-size: 0.58rem;
            padding: 1px 3px;
          }

          .store-name {
            font-size: 0.60rem;
          }

          .rating-sold {
            font-size: 0.62rem;
            gap: 3px;
          }

          /* CART LEBIH BESAR DI MOBILE */
          .cart-icon-badge {
            width: 36px;
            height: 36px;
            top: 5px;
            right: 5px;
          }

          .cart-icon-badge svg {
            width: 18px;
            height: 18px;
          }

          .discount-badge {
            font-size: 0.66rem;
            padding: 3px 8px 3px 6px;
            top: 5px;
            left: 5px;
            min-width: 34px;
          }

          .action-buttons {
            margin: 3px 0 0;
          }

          .btn-buy {
            padding: 6px 7px;
            font-size: 0.74rem;
          }

          .product-card {
            min-height: 300px;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .product-list {
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
          .product-card {
            min-height: 310px;
          }
        }
      `}</style>

      <div className="product-container">
        {loading ? (
          <p style={{ textAlign: "center", color: "#666", margin: "28px 0", fontSize: "0.9rem" }}>
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
                const price = item.product_price;
                const rating = renderStars(item.product_star_rating);
                const sold = item.product_num_ratings ? `${(item.product_num_ratings / 1000).toFixed(1)}K terjual` : "N/A";
                const seller = item.seller_name;

                return (
                  <ProductCard
                    key={i}
                    image={item.product_photo}
                    shortTitle={shortTitle}
                    price={price}
                    rating={rating}
                    sold={sold}
                    seller={seller}
                    discount={item.discount}
                    bonusText={item.bonusText}
                    product={item}
                  />
                );
              })}
            </div>

            {hasMore && (
              <div className="load-more-wrapper">
                <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
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

function ProductCard({ image, shortTitle, price, rating, sold, seller, discount, bonusText, product }) {
  const handleCardClick = (e) => {
    if (e.target.closest(".btn-buy") || e.target.closest(".cart-icon-badge")) return;
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = "/buyingpage";
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(p => p.asin === product.asin);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Berhasil ditambahkan ke keranjang!");
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = "/buyingpage";
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="discount-badge">{discount}</div>
      <div className="cart-icon-badge" onClick={handleAddToCart} title="Tambah ke Keranjang">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>

      <div className="product-image">
        <img src={image} alt={shortTitle} loading="lazy" />
      </div>

      <div className="product-info">
        <div>
          <h3 className="product-title">{shortTitle}</h3>
          <div className="rating-sold">
            <div className="rating"><span>{rating}</span></div>
            <div className="sold">{sold}</div>
          </div>
          <div className="price-large">{price}</div>
          <p className="bonus-promo">{bonusText}</p>
          <p className="store-name" title={seller}>{seller}</p>
        </div>

        <div className="action-buttons">
          <button className="btn-buy" onClick={handleBuyNow}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" />
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            Beli
          </button>
        </div>
      </div>
    </div>
  );
}

export default FetchData;