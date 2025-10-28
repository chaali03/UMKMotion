"use client";
import { TimelineContent } from "../../../components/ui/timeline-animation";
import { ArrowRight, PencilLine } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
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

  // Chart bar animation variants
  const barVariants = {
    hidden: { scaleY: 0, originY: 1 },
    visible: (i: number) => ({
      scaleY: 1,
      transition: {
        delay: 2.8 + i * 0.1, // Start after chart container appears
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  // Chat message variants
  const messageVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: 3.2 + i * 0.6,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };
  const colorClasses = {
    green: "before:bg-green-500 shadow-green-500/20",
    orange: "before:bg-orange-500 shadow-orange-500/20",
    blue: "before:bg-blue-500 shadow-blue-500/20",
  };

  return (
    <section className="max-w-7xl mx-auto p-4" ref={featuresRef}>
      <article className="max-w-5xl mx-auto py-10 text-center space-y-2 px-8">
        <TimelineContent
          as="h1"
          animationNum={0}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          className="md:text-5xl sm:text-4xl text-3xl font-medium"
        >
          Direktori UMKM <br />
          Terlengkap di Indonesia
        </TimelineContent>
        <TimelineContent
          as="p"
          animationNum={1}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          className="text-gray-600 sm:text-base text-sm sm:w-[70%] w-full mx-auto"
        >
          Temukan ribuan UMKM terpercaya di seluruh Indonesia—dari kuliner, fashion, kerajinan tangan, hingga teknologi. Semua dalam satu platform yang mudah diakses.
        </TimelineContent>
      </article>
      <div className="grid grid-cols-12 gap-4">
        {/* Interactive Card Stack */}
        <TimelineContent
          as="div"
          animationNum={0}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          className="lg:col-span-5 sm:col-span-6 col-span-12 relative w-full h-[350px] rounded-xl overflow-hidden border border-neutral-200"
        >
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#b0b0b02e_1px,transparent_1px),linear-gradient(to_bottom,#b0b0b02e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          <HoverTranslateTwo />

          <article className="absolute right-0 bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent p-6 pt-[100px]">
            <h3 className="px-1 pt-1 text-black text-2xl font-medium">
              Kategori UMKM
            </h3>
            <p className="mt-1 px-1 pb-1 font-normal text-gray-600 text-sm w-full">
              Jelajahi berbagai kategori UMKM mulai dari kuliner, fashion, kerajinan, hingga teknologi dengan mudah.
            </p>
          </article>
        </TimelineContent>

        {/* Usage Stats */}
        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          className="lg:col-span-3 sm:col-span-6 col-span-12 border flex flex-col justify-between rounded-lg p-4 relative border-neutral-200"
        >
          <div
            className="absolute inset-0 z-0 rounded-lg"
            style={{
              background:
                "radial-gradient(125% 125% at 50% 10%, #ffffff00 40%, #6366f1 100%)",
            }}
          />
          <motion.div
            className="flex -space-x-3"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            {[
              "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200",
              "https://images.unsplash.com/photo-1617171594279-3aa1f300a0f2?q=80&w=200",
              "https://images.unsplash.com/photo-1659228135452-c4c7b5118047?q=80&w=200",
            ].map((src, i) => (
              <motion.img
                key={i}
                src={src}
                width={24}
                height={24}
                className="rounded-xl border-4 border-white h-14 w-14 object-cover"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 2.0 + i * 0.2,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                }}
              />
            ))}
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2.6, duration: 0.5 }}
          >
            <motion.h1
              className="text-4xl font-semibold sm:pt-0 pt-20"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.8, duration: 0.3, type: "spring" }}
            >
              8.5K+
            </motion.h1>
            <p className="text-sm">
              UMKM terdaftar dan terus bertambah
            </p>
          </motion.div>
        </TimelineContent>

        {/* Memberships */}
        <TimelineContent
          as="div"
          animationNum={2}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          className="lg:col-span-4 sm:col-span-6 col-span-12 border rounded-lg p-4 group border-neutral-200"
        >
          <motion.h1
            className="text-4xl font-semibold"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            Paket Keanggotaan
          </motion.h1>
          <motion.p
            className="text-sm"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            Pilih paket yang sesuai untuk mengembangkan bisnis UMKM Anda
          </motion.p>
          <div className="space-y-2 mt-6">
            {[
              {
                title: "Starter",
                desc: "Gratis - Fitur dasar",
                color: "green",
                rotation: 0,
              },
              {
                title: "Business",
                desc: "Rp 99.000/bulan",
                color: "orange",
                rotation: 3,
              },
              {
                title: "Premium",
                desc: "Rp 999.000/tahun",
                color: "blue",
                rotation: -1,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`flex gap-2 justify-between items-center bg-neutral-50 p-2 rounded-xl border border-neutral-200 shadow-lg pl-7 relative before:content-[''] before:absolute before:left-2.5 before:rounded-md before:top-1.5 before:w-1.5 before:h-[80%] ${colorClasses[item.color as keyof typeof colorClasses]} group-hover:rotate-0 transition-all`}
                style={{
                  rotate: `${item.rotation}deg`,
                  boxShadow: `0 10px 15px -3px rgb(${item.color === "green" ? "34 197 94" : item.color === "orange" ? "249 115 22" : "59 130 246"} / 0.1)`,
                }}
                initial={{ x: -30, opacity: 0, rotate: item.rotation + 10 }}
                animate={{ x: 0, opacity: 1, rotate: item.rotation }}
                transition={{
                  delay: i * 0.2,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ rotate: 0 }}
              >
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm">{item.desc}</p>
                </div>
                <ArrowRight />
              </motion.div>
            ))}
          </div>
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={3}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          className="lg:col-span-7 sm:col-span-6 col-span-12 relative border p-4 rounded-xl overflow-hidden border-neutral-200"
        >
          <article className="w-full bg-gradient-to-t font-helvetica from-white via-white to-transparent">
            <h3 className="px-1 pt-1 text-black text-2xl font-medium">
              Statistik Pertumbuhan
            </h3>
            <p className="mt-1 px-1 pb-1 font-normal text-gray-600 text-sm w-full">
              Pantau pertumbuhan UMKM di berbagai kategori dengan visualisasi data yang interaktif dan mudah dipahami.
            </p>
          </article>
          <motion.svg
            width="552"
            height="225"
            viewBox="0 0 552 225"
            className="w-fit h-72 pt-5"
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
                stroke="#dbdbdb"
                strokeDasharray="2 2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 2.6 + i * 0.1, duration: 0.8 }}
              />
            ))}

            {[
              {
                d: "M19 2.00001C19 0.895436 19.8954 0 21 0H29C30.1046 0 31 0.895431 31 2V224H19V2.00001Z",
                fill: "#F93861",
              },
              {
                d: "M283 2.00001C283 0.895436 283.895 0 285 0H292C293.105 0 294 0.895431 294 2V224H283V2.00001Z",
                fill: "#008AFF",
              },
              {
                d: "M46 93C46 91.8954 46.8954 91 48 91H55C56.1046 91 57 91.8954 57 93V224H46V93Z",
                fill: "#FFCA00",
              },
              {
                d: "M309 93C309 91.8954 309.895 91 311 91H319C320.105 91 321 91.8954 321 93V224H309V93Z",
                fill: "#B8A6DC",
              },
              {
                d: "M72 25C72 23.8954 72.8954 23 74 23H82C83.1046 23 84 23.8954 84 25V224H72V25Z",
                fill: "#25A87C",
              },
              {
                d: "M336 25C336 23.8954 336.895 23 338 23H345C346.105 23 347 23.8954 347 25V224H336V25Z",
                fill: "#F93861",
              },
              {
                d: "M98 132C98 130.895 98.8954 130 100 130H108C109.105 130 110 130.895 110 132V224H98V132Z",
                fill: "#B8A6DC",
              },
              {
                d: "M362 132C362 130.895 362.895 130 364 130H371C372.105 130 373 130.895 373 132V224H362V132Z",
                fill: "#25A87C",
              },
              {
                d: "M125 203C125 201.895 125.895 201 127 201H134C135.105 201 136 201.895 136 203V224H125V203Z",
                fill: "#4EEAEF",
              },
              {
                d: "M388 203C388 201.895 388.895 201 390 201H398C399.105 201 400 201.895 400 203V224H388V203Z",
                fill: "#4EEAEF",
              },
              {
                d: "M151 9C151 7.89543 151.895 7 153 7H161C162.105 7 163 7.89543 163 9V224H151V9Z",
                fill: "#8E5AF5",
              },
              {
                d: "M415 9C415 7.89543 415.895 7 417 7H424C425.105 7 426 7.89543 426 9V224H415V9Z",
                fill: "#8E5AF5",
              },
              {
                d: "M178 165C178 163.895 178.895 163 180 163H187C188.105 163 189 163.895 189 165V224H178V165Z",
                fill: "#E33E58",
              },
              {
                d: "M441 165C441 163.895 441.895 163 443 163H451C452.105 163 453 163.895 453 165V224H441V165Z",
                fill: "#E33E58",
              },
              {
                d: "M204 55C204 53.8954 204.895 53 206 53H213C214.105 53 215 53.8954 215 55V224H204V55Z",
                fill: "#008AFF",
              },
              {
                d: "M467 55C467 53.8954 467.895 53 469 53H477C478.105 53 479 53.8954 479 55V224H467V55Z",
                fill: "#008AFF",
              },
              {
                d: "M230 84C230 82.8954 230.895 82 232 82H240C241.105 82 242 82.8954 242 84V224H230V84Z",
                fill: "#46D394",
              },
              {
                d: "M494 84C494 82.8954 494.895 82 496 82H503C504.105 82 505 82.8954 505 84V224H494V84Z",
                fill: "#46D394",
              },
              {
                d: "M257 42C257 40.8954 257.895 40 259 40H266C267.105 40 268 40.8954 268 42V224H257V42Z",
                fill: "#FFCA00",
              },
              {
                d: "M520 42C520 40.8954 520.895 40 522 40H530C531.105 40 532 40.8954 532 42V224H520V42Z",
                fill: "#FFCA00",
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
              />
            ))}
          </motion.svg>
        </TimelineContent>

        {/* Real Time Chat */}
        <TimelineContent
          as="div"
          animationNum={4}
          timelineRef={featuresRef}
          customVariants={revealVariants}
          className="lg:col-span-5 sm:col-span-6 col-span-12 relative border p-4 rounded-xl overflow-hidden border-neutral-200"
        >
          <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-lg">
            {/* Messages Area */}
            <div className="flex-1 space-y-4 p-4 overflow-hidden">
              {/* Agent Messages with staggered animation */}
              <motion.div
                className="mr-auto relative max-w-[80%] rounded-lg bg-gray-100 p-3 text-gray-800"
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                Halo! Terima kasih sudah menghubungi kami. Saya lihat Anda tertarik dengan produk kerajinan tangan kami. Kami punya koleksi terbaru yang mungkin cocok untuk Anda!
              </motion.div>

              <motion.div
                className="mr-auto relative max-w-[80%] rounded-lg bg-gray-100 p-3 text-gray-800"
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                Sebagai member{" "}
                <span className="font-semibold text-blue-500 border-b border-dashed border-blue-500">
                  Business
                </span>
                , Anda mendapat diskon 15% untuk semua produk dan gratis ongkir ke seluruh Indonesia.
                <motion.button
                  className="absolute -bottom-2 right-0 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-1 text-xs text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 4.6, duration: 0.4, type: "spring" }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PencilLine className="h-3 w-3" />
                  Adjust tone
                </motion.button>
              </motion.div>
            </div>

            {/* Chat Input Area */}
            <motion.div
              className="flex items-center gap-2 border-t border-gray-200 p-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 4.8, duration: 0.5 }}
            >
              <motion.input
                type="text"
                placeholder="Bagaimana cara upgrade ke Premium?"
                className="flex-1 rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                initial={{ width: "60%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 5.0, duration: 0.6 }}
              />
              <motion.button
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 5.2, duration: 0.4, type: "spring" }}
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </div>

          <article className="absolute right-0 top-0 left-0 w-full bg-gradient-to-b from-white via-white to-transparent p-6 pb-[100px]">
            <h3 className="px-1 pt-1 text-black text-2xl font-medium">
              Hubungi UMKM
            </h3>
            <p className="mt-1 px-1 pb-1 font-normal text-gray-600 text-sm w-full">
              Terhubung langsung dengan pemilik UMKM melalui chat real-time untuk konsultasi atau pemesanan produk.
            </p>
          </article>
        </TimelineContent>
      </div>
    </section>
  );
};

export default Feature1;
