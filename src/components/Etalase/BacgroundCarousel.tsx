import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
}

const carouselData: CarouselSlide[] = [
  {
    id: 1,
    image: '/asset/umkm/umkm5.jpg',
    title: 'Etalase UMKM Kreatif',
    desc: 'Temukan produk unggulan lokal dengan kualitas terbaik. Dukung pengusaha kecil!',
    cta: 'Lihat Produk',
    href: '#produk'
  },
  {
    id: 2,
    image: '/asset/umkm/umkm1.jpg',
    title: 'Handmade dengan Cinta',
    desc: 'Setiap produk dibuat dengan tangan dan penuh dedikasi oleh UMKM Indonesia.',
    cta: 'Jelajahi Sekarang',
    href: '#kategori'
  },
  {
    id: 3,
    image: '/asset/umkm/umkm2.jpg',
    title: 'Belanja Cerdas, Dukung Lokal',
    desc: 'Harga terjangkau, kualitas terjamin. Langsung dari pengrajin ke tanganmu.',
    cta: 'Mulai Belanja',
    href: '#produk'
  },
  {
    id: 4,
    image: '/asset/umkm/umkm3.jpg',
    title: 'Produk Eksklusif Musiman',
    desc: 'Koleksi terbatas edisi spesial hanya ada di sini. Jangan sampai kehabisan!',
    cta: 'Lihat Koleksi',
    href: '#promo'
  },
  {
    id: 5,
    image: '/asset/umkm/umkm4.jpg',
    title: '100% Asli Indonesia',
    desc: 'Bangga pakai produk dalam negeri. Kualitas dunia, harga lokal.',
    cta: 'Belanja Sekarang',
    href: '#produk'
  }
];

export default function BackgroundCarousel() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto slide + pause on hover
  useEffect(() => {
    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        goToNext();
      }, 5000);
    };

    const stopInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    startInterval();

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseenter', stopInterval);
      container.addEventListener('mouseleave', startInterval);
    }

    return () => {
      stopInterval();
      if (container) {
        container.removeEventListener('mouseenter', stopInterval);
        container.removeEventListener('mouseleave', startInterval);
      }
    };
  }, [currentIndex]);

  const goToPrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? carouselData.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % carouselData.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  return (
    <>
      <div className="carousel-container" ref={containerRef}>
        {/* Slides */}
        <div className="carousel-wrapper">
          {carouselData.map((slide, index) => {
            let slidePosition = 'next';
            if (index === currentIndex) slidePosition = 'active';
            else if (
              index === (currentIndex - 1 + carouselData.length) % carouselData.length
            ) {
              slidePosition = 'prev';
            }

            return (
              <div
                key={slide.id}
                className={`carousel-slide ${slidePosition}`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="carousel-image"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className="carousel-overlay"></div>
                <div className="carousel-content">
                  <h1 className="carousel-title">{slide.title}</h1>
                  <p className="carousel-desc">{slide.desc}</p>
                  <a href={slide.href} className="carousel-cta">
                    {slide.cta}
                    <ChevronRight className="cta-icon" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigasi */}
        <button onClick={goToPrev} className="nav-btn nav-left" aria-label="Slide sebelumnya">
          <ChevronLeft className="nav-icon" />
        </button>
        <button onClick={goToNext} className="nav-btn nav-right" aria-label="Slide berikutnya">
          <ChevronRight className="nav-icon" />
        </button>

        {/* Dots */}
        <div className="carousel-dots">
          {carouselData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              aria-label={`Ke slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* CSS: ULTRA MINI + MARGIN + HOVER PAUSE */}
      <style jsx>{`
        .carousel-container {
          position: relative;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          max-height: 35vh;
          overflow: hidden;
          background: #000;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          cursor: pointer;
        }

        /* HP KECIL: 360x880 — ULTRA MINI */
        @media (max-width: 480px) {
          .carousel-container {
            aspect-ratio: 3 / 4;
            max-height: 28vh;
            border-radius: 0.35rem;
          }
        }

        @media (max-width: 360px) {
          .carousel-container {
            max-height: 26vh; /* ~228px */
          }
        }

        /* Landscape kecil */
        @media (orientation: landscape) and (max-height: 500px) {
          .carousel-container {
            aspect-ratio: 16 / 9;
            max-height: 50vh;
          }
        }

        /* Tablet & Desktop */
        @media (min-width: 768px) {
          .carousel-container {
            max-height: 45vh;
          }
        }

        .carousel-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        /* SLIDE TRANSISI: GESER */
        .carousel-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transform: translateX(100%);
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease;
          pointer-events: none;
        }

        .carousel-slide.active {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
          z-index: 1;
        }

        .carousel-slide.prev {
          opacity: 0;
          transform: translateX(-100%);
          z-index: 0;
        }

        .carousel-slide.next {
          opacity: 0;
          transform: translateX(100%);
          z-index: 0;
        }

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 15%;
          image-rendering: -webkit-optimize-contrast;
        }

        .carousel-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.97) 0%,
            rgba(0,0,0,0.75) 12%,
            rgba(0,0,0,0.45) 40%,
            transparent 100%
          );
          z-index: 1;
        }

        .carousel-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: clamp(0.4rem, 2vw, 0.9rem);
          color: white;
          text-align: center;
          z-index: 2;
        }

        .carousel-title {
          font-size: clamp(0.95rem, 3.5vw, 1.5rem);
          font-weight: 900;
          margin-bottom: 0.25rem;
          line-height: 1.1;
          text-shadow: 0 1px 4px rgba(0,0,0,0.8);
          opacity: 0;
          transform: translateY(10px);
          animation: slideUp 0.5s ease-out 0.1s forwards;
        }

        .carousel-desc {
          font-size: clamp(0.55rem, 1.5vw, 0.7rem);
          margin-bottom: 0.6rem;
          line-height: 1.25;
          opacity: 0.85;
          max-width: 90%;
          margin-left: auto;
          margin-right: auto;
          opacity: 0;
          transform: translateY(10px);
          animation: slideUp 0.5s ease-out 0.2s forwards;
        }

        .carousel-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          background: #ff6b35;
          color: white;
          font-weight: 700;
          font-size: clamp(0.55rem, 1.5vw, 0.7rem);
          padding: clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 1.8vw, 0.9rem);
          border-radius: 2.5rem;
          text-decoration: none;
          box-shadow: 0 2px 6px rgba(255,107,53,0.3);
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.12);
          opacity: 0;
          transform: translateY(10px);
          animation: slideUp 0.5s ease-out 0.3s forwards;
          margin-bottom: 1rem;
        }

        .carousel-cta:hover {
          background: #e55a2b;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 10px rgba(255,107,53,0.35);
        }

        .cta-icon {
          width: clamp(0.55rem, 1.8vw, 0.85rem);
          height: clamp(0.55rem, 1.8vw, 0.85rem);
        }

        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* NAV BUTTON: JAUH DARI TEPI */
        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.18);
          color: white;
          border: none;
          width: clamp(18px, 4.5vw, 30px);
          height: clamp(18px, 4.5vw, 30px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
          opacity: 0.6;
        }

        .nav-btn:hover {
          opacity: 1;
          background: rgba(255,255,255,0.28);
          transform: translateY(-50%) scale(1.08);
        }

        .nav-left { 
          left: clamp(0.6rem, 2vw, 1rem); /* LEBIH JAUH */
        }
        .nav-right { 
          right: clamp(0.6rem, 2vw, 1rem); /* LEBIH JAUH */
        }

        .nav-icon {
          width: clamp(9px, 3vw, 16px);
          height: clamp(9px, 3vw, 16px);
        }

        /* DOTS: JAUH DARI CTA */
        .carousel-dots {
          position: absolute;
          bottom: clamp(0.6rem, 2vw, 0.5rem); /* NAIK */
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: clamp(0.3rem, 0.8vw, 0.5rem);
          z-index: 10;
        }

        .dot {
          width: clamp(4px, 1.3vw, 6px);
          height: clamp(4px, 1.3vw, 6px);
          border-radius: 50%;
          background: rgba(255,255,255,0.45);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .dot:hover { background: rgba(255,255,255,0.75); }

        .dot.active {
          background: white;
          width: clamp(11px, 3.5vw, 18px);
          border-radius: 16px;
        }

        /* KHUSUS 360px */
        @media (max-width: 360px) {
          .carousel-title { 
            font-size: 0.92rem; 
            margin-bottom: 0.2rem;
          }
          .carousel-desc { 
            font-size: 0.52rem; 
            line-height: 1.2; 
            margin-bottom: 0.5rem;
          }
          .carousel-cta { 
            padding: 0.22rem 0.55rem; 
            font-size: 0.55rem; 
            gap: 0.2rem;
            margin-bottom: 10rem;
          }
          .cta-icon { 
            width: 0.55rem; 
            height: 0.55rem; 
          }
          .nav-btn { 
            width: 16px; 
            height: 16px; 
          }
          .nav-icon { 
            width: 8px; 
            height: 8px; 
          }
          .nav-left, .nav-right {
            left: 0.7rem;
            right: 0.7rem;
          }
          .carousel-dots {
            bottom: 0.7rem;
            gap: 0.3rem;
          }
          .dot { 
            width: 4px; 
            height: 4px; 
          }
          .dot.active { 
            width: 11px; 
          }
        }
      `}</style>
    </>
  );
}