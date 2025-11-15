"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronsRight, Sparkles, TrendingUp, Award } from "lucide-react";
import { Button } from "../../../components/ui/button";
import ShimmerButton from "../../../components/ui/shimmer-button";
import { cn } from "../../../lib/utils";
import HomeHeader from "../header/header.js";
import { LazyCircularGallery } from "../../../components/LazyFeature";
import NewItemsLoading from "./new-items-loading";
import WordAnimator from "./word-animator";

const Index = () => {
  // Dark mode disabled on landing page
  const [blocks, setBlocks] = useState<React.ReactNode[]>([]);

  const activeDivs = useMemo(
    () => ({
      0: new Set([4, 1]),
      2: new Set([3]),
      4: new Set([2, 5, 8]),
      5: new Set([4]),
      6: new Set([0]),
      7: new Set([1]),
      10: new Set([3]),
      12: new Set([7]),
      13: new Set([2, 4]),
      14: new Set([1, 5]),
      15: new Set([3, 6]),
    }),
    [],
  );

  useEffect(() => {
    const updateBlocks = () => {
      // Check if window is available (client-side only)
      if (typeof window === 'undefined') return;
      
      const { innerWidth, innerHeight } = window;
      const blockSize = innerWidth * 0.06;
      const amountOfBlocks = Math.ceil(innerHeight / blockSize);

      const newBlocks = Array.from({ length: 17 }, (_, columnIndex) => (
        <div key={columnIndex} className="w-[6vw] h-full">
          {Array.from({ length: amountOfBlocks }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className={`h-[6vw] w-full border-[1px] dark:border-[rgba(255,255,255,0.02)] border-gray-100 ${
                // @ts-ignore
                activeDivs[columnIndex]?.has(rowIndex)
                  ? "dark:bg-[rgba(255,255,255,0.04)] bg-gradient-to-br from-orange-50/40 to-purple-50/40"
                  : ""
              }`}
              style={{ height: `${blockSize}px` }}
            />
          ))}
        </div>
      ));
      setBlocks(newBlocks);
    };

    updateBlocks();
    window.addEventListener("resize", updateBlocks);
    return () => window.removeEventListener("resize", updateBlocks);
  }, [activeDivs]);

  // Move reveal logic to React to avoid DOM mutations before hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const els = Array.from(document.querySelectorAll('[data-hero-reveal]')) as HTMLElement[];
    if (!els.length) return;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const show = (el: HTMLElement) => {
      const d = el.getAttribute('data-delay') || '0s';
      el.style.transitionDelay = d;
      el.classList.add('show');
    };

    if (prefersReduced) {
      els.forEach((n) => n.classList.add('show'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            show(e.target as HTMLElement);
            io.unobserve(e.target as Element);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.15 }
    );
    els.forEach((n) => io.observe(n));

    return () => io.disconnect();
  }, []);

  const words = ["UMKM ", "Kuliner ", "Fashion ", "Kerajinan ", "Teknologi "];

  return (
    <div className="light">
      <HomeHeader localTheme={"light"} setLocalTheme={() => {}} />
      <section className="h-screen relative pb-20 bg-white overflow-x-clip overflow-y-visible">
        {/* Enhanced reveal styles */}
        <style>{`
          .hero-reveal{opacity:0;transform:translateY(24px) scale(.985);filter:blur(6px);transition:opacity .6s cubic-bezier(.22,.85,.3,1),transform .7s cubic-bezier(.22,.85,.3,1),filter .6s cubic-bezier(.22,.85,.3,1)}
          .hero-reveal.show{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}
          
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes float-subtle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }

          @keyframes pulse-glow {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 0.6; }
          }

          .gradient-shift { animation: gradient-shift 12s linear infinite; background-size: 200% 200%; }
          .float-subtle { animation: float-subtle 8s ease-in-out infinite; }
          .pulse-glow { animation: pulse-glow 6s ease-in-out infinite; }

          @media (prefers-reduced-motion: reduce) {
            .hero-reveal{transition:none !important;filter:none !important;transform:none !important;opacity:1 !important}
            .gradient-shift,.float-subtle,.pulse-glow{animation:none !important}
          }
        `}</style>

        {/* Enhanced grid pattern */}
        <div className="absolute inset-0 -z-0 h-screen w-full dark:bg-[radial-gradient(#2d2d2d_1px,transparent_1px)] bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 top-0 left-0 h-screen w-full items-center px-5 py-24 bg-[radial-gradient(ellipse_at_top,transparent_0%,white_60%)] dark:bg-[radial-gradient(ellipse_at_top,transparent_0%,#000000_60%)]" />
        
        {/* Enhanced gradient orbs */}
        <div className="pointer-events-none absolute inset-x-0 -top-20 h-[60vh] bg-[radial-gradient(1400px_480px_at_50%_0%,rgba(99,102,241,0.28),transparent_70%)] dark:bg-[radial-gradient(1400px_480px_at_50%_0%,rgba(99,102,241,0.2),transparent_70%)] blur-[0.5px] -z-0 pulse-glow" />
        
        {/* Additional gradient orbs for depth */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute top-1/4 right-0 w-[560px] h-[560px] bg-[radial-gradient(circle,rgba(255,122,26,0.12),transparent_70%)] blur-2xl pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-0 w-[480px] h-[480px] bg-[radial-gradient(circle,rgba(139,92,246,0.12),transparent_70%)] blur-2xl pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Enhanced side glow */}
        <div className="pointer-events-none absolute inset-0 flex w-screen justify-end [mask-image:radial-gradient(transparent_3%,white)]">
          <svg
            width="1512"
            height="1714"
            viewBox="0 0 1512 1714"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute left-0 top-0 h-auto w-full lg:w-1/2 opacity-60"
          >
            <g clipPath="url(#clip0_143_13)">
              <g filter="url(#filter0_f_143_13)">
                <path
                  d="M1045.18 982.551C1129.83 903.957 204.996 477.237 -235.529 294L-339.645 584.211C59.2367 752.376 960.521 1061.15 1045.18 982.551Z"
                  fill="url(#gradient1)"
                  fillOpacity="0.25"
                />
              </g>
            </g>
            <defs>
              <linearGradient id="gradient1" x1="-339.645" y1="294" x2="1045.18" y2="982.551">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <filter
                id="filter0_f_143_13"
                x="-595.645"
                y="38"
                width="1902.26"
                height="1213.13"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur_143_13" />
              </filter>
              <clipPath id="clip0_143_13">
                <rect width="1512" height="1714" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        <article className="grid 2xl:pt-52 2xl:pb-24 py-40 relative text-primary-foreground z-[2] sm:px-0 px-4">
          {/* Premium Update Badge */}
          <div data-hero-reveal data-delay=".02s" className="hero-reveal flex justify-center">
            <a
              href="#"
              className="group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] p-[1.5px] shadow-[0_8px_32px_rgba(99,102,241,.35)] hover:shadow-[0_12px_48px_rgba(99,102,241,.45)] transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2.5 rounded-full bg-white dark:bg-gray-900 px-3 py-2 text-xs sm:text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-2.5 py-1 text-[10px] sm:text-xs font-bold text-white shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  BARU
                </span>
                <span className="font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent tracking-tight">
                  Jelajahi UMKM Unggulan
                </span>
                <svg
                  className="h-4 w-4 text-[#6366f1] transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </a>
          </div>

          {/* Enhanced Hero Title */}
          <h1 data-hero-reveal data-delay=".04s" className="hero-reveal xl:text-7xl md:text-6xl sm:text-5xl text-4xl text-center font-black tracking-tight mt-6">
            <span className="block text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Mulai dari Lokal,
            </span>
            <span className="relative translate-x-0 flex gap-3 justify-center items-center flex-wrap px-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Temukan
              </span>
              <WordAnimator
                words={words}
                duration={5}
                className="italic w-fit px-4 py-2 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 bg-gradient-to-r from-orange-100 to-purple-100 dark:border-neutral-700 border-neutral-300 rounded-2xl shadow-lg"
              />
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                terbaik.
              </span>
            </span>
          </h1>

          {/* Enhanced Description */}
          <p data-hero-reveal data-delay=".08s" className="hero-reveal mx-auto lg:w-[820px] sm:w-[85%] text-center sm:text-xl text-base mt-8 text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            Ribuan pelaku UMKM di seluruh Indonesia. Jelajahi kategori, hubungi pemilik, dan dukung ekonomi lokal dengan lebih mudah.
          </p>

          {/* Enhanced CTA Buttons */}
          <div data-hero-reveal data-delay=".12s" className="hero-reveal flex gap-3 justify-center items-center mt-10 flex-wrap px-4">
            <ShimmerButton
              borderRadius={"16px"}
              className={cn(
                "flex items-center gap-2.5 w-fit rounded-2xl text-white border-none sm:px-8 px-6 py-3.5 shadow-[0_8px_32px_rgba(255,122,26,.35)] hover:shadow-[0_12px_48px_rgba(255,122,26,.45)] transition-all duration-300 hover:scale-[1.02]"
              )}
              background={"linear-gradient(135deg,#ff7a1a 0%,#ff6914 50%,#ff4d00 100%)"}
              onClick={() => window.location.href = '/login'}
            >
              <Sparkles className="h-5 w-5" />
              <span className="whitespace-pre-wrap text-center text-base font-bold leading-none tracking-tight text-white lg:text-lg">
                Daftarkan UMKM
              </span>
            </ShimmerButton>

            <Button 
              className="rounded-2xl px-6 h-14 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-100 dark:hover:to-white font-bold text-base shadow-[0_8px_32px_rgba(0,0,0,.15)] hover:shadow-[0_12px_48px_rgba(0,0,0,.2)] transition-all duration-300 hover:scale-[1.02] border-none"
              onClick={() => window.location.href = '/etalase'}
            >
              Jelajahi Etalase
              <ChevronsRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Enhanced Social Proof */}
          <div data-hero-reveal data-delay=".16s" className="hero-reveal flex flex-col items-center gap-4 mt-12">
            {/* Avatars */}
            <div className="relative">
              <div className="-space-x-4 flex">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="relative group">
                    <img 
                      src={`https://i.pravatar.cc/48?img=${i+20}`} 
                      alt="user" 
                      className="h-11 w-11 rounded-full ring-4 ring-white dark:ring-black object-cover shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:z-10" 
                      width={44}
                      height={44}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                ))}
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-500/20 to-purple-500/20 blur-2xl rounded-full" />
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3 flex-wrap justify-center">
              {/* Rating Card */}
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative flex items-center gap-2.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fbbf24" className="h-4 w-4">
                        <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l1.462 3.73a.563.563 0 0 0 .475.354l3.993.308c.499.039.701.663.322.988l-3.04 2.6a.563.563 0 0 0-.182.557l.91 3.868a.562.562 0 0 1-.84.61l-3.43-1.992a.563.563 0 0 0-.566 0l-3.43 1.992a.562.562 0 0 1-.84-.61l.91-3.868a.563.563 0 0 0-.182-.557l-3.04-2.6a.562.562 0 0 1 .322-.988l3.993-.308a.563.563 0 0 0 .475-.354l1.462-3.73Z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">5.0</span>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">1,000+ Pengguna</span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative flex items-center gap-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Verified Platform</span>
                </div>
              </div>

              {/* Growth Badge */}
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative flex items-center gap-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Fast Growing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Circular Gallery */}
          <div data-hero-reveal data-delay=".24s" className="hero-reveal relative z-[2] w-full -mt-62 sm:-mt-96 lg:-mt-96 2xl:-mt-92">
            {/* Decorative glow */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 bg-gradient-to-r from-orange-500/8 via-purple-500/8 to-blue-500/8 blur-2xl -z-10" />
            
            <div className="mx-auto w-full max-w-6xl xl:max-w-[126rem] 2xl:max-w-[140rem] px-4">
              <div className="h-72 md:h-96 lg:h-[28rem] xl:h-[32rem] 2xl:h-[38rem] float-subtle">
                <LazyCircularGallery />
              </div>
            </div>
          </div>
        </article>

        {/* Enhanced grid blocks (pushed behind to avoid gray overlay flash) */}
        <div className="flex h-screen overflow-hidden top-0 left-0 inset-0 -z-10 absolute pointer-events-none opacity-10">
          {blocks}
        </div>
      </section>

      {/* Intersection observer logic moved to React useEffect to prevent hydration mismatches */}
    </div>
  );
};

export default Index;