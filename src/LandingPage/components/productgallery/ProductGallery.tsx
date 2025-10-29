import { useEffect, useRef } from 'react';

interface ProductCategory {
  icon: string;
  title: string;
  count: string;
}

const categories: ProductCategory[] = [
  {
    icon: `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>`,
    title: 'Kuliner',
    count: '13485 Produk'
  },
  {
    icon: `<path d="M12 12h.01"></path><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path><path d="M22 13a18.15 18.15 0 0 1-20 0"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect>`,
    title: 'Jasa',
    count: '8284 Produk'
  },
  {
    icon: `<path d="M6 19v-3"></path><path d="M10 19v-3"></path><path d="M14 19v-3"></path><path d="M18 19v-3"></path><path d="M8 11V9"></path><path d="M16 11V9"></path><rect width="18" height="18" x="3" y="3" rx="2"></rect>`,
    title: 'Fashion & Aksesoris',
    count: '3829 Produk'
  },
  {
    icon: `<path d="M12 2v20"></path><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>`,
    title: 'Kerajinan/Kriya',
    count: '2824 Produk'
  },
  {
    icon: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>`,
    title: 'Kesehatan & Kecantikan',
    count: '2789 Produk'
  },
  {
    icon: `<path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path><path d="M12 3v6"></path>`,
    title: 'Pertanian & Perkebunan',
    count: '1815 Produk'
  },
  {
    icon: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`,
    title: 'Komputer & Elektronik',
    count: '1419 Produk'
  },
  {
    icon: `<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path>`,
    title: 'Furniture',
    count: '1256 Produk'
  },
  {
    icon: `<path d="M4 19v-3"></path><path d="M10 19v-3"></path><path d="M14 19v-3"></path><path d="M18 19v-3"></path><path d="M8 11V9"></path><path d="M16 11V9"></path><rect width="18" height="18" x="3" y="3" rx="2"></rect>`,
    title: 'Edukasi',
    count: '982 Produk'
  },
  {
    icon: `<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>`,
    title: 'Lainnya',
    count: '756 Produk'
  }
];

export default function ProductGallery() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 25;
    const retryDelay = 200;

    function initScrollAnimation() {
      const gsap = (window as any).gsap;
      const ScrollTrigger = (window as any).ScrollTrigger;

      if (!gsap || !ScrollTrigger) {
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(initScrollAnimation, retryDelay);
        } else {
          enableFallbackScroll();
        }
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const wrapper = wrapperRef.current;
      const cardsContainer = containerRef.current;

      if (!wrapper || !cardsContainer) {
        enableFallbackScroll();
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setupAnimation(gsap, ScrollTrigger, wrapper, cardsContainer);
        });
      });
    }

    function setupAnimation(gsap: any, ScrollTrigger: any, wrapper: HTMLElement, cardsContainer: HTMLElement) {
      const vw = window.innerWidth;
      const isMobile = vw <= 640;
      const isTablet = vw > 640 && vw <= 1024;
      
      const scrollWidth = cardsContainer.scrollWidth;
      const scrollDistance = Math.max(0, scrollWidth - vw);

      if (scrollDistance <= 40) {
        enableFallbackScroll();
        return;
      }

      const applySidePadding = () => {
        const firstCard = cardsContainer.querySelector('.card');
        if (!firstCard) return;
        
        const cardW = firstCard.getBoundingClientRect().width;
        const sidePadding = Math.max(
          isMobile ? 10 : (isTablet ? 20 : 28),
          Math.round((vw - cardW) / 2)
        );
        
        cardsContainer.style.paddingLeft = sidePadding + 'px';
        cardsContainer.style.paddingRight = sidePadding + 'px';
      };

      applySidePadding();

      const finalDistance = Math.max(0, cardsContainer.scrollWidth - vw);
      const wrapperHeight = cardsContainer.offsetHeight + (isMobile ? 14 : (isTablet ? 20 : 28));
      wrapper.style.height = wrapperHeight + 'px';

      gsap.set(cardsContainer, { x: 0 });

      try {
        const scrubValue = isMobile ? 1.2 : (isTablet ? 0.9 : 0.6);
        const startPos = isMobile ? 'top 75%' : (isTablet ? 'top 65%' : 'center center');
        const endMultiplier = isMobile ? 2 : (isTablet ? 1.7 : 2);

        gsap.to(cardsContainer, {
          x: -finalDistance,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            start: startPos,
            end: () => '+=' + (finalDistance * endMultiplier),
            pin: true,
            scrub: scrubValue,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            markers: false,
            id: 'umkm-scroll'
          }
        });

        let resizeTimer: NodeJS.Timeout;
        const handleResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            applySidePadding();
            ScrollTrigger.refresh();
          }, 250);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
          setTimeout(() => {
            applySidePadding();
            ScrollTrigger.refresh();
          }, 400);
        });

      } catch (error) {
        console.error('Error:', error);
        enableFallbackScroll();
      }
    }

    function enableFallbackScroll() {
      const wrapper = wrapperRef.current;
      if (wrapper) {
        wrapper.classList.add('no-anim');
        wrapper.style.overflowX = 'auto';
        wrapper.style.overflowY = 'hidden';
        wrapper.style.scrollBehavior = 'smooth';
      }
    }

    initScrollAnimation();
  }, []);

  return (
    <section className="product-section">
      <style>{`
        .product-section {
          position: relative;
          width: 100%;
          max-width: 100vw;
          background: #ffffff;
          padding: clamp(1.75rem, 3.5vw, 4rem) 0;
          overflow: hidden;
        }
        
        .product-header-fixed {
          width: 100%;
          max-width: min(1400px, calc(100vw - clamp(1.5rem, 3vw, 4rem)));
          margin: 0 auto;
          padding: 0 clamp(0.875rem, 2vw, 2rem) clamp(1.25rem, 2.8vw, 2.5rem);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: clamp(0.875rem, 2vw, 2rem);
          flex-wrap: wrap;
        }
        
        .product-title h2 {
          font-size: clamp(1.125rem, 4vw, 2rem);
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 clamp(0.25rem, 0.8vw, 0.5rem) 0;
          line-height: 1.25;
        }
        
        .product-title p {
          font-size: clamp(0.75rem, 2.2vw, 1rem);
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }
        
        .see-all {
          display: flex;
          align-items: center;
          gap: clamp(0.3rem, 0.8vw, 0.5rem);
          color: #0066CC;
          text-decoration: none;
          font-weight: 600;
          font-size: clamp(0.75rem, 2.2vw, 1rem);
          white-space: nowrap;
          transition: all 0.3s ease;
          padding: clamp(0.35rem, 0.8vw, 0.5rem);
        }
        
        .see-all:hover { 
          gap: clamp(0.5rem, 1vw, 0.75rem);
          color: #FF6B00;
        }
        
        .see-all svg { 
          transition: transform 0.3s ease;
          width: clamp(15px, 3.6vw, 20px);
          height: clamp(15px, 3.6vw, 20px);
        }
        
        .see-all:hover svg { 
          transform: translateX(3px); 
        }

        .horizontal-scroll-wrapper {
          position: relative;
          width: 100%;
          max-width: 100vw;
          overflow: hidden;
          min-height: clamp(200px, 36vw, 400px);
          display: flex;
          align-items: center;
          padding: clamp(0.875rem, 1.8vw, 1.5rem) 0;
        }

        .cards-container {
          display: flex;
          gap: clamp(0.7rem, 1.8vw, 1.5rem);
          padding: clamp(0.5rem, 1.2vw, 1rem) clamp(0.875rem, 1.8vw, 2rem);
          will-change: transform;
          width: max-content;
        }

        .card {
          flex: 0 0 auto;
          width: clamp(120px, 30vw, 280px);
          height: clamp(150px, 36vw, 340px);
          background: #ffffff;
          border-radius: clamp(0.75rem, 1.8vw, 1.25rem);
          padding: clamp(0.7rem, 2.2vw, 1.5rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,107,0,0.08) 0%, rgba(0,102,204,0.08) 100%);
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 10px 26px rgba(255, 107, 0, 0.18);
          border-color: #FF6B00;
        }

        .card:hover::before {
          opacity: 1;
        }
        
        .product-icon {
          width: clamp(40px, 10.5vw, 85px);
          height: clamp(40px, 10.5vw, 85px);
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: clamp(0.5rem, 1.4vw, 1rem);
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }
        
        .product-icon svg {
          width: clamp(21px, 5.2vw, 45px);
          height: clamp(21px, 5.2vw, 45px);
          transition: all 0.35s ease;
        }
        
        .card:hover .product-icon {
          transform: scale(1.1) rotate(4deg);
          background: linear-gradient(135deg, rgba(255, 107, 0, 0.14) 0%, rgba(255, 107, 0, 0.06) 100%);
        }

        .card:hover .product-icon svg {
          stroke: #FF6B00;
          filter: drop-shadow(0 2px 5px rgba(255, 107, 0, 0.3));
        }
        
        .card h3 {
          font-size: clamp(0.7rem, 2.4vw, 1.1rem);
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 clamp(0.28rem, 0.8vw, 0.5rem) 0;
          line-height: 1.35;
          padding: 0 clamp(0.2rem, 0.8vw, 0.5rem);
          position: relative;
          z-index: 1;
          transition: color 0.3s ease;
          word-wrap: break-word;
        }

        .card:hover h3 {
          color: #FF6B00;
        }
        
        .product-count {
          font-size: clamp(0.625rem, 1.9vw, 0.9rem);
          color: #64748b;
          margin: 0;
          font-weight: 500;
          position: relative;
          z-index: 1;
          transition: color 0.3s ease;
        }

        .card:hover .product-count {
          color: #0066CC;
        }

        .scroll-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(0.5rem, 1.4vw, 0.75rem);
          padding: clamp(0.875rem, 1.8vw, 2rem) 0 clamp(0.5rem, 0.8vw, 1rem);
          color: #94a3b8;
          font-size: clamp(0.7rem, 2vw, 0.9rem);
          animation: bounce 2.5s infinite ease-in-out;
        }

        .scroll-indicator svg {
          width: clamp(16px, 3.6vw, 22px);
          height: clamp(16px, 3.6vw, 22px);
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(7px); opacity: 1; }
        }

        .horizontal-scroll-wrapper.no-anim {
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
        }

        .horizontal-scroll-wrapper.no-anim .card {
          scroll-snap-align: start;
        }

        @media (max-width: 768px) {
          .product-header-fixed {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .horizontal-scroll-wrapper {
            min-height: 190px;
          }

          .card {
            width: clamp(130px, 38vw, 165px);
            height: clamp(160px, 46vw, 205px);
          }
        }
      `}</style>

      <div className="product-header-fixed">
        <div className="product-title">
          <h2>Hasil Produk UMKM</h2>
          <p>Jelajahi berbagai produk dari pengguna LinkUMKM</p>
        </div>
        <a href="#" className="see-all">
          <span>Lihat Semua</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </div>
      
      <div className="horizontal-scroll-wrapper" ref={wrapperRef}>
        <div className="cards-container" ref={containerRef}>
          {categories.map((cat, idx) => (
            <div key={idx} className="card">
              <div className="product-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: cat.icon }} />
              </div>
              <h3>{cat.title}</h3>
              <p className="product-count">{cat.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-indicator">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        <span className="indicator-text">Scroll untuk melihat lebih banyak</span>
      </div>
    </section>
  );
}
