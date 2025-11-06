"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

type SheetContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const SheetContext = React.createContext<SheetContextType | null>(null);

export function Sheet({ open, onOpenChange, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const ctx = React.useMemo<SheetContextType>(() => ({ open, setOpen: onOpenChange }), [open, onOpenChange]);
  return (
    <SheetContext.Provider value={ctx}>{children}</SheetContext.Provider>
  );
}

export function SheetTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const ctx = React.useContext(SheetContext)!;
  const child = React.isValidElement(children) ? children : <button>{children}</button>;
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: (e: any) => {
        (children as any).props?.onClick?.(e);
        ctx.setOpen(true);
      }
    });
  }
  return React.cloneElement(child as any, {
    onClick: (e: any) => {
      (child as any).props?.onClick?.(e);
      ctx.setOpen(true);
    }
  });
}

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [el] = React.useState(() => document.createElement("div"));
  React.useEffect(() => {
    setMounted(true);
    document.body.appendChild(el);
    return () => {
      document.body.removeChild(el);
    };
  }, [el]);
  if (!mounted) return null;
  return createPortal(children, el);
}

export function SheetContent({ side = "left", className = "", children }: {
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(SheetContext)!;

  const variants: Record<string, any> = {
    left: {
      initial: { x: -24, opacity: 0, scale: 0.98 },
      animate: { x: 0, opacity: 1, scale: 1 },
      exit: { x: -24, opacity: 0, scale: 0.98 }
    },
    right: {
      initial: { x: 24, opacity: 0, scale: 0.98 },
      animate: { x: 0, opacity: 1, scale: 1 },
      exit: { x: 24, opacity: 0, scale: 0.98 }
    },
    top: {
      initial: { y: -20, opacity: 0, scale: 0.98 },
      animate: { y: 0, opacity: 1, scale: 1 },
      exit: { y: -20, opacity: 0, scale: 0.98 }
    },
    bottom: {
      initial: { y: 20, opacity: 0, scale: 0.98 },
      animate: { y: 0, opacity: 1, scale: 1 },
      exit: { y: 20, opacity: 0, scale: 0.98 }
    },
  };

  const transition = { duration: 0.28 };
  const overlayTransition = { duration: 0.25 };

  return (
    <Portal>
      <AnimatePresence>
        {ctx.open && (
          <>
            <motion.div
              key="sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
              onClick={() => ctx.setOpen(false)}
              className="fixed inset-0 z-[100] bg-black/50"
            />
            <motion.div
              key="sheet-content"
              initial={variants[side].initial}
              animate={variants[side].animate}
              exit={variants[side].exit}
              transition={transition}
              drag={side === "left" || side === "right" ? "x" : side === "top" || side === "bottom" ? "y" : false}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (side === "left" && (info.offset.x < -120 || info.velocity.x < -300)) ctx.setOpen(false);
                if (side === "right" && (info.offset.x > 120 || info.velocity.x > 300)) ctx.setOpen(false);
                if (side === "top" && (info.offset.y < -120 || info.velocity.y < -300)) ctx.setOpen(false);
                if (side === "bottom" && (info.offset.y > 120 || info.velocity.y > 300)) ctx.setOpen(false);
              }}
              className={
                "fixed z-[110] bg-white/95 backdrop-blur-sm shadow-2xl will-change-transform " +
                (side === "left" ? "left-0 top-0 bottom-0" : "") +
                (side === "right" ? "right-0 top-0 bottom-0" : "") +
                (side === "top" ? "top-0 left-0 right-0" : "") +
                (side === "bottom" ? "bottom-0 left-0 right-0" : "") +
                " " + className
              }
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}

export function SheetHeader({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={"px-4 py-3 border-b " + className}>{children}</div>;
}

export function SheetTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={"text-lg font-semibold " + className}>{children}</h2>;
}

export function SheetDescription({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <p className={"text-sm text-gray-500 " + className}>{children}</p>;
}

export function SheetClose({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const ctx = React.useContext(SheetContext)!;
  const child = React.isValidElement(children) ? children : <button>{children}</button>;
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: (e: any) => {
        (children as any).props?.onClick?.(e);
        ctx.setOpen(false);
      }
    });
  }
  return React.cloneElement(child as any, {
    onClick: (e: any) => {
      (child as any).props?.onClick?.(e);
      ctx.setOpen(false);
    }
  });
}
