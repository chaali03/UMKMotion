import React, { useEffect } from 'react';
import ConsultantSlider from '../components/ConsultantSlider';
import { motion } from 'framer-motion';

const KonsulPage: React.FC = () => {
  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  return (
    <div className="konsul-page">
      <section className="hero">
        <div className="container-hero">
          <div className="text-hero">
            <h1 className="headline">
              <span>MEMBANTU UMKM TUMBUH,</span>
              <span>BERKEMBANG, DAN</span>
              <span>SIAP BERSAING.</span>
            </h1>
            <h2 className="subline">
              Dapatkan arahan profesional dari tim konsultan berpengalaman untuk membawa bisnis Anda menuju kesuksesan yang lebih besar.
            </h2>
          </div>
          <div className="img-container-hero">
            <div className="image-hero">
              <img src="/asset/dummy/People-dummy.png" alt="Consultant Hero Image" />
            </div>
          </div>
          <div className="background-gradients">
            <div className="gradient-orange"></div>
            <div className="gradient-blue"></div>
          </div>
        </div>
      </section>

      <section className="coach-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">169+</div>
            <div className="stat-label">Konsultasi UMKM</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">108+</div>
            <div className="stat-label">UMKM Sukses</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">78+</div>
            <div className="stat-label">Konsultan</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">21</div>
            <div className="stat-label">Penghargaan UMKM</div>
          </div>
        </div>

        <div className="content-container">
          <div className="image-side">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=700&fit=crop" 
              alt="Professional Coach" 
            />
          </div>

          <div className="text-side">
            <span className="badge">PROGRAM KONSULTASI UMKM</span>
            
            <h2 className="main-heading">Konsultasi Profesional untuk Mengembangkan dan Memajukan Usaha Anda.</h2>
            
            <p className="description">
              Konsultasi bisnis merupakan langkah penting bagi pelaku UMKM yang ingin meningkatkan kualitas usaha, memperluas jangkauan pasar, dan memperkuat strategi bisnisnya. Di tengah perubahan dunia usaha yang cepat, pendampingan yang tepat menjadi kunci untuk terus bertumbuh dan beradaptasi.
            </p>
            
            <p className="description">
              Dengan wawasan dan pengalaman tim kami, Anda akan mendapatkan bimbingan, strategi, serta dukungan nyata untuk mengoptimalkan potensi bisnis mulai dari manajemen, pemasaran, hingga transformasi digital yang relevan dengan kebutuhan UMKM masa kini.
            </p>
            
            <a href="#" className="cta-button">Jadwalkan Konsultasi Anda</a>
          </div>
        </div>
      </section>
      
      <ConsultantSlider />

      <style>{`
        .hero {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
        }

        .container-hero {
          position: relative;
          max-width: 1440px;
          margin: 0 auto;
          padding: 100px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 100vh;
        }

        .text-hero {
          max-width: 600px;
          z-index: 2;
        }

        .headline {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: #1a1a1a;
        }

        .headline span {
          display: block;
        }

        .subline {
          font-size: 1.25rem;
          line-height: 1.6;
          color: #4a4a4a;
          margin-bottom: 2rem;
          max-width: 90%;
        }

        .img-container-hero {
          position: relative;
          z-index: 2;
        }

        .image-hero img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .background-gradients {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        .gradient-orange,
        .gradient-blue {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }

        .gradient-orange {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #ff7a1a 0%, #ff4d00 100%);
          top: -100px;
          right: -100px;
        }

        .gradient-blue {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #0066cc 0%, #003366 100%);
          bottom: -200px;
          left: -200px;
        }

        /* Stats Section */
        .stats-container {
          display: flex;
          justify-content: space-around;
          max-width: 1200px;
          margin: 0 auto 60px;
          padding: 40px 20px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .stat-item {
          text-align: center;
          padding: 0 20px;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 1rem;
          color: #666;
        }

        /* Content Section */
        .content-container {
          display: flex;
          max-width: 1200px;
          margin: 0 auto 100px;
          padding: 0 20px;
          gap: 60px;
          align-items: center;
        }

        .image-side {
          flex: 1;
        }

        .image-side img {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .text-side {
          flex: 1;
        }

        .badge {
          display: inline-block;
          background: #f0f7ff;
          color: #0066cc;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .main-heading {
          font-size: 2.25rem;
          line-height: 1.3;
          margin-bottom: 1.5rem;
          color: #1a1a1a;
        }

        .description {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #4a4a4a;
          margin-bottom: 1.5rem;
        }

        .cta-button {
          display: inline-block;
          background: #0066cc;
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }

        .cta-button:hover {
          background: #0052a3;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        /* Responsive Styles */
        @media (max-width: 1024px) {
          .container-hero {
            flex-direction: column;
            padding: 80px 20px;
            text-align: center;
          }

          .headline {
            font-size: 2.5rem;
          }

          .subline {
            margin: 0 auto 2rem;
          }

          .img-container-hero {
            margin-top: 40px;
          }

          .stats-container {
            flex-wrap: wrap;
            gap: 20px;
          }

          .stat-item {
            flex: 1 1 40%;
            margin-bottom: 20px;
          }

          .content-container {
            flex-direction: column;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .headline {
            font-size: 2rem;
          }

          .stat-item {
            flex: 1 1 100%;
          }

          .main-heading {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default KonsulPage;
