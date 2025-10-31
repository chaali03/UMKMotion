// EtalaseWrapper.jsx
import React, { useState } from "react";
import Kategori from "./Kategori";
import FetchData from "./FetchData";

function EtalaseWrapper() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Callback buat Kategori
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Kategori & Search */}
      <Kategori
        selectedCategory={selectedCategory}
        setSelectedCategory={handleCategoryChange}
        onSearch={handleSearch}
      />

      {/* Daftar Produk */}
      <FetchData
        category={selectedCategory}
        searchQuery={searchQuery}
      />
    </div>
  );
}

export default EtalaseWrapper;