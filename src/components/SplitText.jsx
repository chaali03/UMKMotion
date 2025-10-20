import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import './SplitText.css';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

const SplitText = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const ref = useRef(null);
  const animationCompletedRef = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      const el = ref.current;

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch (_) {
          /* noop */
        }
        el._rbsplitInstance = null;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets;
      const assignTargets = self => {
        if (splitType.includes('chars') && self.chars.length) targets = self.chars;
        if (!targets && splitType.includes('words') && self.words.length) targets = self.words;
        if (!targets && splitType.includes('lines') && self.lines.length) targets = self.lines;
        if (!targets) targets = self.chars || self.words || self.lines;
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: self => {
          assignTargets(self);
          // Enhanced responsive tuning for small screens and reduced motion
          const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
          const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          // More aggressive scaling for very small screens
          let factor = 1.0;
          if (vw <= 320) factor = 0.4;
          else if (vw <= 360) factor = 0.5;
          else if (vw <= 480) factor = 0.6;
          else if (vw <= 640) factor = 0.7;
          else if (vw <= 768) factor = 0.8;
          else if (vw <= 1024) factor = 0.9;
          
          const effectiveDuration = Math.max(0.28, duration * factor);
          const effectiveDelay = Math.max(12, delay * factor);

          // Reduce animation amplitude on small screens
          const amp = vw <= 320 ? 0.4 : vw <= 360 ? 0.5 : vw <= 480 ? 0.6 : vw <= 768 ? 0.75 : 1.0;
          const adjustedFrom = {
            ...from,
            y: typeof from.y === 'number' ? from.y * amp : from.y,
            x: typeof from.x === 'number' ? from.x * amp : from.x,
            scale: typeof from.scale === 'number' ? 1 + (from.scale - 1) * amp : from.scale,
            rotation: typeof from.rotation === 'number' ? from.rotation * amp : from.rotation,
            rotationX: typeof from.rotationX === 'number' ? from.rotationX * amp : from.rotationX,
            rotationY: typeof from.rotationY === 'number' ? from.rotationY * amp : from.rotationY,
            filter: from.filter && vw <= 480 ? 'blur(0px)' : from.filter
          };
          const adjustedTo = {
            ...to,
            y: typeof to.y === 'number' ? to.y * amp : to.y,
            x: typeof to.x === 'number' ? to.x * amp : to.x,
            scale: typeof to.scale === 'number' ? 1 + (to.scale - 1) * amp : to.scale,
            rotation: typeof to.rotation === 'number' ? to.rotation * amp : to.rotation,
            rotationX: typeof to.rotationX === 'number' ? to.rotationX * amp : to.rotationX,
            rotationY: typeof to.rotationY === 'number' ? to.rotationY * amp : to.rotationY
          };

          if (prefersReduced) {
            // Honor reduced motion: set final state without animation
            gsap.set(targets, { ...to, clearProps: 'all' });
            animationCompletedRef.current = true;
            onLetterAnimationComplete?.();
            return null;
          }

          const tween = gsap.fromTo(
            targets,
            adjustedFrom,
            {
              ...adjustedTo,
              duration: effectiveDuration,
              ease,
              stagger: Math.min(effectiveDelay / 1000, vw <= 480 ? 0.018 : vw <= 768 ? 0.022 : 0.03),
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4
              },
              onComplete: () => {
                animationCompletedRef.current = true;
                onLetterAnimationComplete?.();
              },
              willChange: 'transform, opacity',
              force3D: true
            }
          );
          return tween;
        }
      });

      el._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch (_) {
          /* noop */
        }
        el._rbsplitInstance = null;
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        onLetterAnimationComplete
      ],
      scope: ref
    }
  );

  const renderTag = () => {
    const style = {
      textAlign,
      overflow: 'hidden',
      display: 'inline-block',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
      perspective: '1000px',
      // Mobile-specific optimizations
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'optimizeLegibility'
    };
    const classes = `split-parent ${className}`.trim();
    switch (tag) {
      case 'h1':
        return (
          <h1 ref={ref} style={style} className={classes}>
            {text}
          </h1>
        );
      case 'h2':
        return (
          <h2 ref={ref} style={style} className={classes}>
            {text}
          </h2>
        );
      case 'h3':
        return (
          <h3 ref={ref} style={style} className={classes}>
            {text}
          </h3>
        );
      case 'h4':
        return (
          <h4 ref={ref} style={style} className={classes}>
            {text}
          </h4>
        );
      case 'h5':
        return (
          <h5 ref={ref} style={style} className={classes}>
            {text}
          </h5>
        );
      case 'h6':
        return (
          <h6 ref={ref} style={style} className={classes}>
            {text}
          </h6>
        );
      default:
        return (
          <p ref={ref} style={style} className={classes}>
            {text}
          </p>
        );
    }
  };
  return renderTag();
};

export default SplitText;
