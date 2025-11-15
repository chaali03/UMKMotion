"use client";

import { cn } from "@/lib/utils";
import { signOutUser } from "@/lib/auth";
import { AlignJustify, X, Store, Building2, Users, Lightbulb, Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Drawer } from "vaul";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ==================== TYPES ====================
interface HomeHeaderProps {
  localTheme?: "light" | "dark";
  setLocalTheme?: (theme: "light" | "dark") => void;
}

interface User {
  displayName?: string | null;
  email?: string | null;
  nickname?: string;
  photoURL?: string | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

// ==================== CONSTANTS ====================
const NAV_ITEMS: NavItem[] = [
  {
    href: "/etalase",
    label: "Etalase",
    icon: Store,
    description: "Lihat produk UMKM",
  },
  {
    href: "",
    label: "Rumah UMKM",
    icon: Building2,
    description: "Informasi tentang UMKM",
  },
  {
    href: "/ConsultantPage",
    label: "Konsultasi",
    icon: Lightbulb,
    description: "Konsultan bisnis UMKM",
  },
];

const AVATAR_COLORS = [
  'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500',
  'bg-indigo-500', 'bg-teal-500', 'bg-red-500', 'bg-amber-500', 'bg-cyan-500',
];

// ==================== STYLES ====================
const NAVBAR_STYLES = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes pulse-border {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  @keyframes badge-bounce {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes badge-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }

  @keyframes icon-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }

  @keyframes badge-glow {
    0%, 100% { box-shadow: 0 0 8px rgba(255, 122, 26, 0.4), 0 2px 8px rgba(0, 0, 0, 0.15); }
    50% { box-shadow: 0 0 16px rgba(255, 122, 26, 0.6), 0 4px 12px rgba(0, 0, 0, 0.2); }
  }

  @keyframes badge-heart-glow {
    0%, 100% { box-shadow: 0 0 8px rgba(236, 72, 153, 0.4), 0 2px 8px rgba(0, 0, 0, 0.15); }
    50% { box-shadow: 0 0 16px rgba(236, 72, 153, 0.6), 0 4px 12px rgba(0, 0, 0, 0.2); }
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

  .badge-animate {
    animation: badge-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .badge-pulse {
    animation: badge-pulse 0.6s ease-in-out;
  }

  .icon-shake {
    animation: icon-shake 0.5s ease-in-out;
  }

  .cart-badge, .favorites-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 800;
    color: white;
    border: 2.5px solid white;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .cart-badge {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #ff6b35 100%);
  }

  .favorites-badge {
    background: linear-gradient(135deg, #ec4899 0%, #db2777 50%, #f472b6 100%);
  }

  .badge-animate.cart-badge {
    animation: badge-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55), badge-glow 2s ease-in-out infinite;
  }

  .badge-animate.favorites-badge {
    animation: badge-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55), badge-heart-glow 2s ease-in-out infinite;
  }

  /* Badge Large Numbers */
  .badge-large {
    min-width: 24px;
    height: 22px;
    font-size: 9.5px;
    padding: 0 7px;
    border-radius: 11px;
  }

  .badge-xlarge {
    min-width: 28px;
    height: 24px;
    font-size: 9px;
    padding: 0 8px;
    border-radius: 12px;
  }

  .map-fullscreen-active header {
    display: none !important;
  }
`;

// ==================== UTILITY FUNCTIONS ====================
const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U';
  
  const cleanName = name.trim();
  if (cleanName.length === 0) return 'U';
  
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) return 'U';
  if (words.length === 1) {
    return cleanName.substring(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name: string | null | undefined): string => {
  if (!name) return 'bg-orange-500';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// Format badge number dengan K notation
const formatBadgeNumber = (count: number): string => {
  if (count === 0) return '0';
  if (count < 100) return count.toString();
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}K`.replace('.0K', 'K');
  if (count < 100000) return `${Math.floor(count / 1000)}K`;
  if (count < 1000000) return `${Math.floor(count / 1000)}K`;
  return `${(count / 1000000).toFixed(1)}M`.replace('.0M', 'M');
};

// Get badge size class based on count
const getBadgeSizeClass = (count: number): string => {
  if (count >= 10000) return 'badge-xlarge';
  if (count >= 1000) return 'badge-large';
  return '';
};

// ==================== SUB COMPONENTS ====================
const Badge = ({ 
  count, 
  animate, 
  type 
}: { 
  count: number; 
  animate: boolean; 
  type: 'cart' | 'favorites' 
}) => {
  if (count === 0) return null;
  
  const formattedCount = formatBadgeNumber(count);
  const sizeClass = getBadgeSizeClass(count);
  
  return (
    <span 
      className={cn(
        `${type}-badge`,
        sizeClass,
        animate && 'badge-animate'
      )}
      title={count >= 1000 ? `${count.toLocaleString('id-ID')} item` : undefined}
    >
      {formattedCount}
    </span>
  );
};

const ProfileAvatar = ({ 
  user,
  onClick, 
  className = "" 
}: { 
  user: User | null;
  onClick?: () => void; 
  className?: string 
}) => {
  const getDisplayName = (): string => {
    if (!user) return 'User';
    
    if (user.nickname && user.nickname.trim()) {
      return user.nickname.trim();
    }
    if (user.displayName && user.displayName.trim()) {
      return user.displayName.trim();
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const displayName = getDisplayName();
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(displayName);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-11 h-11 rounded-full text-white font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105",
        avatarColor,
        className
      )}
    >
      {initials}
    </button>
  );
};

const LogoutConfirmModal = ({ 
  show, 
  onClose, 
  onConfirm 
}: { 
  show: boolean; 
  onClose: () => void; 
  onConfirm: () => void 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] sm:w-[420px] p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Logout</h3>
        <p className="text-sm text-gray-600 mb-5">Anda yakin ingin keluar dari akun ini?</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-11 px-5 rounded-xl font-semibold text-sm border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 transition-all hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="h-11 px-5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
};

const IconButton = ({ 
  href, 
  icon: Icon, 
  label, 
  count = 0, 
  animate = false, 
  badgeType, 
  id,
}: { 
  href: string; 
  icon: React.ElementType; 
  label: string; 
  count?: number; 
  animate?: boolean; 
  badgeType?: 'cart' | 'favorites'; 
  id?: string;
}) => (
  <a
    id={id}
    href={href}
    aria-label={`${label}${count > 0 ? ` (${count} item)` : ''}`}
    title={`${label}${count > 0 ? ` - ${count.toLocaleString('id-ID')} item` : ''}`}
    className="group relative h-11 w-11 grid place-content-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#ff7a1a] shadow-sm hover:shadow-md transition-all"
  >
    <Icon size={18} className={cn(
      "transition-transform duration-300 group-hover:scale-110",
      animate && "icon-shake"
    )} />
    {badgeType && <Badge count={count} animate={animate} type={badgeType} />}
  </a>
);

// ==================== CUSTOM HOOKS ====================
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const cachedNick = (typeof window !== 'undefined' && localStorage.getItem('user_nickname')) || '';
        if (cachedNick && (!user || user.nickname !== cachedNick)) {
          setUser({
            displayName: currentUser.displayName,
            email: currentUser.email,
            nickname: cachedNick,
            photoURL: currentUser.photoURL,
          });
        }

        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribeSnap = onSnapshot(userRef, {
          next: (snap) => {
            const data: any = snap.exists() ? snap.data() : {};

            const preferred = [
              data?.nickname,
              data?.nickName,
              data?.username,
              data?.userName,
              data?.fullName,
              data?.name,
              currentUser.displayName,
              currentUser.email ? currentUser.email.split('@')[0] : undefined,
            ].find((v) => typeof v === 'string' && v.trim().length > 0) as string | undefined;

            const nickname = (preferred || 'User').trim();

            try { localStorage.setItem('user_nickname', nickname); } catch {}

            setUser({
              displayName: currentUser.displayName,
              email: currentUser.email,
              nickname,
              photoURL: currentUser.photoURL,
            });
            setLoading(false);
          },
          error: async (err) => {
            console.error('onSnapshot user error:', err);
            try {
              const snapOnce = await getDoc(userRef);
              const dataOnce: any = snapOnce.exists() ? snapOnce.data() : {};
              const preferred = [
                dataOnce?.nickname,
                dataOnce?.nickName,
                dataOnce?.username,
                dataOnce?.userName,
                dataOnce?.fullName,
                dataOnce?.name,
                currentUser.displayName,
                currentUser.email ? currentUser.email.split('@')[0] : undefined,
              ].find((v) => typeof v === 'string' && v.trim().length > 0) as string | undefined;
              const nickname = (preferred || 'User').trim();
              try { localStorage.setItem('user_nickname', nickname); } catch {}
              setUser({
                displayName: currentUser.displayName,
                email: currentUser.email,
                nickname,
                photoURL: currentUser.photoURL,
              });
            } catch (e) {
              const fallbackNickname = currentUser.displayName?.trim() || currentUser.email?.split('@')[0] || 'User';
              setUser({
                displayName: currentUser.displayName,
                email: currentUser.email,
                nickname: fallbackNickname,
                photoURL: currentUser.photoURL,
              });
            } finally {
              setLoading(false);
            }
          }
        });

        return () => unsubscribeSnap();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, loading };
};

const useScrollPosition = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrolled;
};

const useCartAndFavorites = () => {
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [animateCart, setAnimateCart] = useState(false);
  const [animateFavorites, setAnimateFavorites] = useState(false);

  const aggregateFavoritesCount = () => {
    try {
      const favGeneric = JSON.parse(localStorage.getItem('favorites') || '[]');
      const favConsultants = JSON.parse(localStorage.getItem('consultantFavorites') || '[]');
      // Normalisasi favoriteType agar konsisten
      const normConsultants = favConsultants.map((c: any) => ({ ...c, favoriteType: c.favoriteType || 'consultant' }));
      const merged = [...favGeneric, ...normConsultants];
      // Dedup berdasarkan kombinasi favoriteType:id
      const unique = new Set<string>();
      for (const item of merged) {
        const type = item.favoriteType || 'unknown';
        const id = item.id ?? item.consultantId ?? item.productId ?? `${type}-${Math.random()}`;
        unique.add(`${type}:${String(id)}`);
      }
      return unique.size;
    } catch (error) {
      console.error('Error aggregating favorites:', error);
      return 0;
    }
  };

  const loadCounts = () => {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cartData.length);
      setFavoritesCount(aggregateFavoritesCount());
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  useEffect(() => {
    loadCounts();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        const newCount = JSON.parse(e.newValue || '[]').length;
        if (newCount !== cartCount) {
          setCartCount(newCount);
          setAnimateCart(true);
          setTimeout(() => setAnimateCart(false), 600);
        }
      } else if (e.key === 'favorites') {
        const newCount = JSON.parse(e.newValue || '[]').length;
        if (newCount !== favoritesCount) {
          setFavoritesCount(newCount);
          setAnimateFavorites(true);
          setTimeout(() => setAnimateFavorites(false), 600);
        }
      }
    };

    const handleCustomUpdate = (e: CustomEvent) => {
      if (e.detail.type === 'cart') {
        setCartCount(e.detail.count);
        setAnimateCart(true);
        setTimeout(() => setAnimateCart(false), 600);
      } else if (e.detail.type === 'favorites' || e.detail.type === 'consultant_favorites') {
        // Selalu hitung ulang aggregate agar konsisten lintas sumber favorit
        setFavoritesCount(aggregateFavoritesCount());
        setAnimateFavorites(true);
        setTimeout(() => setAnimateFavorites(false), 600);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCustomUpdate as EventListener);
    window.addEventListener('favoritesUpdated', handleCustomUpdate as EventListener);

    const interval = setInterval(loadCounts, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCustomUpdate as EventListener);
      window.removeEventListener('favoritesUpdated', handleCustomUpdate as EventListener);
      clearInterval(interval);
    };
  }, [cartCount, favoritesCount]);

  return { cartCount, favoritesCount, animateCart, animateFavorites };
};

// ==================== MOBILE DRAWER ====================
const MobileDrawer = ({ 
  isOpen, 
  setIsOpen, 
  pathname, 
  user,
  loading, 
  onLogout 
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  pathname: string;
  user: User | null;
  loading: boolean;
  onLogout: () => void;
}) => {
  const getDisplayName = (): string => {
    if (!user) return 'User';
    if (user.nickname && user.nickname.trim()) return user.nickname.trim();
    if (user.displayName && user.displayName.trim()) return user.displayName.trim();
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  const displayName = getDisplayName();
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(displayName);

  return (
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
            {/* Header */}
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

            {/* Navigation */}
            <nav className="flex-1 space-y-2 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
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

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800 space-y-2">
              <a
                href="/profile"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold", avatarColor)}>
                  {loading ? '...' : initials}
                </span>
                Profil Saya
              </a>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 transition-all duration-300"
              >
                Keluar
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

// ==================== DESKTOP NAV ====================
const DesktopNavigation = ({ pathname }: { pathname: string }) => (
  <nav className="flex justify-center">
    <ul className="flex items-center gap-2 font-medium bg-gray-100/80 dark:bg-neutral-900/80 p-1.5 rounded-2xl backdrop-blur-xl border border-gray-200 dark:border-neutral-800 shadow-lg">
      {NAV_ITEMS.map((item, i) => {
        const active = item.href
          ? (item.href === "/homepage" ? pathname === "/homepage" : pathname.startsWith(item.href))
          : false;
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
);

// ==================== PROFILE MENU ====================
const ProfileMenu = ({ 
  show, 
  menuTop, 
  menuPortalRef, 
  user,
  loading, 
  onClose, 
  onLogout 
}: {
  show: boolean;
  menuTop: number;
  menuPortalRef: React.RefObject<HTMLDivElement | null>;
  user: User | null;
  loading: boolean;
  onClose: () => void;
  onLogout: () => void;
}) => {
  const getDisplayName = (): string => {
    if (!user) return 'User';
    if (user.nickname && user.nickname.trim()) return user.nickname.trim();
    if (user.displayName && user.displayName.trim()) return user.displayName.trim();
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  const displayName = getDisplayName();
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(displayName);

  if (!show || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={menuPortalRef}
      className="fixed right-3 w-48 rounded-xl border border-gray-200 bg-white shadow-2xl p-1.5 z-[9999] pointer-events-auto overflow-visible"
      style={{
        top: `${menuTop}px`,
        transform: 'translateY(8px)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      tabIndex={-1}
    >
      <a
        href="/profile"
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors duration-200"
        onClick={onClose}
      >
        <span className={cn("w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-semibold", avatarColor)}>
          {loading ? '...' : initials}
        </span>
        <span>Profil Saya</span>
      </a>
      <div className="border-t border-gray-100 my-1"></div>
      <button
        onClick={() => { onClose(); onLogout(); }}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Keluar</span>
      </button>
    </div>,
    document.body
  );
};

// ==================== MAIN COMPONENT ====================
export default function NavbarHome({ localTheme, setLocalTheme }: HomeHeaderProps) {
  // States
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pathname, setPathname] = useState("/homepage");
  const [isMobile, setIsMobile] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [menuTop, setMenuTop] = useState<number>(64);

  // Refs
  const profileRef = useRef<HTMLDivElement | null>(null);
  const profileBtnRef = useRef<HTMLButtonElement | null>(null);
  const menuPortalRef = useRef<HTMLDivElement | null>(null);

  // Custom Hooks
  const { user, loading } = useAuth();
  const scrolled = useScrollPosition();
  const { cartCount, favoritesCount, animateCart, animateFavorites } = useCartAndFavorites();

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 40);
    setPathname(window.location.pathname);

    const checkMobile = () => setIsMobile(window.innerWidth <= 992);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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

  // Handlers
  const handleLogout = async () => {
    try {
      await signOutUser();
    } finally {
      try {
        document.cookie = 'auth=; Path=/; Max-Age=0';
      } catch {}
      window.location.href = "/";
    }
  };

  const animateClass = mounted
    ? "opacity-100 translate-y-0 scale-100"
    : "opacity-0 -translate-y-3 scale-95";

  return (
    <>
      <style>{NAVBAR_STYLES}</style>

      <header className="w-full top-0 left-0 right-0 z-50 fixed transition-all duration-500 overflow-visible">
        <div className={cn(
          "backdrop-blur-xl w-full transition-all duration-500 overflow-visible",
          scrolled
            ? "supports-[backdrop-filter]:bg-white/98 dark:supports-[backdrop-filter]:bg-black/95 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
            : "supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-black/60"
        )} style={{ position: 'sticky', top: 0, zIndex: 50 }}>
          <div className={cn(
            "flex w-full items-center relative justify-between h-20 px-6 py-4 transition-all duration-700 ease-[cubic-bezier(.22,.85,.3,1)] will-change-transform will-change-opacity overflow-visible",
            scrolled
              ? "border-b-2 border-gray-200/80 dark:border-neutral-800/80"
              : "border-b-2 border-gray-100/50 dark:border-neutral-900/50",
            animateClass
          )}>
            {/* Mobile Layout */}
            {isMobile && (
              <>
                <MobileDrawer
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  pathname={pathname}
                  user={user}
                  loading={loading}
                  onLogout={() => setShowConfirm(true)}
                />
                <nav className="flex items-center gap-2">
                  <IconButton
                    href="/favorites"
                    icon={Heart}
                    label="Favorit"
                    count={favoritesCount}
                    animate={animateFavorites}
                    badgeType="favorites"
                    id="nav-fav-btn-mobile"
                  />
                  <IconButton
                    href="/cart"
                    icon={ShoppingCart}
                    label="Keranjang"
                    count={cartCount}
                    animate={animateCart}
                    badgeType="cart"
                    id="nav-cart-btn-mobile"
                  />
                  <a href="/profile">
                    <ProfileAvatar user={user} />
                  </a>
                </nav>
              </>
            )}

            {/* Desktop Layout */}
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

                {/* Navigation */}
                <DesktopNavigation pathname={pathname} />

                {/* Actions */}
                <div className="flex items-center gap-2.5 justify-end">
                  <IconButton
                    href="/favorites"
                    icon={Heart}
                    label="Favorit"
                    count={favoritesCount}
                    animate={animateFavorites}
                    badgeType="favorites"
                    id="nav-fav-btn-desktop"
                  />
                  <IconButton
                    href="/cart"
                    icon={ShoppingCart}
                    label="Keranjang"
                    count={cartCount}
                    animate={animateCart}
                    badgeType="cart"
                    id="nav-cart-btn-desktop"
                  />
                  <div className="relative" ref={profileRef}>
                    <ProfileAvatar
                      user={user}
                      onClick={() => setShowProfileMenu((v) => !v)}
                      className="ring-2 ring-white cursor-pointer"
                    />
                    <ProfileMenu
                      show={showProfileMenu}
                      menuTop={menuTop}
                      menuPortalRef={menuPortalRef}
                      user={user}
                      loading={loading}
                      onClose={() => setShowProfileMenu(false)}
                      onLogout={() => setShowConfirm(true)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <LogoutConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}