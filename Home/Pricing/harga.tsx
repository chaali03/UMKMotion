"use client";

import { useState, useRef } from "react";
import { Check, Briefcase, Building2, Crown, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";

const plans = [
  {
    name: "Pemula",
    description: "Cocok untuk UMKM yang baru mulai online dan butuh solusi sederhana",
    priceMonthly: 12,
    priceYearly: 99,
    features: [
      "Hingga 10 produk katalog",
      "Penyimpanan cloud 5GB",
      "Dukungan email 24/7",
      "Template website dasar",
      "Domain gratis 1 tahun",
      "SSL certificate"
    ],
    popular: false
  },
  {
    name: "Bisnis",
    description: "Paket terbaik untuk bisnis yang berkembang pesat dengan fitur lengkap",
    priceMonthly: 48,
    priceYearly: 399,
    features: [
      "Produk tak terbatas",
      "Penyimpanan 50GB",
      "Analitik dashboard lengkap",
      "Integrasi pembayaran digital",
      "Marketing tools",
      "Priority support",
      "Backup otomatis",
      "Team collaboration"
    ],
    popular: true
  },
  {
    name: "Perusahaan",
    description: "Solusi enterprise dengan fitur premium dan dukungan khusus",
    priceMonthly: 96,
    priceYearly: 899,
    features: [
      "Semua fitur Bisnis++",
      "Penyimpanan unlimited",
      "SLA 99.9% & support 24/7",
      "Akses tim tak terbatas",
      "Custom development",
      "Advanced security",
      "White label solution",
      "Dedicated account manager"
    ],
    popular: false
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

export default function Harga({ hideFooter = false }: { hideFooter?: boolean }) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="w-full px-4 py-12 md:py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-visible">
      {/* Background Elements - Minimalis */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-visible">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-200/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-200/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52rem] h-[52rem] rounded-full bg-gradient-to-tr from-blue-200/10 via-transparent to-purple-200/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto w-full overflow-visible">
        {/* Header Section - Compact */}
        <AnimatedSection className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200/40 bg-white/70 px-3 py-1 text-xs font-medium text-blue-600 mb-4"
          >
            <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
            Harga Transparan
          </motion.div>

          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900 px-2">
            Pilih Paket{" "}
            <span className="text-blue-600">Terbaik</span>
          </h2>
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 120, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-2 h-1 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          />
          
          <p className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-2">
            Sesuaikan dengan kebutuhan bisnis Anda. Upgrade atau downgrade kapan saja.
          </p>

          {/* Pricing Toggle - Compact */}
          <motion.div 
            className="mt-4 inline-flex items-center rounded-xl bg-white border border-gray-200 p-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setIsYearly(false)}
              className={`relative px-3 md:px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                !isYearly
                  ? "text-white bg-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bulanan
            </button>
            
            <button
              onClick={() => setIsYearly(true)}
              className={`relative px-3 md:px-4 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                isYearly
                  ? "text-white bg-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Tahunan
              <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                Hemat
              </span>
            </button>
          </motion.div>
        </AnimatedSection>

        {/* Pricing Cards - Compact & Responsive */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto overflow-visible"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {plans.map((plan, index) => {
            const price = isYearly ? plan.priceYearly : plan.priceMonthly;
            const monthlyEquivalent = isYearly ? (plan.priceYearly / 12) : plan.priceMonthly;
            const savings = isYearly ? Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100) : 0;

            return (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className="flex overflow-visible"
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className={`relative flex-1 rounded-2xl border bg-white transition-colors duration-200 flex flex-col overflow-visible ${
                  plan.popular 
                    ? "border-blue-300 shadow-lg" 
                    : "border-gray-200 shadow-md"
                }`}
                >
                  
                  {/* Popular Badge - Compact */}
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                        <Star className="w-2 h-2 fill-current" />
                        POPULAR
                      </div>
                    </div>
                  )}

                  {/* Card Content - Compact */}
                  <div className="p-4 md:p-5 flex flex-col h-full overflow-visible">
                    {plan.popular && (
                      <div className="pointer-events-none absolute -inset-[1px] rounded-2xl" aria-hidden>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 blur-xl" />
                      </div>
                    )}
                    {/* Header */}
                    <div className="text-center mb-4">
                      <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl mb-2 mx-auto ${
                        plan.popular 
                          ? "bg-blue-100 text-blue-600" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {plan.popular ? (
                          <Building2 className="h-5 w-5 md:h-6 md:w-6" />
                        ) : index === 0 ? (
                          <Briefcase className="h-5 w-5 md:h-6 md:w-6" />
                        ) : (
                          <Crown className="h-5 w-5 md:h-6 md:w-6" />
                        )}
                      </div>
                      
                      <h3 className={`text-lg md:text-xl font-bold ${
                        plan.popular ? "text-gray-900" : "text-gray-800"
                      }`}>
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-gray-600 text-xs leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Pricing - Compact */}
                    <div className="text-center mb-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl md:text-4xl font-bold text-gray-900">${price}</span>
                        <span className="text-gray-500 text-sm">/{isYearly ? 'tahun' : 'bulan'}</span>
                      </div>
                      
                      {isYearly && (
                        <p className="mt-1 text-green-600 font-medium text-xs flex items-center justify-center gap-1">
                          <Check className="h-3 w-3" />
                          Hemat {savings}%
                        </p>
                      )}
                    </div>

                    {/* Features List - Compact */}
                    <div className="flex-1 mb-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li 
                            key={feature}
                            className="flex items-start gap-2 text-xs"
                          >
                            <div className={`flex-shrink-0 w-3 h-3 rounded-full flex items-center justify-center mt-0.5 ${
                              plan.popular 
                                ? "bg-green-100 text-green-600" 
                                : "bg-blue-100 text-blue-600"
                            }`}>
                              <Check className="h-2 w-2" />
                            </div>
                            <span className="text-gray-600 leading-relaxed">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button - Hanya button yang ada animasi */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-1 ${
                        plan.popular
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      Mulai Sekarang
                      <ArrowRight className="h-3 w-3" />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer Note - Compact */}
        {!hideFooter && (
          <AnimatedSection className="text-center mt-6 md:mt-8">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 bg-white rounded-xl px-3 py-2 border border-gray-200 shadow-sm ring-1 ring-orange-100/70">
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                Free trial 14 hari
              </span>
              <span className="text-orange-400">•</span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                No credit card
              </span>
              <span className="text-orange-400">•</span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                Cancel anytime
              </span>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 max-w-xl mx-auto">
              Semua paket termasuk update fitur gratis. Harga dalam USD.
            </p>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}