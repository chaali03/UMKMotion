"use client";

import { cn } from "../../../lib/utils";
import { AlignJustify, X, Home, Store, Building2, Lightbulb, LogIn, Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState, lazy, Suspense } from "react";

const MobileDrawer = lazy(() => import("./MobileDrawer"));

// Visually hidden component for accessibility
const VisuallyHidden = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLSpanElement>) => (
  <span 
    className="sr-only" 
    {...props}
  >
    {children}
  </span>
);

interface HomeHeaderProps {
  localTheme: "light" | "dark";
  setLocalTheme: (theme: "light" | "dark") => void;
}

export default function HomeHeader({ localTheme, setLocalTheme }: HomeHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pathname, setPathname] = useState("/");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPathname(window.location.pathname);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const animateClass = mounted
    ? "opacity-100 translate-y-0 scale-100"
    : "opacity-0 -translate-y-3 scale-95";

  const navItems = [
    { 
      href: "/", 
      label: "Beranda", 
      icon: Home,
      description: "Halaman utama UMKMotion"
    },
    { 
      href: "/etalase", 
      label: "Etalase", 
      icon: Store,
      description: "Lihat produk UMKM"
    },
    { 
      href: "/rumah-umkm", 
      label: "Rumah UMKM", 
      icon: Building2,
      description: "Informasi tentang UMKM"
    },
    { 
      href: "/Konsultan", 
      label: "Konsultan", 
      icon: Lightbulb,
      description: "Konsultasi bisnis UMKM"
    },
    { 
      href: "/checkout", 
      label: "Checkout", 
      icon: ShoppingCart,
      description: "Selesaikan pembelian Anda"
    }
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes pulse-border {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }

        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shimmer 3s infinite;
        }

        .nav-item-glow {
          position: relative;
        }

        .nav-item-glow::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, #ff7a1a, #ff4d00);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .nav-item-glow:hover::before {
          opacity: 0.6;
        }

        /* Hide header when map fullscreen is active */
        .map-fullscreen-active header {
          display: none !important;
        }
      `}</style>

      <header className={cn(
        "w-full top-0 left-0 right-0 z-50 fixed transition-all duration-500",
      )}>
        <div className={cn(
          "backdrop-blur-xl w-full transition-all duration-500",
          scrolled 
            ? "supports-[backdrop-filter]:bg-white/98 dark:supports-[backdrop-filter]:bg-black/95 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
            : "supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-black/60"
        )} style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div className={cn(
            "flex w-full items-center relative justify-between h-20 px-6 py-4 transition-all duration-700 ease-[cubic-bezier(.22,.85,.3,1)] will-change-transform will-change-opacity",
            scrolled 
              ? "border-b-2 border-gray-200/80 dark:border-neutral-800/80"
              : "border-b-2 border-gray-100/50 dark:border-neutral-900/50",
            animateClass
          )}>
            {/* Mobile: Hamburger Menu */}
            {isMobile && (
              <Suspense fallback={
                <button
                  className="group relative px-3.5 text-white h-11 grid place-content-center bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] rounded-xl"
                  aria-label="Buka menu"
                >
                  <AlignJustify />
                </button>
              }>
                <MobileDrawer navItems={navItems} pathname={pathname} />
              </Suspense>
            )}

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center w-full gap-8">
                {/* Logo */}
                <div className="flex items-center gap-3 justify-start">
                  <a href="/" data-astro-prefetch="false" className="flex items-center gap-2 leading-none group">
                    <img
                      src="/LogoNavbar.webp"
                      alt="UMKMotion"
                      className="block h-14 md:h-16 w-auto max-h-16 object-contain shrink-0 select-none transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg"
                      decoding="async"
                      loading="eager"
                      width="64"
                      height="64"
                    />
                  </a>
                </div>

                {/* Center Navigation */}
                <nav className="flex justify-center">
                  <ul className="flex items-center gap-2 font-medium bg-gray-100/80 dark:bg-neutral-900/80 p-1.5 rounded-2xl backdrop-blur-xl border border-gray-200 dark:border-neutral-800 shadow-lg">
                    {navItems.map((item, i) => {
                      const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                      return (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            data-astro-prefetch="false"
                            style={{ transitionDelay: `${120 + i * 60}ms` }}
                            className={cn(
                              "nav-item-glow relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold group",
                              active
                                ? "bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] text-white shadow-lg shadow-orange-500/30"
                                : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md"
                            )}
                          >
                            <item.icon 
                              size={18} 
                              className={cn(
                                "transition-all duration-300",
                                active ? "" : "group-hover:scale-110 group-hover:text-[#ff7a1a]"
                              )}
                            />
                            <span>{item.label}</span>
                            {active && (
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2.5 justify-end">
                  <nav className="flex items-center gap-2.5">
                    {/* Favorite */}
                    <a
                      href="/login"
                      data-astro-prefetch="false"
                      aria-label="Favorit"
                      title="Favorit"
                      className="group relative h-11 w-11 grid place-content-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#ff7a1a] shadow-sm hover:shadow-md transition-all"
                    >
                      <Heart size={18} className="transition-transform duration-300 group-hover:scale-110" />
                    </a>
                    {/* Cart */}
                    <a
                      href="/login"
                      data-astro-prefetch="false"
                      aria-label="Keranjang"
                      title="Keranjang"
                      className="group relative h-11 w-11 grid place-content-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#ff7a1a] shadow-sm hover:shadow-md transition-all"
                    >
                      <ShoppingCart size={18} className="transition-transform duration-300 group-hover:scale-110" />
                    </a>
                    <a
                      href="/login"
                      data-astro-prefetch="false"
                      className="shimmer-effect group relative bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] hover:from-[#ff8534] hover:to-[#ff6914] text-white h-11 items-center flex justify-center px-5 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 font-semibold text-sm gap-2 hover:scale-[1.02]"
                    >
                      <LogIn size={18} className="transition-transform duration-300 group-hover:scale-110" />
                      <span>Masuk</span>
                    </a>
                  </nav>
                </div>
              </div>
            )}

            {/* Mobile Right Actions */}
            {isMobile && (
              <nav className="flex items-center gap-2">
                <a
                  href="/login"
                  data-astro-prefetch="false"
                  aria-label="Favorit"
                  className="h-11 w-11 grid place-content-center rounded-xl border border-gray-200 bg-white text-gray-700"
                  title="Favorit"
                >
                  <Heart size={18} />
                </a>
                <a
                  href="/login"
                  data-astro-prefetch="false"
                  aria-label="Keranjang"
                  className="h-11 w-11 grid place-content-center rounded-xl border border-gray-200 bg-white text-gray-700"
                  title="Keranjang"
                >
                  <ShoppingCart size={18} />
                </a>
                <a
                  href="/login"
                  data-astro-prefetch="false"
                  className="bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] text-white h-11 items-center flex justify-center px-4 rounded-xl shadow-lg font-semibold text-sm"
                >
                  Masuk
                </a>
              </nav>
            )}
          </div>
        </div>
      </header>
    </>
  );
}