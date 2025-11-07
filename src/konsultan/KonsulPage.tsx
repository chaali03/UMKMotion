import React, { useEffect, useState } from 'react';
import TestimonialSection from './testimonial/TestimonialSection';
import Footer from '../LandingPage/components/footer/Footer';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { TimelineContent } from "@/components/ui/timeline-animation";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { 
  ArrowRight, 
  Award, 
  Target, 
  Users, 
  CheckCircle, 
  Sparkles, 
  TrendingUp,
  MessageCircle,
  Calendar,
  Star,
  Zap,
  BarChart3
} from "lucide-react";
import { useRef } from "react";

function HeroKonsultanAbout() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.15, duration: 0.8 }
    }),
    hidden: { filter: "blur(12px)", y: 40, opacity: 0 }
  } as const;

  const features = [
    { icon: CheckCircle, text: "Pendampingan strategi pemasaran dan digitalisasi", color: "from-blue-600 to-indigo-600" },
    { icon: CheckCircle, text: "Rencana aksi 30–90 hari yang terukur", color: "from-purple-600 to-fuchsia-600" },
    { icon: CheckCircle, text: "Akses jaringan mentor dan komunitas UMKM", color: "from-cyan-500 to-sky-500" }
  ];

  return (
    <section ref={heroRef} className="relative py-20 sm:py-28 px-4 bg-gradient-to-b from-white via-orange-50/30 to-white overflow-visible">
      {/* Enhanced background elements */}
      <div className="pointer-events-none absolute inset-0">
        {!prefersReducedMotion && (
          <>
            {/* Animated gradient orbs */}
            <motion.div 
              animate={{ x: mousePosition.x * 0.02, y: mousePosition.y * 0.02 }}
              transition={{ type: "spring", stiffness: 50, damping: 30 }}
              className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-400/30 via-amber-400/20 to-transparent blur-3xl rounded-full"
            />
            <motion.div 
              animate={{ x: mousePosition.x * -0.02, y: mousePosition.y * -0.02 }}
              transition={{ type: "spring", stiffness: 50, damping: 30 }}
              className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/25 via-indigo-400/15 to-transparent blur-3xl rounded-full"
            />
            <motion.div 
              animate={{ x: mousePosition.x * -0.01, y: mousePosition.y * 0.01 }}
              transition={{ type: "spring", stiffness: 50, damping: 30 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-gradient-to-br from-purple-400/20 via-fuchsia-400/15 to-transparent blur-3xl rounded-full"
            />
            {/* Floating shapes */}
            <motion.div
              animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 right-1/4 w-20 h-20 border-4 border-orange-300/20 rounded-lg"
            />
            <motion.div
              animate={{ y: [0, 30, 0], rotate: [360, 180, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full"
            />
          </>
        )}
        {/* Grid pattern overlays (pushed further back) */}
        <motion.div 
          style={prefersReducedMotion ? undefined : { y }}
          className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.02]"
        />
        <motion.div 
          style={prefersReducedMotion ? undefined : { y }}
          className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.015]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          {/* Heading with gradient */}
          <div className="overflow-visible">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 leading-[1.25] md:!leading-[1.1] overflow-visible">
              <VerticalCutReveal delay={0.3} duration={0.8}>
                <span className="block mb-2">Tumbuhkan Bisnis</span>
                <span className="inline-block bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent leading-[1.3] md:leading-[1.15] pb-[0.3em]">
                  dengan Konsultan
                </span>
                <span className="block">Ahli Terpercaya</span>
              </VerticalCutReveal>
            </h1>

            <TimelineContent
              as="p"
              animationNum={1}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl"
            >
              Dapatkan <span className="font-bold text-orange-600">strategi, pendampingan, dan eksekusi</span> yang tepat untuk meningkatkan performa usaha. Fokus pada pertumbuhan; sisanya kami bantu.
            </TimelineContent>
          </div>

          {/* Enhanced stats cards */}
          <TimelineContent
            as="div"
            animationNum={2}
            timelineRef={heroRef}
            customVariants={revealVariants}
          >
            <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-gradient-to-br from-white to-orange-50/50 border-2 border-orange-100/60 rounded-3xl p-4 sm:p-5 shadow-xl shadow-orange-500/10 backdrop-blur-sm">
              {[
                { icon: Users, num: "78+", label: "Konsultan Ahli", color: "from-orange-500 to-amber-500" },
                { icon: Award, num: "108+", label: "UMKM Sukses", color: "from-amber-500 to-orange-500" },
                { icon: Target, num: "169+", label: "Sesi Konsultasi", color: "from-orange-600 to-amber-600" }
              ].map((stat, idx) => (
                <motion.div 
                  key={stat.label}
                  whileHover={prefersReducedMotion ? {} : { y: -6, scale: 1.02 }}
                  className="group text-center rounded-2xl p-3 sm:p-4 bg-white shadow-md hover:shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                >
                  <motion.div 
                    whileHover={prefersReducedMotion ? {} : { y: -2, rotate: -3, scale: 1.04 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl`}
                  >
                    <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </motion.div>
                  <div className={`text-2xl sm:text-3xl font-black bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-1`}>
                    {stat.num}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </TimelineContent>

          {/* Feature list with icons */}
          <TimelineContent
            as="div"
            animationNum={3}
            timelineRef={heroRef}
            customVariants={revealVariants}
          >
            <div className="space-y-3">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={prefersReducedMotion ? {} : { x: 6, scale: 1.015 }}
                  className="flex items-start gap-3 group"
                >
                  <motion.div
                    whileHover={prefersReducedMotion ? {} : { rotate: -8, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                    className={`mt-0.5 p-1.5 rounded-lg bg-gradient-to-br ${feature.color} shadow-md transition-transform`}
                  >
                    <feature.icon className="w-4 h-4 text-white" />
                  </motion.div>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
                    {feature.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </TimelineContent>

          {/* CTA Buttons */}
          <TimelineContent
            as="div"
            animationNum={4}
            timelineRef={heroRef}
            customVariants={revealVariants}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.025, backgroundPosition: '100% 0' }}
                whileTap={{ scale: 0.98 }}
                aria-label="Jadwalkan Konsultasi"
                className="group relative text-white px-8 py-4 rounded-2xl font-bold text-lg inline-flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/40"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #12307a 0%, #2f5fe7 50%, #7c3aed 100%)',
                  backgroundSize: '200% 100%',
                  backgroundPosition: '0% 0',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)'
                }}
              >
                {!prefersReducedMotion && (
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                )}
                <span className="pointer-events-none absolute inset-0" style={{
                  background: 'radial-gradient(90% 140% at 50% 50%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.08) 36%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0) 75%)'
                }} />
                <Calendar className="w-5 h-5" />
                <span className="relative">Jadwalkan Konsultasi</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative" />
              </motion.button>

              <motion.button
                whileHover={prefersReducedMotion ? {} : { y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Pelajari Layanan"
                className="group relative bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg inline-flex items-center justify-center gap-3 hover:border-orange-300 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/40 overflow-hidden"
                style={{
                  backgroundImage: prefersReducedMotion ? undefined : 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(15,23,42,0.03) 100%)'
                }}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Pelajari Layanan</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                {!prefersReducedMotion && (
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                    background: 'radial-gradient(120% 140% at 50% 0%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)'
                  }} />
                )}
              </motion.button>
            </div>
          </TimelineContent>

          {/* Trust indicators */}
          <TimelineContent
            as="div"
            animationNum={5}
            timelineRef={heroRef}
            customVariants={revealVariants}
          >
            <div className="flex items-center gap-6 pt-4 border-t-2 border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm" aria-hidden>
                      {i}K
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  <span className="text-orange-600">10,000+</span> UMKM Terdampak
                </p>
              </div>
            </div>
          </TimelineContent>
        </div>

        {/* Right Content - Enhanced Image */}
        <TimelineContent
          as="div"
          animationNum={6}
          timelineRef={heroRef}
          customVariants={revealVariants}
        >
          <motion.div 
            whileHover={prefersReducedMotion ? {} : { y: -2, scale: 1.01 }}
            className="relative md:-mt-12 lg:-mt-20 xl:-mt-84 2xl:-mt-28"
          >
            {/* Main image with glassmorphism card */}
            <div className="relative z-[1] bg-gradient-to-br from-white/80 to-orange-50/60 p-3 rounded-3xl border-2 border-white/60 shadow-none">
              <div className="relative rounded-2xl overflow-hidden">
                <motion.img
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1074&auto=format&fit=crop"
                  alt="Kolaborasi Konsultan"
                  className="w-full h-[400px] sm:h-[500px] object-cover"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                  initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
                
                {/* Removed overlay to avoid dark edge near image */}
                
                {/* Floating badges */}

                {/* 2) Success metric badge at bottom (refined) */}
                <motion.div
                  initial={{ y: prefersReducedMotion ? 0 : 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="absolute bottom-6 left-6 right-6"
                >
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-none border border-orange-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Tingkat Keberhasilan</p>
                          <p className="text-sm text-slate-600">UMKM yang Tumbuh</p>
                        </div>
                      </div>
                      <div className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        94%
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "94%" }}
                        transition={{ delay: 0.9, duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Removed decorative blurred blobs around image to avoid shadow-like glow */}
          </motion.div>
        </TimelineContent>
      </div>
    </section>
  );
}

const KonsulPage: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const stats = [
    { icon: BarChart3, n: '169+', l: 'Konsultasi UMKM', color: 'from-blue-600 to-indigo-600' },
    { icon: Award, n: '108+', l: 'UMKM Sukses', color: 'from-purple-600 to-fuchsia-600' },
    { icon: Users, n: '78+', l: 'Konsultan Ahli', color: 'from-cyan-500 to-sky-500' },
    { icon: Star, n: '21', l: 'Penghargaan UMKM', color: 'from-emerald-500 to-teal-600' }
  ];

  return (
    <div className="konsul-page bg-white">
      <HeroKonsultanAbout />

      {/* Enhanced Stats Section */}
      <section ref={statsRef} className="relative py-16 sm:py-20 px-4 bg-gradient-to-b from-white via-orange-50/20 to-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.05)_0%,transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Zap className="w-4 h-4" />
              Pencapaian Kami
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Dampak <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Nyata</span> untuk UMKM
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.055, y: -10, rotate: -1.2 }}
                className="group relative bg-gradient-to-br from-white to-orange-50/50 border-2 border-orange-100/60 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:border-orange-200 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative space-y-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg group-hover:shadow-xl mx-auto`}
                  >
                    <s.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </motion.div>
                  
                  <div className="text-center">
                    <div className={`text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-br ${s.color} bg-clip-text text-transparent mb-2`}>
                      {s.n}
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-slate-600">
                      {s.l}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Content Section */}
      <section ref={contentRef} className="relative py-16 sm:py-20 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-transparent blur-3xl rounded-full" />
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-transparent blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image side */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-[1] bg-gradient-to-br from-white/80 to-orange-50/60 p-3 rounded-3xl border-2 border-white/60 shadow-none">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=700&fit=crop" 
                  alt="Professional Coach" 
                  className="w-full h-[500px] object-cover rounded-2xl"
                />
                
                {/* Floating achievement badge (safe inset to avoid clipping) */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="pointer-events-none absolute top-3 right-3 bg-gradient-to-br from-orange-500 to-amber-500 text-white px-3 py-2.5 rounded-xl shadow-2xl ring-1 ring-white/40"
                >
                  <div className="text-center leading-tight">
                    <Award className="w-6 h-6 mx-auto mb-0.5" />
                    <div className="text-base font-extrabold">Top</div>
                    <div className="text-[10px] font-semibold">Konsultan</div>
                  </div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-3xl blur-2xl -z-10" />
            </motion.div>

            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 text-orange-700 px-5 py-2.5 rounded-full text-base sm:text-lg font-bold shadow-lg">
                <Sparkles className="w-4 h-4" />
                <span className="uppercase tracking-wide">Program Konsultasi UMKM</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black text-slate-900 leading-tight">
                Konsultasi Profesional untuk{' '}
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Mengembangkan dan
                </span>{' '}
                <span className="text-blue-600">
                  Memajukan
                </span>{' '}
                Usaha Anda
              </h2>

              <div className="space-y-5 text-slate-600 leading-relaxed">
                <p className="text-xl lg:text-[1.35rem] xl:text-2xl">
                  Konsultasi bisnis merupakan langkah penting bagi pelaku UMKM yang ingin meningkatkan kualitas usaha, memperluas jangkauan pasar, dan memperkuat strategi bisnisnya.
                </p>
                <p className="text-xl lg:text-[1.35rem] xl:text-2xl">
                  Dengan <span className="font-bold text-orange-600">wawasan dan pengalaman tim kami</span>, Anda akan mendapatkan bimbingan, strategi, serta dukungan nyata untuk mengoptimalkan potensi bisnis mulai dari manajemen, pemasaran, hingga transformasi digital.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.a 
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-gradient-to-r from-orange-600 to-amber-600 text-white px-9 py-5 rounded-2xl font-bold text-lg xl:text-xl inline-flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/40"
                >
                  <Calendar className="w-5 h-5" />
                  Jadwalkan Konsultasi Anda
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </motion.a>
                
                <motion.a 
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="group text-orange-600 font-bold text-lg xl:text-xl inline-flex items-center justify-center gap-2 hover:gap-3 transition-all"
                >
                  Pelajari Program
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <TestimonialSection />

      <Footer />
    </div>
  );
};

export default KonsulPage;