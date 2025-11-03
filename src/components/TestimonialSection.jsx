import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Budi Prasetyo',
    location: 'Cipayung - Depok',
    rating: 5,
    text: 'Saya sangat terbantu dengan fitur pencarian kuliner di UMKMotion. Banyak pilihan makanan lokal yang mudah ditemukan dan kualitasnya sesuai dengan deskripsi.',
    image: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 2,
    name: 'Nurhayati',
    location: 'Citayam - Kab. Bogor',
    rating: 5,
    text: 'Melalui UMKMotion, saya bisa menemukan berbagai kuliner rumahan dengan rasa yang lezat dan harga terjangkau. Proses pemesanannya juga mudah dan cepat.',
    image: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: 3,
    name: 'Budi Santoso',
    location: 'Jakarta',
    rating: 5,
    text: 'Saya menggunakan layanan jasa kebersihan dari UMKMotion. Pelayanannya cepat, profesional, dan hasilnya memuaskan. Platform ini sangat membantu kebutuhan harian saya.',
    image: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 4,
    name: 'Ahmad Hidayat',
    location: 'Bandung',
    rating: 5,
    text: 'Sejak memasarkan produk kerajinan tangan saya di UMKMotion, penjualan meningkat signifikan. Sistemnya mudah digunakan dan dukungan timnya sangat responsif.',
    image: 'https://i.pravatar.cc/150?img=13'
  },
  {
    id: 5,
    name: 'Sri Wahyuni',
    location: 'Jagakarsa - Jakarta Selatan',
    rating: 5,
    text: 'UMKMotion memberikan dampak positif bagi usaha jasa desain saya. Banyak klien baru yang datang melalui platform ini, dan sistem transaksinya aman serta transparan.',
    image: 'https://i.pravatar.cc/150?img=9'
  }

];

export default function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return visible;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="testimonial-section">
      <div className="testimonial-container">
        {/* Header */}
        <div className="testimonial-header">
          <h2 className="testimonial-title">Client Success Stories</h2>
          <div className="rating-badge">
            <span className="rating-number">4.9</span>
            <span className="rating-stars">★★★★★</span>
            <span className="rating-text">
              Lebih dari 200<br />
              5 bintang review dari UMKMotioner<br />
            </span>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="testimonial-grid">
          <AnimatePresence mode="wait">
            {visibleTestimonials.map((testimonial, index) => (
              <motion.div
                key={`${testimonial.id}-${currentIndex}`}
                className={`testimonial-card ${
                  index === 1 ? 'center-card' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Quote className="quote-icon" size={32} />
                
                <p className="testimonial-text">{testimonial.text}</p>

                <div className="testimonial-footer">
                  <div className="user-info">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <h4 className="user-name">{testimonial.name}</h4>
                      <p className="user-location">{testimonial.location}</p>
                    </div>
                  </div>

                  <div className="rating-stars-small">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="#FFB800" stroke="#FFB800" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="testimonial-navigation">
          <button 
            className="nav-button prev"
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            className="nav-button next"
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="dots-indicator">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .testimonial-section {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
          position: relative;
          overflow: hidden;
        }

        .testimonial-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .testimonial-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .testimonial-title {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
        }

        .rating-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .rating-number {
          font-size: 2rem;
          font-weight: 700;
          color: #FF6914;
        }

        .rating-stars {
          font-size: 1.25rem;
          color: #FFB800;
          letter-spacing: 2px;
        }

        .rating-text {
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.4;
        }

        /* Grid */
        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
          position: relative;
        }

        /* Card */
        .testimonial-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .testimonial-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        }

        .testimonial-card.center-card {
          z-index: 3;
        }

        .quote-icon {
          color: rgba(255, 105, 20, 0.2);
          align-self: flex-end;
        }

        .testimonial-text {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: #475569;
          flex: 1;
        }

        /* Footer */
        .testimonial-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e2e8f0;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .user-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .user-location {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }

        .rating-stars-small {
          display: flex;
          gap: 2px;
        }

        /* Navigation */
        .testimonial-navigation {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .nav-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          border: 2px solid #e2e8f0;
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .nav-button:hover {
          background: #FF6914;
          border-color: #FF6914;
          color: white;
          transform: scale(1.1);
        }

        /* Dots */
        .dots-indicator {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .dot.active {
          background: #FF6914;
          width: 32px;
          border-radius: 5px;
        }

        .dot:hover {
          background: #FF8B3D;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .testimonial-section {
            padding: 4rem 1.5rem;
          }

          .testimonial-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .rating-badge {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 768px) {
          .testimonial-section {
            padding: 3rem 1rem;
          }

          .testimonial-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .testimonial-card {
            padding: 1.5rem;
          }

          .testimonial-navigation {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .nav-button {
            width: 44px;
            height: 44px;
          }
        }

        @media (max-width: 480px) {
          .testimonial-title {
            font-size: 1.75rem;
          }

          .rating-badge {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .testimonial-card {
            padding: 1.25rem;
          }

          .quote-icon {
            width: 28px;
            height: 28px;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
          }

          .nav-button {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </section>
  );
}