"use client";
import React, { useEffect } from "react";

const words = [
  "kuliner.",
  "fashion.",
  "kerajinan.",
  "jasa.",
  "berkembang.",
  "berinovasi.",
  "berkolaborasi.",
  "berdagang.",
  "memasak.",
  "menjahit.",
  "membuat.",
  "melayani.",
  "menginspirasi.",
  "mengajar.",
  "memproduksi.",
  "memasarkan.",
  "bertumbuh.",
  "berjualan.",
  "sukses.",
  "maju bersama.",
];

export default function Scroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const list = document.querySelector('.content ul');
    if (!list) return;
    const items = Array.from(list.querySelectorAll('li')) as HTMLElement[];
    const container = document.querySelector('.content') as HTMLElement | null;
    const titleEl = document.querySelector('.content h2') as HTMLElement | null;
    const header = document.querySelector('.scroll-header') as HTMLElement | null;
    const line1 = document.querySelector('.scroll-header .title-line-1') as HTMLElement | null;
    const line2 = document.querySelector('.scroll-header .title-line-2') as HTMLElement | null;

    const centerY = () => window.innerHeight / 2;
    const isSmallScreen = () => window.innerWidth <= 1024;
    let lastMove = 0; // smooth sticky title movement
    let ticking = false;
    // Reveal-on-enter for list items (one-time)
    try {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
      items.forEach((el) => io.observe(el));
    } catch {}

    const update = () => {
      if (container && items.length) {
        const desired = Math.max(window.innerHeight * 1.2, items.length * (window.innerHeight * 0.12));
        const current = parseFloat(getComputedStyle(container).minHeight || '0');
        if (!current || current < desired) container.style.minHeight = `${desired}px`;
      }
      const c = centerY();
      let bestIdx = 0;
      let bestDist = Infinity;
      items.forEach((li, i) => {
        const r = li.getBoundingClientRect();
        const m = r.top + r.height / 2;
        const d = Math.abs(m - c);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      const lastIndex = items.length - 1;
      const activeIndex = Math.min(bestIdx, lastIndex);
      // Smoothly highlight items based on distance from center
      const normBase = Math.max(160, window.innerHeight * (isSmallScreen() ? 0.28 : 0.36)); // slightly tighter to light more items
      items.forEach((li, idx) => {
        const r = li.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const d = Math.abs(mid - c);
        const n = Math.min(d / normBase, 1); // 0..1
        const w = 1 - n; // weight closer to center
        const opacity = 0.40 + 0.60 * w; // 0.40..1 — neighbors remain readable
        const scale = 0.988 + 0.042 * w; // 0.988..1.03
        const y = -8 * w; // subtle lift
        const bright = 1 + 0.12 * w;
        const blur = 2 * (1 - w); // very small blur off-center
        li.style.opacity = opacity.toString();
        li.style.filter = `brightness(${bright.toFixed(2)}) blur(${blur.toFixed(2)}px)`; // tiny blur off-center
        li.style.transform = `translateY(${y}px) scale(${scale})`;
        li.style.transition = 'transform 200ms cubic-bezier(.22,.85,.3,1), opacity 200ms linear, filter 200ms linear, text-shadow 200ms linear';
        li.style.willChange = 'transform, opacity, filter';
        // Active class toggle handled after loop
      });
      // Mark active item for richer styling
      items.forEach((li, i) => li.classList.toggle('is-active', i === activeIndex));
      // No dynamic word after 'Anda bisa' — left title remains static.
      if (titleEl && items[activeIndex]) {
        const ar = items[activeIndex].getBoundingClientRect();
        const aMid = ar.top + ar.height / 2;
        const delta = (aMid - c);
        const maxMove = 28;
        // When last item ('maju bersama.') is active, freeze the title position
        const targetMove = (activeIndex === lastIndex)
          ? 0
          : Math.max(-maxMove, Math.min(maxMove, -delta * 0.15));
        // ease toward target to avoid jitter
        lastMove = lastMove + (targetMove - lastMove) * 0.18;
        titleEl.style.transform = `translateY(${lastMove}px)`;
        titleEl.style.transition = 'transform 180ms cubic-bezier(.22,.85,.3,1)';
      }
      ticking = false;
    };
    // heading scroll animation (both directions)
    const animateHeading = () => {
      if (!header || !line1 || !line2) return;
      const vh = window.innerHeight;
      const r = header.getBoundingClientRect();
      // visible progress across the header area
      const enter = Math.min(1, Math.max(0, 1 - r.top / vh)); // 0..1 as it enters
      const through = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))); // 0..1 while passing
      // line1: appear early
      const o1 = Math.min(1, Math.max(0, enter * 1.2));
      const y1 = 40 * (1 - o1);
      line1.style.opacity = String(o1);
      line1.style.transform = `translateY(${y1}px)`;
      line1.style.filter = `blur(${8 * (1 - o1)}px)`;
      // line2: slight delay, also parallax upward when scrolling past center
      const o2 = Math.min(1, Math.max(0, (enter - 0.08) * 1.25));
      const y2 = 60 * (1 - o2) - Math.min(24, Math.max(-24, (vh / 2 - (r.top + r.height * 0.4)) * 0.05));
      line2.style.opacity = String(o2);
      line2.style.transform = `translateY(${y2}px)`;
      line2.style.filter = `blur(${10 * (1 - o2)}px)`;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { update(); animateHeading(); });
      }
    };
    update();
    animateHeading();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section className="scroll-text-section">
      <style>{`
      .scroll-text-section{width:100%;background:transparent}
      .scroll-text-section,.scroll-main,.content{max-width:100%;box-sizing:border-box;overflow-x:clip;contain:layout inline-size}
      
      /* Hide on mobile and tablet */
      @media (max-width: 1024px) {
        .scroll-text-section {
          display: none;
        }
      }
      .scroll-header{min-height:110vh;display:flex;align-items:flex-start;justify-content:flex-start;width:100%;padding-left:clamp(16px,6vw,72px);padding-top:clamp(40px,10vh,120px);padding-right:clamp(12px,4vw,40px);margin:0 auto;text-align:left;background-image:linear-gradient(to bottom, rgba(30,64,175,0.85), rgba(59,130,246,0.25) 55%, transparent),
        linear-gradient(to right, rgba(59,130,246,0.10) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(59,130,246,0.10) 1px, transparent 1px);
      background-size:auto, 48px 48px, 48px 48px;
      background-position:center top, center top, center top}
      .scroll-header h1{text-wrap:pretty;line-height:0.9;margin:0;font-weight:900;color:#eaf2ff;font-size:clamp(3rem,12vw,14rem);position:relative}
      .scroll-header .line{display:inline-block; will-change: transform, opacity, filter; transition: transform .24s cubic-bezier(.22,.85,.3,1), opacity .24s ease, filter .24s ease}
      @keyframes fadeInUp{from{opacity:0;transform:translateY(clamp(30px,8vh,50px))}to{opacity:1;transform:translateY(0)}}
      .scroll-main{width:100%;margin-top:clamp(3rem,12vh,18vh)}
      .content{display:flex;line-height:clamp(1.1,1.25,1.4);width:100%;padding-inline:clamp(12px,4vw,28px);min-height:200vh;gap:clamp(.5rem,2vw,1.5rem);max-width:min(1800px,96vw);margin:0 auto;justify-content:center;align-items:flex-start}
      .content h2{position:sticky;top:calc(50% - 0.5lh);font-size:clamp(1.8rem,6vw + .8rem,7rem);margin:0;display:inline-block;height:fit-content;font-weight:700;color:#0f172a;flex-shrink:0;text-align:right;min-width:clamp(110px,16vw,320px);padding-right:clamp(8px,1vw,16px);max-width:100%;margin-inline:auto;overflow:visible;box-sizing:border-box;padding-inline:clamp(8px,3.5vw,22px);word-break:break-word;text-wrap:balance}
      .content ul{--step:calc((var(--end,280)-var(--start,0))/(var(--count)-1));font-weight:700;padding-inline:0;margin:0;list-style-type:none;font-size:clamp(2rem,7.5vw + 1rem,8rem);scroll-snap-type:y mandatory;flex:1;white-space:nowrap;word-break:keep-all;overflow:visible;padding-left:clamp(12px,3vw,56px)}
      .content ul li{--h:calc(var(--i) * (360deg / var(--count)));color:hsl(var(--h) 85% 58%);text-shadow:0 1px 0 rgba(0,0,0,.05);scroll-snap-align:center;opacity:.55;transition:opacity .25s ease, transform .25s ease, filter .25s ease;will-change:opacity,transform,filter}
      .list-item{opacity:0;transform:translateY(20px);transition:opacity .6s var(--ease-out), transform .6s var(--ease-out)}
      .list-item.in-view{opacity:1;transform:translateY(0)}
      @media (max-width:1024px){/* disable heavy min-height on smaller devices */ .content{min-height:auto}}
      /* ≤1200px: tighten sizes and paddings */
      @media (max-width:1200px){
        .scroll-header{padding-left:clamp(16px,5vw,56px);padding-top:clamp(36px,9vh,96px)}
        .scroll-header h1{font-size:clamp(2.25rem,9.5vw,8rem)}
        .content h2{font-size:clamp(1.25rem,4.2vw + .45rem,4.75rem)}
        .content ul{font-size:clamp(1.25rem,5vw + .5rem,4.75rem)}
      }
      /* ≤1024px (tablet): reduce further (animasi berat dimatikan, tetapi tipografi tetap rapi) */
      @media (max-width:1024px){
        .scroll-header{padding-left:clamp(12px,5vw,40px);padding-top:clamp(28px,8vh,80px)}
        .scroll-header h1{font-size:clamp(2rem,8.5vw,6.5rem)}
        .content h2{font-size:clamp(1.1rem,3.8vw + .4rem,3.75rem)}
        .content ul{font-size:clamp(1.1rem,4.5vw + .4rem,3.5rem)}
      }
      /* ≤768px (mobile): smallest comfortable sizes */
      @media (max-width:768px){
        .scroll-header{padding-left:clamp(10px,4.5vw,28px);padding-top:clamp(24px,7vh,64px)}
        .scroll-header h1{font-size:clamp(1.75rem,9vw,4.25rem)}
        .content h2{font-size:clamp(1rem,4.8vw,.0rem + 1.6rem)}
        .content ul{font-size:clamp(1rem,5.8vw,2.25rem)}
      }
      `}</style>

      <header className="scroll-header">
        <h1 className="fluid animate-on-scroll enhanced-title">
          <span className="line title-line-1" data-text="Bersama UMKMotion">Bersama Kami</span>
          <br />
          <span className="line title-line-2" data-text="scroll.">scroll.</span>
        </h1>
      </header>

      <main className="scroll-main">
        <section className="content fluid enhanced-content">
          <h2 className="enhanced-subtitle">
            <span aria-hidden="true">Anda bisa</span>
            <span className="sr-only">Anda bisa berbagai hal dengan UMKM.</span>
          </h2>
          <ul aria-hidden="true" style={{ ['--count' as any]: words.length }} data-animate="true" data-snap="true" className="enhanced-list">
            {words.map((w, i) => (
              <li key={i} style={{ ['--i' as any]: i }} className="list-item">{w}</li>
            ))}
          </ul>
        </section>
      </main>
    </section>
  );
}
