// src/components/Etalase/Kategori.jsx
import React, { useState, useEffect, useRef } from "react";

export default function Kategori({ selectedCategory: parentCategory, setSelectedCategory: setParentCategory, onSearch }) {
  const [localCategory, setLocalCategory] = useState(parentCategory || "all");
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const sectionRef = useRef(null);
  const searchInputRef = useRef(null);

  const categories = [
    { id: "all", label: "Semua", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><circle cx="15" cy="9" r="2"/><circle cx="12" cy="15" r="2"/></svg> },
    { id: "food", label: "Kuliner", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
    { id: "fashion", label: "Fashion", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2m0 0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7"/></svg> },
    { id: "craft", label: "Kerajinan", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.9l3 5.4a2 2 0 0 1-3.6 2l-5.4-3a2 2 0 0 1 3.6-2zM12 9.1l3 5.4a2 2 0 0 1-3.6 2l-5.4-3a2 2 0 0 1 3.6-2zM12 15.3l3 5.4a2 2 0 0 1-3.6 2l-5.4-3a2 2 0 0 1 3.6-2z"/></svg> },
    { id: "beauty", label: "Kesehatan", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
    { id: "agriculture", label: "Pertanian", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9a9 9 0 0 1 18 0"/><path d="M21 15a4 4 0 0 1-8 0 4 4 0 0 1-8 0"/><path d="M3 12h18"/></svg> },
    { id: "electronics", label: "Elektronik", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 7v1M7 7v1M12 7v1M7 21v-1M17 21v-1"/></svg> },
    { id: "furniture", label: "Furniture", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg> },
    { id: "education", label: "Edukasi", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7z"/><line x1="2" y1="17" x2="22" y2="17"/><polyline points="2,12 9,9 15,12 22,9"/></svg> },
  ];

  const handleSelect = (category) => {
    setLocalCategory(category);
    if (setParentCategory) setParentCategory(category);
    window.dispatchEvent(new CustomEvent("categoryChange", { detail: category }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchInputRef.current?.value.trim() || "";
    if (onSearch) onSearch(query);
    window.dispatchEvent(new CustomEvent("searchChange", { detail: query }));
  };

  // SMOOTH SCROLL CUSTOM
  const smoothScroll = (element, target, duration = 400) => {
    const start = element.scrollLeft;
    const distance = target - start;
    let startTime = null;

    const animation = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      element.scrollLeft = start + distance * ease;

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  const scrollPrev = () => {
    const section = sectionRef.current;
    if (section) smoothScroll(section, section.scrollLeft - 320, 500);
  };

  const scrollNext = () => {
    const section = sectionRef.current;
    if (section) smoothScroll(section, section.scrollLeft + 320, 500);
  };

  // SCROLL LOGIC — WHEEL + DRAG + TOUCH + INERTIA
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let velocity = 0;
    let rafId = null;

    const start = (e) => {
      isDown = true;
      section.classList.add("grabbing");
      startX = e.pageX || e.touches?.[0]?.pageX;
      scrollLeft = section.scrollLeft;
      velocity = 0;
      cancelAnimationFrame(rafId);
    };

    const end = () => {
      if (!isDown) return;
      isDown = false;
      section.classList.remove("grabbing");
      const momentum = () => {
        if (Math.abs(velocity) > 0.5) {
          section.scrollBy({ left: velocity, behavior: "auto" });
          velocity *= 0.95;
          rafId = requestAnimationFrame(momentum);
        }
      };
      rafId = requestAnimationFrame(momentum);
    };

    const move = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX || e.touches?.[0]?.pageX;
      const walk = (x - startX) * 2.5;
      const prev = section.scrollLeft;
      section.scrollLeft = scrollLeft - walk;
      velocity = section.scrollLeft - prev;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * 1.2 || e.deltaX * 1.2;
      section.scrollBy({ left: delta, behavior: "auto" });
    };

    // CHECK SCROLL LIMITS
    const checkScroll = () => {
      setCanScrollPrev(section.scrollLeft > 10);
      setCanScrollNext(section.scrollLeft < section.scrollWidth - section.clientWidth - 10);
    };

    // Events
    section.addEventListener("mousedown", start);
    section.addEventListener("mousemove", move);
    section.addEventListener("mouseup", end);
    section.addEventListener("mouseleave", end);

    section.addEventListener("touchstart", start, { passive: false });
    section.addEventListener("touchmove", move, { passive: false });
    section.addEventListener("touchend", end);
    section.addEventListener("touchcancel", end);

    section.addEventListener("wheel", handleWheel, { passive: false });
    section.addEventListener("scroll", checkScroll);

    checkScroll(); // Initial check

    return () => {
      section.removeEventListener("mousedown", start);
      section.removeEventListener("mousemove", move);
      section.removeEventListener("mouseup", end);
      section.removeEventListener("mouseleave", end);
      section.removeEventListener("touchstart", start);
      section.removeEventListener("touchmove", move);
      section.removeEventListener("touchend", end);
      section.removeEventListener("touchcancel", end);
      section.removeEventListener("wheel", handleWheel);
      section.removeEventListener("scroll", checkScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // SVG ICONS
  const LeftArrow = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );

  const RightArrow = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );

  return (
    <>
      <style jsx>{`
        .kategori-card {
          background: white;
          border-radius: 28px;
          padding: 32px;
          margin: 20px auto;
          max-width: 1400px;
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }

        .search-form {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 250px;
          padding: 16px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 18px;
          font-size: 1rem;
          background: #f8fafc;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          border-color: #ff6b35;
          box-shadow: 0 0 0 5px rgba(255,107,53,0.15);
          background: white;
          outline: none;
        }

        .search-btn {
          background: linear-gradient(135deg, #ff6b35, #f33636);
          color: white;
          border: none;
          padding: 0 28px;
          border-radius: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          height: 56px;
        }

        .search-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(255,107,53,0.4);
        }

        .filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
        }

        .filter-title {
          font-size: 1.4rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ff6b35, #f33636);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          white-space: nowrap;
        }

        .scroll-btn {
          background: #f1f5f9;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #64748b;
          flex-shrink: 0;
          z-index: 10;
        }

        .scroll-btn:hover:not(:disabled) {
          background: #ff6b35;
          color: white;
          transform: scale(1.12);
        }

        .scroll-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #f1f5f9;
          color: #94a3b8;
        }

        .scroll-btn svg {
          width: 20px;
          height: 20px;
        }

        .category-section {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 12px 0;
          scroll-behavior: smooth;
          cursor: grab;
          user-select: none;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
          scroll-snap-type: x proximity;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .category-section::-webkit-scrollbar {
          display: none;
        }

        .category-section.grabbing {
          cursor: grabbing;
          scroll-behavior: auto;
        }

        .category-btn {
          flex-shrink: 0;
          width: 120px;
          padding: 20px 12px;
          background: #f8fafc;
          border: 2px solid transparent;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .category-btn:hover {
          border-color: #ff6b35;
          background: white;
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(255,107,53,0.2);
        }

        .category-btn.active {
          background: linear-gradient(135deg, #ff6b35, #f33636);
          border-color: transparent;
          color: white;
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(255,107,53,0.35);
        }

        .category-btn svg {
          width: 36px;
          height: 36px;
          color: #64748b;
          transition: color 0.3s;
        }

        .category-btn:hover svg,
        .category-btn.active svg {
          color: #ff6b35;
        }

        .category-btn.active svg {
          color: white;
        }

        .category-btn span {
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100px;
        }

        @media (max-width: 768px) {
          .kategori-card { padding: 24px 16px; margin: 16px; border-radius: 24px; }
          .search-form { flex-direction: column; gap: 12px; }
          .search-input, .search-btn { width: 100%; height: 52px; }
          .filter-header { margin-bottom: 16px; }
          .scroll-btn { width: 36px; height: 36px; }
          .scroll-btn svg { width: 18px; height: 18px; }
          .category-section { gap: 12px; padding: 10px 0; }
          .category-btn { width: 100px; padding: 16px 8px; }
          .category-btn svg { width: 32px; height: 32px; }
          .filter-title { font-size: 1.25rem; }
        }

        @media (max-width: 480px) {
          .category-section { gap: 10px; }
          .category-btn { width: 90px; padding: 14px 6px; }
          .category-btn span { font-size: 0.75rem; max-width: 80px; }
        }
      `}</style>

      <div className="kategori-card">
        <form onSubmit={handleSearch} className="search-form">
          <input ref={searchInputRef} type="text" className="search-input" placeholder="Cari produk, jasa, UMKM..." />
          <button type="submit" className="search-btn">Cari</button>
        </form>

        <div className="filter-header">
          <button 
            onClick={scrollPrev} 
            className="scroll-btn" 
            disabled={!canScrollPrev}
            aria-label="Scroll kiri"
          >
            <LeftArrow />
          </button>
          <h3 className="filter-title">Pilih Kategori</h3>
          <button 
            onClick={scrollNext} 
            className="scroll-btn" 
            disabled={!canScrollNext}
            aria-label="Scroll kanan"
          >
            <RightArrow />
          </button>
        </div>

        <div ref={sectionRef} className="category-section">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${localCategory === cat.id ? "active" : ""}`}
              onClick={() => handleSelect(cat.id)}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}