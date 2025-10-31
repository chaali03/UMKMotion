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
          {/* Gradient grid background + glow orbs */}
          <div className="bg-grid" />
          <div className="background-gradients">
            <div className="gradient-orange" />
            <div className="gradient-blue" />
          </div>

          {/* Text side */}
          <div className="text-hero">
            <motion.h1
              className="headline"
              initial={{ opacity: 0, y: 28, scale: 0.98, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0)' }}
              transition={{ duration: 0.75, ease: [0.22, 0.85, 0.3, 1] }}
            >
              <span>MEMBANTU UMKM TUMBUH,</span>
              <span>BERKEMBANG, DAN</span>
              <span>SIAP BERSAING.</span>
            </motion.h1>

            <motion.h2
              className="subline"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              Dapatkan arahan profesional dari tim konsultan berpengalaman untuk membawa bisnis Anda menuju kesuksesan yang lebih besar.
            </motion.h2>

            <motion.div
              className="cta-row"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              <a href="#" className="cta-primary">Jadwalkan Konsultasi</a>
              <a href="#keunggulan" className="cta-secondary">Lihat Keunggulan</a>
            </motion.div>
          </div>

          {/* Image side */}
          <motion.div
            className="img-container-hero"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="image-hero">
              <img src="/asset/dummy/People-dummy.png" alt="Consultant Hero Image" />
              <div className="image-glow" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="coach-section">
        <div className="stats-container">
          {[
            { n: '169+', l: 'Konsultasi UMKM' },
            { n: '108+', l: 'UMKM Sukses' },
            { n: '78+', l: 'Konsultan' },
            { n: '21', l: 'Penghargaan UMKM' }
          ].map((s, i) => (
            <motion.div
              key={s.l}
              className="stat-item"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.04 }}
            >
              <div className="stat-number">{s.n}</div>
              <div className="stat-label">{s.l}</div>
            </motion.div>
          ))}
        </div>

        {/* Content split */}
        <div className="content-container" id="keunggulan">
          <motion.div
            className="image-side"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=700&fit=crop" 
              alt="Professional Coach" 
            />
          </motion.div>

          <motion.div
            className="text-side"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge">PROGRAM KONSULTASI UMKM</span>
            <h2 className="main-heading">Konsultasi Profesional untuk Mengembangkan dan Memajukan Usaha Anda.</h2>
            <p className="description">
              Konsultasi bisnis merupakan langkah penting bagi pelaku UMKM yang ingin meningkatkan kualitas usaha, memperluas jangkauan pasar, dan memperkuat strategi bisnisnya. Di tengah perubahan dunia usaha yang cepat, pendampingan yang tepat menjadi kunci untuk terus bertumbuh dan beradaptasi.
            </p>
            <p className="description">
              Dengan wawasan dan pengalaman tim kami, Anda akan mendapatkan bimbingan, strategi, serta dukungan nyata untuk mengoptimalkan potensi bisnis mulai dari manajemen, pemasaran, hingga transformasi digital yang relevan dengan kebutuhan UMKM masa kini.
            </p>
            <div className="cta-inline">
              <a href="#" className="cta-primary">Jadwalkan Konsultasi Anda</a>
              <a href="#" className="cta-link">Pelajari Program →</a>
            </div>
          </motion.div>
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
          background: radial-gradient(1400px 480px at 50% 0%, rgba(99,102,241,0.12), transparent 70%);
        }
        .bg-grid {
          position: absolute; inset: 0; z-index: 0; height: 100%;
          background-image: radial-gradient(#d1d5db 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: .35;
        }
        .container-hero {
          position: relative;
          max-width: 1440px;
          margin: 0 auto;
          padding: 100px 40px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          justify-content: space-between;
          min-height: 88vh;
          gap: 48px;
        }
        .text-hero { max-width: 640px; z-index: 2; }
        .headline { font-size: 3.5rem; font-weight: 900; line-height: 1.15; margin-bottom: 1.25rem; color: #0f172a; letter-spacing: -0.02em; }
        .headline span { display: block; }
        .subline { font-size: 1.25rem; line-height: 1.7; color: #475569; margin-bottom: 1.75rem; max-width: 92%; }
        .cta-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .cta-primary { background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%); color: #fff; padding: 14px 24px; border-radius: 14px; font-weight: 800; box-shadow: 0 14px 40px rgba(99,102,241,.35); text-decoration: none; transition: transform .25s, box-shadow .25s; }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 52px rgba(99,102,241,.45); }
        .cta-secondary { background: #111827; color: #fff; padding: 14px 18px; border-radius: 14px; font-weight: 700; text-decoration: none; opacity: .9; transition: opacity .2s, transform .2s; }
        .cta-secondary:hover { opacity: 1; transform: translateY(-1px); }

        .img-container-hero { position: relative; z-index: 2; }
        .image-hero { position: relative; }
        .image-hero img { max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 28px 60px rgba(0,0,0,.12); }
        .image-glow { position: absolute; inset: -20px; border-radius: 24px; background: radial-gradient(ellipse at 30% 20%, rgba(99,102,241,.18), transparent 40%), radial-gradient(ellipse at 70% 80%, rgba(236,72,153,.18), transparent 40%); filter: blur(30px); z-index: -1; }

        .background-gradients { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 1; pointer-events: none; }
        .gradient-orange, .gradient-blue { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.18; }
        .gradient-orange { width: 420px; height: 420px; background: linear-gradient(135deg, #ff7a1a 0%, #ff4d00 100%); top: -110px; right: -110px; }
        .gradient-blue { width: 520px; height: 520px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); bottom: -220px; left: -220px; }

        /* Stats */
        .coach-section { padding: 40px 20px 80px; }
        .stats-container { display: flex; justify-content: space-around; gap: 16px; max-width: 1200px; margin: 0 auto 60px; padding: 28px 20px; background: #fff; border-radius: 18px; box-shadow: 0 16px 48px rgba(0,0,0,.06); border: 1px solid rgba(0,0,0,.06); }
        .stat-item { text-align: center; padding: 6px 18px; border-radius: 14px; transition: transform .25s, box-shadow .25s, background .25s; }
        .stat-item:hover { background: rgba(99,102,241,.06); box-shadow: 0 12px 36px rgba(99,102,241,.15); }
        .stat-number { font-size: 2.5rem; font-weight: 900; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.02em; }
        .stat-label { font-size: 1rem; color: #64748b; font-weight: 600; }

        /* Content */
        .content-container { display: flex; max-width: 1200px; margin: 0 auto 100px; padding: 0 20px; gap: 60px; align-items: center; }
        .image-side { flex: 1; }
        .image-side img { width: 100%; border-radius: 16px; box-shadow: 0 28px 60px rgba(0,0,0,.12); }
        .text-side { flex: 1; }
        .badge { display: inline-block; background: #f5f3ff; color: #6d28d9; padding: 8px 16px; border-radius: 999px; font-size: .9rem; font-weight: 800; margin-bottom: 18px; letter-spacing: .02em; }
        .main-heading { font-size: 2.25rem; line-height: 1.3; margin-bottom: 1rem; color: #0f172a; font-weight: 900; letter-spacing: -0.02em; }
        .description { font-size: 1.08rem; line-height: 1.85; color: #475569; margin-bottom: 1.25rem; }
        .cta-inline { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: .5rem; }
        .cta-link { color: #6366f1; font-weight: 800; text-decoration: none; }
        .cta-link:hover { text-decoration: underline; }

        /* Responsive */
        @media (max-width: 1280px) {
          .headline { font-size: 3rem; }
        }
        @media (max-width: 1024px) {
          .container-hero { grid-template-columns: 1fr; padding: 80px 24px; text-align: center; }
          .subline { margin: 0 auto 1.5rem; }
          .img-container-hero { margin-top: 28px; }
          .stats-container { flex-wrap: wrap; gap: 20px; }
          .stat-item { flex: 1 1 40%; }
          .content-container { flex-direction: column; gap: 40px; }
        }
        @media (max-width: 768px) {
          .headline { font-size: 2.1rem; }
          .stat-item { flex: 1 1 100%; }
          .main-heading { font-size: 1.75rem; }
        }
      `}</style>
    </div>
  );
};

export default KonsulPage;
