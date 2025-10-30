import { useState, useEffect, useRef } from 'react';
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
    if (onSearch && query.trim()) {
      onSearch(query);
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
        .search-section {
          position: relative;
          width: 100%;
          max-width: 100%;
          padding: clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem);
          overflow: hidden;
          background: #2563eb;
          box-sizing: border-box;
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1), transform 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .search-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Animated Background Orbs */
        .search-section::before,
        .search-section::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: float 20s ease-in-out infinite;
        }

        .search-section::before {
          width: 500px;
          height: 500px;
          background: rgba(37, 99, 235, 0.4);
          top: -250px;
          right: -150px;
          animation-delay: 0s;
        }

        .search-section::after {
          width: 600px;
          height: 600px;
          background: rgba(37, 99, 235, 0.4);
          bottom: -300px;
          left: -200px;
          animation-delay: 5s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          33% { transform: translate(40px, -40px) scale(1.1); opacity: 0.4; }
          66% { transform: translate(-30px, 30px) scale(0.95); opacity: 0.35; }
        }

        /* Grid Pattern Overlay */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1px, transparent 0);
          background-size: 40px 40px;
          opacity: 0.4;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
        }

        .search-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 0;
          box-sizing: border-box;
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s;
          position: relative;
          z-index: 1;
          className="flex items-center justify-center gap-3 px-8 h-16 md:h-20 text-lg md:text-xl font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl whitespace-nowrap transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 active:scale-95";
        }

        .search-section.visible .search-container {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Header Section */
        .search-header {
          text-align: center;
          margin-bottom: 2.5rem;
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
        
        /* Premium Search Box */
        .search-box {
          width: 100%;
          background: #FFFFFF;
          border-radius: 20px;
          padding: 1rem;
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.05) inset;
          backdrop-filter: blur(20px);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          className="w-full h-16 md:h-20 px-6 md:px-8 text-lg md:text-xl rounded-2xl border-2 border-blue-300/50 bg-white/10 backdrop-blur-lg text-white placeholder-blue-100/70 focus:outline-none focus:ring-2 focus:ring-blue-200/50 focus:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-white/15";
        }

        .search-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: #2563eb;
          transition: left 0.6s ease;
        }

        .search-box.focused {
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            0 0 0 2px #FF6914 inset;
          transform: translateY(-2px) scale(1.01);
        }

        .search-box.focused::before {
          left: 100%;
        }
        
        .search-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        
        .search-field {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          padding: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .search-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: #e0f2fe;
          border-radius: 14px;
          flex-shrink: 0;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid #bae6fd;
        }

        .search-box.focused .search-icon-wrapper {
          background: #2563eb;
          transform: rotate(8deg) scale(1.05);
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
        }
        
        .search-icon-wrapper svg {
          width: 24px;
          height: 24px;
          color: #64748b;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .search-box.focused .search-icon-wrapper svg {
          color: white;
          transform: scale(1.1);
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
        }
        
        .search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: clamp(1rem, 2.5vw, 1.125rem);
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

        /* Search Suggestions Indicator */
        .search-count {
          position: absolute;
          bottom: -1.5rem;
          left: 0;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          opacity: 0;
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }

        .search-box.focused .search-count {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Premium Search Button */
        .search-button {
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 14px;
          padding: 0.875rem 1.75rem;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          white-space: nowrap;
          box-shadow: 
            0 8px 24px rgba(37, 99, 235, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          flex-shrink: 0;
          min-height: 48px;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.3px;
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
          width: 20px;
          height: 20px;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .search-button:hover svg {
          transform: scale(1.2) rotate(8deg);
        }
        
        .search-button:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 
            0 12px 36px rgba(37, 99, 235, 0.5),
            0 0 30px rgba(59, 130, 246, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          background: #3b82f6;
        }
        
        .search-button:active {
          transform: translateY(-1px) scale(0.98);
          box-shadow: 
            0 4px 16px rgba(29, 78, 216, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .search-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Floating Particles */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          pointer-events: none;
          animation: particleFloat 15s linear infinite;
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .search-section {
            padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 3vw, 1.5rem);
          }

          .search-header {
            margin-bottom: 1.75rem;
          }

          .search-box {
            padding: 0.75rem;
            border-radius: 16px;
          }

          .search-content {
            flex-direction: column;
            gap: 0.75rem;
          }

          .search-field {
            width: 100%;
            padding: 0.375rem;
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
            padding: 0.875rem 1.25rem;
            min-height: 48px;
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
            padding: 0.8rem 1rem;
          }
        }
      `}</style>

      {/* Grid Overlay */}
      <div className="grid-overlay" />

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

        {/* Search Box */}
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
            >
              <Search strokeWidth={2.5} />
              <span>Cari Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}