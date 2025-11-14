"use client";
import React, { type MouseEvent, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { 
  ArrowRight, Sparkles,
  Utensils, Wrench, Shirt, Palette,
  HeartPulse, Sprout, Laptop, Armchair, Ellipsis
} from "lucide-react";

interface ProductCategory {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  count: string;
  img: string;
  id: string;
  color: string;
  gradient: string;
}

const categories: ProductCategory[] = [
  {
    icon: Utensils,
    title: 'Kuliner',
    count: '13,485',
    img: '/asset/optimized/umkm/umkm1.webp',
    id: '01',
    color: '#f97316',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Wrench,
    title: 'Jasa',
    count: '8,284',
    img: '/asset/optimized/umkm/umkm2.webp',
    id: '02',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    icon: Shirt,
    title: 'Fashion & Aksesoris',
    count: '3,829',
    img: '/asset/optimized/umkm/umkm3.webp',
    id: '03',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: Palette,
    title: 'Kerajinan/Kriya',
    count: '2,824',
    img: '/asset/optimized/umkm/umkm4.webp',
    id: '04',
    color: '#8b5cf6',
    gradient: 'from-purple-500 to-violet-500'
  },
  {
    icon: HeartPulse,
    title: 'Kesehatan & Kecantikan',
    count: '2,789',
    img: '/asset/optimized/umkm/umkm5.webp',
    id: '05',
    color: '#14b8a6',
    gradient: 'from-teal-500 to-emerald-500'
  },
  {
    icon: Sprout,
    title: 'Pertanian & Perkebunan',
    count: '1,815',
    img: '/asset/optimized/umkm/umkm6.webp',
    id: '06',
    color: '#22c55e',
    gradient: 'from-green-500 to-lime-500'
  },
  {
    icon: Laptop,
    title: 'Komputer & Elektronik',
    count: '1,419',
    img: '/asset/optimized/umkm/umkm1.webp',
    id: '07',
    color: '#0ea5e9',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: Armchair,
    title: 'Furniture',
    count: '1,256',
    img: '/asset/optimized/umkm/umkm2.webp',
    id: '08',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    icon: Ellipsis,
    title: 'Lainnya',
    count: '756',
    img: '/asset/optimized/umkm/umkm4.webp',
    id: '9',
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
        /* ===== BASE STYLES ===== */
        * {
          box-sizing: border-box;
        }

        .product-section {
          position: relative;
          width: 100%;
          max-width: 100vw;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          padding: clamp(2rem, 5vw, 6rem) clamp(1rem, 4vw, 2rem);
          overflow: hidden;
        }

        /* ===== ANIMATED BACKGROUND - Desktop Only ===== */
        @media (min-width: 1280px) {
          .product-section::before,
          .product-section::after {
            content: '';
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            opacity: 0.12;
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

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        
        /* ===== HEADER STYLES ===== */
        .product-header {
          max-width: 1400px;
          margin: 0 auto;
          padding-bottom: clamp(1.5rem, 3vw, 4rem);
          position: relative;
          z-index: 1;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: clamp(0.375rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 100px;
          font-size: clamp(0.75rem, 1.5vw, 0.875rem);
          font-weight: 600;
          color: #6366f1;
          margin-bottom: clamp(0.75rem, 2vw, 1.5rem);
        }

        .header-badge svg {
          width: clamp(14px, 2vw, 16px);
          height: clamp(14px, 2vw, 16px);
        }
        
        .product-header h2 {
          font-size: clamp(2rem, 5vw, 4.5rem);
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        
        .product-header p {
          font-size: clamp(0.875rem, 2vw, 1.125rem);
          color: #64748b;
          margin-top: clamp(0.5rem, 1.5vw, 1rem);
          max-width: 600px;
          line-height: 1.6;
        }
        
        /* ===== CATEGORY LIST ===== */
        .category-list {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        
        /* ===== CATEGORY ITEM - Desktop ===== */
        .category-item {
          width: 100%;
          padding: clamp(1.25rem, 2vw, 2.5rem) clamp(1rem, 2vw, 2rem);
          cursor: pointer;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: clamp(1rem, 2vw, 2rem);
          align-items: center;
          border-bottom: 2px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.5);
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
          opacity: 0.08;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Desktop Hover Effects */
        @media (min-width: 1024px) {
          .category-item:hover {
            background: rgba(255, 255, 255, 0.95);
            border-bottom-color: var(--item-color);
            transform: translateX(8px);
            box-shadow: -8px 8px 32px rgba(0, 0, 0, 0.08);
          }

          .category-item:hover::before {
            width: 100%;
          }
        }

        /* Mobile & Tablet Touch Effect */
        @media (max-width: 1023px) {
          .category-item:active {
            background: rgba(255, 255, 255, 0.9);
            transform: scale(0.98);
          }
        }
        
        /* ===== CATEGORY ID ===== */
        .category-id {
          width: clamp(3rem, 8vw, 6rem);
          height: clamp(3rem, 8vw, 6rem);
          border: 2px solid #e2e8f0;
          border-radius: clamp(12px, 2vw, 20px);
          display: grid;
          place-content: center;
          font-size: clamp(1.25rem, 3vw, 2.5rem);
          font-weight: 700;
          color: #94a3b8;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          background: white;
          flex-shrink: 0;
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
        
        @media (min-width: 1024px) {
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
        }

        /* ===== CATEGORY CONTENT ===== */
        .category-content {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 2vw, 1.5rem);
          flex: 1;
          min-width: 0;
        }

        /* ===== CATEGORY ICON ===== */
        .category-icon {
          width: clamp(2.5rem, 6vw, 4rem);
          height: clamp(2.5rem, 6vw, 4rem);
          border-radius: clamp(10px, 2vw, 16px);
          display: grid;
          place-content: center;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 1px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .category-icon svg {
          width: clamp(1.25rem, 3vw, 2rem);
          height: clamp(1.25rem, 3vw, 2rem);
          stroke: #64748b;
          stroke-width: 2;
          fill: none;
          transition: all 0.4s ease;
        }

        @media (min-width: 1024px) {
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
        }

        /* ===== CATEGORY INFO ===== */
        .category-info {
          flex: 1;
          min-width: 0;
        }
        
        .category-title {
          font-size: clamp(1.125rem, 3vw, 2.25rem);
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.25;
          transition: color 0.3s ease;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        @media (min-width: 1024px) {
          .category-item:hover .category-title {
            color: var(--item-color);
          }
        }

        /* ===== CATEGORY COUNT ===== */
        .category-count {
          display: inline-flex;
          align-items: center;
          gap: clamp(0.25rem, 1vw, 0.5rem);
          margin-top: clamp(0.25rem, 1vw, 0.5rem);
          padding: clamp(0.25rem, 1vw, 0.375rem) clamp(0.5rem, 1.5vw, 0.875rem);
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 1px solid #e2e8f0;
          border-radius: 100px;
          font-size: clamp(0.625rem, 1.5vw, 0.875rem);
          font-weight: 600;
          color: #64748b;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .category-count svg {
          width: clamp(10px, 2vw, 14px);
          height: clamp(10px, 2vw, 14px);
          flex-shrink: 0;
        }

        @media (min-width: 1024px) {
          .category-item:hover .category-count {
            background: var(--item-gradient);
            border-color: var(--item-color);
            color: white;
            transform: scale(1.05);
          }
        }
        
        /* ===== CATEGORY ARROW ===== */
        .category-arrow {
          width: clamp(2.5rem, 6vw, 5rem);
          height: clamp(2.5rem, 6vw, 5rem);
          border: 2px solid #e2e8f0;
          border-radius: clamp(10px, 2vw, 16px);
          display: grid;
          place-content: center;
          background: white;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .category-arrow::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--item-gradient);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        
        @media (min-width: 1024px) {
          .category-item:hover .category-arrow {
            border-color: var(--item-color);
            transform: translateX(8px) rotate(5deg);
          }

          .category-item:hover .category-arrow::before {
            opacity: 1;
          }
        }
        
        .category-arrow svg {
          width: clamp(1.125rem, 2.5vw, 2rem);
          height: clamp(1.125rem, 2.5vw, 2rem);
          stroke: #64748b;
          stroke-width: 2.5;
          transition: all 0.4s ease;
          position: relative;
          z-index: 1;
        }
        
        @media (min-width: 1024px) {
          .category-item:hover .category-arrow svg {
            stroke: white;
            transform: translateX(4px);
          }
        }
        
        /* ===== HOVER IMAGE - Desktop Only ===== */
        .hover-image {
          width: clamp(300px, 25vw, 380px);
          height: clamp(380px, 32vw, 480px);
          border-radius: 24px;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          filter: grayscale(0%);
          box-shadow: 0 32px 96px rgba(0, 0, 0, 0.25);
          border: 4px solid white;
          display: none;
        }

        @media (min-width: 1280px) {
          .hover-image {
            display: block;
          }
        }

        .hover-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.5));
          border-radius: 20px;
        }

        .image-overlay-info {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          z-index: 10;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .image-overlay-title {
          font-size: clamp(1rem, 1.2vw, 1.125rem);
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .image-overlay-count {
          font-size: clamp(0.75rem, 0.9vw, 0.875rem);
          color: #64748b;
          font-weight: 600;
        }

        /* ===== GRID PATTERN ===== */
        .grid-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0);
          background-size: 40px 40px;
          opacity: 0.25;
          pointer-events: none;
          z-index: 0;
        }

        @media (max-width: 768px) {
          .grid-pattern {
            background-size: 30px 30px;
            opacity: 0.15;
          }
        }
        
        /* ===== TABLET SPECIFIC (768px - 1023px) ===== */
        @media (min-width: 768px) and (max-width: 1023px) {
          .product-section {
            padding: 3rem 1.5rem;
          }

          .category-item {
            padding: 1.75rem 1.5rem;
            gap: 1.25rem;
          }

          .category-id {
            width: 4.5rem;
            height: 4.5rem;
            font-size: 2rem;
          }

          .category-icon {
            width: 3.5rem;
            height: 3.5rem;
          }

          .category-title {
            font-size: 1.625rem;
          }

          .category-arrow {
            width: 3.5rem;
            height: 3.5rem;
          }
        }
        
        /* ===== MOBILE SPECIFIC (max-width: 767px) ===== */
        @media (max-width: 767px) {
          .product-section {
            padding: 2rem 1rem;
            background: #f8fafc;
          }

          .product-header {
            padding-bottom: 2rem;
          }

          .category-item {
            padding: 1rem 0.875rem;
            gap: 0.75rem;
            grid-template-columns: auto 1fr auto;
            border-bottom: 1.5px solid #e2e8f0;
          }

          .category-content {
            gap: 0.625rem;
          }

          .category-id {
            width: 3rem;
            height: 3rem;
            font-size: 1.25rem;
            border-radius: 12px;
          }

          .category-icon {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 10px;
          }

          .category-icon svg {
            width: 1.25rem;
            height: 1.25rem;
          }

          .category-title {
            font-size: 1.125rem;
            line-height: 1.3;
          }

          .category-count {
            margin-top: 0.25rem;
            padding: 0.25rem 0.625rem;
            font-size: 0.625rem;
          }

          .category-arrow {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 10px;
          }

          .category-arrow svg {
            width: 1.125rem;
            height: 1.125rem;
          }
        }

        /* ===== SMALL MOBILE (max-width: 390px) ===== */
        @media (max-width: 390px) {
          .category-item {
            padding: 0.875rem 0.75rem;
          }

          .category-id {
            width: 2.75rem;
            height: 2.75rem;
            font-size: 1.125rem;
          }

          .category-title {
            font-size: 1rem;
          }

          .category-count {
            font-size: 0.5625rem;
            padding: 0.1875rem 0.5rem;
          }

          /* Stack icon and info on very small screens if needed */
          .category-content {
            gap: 0.5rem;
          }
        }

        /* ===== ACCESSIBILITY ===== */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* ===== TOUCH DEVICES ===== */
        @media (hover: none) and (pointer: coarse) {
          .category-item {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          .category-item:active {
            background: rgba(255, 255, 255, 0.9);
          }
        }

        /* ===== LANDSCAPE MOBILE ===== */
        @media (max-width: 896px) and (orientation: landscape) {
          .product-section {
            padding: 2rem 1.5rem;
          }

          .product-header h2 {
            font-size: 2.5rem;
          }

          .category-item {
            padding: 1rem 1.25rem;
          }
        }
      `}</style>

      <div className="grid-pattern" />

      <div className="product-header">
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
              whileTap={{ scale: 0.95 }}
            >
              <span>{item.id}</span>
            </motion.span>

            <div className="category-content">
              <motion.div 
                className="category-icon"
                whileHover={{ y: -4, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                {(() => {
                  const Icon = item.icon;
                  return <Icon />;
                })()}
              </motion.div>

              <div className="category-info">
                <h3 className="category-title">{item.title}</h3>
                <motion.span 
                  className="category-count"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
              whileTap={{ scale: 0.9 }}
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
                className="image-overlay-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="image-overlay-title">
                  {categories[hoveredIndex].title}
                </div>
                <div className="image-overlay-count">
                  {categories[hoveredIndex].count} Produk Tersedia
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}