import { useEffect } from "react";

export default function Carrousel({ items = [] }) {
  useEffect(() => {
    const carouselImages = document.querySelectorAll(".carousel-img");
    const indicatorBar = document.querySelector(".indicator-bar");

    if (!carouselImages.length) return;

    let currentIndex = 0;
    const totalImages = carouselImages.length;
    const intervalDuration = 3000;
    const progressUpdateInterval = 50;

    let elapsedTime = 0;
    let progressInterval;

    const showImage = (index) => {
      carouselImages.forEach((img, i) => {
        img.classList.remove("active");
        if (i === index) img.classList.add("active");
      });
    };

    const updateProgressBar = () => {
      elapsedTime += progressUpdateInterval;
      const progress = (elapsedTime / intervalDuration) * 100;
      if (indicatorBar)
        indicatorBar.style.width = Math.min(progress, 100) + "%";

      if (elapsedTime >= intervalDuration) {
        clearInterval(progressInterval);
        nextImage();
      }
    };

    const nextImage = () => {
      currentIndex = (currentIndex + 1) % totalImages;
      showImage(currentIndex);
      elapsedTime = 0;
      startProgressBar();
    };

    const startProgressBar = () => {
      if (progressInterval) clearInterval(progressInterval);
      progressInterval = setInterval(updateProgressBar, progressUpdateInterval);
    };

    showImage(0);
    startProgressBar();
  }, [items]);

  return (
    <div className="image-carousel">
      {items.map((item, i) => (
        <img
          key={i}
          src={item.src}
          className={`carousel-img ${i === 0 ? "active" : ""}`}
          alt={`carousel-${i}`}
        />
      ))}

      {/* indikator progress bar di bawah gambar */}
      <div className="carousel-indicator">
        <div className="indicator-bar"></div>
      </div>
    </div>
  );
}
