import React, { useEffect, useState } from "react";

// === Dummy Data ===
const dummyProducts = {
  electronics: [
    {
      product_title: "Wireless Bluetooth Headphones Noise Cancelling Foldable",
      product_photo: "https://m.media-amazon.com/images/I/61+q06wrxFL._AC_SL1500_.jpg",
      product_price: "$25.99",
      product_star_rating: "4.5",
      product_num_ratings: "2300",
      seller_name: "TechZone Official"
    },
    {
      product_title: "Smartwatch AMOLED Fitness Tracker Waterproof Heart Monitor",
      product_photo: "https://m.media-amazon.com/images/I/61ZfW1X0yXL._AC_SL1500_.jpg",
      product_price: "$49.99",
      product_star_rating: "4.2",
      product_num_ratings: "480",
      seller_name: "FitSmart"
    }
  ],
  food: [
    {
      product_title: "Keripik Pisang Coklat Premium Rasa Lokal 250gr",
      product_photo: "https://m.media-amazon.com/images/I/71Ew9oxLrUL._AC_SL1500_.jpg",
      product_price: "$4.50",
      product_star_rating: "4.8",
      product_num_ratings: "150",
      seller_name: "UMKM Snackindo"
    },
    {
      product_title: "Kopi Arabika Gayo Original Fresh Roast 500gr",
      product_photo: "https://m.media-amazon.com/images/I/71KJgMow9WL._AC_SL1500_.jpg",
      product_price: "$8.99",
      product_star_rating: "4.9",
      product_num_ratings: "320",
      seller_name: "Kopi Nusantara"
    }
  ],
  fashion: [
    {
      product_title: "T-Shirt Oversized Cotton Premium Lokal Brand",
      product_photo: "https://m.media-amazon.com/images/I/61pR5DgqUFL._AC_SL1500_.jpg",
      product_price: "$15.00",
      product_star_rating: "4.4",
      product_num_ratings: "900",
      seller_name: "StreetWearID"
    }
  ],
  music: [
    {
      product_title: "Gitar Akustik Kayu Mahoni + Senar Cadangan",
      product_photo: "https://m.media-amazon.com/images/I/71eRk5VQ8EL._AC_SL1500_.jpg",
      product_price: "$59.99",
      product_star_rating: "4.7",
      product_num_ratings: "270",
      seller_name: "Melodia Music"
    }
  ]
};

// === Helper Functions ===
function convertToIDR(priceText) {
  if (!priceText) return "Harga tidak tersedia";
  const match = priceText.match(/[\d.,]+/);
  if (!match) return priceText;
  const usd = parseFloat(match[0].replace(",", ""));
  const idr = usd * 16000;
  return "Rp " + idr.toLocaleString("id-ID");
}

function renderStars(rating) {
  if (!rating) return "⭐ N/A";
  const full = Math.round(Number(rating));
  return "⭐".repeat(full) + "☆".repeat(5 - full);
}

// === Main Component ===
export default function FetchData() {
  const [category, setCategory] = useState("electronics");
  const [products, setProducts] = useState(dummyProducts["electronics"]);

  useEffect(() => {
    setProducts(dummyProducts[category] || []);
  }, [category]);

  return (
    <div>
      {/* Category Buttons */}
      <div className="category-section">
        {["electronics", "food", "fashion", "music"].map((cat) => (
          <button
            key={cat}
            className={`category-buttons ${category === cat ? "active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat === "electronics" && "Elektronik"}
            {cat === "food" && "Kuliner"}
            {cat === "fashion" && "Fashion"}
            {cat === "music" && "Musik"}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="product-list">
        {products.length === 0 ? (
          <span>Tidak ada produk ditemukan.</span>
        ) : (
          products.map((item, i) => (
            <ProductCard key={i} item={item} />
          ))
        )}
      </div>

      {/* CSS */}
      <style>{`
        body {
          font-family: "Inter", sans-serif;
        }
        .category-section {
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .category-buttons {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid #eee;
          background: #fff;
          cursor: pointer;
        }
        .category-buttons.active {
          background: #007bff;
          color: white;
        }

        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 20px;
          padding: 10px;
          justify-content: center;
        }
        .product-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          max-width: 240px;
          cursor: pointer;
          transition: 0.3s;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
        }
        .product-image {
          width: 100%;
          aspect-ratio: 1.5/1;
          background: #f3f3f3;
          overflow: hidden;
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .product-info {
          padding: 12px 14px 16px;
        }
        .product-title {
          font-size: 0.95rem;
          color: #222;
          font-weight: 600;
          margin-bottom: 6px;
          line-height: 1.3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          text-overflow: ellipsis;
          min-height: 2.6em;
          transition: max-height 0.18s ease;
        }
        .product-title.expanded {
          overflow: visible;
          display: block;
          -webkit-box-orient: unset;
          text-overflow: unset;
          white-space: normal;
          min-height: 0;
        }
        .toggle-title-btn {
          background: none;
          border: none;
          color: #007bff;
          font-size: 0.85rem;
          cursor: pointer;
          margin: 4px 0 8px 0;
          padding: 0;
          display: inline-block;
        }
        .toggle-title-btn:hover {
          text-decoration: underline;
        }
        .price {
          display: inline-block;
          background: #ffeaea;
          color: #f33636;
          font-weight: 700;
          padding: 3px 6px;
          border-radius: 6px;
        }
        .rating-section {
          margin-top: 6px;
          font-size: 0.85rem;
          color: #555;
        }
        .store-name {
          color: #888;
          font-size: 0.85rem;
          margin-top: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 600px) {
          .product-list {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .product-card {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// === Sub-component: Product Card ===
function ProductCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const fullTitle = item.product_title;
  const shortTitle =
    fullTitle.length > 70 ? fullTitle.slice(0, 67) + "..." : fullTitle;

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={item.product_photo} alt={fullTitle} loading="lazy" />
      </div>
      <div className="product-info">
        <h3 className={`product-title ${expanded ? "expanded" : ""}`}>
          {expanded ? fullTitle : shortTitle}
        </h3>
        {fullTitle.length > 70 && (
          <button
            className="toggle-title-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Lihat lebih sedikit" : "Lihat lebih"}
          </button>
        )}
        <div className="price-section">
          <span className="price">{convertToIDR(item.product_price)}</span>
        </div>
        <div className="rating-section">
          <span className="stars">{renderStars(item.product_star_rating)}</span>{" "}
          <span className="sold">
            {item.product_num_ratings
              ? `${item.product_num_ratings}+ terjual`
              : ""}
          </span>
        </div>
        <p className="store-name">{item.seller_name}</p>
      </div>
    </div>
  );
}
