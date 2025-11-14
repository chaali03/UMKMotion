"use client";
import React, { useRef } from "react";
import { TimelineContent } from "../../../components/ui/timeline-animation";
import { ArrowRight, PencilLine, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import HoverTranslateTwo from "../../../components/ui/interactive-card-stack";

const Feature1 = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const barVariants = {
    hidden: { scaleY: 0, originY: 1 },
    visible: (i: number) => ({
      scaleY: 1,
      transition: {
        delay: 2.8 + i * 0.1,
        duration: 0.8,
      },
    }),
  } as const;

  const messageVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: 3.2 + i * 0.6,
        duration: 0.5,
      },
    }),
  } as const;

  const colorClasses = {
    green: "before:bg-gradient-to-b before:from-emerald-400 before:to-emerald-600 shadow-emerald-500/20",
    orange: "before:bg-gradient-to-b before:from-orange-400 before:to-orange-600 shadow-orange-500/20",
    blue: "before:bg-gradient-to-b before:from-blue-400 before:to-blue-600 shadow-blue-500/20",
  };

  return (
    <section
      className="max-w-7xl mx-auto p-4 relative bg-white text-gray-900 dark:bg-white dark:text-gray-900 [color-scheme:light]"
      ref={featuresRef}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px 1200px' } as React.CSSProperties}
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(40px, 10px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Header Section */}
      <article className="max-w-5xl mx-auto py-12 text-center space-y-4 px-8">
        <TimelineContent
          as="div"
          animationNum={0}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          once={true}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 mb-4"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Fitur Unggulan
          </span>
        </TimelineContent>

        <TimelineContent
          as="h1"
          animationNum={0}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          once={true}
          className="md:text-6xl sm:text-5xl text-4xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight"
        >
          Direktori UMKM <br />
          Terlengkap di Indonesia
        </TimelineContent>

        <TimelineContent
          as="p"
          animationNum={1}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          once={true}
          className="text-gray-600 sm:text-lg text-base sm:w-[70%] w-full mx-auto leading-relaxed"
        >
          Temukan ribuan UMKM terpercaya di seluruh Indonesia—dari kuliner, fashion, kerajinan tangan, hingga teknologi. Semua dalam satu platform yang mudah diakses.
        </TimelineContent>
      </article>

      <div className="grid grid-cols-12 gap-6">
        {/* Interactive Card Stack - Enhanced */}
        <TimelineContent
          as="div"
          animationNum={0}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          once={true}
          className="lg:col-span-5 sm:col-span-6 col-span-12 relative w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 group"
        >
          {/* Enhanced Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <HoverTranslateTwo />

          <article className="absolute right-0 bottom-0 left-0 w-full bg-gradient-to-t from-white via-white/95 to-transparent p-8 pt-[120px]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-gray-900 text-3xl font-bold">
                Kategori UMKM
              </h2>
            </div>
            <p className="text-gray-600 text-base leading-relaxed">
              Jelajahi berbagai kategori UMKM mulai dari kuliner, fashion, kerajinan, hingga teknologi dengan mudah.
            </p>
          </article>
        </TimelineContent>

        {/* Usage Stats - Enhanced */}
        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          once={true}
          className="lg:col-span-3 sm:col-span-6 col-span-12 border flex flex-col justify-between rounded-2xl p-6 relative border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group"
        >
          {/* Enhanced Gradient Background */}
          <div
            className="absolute inset-0 z-0 opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #818cf8 100%)",
            }}
          />

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

          <motion.div
            className="flex -space-x-4 relative z-10"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            {[
              "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=150&q=80&fm=webp&fit=crop&auto=format,compress",
              "https://images.unsplash.com/photo-1617171594279-3aa1f300a0f2?w=200&h=150&q=80&fm=webp&fit=crop&auto=format,compress",
              "https://images.unsplash.com/photo-1659228135452-c4c7b5118047?w=200&h=150&q=80&fm=webp&fit=crop&auto=format,compress",
            ].map((src, i) => {
              const s48 = src.replace("w=200&h=150", "w=48&h=48");
              const s64 = src.replace("w=200&h=150", "w=64&h=64");
              const s96 = src.replace("w=200&h=150", "w=96&h=96");
              const srcSet = `${s48} 48w, ${s64} 64w, ${s96} 96w`;
              return (
                <motion.div
                  key={i}
                  className="relative"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 2.0 + i * 0.2,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  <img
                    src={s64}
                    srcSet={srcSet}
                    sizes="(max-width: 640px) 48px, 64px"
                    width={64}
                    height={64}
                    alt={`User ${i + 1}`}
                    className="rounded-2xl border-4 border-white h-16 w-16 object-cover shadow-lg ring-2 ring-purple-200"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
              );
            })}
            <motion.div
              className="flex items-center justify-center rounded-2xl border-4 border-white h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg ring-2 ring-purple-200"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.6, duration: 0.5, type: "spring" }}
            >
              <Users className="w-7 h-7 text-white" />
            </motion.div>
          </motion.div>

          <motion.div
            className="relative z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2.6, duration: 0.5 }}
          >
            <motion.div
              className="flex items-baseline gap-2"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.8, duration: 0.3, type: "spring" }}
            >
              <h1 className="text-5xl font-bold text-white">
                8.5K+
              </h1>
              <motion.div
                className="flex items-center gap-1 text-emerald-300"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 3.0, duration: 0.4 }}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+12%</span>
              </motion.div>
            </motion.div>
            <p className="text-base text-white/90 mt-2 font-medium">
              UMKM terdaftar dan terus bertambah
            </p>
          </motion.div>
        </TimelineContent>

        {/* Memberships - Enhanced */}
        <TimelineContent
          as="div"
          animationNum={2}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          once={true}
          className="lg:col-span-4 sm:col-span-6 col-span-12 border rounded-2xl p-6 group border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
        >
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-100 to-purple-100 rounded-full blur-3xl opacity-50"></div>

          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Paket Keanggotaan
              </h1>
            </div>
            <p className="text-base text-gray-600 ml-14">
              Pilih paket yang sesuai untuk mengembangkan bisnis UMKM Anda
            </p>
          </motion.div>

          <div className="space-y-3 mt-8 relative z-10">
            {[
              {
                title: "Starter",
                desc: "Gratis - Fitur dasar",
                color: "green",
                rotation: 0,
                icon: "🌱",
              },
              {
                title: "Business",
                desc: "Rp 99.000/bulan",
                color: "orange",
                rotation: 3,
                icon: "🚀",
              },
              {
                title: "Premium",
                desc: "Rp 999.000/tahun",
                color: "blue",
                rotation: -1,
                icon: "👑",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`flex gap-3 justify-between items-center bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border-2 border-gray-200 shadow-lg pl-8 relative before:content-[''] before:absolute before:left-3 before:rounded-lg before:top-3 before:w-2 before:h-[calc(100%-1.5rem)] ${colorClasses[item.color as keyof typeof colorClasses]} group-hover:rotate-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer`}
                style={{
                  rotate: `${item.rotation}deg`,
                }}
                initial={{ x: -30, opacity: 0, rotate: item.rotation + 10 }}
                animate={{ x: 0, opacity: 1, rotate: item.rotation }}
                transition={{
                  delay: i * 0.2,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ rotate: 0, x: 5 }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
                <motion.div
                  className="p-2 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.1, rotate: -10 }}
                >
                  <ArrowRight className="w-5 h-5 text-gray-700" aria-label="Select plan" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </TimelineContent>

        {/* Statistics Chart - Enhanced */}
        <TimelineContent
          as="div"
          animationNum={3}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          once={true}
          className="lg:col-span-7 sm:col-span-6 col-span-12 relative border p-6 rounded-2xl overflow-hidden border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 group"
        >
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30"></div>

          <article className="w-full bg-gradient-to-t from-white via-white to-transparent relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-gray-900 text-3xl font-bold">
                Statistik Pertumbuhan
              </h2>
            </div>
            <p className="mt-2 font-normal text-gray-600 text-base leading-relaxed ml-14">
              Pantau pertumbuhan UMKM di berbagai kategori dengan visualisasi data yang interaktif dan mudah dipahami.
            </p>
          </article>

          <motion.svg
            width="552"
            height="225"
            viewBox="0 0 552 225"
            className="w-full h-72 pt-8 relative z-10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 0.5 }}
          >
            {[224, 163, 106, 50].map((y, i) => (
              <motion.path
                key={i}
                d={`M0 ${y}H552`}
                stroke="#e5e7eb"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 2.6 + i * 0.1, duration: 0.8 }}
              />
            ))}

            {[
              {
                d: "M19 2.00001C19 0.895436 19.8954 0 21 0H29C30.1046 0 31 0.895431 31 2V224H19V2.00001Z",
                fill: "url(#gradient1)",
              },
              {
                d: "M283 2.00001C283 0.895436 283.895 0 285 0H292C293.105 0 294 0.895431 294 2V224H283V2.00001Z",
                fill: "url(#gradient2)",
              },
              {
                d: "M46 93C46 91.8954 46.8954 91 48 91H55C56.1046 91 57 91.8954 57 93V224H46V93Z",
                fill: "url(#gradient3)",
              },
              {
                d: "M309 93C309 91.8954 309.895 91 311 91H319C320.105 91 321 91.8954 321 93V224H309V93Z",
                fill: "url(#gradient4)",
              },
              {
                d: "M72 25C72 23.8954 72.8954 23 74 23H82C83.1046 23 84 23.8954 84 25V224H72V25Z",
                fill: "url(#gradient5)",
              },
              {
                d: "M336 25C336 23.8954 336.895 23 338 23H345C346.105 23 347 23.8954 347 25V224H336V25Z",
                fill: "url(#gradient6)",
              },
              {
                d: "M98 132C98 130.895 98.8954 130 100 130H108C109.105 130 110 130.895 110 132V224H98V132Z",
                fill: "url(#gradient7)",
              },
              {
                d: "M362 132C362 130.895 362.895 130 364 130H371C372.105 130 373 130.895 373 132V224H362V132Z",
                fill: "url(#gradient8)",
              },
              {
                d: "M125 203C125 201.895 125.895 201 127 201H134C135.105 201 136 201.895 136 203V224H125V203Z",
                fill: "url(#gradient9)",
              },
              {
                d: "M388 203C388 201.895 388.895 201 390 201H398C399.105 201 400 201.895 400 203V224H388V203Z",
                fill: "url(#gradient10)",
              },
              {
                d: "M151 9C151 7.89543 151.895 7 153 7H161C162.105 7 163 7.89543 163 9V224H151V9Z",
                fill: "url(#gradient11)",
              },
              {
                d: "M415 9C415 7.89543 415.895 7 417 7H424C425.105 7 426 7.89543 426 9V224H415V9Z",
                fill: "url(#gradient12)",
              },
              {
                d: "M178 165C178 163.895 178.895 163 180 163H187C188.105 163 189 163.895 189 165V224H178V165Z",
                fill: "url(#gradient13)",
              },
              {
                d: "M441 165C441 163.895 441.895 163 443 163H451C452.105 163 453 163.895 453 165V224H441V165Z",
                fill: "url(#gradient14)",
              },
              {
                d: "M204 55C204 53.8954 204.895 53 206 53H213C214.105 53 215 53.8954 215 55V224H204V55Z",
                fill: "url(#gradient15)",
              },
              {
                d: "M467 55C467 53.8954 467.895 53 469 53H477C478.105 53 479 53.8954 479 55V224H467V55Z",
                fill: "url(#gradient16)",
              },
              {
                d: "M230 84C230 82.8954 230.895 82 232 82H240C241.105 82 242 82.8954 242 84V224H230V84Z",
                fill: "url(#gradient17)",
              },
              {
                d: "M494 84C494 82.8954 494.895 82 496 82H503C504.105 82 505 82.8954 505 84V224H494V84Z",
                fill: "url(#gradient18)",
              },
              {
                d: "M257 42C257 40.8954 257.895 40 259 40H266C267.105 40 268 40.8954 268 42V224H257V42Z",
                fill: "url(#gradient19)",
              },
              {
                d: "M520 42C520 40.8954 520.895 40 522 40H530C531.105 40 532 40.8954 532 42V224H520V42Z",
                fill: "url(#gradient20)",
              },
            ].map((bar, i) => (
              <motion.path
                key={i}
                d={bar.d}
                fill={bar.fill}
                variants={barVariants}
                initial="hidden"
                animate="visible"
                custom={i}
                className="drop-shadow-lg"
              />
            ))}

            <defs>
              <linearGradient id="gradient1" x1="25" y1="0" x2="25" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f43f5e" />
                <stop offset="1" stopColor="#be123c" />
              </linearGradient>
              <linearGradient id="gradient2" x1="288" y1="0" x2="288" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#1e40af" />
              </linearGradient>
              <linearGradient id="gradient3" x1="51" y1="91" x2="51" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fbbf24" />
                <stop offset="1" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="gradient4" x1="315" y1="91" x2="315" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a78bfa" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="gradient5" x1="78" y1="23" x2="78" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34d399" />
                <stop offset="1" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="gradient6" x1="341" y1="23" x2="341" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f87171" />
                <stop offset="1" stopColor="#dc2626" />
              </linearGradient>
              <linearGradient id="gradient7" x1="104" y1="130" x2="104" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c084fc" />
                <stop offset="1" stopColor="#9333ea" />
              </linearGradient>
              <linearGradient id="gradient8" x1="367" y1="130" x2="367" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4ade80" />
                <stop offset="1" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient id="gradient9" x1="130" y1="201" x2="130" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22d3ee" />
                <stop offset="1" stopColor="#0891b2" />
              </linearGradient>
              <linearGradient id="gradient10" x1="394" y1="201" x2="394" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2dd4bf" />
                <stop offset="1" stopColor="#0d9488" />
              </linearGradient>
              <linearGradient id="gradient11" x1="157" y1="7" x2="157" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a855f7" />
                <stop offset="1" stopColor="#7e22ce" />
              </linearGradient>
              <linearGradient id="gradient12" x1="420" y1="7" x2="420" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#6d28d9" />
              </linearGradient>
              <linearGradient id="gradient13" x1="183" y1="163" x2="183" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fb7185" />
                <stop offset="1" stopColor="#e11d48" />
              </linearGradient>
              <linearGradient id="gradient14" x1="447" y1="163" x2="447" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f472b6" />
                <stop offset="1" stopColor="#db2777" />
              </linearGradient>
              <linearGradient id="gradient15" x1="209" y1="53" x2="209" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa" />
                <stop offset="1" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="gradient16" x1="473" y1="53" x2="473" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="gradient17" x1="236" y1="82" x2="236" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4ade80" />
                <stop offset="1" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="gradient18" x1="499" y1="82" x2="499" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2dd4bf" />
                <stop offset="1" stopColor="#14b8a6" />
              </linearGradient>
              <linearGradient id="gradient19" x1="262" y1="40" x2="262" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#facc15" />
                <stop offset="1" stopColor="#eab308" />
              </linearGradient>
              <linearGradient id="gradient20" x1="526" y1="40" x2="526" y2="224" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fb923c" />
                <stop offset="1" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </motion.svg>
        </TimelineContent>

        {/* Real Time Chat - Enhanced */}
        <TimelineContent
          as="div"
          animationNum={4}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          once={true}
          className="lg:col-span-5 sm:col-span-6 col-span-12 relative border p-6 rounded-2xl overflow-hidden border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          {/* Background Decoration */}
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-purple-100 to-pink-100 rounded-full blur-3xl opacity-40"></div>

          <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-2xl border border-gray-200 relative z-10">
            {/* Messages Area */}
            <div className="flex-1 space-y-4 p-6 overflow-hidden">
              {/* Agent Messages with staggered animation */}
              <motion.div
                className="mr-auto relative max-w-[85%] rounded-2xl bg-gradient-to-br from-white to-gray-50 p-4 text-gray-800 shadow-md border border-gray-200"
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                <p className="text-sm leading-relaxed">
                  Halo! Terima kasih sudah menghubungi kami. Saya lihat Anda tertarik dengan produk kerajinan tangan kami. Kami punya koleksi terbaru yang mungkin cocok untuk Anda!
                </p>
              </motion.div>

              <motion.div
                className="mr-auto relative max-w-[85%] rounded-2xl bg-gradient-to-br from-white to-gray-50 p-4 text-gray-800 shadow-md border border-gray-200"
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                <p className="text-sm leading-relaxed">
                  Sebagai member{" "}
                  <span className="font-bold text-blue-600 border-b-2 border-dashed border-blue-400 px-1">
                    Business
                  </span>
                  , Anda mendapat diskon 15% untuk semua produk dan gratis ongkir ke seluruh Indonesia.
                </p>
                <motion.button
                  className="absolute -bottom-3 right-2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 4.6, duration: 0.4, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Adjust tone"
                  suppressHydrationWarning
                >
                  <PencilLine className="h-3 w-3" />
                  Adjust tone
                </motion.button>
              </motion.div>
            </div>

            {/* Chat Input Area */}
            <motion.div
              className="flex items-center gap-3 border-t border-gray-200 p-5 bg-white"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 4.8, duration: 0.5 }}
            >
              <motion.input
                type="text"
                placeholder="Bagaimana cara upgrade ke Premium?"
                className="flex-1 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                initial={{ width: "60%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 5.0, duration: 0.6 }}
                suppressHydrationWarning
              />
              <motion.button
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 5.2, duration: 0.4, type: "spring" }}
                whileHover={{ scale: 1.1, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Kirim pesan"
                suppressHydrationWarning
              >
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </div>

          <article className="absolute right-0 top-0 left-0 w-full bg-gradient-to-b from-white via-white to-transparent p-8 pb-[120px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-gray-900 text-3xl font-bold">
                Hubungi UMKM
              </h2>
            </div>
            <p className="mt-2 font-normal text-gray-600 text-base leading-relaxed ml-14">
              Terhubung langsung dengan pemilik UMKM melalui chat real-time untuk konsultasi atau pemesanan produk.
            </p>
          </article>
        </TimelineContent>
      </div>
    </section>
  );
};

export default Feature1;