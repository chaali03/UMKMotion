"use client";
import { TimelineContent } from "@/components/ui/timeline-animation";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { ArrowRight, MapPin, TrendingUp, Users, Zap, Compass, Star, Clock, Store } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Konten() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", checkMobile);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.8,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: 40,
      opacity: 0,
    },
  };

  const scaleVariants = {
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 1,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
    hidden: {
      scale: 0.95,
      filter: "blur(12px)",
      opacity: 0,
    },
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Data lokasi UMKM di Indonesia - Filter untuk mobile
  const allLocationPins = [
    { city: "Jakarta", top: "48%", left: "42%", delay: 0, umkmCount: "25K+", priority: 1 },
    { city: "Bandung", top: "52%", left: "40%", delay: 0.3, umkmCount: "18K+", priority: 3 },
    { city: "Surabaya", top: "50%", left: "65%", delay: 0.6, umkmCount: "22K+", priority: 2 },
    { city: "Yogyakarta", top: "54%", left: "48%", delay: 0.9, umkmCount: "15K+", priority: 4 },
    { city: "Semarang", top: "46%", left: "50%", delay: 1.2, umkmCount: "12K+", priority: 5 },
    { city: "Bali", top: "58%", left: "58%", delay: 1.5, umkmCount: "20K+", priority: 3 },
    { city: "Medan", top: "22%", left: "28%", delay: 1.8, umkmCount: "14K+", priority: 4 },
    { city: "Makassar", top: "62%", left: "75%", delay: 2.1, umkmCount: "11K+", priority: 5 },
  ];

  // Show fewer pins on mobile
  const locationPins = isMobile 
    ? allLocationPins.filter(pin => pin.priority <= 3)
    : allLocationPins;

  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 lg:px-8 bg-white overflow-hidden" ref={heroRef}>
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-3xl"
          animate={{
            x: isMobile ? 0 : mousePosition.x * 0.02,
            y: isMobile ? 0 : mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
        />
        <motion.div 
          className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-tr from-amber-200/40 to-orange-200/40 rounded-full blur-3xl"
          animate={{
            x: isMobile ? 0 : mousePosition.x * -0.02,
            y: isMobile ? 0 : mousePosition.y * -0.02,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
        />
        
        {/* Decorative Grid - Hidden on small mobile */}
        <div className="hidden sm:block absolute inset-0 bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03]" />
        
        {/* Floating Icons - Hidden on mobile */}
        <motion.div animate={floatingAnimation} className="hidden lg:block absolute top-32 right-[15%] opacity-20">
          <MapPin className="w-12 h-12 text-blue-600" />
        </motion.div>
        <motion.div animate={{...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 }}} className="hidden lg:block absolute bottom-32 left-[10%] opacity-20">
          <Compass className="w-16 h-16 text-violet-600" />
        </motion.div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10 overflow-visible">

        {/* Main Hero Section */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 mb-16 sm:mb-20 md:mb-24 items-center overflow-visible">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 md:space-y-10 order-2 lg:order-1 overflow-visible">
            <div className="space-y-4 sm:space-y-6 overflow-visible">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black !leading-[1.1] text-slate-900">
                <VerticalCutReveal as="span" delay={0.3} duration={0.8}>
                  <span className="block mb-1 sm:mb-2">Temukan UMKM</span>
                  <span className="block bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
                    Terdekat
                  </span>
                  <span className="block">di Sekitar Anda</span>
                </VerticalCutReveal>
              </h1>

              <TimelineContent
                as="p"
                animationNum={1}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 leading-relaxed font-light max-w-xl"
              >
                Navigasi pintar dengan peta interaktif untuk menemukan UMKM terbaik. 
                <span className="font-semibold text-orange-600"> Filter kategori, rating, dan jam buka</span> sesuai kebutuhan.
              </TimelineContent>
            </div>

            {/* Enhanced Stats Cards */}
            <TimelineContent
              as="div"
              animationNum={2}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 overflow-visible"
            >
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="group relative bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-xl border border-orange-200/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl shadow-orange-500/10 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 overflow-visible"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/0 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 md:p-2.5 bg-sky-100 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-sky-600" />
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-br from-sky-600 to-cyan-600 bg-clip-text text-transparent">250+</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">Area Terjangkau</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Di seluruh Indonesia</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="group relative bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-xl border border-amber-200/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl shadow-amber-500/10 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 overflow-visible"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/0 to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 md:p-2.5 bg-violet-100 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-violet-600" />
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-br from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">150K+</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">UMKM Terdata</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Aktif & terverifikasi</p>
                </div>
              </motion.div>
            </TimelineContent>

            {/* CTA Buttons */}
            <TimelineContent
              as="div"
              animationNum={3}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 overflow-visible"
            >
              <motion.button
                whileHover={{ y: isMobile ? 0 : -3, scale: isMobile ? 1 : 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 bg-size-200 hover:bg-pos-100 text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl shadow-orange-500/40 transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 overflow-hidden w-full sm:w-auto"
                onClick={() => window.location.href = "/rumah-umkm"}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <span className="relative">Buka Peta UMKM</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-2 transition-transform relative" />
              </motion.button>
            </TimelineContent>

            {/* Trust Indicators */}
            <TimelineContent
              as="div"
              animationNum={4}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8 pt-4 border-t border-slate-200 overflow-visible"
            >
              <div className="flex items-center gap-2 overflow-visible">
                <div className="flex -space-x-2 overflow-visible">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      {i}K
                    </div>
                  ))}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  <span className="text-orange-600">15,000+</span> Pengguna Aktif
                </p>
              </div>
              <div className="flex items-center gap-2 overflow-visible">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 sm:w-5 h-4 sm:h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">4.9/5 Rating</p>
              </div>
            </TimelineContent>
          </div>

          {/* Right Content - Enhanced Map Preview */}
          <TimelineContent
            as="div"
            animationNum={5}
            timelineRef={heroRef}
            customVariants={scaleVariants}
            className="relative order-1 lg:order-2 overflow-visible"
          >
            <motion.div 
              whileHover={{ y: isMobile ? 0 : -2, scale: isMobile ? 1 : 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative rounded-2xl sm:rounded-3xl overflow-visible backdrop-blur-sm group"
            >
              {/* Map Container with Glassmorphism */}
              <div className="relative bg-gradient-to-br from-white/80 to-orange-50/60 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border-2 border-white/60 backdrop-blur-xl overflow-visible">
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden">
                  {/* Map Image - Focused on Indonesia */}
                  <img
                    src="/asset/Peta/Peta.png"
                    alt="Peta Indonesia - UMKM Interaktif"
                    className="w-full h-full object-cover aspect-[4/3] brightness-95"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-orange-500/20" />
                  
                  {/* Animated Location Pins */}
                  <AnimatePresence>
                    {locationPins.map((pin, index) => (
                      <motion.div
                        key={pin.city}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 2 + pin.delay, duration: 0.5, type: "spring" }}
                        className="absolute z-20 group/pin cursor-pointer overflow-visible"
                        style={{ top: pin.top, left: pin.left }}
                      >
                        {/* Pin with Pulse Animation */}
                        <motion.div
                          animate={{ 
                            y: [0, -8, 0],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            delay: pin.delay
                          }}
                          className="relative overflow-visible"
                        >
                          {/* Ping Effect */}
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping" />
                          </span>
                          
                          {/* Main Pin Icon */}
                          <div className="relative">
                            <div className="w-7 sm:w-8 md:w-10 h-7 sm:h-8 md:h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center border-2 sm:border-3 border-white">
                              <MapPin className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white fill-white" />
                            </div>
                          </div>

                          {/* Tooltip on Hover - Hidden on mobile */}
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            whileHover={{ opacity: 1, y: -10, scale: 1 }}
                            className="hidden sm:block absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover/pin:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50"
                          >
                            <div className="bg-white/95 backdrop-blur-md rounded-xl px-4 py-2 shadow-xl border border-orange-100">
                              <p className="font-bold text-slate-900 text-sm">{pin.city}</p>
                              <p className="text-xs text-orange-600 font-semibold">{pin.umkmCount} UMKM</p>
                            </div>
                            {/* Arrow */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-orange-100" />
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Floating Info Cards */}
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2, duration: 0.8 }}
                    className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 z-20"
                  >
                    <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 border border-orange-100 max-w-[140px] sm:max-w-[180px] md:max-w-[200px]">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-md sm:rounded-lg">
                          <Store className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-black text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">150K+</p>
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-900">UMKM Terdaftar</p>
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-slate-600">Di seluruh Indonesia</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.3, duration: 0.8 }}
                    className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 z-20"
                  >
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 border-2 border-white/50">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-white mb-0.5 sm:mb-1">
                        <div className="w-1.5 sm:w-2 md:w-2.5 h-1.5 sm:h-2 md:h-2.5 bg-white rounded-full animate-pulse" />
                        <span className="text-[10px] sm:text-xs md:text-sm font-bold">LIVE</span>
                      </div>
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-white/90 font-semibold">Data Real-Time</p>
                    </div>
                  </motion.div>
                  
                  {/* Bottom Stats Bar */}
                  <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 2.6, duration: 0.8 }}
                    className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-3 sm:left-4 md:left-6 right-3 sm:right-4 md:right-6 z-20"
                  >
                    <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-orange-100">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                          <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg sm:rounded-xl">
                            <MapPin className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm sm:text-base md:text-lg">Lokasi Akurat</p>
                            <p className="text-xs sm:text-sm text-slate-600">GPS Precision 99.9%</p>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                          <div className="flex items-center gap-1 bg-green-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] sm:text-xs font-bold text-green-700">Active</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-slate-500 font-medium">250+ Area</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Decorative Glow Elements removed to eliminate shadow under map */}
            </motion.div>
          </TimelineContent>
        </div>

        {/* Enhanced Services Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-16 sm:mb-20 md:mb-24 overflow-visible">
          {[
            {
              icon: MapPin,
              title: "Pencarian Otomatis",
              description: "Deteksi lokasi GPS dan tampilkan UMKM terdekat secara real-time dengan radius yang dapat disesuaikan.",
              gradient: "from-orange-500 to-amber-500",
              bgGradient: "from-orange-50 to-amber-50",
              delay: 6
            },
            {
              icon: TrendingUp,
              title: "Filter Cerdas",
              description: "Saring hasil berdasarkan kategori, rating bintang, harga, dan jam operasional untuk pengalaman optimal.",
              gradient: "from-amber-500 to-orange-500",
              bgGradient: "from-amber-50 to-orange-50",
              delay: 7
            },
            {
              icon: Zap,
              title: "Navigasi Langsung",
              description: "Integrasi dengan Google Maps untuk arahan rute tercepat ke lokasi UMKM pilihan Anda.",
              gradient: "from-orange-600 to-amber-600",
              bgGradient: "from-orange-50 to-amber-50",
              delay: 8
            }
          ].map((service, index) => (
            <TimelineContent
              key={index}
              as="div"
              animationNum={service.delay}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="overflow-visible"
            >
              <motion.div
                whileHover={{ y: isMobile ? 0 : -6, scale: isMobile ? 1 : 1.02 }}
                className={`group relative bg-gradient-to-br ${service.bgGradient} backdrop-blur-xl border border-white/60 rounded-2xl sm:rounded-3xl p-6 sm:p-7 md:p-8 hover:shadow-2xl transition-all duration-500 overflow-visible h-full`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" />
                
                <div className="relative space-y-3 sm:space-y-4 md:space-y-5">
                  <motion.div 
                    whileHover={{ y: isMobile ? 0 : -4, rotate: isMobile ? 0 : -3, scale: isMobile ? 1 : 1.06 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
                    className={`w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-br ${service.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl`}
                  >
                    <service.icon className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2 sm:mb-3 group-hover:text-orange-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-orange-600 font-semibold text-xs sm:text-sm group-hover:gap-3 transition-all pt-2">
                    <span>Pelajari lebih lanjut</span>
                    <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
                  </div>
                </div>
              </motion.div>
            </TimelineContent>
          ))}
        </div>

        {/* Premium CTA Section */}
        <TimelineContent
          as="div"
          animationNum={9}
          timelineRef={heroRef}
          customVariants={revealVariants}
          className="overflow-visible"
        >
          <motion.div
            whileHover={{ scale: isMobile ? 1 : 1.02 }}
            className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 bg-size-200 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-6 sm:p-10 md:p-12 lg:p-16 overflow-hidden group"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-orange-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:3rem_3rem] opacity-10" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 overflow-visible">
              <div className="flex-1 space-y-3 sm:space-y-4 text-center md:text-left overflow-visible">
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/30"
                >
                  <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  <span className="text-xs sm:text-sm font-semibold text-white">Tersedia 24/7</span>
                </motion.div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
                  Siap Jelajahi UMKM<br />
                  <span className="text-orange-100">di Sekitar Anda?</span>
                </h2>
                <p className="text-orange-50 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed">
                  Akses peta interaktif dengan ribuan UMKM terverifikasi. Temukan, navigasi, dan dukung bisnis lokal dengan mudah.
                </p>
                
                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 pt-2 sm:pt-4 overflow-visible">
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <Users className="w-5 sm:w-6 h-5 sm:h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg sm:text-xl">15,000+</p>
                      <p className="text-xs sm:text-sm text-orange-100">Pengguna Aktif</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <Star className="w-5 sm:w-6 h-5 sm:h-6 fill-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg sm:text-xl">4.9/5</p>
                      <p className="text-xs sm:text-sm text-orange-100">Rating Pengguna</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ y: isMobile ? 0 : -4, scale: isMobile ? 1 : 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="group/btn relative bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 text-slate-900 px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg md:text-xl shadow-2xl transition-all duration-300 flex items-center gap-3 sm:gap-4 whitespace-nowrap overflow-hidden w-full md:w-auto justify-center"
                onClick={() => window.location.href = "/rumah-umkm"}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-600/10 to-orange-600/0 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                <span className="relative flex items-center gap-2 sm:gap-3">
                  <Compass className="w-5 sm:w-6 h-5 sm:h-6 text-orange-600 group-hover/btn:rotate-180 transition-transform duration-700" />
                  <span className="hidden sm:inline">Buka Peta Sekarang</span>
                  <span className="sm:hidden">Buka Peta</span>
                </span>
                <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 group-hover/btn:translate-x-2 transition-transform relative" />
              </motion.button>
            </div>
          </motion.div>
        </TimelineContent>
      </div>
    </section>
  );
}