
import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  MessageCircle,
  Store,
  Users,
  Award,
  Target,
  Calendar,
  ArrowRight,
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
  const heroRef = useRef<HTMLElement | null>(null);

  // parallax: mouse position
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const tX = useTransform(mvX, (v) => `${v * 10}px`);
  const tY = useTransform(mvY, (v) => `${v * 10}px`);

  useEffect(() => {
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
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">Pilih konsultan yang paling cocok untuk masalah lu. Chat dulu, atau langsung booking sesi.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONSULTANTS.map((c) => (
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
                  <div>
                    <h3 className="text-lg font-bold">{c.name}</h3>
                    <div className="text-xs text-slate-500">{c.specialty}</div>
                  </div>
                  <div className="text-amber-500 font-bold">★ {c.rating}</div>
                </div>

                <div className="text-sm text-slate-500">{c.experience} • <span className="font-semibold text-slate-700">{c.price}</span></div>

                <div className="mt-auto flex gap-3">
                  <button
                    onClick={() => openChat(c)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:brightness-95"
                    aria-label={`Chat ${c.name}`}
                  >
                    <MessageCircle size={16} />
                    Chat Sekarang
                  </button>

                  <button
                    onClick={() => alert("Fitur booking belum aktif — coba chat dulu")}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-orange-100 text-orange-600 font-semibold"
                  >
                    Booking Sesi
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
<<<<<<< HEAD:src/Consultanthomepage/ConsultantHomePage.tsx
=======

      {/* CHAT OVERLAY */}
      {showChat && selectedConsultant && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.88 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-3">
                <img
                  src={`${selectedConsultant.image}&fm=webp&auto=format,compress`}
                  alt={selectedConsultant.name}
                  className="w-12  h-12 rounded-lg object-cover"
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
                <div>
                  <div className="font-bold">{selectedConsultant.name}</div>
                  <div className="text-sm text-slate-500">{selectedConsultant.specialty}</div>
                </div>
              </div>
              <button
                onClick={closeChat}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={messagesEndRef}
              className="p-4 flex-1 overflow-y-auto space-y-3 bg-gradient-to-b from-white to-orange-50"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[75%] px-3 py-2 rounded-lg ${
                    m.sender === "user"
                      ? "ml-auto bg-gradient-to-r from-orange-600 to-amber-500 text-white"
                      : "bg-white border border-slate-100 text-slate-900"
                  }`}
                >
                  <div className="text-sm">{m.text}</div>
                  <div className="text-xs mt-1 text-slate-400 text-right">
                    {m.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t flex items-center gap-3">
              <input
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ketik pesan..."
                className="flex-1 rounded-2xl border border-slate-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <button
                onClick={sendMessage}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-4 py-2 rounded-2xl"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
>>>>>>> refs/remotes/origin/main:Home/Consultanthomepage/ConsultantHomePage.tsx
    </div>
  );
};

// ===== CHAT PAGE COMPONENT =====
type Message = {
  id: number;
  text: string;
  sender: "user" | "consultant";
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
              </div>
            </div>
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
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] sm:max-w-md ${
                  m.sender === "user"
                    ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-2xl rounded-tr-sm"
                    : "bg-white text-slate-900 rounded-2xl rounded-tl-sm shadow-sm border border-orange-100"
                } px-4 py-3`}
              >
                <p className="text-sm leading-relaxed">{m.text}</p>
                <div
                  className={`text-xs mt-1 ${
                    m.sender === "user" ? "text-orange-100" : "text-slate-400"
                  }`}
                >
                  {m.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ketik pesan Anda..."
                rows={1}
                className="w-full resize-none rounded-2xl border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-orange-50/30"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={!inputMsg.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              aria-label="Kirim pesan"
            >
              <MessageCircle size={20} />
            </button>
          </div>

          {/* Quick replies */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {["Tentang pricing", "Strategi marketing", "Ekspansi bisnis"].map(
              (reply, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMsg(reply)}
                  className="flex-shrink-0 px-4 py-2 rounded-full bg-white border border-orange-200 text-sm text-slate-700 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                >
                  {reply}
                </button>
              )
            )}
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default ConsultantHomePage;