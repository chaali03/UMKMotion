import React, { useState, useEffect, useRef } from "react";

function Kategori({ selectedCategory: parentCategory, setSelectedCategory: setParentCategory, onSearch }) {
  const [localCategory, setLocalCategory] = useState(parentCategory || "all");

  // === KATEGORI BARU SESUAI PERMINTAAN ===
  const categories = [
    { id: "all", label: "Semua Produk", icon: "/asset/logo kategori/all.webp" },
    { id: "food", label: "Kuliner", icon: "/asset/logo kategori/kuliner.webp" },
    { id: "services", label: "Jasa", icon: "/asset/logo kategori/jasa.webp" },
    { id: "fashion", label: "Fashion", icon: "/asset/logo kategori/fashion.webp" },
    { id: "craft", label: "Kerajinan/kriya", icon: "/asset/logo kategori/kriya.webp" },
    { id: "beauty", label: "Kesehatan & Kecantikan", icon: "/asset/logo kategori/beauty.webp" },
    { id: "agriculture", label: "Pertanian & Perkebunan", icon: "/asset/logo kategori/pertanian.webp" },
    { id: "electronics", label: "Komputer & Elektronik", icon: "/asset/logo kategori/electronic.webp" },
    { id: "furniture", label: "Furniture", icon: "/asset/logo kategori/furniture.webp" },
    { id: "education", label: "Edukasi", icon: "/asset/logo kategori/edukasi.webp" },
    { id: "others", label: "Lainnya", icon: "/asset/logo kategori/lainnya.webp" },
  ];

  const sectionRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleSelect = (category) => {
    setLocalCategory(category);
    if (setParentCategory) setParentCategory(category);
    window.dispatchEvent(new CustomEvent("categoryChange", { detail: category }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchInputRef.current?.value.trim();
    if (onSearch) onSearch(query);
    window.dispatchEvent(new CustomEvent("searchChange", { detail: query }));
  };

  // === SCROLL & TOUCH LOGIC (SAMA SEBELUMNYA) ===
  useEffect(() => {
    const section = sectionRef.current;
    const prevBtn = prevRef.current;
    const nextBtn = nextRef.current;
    if (!section || !prevBtn || !nextBtn) return;

    const updateButtons = () => {
      const hasScroll = section.scrollWidth > section.clientWidth;
      const atStart = section.scrollLeft <= 1;
      const atEnd = section.scrollLeft + section.clientWidth >= section.scrollWidth - 10;

      prevBtn.style.opacity = hasScroll && !atStart ? "1" : "0.3";
      prevBtn.style.pointerEvents = hasScroll && !atStart ? "auto" : "none";
      nextBtn.style.opacity = hasScroll && !atEnd ? "1" : "0.3";
      nextBtn.style.pointerEvents = hasScroll && !atEnd ? "auto" : "none";
    };

    const scrollLeft = () => {
      section.scrollBy({ left: -300, behavior: "smooth" });
      setTimeout(updateButtons, 300);
    };

    const scrollRight = () => {
      section.scrollBy({ left: 300, behavior: "smooth" });
      setTimeout(updateButtons, 300);
    };

    prevBtn.addEventListener("click", scrollLeft);
    nextBtn.addEventListener("click", scrollRight);
    updateButtons();
    window.addEventListener("resize", updateButtons);

    return () => {
      prevBtn.removeEventListener("click", scrollLeft);
      nextBtn.removeEventListener("click", scrollRight);
      window.removeEventListener("resize", updateButtons);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const prevBtn = prevRef.current;
    const nextBtn = nextRef.current;
    if (!section || !prevBtn || !nextBtn) return;

    const updateButtons = () => {
      const hasScroll = section.scrollWidth > section.clientWidth;
      const atStart = section.scrollLeft <= 1;
      const atEnd = section.scrollLeft + section.clientWidth >= section.scrollWidth - 10;

      prevBtn.style.opacity = hasScroll && !atStart ? "1" : "0.3";
      prevBtn.style.pointerEvents = hasScroll && !atStart ? "auto" : "none";
      nextBtn.style.opacity = hasScroll && !atEnd ? "1" : "0.3";
      nextBtn.style.pointerEvents = hasScroll && !atEnd ? "auto" : "none";
    };

    const scrollLeft = () => {
      section.scrollBy({ left: -300, behavior: "smooth" });
      setTimeout(updateButtons, 300);
    };

    const scrollRight = () => {
      section.scrollBy({ left: 300, behavior: "smooth" });
      setTimeout(updateButtons, 300);
    };

    prevBtn.addEventListener("click", scrollLeft);
    nextBtn.addEventListener("click", scrollRight);

    let isDown = false;
    let startX;
    let scrollLeftStart;
    let velocity = 0;
    let frameId = null;

    const handleStart = (e) => {
      isDown = true;
      section.classList.add("grabbing");
      startX = (e.pageX || e.touches[0].pageX) - section.offsetLeft;
      scrollLeftStart = section.scrollLeft;
      velocity = 0;
      cancelMomentum();
    };

    const handleEnd = () => {
      if (!isDown) return;
      isDown = false;
      section.classList.remove("grabbing");
      startMomentum();
    };

    const handleMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = (e.pageX || e.touches[0].pageX) - section.offsetLeft;
      const walk = (x - startX) * 2;
      const prevScrollLeft = section.scrollLeft;
      section.scrollLeft = scrollLeftStart - walk;
      velocity = section.scrollLeft - prevScrollLeft;
    };

    const momentum = () => {
      if (Math.abs(velocity) > 0.5) {
        section.scrollBy({ left: velocity, behavior: "auto" });
        velocity *= 0.95;
        frameId = requestAnimationFrame(momentum);
      } else {
        cancelMomentum();
        updateButtons();
      }
    };

    const startMomentum = () => {
      cancelMomentum();
      frameId = requestAnimationFrame(momentum);
    };

    const cancelMomentum = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = null;
    };

    section.addEventListener("mousedown", handleStart);
    section.addEventListener("mouseleave", handleEnd);
    section.addEventListener("mouseup", handleEnd);
    section.addEventListener("mousemove", handleMove);

    section.addEventListener("touchstart", handleStart, { passive: false });
    section.addEventListener("touchend", handleEnd);
    section.addEventListener("touchcancel", handleEnd);
    section.addEventListener("touchmove", handleMove, { passive: false });

    updateButtons();
    window.addEventListener("resize", updateButtons);

    return () => {
      prevBtn.removeEventListener("click", scrollLeft);
      nextBtn.removeEventListener("click", scrollRight);

      section.removeEventListener("mousedown", handleStart);
      section.removeEventListener("mouseleave", handleEnd);
      section.removeEventListener("mouseup", handleEnd);
      section.removeEventListener("mousemove", handleMove);

      section.removeEventListener("touchstart", handleStart);
      section.removeEventListener("touchend", handleEnd);
      section.removeEventListener("touchcancel", handleEnd);
      section.removeEventListener("touchmove", handleMove);

      window.removeEventListener("resize", updateButtons);
      cancelMomentum();
    };
  }, []);

  return (
    <>
      <style jsx>{`
        /* STYLE SAMA — TIDAK DIUBAH */
        .search-card {
          background: #fff;
          padding: 20px;
          border-radius: 14px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          margin-bottom: 25px;
        }

        .search-item {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input-wrapper input {
          width: 100%;
          padding: 12px 14px 12px 44px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
          transition: 0.2s;
        }

        .search-input-wrapper input:focus {
          border-color: #ff6b6b;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
        }

        .search-input-wrapper input:focus + .search-icon {
          color: #ff6b6b;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          pointer-events: none;
        }

        .search-item button {
          padding: 12px 25px;
          background: #f33636;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .search-item button:hover {
          background: #d72c2c;
        }

        .filter-item {
          text-align: start;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 14px;
        }

        .filter-item p {
          font-weight: 600;
          font-size: 1.05rem;
          color: #333;
          margin-bottom: 14px;
        }

        .category-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        .category-section {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-behavior: smooth;
          padding: 8px 0;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: #d3d3d3 #f0f0f0;
        }

        .category-section::-webkit-scrollbar {
          height: 6px;
        }

        .category-section::-webkit-scrollbar-thumb {
          background: #d3d3d3;
          border-radius: 10px;
        }

        .category-buttons {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 14px 20px;
          min-width: 120px;
          width: 120px;
          height: 120px;
          background: #fff;
          border: 2px solid #eee;
          border-radius: 14px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          color: #475569;
          font-weight: 600;
          font-size: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .category-buttons img {
          width: 42px;
          height: 42px;
          object-fit: contain;
          margin-bottom: 6px;
        }

        .category-buttons span {
          font-size: 0.85rem;
          color: #333;
          text-align: center;
        }

        .category-buttons:hover {
          transform: translateY(-5px);
          border-color: #60a5fa;
          box-shadow: 0 5px 15px rgba(96, 165, 250, 0.25);
        }

        .category-buttons.active {
          background: linear-gradient(135deg, #60a5fa, #93c5fd);
          color: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
        }

        .category-buttons.active span {
          font-size: 0.85rem;
          color: #ffffff;
          font-weight: 600;
        }

        .scroll-btn {
          background: #fff;
          border: 2px solid #eee;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #f33636;
          transition: 0.3s;
          flex-shrink: 0;
          z-index: 10;
        }

        .scroll-btn:hover:not(:disabled) {
          background: #f33636;
          color: #fff;
          transform: scale(1.1);
        }

        .scroll-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .grabbing {
          cursor: grabbing !important;
        }
      `}</style>

      <section className="search-card">
        <div className="search-item">
          <form onSubmit={handleSearch} style={{ display: "flex", width: "100%", gap: "10px" }}>
            <div className="search-input-wrapper">
              <input ref={searchInputRef} type="text" placeholder="Cari produk, layanan, dll..." />
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <button type="submit">Cari</button>
          </form>
        </div>

        <div className="filter-item">
          <p>Filter produk</p>
          <div className="category-wrapper">
            <button ref={prevRef} className="scroll-btn" aria-label="Scroll kiri">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div ref={sectionRef} className="category-section">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-buttons ${localCategory === cat.id ? "active" : ""}`}
                  onClick={() => handleSelect(cat.id)}
                >
                  <img src={cat.icon} alt={cat.label} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <button ref={nextRef} className="scroll-btn" aria-label="Scroll kanan">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default Kategori;