import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Store, ArrowRight, Sparkles } from 'lucide-react';

export default function SellPromotion() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setIsLoggedIn(!!user));
    return () => unsub();
  }, []);

  const handleClick = () => {
    if (isLoggedIn === null) return;

    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }

    // Sudah login: arahkan ke halaman profile bagian toko (gunakan hash/param supaya bisa di-handle di ProfilePage)
    window.location.href = '/profile#toko';
  };

  return (
    <>
      <section className="sell-promotion group">
        <div className="sell-content">


          {/* Teks Utama */}
          <div className="sell-text">
            <h3>
              <Store className="inline-icon" />
              Ingin Jualan di Sini?
            </h3>
            <p>
              Gabung bersama <strong>ribuan UMKM sukses</strong> dan kembangkan bisnismu dengan mudah! 
              Jangkau <strong>jutan pembeli</strong> tanpa ribet.
            </p>
          </div>
        </div>

        {/* Tombol CTA */}
        <button className="sell-cta" onClick={handleClick}>
          Daftar Sekarang
          <ArrowRight className="cta-arrow" />
        </button>
      </section>

      {/* CSS: PREMIUM BUSINESS PROMOTION */}
      <style>{`
        * { box-sizing: border-box; }

        .sell-promotion {
          background: linear-gradient(135deg, #fff7f2 0%, #ffe9df 100%);
          padding: clamp(1.5rem, 4vw, 2rem) clamp(1.8rem, 5vw, 2.5rem);
          border-radius: 1.2rem;
          box-shadow: 
            0 8px 25px rgba(253, 87, 1, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.05);
          margin: clamp(2rem, 5vw, 3rem) 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: clamp(1rem, 3vw, 2rem);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideUpFade 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
          border: 1px solid rgba(253, 87, 1, 0.18);
        }

        @keyframes slideUpFade {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Hover Effect: Lift + Glow */
        .sell-promotion:hover {
          transform: translateY(-6px);
          box-shadow: 
            0 20px 40px rgba(253, 87, 1, 0.2),
            0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .sell-promotion::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.4) 0%, 
            rgba(255, 255, 255, 0.1) 100%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .sell-promotion:hover::before {
          opacity: 1;
        }

        /* Badge Gratis */
        .badge {
          position: absolute;
          top: -10px;
          right: 20px;
          background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-500));
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(253, 87, 1, 0.3);
          animation: pulse 2s infinite;
          z-index: 10;
        }

        .badge-icon {
          width: 14px;
          height: 14px;
          animation: sparkle 1.5s infinite alternate;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes sparkle {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }

        /* Konten Utama */
        .sell-content {
          flex: 1;
          position: relative;
          z-index: 2;
        }

        .sell-text h3 {
          font-size: clamp(1.3rem, 4vw, 1.6rem);
          color: var(--brand-blue-ink);
          margin: 0 0 0.5rem 0;
          font-weight: 800;
          line-height: 1.2;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .inline-icon {
          width: clamp(1.4rem, 4vw, 1.8rem);
          height: clamp(1.4rem, 4vw, 1.8rem);
          color: var(--brand-orange);
        }

        .sell-text p {
          margin: 0;
          color: #444;
          font-size: clamp(0.9rem, 2.5vw, 1rem);
          line-height: 1.5;
          font-weight: 500;
        }

        .sell-text p strong {
          color: var(--brand-orange);
        }

        /* Tombol CTA */
        .sell-cta {
          background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-500));
          color: white;
          padding: clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3.5vw, 2rem);
          border: none;
          border-radius: 12px;
          font-size: clamp(0.95rem, 2.5vw, 1.1rem);
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
          transition: all 0.3s ease;
          box-shadow: 0 6px 15px rgba(253, 87, 1, 0.3);
          position: relative;
          overflow: hidden;
          z-index: 2;
        }

        .sell-cta::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          width: 0; height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .sell-cta:hover::after {
          width: 300px;
          height: 300px;
        }

        .sell-cta:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 12px 25px rgba(253, 87, 1, 0.4);
        }

        .cta-arrow {
          width: clamp(1rem, 2.5vw, 1.3rem);
          height: clamp(1rem, 2.5vw, 1.3rem);
          transition: transform 0.3s ease;
        }

        .sell-cta:hover .cta-arrow {
          transform: translateX(4px);
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .sell-promotion {
            flex-direction: column;
            text-align: center;
            padding: 1.8rem 1.5rem;
            gap: 1.2rem;
          }

          .badge {
            top: -8px;
            right: auto;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.7rem;
            padding: 5px 12px;
          }

          .sell-text h3 {
            justify-content: center;
            font-size: 1.3rem;
          }

          .sell-cta {
            width: 100%;
            max-width: 280px;
            margin: 0 auto;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .sell-promotion {
            padding: 1.5rem 1rem;
            border-radius: 1rem;
          }

          .sell-text h3 {
            font-size: 1.15rem;
          }

          .sell-text p {
            font-size: 0.88rem;
          }

          .sell-cta {
            padding: 0.75rem 1.5rem;
            font-size: 0.95rem;
          }

          .badge {
            font-size: 0.65rem;
            padding: 4px 10px;
          }
        }
      `}</style>
    </>
  );
}