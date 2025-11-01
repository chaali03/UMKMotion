import React, { useEffect, useRef } from "react";
import Earth from "@/components/ui/globe";
import { Quote, Sparkles } from "lucide-react";
import AnimatedDots from "./animated-dots";

interface Testimonial {
  id: number;
  name: string;
  title: string;
  content: string;
  rating: number;
  image: string;
  company: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Budi Santoso",
    company: "Warung Makan Sederhana",
    title: "Pemilik UMKM Kuliner",
    content:
      "Konsultasi dengan tim UMKMotion benar-benar mengubah cara saya mengelola bisnis. Dari pembukuan yang berantakan, sekarang saya bisa memantau keuangan dengan jelas dan omzet meningkat 40% dalam 3 bulan!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    color: "orange",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    company: "Batik Nusantara",
    title: "Pengrajin Batik",
    content:
      "Berkat bimbingan digital marketing dari konsultan UMKMotion, produk batik saya sekarang dikenal hingga ke luar kota. Penjualan online meningkat drastis dan saya bisa mempekerjakan 5 karyawan baru.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
    color: "blue",
  },
  {
    id: 3,
    name: "Ahmad Fauzi",
    company: "Toko Elektronik Jaya",
    title: "Pemilik Toko Elektronik",
    content:
      "Strategi pemasaran yang diberikan sangat aplikatif. Dalam 2 bulan, toko saya sudah punya sistem inventori yang rapi dan customer database yang terorganisir. Profit naik 35%!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
    color: "orange",
  },
  {
    id: 4,
    name: "Dewi Lestari",
    company: "Kue Tradisional Ibu",
    title: "Pengusaha Kue Rumahan",
    content:
      "Awalnya saya ragu untuk ikut konsultasi, tapi ternyata sangat membantu! Sekarang saya punya brand identity yang kuat, packaging yang menarik, dan orderan membludak setiap hari.",
    rating: 4,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
    color: "orange",
  },
  {
    id: 5,
    name: "Rizki Pratama",
    company: "Konveksi Mandiri",
    title: "Pemilik Konveksi",
    content:
      "Tim konsultan membantu saya merestrukturisasi bisnis dari nol. Sekarang produksi lebih efisien, biaya operasional turun 25%, dan saya bisa ekspansi ke 3 kota besar.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
    color: "orange",
  },
  {
    id: 6,
    name: "Linda Wijaya",
    company: "Salon Cantik",
    title: "Pemilik Salon Kecantikan",
    content:
      "Konsultasi bisnis dari UMKMotion membuka mata saya tentang pentingnya customer experience. Sekarang pelanggan lebih loyal dan repeat order meningkat 60%.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
    color: "orange",
  },
];

const getColorClasses = (color: string) => {
  const colors = {
    orange: {
      badge: "bg-gradient-to-r from-orange-500 to-amber-500",
      quote: "fill-orange-500 text-orange-500",
      ring: "ring-orange-400",
      hover: "hover:border-orange-400 hover:shadow-orange-500/20",
    },
    blue: {
      badge: "bg-gradient-to-r from-blue-500 to-cyan-500",
      quote: "fill-blue-500 text-blue-500",
      ring: "ring-blue-400",
      hover: "hover:border-blue-400 hover:shadow-blue-500/20",
    },
  };
  return colors[color as keyof typeof colors] || colors.orange;
};

// Testimonial Card Component - NO CONTENT CUTTING
const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const colorClasses = getColorClasses(testimonial.color);

  return (
    <article
      className={`
        group relative
        bg-white/95 backdrop-blur-sm
        border-2 border-slate-200/80
        
        /* Responsive width dengan batasan maksimum */
        w-full
        max-w-[320px]
        sm:max-w-[340px]
        md:max-w-[360px]
        
        /* Height yang fleksibel berdasarkan konten */
        min-h-[380px]
        h-auto
        
        /* Layout */
        flex flex-col
        flex-shrink-0
        
        /* Padding yang cukup */
        p-4
        sm:p-5
        md:p-6
        
        /* Border radius */
        rounded-2xl
        md:rounded-3xl
        
        /* NO OVERFLOW - semua konten terlihat */
        overflow-visible
        
        /* Smooth transitions */
        transition-all duration-300 ease-out
        
        /* Hover effects yang aman */
        hover:shadow-xl
        hover:-translate-y-1
        hover:border-orange-300/50
        
        ${colorClasses.hover}
      `}
    >
      {/* Background effects - tetap dalam bounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl md:rounded-3xl z-0" />
      
      {/* Glow effect - tidak keluar dari card */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 ${colorClasses.badge} opacity-0 group-hover:opacity-5 rounded-full blur-xl transition-all duration-700 z-0`} />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Company Badge */}
        <div className="flex-shrink-0 mb-3 sm:mb-4">
          <div
            className={`
              ${colorClasses.badge}
              inline-flex items-center gap-2 
              px-3 py-2 
              sm:px-4 sm:py-2
              rounded-lg
              shadow-md
              group-hover:scale-105 
              transition-transform duration-300
              max-w-full
            `}
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white flex-shrink-0" />
            <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[160px]">
              {testimonial.company}
            </p>
          </div>
        </div>

        {/* Quote Section - Flexible height */}
        <div className="flex-1 flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Quote
            className={`
              ${colorClasses.quote}
              w-4 h-4
              sm:w-5 sm:h-5
              flex-shrink-0 
              mt-0.5
              rotate-180 
              opacity-30
              group-hover:opacity-50
              transition-opacity duration-300
            `}
          />
          <div className="flex-1">
            <p
              className={`
                text-slate-700 
                leading-relaxed
                
                /* Font size responsive */
                text-sm
                sm:text-[15px]
                
                /* Text wrapping yang baik */
                break-words
                hyphens-auto
                
                /* Tidak ada line clamp - semua teks terlihat */
                overflow-visible
                max-h-none
              `}
            >
              {testimonial.content}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex-shrink-0 h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-3 sm:mb-4" />

        {/* Author Section */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Avatar - tidak terpotong */}
          <div
            className={`
              relative 
              w-12 h-12
              sm:w-14 sm:h-14
              rounded-xl
              overflow-hidden 
              ring-2 
              ${colorClasses.ring} 
              flex-shrink-0
              shadow-md
              group-hover:scale-105
              transition-all duration-300
            `}
          >
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="object-cover w-full h-full"
              loading="lazy"
            />
            
            {/* Verified Badge - tepat di dalam avatar */}
            <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
              <svg 
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </div>

          {/* Name & Title */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="font-bold text-slate-900 text-sm sm:text-base truncate leading-tight">
              {testimonial.name}
            </p>
            <p className="text-slate-600 text-xs sm:text-sm truncate leading-tight">
              {testimonial.title}
            </p>
            
            {/* Mobile Rating */}
            <div className="flex sm:hidden items-center gap-1.5 mt-1">
              <div className="flex gap-0.5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${colorClasses.quote}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {testimonial.rating}.0
              </span>
            </div>
          </div>

          {/* Desktop Rating */}
          <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex gap-0.5">
              {[...Array(testimonial.rating)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 ${colorClasses.quote}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {testimonial.rating}.0
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

function TestimonialSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const elements = Array.from(root.querySelectorAll<HTMLElement>(".js-reveal"));
    elements.forEach((el) => el.classList.add("reveal-init"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add("reveal-show");
            el.classList.remove("reveal-init");
            io.unobserve(el);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-b from-white via-orange-50/30 to-white overflow-x-hidden">
      {/* Gradient Mask */}
      <div className="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_10%,#000_60%,transparent_100%)]" />
      
      {/* Header Section */}
      <div className="relative z-10 max-w-7xl mx-auto text-center px-4 sm:px-6 md:px-8 mb-12 sm:mb-16 md:mb-20">
        
        <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border-2 border-orange-200 bg-orange-50 text-orange-700 font-semibold text-xs sm:text-sm shadow-sm mb-6 js-reveal" style={{ ["--d" as any]: "0s" }}>
          <Sparkles className="w-4 h-4" />
          <span>TESTIMONI SUKSES</span>
        </div>

        {/* Title */}
        <h2 className="text-slate-900 font-black leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 px-4 js-reveal" style={{ ["--d" as any]: ".06s" }}>
          Cerita Sukses dari{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              Pelaku UMKM
            </span>
            <svg 
              className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3" 
              viewBox="0 0 300 12" 
              fill="none"
              preserveAspectRatio="none"
            >
              <path d="M2 10C80 2 220 2 298 10" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mx-auto max-w-3xl text-slate-600 text-base sm:text-lg md:text-xl leading-relaxed px-2 js-reveal" style={{ ["--d" as any]: ".12s" }}>
          Lebih dari{" "}
          <span className="font-extrabold text-transparent bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text">
            1000+ UMKM
          </span>{" "}
          telah merasakan transformasi bisnis nyata dari program konsultasi kami
        </p>
      </div>

      {/* Globe Background */}
      <div className="absolute top-36 sm:top-40 md:top-44 lg:top-48 left-1/2 -translate-x-1/2 pointer-events-none z-0 opacity-15 md:opacity-20">
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedDots />
        </div>
        <Earth 
          className="w-[240px] sm:w-[300px] md:w-[360px] lg:w-[420px]" 
          baseColor={[0.95, 0.6, 0.3]}
          glowColor={[1, 0.7, 0.4]}
          markerColor={[1, 0.5, 0.2]}
          dark={0}
        />
      </div>

      {/* Testimonial Grid */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 justify-items-center">
          {testimonials.map((testimonial, idx) => (
            <div key={`grid-${testimonial.id}`} className="js-reveal" style={{ ["--d" as any]: `${0.06 * (idx + 1) + 0.18}s` }}>
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-32 md:h-36 bg-gradient-to-t from-white via-white/90 to-transparent z-[15] pointer-events-none" />
      <style>{`
        .reveal-init {
          opacity: 0;
          transform: translateY(24px) scale(0.98);
          filter: blur(6px);
          will-change: transform, opacity, filter;
        }
        .reveal-show {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
          transition: opacity 600ms ease, transform 700ms cubic-bezier(.22,.85,.3,1), filter 600ms ease;
          transition-delay: var(--d, 0s);
        }
      `}</style>
    </section>
  );
}

export default TestimonialSection;