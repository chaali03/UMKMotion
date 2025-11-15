"use client";

import { cn } from "@/lib/utils";
import { signOutUser } from "@/lib/auth";
import { AlignJustify, X, Home, Store, Building2, Users, Lightbulb, Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Drawer } from "vaul";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface HomeHeaderProps {
  localTheme?: "light" | "dark";
  setLocalTheme?: (theme: "light" | "dark") => void;
}

export default function NavbarHome({ localTheme, setLocalTheme }: HomeHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pathname, setPathname] = useState("/homepage");
  const [user, setUser] = useState<{ displayName?: string | null; email?: string | null; nickname?: string; } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get user data from Firebase Auth and Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          setUser({
            displayName: currentUser.displayName,
            email: currentUser.email,
            nickname: userData.nickname || userData.fullName || currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic auth data if Firestore fails
          setUser({
            displayName: currentUser.displayName,
            email: currentUser.email,
            nickname: currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const userInitial = user?.nickname?.charAt(0).toUpperCase() || user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  const [isMobile, setIsMobile] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const profileBtnRef = useRef<HTMLButtonElement | null>(null);
  const [menuTop, setMenuTop] = useState<number>(64);
  const menuPortalRef = useRef<HTMLDivElement | null>(null);

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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideTrigger = profileRef.current?.contains(target);
      const clickedInsideMenu = menuPortalRef.current?.contains(target);
      if (!clickedInsideTrigger && !clickedInsideMenu) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Recompute menu position on open/resize/scroll
  useEffect(() => {
    if (!showProfileMenu) return;
    const update = () => {
      const btn = profileBtnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const top = Math.max(8, r.bottom + 8 + window.scrollY);
      setMenuTop(top);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [showProfileMenu]);

  const animateClass = mounted
    ? "opacity-100 translate-y-0 scale-100"
    : "opacity-0 -translate-y-3 scale-95";

  const navItems = [
    { 
      href: "/homepage", 
      label: "Homepage", 
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
      href: "/ConsultantPage", 
      label: "Konsultasi", 
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

        .map-fullscreen-active header {
          display: none !important;
        }
      `}</style>

      <header className={cn(
        "w-full top-0 left-0 right-0 z-50 fixed transition-all duration-500 overflow-visible",
      )}>
        <div className={cn(
          "backdrop-blur-xl w-full transition-all duration-500 overflow-visible",
          scrolled 
            ? "supports-[backdrop-filter]:bg-white/98 dark:supports-[backdrop-filter]:bg-black/95 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
            : "supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-black/60"
        )} style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div className={cn(
            "flex w-full items-center relative justify-between h-20 px-6 py-4 transition-all duration-700 ease-[cubic-bezier(.22,.85,.3,1)] will-change-transform will-change-opacity overflow-visible",
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
                        <a href="/homepage" className="flex items-center gap-2 pl-1 leading-none group">
                          <img
                            src="/LogoNavbar.webp"
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

                      {/* Drawer Footer - Profile Button */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800 space-y-2">
                        <a
                          href="/profile"
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        >
                          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                            {loading ? '...' : userInitial}
                          </span>
                          Profil Saya
                        </a>
                        <button
                          onClick={() => setShowConfirm(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 transition-all duration-300"
                        >
                          Keluar
                        </button>
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
                  <a href="/homepage" className="flex items-center gap-2 leading-none group">
                    <img
                      src="/LogoNavbar.webp"
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
                      const active = item.href === "/homepage" ? pathname === "/homepage" : pathname.startsWith(item.href);
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

                {/* Right Actions - Favorites, Cart, Profile */}
                <div className="flex items-center gap-2.5 justify-end">
                  {/* Favorite */}
                  <a
                    href="/favorites"
                    aria-label="Favorit"
                    title="Favorit"
                    className="group relative h-11 w-11 grid place-content-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#ff7a1a] shadow-sm hover:shadow-md transition-all"
                  >
                    <Heart size={18} className="transition-transform duration-300 group-hover:scale-110" />
                  </a>
                  {/* Cart */}
                  <a
                    href="/cart"
                    aria-label="Keranjang"
                    title="Keranjang"
                    className="group relative h-11 w-11 grid place-content-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#ff7a1a] shadow-sm hover:shadow-md transition-all"
                  >
                    <ShoppingCart size={18} className="transition-transform duration-300 group-hover:scale-110" />
                  </a>
                  <div className="relative" ref={profileRef}>
                    <button
                      ref={profileBtnRef}
                      onClick={() => setShowProfileMenu((v) => !v)}
                      className="w-11 h-11 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff4d00] text-white font-semibold flex items-center justify-center ring-2 ring-white shadow hover:shadow-md transition-all hover:scale-105"
                      aria-haspopup="menu"
                      aria-expanded={showProfileMenu}
                    >
                      {userInitial}
                    </button>
                    {showProfileMenu && typeof document !== 'undefined' && createPortal(
                      <div
                        ref={menuPortalRef}
                        className="fixed right-3 w-48 rounded-xl border border-gray-200 bg-white shadow-2xl p-1.5 z-[9999] pointer-events-auto overflow-visible"
                        style={{
                          top: `${menuTop}px`,
                          transform: 'translateY(8px)',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                        }}
                        onKeyDown={(e) => { if (e.key === 'Escape') setShowProfileMenu(false); }}
                        tabIndex={-1}
                      >
                        <a
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff4d00] text-white flex items-center justify-center text-xs font-semibold">
                            {loading ? '...' : userInitial}
                          </span>
                          <span>Profil Saya</span>
                        </a>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => { setShowProfileMenu(false); setShowConfirm(true); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          <span>Keluar</span>
                        </button>
                      </div>,
                      document.body
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Right Actions - Favorites, Cart, Profile */}
            {isMobile && (
              <nav className="flex items-center gap-2">
                <a
                  href="/favorites"
                  aria-label="Favorit"
                  title="Favorit"
                  className="h-11 w-11 grid place-content-center rounded-xl border border-gray-200 bg-white text-gray-700"
                >
                  <Heart size={18} />
                </a>
                <a
                  href="/cart"
                  aria-label="Keranjang"
                  title="Keranjang"
                  className="h-11 w-11 grid place-content-center rounded-xl border border-gray-200 bg-white text-gray-700"
                >
                  <ShoppingCart size={18} />
                </a>
                <a
                  href="/profile"
                  className="w-11 h-11 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff4d00] text-white font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  {userInitial}
                </a>
              </nav>
            )}
          </div>
        </div>
      </header>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] sm:w-[420px] p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Logout</h3>
            <p className="text-sm text-gray-600 mb-4">Anda yakin ingin keluar dari akun ini?</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="h-10 px-4 rounded-xl font-semibold text-sm border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 transition-all"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOutUser();
                  } finally {
                    try {
                      document.cookie = 'auth=; Path=/; Max-Age=0';
                    } catch {}
                    window.location.href = "/";
                  }
                }}
                className="h-10 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] text-white shadow-lg hover:shadow-xl transition-all"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
