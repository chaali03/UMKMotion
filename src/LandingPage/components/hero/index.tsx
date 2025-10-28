"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronsRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import ShimmerButton from "../../../components/ui/shimmer-button";
import { cn } from "../../../lib/utils";
import HomeHeader from "../header/header.js";
import CircularGallery from "../../../components/CircularGallery.jsx";
import NewItemsLoading from "./new-items-loading";
import WordAnimator from "./word-animator";

const Index = () => {
  const [localTheme, setLocalTheme] = useState<"light" | "dark">("light");
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
      const { innerWidth, innerHeight } = window;
      const blockSize = innerWidth * 0.06;
      const amountOfBlocks = Math.ceil(innerHeight / blockSize);

      const newBlocks = Array.from({ length: 17 }, (_, columnIndex) => (
        <div key={columnIndex} className="w-[6vw] h-full">
          {Array.from({ length: amountOfBlocks }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className={`h-[6vw] w-full border-[1px] dark:border-[rgba(255,255,255,0.015)] border-gray-50 ${
                // @ts-ignore
                activeDivs[columnIndex]?.has(rowIndex)
                  ? "dark:bg-[rgba(255,255,255,0.03)] bg-gray-50"
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

  const words = ["UMKM ", "Kuliner ", "Fashion ", "Kerajinan ", "Teknologi "];

  return (
    <div className={localTheme === "dark" ? "dark" : "light"}>
      <HomeHeader localTheme={localTheme} setLocalTheme={setLocalTheme} />
      <section className="h-screen relative pb-20 dark:bg-black bg-white overflow-x-clip overflow-y-visible">
        {/* local reveal styles */}
        <style>{`
          .hero-reveal{opacity:0;transform:translateY(22px) scale(.985);filter:blur(6px);transition:opacity .55s ease,transform .65s cubic-bezier(.22,.85,.3,1),filter .55s ease}
          .hero-reveal.show{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}
        `}</style>
        <div className="absolute inset-0 -z-0 h-screen w-full dark:bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-0 top-0 left-0 h-screen w-full items-center px-5 py-24 bg-gradient-to-t dark:from-[#050505] from-white from-0% to-transparent to-60%" />
        {/* Blue hero top background glow */}
        <div className="pointer-events-none absolute inset-x-0 -top-10 h-[55vh] bg-[radial-gradient(1200px_380px_at_50%_0%,rgba(99,102,241,0.55),transparent_60%)] blur-[2px] -z-0" />

        <div className="pointer-events-none absolute inset-0 flex w-screen justify-end [mask-image:radial-gradient(transparent_5%,white)]">
          <svg
            width="1512"
            height="1714"
            viewBox="0 0 1512 1714"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute left-0 top-0 h-auto w-full lg:w-1/2"
          >
            <g clipPath="url(#clip0_143_13)">
              <g filter="url(#filter0_f_143_13)">
                <path
                  d="M1045.18 982.551C1129.83 903.957 204.996 477.237 -235.529 294L-339.645 584.211C59.2367 752.376 960.521 1061.15 1045.18 982.551Z"
                  fill="white"
                  fillOpacity="0.15"
                />
              </g>
            </g>
            <defs>
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
                <feGaussianBlur stdDeviation="64" result="effect1_foregroundBlur_143_13" />
              </filter>
              <clipPath id="clip0_143_13">
                <rect width="1512" height="1714" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        <article className="grid 2xl:pt-52 2xl:pb-24 py-40 relative text-primary-foreground z-[2] sm:px-0 px-4">
          {/* Search bar on top (above Update pill) */}
          <h1 data-hero-reveal data-delay=".04s" className="hero-reveal xl:text-7xl md:text-6xl sm:text-5xl text-3xl text-center font-semibold tracking-tight">
            <span className="text-[2.5rem]">Mulai dari Lokal,</span>{" "}
            <span className="relative translate-x-0 flex gap-2 justify-center">
              Temukan {" "}
              <WordAnimator
                words={words}
                duration={5}
                className="italic w-fit pr-3 dark:bg-gray-800 bg-gray-200 dark:border-neutral-800 border-neutral-200"
              />
              terbaik.
            </span>
          </h1>
          <p data-hero-reveal data-delay=".08s" className="hero-reveal mx-auto lg:w-[760px] sm:w-[80%] text-center sm:text-lg text-sm mt-5">
            Ribuan pelaku UMKM di seluruh Indonesia. Jelajahi kategori, hubungi pemilik, dan dukung ekonomi lokal.
          </p>

          <div data-hero-reveal data-delay=".12s" className="hero-reveal flex gap-2 justify-center items-center mt-6">
            <ShimmerButton
              borderRadius={"100px"}
              className={cn(
                "flex items-center gap-2 w-fit rounded-full text-white border sm:px-5 px-3 py-2",
              )}
              background={"linear-gradient(135deg,#ff7a1a,#ff4d00)"}
            >
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
                Daftarkan UMKM
              </span>
            </ShimmerButton>

            <Button className="rounded-full px-4 h-12 bg-neutral-900 text-white hover:bg-neutral-800">
              Jelajahi Etalase
              <ChevronsRight />
            </Button>
          </div>

          {/* Social proof: avatars + rating */}
          <div data-hero-reveal data-delay=".16s" className="hero-reveal flex flex-col items-center gap-2 mt-6">
            <div className="-space-x-3 flex">
              {[1,2,3,4,5].map((i) => (
                <img key={i} src={`https://i.pravatar.cc/40?img=${i+20}`} alt="user" className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-black object-cover" />
              ))}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-2 bg-white/80 dark:bg-neutral-900/70 px-2 py-1 rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fbbf24" className="h-4 w-4"><path d="M11.48 3.499a.562.562 0 0 1 1.04 0l1.462 3.73a.563.563 0 0 0 .475.354l3.993.308c.499.039.701.663.322.988l-3.04 2.6a.563.563 0 0 0-.182.557l.91 3.868a.562.562 0 0 1-.84.61l-3.43-1.992a.563.563 0 0 0-.566 0l-3.43 1.992a.562.562 0 0 1-.84-.61l.91-3.868a.563.563 0 0 0-.182-.557l-3.04-2.6a.562.562 0 0 1 .322-.988l3.993-.308a.563.563 0 0 0 .475-.354l1.462-3.73Z"/></svg>
              <span>Trusted by 1000+ users</span>
            </div>
          </div>
          {/* Circular Gallery inside article to avoid section clipping */}
          <div data-hero-reveal data-delay=".24s" className="hero-reveal relative z-[2] w-full -mt-14">
            <div className="mx-auto w-full max-w-6xl px-4">
              <div className="h-56 md:h-64 lg:h-72">
                <CircularGallery
                  className="h-full w-full"
                  items={[
                    { image: "/asset/umkm/umkm1.png", text: "UMKM 1" },
                    { image: "/asset/umkm/umkm2.jpg", text: "UMKM 2" },
                    { image: "/asset/umkm/umkm3.jpeg", text: "UMKM 3" },
                    { image: "/asset/umkm/umkm4.jpeg", text: "UMKM 4" },
                    { image: "/asset/umkm/umkm5.jpg", text: "UMKM 5" },
                    { image: "/asset/umkm/umkm6.jpg", text: "UMKM 6" },
                  ]}
                />
              </div>
            </div>
          </div>
        </article>

        <div className="flex h-screen overflow-hidden top-0 left-0 inset-0 z-0 absolute pointer-events-none">
          {blocks}
        </div>
      </section>
      {/* simple intersection-observer to toggle .show */}
      <script dangerouslySetInnerHTML={{__html:`
        (function(){
          var els = Array.prototype.slice.call(document.querySelectorAll('[data-hero-reveal]'));
          if(!els.length) return;
          var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          function show(el){
            var d = el.getAttribute('data-delay') || '0s';
            el.style.transitionDelay = d;
            el.classList.add('show');
          }
          if(prefersReduced){ els.forEach(function(n){ n.classList.add('show'); }); return; }
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(e){ if(e.isIntersecting){ show(e.target); io.unobserve(e.target); } });
          }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
          els.forEach(function(n){ io.observe(n); });
        })();
      `}}/>
    </div>
  );
};

export default Index;
