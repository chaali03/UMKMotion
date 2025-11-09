import React, { useState } from "react";
import Kategori from "../components/Etalase/Kategori.jsx/index.js";
import FetchData from "../components/Etalase/FetchData.jsx";

function EtalaseWrapper() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: "10px" }}>Etalase Produk</h1>
      <Kategori
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <FetchData category={selectedCategory} />
    </div>
  );
}

export default EtalaseWrapper;
