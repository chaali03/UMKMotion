import { cn } from "@/lib/utils";

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  duration?: string | number; // CSS time or ms number
  gap?: string; // any CSS length
  fade?: boolean; // edge fade masks
  fadeClassName?: string; // custom mask styles
  innerClassName?: string; // class for each animated group
  stop?: boolean; // force pause
  [key: string]: any;
}

export default function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  pauseOnFocus = false,
  children,
  vertical = false,
  repeat = 4,
  duration = "40s",
  gap = "1rem",
  fade = false,
  fadeClassName,
  innerClassName,
  stop = false,
  ...props
}: MarqueeProps) {
  // Expose CSS vars so parent can override via props easily
  const styleVars: React.CSSProperties = {
    ...(props.style as React.CSSProperties),
    ["--duration" as any]: typeof duration === "number" ? `${duration}ms` : duration,
    ["--gap" as any]: gap,
  };

  return (
    <div
      {...props}
      style={styleVars}
      className={cn(
        "group relative flex overflow-hidden p-2 [gap:var(--gap)]",
        !vertical ? "flex-row" : "flex-col",
        // Optional edge fade masks
        fade &&
          "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-10 before:bg-gradient-to-r before:from-white before:to-transparent before:z-10 after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-10 after:bg-gradient-to-l after:from-white after:to-transparent after:z-10",
        fade && fadeClassName,
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i !== 0}
            className={cn(
              "flex shrink-0 justify-around items-center [gap:var(--gap)]",
              !vertical ? "animate-marquee flex-row" : "animate-marquee-vertical flex-col",
              // Pause behaviors
              pauseOnHover && "group-hover:[animation-play-state:paused]",
              pauseOnFocus && "group-focus-within:[animation-play-state:paused]",
              stop && "[animation-play-state:paused]",
              // Direction
              reverse && "[animation-direction:reverse]",
              // Respect motion preferences
              "motion-reduce:animate-none",
              innerClassName
            )}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
