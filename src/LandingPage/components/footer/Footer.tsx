"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { 
  ArrowUpRight, 
  ArrowUp, 
  Github, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Shield, 
  BookOpenText, 
  MapPin,
  Store,
  TrendingUp,
  Award,
  Send,
  Heart,
  Sparkles,
  CheckCircle2,
  Zap
} from "lucide-react";

const linkGroups = [
  {
    title: "Navigasi",
    icon: Store,
    links: [
      { label: "Beranda", href: "/", icon: Sparkles },
      { label: "Etalase", href: "/etalase", icon: Store },
      { label: "RumahUMKM", href: "/rumah-umkm", icon: MapPin },
      { label: "Konsultan", href: "/Konsultan", icon: BookOpenText },
    ],
  },
];

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub", color: "from-slate-600 to-slate-800", hoverColor: "group-hover:text-slate-700" },
  { icon: Twitter, href: "#", label: "Twitter", color: "from-blue-400 to-blue-600", hoverColor: "group-hover:text-blue-500" },
  { icon: Instagram, href: "#", label: "Instagram", color: "from-pink-500 to-purple-600", hoverColor: "group-hover:text-pink-500" },
  { icon: Youtube, href: "#", label: "YouTube", color: "from-red-500 to-red-700", hoverColor: "group-hover:text-red-500" },
];

export default function Footer() {
  const ref = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-150, 150]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  } as const;

  const item = {
    hidden: { y: 30, opacity: 0, filter: "blur(10px)" },
    show: { 
      y: 0, 
      opacity: 1, 
      filter: "blur(0px)", 
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.4, 0.25, 1]
      } 
    },
  } as const;

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <footer ref={containerRef} className="relative bg-white overflow-visible">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="absolute top-0 left-0 right-0 h-px origin-center bg-gradient-to-r from-transparent via-gray-300 to-transparent"
        />

        {/* Animated gradient orbs - Hidden on mobile untuk performance */}
        {!isMobile && (
          <>
            <motion.div 
              style={{ y: y1, rotate: rotate1, opacity }}
              className="absolute -top-64 -left-64 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-orange-400/15 via-amber-400/10 to-transparent blur-3xl"
            />
            <motion.div 
              style={{ y: y2, rotate: rotate2, opacity }}
              className="absolute -bottom-64 -right-64 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl"
            />
          </>
        )}
      </div>

      <div className="relative mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">

        {/* Main Footer Content */}
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-8 py-8 sm:py-12 md:py-16 lg:py-20"
        >
          {/* Brand Section */}
          <motion.div variants={item} className="space-y-5 sm:space-y-6 lg:col-span-5 xl:col-span-4 overflow-visible">
            {/* Logo */}
            <motion.div 
              whileHover={!isMobile ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center transition-transform duration-300 -ml-4 sm:ml-0"
            >
              <img 
                src="/LogoNavbar.png" 
                alt="UMKMotion logo" 
                className="h-8 sm:h-10 md:h-12 w-auto" 
                loading="lazy" 
              />
            </motion.div>

            <p className="max-w-md text-sm sm:text-base leading-relaxed text-slate-600">
              Platform direktori UMKM terlengkap di Indonesia. Temukan, jelajahi, dan dukung bisnis lokal dengan teknologi peta interaktif dan data terverifikasi.
            </p>

            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
                Subscribe untuk update terbaru
              </p>
              <form onSubmit={handleSubscribe} className="relative">
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 overflow-hidden rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white p-1.5 shadow-lg transition-all duration-300 focus-within:border-orange-400 focus-within:shadow-xl focus-within:shadow-orange-200/50">
                  <div className="flex items-center flex-1 min-w-0">
                    <Mail className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email kamu..."
                      className="flex-1 bg-transparent px-2 py-2 sm:py-2.5 text-sm sm:text-base text-slate-700 placeholder-slate-400 outline-none min-w-0"
                      required
                    />
                  </div>
                  <motion.button
                    whileHover={!isMobile ? { scale: 1.05 } : {}}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-orange-300/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-400/60"
                  >
                    {!isMobile && (
                      <motion.span 
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    <span className="relative flex items-center justify-center gap-1.5 sm:gap-2">
                      {isSubmitted ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Terkirim!</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Subscribe</span>
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              </form>
              {isSubmitted && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs sm:text-sm text-green-600 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Terima kasih! Cek email kamu untuk konfirmasi.
                </motion.p>
              )}
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-bold text-slate-700">Connect with us</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                    whileHover={!isMobile ? { scale: 1.15, rotate: 5, y: -3 } : {}}
                    whileTap={{ scale: 0.9 }}
                    className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-2.5 sm:p-3 shadow-md transition-all duration-300 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-200/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${social.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />
                    <social.icon className={`relative h-4 w-4 sm:h-5 sm:w-5 text-slate-500 transition-all duration-300 ${social.hoverColor}`} />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <div className="lg:col-span-7 xl:col-span-8 overflow-visible">
            <motion.div variants={item} className="space-y-4 sm:space-y-5 max-w-2xl mx-auto lg:mx-0 overflow-visible">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-orange-500/10 p-1.5 sm:p-2">
                  <Store className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <p className="text-sm sm:text-base md:text-lg font-bold text-slate-800">Navigasi</p>
              </div>
              <ul className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 overflow-visible">
                {linkGroups[0].links.map((link, linkIndex) => (
                  <motion.li 
                    key={link.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.3 + linkIndex * 0.1 }}
                    className="overflow-visible relative group"
                  >
                    <motion.a
                      href={link.href}
                      className="relative z-10 flex items-center justify-between rounded-lg sm:rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-xs sm:text-sm md:text-base font-medium text-slate-700 transition-all duration-500 overflow-visible"
                      whileHover={!isMobile ? { 
                        scale: 1.02,
                        y: -2,
                        borderColor: "#fdba74",
                        boxShadow: "0 20px 25px -5px rgba(249, 115, 22, 0.1), 0 10px 10px -5px rgba(249, 115, 22, 0.04)"
                      } : {}}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Hover Background Effect */}
                      <motion.div 
                        className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 opacity-0 z-0"
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      {/* Animated Border Glow */}
                      <motion.div 
                        className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 z-0"
                        whileHover={{ opacity: 0.1 }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      {/* Floating Particles Effect */}
                      {!isMobile && (
                        <>
                          <motion.div
                            className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full opacity-0 z-20"
                            whileHover={{ 
                              opacity: [0, 1, 0],
                              scale: [0, 1.5, 0],
                              transition: { duration: 0.8, times: [0, 0.5, 1] }
                            }}
                          />
                          <motion.div
                            className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-amber-400 rounded-full opacity-0 z-20"
                            whileHover={{ 
                              opacity: [0, 1, 0],
                              scale: [0, 1.8, 0],
                              transition: { duration: 0.8, delay: 0.2, times: [0, 0.5, 1] }
                            }}
                          />
                        </>
                      )}

                      <span className="relative z-10 inline-flex items-center gap-2">
                        <motion.div
                          whileHover={!isMobile ? { 
                            scale: 1.2,
                            rotate: [0, -10, 10, 0],
                            transition: { duration: 0.5 }
                          } : {}}
                        >
                          <link.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
                        </motion.div>
                        <motion.span
                          whileHover={!isMobile ? { 
                            background: "linear-gradient(45deg, #ea580c, #d97706)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                            transition: { duration: 0.3 }
                          } : {}}
                        >
                          {link.label}
                        </motion.span>
                      </span>
                      
                      <motion.div
                        className="relative z-10 flex items-center"
                        whileHover={!isMobile ? { 
                          x: 3,
                          y: -3,
                          transition: { type: "spring", stiffness: 400, damping: 10 }
                        } : {}}
                      >
                        <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 transition-all duration-300 group-hover:text-orange-600 flex-shrink-0" />
                      </motion.div>
                    </motion.a>

                    {/* Extended Hover Glow Effect */}
                    <motion.div 
                      className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-200 to-amber-200 blur-md opacity-0 -z-10"
                      whileHover={{ opacity: 0.3, scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                    />
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="relative h-px w-full my-8 sm:my-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="absolute inset-0 origin-center bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          />
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col items-start justify-between gap-4 sm:gap-6 py-6 sm:py-8 text-xs sm:text-sm md:flex-row md:items-center"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 md:gap-6">
            <p className="text-slate-600">
              © {new Date().getFullYear()} <span className="font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">UMKMotion</span>. Crafted with{" "}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block"
              >
                <Heart className="inline h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500 fill-red-500" />
              </motion.span>
              {" "}in Indonesia
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.a 
                href="/security"
                whileHover={!isMobile ? { scale: 1.1, y: -2 } : {}}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-1.5 text-slate-600 transition-colors hover:text-orange-600"
              >
                <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:scale-110" />
                <span>Security</span>
              </motion.a>
              <motion.a 
                href="/docs"
                whileHover={!isMobile ? { scale: 1.1, y: -2 } : {}}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-1.5 text-slate-600 transition-colors hover:text-blue-600"
              >
                <BookOpenText className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:scale-110" />
                <span>Docs</span>
              </motion.a>
            </div>
          </div>

          {/* Scroll to top button */}
          <motion.button
            onClick={scrollToTop}
            whileHover={!isMobile ? { scale: 1.05, y: -4 } : {}}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden inline-flex items-center gap-2 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-orange-50/30 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-bold text-slate-700 shadow-lg transition-all duration-300 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-200/50 w-full sm:w-auto justify-center"
          >
            {!isMobile && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-blue-500/0"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            )}
            <span className="relative">Back to top</span>
            <motion.div
              animate={!isMobile ? { y: [-2, 2, -2] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-orange-600" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      {/* Marquee Banner - Responsive */}
      <div className="relative select-none border-t-2 border-gray-200 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 py-10 sm:py-14 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
        {/* Gradient overlays - Adjusted for mobile */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-slate-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-l from-slate-950 to-transparent z-10" />
        
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            ease: "linear", 
            duration: isMobile ? 20 : 28, 
            repeat: Infinity, 
            repeatType: "loop" 
          }}
          className="flex whitespace-nowrap items-center will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          {[0, 1].map((loop) => (
            <div key={loop} className="flex items-center gap-6 sm:gap-10 md:gap-14 lg:gap-20 xl:gap-24 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20">
              <motion.span 
                className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 bg-clip-text text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[6vw] xl:text-[5vw] font-black leading-none text-transparent"
                animate={!isMobile ? { backgroundPosition: ['0%', '100%'] } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                UMKMOTION
              </motion.span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: isMobile ? 6 : 8, repeat: Infinity, ease: "linear" }}
                className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-xl sm:shadow-2xl shadow-orange-500/50 flex-shrink-0"
              />
              <motion.span 
                className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[6vw] xl:text-[5vw] font-black leading-none text-transparent"
                animate={!isMobile ? { backgroundPosition: ['100%', '0%'] } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                ✨ TEMUKAN UMKM ✨
              </motion.span>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: isMobile ? 6 : 8, repeat: Infinity, ease: "linear" }}
                className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-xl sm:shadow-2xl shadow-blue-500/50 flex-shrink-0"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </footer>
  );
}