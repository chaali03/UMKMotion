
import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Store,
  Users,
  Award,
  Target,
  Calendar,
  ArrowRight,
  Search,
  Filter,
  Star,
  Clock,
  MapPin,
  CheckCircle,
  X,
  Phone,
  Video,
  FileText,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Heart,
  Share2,
  BookOpen,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
} from "lucide-react";

type Consultant = {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  price: string;
  image: string;
  availability: string;
  location?: string;
  languages?: string[];
  clientsCount?: number;
  successRate?: string;
  education?: string;
  certifications?: string[];
  bio?: string;
  specialties?: string[];
  responseTime?: string;
};

const CONSULTANTS: Consultant[] = [
  {
    id: 1,
    name: "Dr. Budi Santoso",
    specialty: "Manajemen Keuangan UMKM",
    experience: "15 tahun",
    rating: "4.9",
    price: "Rp 150.000/sesi",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=800&fit=crop&q=60",
    availability: "Online",
    location: "Jakarta",
    languages: ["Bahasa Indonesia", "English"],
    clientsCount: 245,
    successRate: "94%",
    education: "S2 Manajemen Keuangan, Universitas Indonesia",
    certifications: ["CFA", "Certified Financial Planner"],
    bio: "Spesialis keuangan dengan pengalaman 15 tahun membantu UMKM mengelola keuangan dan meningkatkan profitabilitas.",
    specialties: ["Cash Flow Management", "Financial Planning", "Investment Strategy"],
    responseTime: "< 2 jam",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    specialty: "Digital Marketing & Branding",
    experience: "10 tahun",
    rating: "4.8",
    price: "Rp 120.000/sesi",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop&q=60",
    availability: "Online",
    location: "Bandung",
    languages: ["Bahasa Indonesia", "English"],
    clientsCount: 189,
    successRate: "91%",
    education: "S2 Marketing, ITB",
    certifications: ["Google Ads Certified", "Facebook Blueprint"],
    bio: "Expert dalam digital marketing dengan track record meningkatkan penjualan UMKM hingga 300% melalui strategi digital.",
    specialties: ["Social Media Marketing", "SEO", "Content Strategy"],
    responseTime: "< 1 jam",
  },
  {
    id: 3,
    name: "Ahmad Wijaya",
    specialty: "Strategi Bisnis & Ekspansi",
    experience: "12 tahun",
    rating: "4.9",
    price: "Rp 180.000/sesi",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&q=60",
    availability: "Online",
    location: "Surabaya",
    languages: ["Bahasa Indonesia", "English", "Mandarin"],
    clientsCount: 312,
    successRate: "96%",
    education: "MBA, Harvard Business School",
    certifications: ["PMP", "Business Strategy"],
    bio: "Konsultan strategi bisnis yang telah membantu ratusan UMKM melakukan ekspansi dan meningkatkan market share.",
    specialties: ["Business Expansion", "Market Analysis", "Strategic Planning"],
    responseTime: "< 3 jam",
  },
  {
    id: 4,
    name: "Dewi Lestari",
    specialty: "Legalitas & Perizinan UMKM",
    experience: "8 tahun",
    rating: "4.7",
    price: "Rp 100.000/sesi",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=800&fit=crop&q=60",
    availability: "Online",
    location: "Yogyakarta",
    languages: ["Bahasa Indonesia"],
    clientsCount: 156,
    successRate: "89%",
    education: "S.H., Universitas Gadjah Mada",
    certifications: ["Advokat", "Legal Consultant"],
    bio: "Ahli hukum yang fokus membantu UMKM menyelesaikan masalah legalitas dan perizinan dengan cepat dan tepat.",
    specialties: ["Business Registration", "Legal Compliance", "Contract Review"],
    responseTime: "< 4 jam",
  },
  {
    id: 5,
    name: "Rizki Pratama",
    specialty: "E-commerce & Marketplace",
    experience: "7 tahun",
    rating: "4.8",
    price: "Rp 130.000/sesi",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&q=60",
    availability: "Online",
    location: "Jakarta",
    languages: ["Bahasa Indonesia", "English"],
    clientsCount: 278,
    successRate: "92%",
    education: "S1 Teknik Informatika, UI",
    certifications: ["E-commerce Specialist", "Shopify Expert"],
    bio: "Spesialis e-commerce yang telah membantu UMKM menjual produk secara online dengan strategi marketplace yang efektif.",
    specialties: ["Shopify Setup", "Marketplace Optimization", "Digital Sales"],
    responseTime: "< 2 jam",
  },
  {
    id: 6,
    name: "Nina Kurnia",
    specialty: "Manajemen Operasional",
    experience: "11 tahun",
    rating: "4.9",
    price: "Rp 140.000/sesi",
    image:
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&h=800&fit=crop&q=60",
    availability: "Online",
    location: "Medan",
    languages: ["Bahasa Indonesia", "English"],
    clientsCount: 201,
    successRate: "93%",
    education: "S2 Operations Management, IPB",
    certifications: ["Lean Six Sigma", "Operations Excellence"],
    bio: "Expert dalam optimasi operasional yang membantu UMKM meningkatkan efisiensi dan mengurangi biaya operasional.",
    specialties: ["Process Optimization", "Supply Chain", "Quality Management"],
    responseTime: "< 2 jam",
  },
];

const features = [
  {
    icon: Users,
    text: "Pendampingan 1-on-1 yang praktis, langsung ke solusi lapangan.",
  },
  {
    icon: Award,
    text: "Metode terbukti untuk UMKM naik kelas.",
  },
  {
    icon: Target,
    text: "Fokus pada omzet, pricing, & distribusi lokal.",
  },
];

const ConsultantHomePage: React.FC = () => {
  const [showChatPage, setShowChatPage] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "price" | "experience">("rating");
  const [showFilters, setShowFilters] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  // parallax: mouse position
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const tX = useTransform(mvX, (v) => `${v * 10}px`);
  const tY = useTransform(mvY, (v) => `${v * 10}px`);

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === "undefined") return;
    
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mvX.set(x);
      mvY.set(y);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mvX, mvY]);

  const openChat = (c: Consultant) => {
    setSelectedConsultant(c);
    setShowChatPage(true);
  };

  const closeChat = () => {
    setShowChatPage(false);
    setSelectedConsultant(null);
  };

  const openDetail = (c: Consultant) => {
    setSelectedConsultant(c);
    setShowDetailModal(true);
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setSelectedConsultant(null);
  };

  // Filter and sort consultants
  const filteredConsultants = CONSULTANTS.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "all" || c.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  }).sort((a, b) => {
    if (sortBy === "rating") {
      return parseFloat(b.rating) - parseFloat(a.rating);
    } else if (sortBy === "price") {
      const priceA = parseInt(a.price.replace(/\D/g, ""));
      const priceB = parseInt(b.price.replace(/\D/g, ""));
      return priceA - priceB;
    } else {
      const expA = parseInt(a.experience.replace(/\D/g, ""));
      const expB = parseInt(b.experience.replace(/\D/g, ""));
      return expB - expA;
    }
  });

  const specialties = Array.from(new Set(CONSULTANTS.map((c) => c.specialty)));

  // If chat page is shown, render the chat component
  if (showChatPage && selectedConsultant) {
    return <ConsultantChatPage consultant={selectedConsultant} onBack={closeChat} />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* HERO */}
      <header ref={heroRef} className="relative overflow-visible py-20 px-6 sm:px-8 lg:px-16">
        {/* background orbs & shapes */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <motion.div
            style={{ translateX: tX, translateY: tY }}
            className="absolute -right-24 -top-28 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-orange-300/40 via-amber-200/25 to-transparent blur-3xl"
            aria-hidden
          />
          <motion.div
            style={{ translateX: useTransform(mvX, (v) => `${-v * 8}px`), translateY: useTransform(mvY, (v) => `${-v * 6}px`) }}
            className="absolute -left-28 -bottom-36 w-[24rem] h-[24rem] rounded-full bg-gradient-to-tr from-sky-300/20 via-indigo-200/18 to-transparent blur-3xl"
            aria-hidden
          />
          <motion.div
            animate={{ rotate: [0, 12, 0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
            className="absolute top-8 right-1/3 w-16 h-16 rounded-lg border-4 border-orange-200/30 blur-sm"
            aria-hidden
          />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          {/* left */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Tumbuhkan Bisnis{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600">
                dengan Konsultan
              </span>{" "}
              Ahli Terpercaya
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl">
              Dapatkan strategi, pendampingan, dan eksekusi yang langsung bisa dipraktikkan. Fokus ke omzet — sisanya
              kami bantu.
            </p>

            {/* stats */}
            <div className="flex gap-3 mt-2">
              <div className="rounded-2xl bg-white shadow-md p-3 min-w-[140px] flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-orange-700">
                  <Users size={18} />
                </div>
                <div>
                  <div className="text-lg font-extrabold">78+</div>
                  <div className="text-xs text-slate-500">Konsultan Ahli</div>
                </div>
              </div>

              <div className="rounded-2xl bg-white shadow-md p-3 min-w-[140px] flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center text-amber-700">
                  <Award size={18} />
                </div>
                <div>
                  <div className="text-lg font-extrabold">108+</div>
                  <div className="text-xs text-slate-500">UMKM Sukses</div>
                </div>
              </div>

              <div className="rounded-2xl bg-white shadow-md p-3 min-w-[140px] flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center text-white">
                  <Target size={18} />
                </div>
                <div>
                  <div className="text-lg font-extrabold">169+</div>
                  <div className="text-xs text-slate-500">Sesi Konsultasi</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => {
                  const el = document.getElementById("consultants");
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold px-5 py-3 rounded-2xl shadow-lg hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-orange-200"
              >
                <Calendar className="w-5 h-5" />
                Jadwalkan Konsultasi
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("services");
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="inline-flex items-center gap-3 border border-orange-100 text-orange-600 px-4 py-3 rounded-2xl font-semibold hover:bg-orange-50 focus:outline-none"
              >
                Lihat Layanan
              </button>
            </div>

            {/* features */}
            <div className="flex gap-3 mt-6 flex-wrap">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700">
                      <Icon size={16} />
                    </div>
                    <div className="text-sm text-slate-700">{f.text}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* right card */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl bg-white">
              <img
                className="w-full h-72 object-cover"
                src="https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=1400&h=900&fit=crop&q=60&fm=webp&auto=format,compress"
                alt="UMKM banner"
                width={1400}
                height={900}
                sizes="(min-width: 1024px) 768px, 100vw"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Dipercaya oleh</div>
                  <div className="text-sm font-bold">500+ UMKM di seluruh Indonesia</div>
                </div>

                <div className="flex -space-x-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-orange-400 ring-2 ring-white" />
                  <div className="w-10 h-10 rounded-full bg-amber-400 ring-2 ring-white" />
                  <div className="w-10 h-10 rounded-full bg-orange-600 ring-2 ring-white" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-md">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center text-white">
                  <Store size={18} />
                </div>
                <div>
                  <div className="font-semibold">Pendampingan Usaha</div>
                  <div className="text-sm text-slate-500">Praktis, langsung terapkan di lapangan.</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-md">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-orange-700">
                  <Users size={18} />
                </div>
                <div>
                  <div className="font-semibold">Mentoring Group</div>
                  <div className="text-sm text-slate-500">Sesi batch untuk skala usaha kecil.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONSULTANTS */}
      <section id="consultants" className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Konsultan UMKM Profesional</h2>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">Pilih konsultan yang paling cocok untuk masalah Anda. Chat dulu, atau langsung booking sesi.</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari konsultan, spesialisasi, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white shadow-sm"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-orange-200 bg-white hover:bg-orange-50 transition-colors font-semibold text-slate-700"
            >
              <Filter className="w-5 h-5" />
              Filter
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-white rounded-2xl border border-orange-200 shadow-sm p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Specialty Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Spesialisasi</label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      <option value="all">Semua Spesialisasi</option>
                      {specialties.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Urutkan Berdasarkan</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      <option value="rating">Rating Tertinggi</option>
                      <option value="price">Harga Terendah</option>
                      <option value="experience">Pengalaman Terbanyak</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <div className="text-sm text-slate-600">
            Menampilkan <span className="font-semibold text-orange-600">{filteredConsultants.length}</span> dari {CONSULTANTS.length} konsultan
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConsultants.map((c) => (
            <motion.article
              key={c.id}
              layout
              whileHover={{ y: -8, boxShadow: "0 18px 40px rgba(2,6,23,0.12)" }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="relative">
                <img 
                  src={`${c.image}&fm=webp&auto=format,compress`} 
                  alt={c.name} 
                  className="w-full h-48 object-cover" 
                  width={800}
                  height={800}
                  sizes="(min-width: 1024px) 400px, 100vw"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
                <div className="absolute left-3 top-3 bg-white/90 text-orange-600 font-semibold px-3 py-1 rounded-lg shadow">
                  {c.availability}
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold cursor-pointer hover:text-orange-600 transition-colors" onClick={() => openDetail(c)}>{c.name}</h3>
                    <div className="text-xs text-slate-500">{c.specialty}</div>
                    {c.location && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <MapPin size={12} />
                        {c.location}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star size={16} className="fill-amber-500" />
                    {c.rating}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Briefcase size={12} />
                    {c.experience}
                  </div>
                  {c.responseTime && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {c.responseTime}
                    </div>
                  )}
                </div>

                {c.successRate && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp size={12} />
                      <span className="font-semibold">Success Rate: {c.successRate}</span>
                    </div>
                    {c.clientsCount && (
                      <span className="text-slate-400">• {c.clientsCount}+ klien</span>
                    )}
                  </div>
                )}

                <div className="text-sm font-semibold text-orange-600">{c.price}</div>

                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => openChat(c)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:brightness-95 transition-all shadow-md hover:shadow-lg"
                    aria-label={`Chat ${c.name}`}
                  >
                    <MessageCircle size={16} />
                    Chat
                  </button>

                  <button
                    onClick={() => openDetail(c)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-orange-200 text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
                  >
                    <BookOpen size={16} />
                    Detail
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-orange-50/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Layanan Kami</h2>
            <p className="text-slate-600 mt-2 max-w-2xl mx-auto">Solusi lengkap untuk membantu UMKM berkembang dan bersaing di era digital</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -6 }} className="bg-white rounded-2xl p-6 shadow">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-300 to-orange-400 text-white mb-4">
                <Store size={20} />
              </div>
              <h3 className="font-bold text-lg">Manajemen Usaha</h3>
              <p className="text-slate-600 mt-2">Pelatihan keuangan, stok, dan operasional harian yang mudah dipahami.</p>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} className="bg-white rounded-2xl p-6 shadow">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-200 to-amber-300 text-orange-700 mb-4">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-lg">Pemasaran Digital</h3>
              <p className="text-slate-600 mt-2">Strategi promosi online melalui sosmed dan marketplace yang hemat biaya.</p>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} className="bg-white rounded-2xl p-6 shadow">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-300 to-orange-400 text-white mb-4">
                <Award size={20} />
              </div>
              <h3 className="font-bold text-lg">Pengembangan Bisnis</h3>
              <p className="text-slate-600 mt-2">Konsultasi ekspansi produk dan strategi pertumbuhan jangka panjang.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedConsultant && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetail}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 z-50 overflow-y-auto"
            >
              <div className="min-h-full flex items-center justify-center p-4">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                >
                  {/* Header */}
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600" />
                    <button
                      onClick={closeDetail}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-colors"
                    >
                      <X size={20} className="text-slate-700" />
                    </button>
                    <div className="absolute -bottom-16 left-8">
                      <img
                        src={selectedConsultant.image}
                        alt={selectedConsultant.name}
                        className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-20 px-8 pb-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedConsultant.name}</h2>
                        <p className="text-lg text-slate-600 mb-3">{selectedConsultant.specialty}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          {selectedConsultant.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />
                              {selectedConsultant.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Star size={16} className="fill-amber-500" />
                            {selectedConsultant.rating} Rating
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
                          <Heart size={20} className="text-slate-600" />
                        </button>
                        <button className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
                          <Share2 size={20} className="text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-orange-50 rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">{selectedConsultant.experience}</div>
                        <div className="text-xs text-slate-600">Pengalaman</div>
                      </div>
                      {selectedConsultant.clientsCount && (
                        <div className="bg-amber-50 rounded-2xl p-4 text-center">
                          <div className="text-2xl font-bold text-amber-600 mb-1">{selectedConsultant.clientsCount}+</div>
                          <div className="text-xs text-slate-600">Klien</div>
                        </div>
                      )}
                      {selectedConsultant.successRate && (
                        <div className="bg-green-50 rounded-2xl p-4 text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">{selectedConsultant.successRate}</div>
                          <div className="text-xs text-slate-600">Success Rate</div>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {selectedConsultant.bio && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Tentang</h3>
                        <p className="text-slate-600 leading-relaxed">{selectedConsultant.bio}</p>
                      </div>
                    )}

                    {/* Education & Certifications */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {selectedConsultant.education && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <GraduationCap size={20} className="text-orange-600" />
                            Pendidikan
                          </h3>
                          <p className="text-slate-600">{selectedConsultant.education}</p>
                        </div>
                      )}
                      {selectedConsultant.certifications && selectedConsultant.certifications.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Award size={20} className="text-orange-600" />
                            Sertifikasi
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedConsultant.certifications.map((cert, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold"
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Specialties */}
                    {selectedConsultant.specialties && selectedConsultant.specialties.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Keahlian Khusus</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedConsultant.specialties.map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {selectedConsultant.languages && selectedConsultant.languages.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Bahasa</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedConsultant.languages.map((lang, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-slate-200">
                      <button
                        onClick={() => {
                          closeDetail();
                          openChat(selectedConsultant);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-3 rounded-2xl font-semibold hover:brightness-95 transition-all shadow-lg hover:shadow-xl"
                      >
                        <MessageCircle size={20} />
                        Mulai Chat
                      </button>
                      <button
                        onClick={() => {
                          closeDetail();
                          // Navigate to booking page
                          if (typeof window !== "undefined") {
                            window.location.href = `/consultant/booking?consultant=${selectedConsultant.id}`;
                          }
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-orange-600 text-orange-600 px-6 py-3 rounded-2xl font-semibold hover:bg-orange-50 transition-colors"
                      >
                        <Calendar size={20} />
                        Booking Sesi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== CHAT PAGE COMPONENT =====
type Message = {
  id: number;
  text: string;
  sender: "user" | "consultant";
  timestamp: Date;
  attachments?: { type: "file" | "image"; url: string; name: string }[];
  reactions?: string[];
};

type ConsultantChatPageProps = {
  consultant: Consultant;
  onBack: () => void;
};

const ConsultantChatPage: React.FC<ConsultantChatPageProps> = ({ consultant, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Halo! Saya ${consultant.name}, spesialis ${consultant.specialty}. Ceritakan singkat masalah usaha Anda.`,
      sender: "consultant",
      timestamp: new Date(Date.now() - 120000),
    },
  ]);

  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputMsg.trim()) return;

    const newM: Message = {
      id: messages.length + 1,
      text: inputMsg.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newM]);
    setInputMsg("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Terima kasih sudah berbagi. Dari informasi ini, saya bisa membantu analisis lebih lanjut. Apakah Anda ingin kita fokus ke strategi pricing dulu atau ekspansi pasar?",
          sender: "consultant",
          timestamp: new Date(),
        },
      ]);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload the file and get a URL
    const fileUrl = URL.createObjectURL(file);
    const newM: Message = {
      id: messages.length + 1,
      text: `Mengirim file: ${file.name}`,
      sender: "user",
      timestamp: new Date(),
      attachments: [{ type: file.type.startsWith("image/") ? "image" : "file", url: fileUrl, name: file.name }],
    };

    setMessages((prev) => [...prev, newM]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-orange-50 transition-colors"
              aria-label="Kembali"
            >
              <ArrowRight size={20} className="text-slate-700 rotate-180" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={consultant.image}
                  alt={consultant.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-200"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
              </div>

              <div>
                <h1 className="font-bold text-slate-900">{consultant.name}</h1>
                <p className="text-xs text-slate-500">{consultant.specialty}</p>
                {consultant.responseTime && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    Respon {consultant.responseTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-orange-50 transition-colors"
              aria-label="Panggilan suara"
              title="Panggilan Suara"
            >
              <Phone size={20} className="text-slate-600" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-orange-50 transition-colors"
              aria-label="Panggilan video"
              title="Panggilan Video"
            >
              <Video size={20} className="text-slate-600" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-orange-50 transition-colors"
              aria-label="Menu lainnya"
            >
              <MoreVertical size={20} className="text-slate-600" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          {/* Date divider */}
          <div className="flex items-center justify-center">
            <div className="bg-white px-4 py-1 rounded-full text-xs text-slate-500 shadow-sm border border-orange-100">
              Hari ini
            </div>
          </div>

          {/* Messages */}
          {messages.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} group`}
            >
              <div className="flex flex-col max-w-[70%] sm:max-w-md">
                <div
                  className={`${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-2xl rounded-tr-sm"
                      : "bg-white text-slate-900 rounded-2xl rounded-tl-sm shadow-sm border border-orange-100"
                  } px-4 py-3 relative`}
                >
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {m.attachments.map((att, attIdx) => (
                        <div key={attIdx} className="rounded-xl overflow-hidden">
                          {att.type === "image" ? (
                            <img src={att.url} alt={att.name} className="max-w-full h-auto rounded-lg" />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg">
                              <FileText size={16} className="text-slate-600" />
                              <span className="text-xs text-slate-700 truncate">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div
                      className={`text-xs ${
                        m.sender === "user" ? "text-orange-100" : "text-slate-400"
                      }`}
                    >
                      {m.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {m.sender === "consultant" && (
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 hover:text-orange-600">
                        Reaksi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-orange-100 px-4 py-3">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-2 h-2 bg-slate-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-2 h-2 bg-slate-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-2 h-2 bg-slate-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-t border-orange-100 shadow-lg sticky bottom-0"
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {["Tentang pricing", "Strategi marketing", "Ekspansi bisnis", "Manajemen keuangan"].map(
                (reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMsg(reply)}
                    className="flex-shrink-0 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-sm text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition-colors font-medium"
                  >
                    {reply}
                  </button>
                )
              )}
            </div>
          )}

          <div className="flex items-end gap-3">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl hover:bg-orange-50 transition-colors"
              aria-label="Lampiran"
              title="Kirim File"
            >
              <Paperclip size={20} className="text-slate-600" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={inputMsg}
                onChange={(e) => {
                  setInputMsg(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ketik pesan Anda..."
                rows={1}
                className="w-full resize-none rounded-2xl border border-orange-200 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-orange-50/30"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-2 bottom-2 p-2 rounded-xl hover:bg-orange-100 transition-colors"
                aria-label="Emoji"
                title="Emoji"
              >
                <Smile size={20} className="text-slate-500" />
              </button>
            </div>

            <button
              onClick={sendMessage}
              disabled={!inputMsg.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              aria-label="Kirim pesan"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default ConsultantHomePage;