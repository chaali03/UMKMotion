
import { useRef } from 'react';

// Data konsultan
const consultants = [
  {
    name: 'Rizki Pratama',
    expertise: 'Strategi Keuangan & Akuntansi UMKM',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    name: 'Dina Kartika',
    expertise: 'Digital Marketing & E-Commerce',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  {
    name: 'Ahmad Setiawan',
    expertise: 'Strategi Pengembangan Bisnis',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  {
    name: 'Sari Wulandari',
    expertise: 'Manajemen SDM & Operasional',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    name: 'Budi Santoso',
    expertise: 'Transformasi Digital & Teknologi',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    name: 'Maya Anggraini',
    expertise: 'Legalitas & Perizinan Usaha',
    photo: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop&crop=faces',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  }
];

// Komponen Card Konsultan
function ConsultantCard({ consultant }) {
  const handleConsult = () => {


  };

  return (
    <div className="consultant-card">
      <div className="dots-pattern">
        {Array(6).fill(null).map((_, i) => (
          <div key={i} className="dot"></div>
        ))}
      </div>
      
      <div className="photo-container">
        <div className="photo-circle">
          <img src={consultant.photo} alt={consultant.name} />
        </div>
        <div className="badge-label">Konsultan</div>
      </div>

      <div className="card-content">
        <h3 className="consultant-name">{consultant.name}</h3>
        <div className="consultant-expertise">
          <svg className="expertise-icon" fill="none" stroke="#5a6b7a" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={consultant.icon}></path>
          </svg>
          <span className="expertise-text">{consultant.expertise}</span>
        </div>
        <button className="consult-button" onClick={handleConsult}>
          <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          Konsul Sekarang
        </button>
      </div>
    </div>
  );
}

// Komponen Utama
export default function ConsultantSlider() {
  const sliderRef = useRef(null);

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 400;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <section className="consultant-section">
        <div className="section-header">
          <h2 className="section-title">Mendampingi UMKM Menuju Kesuksesan yang Lebih Besar</h2>
          <p className="section-description">
            Dengan bimbingan profesional, kami bantu Anda memahami peluang, mengatasi tantangan, dan membawa bisnis Anda naik ke level berikutnya.
          </p>
        </div>

        <div className="slider-wrapper">
          <div className="slider-container" ref={sliderRef}>
            {consultants.map((consultant, index) => (
              <ConsultantCard key={index} consultant={consultant} />
            ))}
          </div>

          <div className="nav-buttons">
            <button className="nav-btn" onClick={() => scrollSlider('left')}>‹</button>
            <button className="nav-btn" onClick={() => scrollSlider('right')}>›</button>
          </div>
        </div>
      </section>


      <style jsx>{`
        .consultant-section {
          max-width: 100%;
          padding: 4rem 2rem;
          overflow: hidden;
          background: #f8f9fa;
        }

        .section-header {
          max-width: 1200px;
          margin: 0 auto 3rem;
          text-align: center;
        }

        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #001151;
          margin-bottom: 1rem;
        }

        .section-description {
          font-size: clamp(0.95rem, 1.8vw, 1.1rem);
          color: #5a6b7a;
          line-height: 1.7;
          max-width: 800px;
          margin: 0 auto;
        }

        .slider-wrapper {
          position: relative;
          max-width: 100%;
          margin: 0 auto;
        }

        .slider-container {
          display: flex;
          gap: 2rem;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #001151 #e0e0e0;
          padding: 2rem 2rem 2rem 0;
          margin-left: 2rem;
        }

        .slider-container::-webkit-scrollbar {
          height: 8px;
        }

        .slider-container::-webkit-scrollbar-track {
          background: #e0e0e0;
          border-radius: 10px;
        }

        .slider-container::-webkit-scrollbar-thumb {
          background: #001151;
          border-radius: 10px;
        }

        .slider-container::-webkit-scrollbar-thumb:hover {
          background: #002080;
        }

        .consultant-card {
          min-width: 350px;
          max-width: 350px;
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .consultant-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 150px;
          background: linear-gradient(135deg, #0066ff 0%, #003d99 100%);
          border-radius: 20px 20px 0 0;
          z-index: 0;
        }

        .consultant-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        .dots-pattern {
          position: absolute;
          top: 20px;
          right: 20px;
          display: grid;
          grid-template-columns: repeat(6, 6px);
          gap: 8px;
          z-index: 1;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
        }

        .photo-container {
          position: relative;
          width: 180px;
          height: 180px;
          margin-bottom: 1.5rem;
          z-index: 2;
        }

        .photo-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          border: 5px solid white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .photo-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .badge-label {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #001151;
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0, 17, 81, 0.3);
        }

        .card-content {
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .consultant-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #001151;
          margin-bottom: 0.75rem;
        }

        .consultant-expertise {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 0.5rem;
          color: #5a6b7a;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          padding: 0 1rem;
          min-height: 60px;
        }

        .expertise-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .expertise-text {
          line-height: 1.4;
          text-align: center;
        }

        .consult-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #FD5701;
          color: white;
          padding: 0.875rem 2rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          width: 100%;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(253, 87, 1, 0.3);
          border: none;
          cursor: pointer;
        }

        .consult-button:hover {
          background: linear-gradient(135deg, #ff6622 0%, #ff9966 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(253, 87, 1, 0.4);
        }

        .button-icon {
          width: 20px;
          height: 20px;
        }

        .nav-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .nav-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: white;
          border: 2px solid #001151;
          color: #001151;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .nav-btn:hover {
          background: #001151;
          color: white;
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .consultant-section {
            padding: 3rem 1rem;
          }

          .slider-container {
            margin-left: 1rem;
            padding: 2rem 1rem 2rem 0;
            gap: 1.5rem;
          }

          .consultant-card {
            min-width: 280px;
            max-width: 280px;
            padding: 1.5rem;
          }

          .photo-container {
            width: 150px;
            height: 150px;
          }

          .consultant-name {
            font-size: 1.25rem;
          }

          .consultant-expertise {
            font-size: 0.85rem;
            min-height: 50px;
          }

          .consult-button {
            padding: 0.75rem 1.5rem;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .consultant-section {
            padding: 2rem 0.5rem;
          }

          .consultant-card {
            min-width: 260px;
            max-width: 260px;
          }

          .section-header {
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </>
  );
} 