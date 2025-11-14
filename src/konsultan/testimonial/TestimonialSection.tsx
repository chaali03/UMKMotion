import React, { useEffect, useRef } from "react";
import Earth from "@/components/ui/globe";
import { Quote, Sparkles } from "lucide-react";
import AnimatedDots from "./animated-dots";
import { motion } from "motion/react";
import { TestimonialsColumn } from "@/components/testimonials-columns-1";

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
    name: "Briana Patton",
    company: "",
    title: "Manajer Operasional",
    content:
      "ERP ini merevolusi operasional kami: keuangan dan inventaris jadi jauh lebih rapi. Platform berbasis cloud membuat tim tetap produktif, bahkan saat kerja jarak jauh.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    color: "orange",
  },
  {
    id: 2,
    name: "Bilal Ahmed",
    company: "",
    title: "Manajer TI",
    content:
      "Implementasi ERP berjalan mulus dan cepat. Antarmuka yang mudah dan bisa dikustom membuat pelatihan tim jadi ringan.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    color: "blue",
  },
  {
    id: 3,
    name: "Saman Malik",
    company: "",
    title: "Kepala Dukungan Pelanggan",
    content:
      "Tim support luar biasa: mendampingi dari setup hingga pendampingan berkelanjutan, membuat kami benar-benar puas.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    color: "orange",
  },
  {
    id: 4,
    name: "Omar Raza",
    company: "",
    title: "CEO",
    content:
      "Integrasi yang mulus dari ERP ini meningkatkan proses bisnis dan efisiensi kami. Sangat direkomendasikan berkat antarmukanya yang intuitif.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    color: "orange",
  },
  {
    id: 5,
    name: "Zainab Hussain",
    company: "",
    title: "Manajer Proyek",
    content:
      "Fiturnya yang kuat dan support yang sigap mengubah alur kerja kami—produktivitas meningkat signifikan.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    color: "orange",
  },
  {
    id: 6,
    name: "Aliza Khan",
    company: "",
    title: "Analis Bisnis",
    content:
      "Implementasi yang mulus melebihi ekspektasi. Proses jadi lebih ringkas dan performa bisnis meningkat.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    color: "orange",
  },
];

const testimonialsData = [
  {
    text:
      "ERP ini merevolusi operasional kami—keuangan dan inventaris jadi tertata. Karena berbasis cloud, tim tetap produktif meski remote.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Briana Patton",
    role: "Manajer Operasional",
  },
  {
    text:
      "Implementasinya cepat dan lancar. UI ramah pengguna dan bisa dikustom, pelatihan tim jadi jauh lebih mudah.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Bilal Ahmed",
    role: "Manajer TI",
  },
  {
    text:
      "Tim supportnya istimewa—mendampingi saat setup hingga pendampingan lanjutan. Kami sangat puas.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Saman Malik",
    role: "Kepala Dukungan Pelanggan",
  },
  {
    text:
      "Integrasinya mulus dan meningkatkan efisiensi operasional. Antarmuka intuitif—sangat direkomendasikan.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Omar Raza",
    role: "CEO",
  },
  {
    text:
      "Fitur yang kuat dan dukungan cepat membuat alur kerja kami jauh lebih efisien.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Zainab Hussain",
    role: "Manajer Proyek",
  },
  {
    text:
      "Implementasi mulus melampaui ekspektasi. Proses lebih ringkas, performa bisnis meningkat.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Aliza Khan",
    role: "Analis Bisnis",
  },
  {
    text:
      "Fungsi bisnis kami membaik berkat desain ramah pengguna dan feedback pelanggan yang positif.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Farhan Siddiqui",
    role: "Direktur Pemasaran",
  },
  {
    text:
      "Mereka menghadirkan solusi melampaui ekspektasi—memahami kebutuhan kami dan meningkatkan operasional.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Sana Sheikh",
    role: "Manajer Penjualan",
  },
  {
    text:
      "Dengan ERP ini, visibilitas online dan konversi meningkat signifikan—mendorong performa bisnis.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Hassan Ali",
    role: "Manajer E‑commerce",
  },
];

const firstColumn = testimonialsData.slice(0, 3);
const secondColumn = testimonialsData.slice(3, 6);
const thirdColumn = testimonialsData.slice(6, 9);

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
        shadow-md ring-1 ring-slate-100 hover:ring-2 hover:ring-orange-200
        
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
              {testimonial.company || "Pengguna UMKMotion"}
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
        <div className="flex-shrink-0 flex items-center gap-4 sm:gap-5 pl-2 sm:pl-3">
          {/* Avatar - tidak terpotong */}
          <div
            className={`
              relative 
              w-12 h-12 aspect-square
              sm:w-14 sm:h-14
              rounded-2xl
              overflow-hidden 
              flex-shrink-0
              border-0 ring-0 outline-none shadow-none bg-white
              transition-all duration-300
            `}
          >
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="block object-cover object-center w-full h-full rounded-2xl transition-transform duration-300 group-hover:scale-105 border-0 ring-0 outline-none"
              loading="lazy"
              decoding="async"
              width={56}
              height={56}
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
      <div className="absolute inset-0 z-0 [mask-image:radial-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]" />
      
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

      {/* Testimonial Columns (animated) */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-14">
        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn as any} duration={15} />
          <TestimonialsColumn testimonials={secondColumn as any} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn as any} className="hidden lg:block" duration={17} />
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