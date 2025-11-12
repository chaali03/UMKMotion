// src/components/Etalase/Kategori.jsx
import React, { useState, useEffect, useRef } from "react";

export default function Kategori({ selectedCategory: parentCategory, setSelectedCategory: setParentCategory, onSearch }) {
  const [localCategory, setLocalCategory] = useState(parentCategory || "all");
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const sectionRef = useRef(null);
  const searchInputRef = useRef(null);

  const categories = [
    { 
      id: "all", 
      label: "Semua", 
      color: { gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", light: "#f0f4ff", text: "#667eea" },
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><circle cx="15" cy="9" r="2"/><circle cx="12" cy="15" r="2"/></svg> 
    },
    { 
      id: "food", 
      label: "Kuliner", 
      color: { gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", light: "#fff0f5", text: "#f5576c" },
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> 
    },
    { 
      id: "fashion", 
      label: "Fashion", 
      color: { gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", light: "#fff8e7", text: "#fa709a" },
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> 
    },
    { 
      id: "craft", 
      label: "Kerajinan", 
      color: { gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", light: "#e7f9ff", text: "#00f2fe" },
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg> 
    },
    { 
      id: "beauty", 
      label: "Kesehatan", 
      color: { gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", light: "#e7fff9", text: "#38f9d7" },
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> 
    },
    { 
      id: "agriculture", 
      label: "Pertanian", 
      color: { gradient: "linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)", light: "#f7ffe7", text: "#7cb342" },
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6v6l4 2"/></svg> 
    },
    { 
      id: "electronics", 
      label: "Elektronik", 
      color: { gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", light: "#fceeff", text: "#a18cd1" },
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> 
    },
    { 
      id: "furniture", 
      label: "Furniture", 
      color: { gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", light: "#fff5f0", text: "#fcb69f" },
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9v11M21 9v11M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2M3 9h18"/><path d="M5 20h14"/></svg> 
    },
    { 
      id: "education", 
      label: "Edukasi", 
      color: { gradient: "linear-gradient(135deg, #ff9a56 0%, #fecfef 100%)", light: "#fff0f7", text: "#ff9a56" },
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> 
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
    if (section) smoothScroll(section, section.scrollLeft - 500, 500);
  };

  const scrollNext = () => {
    const section = sectionRef.current;
    if (section) smoothScroll(section, section.scrollLeft + 500, 500);
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
        .kategori-card {
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          border-radius: 42px;
          padding: 56px;
          margin: 32px auto;
          max-width: 1600px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          position: relative;
        }

        .kategori-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe, #43e97b, #667eea);
          background-size: 200% 100%;
          animation: rainbowShimmer 4s linear infinite;
        }

        @keyframes rainbowShimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .search-form {
          display: flex;
          gap: 24px;
          margin-bottom: 48px;
          flex-wrap: wrap;
          position: relative;
        }

        .search-input-wrapper {
          flex: 1;
          min-width: 400px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 24px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          color: #9ca3af;
          pointer-events: none;
          transition: color 0.3s;
        }

        .search-input-wrapper:focus-within .search-icon {
          color: var(--brand-blue-ink);
        }

        .search-input {
          width: 100%;
          padding: 24px 28px 24px 68px;
          border: 3px solid #9ca3af;
          border-radius: 28px;
          font-size: 1.15rem;
          background: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-input::placeholder {
          color: #9ca3af;
          font-size: 1.1rem;
        }

        .search-input:focus {
          border-color: var(--brand-blue-ink);
          background: white;
          outline: none;
        }

        .search-btn {
          background: var(--brand-orange);
          color: white;
          border: none;
          padding: 0 48px;
          border-radius: 28px;
          font-weight: 800;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          height: 72px;
          position: relative;
          overflow: hidden;
          letter-spacing: -0.5px;
        }

        .search-btn:hover {
          filter: brightness(0.95);
        }

        .search-btn:active {
          background: var(--brand-blue-ink);
          transform: scale(0.98);
        }

        .filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 36px;
          gap: 24px;
        }

        .filter-title-wrapper {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .filter-icon {
          width: 32px;
          height: 32px;
          color: var(--brand-orange);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }

        .filter-title {
          font-size: 2rem;
          font-weight: 900;
          color: var(--brand-blue-ink);
          margin: 0;
          white-space: nowrap;
          letter-spacing: -0.8px;
        }

        .scroll-btn {
          background: white;
          border: 3px solid #e5e7eb;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          flex-shrink: 0;
          z-index: 10;
        }

        .scroll-btn:hover:not(:disabled) {
          border-color: var(--brand-orange);
          color: var(--brand-orange);
        }

        .scroll-btn:active:not(:disabled) {
          border-color: var(--brand-blue-ink);
          color: var(--brand-blue-ink);
          transform: scale(0.95);
        }

        .scroll-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          background: #f9fafb;
          color: #d1d5db;
          border-color: #e5e7eb;
        }

        .scroll-btn svg {
          width: 28px;
          height: 28px;
        }

        .category-section {
          display: flex;
          gap: 32px;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 24px 8px;
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

        .category-section.grabbing { 
          cursor: grabbing; 
          scroll-behavior: auto; 
        }

        .category-btn {
          flex-shrink: 0;
          width: 320px;
          padding: 56px 32px;
          background: white;
          border: 4px solid #e5e7eb;
          border-radius: 42px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .category-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .category-btn[data-category="all"]::before { background: linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08)); }
        .category-btn[data-category="food"]::before { background: linear-gradient(135deg, rgba(240,147,251,0.08), rgba(245,87,108,0.08)); }
        .category-btn[data-category="fashion"]::before { background: linear-gradient(135deg, rgba(250,112,154,0.08), rgba(254,225,64,0.08)); }
        .category-btn[data-category="craft"]::before { background: linear-gradient(135deg, rgba(79,172,254,0.08), rgba(0,242,254,0.08)); }
        .category-btn[data-category="beauty"]::before { background: linear-gradient(135deg, rgba(67,233,123,0.08), rgba(56,249,215,0.08)); }
        .category-btn[data-category="agriculture"]::before { background: linear-gradient(135deg, rgba(150,251,196,0.08), rgba(249,245,134,0.08)); }
        .category-btn[data-category="electronics"]::before { background: linear-gradient(135deg, rgba(161,140,209,0.08), rgba(251,194,235,0.08)); }
        .category-btn[data-category="furniture"]::before { background: linear-gradient(135deg, rgba(255,236,210,0.08), rgba(252,182,159,0.08)); }
        .category-btn[data-category="education"]::before { background: linear-gradient(135deg, rgba(255,154,86,0.08), rgba(254,207,239,0.08)); }

        .category-btn:active {
          transform: scale(0.98);
        }

        .category-btn:hover {
          border-color: var(--brand-blue-ink);
        }

        .category-btn:hover::before {
          opacity: 1;
        }

        .category-btn.active {
          border-color: var(--brand-orange);
          color: var(--brand-blue-ink);
          background: white;
        }

        .category-btn.active::before {
          background: linear-gradient(135deg, rgba(253,87,1,0.10), rgba(0,17,81,0.08));
          opacity: 1;
        }

        .category-btn:focus-visible,
        .scroll-btn:focus-visible,
        .search-input:focus-visible,
        .search-btn:focus-visible {
          outline: 3px solid var(--brand-blue-ink);
          outline-offset: 2px;
        }

        .category-icon {
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
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
          background: #f3f4f6;
        }

        .category-btn svg {
          width: 52px;
          height: 52px;
          transition: all 0.3s ease;
          stroke-width: 2.2;
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
          color: var(--brand-blue-ink);
        }

        .category-btn span {
          font-size: 1.4rem;
          font-weight: 900;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 240px;
          position: relative;
          z-index: 1;
          letter-spacing: -0.5px;
          color: #374151;
        }

        .category-btn.active span {
          color: var(--brand-blue-ink);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .kategori-card { 
            padding: 48px 40px; 
            margin: 28px 20px; 
            border-radius: 38px; 
          }
          .category-btn { 
            width: 280px; 
            padding: 48px 28px;
          }
          .category-icon { width: 90px; height: 90px; }
          .category-btn svg { width: 48px; height: 48px; }
        }

        @media (max-width: 1024px) {
          .kategori-card { 
            padding: 40px 32px; 
            margin: 24px 16px; 
          }
          .search-input-wrapper {
            min-width: 350px;
          }
          .category-btn { 
            width: 260px; 
            padding: 44px 24px;
          }
          .category-section { gap: 28px; }
          .filter-title { font-size: 1.8rem; }
        }

        @media (max-width: 768px) {
          .kategori-card { 
            padding: 36px 24px; 
            margin: 20px 12px; 
            border-radius: 32px; 
          }
          .search-form { 
            flex-direction: column; 
            gap: 16px; 
            margin-bottom: 40px;
          }
          .search-input-wrapper {
            min-width: 100%;
          }
          .search-input, .search-btn { 
            width: 100%; 
            height: 68px; 
            font-size: 1.1rem;
          }
          .search-input { padding: 22px 24px 22px 60px; }
          .filter-header { margin-bottom: 32px; }
          .filter-title { font-size: 1.6rem; }
          .filter-icon { width: 28px; height: 28px; }
          .scroll-btn { width: 56px; height: 56px; }
          .scroll-btn svg { width: 24px; height: 24px; }
          .category-section { gap: 24px; padding: 20px 6px; }
          .category-btn { 
            width: 220px; 
            padding: 40px 20px;
            border-radius: 36px;
          }
          .category-icon { width: 80px; height: 80px; }
          .category-btn svg { width: 44px; height: 44px; }
          .category-btn span { font-size: 1.3rem; max-width: 180px; }
        }

        @media (max-width: 640px) {
          .kategori-card { padding: 32px 20px; }
          .category-section { gap: 20px; }
          .category-btn { 
            width: 200px; 
            padding: 36px 18px;
          }
          .category-icon { width: 72px; height: 72px; }
          .category-btn svg { width: 40px; height: 40px; }
          .category-btn span { 
            font-size: 1.2rem; 
            max-width: 160px; 
          }
          .filter-title { font-size: 1.5rem; }
        }

        @media (max-width: 480px) {
          .kategori-card { 
            padding: 28px 16px; 
            margin: 16px 8px;
            border-radius: 28px;
          }
          .search-form { gap: 14px; }
          .search-input, .search-btn { height: 64px; }
          .search-input { 
            padding: 20px 20px 20px 56px;
            font-size: 1rem;
          }
          .search-icon { left: 20px; width: 24px; height: 24px; }
          .filter-header { margin-bottom: 28px; }
          .filter-title { font-size: 1.4rem; }
          .scroll-btn { width: 52px; height: 52px; }
          .category-section { gap: 16px; padding: 16px 4px; }
          .category-btn { 
            width: 180px; 
            padding: 32px 16px;
            border-radius: 32px;
          }
          .category-icon { width: 64px; height: 64px; }
          .category-btn svg { width: 36px; height: 36px; }
          .category-btn span { 
            font-size: 1.1rem; 
            max-width: 140px; 
          }
        }

        @media (max-width: 360px) {
          .category-btn { 
            width: 160px; 
            padding: 28px 14px;
          }
          .category-btn span { 
            font-size: 1rem; 
            max-width: 120px; 
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
              placeholder="Cari produk, jasa, atau UMKM favorit Anda..." 
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