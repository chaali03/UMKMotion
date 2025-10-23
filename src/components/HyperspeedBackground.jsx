import React, { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Hyperspeed from './Hyperspeed.jsx';
import './Hyperspeed.css';

export default function HyperspeedBackground({ className = '', effectOptions }) {
  console.log('HyperspeedBackground component rendered');
  
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [1, 0.85, 0.6]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.03]);

  const options = useMemo(() => ({
    ...(effectOptions || {}),
    colors: {
      roadColor: 0x1a1a1a,
      islandColor: 0x2a2a2a,
      background: 0x000000,
      shoulderLines: 0xffffff,
      brokenLines: 0xffffff,
      leftCars: [0xff6a1a, 0xff8a3a, 0xffa766],
      rightCars: [0x2a49ff, 0x4c7dff, 0x7aa6ff],
      sticks: 0x8a86ff
    },
    fov: 80,
    fovSpeedUp: 110,
    speedUp: 1.2, // stronger continuous motion
    lanesPerRoad: 3,
    length: 360,
    roadWidth: 9,
    islandWidth: 1.6,
    totalSideLightSticks: 32,
    lightPairsPerRoadWay: 52,
    distortion: 'turbulentDistortion'
  }), [effectOptions]);

  return (
    <motion.div
      className={`hyperspeed-bg ${className}`}
      style={{ y, opacity, scale }}
      initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      aria-hidden="true"
    >
      <Hyperspeed effectOptions={options} />
    </motion.div>
  );
}
