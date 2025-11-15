"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Simpan ke localStorage untuk dipakai Etalase
    try {
      localStorage.setItem('searchQuery', trimmed);
    } catch {}

    // Panggil callback lokal jika ada
    if (onSearch) {
      onSearch(trimmed);
    }

    // Redirect ke halaman Etalase dengan query di URL
    if (typeof window !== 'undefined') {
      const encoded = encodeURIComponent(trimmed);
      window.location.href = `/etalase?search=${encoded}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section ref={sectionRef} className={`search-section ${isVisible ? 'visible' : ''}`}>
      <style>{`
        /* ===== BASE STYLES ===== */
        .search-section {
          position: relative;
          width: 100%;
          max-width: 100%;
          /* Added extra padding to prevent clipping */
          padding: clamp(4rem, 8vw, 6rem) clamp(1rem, 3vw, 2rem);
          /* Clip background orbs within section */
          overflow: hidden;
          background: #2563eb;
          box-sizing: border-box;
          opacity: 0;
          transform: translateY(40px);
          will-change: opacity, transform;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
          /* Ensure background doesn't clip */
          isolation: isolate;
        }

        .search-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ===== ANIMATED BACKGROUND ORBS ===== */
        .search-section::before,
        .search-section::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: float 20s ease-in-out infinite;
          /* Ensure they stay behind */
          z-index: 0;
        }

        .search-section::before {
          width: 420px;
          height: 420px;
          background: rgba(37, 99, 235, 0.4);
          top: -120px;
          right: -80px;
          animation-delay: 0s;
        }

        .search-section::after {
          width: 500px;
          height: 500px;
          background: rgba(37, 99, 235, 0.4);
          bottom: -140px;
          left: -100px;
          animation-delay: 5s;
        }

        @keyframes float {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.3; 
          }
          33% { 
            transform: translate(30px, -30px) scale(1.08); 
            opacity: 0.4; 
          }
          66% { 
            transform: translate(-20px, 20px) scale(0.97); 
            opacity: 0.35; 
          }
        }
        
        

        /* ===== CONTAINER ===== */
        .search-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          /* Added padding for animations */
          padding: 0 clamp(0.5rem, 2vw, 1rem);
          box-sizing: border-box;
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          will-change: opacity, transform;
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, 
                      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
          position: relative;
          z-index: 1;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }

        .search-section.visible .search-container {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* ===== HEADER SECTION ===== */
        .search-header {
          text-align: center;
          /* Added extra bottom margin for spacing */
          margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s;
        }

        .search-section.visible .search-header {
          opacity: 1;
          transform: translateY(0);
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #2563eb;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          margin-bottom: 1rem;
          box-shadow: 0 2px 12px rgba(37, 99, 235, 0.3);
          transition: all 0.3s ease;
        }

        .header-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
          background: #1d4ed8;
        }

        .header-badge svg {
          width: 16px;
          height: 16px;
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-15deg) scale(1.15); }
          75% { transform: rotate(15deg) scale(0.95); }
        }

        .search-title {
          font-size: clamp(1.75rem, 5vw, 3rem);
          font-weight: 900;
          color: white;
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .search-subtitle {
          font-size: clamp(0.95rem, 2.5vw, 1.125rem);
          color: rgba(255, 255, 255, 0.85);
          margin-top: 0.75rem;
          font-weight: 400;
          line-height: 1.6;
        }
        
        /* ===== SEARCH BOX WRAPPER ===== */
        .search-box-wrapper {
          /* Added wrapper with padding to prevent clipping */
          padding: clamp(0.5rem, 2vw, 1rem);
          /* Ensure space for shadow and animations */
          margin: -0.5rem;
        }

        /* ===== PREMIUM SEARCH BOX ===== */
        .search-box {
          width: 100%;
          background: #FFFFFF;
          border-radius: 20px;
          padding: clamp(0.875rem, 2vw, 1rem);
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.05) inset;
          backdrop-filter: blur(20px);
          will-change: transform, box-shadow;
          /* Smoother transition */
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          position: relative;
          /* Allow pseudo-elements to overflow */
          overflow: visible;
          transform: translateZ(0);
          backface-visibility: hidden;
          /* Ensure proper stacking */
          isolation: isolate;
        }

        .search-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.08), transparent);
          transition: left 0.6s ease;
          border-radius: 20px;
          pointer-events: none;
        }

        .search-box.focused {
          /* Reduced transform to prevent clipping */
          transform: translateY(-4px) scale(1.005);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.12),
            0 0 0 2px #FF6914 inset,
            0 20px 60px rgba(255, 105, 20, 0.15);
        }

        .search-box.focused::before {
          left: 100%;
        }
        
        /* ===== SEARCH CONTENT ===== */
        .search-content {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 2vw, 1rem);
          width: 100%;
          position: relative;
          z-index: 1;
        }
        
        .search-field {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 2vw, 1rem);
          flex: 1;
          padding: 0.5rem;
          transition: all 0.3s ease;
          min-width: 0;
        }
        
        /* ===== SEARCH ICON ===== */
        .search-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(44px, 8vw, 48px);
          height: clamp(44px, 8vw, 48px);
          background: #e0f2fe;
          border-radius: 14px;
          flex-shrink: 0;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid #bae6fd;
          /* Ensure icon doesn't get cut */
          overflow: visible;
        }

        .search-box.focused .search-icon-wrapper {
          background: #2563eb;
          /* Reduced rotation to prevent clipping */
          transform: rotate(6deg) scale(1.05);
          box-shadow: 0 6px 16px rgba(29, 78, 216, 0.35);
        }
        
        .search-icon-wrapper svg {
          width: clamp(20px, 4vw, 24px);
          height: clamp(20px, 4vw, 24px);
          color: #64748b;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .search-box.focused .search-icon-wrapper svg {
          color: white;
          transform: scale(1.1);
        }

        /* ===== INPUT WRAPPER ===== */
        .search-input-wrapper {
          flex: 1;
          position: relative;
          min-width: 0;
          /* Extra padding bottom for hint text */
          padding-bottom: clamp(1.25rem, 3vw, 2rem);
        }
        
        .search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: clamp(0.9375rem, 2vw, 1.125rem);
          color: #1e293b;
          width: 100%;
          font-family: inherit;
          font-weight: 500;
          padding: 0.75rem 0;
          line-height: 1.5;
          transition: all 0.3s ease;
        }

        .search-input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .search-input:focus::placeholder {
          color: #cbd5e1;
        }

        /* ===== SEARCH COUNT HINT ===== */
        .search-count {
          position: absolute;
          /* Positioned inside wrapper to prevent clipping */
          bottom: 0;
          left: 0;
          font-size: clamp(0.6875rem, 1.5vw, 0.75rem);
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          opacity: 0;
          transform: translateY(-5px);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .search-box.focused .search-count {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* ===== SEARCH BUTTON ===== */
        .search-button {
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 14px;
          padding: clamp(0.75rem, 2vw, 0.875rem) clamp(1.25rem, 3vw, 1.75rem);
          font-size: clamp(0.9375rem, 1.8vw, 1rem);
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(0.5rem, 1.5vw, 0.625rem);
          will-change: transform, box-shadow;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          white-space: nowrap;
          box-shadow: 
            0 8px 24px rgba(37, 99, 235, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          flex-shrink: 0;
          min-height: clamp(44px, 8vw, 48px);
          position: relative;
          overflow: hidden;
          letter-spacing: 0.3px;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .search-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .search-button:hover::before {
          opacity: 1;
        }
        
        .search-button svg {
          width: clamp(18px, 3vw, 20px);
          height: clamp(18px, 3vw, 20px);
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .search-button:hover svg {
          transform: scale(1.2) rotate(8deg);
        }
        
        .search-button:hover {
          /* Reduced transform to prevent clipping */
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            0 12px 36px rgba(37, 99, 235, 0.5),
            0 0 30px rgba(59, 130, 246, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          background: #3b82f6;
        }
        
        .search-button:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 
            0 4px 16px rgba(29, 78, 216, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .search-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          pointer-events: none;
        }

        /* ===== FLOATING PARTICLES ===== */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          pointer-events: none;
          animation: particleFloat 15s linear infinite;
          z-index: 0;
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }

        .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { left: 25%; animation-delay: 3s; }
        .particle:nth-child(3) { left: 40%; animation-delay: 6s; }
        .particle:nth-child(4) { left: 55%; animation-delay: 9s; }
        .particle:nth-child(5) { left: 70%; animation-delay: 12s; }
        .particle:nth-child(6) { left: 85%; animation-delay: 15s; }

        /* ===== RESPONSIVE - TABLET ===== */
        @media (min-width: 768px) and (max-width: 1023px) {
          .search-section {
            padding: clamp(3.5rem, 7vw, 5rem) clamp(1.5rem, 3vw, 2rem);
          }

          .search-header {
            margin-bottom: 2.5rem;
          }
        }

        /* ===== RESPONSIVE - MOBILE ===== */
        @media (max-width: 767px) {
          .search-section {
            padding: clamp(3rem, 6vw, 4rem) clamp(1rem, 3vw, 1.5rem);
          }

          .search-header {
            margin-bottom: 2rem;
          }

          .search-box {
            padding: 0.875rem;
            border-radius: 16px;
          }

          .search-box-wrapper {
            padding: 0.75rem;
            margin: -0.75rem;
          }

          .search-content {
            flex-direction: column;
            gap: 1rem;
          }

          .search-field {
            width: 100%;
            padding: 0.5rem;
          }

          .search-icon-wrapper {
            width: 44px;
            height: 44px;
          }

          .search-icon-wrapper svg {
            width: 20px;
            height: 20px;
          }

          .search-button {
            width: 100%;
            padding: 1rem 1.5rem;
            min-height: 48px;
          }

          /* Reduced transforms on mobile */
          .search-box.focused {
            transform: translateY(-2px) scale(1.002);
          }

          .search-box.focused .search-icon-wrapper {
            transform: rotate(4deg) scale(1.03);
          }

          .search-button:hover {
            transform: translateY(-1px) scale(1.01);
          }
        }

        @media (max-width: 480px) {
          .search-title {
            font-size: 1.5rem;
          }

          .search-subtitle {
            font-size: 0.9rem;
          }

          .header-badge {
            font-size: 0.8125rem;
            padding: 0.4rem 0.875rem;
          }

          .search-input {
            font-size: 0.9375rem;
          }

          .search-button {
            font-size: 0.9375rem;
            padding: 0.875rem 1.25rem;
          }

          .search-count {
            font-size: 0.6875rem;
          }
        }

        /* ===== ACCESSIBILITY ===== */
        @media (prefers-reduced-motion: reduce) {
          .search-section,
          .search-container,
          .search-box,
          .search-button,
          .search-icon-wrapper,
          .search-count {
            transition: none !important;
            animation: none !important;
          }
        }

        /* ===== LANDSCAPE MOBILE ===== */
        @media (max-width: 896px) and (orientation: landscape) {
          .search-section {
            padding: 2.5rem 1.5rem;
          }

          .search-header {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>

      

      {/* Floating Particles */}
      <div className="particle" style={{ bottom: '0' }} />
      <div className="particle" style={{ bottom: '0' }} />
      <div className="particle" style={{ bottom: '0' }} />
      <div className="particle" style={{ bottom: '0' }} />
      <div className="particle" style={{ bottom: '0' }} />
      <div className="particle" style={{ bottom: '0' }} />

      <div className="search-container">
        {/* Header Section */}
        <div className="search-header">
          <div className="header-badge">
            <Sparkles color="white" />
            <span className="text-white">TEMUKAN UMKM TERBAIK</span>
          </div>
          <h2 className="search-title">
            Cari UMKM Pilihan Anda
          </h2>
          <p className="search-subtitle">
            Jelajahi ribuan UMKM terpercaya di seluruh Indonesia
          </p>
        </div>

        {/* Search Box with Wrapper to prevent clipping */}
        <div className="search-box-wrapper">
          <div className={`search-box ${isFocused ? 'focused' : ''}`}>
            <div className="search-content">
              <div className="search-field">
                <div className="search-icon-wrapper">
                  <Search strokeWidth={2.5} />
                </div>
                
                <div className="search-input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Cari produk, jasa, atau UMKM..." 
                    className="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    suppressHydrationWarning
                  />
                  {isFocused && (
                    <div className="search-count">
                      Tekan Enter atau klik tombol untuk mencari
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                className="search-button" 
                onClick={handleSearch}
                disabled={!query.trim()}
                suppressHydrationWarning
              >
                <Search strokeWidth={2.5} />
                <span>Cari Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}