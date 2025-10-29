"use client";

import { useMediaQuery } from "../../../hooks/use-media-query";
import ThemeSwitch from "../../../lib/theme-switch";
import { cn } from "../../../lib/utils";
import { AlignJustify, X, Component, Layout, Wallet } from "lucide-react";
// Using plain anchors for Astro + React islands
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
    // This code only runs on the client side
    setMounted(true);
    setPathname(window.location.pathname);
    
    // Initialize isMobile based on window width
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    // Set initial value
    checkMobile();
    
    // Add resize listener
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
    
    // Initial check in case page is loaded with scroll position
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
    { href: "/etalase", label: "Etalase", icon: Component },
    { href: "/rumah-umkm", label: "Rumah UMKM", icon: Layout },
    { href: "/pricing", label: "Harga", icon: Wallet },
  ];
  return (
    <header className={cn(
      "w-full top-0 left-0 right-0 z-50 fixed text-primary-foreground transition-all duration-300",
      scrolled ? "shadow-md" : ""
    )}>
      <div className={cn(
        "backdrop-blur w-full transition-all duration-300",
        scrolled 
          ? "supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-black/90"
          : "supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-black/60"
      )} style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div className={cn(
          "flex w-full items-center relative justify-between h-16 px-4 py-2.5 border dark:border-neutral-800 border-neutral-200 rounded-b-xl",
          "transition-all duration-700 ease-[cubic-bezier(.22,.85,.3,1)] will-change-transform will-change-opacity",
          animateClass
        )}>
          {isMobile && (
            <Drawer.Root direction="left" open={isOpen} onOpenChange={setIsOpen}>
              <Drawer.Trigger className="px-3 text-white h-10 grid place-content-center bg-[#FC5D01] hover:bg-[#e05301] w-fit rounded-lg transition-colors">
                <AlignJustify />
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <Drawer.Content
                  className="left-2 top-2 bottom-2 fixed z-50 outline-none w-72 flex"
                  style={{ "--initial-transform": "calc(100% + 8px)" } as React.CSSProperties}
                >
                  <div className="dark:bg-black bg-white border border-neutral-200 dark:border-neutral-800 p-3 h-full w-full grow flex flex-col rounded-[16px]">
                    <div className="w-full flex justify-between mb-2">
                      <a href="/" className="flex items-center gap-2 pl-1 leading-none">
                        <img
                          src="/LogoNavbar.png"
                          alt="UMKMotion"
                          className="block h-6 md:h-7 w-auto max-h-7 object-contain shrink-0 select-none"
                          decoding="async"
                          loading="eager"
                        />
                      </a>
                      <button
                        className="rounded-md w-fit bg-neutral-950 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
                        onClick={() => setIsOpen(false)}
                      >
                        <X />
                      </button>
                    </div>
                    {navItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "cursor-pointer gap-2 select-none p-2 rounded-md transition-colors duration-200 flex items-center justify-start",
                          pathname.startsWith(item.href) &&
                            "text-[#FC5D01] border border-[#FC5D01]/20 dark:border-[#FC5D01]/40 bg-[#FC5D01]/5 dark:bg-neutral-900",
                        )}
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          )}

          {!isMobile && (
            <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center w-full">
              <div className="flex items-center gap-2 justify-start">
                <a href="/" className="flex items-center gap-2 leading-none">
                  <img
                    src="/LogoNavbar.png"
                    alt="UMKMotion"
                    className="block h-6 md:h-8 w-auto max-h-8 object-contain shrink-0 select-none"
                    decoding="async"
                    loading="eager"
                  />
                </a>
              </div>

              <nav className="flex justify-center">
                <ul className="flex items-center gap-3 font-medium">
                  {navItems.map((item, i) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        style={{ transitionDelay: `${120 + i * 60}ms` }}
                        className={cn(
                          "relative inline-flex items-center gap-1 px-3 py-2 rounded-md transition-colors duration-200",
                          "hover:text-[#FC5D01]",
                          "after:absolute after:left-2 after:right-2 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-[#FC5D01] after:scale-x-0 after:origin-left after:transition-transform hover:after:scale-x-100",
                          pathname.startsWith(item.href) &&
                            "text-[#FC5D01] after:scale-x-100",
                        )}
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="flex items-center gap-2 justify-end">
                <nav className="flex items-center gap-2">
                  <a
                    href="https://twitter.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 border dark:border-neutral-800 border-neutral-200 px-3 rounded-md items-center justify-center"
                  >
                    <XIcon className="h-4 w-4 fill-zinc-950 dark:fill-white" />
                  </a>
                  <ThemeSwitch
                    localTheme={localTheme}
                    setLocalTheme={setLocalTheme}
                    className="border w-10 rounded-md h-10 dark:border-neutral-800 border-neutral-200"
                  />
                  <a
                    href="/login"
                    className="bg-[#FC5D01] hover:bg-[#e05301] text-white h-10 items-center flex justify-center px-4 rounded-md shadow transition-colors"
                  >
                    Masuk
                  </a>
                </nav>
              </div>
            </div>
          )}

          {isMobile && (
            <nav className="flex items-center gap-2">
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 border dark:border-neutral-800 border-neutral-200 px-3 rounded-md items-center justify-center"
              >
                <XIcon className="h-4 w-4 fill-zinc-950 dark:fill-white" />
              </a>
              <ThemeSwitch
                localTheme={localTheme}
                setLocalTheme={setLocalTheme}
                className="border w-10 rounded-md h-10 dark:border-neutral-800 border-neutral-200"
              />
              <a
                href="/login"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white h-10 items-center flex justify-center px-4 rounded-md shadow"
              >
                Masuk
              </a>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
