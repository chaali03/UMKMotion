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
  
  /* Desktop: Allow full freedom */
  @media (min-width: 1025px) {
    .hero {
      overflow-x: visible;
      overflow-y: visible;
    }
    .hero-inner {
      overflow-x: visible;
      overflow-y: visible;
    }
    .hero .circular-gallery {
      max-width: none !important;
      overflow: visible !important;
    }
    .hero .circular-gallery canvas {
      max-width: none !important;
      width: auto !important;
    }
  }
  
  /* iPad Pro and smaller: Apply restrictions */
  @media (max-width: 1024px) {
    .hero {
      width: 100%;
      max-width: 100vw;
      left: 0;
      right: 0;
      margin-left: 0;
      margin-right: 0;
      overflow-x: hidden;
      overflow-x: clip;
      overscroll-behavior-x: none;
    }
  }
  
  /* iPad Pro specific optimizations */
  @media (max-width: 1024px) and (min-width: 769px) {
    .hero-text {
      top: 28%;
      width: min(600px, 85vw);
      padding: 2rem 1.75rem;
    }
    .headline {
      font-size: clamp(2.2rem, 5.5vw, 4rem);
      gap: 10px;
    }
    .kicker {
      font-size: clamp(0.9rem, 2vw, 1.2rem);
      max-width: 500px;
    }
    .btn {
      height: clamp(42px, 4.5vw, 48px);
      font-size: clamp(0.9rem, 2vw, 1.1rem);
      padding: 0 clamp(18px, 3.5vw, 24px);
    }
    .hero .circular-gallery {
      margin-top: 8vh;
      height: 20vh;
    }
  }

  .hero-inner {
    width: 100%;
    height: 100vh; /* full height for maximum downward */
    min-height: 100svh; /* better mobile viewport height */
    position: relative;
  }
  
  /* iPad Pro and smaller: Apply restrictions to inner */
  @media (max-width: 1024px) {
    .container-hero {
      max-width: 100%;
      overflow-x: hidden;
      overflow-x: clip;
      overscroll-behavior-x: none;
    }
  }
  .hero-bg { 
    position: absolute; 
    inset: 0; 
    z-index: 1; 
    pointer-events: none;
  }

  /* Background gradient blurs */
  .background-gradients {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -3;
  }
  
  /* Desktop: Allow background gradients full freedom */
  @media (min-width: 1025px) {
    .background-gradients {
      overflow: visible;
    }
  }
  
  /* iPad Pro and smaller: Restrict background gradients */
  @media (max-width: 1024px) {
    .background-gradients {
      overflow: hidden;
    }
  }
  
  /* Orange gradient - top right corner */
  .gradient-orange {
    position: absolute;
    top: -25%;
    right: -20%;
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, 
      rgba(253, 87, 1, 0.5) 0%, 
      rgba(255, 133, 51, 0.42) 25%, 
      rgba(255, 167, 102, 0.2) 50%, 
      rgba(255, 200, 153, 0.2) 75%, 
      transparent 100%);
    border-radius: 50%;
    filter: blur(100px);
    animation: gradientFloat 8s ease-in-out infinite;
    z-index: -10;
  }
  
  /* Desktop: Much more intense gradients */
  @media (min-width: 1025px) {
    .gradient-orange {
      background: radial-gradient(circle, 
        rgba(253, 87, 1, 0.85) 0%, 
        rgba(255, 133, 51, 0.75) 25%, 
        rgba(255, 167, 102, 0.6) 50%, 
        rgba(255, 200, 153, 0.4) 75%, 
        rgba(255, 220, 180, 0.15) 90%,
        transparent 100%);
      filter: blur(60px);
      width: 800px;
      height: 800px;
    }
  }
  
  /* Blue gradient - bottom left corner */
  .gradient-blue {
    position: absolute;
    bottom: -25%;
    left: -25%;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, 
      rgba(0, 17, 81, 0.45) 0%, 
      rgba(0, 102, 255, 0.38) 25%, 
      rgba(51, 153, 255, 0.28) 50%, 
      rgba(102, 178, 255, 0.18) 75%, 
      transparent 100%);
    border-radius: 50%;
    filter: blur(120px);
    animation: gradientFloat 10s ease-in-out infinite reverse;
    z-index: -10;
  }
  
  /* Desktop: Much more intense blue gradient */
  @media (min-width: 1025px) {
    .gradient-blue {
      background: radial-gradient(circle, 
        rgba(0, 17, 81, 0.8) 0%, 
        rgba(0, 102, 255, 0.7) 25%, 
        rgba(51, 153, 255, 0.55) 50%, 
        rgba(102, 178, 255, 0.35) 75%, 
        rgba(153, 204, 255, 0.18) 90%,
        transparent 100%);
      filter: blur(70px);
      width: 900px;
      height: 900px;
    }
  }
  

  /* Responsive floating animations */
  @media (max-width: 768px) {
    .floating-animations {
      display: block;
    }
    
    /* Scale down background gradients for mobile */
    .gradient-orange {
      width: 400px;
      height: 400px;
      filter: blur(25px);
      top: -15%;
      right: -10%;
    }
    .gradient-blue {
      width: 450px;
      height: 450px;
      filter: blur(30px);
      bottom: -15%;
      left: -15%;
    }
    
    /* Scale down elements for mobile */
    .circle-1 { width: 50px; height: 50px; }
    .circle-2 { width: 70px; height: 70px; }
    .circle-3 { width: 40px; height: 40px; }
    .square-1 { width: 25px; height: 25px; }
    .square-2 { width: 20px; height: 20px; }
    .triangle-1 { 
      border-left: 15px solid transparent;
      border-right: 15px solid transparent;
      border-bottom: 26px solid #FD5701;
    }
    .triangle-2 {
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-bottom: 21px solid #0066ff;
    }
    .dot { width: 8px; height: 8px; margin: 5px 0; }
    
    /* Scale down new elements for mobile */
    .float-star { width: 12px; height: 12px; }
    .float-hexagon { width: 20px; height: 18px; }
    .float-ring { width: 30px; height: 30px; border-width: 2px; }
    .ring-2 { width: 22px; height: 22px; }
    .float-wave { width: 40px; height: 12px; }
    .sparkle-container { width: 60px; height: 60px; }
    .sparkle { width: 3px; height: 3px; }
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    /* Scale for tablet */
    .gradient-orange {
      width: 600px;
      height: 600px;
      filter: blur(55px);
      top: -22%;
      right: -18%;
    }
    .gradient-blue {
      width: 700px;
      height: 700px;
      filter: blur(65px);
      bottom: -22%;
      left: -22%;
    }
    
    .circle-1 { width: 65px; height: 65px; }
    .circle-2 { width: 90px; height: 90px; }
    .circle-3 { width: 50px; height: 50px; }
    .square-1 { width: 32px; height: 32px; }
    .square-2 { width: 25px; height: 25px; }
    .triangle-1 { 
      border-left: 20px solid transparent;
      border-right: 20px solid transparent;
      border-bottom: 35px solid #FD5701;
    }
    .triangle-2 {
      border-left: 16px solid transparent;
      border-right: 16px solid transparent;
      border-bottom: 28px solid #0066ff;
    }
    .dot { width: 10px; height: 10px; margin: 6px 0; }
    
    /* Scale for tablet - new elements */
    .float-star { width: 16px; height: 16px; }
    .float-hexagon { width: 28px; height: 24px; }
    .float-ring { border-width: 2.5px; }
    .ring-1 { width: 40px; height: 40px; }
    .ring-2 { width: 28px; height: 28px; }
    .float-wave { width: 50px; height: 16px; }
    .sparkle-container { width: 80px; height: 80px; }
    .sparkle { width: 3.5px; height: 3.5px; }
  }
  
  /* Responsive adjustments for smaller frames */
  @media (max-width: 768px) {
    .hero-inner {
      height: 100vh;
      min-height: 100svh;
      padding: 0 16px;
    }
    .hero-text { 
      top: 32%; 
      width: min(480px, 92vw); 
      padding: 1.5rem 1.25rem; 
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .hero .circular-gallery { margin-top: 10vh; height: 18vh; overflow-x: clip; max-width: 100%; position: relative; }
    .hero .circular-gallery canvas { display:block; max-width:100%; transform: translateX(-10px) scale(0.98); transform-origin: center; }
    .headline { 
      font-size: clamp(1.6rem, 7vw, 3.2rem); 
      line-height: 1.2; 
      margin-bottom: 10px;
      gap: 4px;
    }
    .headline .accent { 
      /* Remove shadow for better readability */
    }
    .kicker { 
      font-size: clamp(0.7rem, 2.5vw, 0.95rem); 
      margin-top: 8px; 
      line-height: 1.5;
      max-width: 400px;
      color: #5a6b7a;
    }
    .cta { 
      gap: 10px; 
      margin-top: 16px; 
      flex-direction: column;
      align-items: center;
    }
    .btn { 
      height: clamp(36px, 4.5vw, 44px); 
      padding: 0 clamp(14px, 3vw, 20px); 
      border-radius: 10px; 
      font-size: clamp(0.75rem, 2.5vw, 0.95rem);
      font-weight: 600;
      width: 100%;
      max-width: 280px;
      transition: all 0.3s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, #FD5701 0%, #ff7733 100%);
      box-shadow: 0 6px 20px rgba(253, 87, 1, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(253, 87, 1, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .btn-ghost {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 17, 81, 0.1);
      color: #001151;
    }
    .btn-ghost:hover {
      background: rgba(255, 255, 255, 1);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 17, 81, 0.1);
    }
  }
  
  @media (max-width: 480px) {
    .hero-inner {
      height: 100vh;
      min-height: 100svh;
      padding: 0 12px;
    }
    .hero-text { 
      top: 30%; 
      width: min(400px, 94vw); 
      padding: 1rem 0.875rem;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .hero .circular-gallery { margin-top: 8vh; height: 16vh; overflow-x: clip; max-width: 100%; position: relative; }
    .hero .circular-gallery canvas { display:block; max-width:100%; transform: translateX(-12px) scale(0.98); transform-origin: center; }
    .headline { 
      font-size: clamp(1.4rem, 8vw, 2.8rem) !important; 
      line-height: 1.25; 
      margin-bottom: 8px;
      gap: 2px;
    }
    .headline .accent { 
      /* Remove shadow for better readability */
    }
    .kicker { 
      font-size: clamp(0.65rem, 3.2vw, 0.85rem); 
      line-height: 1.4;
      max-width: 340px;
      margin-top: 6px;
      color: #6b7a8a;
    }
    .cta { 
      gap: 8px; 
      margin-top: 12px; 
      flex-direction: column;
      align-items: center;
    }
    .btn { 
      height: clamp(32px, 4vw, 40px); 
      padding: 0 clamp(12px, 2.8vw, 16px); 
      font-size: clamp(0.7rem, 3.2vw, 0.85rem);
      font-weight: 600;
      width: 100%;
      max-width: 240px;
      border-radius: 8px;
    }
    .btn-primary {
      background: linear-gradient(135deg, #FD5701 0%, #ff6622 100%);
      box-shadow: 0 4px 16px rgba(253, 87, 1, 0.35);
    }
    .btn-ghost {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(0, 17, 81, 0.12);
    }
    /* Reduce background blur for small mobile */
    .gradient-orange {
      filter: blur(15px) !important;
    }
    .gradient-blue {
      filter: blur(20px) !important;
    }
  }
  
  @media (max-width: 360px) {
    .hero-text { top: 24%; width: 85vw; padding: 0.5rem 0.75rem; }
    .hero-text .headline { font-size: clamp(1rem, 6.5vw, 1.6rem) !important; line-height: 1.2; margin-bottom: 4px; }
    .hero .circular-gallery { height: 14vh; position: relative; }
    .hero .circular-gallery canvas { transform: translateX(-14px) scale(0.98); }
    .cta { margin-top: 8px; gap: 4px; }
    .btn { height: clamp(28px, 3.5vw, 32px); padding: 0 clamp(10px, 2.5vw, 12px); font-size: clamp(0.65rem, 3.8vw, 0.85rem); }
    /* Further reduce background blur for very small mobile */
    .gradient-orange {
      filter: blur(10px) !important;
    }
    .gradient-blue {
      filter: blur(12px) !important;
    }
  }
  
  @media (max-width: 320px) {
    .hero-text { top: 22%; width: 82vw; }
    .hero .circular-gallery { margin-top: 12vh; height: 12vh; position: relative; }
    .hero .circular-gallery canvas { transform: translateX(-16px) scale(0.98); }
    .headline { font-size: clamp(0.95rem, 7vw, 1.5rem); }
    .subhead { font-size: clamp(0.66rem, 3.4vw, 0.86rem); }
    .kicker { font-size: clamp(0.5rem, 2.8vw, 0.65rem); }
    .btn { height: clamp(26px, 3.2vw, 30px); padding: 0 clamp(8px, 2.2vw, 12px); font-size: clamp(0.6rem, 3.2vw, 0.8rem); }
    /* Minimal background blur for tiny screens */
    .gradient-orange {
      filter: blur(8px) !important;
    }
    .gradient-blue {
      filter: blur(10px) !important;
    }
  }

  /* Ultra small devices (<=300px) */
  @media (max-width: 300px) {
    .hero-text { top: 22%; width: 82vw; }
    .hero .circular-gallery { height: 10vh; position: relative; }
    .hero .circular-gallery canvas { transform: translateX(-18px) scale(0.98); }
    .headline { font-size: clamp(0.9rem, 8vw, 1.6rem); }
    .kicker { font-size: clamp(0.55rem, 4vw, 0.75rem); }
    .btn { height: clamp(24px, 3vw, 28px); padding: 0 clamp(8px, 2vw, 10px); font-size: clamp(0.55rem, 3.5vw, 0.75rem); }
    /* Very minimal background blur for ultra small screens */
    .gradient-orange {
      filter: blur(6px) !important;
    }
    .gradient-blue {
      filter: blur(8px) !important;
    }
  }

  /* Extra ultra small devices (<=280px) */
  @media (max-width: 280px) {
    .hero-text { top: 22%; width: 82vw; }
    .hero .circular-gallery { height: 9vh; position: relative; }
    .hero .circular-gallery canvas { transform: translateX(-18px) scale(0.98); }
    .headline { font-size: clamp(1.8rem, 12vw, 2.6rem); }
    .kicker { font-size: clamp(0.8rem, 5vw, 1rem); }
    .btn { height: 26px; padding: 0 8px; font-size: clamp(0.65rem, 3.5vw, 0.8rem); }
    /* Minimal background blur for tiniest screens */
    .gradient-orange {
      filter: blur(4px) !important;
    }
    .gradient-blue {
      filter: blur(5px) !important;
    }
  }

  /* Isi Hero Section */

  .headline {
    display: flex;
    flex-direction: column;
    margin: 0;
    margin-top: clamp(2rem, 5vw, 4rem);
  }

  .headline span {
    display: block;
    font-weight: 700;
    line-height: 1.2;
    max-width: min(600px, 90vw);
    font-size: clamp(2rem, 5vw, 3.5rem);
    color: #001151;
    letter-spacing: -0.02em;
  }

  /* Media queries for responsive headline */
  @media (max-width: 1024px) {
    .headline {
      margin-top: clamp(1.5rem, 4vw, 3rem);
    }
    .headline span {
      font-size: clamp(1.8rem, 4.5vw, 3rem);
    }
  }

  @media (max-width: 768px) {
    .headline {
      margin-top: clamp(1rem, 3vw, 2rem);
    }
    .headline span {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
    }
  }

  @media (max-width: 480px) {
    .headline {
      margin-top: 1rem;
    }
    .headline span {
      font-size: clamp(1.2rem, 3.5vw, 2rem);
    }
  }

  /* Subline styles */
  .subline {
    display: block;
    margin-top: 1.5rem;
    font-weight: 400;
    line-height: 1.6;
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    color: #5a6b7a;
    max-width: min(600px, 85vw);
    margin-left: 0;
    hover {
      background-color: #6b7a8a;
      
    }
  }

  .text-hero {
    position: relative;
    margin-left: 12rem; /* Added margin-left */
    max-width: 800px;
    padding: 2rem;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .text-hero {
      margin-left: 2rem; /* Smaller margin for tablets */
    }
  }

  @media (max-width: 480px) {
    .text-hero {
      margin-left: 1rem; /* Even smaller for mobile */
      padding: 1rem;
    }
  }

  /* Add to your existing style section */
  .img-container-hero {
    position: absolute;
    top: 50%;
    right: 2rem;
    transform: translateY(-50%);
    width: 600px;
    height: 600px;
    z-index: 1;
    margin-top: 4rem;
  }

  .image-hero {
    width: 500px;
    height: 100%;
    overflow: hidden;
    border-radius: 20px;
  }

  .image-hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  /* Responsive adjustments */
  @media (max-width: 1440px) {
    .img-container-hero {
      width: 500px;
      height: 750px;
    }
  }

  @media (max-width: 1024px) {
    .img-container-hero {
      width: 400px;
      height: 600px;
      right: 1rem;
    }
  }

  @media (max-width: 768px) {
    .img-container-hero {
      position: relative;
      top: 2rem;
      right: 0;
      transform: none;
      width: 100%;
      height: 400px;
      margin: 0 auto;
    }
    
    .image-hero {
      border-radius: 12px;
    }
  }

  @media (max-width: 480px) {
    .img-container-hero {
      height: 300px;
    }
  }
      .coach-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

  /* Stats Section */
  .stats-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    margin-bottom: 4rem;
    text-align: center;
    margin-top: 15rem;
  }

  .stat-item {
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .stat-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .stat-number {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    color: #001151;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: clamp(0.85rem, 1.5vw, 1rem);
    color: #5a6b7a;
    font-weight: 400;
  }

  /* Content Section */
  .content-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    margin-bottom: 7rem;
    align-items: center;
    background: white;
    border-radius: 20px;
    padding: 3rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .image-side {
    position: relative;
  }

  .image-side img {
    width: 100%;
    height: auto;
    border-radius: 16px;
    object-fit: cover;
  }

  .text-side {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .badge {
    display: inline-block;
    background: linear-gradient(135deg, #ff8b51 0%, #FD5701 100%);
    color: white;
    padding: 0.5rem 1.25rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    width: fit-content;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .main-heading {
    font-size: clamp(1.8rem, 3.5vw, 2.5rem);
    font-weight: 700;
    color: #001151;
    line-height: 1.3;
    margin: 0;
  }

  .description {
    font-size: clamp(0.95rem, 1.8vw, 1.1rem);
    color: #5a6b7a;
    line-height: 1.7;
    margin: 0;
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #001151;
    color: white;
    padding: 1rem 2rem;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    width: fit-content;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 17, 81, 0.2);
  }

  .cta-button:hover {
    background: #002080;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 17, 81, 0.3);
  }

  .cta-button::after {
    content: '→';
    font-size: 1.2rem;
    transition: transform 0.3s ease;
  }

  .cta-button:hover::after {
    transform: translateX(4px);
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .stats-container {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .content-container {
      gap: 2.5rem;
      padding: 2rem;
    }
  }

  @media (max-width: 768px) {
    .stats-container {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-item {
      padding: 1rem;
    }

    .content-container {
      grid-template-columns: 1fr;
      gap: 2rem;
      padding: 1.5rem;
    }

    .image-side {
      order: 1;
    }

    .text-side {
      order: 2;
    }
  }

  @media (max-width: 480px) {
    .coach-section {
      padding: 0 1rem;
    }

    .stats-container {
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .stat-number {
      font-size: 1.5rem;
    }

    .stat-label {
      font-size: 0.75rem;
    }

    .content-container {
      padding: 1.25rem;
      gap: 1.5rem;
    }

    .badge {
      font-size: 0.75rem;
      padding: 0.4rem 1rem;
    }

    .cta-button {
      width: 100%;
      justify-content: center;
      padding: 0.875rem 1.5rem;
    }
  }
      `}</style>
    </div>
  );
};

export default KonsulPage;
