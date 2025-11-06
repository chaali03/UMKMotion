import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageCircle, X, Sparkles } from 'lucide-react';

interface FloatingAIButtonProps {
  onClick: () => void;
}

const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      <AnimatePresence>
        {(showTooltip || isHovered) && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-3 bg-white shadow-xl rounded-2xl p-4 border border-orange-100 min-w-[280px]"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Saskia AI</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Tanya saya tentang UMKM, strategi bisnis, atau fitur UMKMotion!
                </p>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="absolute top-full right-6 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={onClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-2xl shadow-orange-500/30 flex items-center justify-center group overflow-hidden"
      >
        {/* Background glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl blur-sm"
        />

        {/* Sparkle effects */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0"
        >
          <Sparkles className="absolute top-1 right-1 w-3 h-3 text-white/60" />
          <Sparkles className="absolute bottom-1 left-1 w-2 h-2 text-white/40" />
        </motion.div>

        {/* Main icon */}
        <motion.div
          animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Bot className="w-8 h-8 text-white" />
        </motion.div>

        {/* Notification dot */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </motion.div>

        {/* Ripple effect on hover */}
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={isHovered ? { scale: 2, opacity: 0 } : { scale: 0, opacity: 0.5 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-white rounded-2xl"
        />
      </motion.button>

      {/* Floating particles */}
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(3)].map((_, i) => (
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
                  x: Math.random() * 60 - 30,
                  y: Math.random() * 60 - 30,
                  opacity: [1, 1, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-orange-400 rounded-full pointer-events-none"
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingAIButton;
