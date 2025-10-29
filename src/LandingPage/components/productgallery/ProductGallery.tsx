"use client";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { type MouseEvent, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface ProductCategory {
  icon: string;
  title: string;
  count: string;
  img: string;
  id: string;
  color: string;
  gradient: string;
}

const categories: ProductCategory[] = [
  {
    icon: `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>`,
    title: 'Kuliner',
    count: '13,485',
    img: '/asset/umkm/umkm1.png',
    id: '01',
    color: '#f97316',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: `<path d="M12 12h.01"></path><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path><path d="M22 13a18.15 18.15 0 0 1-20 0"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect>`,
    title: 'Jasa',
    count: '8,284',
    img: '/asset/umkm/umkm2.jpg',
    id: '02',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    icon: `<path d="M6 19v-3"></path><path d="M10 19v-3"></path><path d="M14 19v-3"></path><path d="M18 19v-3"></path><path d="M8 11V9"></path><path d="M16 11V9"></path><rect width="18" height="18" x="3" y="3" rx="2"></rect>`,
    title: 'Fashion & Aksesoris',
    count: '3,829',
    img: '/asset/umkm/umkm3.jpeg',
    id: '03',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: `<path d="M12 2v20"></path><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>`,
    title: 'Kerajinan/Kriya',
    count: '2,824',
    img: '/asset/umkm/umkm4.jpeg',
    id: '04',
    color: '#8b5cf6',
    gradient: 'from-purple-500 to-violet-500'
  },
  {
    icon: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>`,
    title: 'Kesehatan & Kecantikan',
    count: '2,789',
    img: '/asset/umkm/umkm5.jpg',
    id: '05',
    color: '#14b8a6',
    gradient: 'from-teal-500 to-emerald-500'
  },
  {
    icon: `<path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path><path d="M12 3v6"></path>`,
    title: 'Pertanian & Perkebunan',
    count: '1,815',
    img: '/asset/umkm/umkm6.jpg',
    id: '06',
    color: '#22c55e',
    gradient: 'from-green-500 to-lime-500'
  },
  {
    icon: `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>`,
    title: 'Komputer & Elektronik',
    count: '1,419',
    img: '/asset/umkm/umkm1.png',
    id: '07',
    color: '#0ea5e9',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: `<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path>`,
    title: 'Furniture',
    count: '1,256',
    img: '/asset/umkm/umkm2.jpg',
    id: '08',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    icon: `<path d="M4 19v-3"></path><path d="M10 19v-3"></path><path d="M14 19v-3"></path><path d="M18 19v-3"></path><path d="M8 11V9"></path><path d="M16 11V9"></path><rect width="18" height="18" x="3" y="3" rx="2"></rect>`,
    title: 'Edukasi',
    count: '982',
    img: '/asset/umkm/umkm3.jpeg',
    id: '09',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: `<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>`,
    title: 'Lainnya',
    count: '756',
    img: '/asset/umkm/umkm4.jpeg',
    id: '10',
    color: '#64748b',
    gradient: 'from-gray-500 to-slate-500'
  }
];

export default function ProductGallery() {
  const [img, setImg] = useState<{ src: string; alt: string; opacity: number }>({
    src: "",
    alt: "",
    opacity: 0,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const spring = {
    stiffness: 150,
    damping: 20,
    mass: 0.1,
  };

  const imagePos = {
    x: useSpring(0, spring),
    y: useSpring(0, spring),
  };

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const { clientX, clientY } = e;
    const relativeX = clientX - containerRect.left;
    const relativeY = clientY - containerRect.top;

    imagePos.x.set(relativeX - imageRef.current.offsetWidth / 2);
    imagePos.y.set(relativeY - imageRef.current.offsetHeight / 2);
  };

  const handleImageInteraction = (item: ProductCategory, opacity: number, index: number) => {
    setImg({ src: item.img, alt: item.title, opacity });
    setHoveredIndex(opacity > 0 ? index : null);
  };

  return (
    <section className="product-section">
      <style>{`
        .product-section {
          position: relative;
          width: 100%;
          max-width: 100vw;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          padding: clamp(3rem, 6vw, 6rem) clamp(1rem, 3vw, 2rem);
          overflow: hidden;
        }

        /* Animated Background Blobs - Desktop only */
        @media (min-width: 1024px) {
          .product-section::before,
          .product-section::after {
            content: '';
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.15;
            pointer-events: none;
            z-index: 0;
          }

          .product-section::before {
            width: 600px;
            height: 600px;
            background: linear-gradient(135deg, #ff8c42, #ff6914);
            top: -300px;
            right: -200px;
            animation: float 20s ease-in-out infinite;
          }

          .product-section::after {
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, #ff6914, #ff8c42);
            bottom: -200px;
            left: -150px;
            animation: float 25s ease-in-out infinite reverse;
          }
        }
        
        /* Hide gradient on mobile and tablet */
        @media (max-width: 1023px) {
          .product-section {
            background: #f8fafc;
          }
          
          .product-section::before,
          .product-section::after {
            display: none;
          }
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        
        .product-header {
          max-width: 1400px;
          margin: 0 auto;
          padding-bottom: clamp(2rem, 4vw, 4rem);
          position: relative;
          z-index: 1;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6366f1;
          margin-bottom: 1.5rem;
        }

        .header-badge svg {
          width: 16px;
          height: 16px;
        }
        
        .product-header h2 {
          font-size: clamp(2.5rem, 7vw, 5.5rem);
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        
        .product-header p {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          color: #64748b;
          margin-top: 1rem;
          max-width: 600px;
          line-height: 1.6;
        }
        
        .category-list {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        
        .category-item {
          width: 100%;
          padding: clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 2vw, 2rem);
          cursor: pointer;
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          gap: clamp(1rem, 3vw, 2rem);
          align-items: center;
          border-bottom: 2px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
        }

        .category-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0;
          background: linear-gradient(90deg, var(--item-color), transparent);
          opacity: 0.1;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .category-item:hover {
          background: rgba(255, 255, 255, 0.9);
          border-bottom-color: var(--item-color);
          transform: translateX(8px);
          box-shadow: -8px 8px 32px rgba(0, 0, 0, 0.08);
        }

        .category-item:hover::before {
          width: 100%;
        }
        
        .category-id {
          width: clamp(4rem, 10vw, 6rem);
          height: clamp(4rem, 10vw, 6rem);
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          display: grid;
          place-content: center;
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          font-weight: 700;
          color: #94a3b8;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          background: white;
        }

        .category-id::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--item-gradient);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .category-id span {
          position: relative;
          z-index: 1;
        }
        
        .category-item:hover .category-id {
          border-color: var(--item-color);
          transform: rotate(-5deg) scale(1.05);
        }

        .category-item:hover .category-id::before {
          opacity: 1;
        }

        .category-item:hover .category-id span {
          color: white;
        }

        .category-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex: 1;
        }

        .category-icon {
          width: clamp(3rem, 7vw, 4rem);
          height: clamp(3rem, 7vw, 4rem);
          border-radius: 16px;
          display: grid;
          place-content: center;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 1px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .category-icon svg {
          width: clamp(1.5rem, 3.5vw, 2rem);
          height: clamp(1.5rem, 3.5vw, 2rem);
          stroke: #64748b;
          stroke-width: 2;
          fill: none;
          transition: all 0.4s ease;
        }

        .category-item:hover .category-icon {
          background: var(--item-gradient);
          border-color: var(--item-color);
          transform: translateY(-4px) rotate(5deg);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .category-item:hover .category-icon svg {
          stroke: white;
          transform: scale(1.1);
        }

        .category-info {
          flex: 1;
        }
        
        .category-title {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.2;
          transition: color 0.3s ease;
        }

        .category-item:hover .category-title {
          color: var(--item-color);
        }

        .category-count {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.375rem 0.875rem;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 1px solid #e2e8f0;
          border-radius: 100px;
          font-size: clamp(0.75rem, 2vw, 0.875rem);
          font-weight: 600;
          color: #64748b;
          transition: all 0.3s ease;
        }

        .category-item:hover .category-count {
          background: var(--item-gradient);
          border-color: var(--item-color);
          color: white;
          transform: scale(1.05);
        }
        
        .category-arrow {
          width: clamp(3.5rem, 8vw, 5rem);
          height: clamp(3.5rem, 8vw, 5rem);
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          display: grid;
          place-content: center;
          background: white;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .category-arrow::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--item-gradient);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        
        .category-item:hover .category-arrow {
          border-color: var(--item-color);
          transform: translateX(8px) rotate(5deg);
        }

        .category-item:hover .category-arrow::before {
          opacity: 1;
        }
        
        .category-arrow svg {
          width: clamp(1.5rem, 3vw, 2rem);
          height: clamp(1.5rem, 3vw, 2rem);
          stroke: #64748b;
          stroke-width: 2.5;
          transition: all 0.4s ease;
          position: relative;
          z-index: 1;
        }
        
        .category-item:hover .category-arrow svg {
          stroke: white;
          transform: translateX(4px);
        }
        
        .hover-image {
          width: 380px;
          height: 480px;
          border-radius: 24px;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          filter: grayscale(0%);
          box-shadow: 0 32px 96px rgba(0, 0, 0, 0.25);
          border: 4px solid white;
        }

        .hover-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.5));
          border-radius: 20px;
        }

        /* Decorative Grid Pattern */
        .grid-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0);
          background-size: 40px 40px;
          opacity: 0.3;
          pointer-events: none;
          z-index: 0;
        }
        
        @media (max-width: 1024px) {
          .hover-image {
            display: none;
          }

          .category-item {
            grid-template-columns: auto 1fr auto;
          }

          .category-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }

        @media (max-width: 640px) {
          .category-item {
            padding: 1.25rem 1rem;
            gap: 0.75rem;
          }

          .category-icon {
            display: none;
          }

          .category-id {
            width: 3rem;
            height: 3rem;
            font-size: 1.25rem;
          }
        }
      `}</style>

      <div className="grid-pattern" />

      <div className="product-header mb-8 px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
          style={{ 
            lineHeight: '1.2',
            paddingBottom: '0.35em',
            letterSpacing: '-0.5px'
          }}
        >
          Kategori UMKM
        </motion.h2>
      </div>
      
      <div 
        ref={containerRef}
        onMouseMove={handleMove}
        className="category-list"
      >
        {categories.map((item, index) => (
          <motion.div
            key={index}
            className="category-item"
            style={{
              '--item-color': item.color,
              '--item-gradient': `linear-gradient(135deg, ${item.color}, ${item.color}dd)`
            } as any}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: index * 0.08, 
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1]
            }}
            onMouseEnter={() => handleImageInteraction(item, 1, index)}
            onMouseMove={() => handleImageInteraction(item, 1, index)}
            onMouseLeave={() => handleImageInteraction(item, 0, index)}
          >
            <motion.span 
              className="category-id"
              whileHover={{ rotate: -5 }}
            >
              <span>{item.id}</span>
            </motion.span>

            <div className="category-content">
              <motion.div 
                className="category-icon"
                whileHover={{ y: -4, rotate: 5 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                />
              </motion.div>

              <div className="category-info">
                <h3 className="category-title">{item.title}</h3>
                <motion.span 
                  className="category-count"
                  whileHover={{ scale: 1.05 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  {item.count} Produk
                </motion.span>
              </div>
            </div>
            
            <motion.span 
              className="category-arrow"
              whileHover={{ x: 8, rotate: 5 }}
            >
              <ArrowRight />
            </motion.span>
          </motion.div>
        ))}

        {img.src && (
          <motion.div
            ref={imageRef as any}
            className="hover-image"
            style={{
              x: imagePos.x,
              y: imagePos.y,
              backgroundImage: `url(${img.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{
              opacity: img.opacity,
              scale: img.opacity > 0 ? 1 : 0.8,
              rotate: img.opacity > 0 ? 6 : -8,
            }}
            transition={{
              opacity: { duration: 0.3, ease: "easeOut" },
              scale: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
              rotate: { duration: 0.5, ease: "easeOut" },
            }}
          >
            {hoveredIndex !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  right: '24px',
                  zIndex: 10,
                }}
              >
                <div style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '4px',
                  }}>
                    {categories[hoveredIndex].title}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    fontWeight: '600',
                  }}>
                    {categories[hoveredIndex].count} Produk Tersedia
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}