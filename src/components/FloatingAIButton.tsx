import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageCircle, X, Sparkles } from 'lucide-react';

interface FloatingAIButtonProps {
  onClick?: () => void;
}

const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({ onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = '/ai';
    }
  };
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((showTooltip || isHovered) && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top - 78,
        right: window.innerWidth - rect.right + 8
      });
    }
  }, [showTooltip, isHovered]);

  return (
    <>
      {/* Tooltip */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {(showTooltip || isHovered) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'fixed',
                top: tooltipPos.top,
                right: tooltipPos.right,
                transform: 'translateY(-110%)',
                zIndex: 2000,
                pointerEvents: 'none'
              }}
              className="rounded-2xl p-0 min-w-[280px] max-w-[calc(100vw-2rem)] overflow-visible"
            >
              <div className="pointer-events-auto bg-white/80 backdrop-blur-md border border-blue-100 shadow-lg shadow-blue-500/10 rounded-2xl p-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <img src="/asset/Dina/LogoDina.webp" alt="Dina Logo" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-[13px] leading-none">Sipaling Mengerti Anda</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      Tanya Dina si yang paling mengerti pilihan Anda.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <div ref={buttonRef} className="fixed bottom-6 right-6 z-50">

      {/* Main Button */}
      <motion.button
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.03, y: -4, boxShadow: '0 12px 30px rgba(37, 99, 235, 0.35)' }}
        whileTap={{ scale: 0.98 }}
        className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl p-1 flex items-center justify-center group overflow-visible bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label="Buka Dina AI"
        role="button"
        tabIndex={0}
      >
        {/* Decorative sparkles removed for fully transparent background */}

        {/* Main icon */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          whileHover={{ scale: 1.02, y: -1 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10"
        >
          <img src="/asset/Dina/LogoDina.webp" alt="Dina AI" className="w-full h-full rounded-[14px] object-contain" />
        </motion.div>
        
        {/* Ripple removed for clean image-only look */}
      </motion.button>
      </div>

      {/* Floating particles */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  scale: 0, 
                  x: 0, 
                  y: 0,
                  opacity: 1 
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: Math.random() * 50 - 25,
                  y: Math.random() * 50 - 25,
                  opacity: [0.8, 0.8, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 1.2,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-orange-300 rounded-full pointer-events-none"
              />
            ))}
          </>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};

export default FloatingAIButton;
