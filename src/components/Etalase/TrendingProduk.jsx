import React, { useState, useEffect, useRef } from "react";

function TrendingProduk() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  const trendingSlides = [
    {
      title: "Produk Trending #1",
      description: "Produk terlaris minggu ini",
      price: "Rp 350.000",
      image: "/asset/umkm/umkm5.jpg",
    },
    {
      title: "Produk Trending #2",
      description: "Favorit pelanggan",
      price: "Rp 280.000",
      image: "/asset/umkm/umkm5.jpg",
    },
    {
      title: "Produk Trending #3",
      description: "Rekomendasi spesial",
      price: "Rp 420.000",
      image: "/asset/umkm/umkm5.jpg",
    },
  ];

  const featuredProducts = [
    { title: "Produk Pilihan 1", price: "Rp 180.000", image: "/asset/umkm/umkm5.jpg" },
    { title: "Produk Pilihan 2", price: "Rp 220.000", image: "/asset/umkm/umkm5.jpg" },
    { title: "Produk Pilihan 3", price: "Rp 195.000", image: "/asset/umkm/umkm5.jpg" },
    { title: "Produk Pilihan 4", price: "Rp 240.000", image: "/asset/umkm/umkm5.jpg" },
    { title: "Produk Pilihan 5", price: "Rp 210.000", image: "/asset/umkm/umkm5.jpg" },
    { title: "Produk Pilihan 6", price: "Rp 265.000", image: "/asset/umkm/umkm5.jpg" },
  ];

  const totalSlides = trendingSlides.length;

  useEffect(() => {
    const startAutoPlay = () => {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 4000);
    };

    const stopAutoPlay = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    startAutoPlay();

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("mouseenter", stopAutoPlay);
      carousel.addEventListener("mouseleave", startAutoPlay);
    }

    return () => {
      stopAutoPlay();
      if (carousel) {
        carousel.removeEventListener("mouseenter", stopAutoPlay);
        carousel.removeEventListener("mouseleave", startAutoPlay);
      }
    };
  }, [totalSlides]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <>
      <style jsx>{`
        .trending-section {
          margin: 60px 0;
          padding: 0 16px;
        }

        .trending-title {
          font-size: 2.2rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #ff6b35, #f33636);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .trending-container {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 28px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .carousel-wrapper {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .carousel-track {
          display: flex;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .carousel-slide {
          min-width: 100%;
          position: relative;
        }

        .carousel-slide img {
          width: 100%;
          height: 320px;
          object-fit: cover;
        }

        .carousel-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          padding: 40px 24px 24px;
          color: white;
        }

        .carousel-overlay h3 {
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .carousel-overlay p {
          font-size: 1rem;
          opacity: 0.9;
          margin-bottom: 12px;
        }

        .price-tag {
          font-size: 1.5rem;
          font-weight: 800;
          color: #fbbf24;
        }

        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.9);
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: all 0.3s;
          z-index: 10;
        }

        .carousel-btn:hover {
          background: #ff6b35;
          color: white;
          transform: translateY(-50%) scale(1.1);
        }

        .carousel-btn.prev { left: 16px; }
        .carousel-btn.next { right: 16px; }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          padding: 16px 0;
        }

        .carousel-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ddd;
          cursor: pointer;
          transition: all 0.3s;
        }

        .carousel-dot.active {
          background: #ff6b35;
          width: 36px;
          border-radius: 6px;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .featured-item {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.3s;
          cursor: pointer;
        }

        .featured-item:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 25px rgba(255,107,53,0.2);
        }

        .featured-item img {
          width: 100%;
          height: 100px;
          object-fit: cover;
        }

        .featured-info {
          padding: 12px;
        }

        .featured-info h4 {
          font-size: 0.9rem;
          color: #222;
          margin-bottom: 6px;
          font-weight: 600;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .featured-info span {
          color: #f97316;
          font-weight: 700;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .trending-container {
            grid-template-columns: 1fr;
          }
          .carousel-slide img { height: 240px; }
          .featured-grid { grid-template-columns: 1fr; }
          .trending-title { font-size: 1.8rem; }
        }
      `}</style>

      <section className="trending-section">
        <h2 className="trending-title">Produk Pilihan</h2>
        <div className="trending-container">
          <div className="carousel-wrapper" ref={carouselRef}>
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {trendingSlides.map((slide, index) => (
                <div key={index} className="carousel-slide">
                  <img src={slide.image} alt={slide.title} />
                  <div className="carousel-overlay">
                    <h3>{slide.title}</h3>
                    <p>{slide.description}</p>
                    <div className="price-tag">{slide.price}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="carousel-btn prev" onClick={prevSlide}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="carousel-btn next" onClick={nextSlide}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <div className="carousel-dots">
              {trendingSlides.map((_, index) => (
                <div
                  key={index}
                  className={`carousel-dot ${currentSlide === index ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>

          <div className="featured-grid">
            {featuredProducts.map((item, index) => (
              <div key={index} className="featured-item">
                <img src={item.image} alt={item.title} />
                <div className="featured-info">
                  <h4>{item.title}</h4>
                  <span>{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default TrendingProduk;