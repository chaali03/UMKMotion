"use client";
import React from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

// Type Definition
export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
  rating?: number;
};

// Props Interface
interface TestimonialsColumnProps {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}

export const TestimonialsColumn: React.FC<TestimonialsColumnProps> = ({
  className = "",
  testimonials,
  duration = 10,
}) => {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...Array(2)].map((_, index) => (
          <React.Fragment key={`group-${index}`}>
            {testimonials.map((testimonial, i) => (
              <TestimonialCard
                key={`${index}-${i}`}
                testimonial={testimonial}
              />
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({
  testimonial,
}) => {
  const { text, image, name, role, rating = 5 } = testimonial;

  return (
    <div className="relative p-8 rounded-2xl border-2 border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-xl transition-all duration-300 max-w-sm w-full">
      {/* Top Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />

      {/* Quote Icon */}
      <div className="absolute -top-4 left-8">
        <div className="p-2 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg">
          <Quote className="w-4 h-4 text-white" fill="white" />
        </div>
      </div>

      {/* Rating Stars */}
      <div className="flex gap-1 mb-4 mt-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 fill-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Testimonial Text */}
      <p className="text-gray-700 leading-relaxed mb-6 text-sm font-medium">
        "{text}"
      </p>

      {/* Author Info */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200/80">
        <div className="relative">
          <img
            width={48}
            height={48}
            src={image}
            alt={name}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200"
          />
        </div>

        <div className="flex flex-col">
          <div className="font-bold text-gray-900 leading-tight">
            {name}
          </div>
          <div className="text-sm text-gray-500 leading-tight">
            {role}
          </div>
        </div>
      </div>

      {/* Decorative Corner */}
      <div className="absolute bottom-4 right-4 w-8 h-8 opacity-10">
        <Quote className="w-full h-full text-orange-500" />
      </div>
    </div>
  );
};

// Example Usage Component
export const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    {
      text: "Platform ini benar-benar mengubah cara kami berbisnis online. Sangat mudah digunakan dan fitur-fiturnya lengkap!",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      name: "Budi Santoso",
      role: "Pemilik Toko Online",
      rating: 5,
    },
    {
      text: "Dukungan pelanggan yang luar biasa! Tim sangat responsif dan membantu kami dalam setiap langkah.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
      name: "Siti Rahmawati",
      role: "Owner Brand Fashion",
      rating: 5,
    },
    {
      text: "Investasi terbaik untuk bisnis saya. ROI yang didapat jauh melebihi ekspektasi!",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      name: "Ahmad Fauzi",
      role: "Digital Marketer",
      rating: 5,
    },
    {
      text: "Fitur analitiknya sangat membantu kami dalam mengambil keputusan bisnis yang tepat.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      name: "Dewi Lestari",
      role: "Business Analyst",
      rating: 4,
    },
    {
      text: "Sistem pembayaran yang terintegrasi membuat transaksi jadi lebih mudah dan aman.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      name: "Eko Prasetyo",
      role: "E-commerce Manager",
      rating: 5,
    },
    {
      text: "Dengan platform ini, penjualan kami meningkat 300% dalam 6 bulan pertama!",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
      name: "Rina Wijaya",
      role: "Founder Startup",
      rating: 5,
    },
  ];

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 border border-orange-200 mb-4">
            <Star className="w-4 h-4 text-orange-600 fill-orange-600" />
            <span className="text-sm font-bold text-orange-700">
              TESTIMONI PELANGGAN
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
            Apa Kata{" "}
            <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Pelanggan Kami
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pelanggan yang puas dan tingkatkan bisnis Anda
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]">
          <TestimonialsColumn
            testimonials={firstColumn}
            duration={20}
          />
          <TestimonialsColumn
            testimonials={secondColumn}
            duration={25}
            className="hidden md:block"
          />
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
              10K+
            </div>
            <div className="text-sm text-gray-600 font-medium">Pelanggan Aktif</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
              4.9
            </div>
            <div className="text-sm text-gray-600 font-medium">Rating Rata-rata</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
              99%
            </div>
            <div className="text-sm text-gray-600 font-medium">Tingkat Kepuasan</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <div className="text-sm text-gray-600 font-medium">Dukungan</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsColumn;