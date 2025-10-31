import React, { useState, useEffect, useRef } from "react";

function TrendingProduk() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  // Data produk (bisa dari API nanti)
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

  // Auto play
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
        /* === TRENDING LAYOUT === */
        .trending-section {
          margin: 40px 0;
          padding: 0 16px;
        }

        .trending-section h2 {
          font-size: 1.6rem;
          color: #f33636;
          margin: 50px 0 30px;
          font-weight: 600;
          text-align: center;
        }

        .trending-container {
          display: grid;
          grid-template-columns: 2fr 1.8fr;
          gap: 25px;
          align-items: stretch;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* === LEFT: CAROUSEL === */
        .trending-carousel {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .carousel-wrapper {
          position: relative;
          overflow: hidden;
        }

        .carousel-track {
          display: flex;
          transition: transform 0.5s ease;
          width: ${totalSlides * 100}%;
        }

        .carousel-slide {
          min-width: 100%;
          width: 100%;
          position: relative;
        }

        .carousel-slide img {
          width: 100%;
          height: 280px;
          object-fit: cover;
          display: block;
        }

        .carousel-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          padding: 30px 20px 20px;
          color: #fff;
        }

        .carousel-info h3 {
          font-size: 1.4rem;
          margin-bottom: 8px;
        }

        .carousel-info p {
          font-size: 0.95rem;
          margin-bottom: 10px;
          opacity: 0.9;
        }

        .trending-price {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f97316;
        }

        /* Carousel Navigation */
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.9);
          border: none;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #ff6b6b;
          transition: 0.3s;
          z-index: 10;
        }

        .carousel-btn:hover {
          background: #ff6b6b;
          color: #fff;
          transform: translateY(-50%) scale(1.1);
        }

        .carousel-btn.prev {
          left: 15px;
        }

        .carousel-btn.next {
          right: 15px;
        }

        /* Carousel Dots */
        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 12px 0;
          border-top: 1px solid #eee;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #d1d5db;
          cursor: pointer;
          transition: 0.3s;
        }

        .carousel-dot.active {
          background: #2563eb;
          width: 30px;
          border-radius: 5px;
        }

        /* === RIGHT: FEATURED GRID === */
        .featured-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 15px;
        }

        .featured-item {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: 0.3s;
          cursor: pointer;
        }

        .featured-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.15);
        }

        .featured-item img {
          width: 100%;
          height: 120px;
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
          .carousel-slide img {
            height: 200px;
          }
          .featured-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <section className="trending-section">
        <h2>Produk Pilihan</h2>
        <div className="trending-container">
          {/* Kiri: Carousel */}
          <div className="trending-carousel" ref={carouselRef}>
            <div className="carousel-wrapper">
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentSlide * (100 / totalSlides)}%)` }}
              >
                {trendingSlides.map((slide, index) => (
                  <div key={index} className="carousel-slide">
                    <img src={slide.image} alt={slide.title} />
                    <div className="carousel-info">
                      <h3>{slide.title}</h3>
                      <p>{slide.description}</p>
                      <span className="trending-price">{slide.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol Navigasi */}
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
            </div>

            {/* Dots */}
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

          {/* Kanan: Featured Grid */}
          <div className="featured-grid">
            {featuredProducts.map((item, index) => (
              <article key={index} className="featured-item">
                <img src={item.image} alt={item.title} />
                <div className="featured-info">
                  <h4>{item.title}</h4>
                  <span>{item.price}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default TrendingProduk;