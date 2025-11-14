"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { cn } from "../../../lib/utils";
import { AlignJustify, X, LogIn } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
};

export default function MobileDrawer({
  navItems,
  pathname,
}: {
  navItems: NavItem[];
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 992);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <Drawer.Root direction="left" open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger
        className="group relative px-3.5 text-white h-11 grid place-content-center bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] hover:from-[#ff8534] hover:to-[#ff6914] rounded-xl transition-all duration-300 shadow-[0_4px_16px_rgba(255,122,26,0.3)] hover:shadow-[0_6px_24px_rgba(255,122,26,0.4)] hover:scale-[1.02]"
        aria-label="Buka menu"
        aria-expanded={isOpen}
        aria-controls="mobile-drawer"
      >
        <AlignJustify className="transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300" />
        <Drawer.Content
          className="left-3 top-3 bottom-3 fixed z-50 outline-none w-80 flex"
          style={{ "--initial-transform": "calc(100% + 12px)" } as React.CSSProperties}
          id="mobile-drawer"
          aria-describedby="mobile-drawer-description"
        >
          <span className="sr-only">
            <Drawer.Title>Menu Navigasi</Drawer.Title>
            <Drawer.Description id="mobile-drawer-description">
              Menu navigasi utama untuk mengakses halaman-halaman website
            </Drawer.Description>
          </span>
          <div className="dark:bg-gradient-to-br dark:from-neutral-950 dark:to-neutral-900 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 dark:border-neutral-800 p-5 h-full w-full grow flex flex-col rounded-2xl shadow-2xl">
            <div className="w-full flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-neutral-800">
              <a href="/" data-astro-prefetch="false" className="flex items-center gap-2 pl-1 leading-none group">
                <img
                  src="/LogoNavbar.webp"
                  alt="UMKMotion"
                  className="block h-16 w-auto max-h-16 object-contain shrink-0 select-none transition-transform duration-300 group-hover:scale-105"
                  decoding="async"
                  loading="eager"
                  width="64"
                  height="64"
                />
              </a>
              <button
                className="rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-700 px-3.5 py-2.5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const active = item.href === pathname;
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    data-astro-prefetch="false"
                    className={cn(
                      "group cursor-pointer select-none p-4 rounded-xl transition-all duration-300 flex items-start gap-3 relative overflow-hidden",
                      active
                        ? "bg-gradient-to-r from-[#ff7a1a]/10 to-[#ff4d00]/10 dark:from-[#ff7a1a]/20 dark:to-[#ff4d00]/20 border-2 border-[#ff7a1a]/30 shadow-lg"
                        : "hover:bg-gray-100 dark:hover:bg-neutral-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-neutral-700"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2.5 rounded-lg transition-all duration-300",
                        active
                          ? "bg-gradient-to-br from-[#ff7a1a] to-[#ff4d00] text-white shadow-lg"
                          : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-neutral-700"
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className={cn("font-semibold text-base mb-0.5", active ? "text-[#ff7a1a]" : "text-gray-900 dark:text-white")}>{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                    </div>
                  </a>
                );
              })}
            </nav>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800 space-y-2">
              <a
                href="/login"
                data-astro-prefetch="false"
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
  );
}
