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
  X,
  Phone,
  Video,
  FileText,
  TrendingUp,
  Briefcase,
  GraduationCap,
  ChevronDown,
  Heart,
  Share2,
  BookOpen,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Crown,
  Zap,
  BarChart3,
  PieChart,
} from "lucide-react";

// --- TYPES AND DATA ---
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
  membership?: string;
  performance?: {
    satisfaction: number;
    response: number;
    completion: number;
  };
};

const CONSULTANTS: Consultant[] = [
  {
    id: 1,
    name: "Dr. Budi Santoso",
    specialty: "Manajemen Keuangan UMKM",
    experience: "15 tahun",
    rating: "4.9",
    price: "Rp 150.000/sesi",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&q=60",
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
    membership: "Premium",
    performance: {
      satisfaction: 94,
      response: 98,
      completion: 96
    }
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    specialty: "Digital Marketing & Branding",
    experience: "10 tahun",
    rating: "4.8",
    price: "Rp 120.000/sesi",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&q=60",
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
    membership: "Pro",
    performance: {
      satisfaction: 91,
      response: 99,
      completion: 93
    }
  },
  {
    id: 3,
    name: "Ahmad Wijaya",
    specialty: "Strategi Bisnis & Ekspansi",
    experience: "12 tahun",
    rating: "4.9",
    price: "Rp 180.000/sesi",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&q=60",
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
    membership: "Premium",
    performance: {
      satisfaction: 96,
      response: 95,
      completion: 97
    }
  },
  {
    id: 4,
    name: "Dewi Lestari",
    specialty: "Legalitas & Perizinan UMKM",
    experience: "8 tahun",
    rating: "4.7",
    price: "Rp 100.000/sesi",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&q=60",
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
    membership: "Basic",
    performance: {
      satisfaction: 89,
      response: 92,
      completion: 88
    }
  },
  {
    id: 5,
    name: "Rizki Pratama",
    specialty: "E-commerce & Marketplace",
    experience: "7 tahun",
    rating: "4.8",
    price: "Rp 130.000/sesi",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=60",
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
    membership: "Pro",
    performance: {
      satisfaction: 92,
      response: 97,
      completion: 94
    }
  },
  {
    id: 6,
    name: "Nina Kurnia",
    specialty: "Manajemen Operasional",
    experience: "11 tahun",
    rating: "4.9",
    price: "Rp 140.000/sesi",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&h=300&fit=crop&q=60",
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
    membership: "Premium",
    performance: {
      satisfaction: 93,
      response: 96,
      completion: 95
    }
  },
];

const features = [
  { icon: Users, text: "Pendampingan 1-on-1 yang praktis" },
  { icon: Award, text: "Metode terbukti untuk UMKM" },
  { icon: Target, text: "Fokus pada omzet & distribusi" },
];

// Performance Chart Component
const PerformanceChart: React.FC<{ data: Consultant['performance'] }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-slate-600">Kepuasan</span>
        <span className="font-semibold text-green-600">{data.satisfaction}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1">
        <div 
          className="bg-green-500 h-1 rounded-full transition-all duration-500" 
          style={{ width: `${data.satisfaction}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px]">
        <span className="text-slate-600">Respons</span>
        <span className="font-semibold text-blue-600">{data.response}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1">
        <div 
          className="bg-blue-500 h-1 rounded-full transition-all duration-500" 
          style={{ width: `${data.response}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px]">
        <span className="text-slate-600">Penyelesaian</span>
        <span className="font-semibold text-purple-600">{data.completion}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1">
        <div 
          className="bg-purple-500 h-1 rounded-full transition-all duration-500" 
          style={{ width: `${data.completion}%` }}
        />
      </div>
    </div>
  );
};

const ConsultantHomePage: React.FC = () => {
  const [showChatPage, setShowChatPage] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "experience">("rating");
  const [showFilters, setShowFilters] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  // Parallax
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const tX = useTransform(mvX, (v) => `${v * 10}px`);
  const tY = useTransform(mvY, (v) => `${v * 10}px`);
  const tXNeg = useTransform(mvX, (v) => `${-v * 8}px`);
  const tYNeg = useTransform(mvY, (v) => `${-v * 6}px`);

  useEffect(() => {
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

  // Filter and sort
  const filteredConsultants = CONSULTANTS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "all" || c.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  }).sort((a, b) => {
    if (sortBy === "rating") return parseFloat(b.rating) - parseFloat(a.rating);
    const expA = parseInt(a.experience.replace(/\D/g, ""));
    const expB = parseInt(b.experience.replace(/\D/g, ""));
    return expB - expA;
  });

  const specialties = Array.from(new Set(CONSULTANTS.map((c) => c.specialty)));

  if (showChatPage && selectedConsultant) {
    return <ConsultantChatPage consultant={selectedConsultant} onBack={closeChat} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 text-slate-900 antialiased">
      {/* HERO */}
      <header ref={heroRef} className="relative overflow-hidden py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-12">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <motion.div
            style={{ translateX: tX, translateY: tY }}
            className="absolute -right-12 sm:-right-20 -top-16 sm:-top-24 w-48 h-48 sm:w-80 sm:h-80 lg:w-[28rem] lg:h-[28rem] rounded-full bg-gradient-to-br from-orange-300/30 via-amber-200/20 to-transparent blur-3xl"
            aria-hidden
          />
          <motion.div
            style={{ translateX: tXNeg, translateY: tYNeg }}
            className="absolute -left-12 sm:-left-20 -bottom-20 sm:-bottom-32 w-40 h-40 sm:w-72 sm:h-72 lg:w-[24rem] lg:h-[24rem] rounded-full bg-gradient-to-tr from-sky-300/15 via-indigo-200/12 to-transparent blur-3xl"
            aria-hidden
          />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Tumbuhkan Bisnis{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600">
                dengan Konsultan
              </span>{" "}
              Ahli Terpercaya
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl">
              Dapatkan strategi, pendampingan, dan eksekusi yang langsung bisa dipraktikkan. Fokus ke omzet — sisanya kami bantu.
            </p>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2">
              <div className="rounded-xl sm:rounded-2xl bg-white shadow-sm sm:shadow-md p-2.5 sm:p-3 min-w-[120px] sm:min-w-[140px] flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-orange-700">
                  <Users size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-extrabold">78+</div>
                  <div className="text-[10px] sm:text-xs text-slate-500">Konsultan Ahli</div>
                </div>
              </div>

              <div className="rounded-xl sm:rounded-2xl bg-white shadow-sm sm:shadow-md p-2.5 sm:p-3 min-w-[120px] sm:min-w-[140px] flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center text-amber-700">
                  <Award size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-extrabold">108+</div>
                  <div className="text-[10px] sm:text-xs text-slate-500">UMKM Sukses</div>
                </div>
              </div>

              <div className="rounded-xl sm:rounded-2xl bg-white shadow-sm sm:shadow-md p-2.5 sm:p-3 min-w-[120px] sm:min-w-[140px] flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center text-white">
                  <Target size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-extrabold">169+</div>
                  <div className="text-[10px] sm:text-xs text-slate-500">Sesi Konsultasi</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
              <button
                onClick={() => {
                  document.getElementById("consultants")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Jadwalkan Konsultasi
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => {
                  document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="inline-flex items-center justify-center gap-2 border border-orange-200 text-orange-600 text-sm sm:text-base px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-orange-50 focus:outline-none transition-colors"
              >
                Lihat Layanan
              </button>
            </div>

            {/* Features */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-4 sm:mt-6">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-sm"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-md sm:rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700">
                      <Icon size={14} className="sm:w-4 sm:h-4" />
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700">{f.text}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right card */}
          <div className="relative mt-6 lg:mt-0">
            <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl bg-white">
              <img
                className="w-full h-48 sm:h-56 lg:h-72 object-cover"
                src="https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=1400&h=900&fit=crop&q=60"
                alt="UMKM banner"
                loading="lazy"
              />
              <div className="p-3 sm:p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] sm:text-xs text-slate-500">Dipercaya oleh</div>
                  <div className="text-xs sm:text-sm font-bold">500+ UMKM di Indonesia</div>
                </div>
                <div className="flex -space-x-2 sm:-space-x-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-orange-400 ring-2 ring-white" />
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-amber-400 ring-2 ring-white" />
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-orange-600 ring-2 ring-white" />
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 grid grid-cols-1 gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-sm sm:shadow-md">
                <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center text-white">
                  <Store size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm sm:text-base">Pendampingan Usaha</div>
                  <div className="text-xs sm:text-sm text-slate-500">Praktis, langsung terapkan di lapangan.</div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-sm sm:shadow-md">
                <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-orange-700">
                  <Users size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm sm:text-base">Mentoring Group</div>
                  <div className="text-xs sm:text-sm text-slate-500">Sesi batch untuk skala usaha kecil.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONSULTANTS */}
      <section id="consultants" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold">Konsultan UMKM Profesional</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl mx-auto">
            Pilih konsultan yang paling cocok untuk masalah Anda. Chat dulu, atau langsung booking sesi.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Cari konsultan, spesialisasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl border border-orange-200 focus:outline-none focus:ring-1 focus:ring-orange-300 bg-white shadow-sm"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl border border-orange-200 bg-white hover:bg-orange-50 transition-colors font-semibold text-slate-700"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              Filter
              <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-white rounded-lg sm:rounded-xl border border-orange-200 shadow-sm p-3 sm:p-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Spesialisasi</label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-orange-200 focus:outline-none focus:ring-1 focus:ring-orange-300"
                    >
                      <option value="all">Semua Spesialisasi</option>
                      {specialties.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Urutkan</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-orange-200 focus:outline-none focus:ring-1 focus:ring-orange-300"
                    >
                      <option value="rating">Rating Tertinggi</option>
                      <option value="experience">Pengalaman Terbanyak</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-xs text-slate-600">
            Menampilkan <span className="font-semibold text-orange-600">{filteredConsultants.length}</span> dari{" "}
            {CONSULTANTS.length} konsultan
          </div>
        </div>

        {/* Consultant Cards - SUPER COMPACT & RESPONSIVE */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5">
          {filteredConsultants.map((c) => (
            <motion.article
              key={c.id}
              layout
              whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(2,6,23,0.1)" }}
              className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col border border-orange-100"
            >
              {/* Header - Very compact */}
              <div className="relative">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-16 sm:h-18 object-cover"
                  loading="lazy"
                />
                <div className="absolute top-1 left-1">
                  <div className={`px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${
                    c.membership === 'Premium' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                    c.membership === 'Pro' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {c.membership}
                  </div>
                </div>
              </div>

              {/* Content - Super compact */}
              <div className="p-1.5 sm:p-2 flex flex-col gap-1 sm:gap-1.5 flex-1">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-[10px] sm:text-xs font-bold cursor-pointer hover:text-orange-600 transition-colors truncate leading-tight"
                      onClick={() => openDetail(c)}
                    >
                      {c.name}
                    </h3>
                    <div className="text-[8px] sm:text-[10px] text-slate-500 truncate mt-0.5">{c.specialty}</div>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px] flex-shrink-0">
                    <Star size={8} className="fill-amber-500" />
                    {c.rating}
                  </div>
                </div>

                {/* Location */}
                {c.location && (
                  <div className="flex items-center gap-0.5 text-[8px] text-slate-400">
                    <MapPin size={8} />
                    <span className="truncate">{c.location}</span>
                  </div>
                )}

                {/* Performance Chart - Compact */}
                {c.performance && (
                  <div className="mt-0.5">
                    <PerformanceChart data={c.performance} />
                  </div>
                )}

                {/* Stats - Very compact */}
                <div className="flex items-center justify-between text-[8px] text-slate-500 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <Briefcase size={8} />
                    <span>{c.experience}</span>
                  </div>
                  {c.responseTime && (
                    <div className="flex items-center gap-0.5">
                      <Clock size={8} />
                      <span>{c.responseTime}</span>
                    </div>
                  )}
                </div>

                {/* Buttons - Super compact */}
                <div className="mt-1 flex gap-1">
                  <button
                    onClick={() => openChat(c)}
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[8px] px-1.5 py-1 rounded-md font-semibold hover:brightness-95 transition-all shadow-sm"
                  >
                    <MessageCircle size={8} />
                    Chat
                  </button>

                  <button
                    onClick={() => openDetail(c)}
                    className="inline-flex items-center justify-center gap-1 px-1.5 py-1 text-[8px] rounded-md border border-orange-200 text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
                  >
                    <BookOpen size={8} />
                    Detail
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-gradient-to-br from-orange-50/40 to-amber-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold">Layanan Kami</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl mx-auto">
              Solusi lengkap untuk membantu UMKM berkembang dan bersaing di era digital
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <motion.div whileHover={{ y: -2 }} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-300 to-orange-400 text-white mb-2 sm:mb-3">
                <Store size={14} className="sm:w-4 sm:h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base">Manajemen Usaha</h3>
              <p className="text-xs text-slate-600 mt-1">
                Pelatihan keuangan, stok, dan operasional harian yang mudah dipahami.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-200 to-amber-300 text-orange-700 mb-2 sm:mb-3">
                <Users size={14} className="sm:w-4 sm:h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base">Pemasaran Digital</h3>
              <p className="text-xs text-slate-600 mt-1">
                Strategi promosi online melalui sosmed dan marketplace yang hemat biaya.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-300 to-orange-400 text-white mb-2 sm:mb-3">
                <Award size={14} className="sm:w-4 sm:h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base">Pengembangan Bisnis</h3>
              <p className="text-xs text-slate-600 mt-1">
                Konsultasi ekspansi produk dan strategi pertumbuhan jangka panjang.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detail Modal - COMPACT */}
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-1 sm:inset-2 md:inset-4 lg:inset-8 z-50 overflow-y-auto"
            >
              <div className="min-h-full flex items-center justify-center p-1">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto"
                >
                  {/* Header - Compact */}
                  <div className="relative">
                    <div className="h-20 sm:h-24 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600" />
                    <button
                      onClick={closeDetail}
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-lg transition-colors"
                    >
                      <X size={12} className="sm:w-3.5 sm:h-3.5 text-slate-700" />
                    </button>
                    <div className="absolute -bottom-6 sm:-bottom-8 left-3 sm:left-4">
                      <img
                        src={selectedConsultant.image}
                        alt={selectedConsultant.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover border-2 sm:border-3 border-white shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Content - Compact */}
                  <div className="pt-8 sm:pt-10 px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                            selectedConsultant.membership === 'Premium' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                            selectedConsultant.membership === 'Pro' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' :
                            'bg-slate-600 text-white'
                          }`}>
                            {selectedConsultant.membership} Membership
                          </div>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 truncate">
                          {selectedConsultant.name}
                        </h2>
                        <p className="text-sm text-slate-600 mb-2">
                          {selectedConsultant.specialty}
                        </p>
                        
                        {/* Compact badges */}
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold">
                            <Star size={10} className="fill-amber-500" />
                            {selectedConsultant.rating}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                            <Briefcase size={10} />
                            {selectedConsultant.experience}
                          </span>
                          {selectedConsultant.responseTime && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px]">
                              <Clock size={10} />
                              {selectedConsultant.responseTime}
                            </span>
                          )}
                          {selectedConsultant.location && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                              <MapPin size={10} />
                              {selectedConsultant.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1 rounded-lg hover:bg-orange-50 transition-colors">
                          <Heart size={14} className="text-slate-600" />
                        </button>
                        <button className="p-1 rounded-lg hover:bg-orange-50 transition-colors">
                          <Share2 size={14} className="text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {/* Performance Chart */}
                    {selectedConsultant.performance && (
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                          <BarChart3 size={14} className="text-orange-600" />
                          Performance
                        </h3>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <PerformanceChart data={selectedConsultant.performance} />
                        </div>
                      </div>
                    )}

                    {/* Stats - Compact */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <div className="bg-orange-50 rounded-lg p-2 text-center">
                        <div className="text-sm sm:text-base font-bold text-orange-600 mb-0.5">
                          {selectedConsultant.experience}
                        </div>
                        <div className="text-[8px] sm:text-[10px] text-slate-600">Pengalaman</div>
                      </div>
                      {selectedConsultant.clientsCount && (
                        <div className="bg-amber-50 rounded-lg p-2 text-center">
                          <div className="text-sm sm:text-base font-bold text-amber-600 mb-0.5">
                            {selectedConsultant.clientsCount}+
                          </div>
                          <div className="text-[8px] sm:text-[10px] text-slate-600">Klien</div>
                        </div>
                      )}
                      {selectedConsultant.successRate && (
                        <div className="bg-green-50 rounded-lg p-2 text-center">
                          <div className="text-sm sm:text-base font-bold text-green-600 mb-0.5">
                            {selectedConsultant.successRate}
                          </div>
                          <div className="text-[8px] sm:text-[10px] text-slate-600">Success Rate</div>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {selectedConsultant.bio && (
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-1.5">Tentang</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {selectedConsultant.bio}
                        </p>
                      </div>
                    )}

                    {/* Education & Certifications */}
                    <div className="grid md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                      {selectedConsultant.education && (
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                            <GraduationCap size={14} className="text-orange-600" />
                            Pendidikan
                          </h3>
                          <p className="text-xs text-slate-600">{selectedConsultant.education}</p>
                        </div>
                      )}
                      {selectedConsultant.certifications && selectedConsultant.certifications.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                            <Award size={14} className="text-orange-600" />
                            Sertifikasi
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {selectedConsultant.certifications.map((cert, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-semibold"
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
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                          Keahlian Khusus
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedConsultant.specialties.map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {selectedConsultant.languages && selectedConsultant.languages.length > 0 && (
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-1.5">Bahasa</h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedConsultant.languages.map((lang, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-medium"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons - Compact */}
                    <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => {
                          closeDetail();
                          openChat(selectedConsultant);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-sm px-3 py-2 rounded-lg font-semibold hover:brightness-95 transition-all shadow-md"
                      >
                        <MessageCircle size={14} />
                        Mulai Chat
                      </button>
                      <button
                        onClick={() => {
                          const id = selectedConsultant.id;
                          closeDetail();
                          if (typeof window !== 'undefined') {
                            window.location.href = `/ConsultantBooking?consultant=${id}`;
                          }
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 border border-orange-600 text-orange-600 text-sm px-3 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                      >
                        <Calendar size={14} />
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

// Chat Page Component (tetap sama seperti sebelumnya)
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white flex flex-col">
      {/* Header - Compact */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10"
      >
        <div className="max-w-5xl mx-auto px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <button
              onClick={onBack}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-orange-50 transition-colors flex-shrink-0"
              aria-label="Kembali"
            >
              <ArrowRight size={14} className="sm:w-4 sm:h-4 text-slate-700 rotate-180" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={consultant.image}
                  alt={consultant.name}
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-orange-200"
                />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full ring-1 ring-white" />
              </div>

              <div className="min-w-0">
                <h1 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{consultant.name}</h1>
                <p className="text-[8px] sm:text-[10px] text-slate-500 truncate">{consultant.specialty}</p>
                {consultant.responseTime && (
                  <p className="text-[8px] sm:text-[10px] text-green-600 flex items-center gap-0.5 mt-0.5">
                    <Clock size={8} className="sm:w-2 sm:h-2" />
                    Respon {consultant.responseTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="p-1 sm:p-1.5 rounded-lg hover:bg-orange-50 transition-colors" title="Panggilan Suara">
              <Phone size={14} className="sm:w-4 sm:h-4 text-slate-600" />
            </button>
            <button className="p-1 sm:p-1.5 rounded-lg hover:bg-orange-50 transition-colors" title="Panggilan Video">
              <Video size={14} className="sm:w-4 sm:h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Chat Messages - Compact */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-2 sm:px-3 py-2 sm:py-3 space-y-2 sm:space-y-3">
          {/* Date divider */}
          <div className="flex items-center justify-center">
            <div className="bg-white px-2 sm:px-3 py-0.5 rounded-full text-[8px] sm:text-[10px] text-slate-500 shadow-sm border border-orange-100">
              Hari ini
            </div>
          </div>

          {/* Messages */}
          {messages.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} group`}
            >
              <div className="flex flex-col max-w-[90%] sm:max-w-[80%]">
                <div
                  className={`${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl rounded-tr-sm"
                      : "bg-white text-slate-900 rounded-xl rounded-tl-sm shadow-sm border border-orange-100"
                  } px-2.5 sm:px-3 py-1.5 sm:py-2 relative`}
                >
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="mb-1.5 space-y-1.5">
                      {m.attachments.map((att, attIdx) => (
                        <div key={attIdx} className="rounded-lg overflow-hidden">
                          {att.type === "image" ? (
                            <img src={att.url} alt={att.name} className="max-w-full h-auto rounded-lg" />
                          ) : (
                            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-lg">
                              <FileText size={12} className="sm:w-3 sm:h-3 text-slate-600" />
                              <span className="text-[8px] sm:text-[10px] text-slate-700 truncate">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs sm:text-sm leading-relaxed">{m.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div
                      className={`text-[8px] sm:text-[10px] ${
                        m.sender === "user" ? "text-orange-100" : "text-slate-400"
                      }`}
                    >
                      {m.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white rounded-xl rounded-tl-sm shadow-sm border border-orange-100 px-2.5 sm:px-3 py-1.5 sm:py-2">
                <div className="flex gap-0.5">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-slate-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-slate-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-slate-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area - Compact */}
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-t border-orange-100 shadow-lg sticky bottom-0"
      >
        <div className="max-w-5xl mx-auto px-2 sm:px-3 py-1.5 sm:py-2">
          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="flex gap-1 mb-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
              {["Tentang pricing", "Strategi marketing", "Ekspansi bisnis"].map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMsg(reply)}
                  className="flex-shrink-0 px-2 py-1 rounded-full bg-orange-50 border border-orange-200 text-[8px] sm:text-[10px] text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition-colors font-medium whitespace-nowrap"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-1 sm:gap-1.5">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-orange-50 transition-colors flex-shrink-0"
              title="Kirim File"
            >
              <Paperclip size={14} className="sm:w-4 sm:h-4 text-slate-600" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={inputMsg}
                onChange={(e) => {
                  setInputMsg(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ketik pesan Anda..."
                rows={1}
                className="w-full resize-none rounded-lg sm:rounded-xl border border-orange-200 px-2.5 sm:px-3 py-1.5 sm:py-2 pr-8 sm:pr-10 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-orange-300 focus:border-transparent bg-orange-50/30"
                style={{ minHeight: "36px", maxHeight: "80px" }}
              />
              <button
                onClick={() => {}}
                className="absolute right-1 bottom-1 p-1 rounded hover:bg-orange-100 transition-colors"
                title="Emoji"
              >
                <Smile size={12} className="sm:w-3.5 sm:h-3.5 text-slate-500" />
              </button>
            </div>

            <button
              onClick={sendMessage}
              disabled={!inputMsg.trim()}
              className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex-shrink-0"
              aria-label="Kirim pesan"
            >
              <Send size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default ConsultantHomePage;