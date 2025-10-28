import { useState } from 'react';

interface SearchBarProps {
  onSearch?: (query: string, category: string, location: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query, category, location);
    }
  };

  return (
    <section className="search-section">
      <style>{`
        .search-section {
          position: relative;
          width: 100%;
          max-width: 100%;
          padding: clamp(1rem, 3vw, 3.5rem) clamp(0.5rem, 1.5vw, 1rem);
          overflow: hidden;
          background: linear-gradient(135deg, #FF6B00 0%, #C41E3A 25%, #6B2C91 50%, #1E3A8A 75%, #0066CC 100%);
          box-sizing: border-box;
        }

        .search-container {
          width: 100%;
          max-width: calc(100% - 1rem);
          margin: 0 auto;
          padding: 0;
          box-sizing: border-box;
        }
        
        .search-box {
          width: 100%;
          max-width: 100%;
          background: rgba(255, 255, 255, 0.98);
          border-radius: clamp(0.6rem, 1.5vw, 1.25rem);
          padding: clamp(0.5rem, 1.5vw, 1.25rem);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
          margin: 0;
        }
        
        .search-box:hover {
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.18);
          transform: translateY(-1px);
        }
        
        .search-content {
          display: flex;
          align-items: center;
          gap: clamp(0.5rem, 1.4vw, 1rem);
          flex-wrap: wrap;
          width: 100%;
        }
        
        .search-field,
        .filter-field,
        .location-field {
          display: flex;
          align-items: center;
          gap: clamp(0.35rem, 1vw, 0.6rem);
          flex: 1;
          min-width: clamp(100px, 22vw, 160px);
          max-width: 100%;
        }
        
        .search-icon,
        .filter-icon,
        .location-icon {
          color: #64748b;
          flex-shrink: 0;
          width: clamp(14px, 3.8vw, 20px);
          height: clamp(14px, 3.8vw, 20px);
        }
        
        .search-input,
        .category-select,
        .location-select {
          border: none;
          outline: none;
          background: transparent;
          font-size: clamp(0.75rem, 2vw, 0.95rem);
          color: #1e293b;
          width: 100%;
          font-family: inherit;
          padding: clamp(0.3rem, 0.8vw, 0.4rem) 0;
          line-height: 1.5;
        }
        
        .search-input::placeholder {
          color: #94a3b8;
        }
        
        .category-select,
        .location-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.15rem center;
          background-size: clamp(11px, 2.8vw, 16px);
          padding-right: clamp(1.4rem, 3.5vw, 2rem);
        }
        
        .divider {
          width: 1px;
          height: clamp(0.8rem, 2.2vw, 1.4rem);
          background: #e2e8f0;
          flex-shrink: 0;
          margin: clamp(0.05rem, 0.2vw, 0.1rem) 0;
        }
        
        .search-button {
          background: linear-gradient(135deg, #FF6B00 0%, #FF8534 100%);
          color: white;
          border: none;
          border-radius: clamp(0.4rem, 1vw, 0.6rem);
          padding: clamp(0.45rem, 1.2vw, 0.7rem) clamp(0.7rem, 2vw, 1.2rem);
          font-size: clamp(0.7rem, 1.8vw, 0.9rem);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(0.3rem, 0.8vw, 0.5rem);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(255, 107, 0, 0.3);
          flex-shrink: 0;
          min-height: 38px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          margin-top: clamp(0.15rem, 0.4vw, 0.25rem);
        }
        
        .search-button svg {
          width: clamp(12px, 2.8vw, 16px);
          height: clamp(12px, 2.8vw, 16px);
        }
        
        .search-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 0, 0.4);
          background: linear-gradient(135deg, #FF7A1A 0%, #FF9548 100%);
        }
        
        .search-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(255, 107, 0, 0.3);
        }

        @media (max-width: 768px) {
          .search-content {
            flex-direction: column;
            align-items: stretch;
            gap: 0.6rem;
          }

          .search-field,
          .filter-field,
          .location-field {
            width: 100%;
            min-width: unset;
            padding: 0.5rem 0;
          }

          .divider {
            width: 100%;
            height: 1px;
            margin: 0.12rem 0;
          }

          .search-button {
            width: 100%;
            margin-top: 0.2rem;
          }
        }

        @media (max-width: 480px) {
          .search-section {
            padding: 1.125rem 0.625rem;
          }

          .search-box {
            padding: 0.6rem;
            border-radius: 0.7rem;
          }

          .search-content {
            gap: 0.5rem;
          }

          .search-field,
          .filter-field,
          .location-field {
            padding: 0.4rem 0;
          }

          .search-icon,
          .filter-icon,
          .location-icon {
            width: 14px;
            height: 14px;
          }

          .search-input,
          .category-select,
          .location-select {
            font-size: 0.8rem;
          }

          .search-button {
            padding: 0.625rem 0.85rem;
            font-size: 0.8rem;
            min-height: 36px;
          }

          .search-button svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>

      <div className="search-container">
        <div className="search-box">
          <div className="search-content">
            <div className="search-field">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                type="text" 
                placeholder="Cari UMKM..." 
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="divider"></div>
            
            <div className="filter-field">
              <svg className="filter-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M7 12h10"></path>
                <path d="M10 18h4"></path>
              </svg>
              <select 
                className="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                <option value="kuliner">Kuliner</option>
                <option value="fashion">Fashion</option>
                <option value="kerajinan">Kerajinan</option>
                <option value="jasa">Jasa</option>
              </select>
            </div>
            
            <div className="divider"></div>
            
            <div className="location-field">
              <svg className="location-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <select 
                className="location-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Semua Lokasi</option>
                <option value="jakarta">Jakarta</option>
                <option value="bandung">Bandung</option>
                <option value="surabaya">Surabaya</option>
                <option value="yogyakarta">Yogyakarta</option>
              </select>
            </div>
            
            <button className="search-button" onClick={handleSearch}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <span className="search-text">Cari</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
