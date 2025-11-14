import React, {
  useRef,
  useEffect,
  useLayoutEffect as useReactLayoutEffect,
  useCallback
} from 'react';
import Lenis from 'lenis';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' && typeof useReactLayoutEffect === 'function'
    ? useReactLayoutEffect
    : useEffect;

const ScrollStack = ({
  children,
  itemDistance = 20,
  itemScale = 0.9,
  itemStackDistance = 20,
  stackPosition = 0.5,
  scaleEndPosition = 0.8,
  baseScale = 0.9,
  scaleDuration = 0.5,
  rotationAmount = 5,
  blurAmount = 2,
  useWindowScroll = false,
  onStackComplete = () => {},
  className = '',
  ...props
}) => {
  const scrollerRef = useRef(null);
  const cardsRef = useRef([]);
  const lenisRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTransformsRef = useRef(new Map());
  const stackCompletedRef = useRef(false);
  const isUpdatingRef = useRef(false);

  const updateCardTransforms = useCallback(() => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    const scrollY = useWindowScroll ? window.scrollY : lenisRef.current?.scroll || 0;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const transformsCache = lastTransformsRef.current;
    const cards = cardsRef.current;
    if (!cards.length) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollAreaHeight = scroller.scrollHeight - viewportHeight;
    const scrollProgress = Math.min(1, Math.max(0, scrollY / scrollAreaHeight));

    cards.forEach((card, i) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = (cardRect.top + cardRect.bottom) / 2;
      const viewportCenter = viewportHeight * 0.5;
      const distanceFromCenter = Math.abs(cardCenter - viewportCenter);
      const maxDistance = viewportHeight * 0.5;
      const distanceRatio = Math.min(1, distanceFromCenter / maxDistance);

      const scale = 1 - (1 - baseScale) * distanceRatio;
      const rotation = (i % 2 === 0 ? 1 : -1) * rotationAmount * distanceRatio;
      const blur = blurAmount * distanceRatio;

      const transform = `translate3d(0, 0, 0) scale(${scale}) rotate(${rotation}deg)`;
      
      if (transformsCache.get(card) !== transform) {
        card.style.transform = transform;
        card.style.filter = `blur(${blur}px)`;
        transformsCache.set(card, transform);
      }
    });

    if (scrollProgress >= scaleEndPosition && !stackCompletedRef.current) {
      stackCompletedRef.current = true;
      onStackComplete();
    } else if (scrollProgress < scaleEndPosition) {
      stackCompletedRef.current = false;
    }

    isUpdatingRef.current = false;
  }, [baseScale, blurAmount, rotationAmount, scaleEndPosition, useWindowScroll, onStackComplete]);

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      window.addEventListener('scroll', updateCardTransforms, { passive: true });
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenis.on('scroll', updateCardTransforms);
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    }

    animationFrameRef.current = requestAnimationFrame(raf);
  }, [updateCardTransforms, useWindowScroll]);

  useIsomorphicLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : scroller.querySelectorAll('.scroll-stack-card')
    );

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.webkitTransform = 'translateZ(0)';
      card.style.perspective = '1000px';
      card.style.webkitPerspective = '1000px';
      card.style.zIndex = cards.length - i;
    });

    setupLenis();
    updateCardTransforms();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      if (useWindowScroll) {
        window.removeEventListener('scroll', updateCardTransforms);
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    updateCardTransforms
  ]);

  return (
    <div
      ref={scrollerRef}
      className={`scroll-stack ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div className="scroll-stack-card" style={{ position: 'relative' }}>
          {child}
        </div>
      ))}
    </div>
  );
};

const ScrollStackItem = ({ children, className = '', ...props }) => {
  return (
    <div className={`scroll-stack-item ${className}`} {...props}>
      {children}
    </div>
  );
};

export { ScrollStack, ScrollStackItem };
export default ScrollStack;