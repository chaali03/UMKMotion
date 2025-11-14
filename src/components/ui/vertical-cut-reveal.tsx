import { forwardRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { Variants } from 'framer-motion';

export interface VerticalCutRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  as?: React.ElementType;
}

const VerticalCutReveal = forwardRef<HTMLElement, VerticalCutRevealProps>(
  ({ children, className = '', delay = 0, duration = 0.6, yOffset = 20, as = 'div' }, ref) => {
    const controls = useAnimation();
    const base: React.ElementType = as || 'div';
    const Component: React.ElementType =
      typeof base === 'string' ? (motion as any)[base] : motion(base as any);

    useEffect(() => {
      controls.start('visible');
    }, [controls]);

    const variants: Variants = {
      hidden: {
        opacity: 0,
        y: yOffset,
        transition: {
          duration: duration,
          ease: [0.6, -0.05, 0.01, 0.99],
        },
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          delay: delay,
          duration: duration,
          ease: [0.6, -0.05, 0.01, 0.99],
        },
      },
    };

    return (
      <Component
        ref={ref}
        className={className}
        initial="hidden"
        animate={controls}
        variants={variants}
      >
        {children}
      </Component>
    );
  }
);

VerticalCutReveal.displayName = 'VerticalCutReveal';

export default VerticalCutReveal;
