// src/components/Etalase/EtalaseWrapper.jsx
import React, { useState } from 'react';
import Kategori from './Kategori.jsx';
import FetchData from './FetchData.jsx';

export default function EtalaseWrapper() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <>
      <Kategori 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onSearch={handleSearch}
      />
      <FetchData 
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />
    </>
  );
}