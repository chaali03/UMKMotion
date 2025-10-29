"use client";

import { useMediaQuery } from "../../../hooks/use-media-query";
import ThemeSwitch from "../../../lib/theme-switch";
import { cn } from "../../../lib/utils";
import { AlignJustify, X, Home, Store, Building2, Users, Lightbulb, User, ShoppingCart, BookOpen, Info, LogIn, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>X</title>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

interface HomeHeaderProps {
  localTheme: "light" | "dark";
  setLocalTheme: (theme: "light" | "dark") => void;
}

export default function HomeHeader({ localTheme, setLocalTheme }: HomeHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
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
              <Drawer.Root direction="left" open={isOpen} onOpenChange={setIsOpen}>
                <Drawer.Trigger className="group relative px-3.5 text-white h-11 grid place-content-center bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] hover:from-[#ff8534] hover:to-[#ff6914] rounded-xl transition-all duration-300 shadow-[0_4px_16px_rgba(255,122,26,0.3)] hover:shadow-[0_6px_24px_rgba(255,122,26,0.4)] hover:scale-[1.02]">
                  <AlignJustify className="transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300" />
                  <Drawer.Content
                    className="left-3 top-3 bottom-3 fixed z-50 outline-none w-80 flex"
                    style={{ "--initial-transform": "calc(100% + 12px)" } as React.CSSProperties}
                  >
                    <div className="dark:bg-gradient-to-br dark:from-neutral-950 dark:to-neutral-900 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 dark:border-neutral-800 p-5 h-full w-full grow flex flex-col rounded-2xl shadow-2xl">
                      {/* Drawer Header */}
                      <div className="w-full flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-neutral-800">
                        <a href="/" className="flex items-center gap-2 pl-1 leading-none group">
                          <img
                            src="/LogoNavbar.png"
                            alt="UMKMotion"
                            className="block h-16 w-auto max-h-16 object-contain shrink-0 select-none transition-transform duration-300 group-hover:scale-105"
                            decoding="async"
                            loading="eager"
                          />
                        </a>
                        <button
                          className="rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-700 px-3.5 py-2.5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() => setIsOpen(false)}
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Navigation Items */}
                      <nav className="flex-1 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                          const active = item.href === pathname;
                          return (
                            <a
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "group cursor-pointer select-none p-4 rounded-xl transition-all duration-300 flex items-start gap-3 relative overflow-hidden",
                                active
                                  ? "bg-gradient-to-r from-[#ff7a1a]/10 to-[#ff4d00]/10 dark:from-[#ff7a1a]/20 dark:to-[#ff4d00]/20 border-2 border-[#ff7a1a]/30 shadow-lg"
                                  : "hover:bg-gray-100 dark:hover:bg-neutral-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-neutral-700"
                              )}
                            >
                              <div className={cn(
                                "p-2.5 rounded-lg transition-all duration-300",
                                active
                                  ? "bg-gradient-to-br from-[#ff7a1a] to-[#ff4d00] text-white shadow-lg"
                                  : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-neutral-700"
                              )}>
                                <item.icon size={20} />
                              </div>
                              <div className="flex-1">
                                <div className={cn(
                                  "font-semibold text-base mb-0.5",
                                  active ? "text-[#ff7a1a]" : "text-gray-900 dark:text-white"
                                )}>
                                  {item.label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.description}
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </nav>

                      {/* Drawer Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800 space-y-2">
                        <a
                          href="/login"
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        >
                          <LogIn size={18} />
                          Masuk
                        </a>
                      </div>
                    </div>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            )}

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center w-full gap-8">
                {/* Logo */}
                <div className="flex items-center gap-3 justify-start">
                  <a href="/" className="flex items-center gap-2 leading-none group">
                    <img
                      src="/LogoNavbar.png"
                      alt="UMKMotion"
                      className="block h-14 md:h-16 w-auto max-h-16 object-contain shrink-0 select-none transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg"
                      decoding="async"
                      loading="eager"
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
                    <a
                      href="https://twitter.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex h-11 border-2 border-gray-200 dark:border-neutral-800 px-3.5 rounded-xl items-center justify-center hover:border-gray-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white dark:bg-neutral-900"
                    >
                      <XIcon className="h-4 w-4 fill-zinc-950 dark:fill-white transition-transform duration-300 group-hover:scale-110" />
                    </a>
                    <ThemeSwitch
                      localTheme={localTheme}
                      setLocalTheme={setLocalTheme}
                      className="border-2 border-gray-200 dark:border-neutral-800 w-11 rounded-xl h-11 hover:border-gray-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white dark:bg-neutral-900"
                    />
                    <a
                      href="/login"
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
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 border-2 border-gray-200 dark:border-neutral-800 px-3 rounded-xl items-center justify-center hover:border-gray-300 dark:hover:border-neutral-700 transition-all duration-300 bg-white dark:bg-neutral-900"
                >
                  <XIcon className="h-4 w-4 fill-zinc-950 dark:fill-white" />
                </a>
                <ThemeSwitch
                  localTheme={localTheme}
                  setLocalTheme={setLocalTheme}
                  className="border-2 border-gray-200 dark:border-neutral-800 w-11 rounded-xl h-11 bg-white dark:bg-neutral-900"
                />
                <a
                  href="/login"
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