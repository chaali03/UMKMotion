// src/components/Etalase/Kategori.jsx
import React, { useState, useEffect, useRef } from "react";
import { Utensils, Wrench, Shirt, Palette, HeartPulse, Sprout, Laptop, Armchair, Ellipsis, Sparkles, GraduationCap } from "lucide-react";

export default function Kategori({ selectedCategory: parentCategory, setSelectedCategory: setParentCategory, onSearch }) {
  const [localCategory, setLocalCategory] = useState(parentCategory || "all");
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const sectionRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sinkronkan kategori awal dengan URL & localStorage (klik dari landing)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCat = params.get("cat");

      let initialCat = "all";
      if (urlCat) {
        initialCat = urlCat;
      } else {
        const stored = localStorage.getItem("currentStoreCategory");
        if (stored) initialCat = stored;
      }

      setLocalCategory(initialCat);
      if (setParentCategory) setParentCategory(initialCat);
      window.dispatchEvent(new CustomEvent("categoryChange", { detail: initialCat }));
    } catch {}
  }, [setParentCategory]);

  const categories = [
    { 
      id: "all", 
      label: "Semua", 
      color: { gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", light: "#f0f4ff", text: "#667eea" },
      icon: <Sparkles />
    },
    { 
      id: "food", 
      label: "Kuliner", 
      color: { gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", light: "#fff0f5", text: "#f5576c" },
      icon: <Utensils />
    },
    { 
      id: "service", 
      label: "Jasa", 
      color: { gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", light: "#ebf5ff", text: "#3b82f6" },
      icon: <Wrench />
    },
    { 
      id: "fashion", 
      label: "Fashion", 
      color: { gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", light: "#fff8e7", text: "#fa709a" },
      icon: <Shirt />
    },
    { 
      id: "craft", 
      label: "Kerajinan", 
      color: { gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", light: "#e7f9ff", text: "#00f2fe" },
      icon: <Palette />
    },
    { 
      id: "beauty", 
      label: "Kesehatan", 
      color: { gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", light: "#e7fff9", text: "#38f9d7" },
      icon: <HeartPulse />
    },
    { 
      id: "agriculture", 
      label: "Pertanian", 
      color: { gradient: "linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)", light: "#f7ffe7", text: "#7cb342" },
      icon: <Sprout />
    },
    { 
      id: "electronics", 
      label: "Elektronik", 
      color: { gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", light: "#fceeff", text: "#a18cd1" },
      icon: <Laptop />
    },
    { 
      id: "furniture", 
      label: "Furniture", 
      color: { gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", light: "#fff5f0", text: "#fcb69f" },
      icon: <Armchair />
    },
    { 
      id: "education", 
      label: "Edukasi", 
      color: { gradient: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", light: "#eef2ff", text: "#3b82f6" },
      icon: <GraduationCap />
    },
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

  const smoothScroll = (element, target, duration = 400) => {
    const start = element.scrollLeft;
    const distance = target - start;
    let startTime = null;

    const animation = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      element.scrollLeft = start + distance * ease;

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  const scrollPrev = () => {
    const section = sectionRef.current;
    if (section) smoothScroll(section, section.scrollLeft - 600, 500);
  };

  const scrollNext = () => {
    const section = sectionRef.current;
    if (section) smoothScroll(section, section.scrollLeft + 600, 500);
  };

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

    const checkScroll = () => {
      setCanScrollPrev(section.scrollLeft > 10);
      setCanScrollNext(section.scrollLeft < section.scrollWidth - section.clientWidth - 10);
    };

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

    checkScroll();

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

  const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );

  const LeftArrow = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );

  const RightArrow = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );

  const FilterIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="filter-icon">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );

  return (
    <>
      <style>{`
        /* ========================================
           BASE STYLES 
           ======================================== */
        .kategori-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: clamp(20px, 4vw, 32px);
          padding: clamp(20px, 4vw, 48px);
          margin: clamp(16px, 3vw, 32px) auto;
          max-width: min(1800px, 95vw);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          position: relative;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.05),
            0 8px 24px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
        }

        .kategori-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, 
            #667eea, #764ba2, #f093fb, #f5576c, 
            #4facfe, #00f2fe, #43e97b, #667eea);
          background-size: 200% 100%;
          animation: rainbowShimmer 3s linear infinite;
        }

        @keyframes rainbowShimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .search-form {
          display: flex;
          gap: clamp(12px, 2vw, 24px);
          margin-bottom: clamp(24px, 4vw, 48px);
          flex-wrap: wrap;
          position: relative;
        }

        .search-input-wrapper {
          flex: 1;
          min-width: min(100%, 300px);
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: clamp(16px, 2vw, 24px);
          top: 50%;
          transform: translateY(-50%);
          width: clamp(20px, 2.5vw, 28px);
          height: clamp(20px, 2.5vw, 28px);
          color: #9ca3af;
          pointer-events: none;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .search-input-wrapper:focus-within .search-icon {
          color: #3b82f6;
          transform: translateY(-50%) scale(1.1);
        }

        .search-input {
          width: 100%;
          padding: clamp(16px, 2.5vw, 24px) clamp(20px, 3vw, 28px) clamp(16px, 2.5vw, 24px) clamp(48px, 6vw, 64px);
          border: 2px solid #e5e7eb;
          border-radius: clamp(16px, 2vw, 24px);
          font-size: clamp(0.9rem, 1.5vw, 1.1rem);
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .search-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
          font-size: clamp(0.85rem, 1.4vw, 1.05rem);
        }

        .search-input:focus {
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.95);
          outline: none;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }

        .search-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 0 clamp(24px, 4vw, 48px);
          border-radius: clamp(16px, 2vw, 24px);
          font-weight: 700;
          font-size: clamp(0.9rem, 1.5vw, 1.1rem);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          height: clamp(52px, 7vw, 68px);
          position: relative;
          overflow: hidden;
          letter-spacing: -0.2px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          flex-shrink: 0;
        }

        .search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        }

        .search-btn:active {
          transform: translateY(0);
        }

        .filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: clamp(20px, 3vw, 40px);
          gap: clamp(12px, 2vw, 24px);
        }

        .filter-title-wrapper {
          display: flex;
          align-items: center;
          gap: clamp(8px, 1.5vw, 16px);
          flex: 1;
          justify-content: center;
        }

        .filter-icon {
          width: clamp(24px, 3vw, 32px);
          height: clamp(24px, 3vw, 32px);
          color: #3b82f6;
          animation: pulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .filter-title {
          font-size: clamp(1.25rem, 2.5vw, 2rem);
          font-weight: 800;
          color: #1f2937;
          margin: 0;
          white-space: nowrap;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #1f2937 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .scroll-btn {
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #e5e7eb;
          width: clamp(44px, 6vw, 60px);
          height: clamp(44px, 6vw, 60px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #6b7280;
          flex-shrink: 0;
          z-index: 10;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .scroll-btn:hover:not(:disabled) {
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
        }

        .scroll-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .scroll-btn svg {
          width: clamp(18px, 2.5vw, 24px);
          height: clamp(18px, 2.5vw, 24px);
        }

        .category-section {
          display: flex;
          gap: clamp(12px, 2vw, 24px);
          overflow-x: auto;
          overflow-y: hidden;
          padding: clamp(12px, 2vw, 20px) clamp(4px, 1vw, 8px);
          scroll-behavior: smooth;
          cursor: grab;
          user-select: none;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
          scroll-snap-type: x proximity;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .category-section::-webkit-scrollbar { display: none; }
        .category-section.grabbing { cursor: grabbing; scroll-behavior: auto; }

        .category-btn {
          flex-shrink: 0;
          padding: clamp(20px, 3vw, 40px) clamp(16px, 2.5vw, 28px);
          background: rgba(255, 255, 255, 0.8);
          border: 2px solid #e5e7eb;
          border-radius: clamp(20px, 3vw, 28px);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(12px, 2vw, 20px);
          text-align: center;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          min-width: clamp(90px, 15vw, 200px);
        }

        .category-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: clamp(18px, 3vw, 26px);
        }

        .category-btn:hover {
          border-color: #3b82f6;
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
        }

        .category-btn:hover::before {
          opacity: 1;
        }

        .category-btn.active {
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(59, 130, 246, 0.15);
        }

        .category-icon {
          width: clamp(44px, 8vw, 80px);
          height: clamp(44px, 8vw, 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: clamp(16px, 2.5vw, 24px);
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .category-btn[data-category="all"] .category-icon { background: linear-gradient(135deg, #eef2ff, #e0e7ff); }
        .category-btn[data-category="food"] .category-icon { background: linear-gradient(135deg, #fef2f2, #ffe4e6); }
        .category-btn[data-category="fashion"] .category-icon { background: linear-gradient(135deg, #fef2f2, #fff7ed); }
        .category-btn[data-category="craft"] .category-icon { background: linear-gradient(135deg, #eff6ff, #ecfeff); }
        .category-btn[data-category="beauty"] .category-icon { background: linear-gradient(135deg, #f0fdf4, #ecfdf5); }
        .category-btn[data-category="agriculture"] .category-icon { background: linear-gradient(135deg, #f7fee7, #fefce8); }
        .category-btn[data-category="electronics"] .category-icon { background: linear-gradient(135deg, #faf5ff, #fce7f3); }
        .category-btn[data-category="furniture"] .category-icon { background: linear-gradient(135deg, #fff7ed, #ffedd5); }
        .category-btn[data-category="education"] .category-icon { background: linear-gradient(135deg, #fff7ed, #fce7f3); }

        .category-btn.active .category-icon {
          transform: scale(1.08);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .category-btn svg {
          width: clamp(18px, 4vw, 36px);
          height: clamp(18px, 4vw, 36px);
          transition: all 0.3s ease;
          stroke-width: 2;
        }

        .category-btn[data-category="all"] svg { color: #667eea; }
        .category-btn[data-category="food"] svg { color: #f5576c; }
        .category-btn[data-category="fashion"] svg { color: #fa709a; }
        .category-btn[data-category="craft"] svg { color: #00f2fe; }
        .category-btn[data-category="beauty"] svg { color: #38f9d7; }
        .category-btn[data-category="agriculture"] svg { color: #7cb342; }
        .category-btn[data-category="electronics"] svg { color: #a18cd1; }
        .category-btn[data-category="furniture"] svg { color: #fcb69f; }
        .category-btn[data-category="education"] svg { color: #ff9a56; }

        .category-btn.active svg { 
          color: #3b82f6;
          transform: scale(1.15);
        }

        .category-btn span {
          font-size: clamp(0.8rem, 1.5vw, 1.1rem);
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: clamp(70px, 15vw, 160px);
          position: relative;
          z-index: 1;
          letter-spacing: -0.2px;
          color: #374151;
          transition: color 0.3s ease;
        }

        .category-btn.active span {
          color: #1f2937;
          font-weight: 800;
        }

        /* ========================================
           RESPONSIVE BREAKPOINTS 
           ======================================== */

        /* 📱 Mobile First - Extra Small (< 480px) */
        @media (max-width: 479px) {
          .kategori-card {
            padding: 16px 8px;
            margin: 12px 4px;
            border-radius: 16px;
          }

          .search-form {
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
          }

          .search-input-wrapper {
            min-width: 100%;
          }

          .search-input, .search-btn {
            width: 100%;
            height: 48px;
            font-size: 0.85rem;
            border-radius: 12px;
          }

          .search-icon {
            width: 18px;
            height: 18px;
            left: 12px;
          }

          .filter-header {
            margin-bottom: 16px;
            gap: 8px;
          }

          .filter-title {
            font-size: 1.1rem;
          }

          .filter-icon {
            width: 20px;
            height: 20px;
          }

          .scroll-btn {
            width: 40px;
            height: 40px;
          }

          .category-section {
            gap: 8px;
            padding: 10px 4px;
          }

          .category-btn {
            min-width: 80px;
            padding: 14px 8px;
            gap: 8px;
            border-radius: 14px;
          }

          .category-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }

          .category-btn svg {
            width: 16px;
            height: 16px;
          }

          .category-btn span {
            font-size: 0.75rem;
            max-width: 64px;
          }
        }

        /* 📱 Small Mobile (480px - 639px) */
        @media (min-width: 480px) and (max-width: 639px) {
          .search-form {
            flex-direction: column;
            gap: 12px;
          }

          .category-btn {
            min-width: 100px;
            padding: 18px 12px;
          }
        }

        /* 📱 Mobile (640px - 767px) */
        @media (min-width: 640px) and (max-width: 767px) {
          .search-form {
            flex-direction: column;
          }

          .category-btn {
            min-width: 110px;
          }
        }

        /* 📱 Tablet (768px - 1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .search-input-wrapper {
            min-width: 400px;
          }

          .category-btn {
            min-width: 140px;
          }
        }

        /* 💻 Desktop (1024px - 1439px) */
        @media (min-width: 1024px) and (max-width: 1439px) {
          .search-input-wrapper {
            min-width: 450px;
          }

          .category-btn {
            min-width: 160px;
          }
        }

        /* 🖥️ Large Desktop (1440px+) */
        @media (min-width: 1440px) {
          .search-input-wrapper {
            min-width: 500px;
          }

          .category-btn {
            min-width: 180px;
          }
        }

        /* 🖥️ Ultra Wide (1920px+) */
        @media (min-width: 1920px) {
          .kategori-card {
            max-width: 2000px;
            padding: 56px;
          }

          .category-btn {
            min-width: 220px;
            padding: 48px 32px;
          }
        }

        /* Touch Device Optimization */
        @media (hover: none) and (pointer: coarse) {
          .category-btn:hover {
            transform: none;
          }

          .category-btn:active {
            transform: scale(0.97);
          }

          .scroll-btn {
            display: none;
          }

          .filter-title-wrapper {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>

      <div className="kategori-card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <SearchIcon />
            <input 
              ref={searchInputRef} 
              type="text" 
              className="search-input" 
              placeholder="Cari produk, jasa, atau UMKM favorit..." 
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
          <button type="submit" className="search-btn">
            Cari Sekarang
          </button>
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
          <div className="filter-title-wrapper">
            <FilterIcon />
            <h3 className="filter-title">Pilih Kategori</h3>
          </div>
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
              data-category={cat.id}
              className={`category-btn ${localCategory === cat.id ? "active" : ""}`}
              onClick={() => handleSelect(cat.id)}
            >
              <div className="category-icon">
                {cat.icon}
              </div>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}