import React, { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, MoreVertical, Phone, Video, Paperclip, Smile, Send, Star, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { trackConsultantChat } from "@/lib/activity-tracker";

type Consultant = {
  id: number;
  name: string;
  specialty: string;
  rating?: number;
  responseTime?: string;
  avatar?: string;
};

const SAMPLE_CONSULTANTS: Consultant[] = [
  { id: 1, name: "Dr. Budi Santoso", specialty: "Manajemen Keuangan UMKM", rating: 4.9, responseTime: "< 2 jam", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&q=60" },
  { id: 2, name: "Siti Nurhaliza", specialty: "Digital Marketing & Branding", rating: 4.8, responseTime: "< 1 jam", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&q=60" },
];

type Message = {
  id: string;
  text: string;
  sender: "user" | "consultant";
  timestamp: Date;
  isAI?: boolean;
};

function useConsultantFromQuery() {
  const [id, setId] = useState<number>(1);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const c = Number(params.get("consultant"));
      setId(Number.isFinite(c) && c > 0 ? c : 1);
    }
  }, []);
  return useMemo(() => SAMPLE_CONSULTANTS.find((x) => x.id === id) ?? SAMPLE_CONSULTANTS[0], [id]);
}

export default function ConsultantChatPage() {
  const consultant = useConsultantFromQuery();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Track consultant chat activity when chat is opened
  useEffect(() => {
    if (!currentUser || !consultant) return;

    // Track consultant chat activity
    const trackActivity = async () => {
      try {
        console.log('Tracking consultant chat activity:', { consultantId: consultant.id, consultantName: consultant.name });
        await trackConsultantChat({
          id: consultant.id,
          name: consultant.name,
          avatar: consultant.avatar
        }, currentUser.uid);
        console.log('Consultant chat activity tracked successfully');
      } catch (error) {
        console.warn('Failed to track consultant chat activity:', error);
      }
    };

    trackActivity();
  }, [currentUser, consultant]);

  // Load messages from Firebase
  useEffect(() => {
    if (!currentUser || !consultant) return;

    const chatRef = collection(db, "users", currentUser.uid, "consultant_chats", String(consultant.id), "messages");
    const q = query(chatRef, orderBy("timestamp", "asc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      
      if (snapshot.empty) {
        // First message from consultant
        const welcomeMsg: Message = {
          id: `welcome-${Date.now()}`,
          text: `Halo! Saya ${consultant.name}, ${consultant.specialty}. Bagaimana saya bisa membantu Anda hari ini? Ceritakan tantangan atau pertanyaan Anda.`,
          sender: "consultant",
          timestamp: new Date(),
          isAI: false
        };
        loadedMessages.push(welcomeMsg);
      } else {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          loadedMessages.push({
            id: doc.id,
            text: data.text || "",
            sender: data.sender || "consultant",
            timestamp: data.timestamp?.toDate() || new Date(),
            isAI: data.isAI || false
          });
        });
      }
      
      setMessages(loadedMessages);
    }, (error) => {
      console.error("Error loading messages:", error);
      // Fallback welcome message
      setMessages([{
        id: `welcome-${Date.now()}`,
        text: `Halo! Saya ${consultant.name}, ${consultant.specialty}. Bagaimana saya bisa membantu Anda hari ini?`,
        sender: "consultant",
        timestamp: new Date(),
        isAI: false
      }]);
    });

    return () => unsubscribe();
  }, [currentUser, consultant]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dummy responses based on keywords
  const getDummyResponse = (userMessage: string, consultantSpecialty: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Financial/Keuangan responses
    if (consultantSpecialty.includes("Keuangan") || consultantSpecialty.includes("Financial")) {
      if (lowerMessage.includes("modal") || lowerMessage.includes("dana") || lowerMessage.includes("uang")) {
        return "Untuk masalah modal, saya sarankan beberapa opsi:\n\n1. Mulai dengan modal kecil dan kembangkan secara bertahap\n2. Manfaatkan program KUR (Kredit Usaha Rakyat) dari bank\n3. Pertimbangkan investor atau partner bisnis\n4. Gunakan crowdfunding atau pinjaman peer-to-peer\n\nApakah Anda sudah memiliki rencana bisnis yang jelas?";
      }
      if (lowerMessage.includes("laba") || lowerMessage.includes("profit") || lowerMessage.includes("untung")) {
        return "Untuk meningkatkan laba, fokus pada:\n\n1. Analisis biaya operasional dan cari cara efisiensi\n2. Tingkatkan harga jual dengan value proposition yang kuat\n3. Perluas pasar atau tambah produk/jasa yang menguntungkan\n4. Kurangi biaya tidak perlu dan optimalkan inventory\n\nBisakah Anda share lebih detail tentang struktur biaya saat ini?";
      }
      if (lowerMessage.includes("cashflow") || lowerMessage.includes("arus kas") || lowerMessage.includes("cash flow")) {
        return "Manajemen cashflow yang baik sangat penting:\n\n1. Buat proyeksi cashflow bulanan\n2. Pisahkan rekening bisnis dan pribadi\n3. Atur terms pembayaran dengan supplier dan customer\n4. Siapkan dana darurat minimal 3 bulan operasional\n5. Gunakan software akuntansi sederhana untuk tracking\n\nApakah Anda sudah punya sistem pencatatan keuangan?";
      }
    }
    
    // Marketing responses
    if (consultantSpecialty.includes("Marketing") || consultantSpecialty.includes("Branding")) {
      if (lowerMessage.includes("promosi") || lowerMessage.includes("iklan") || lowerMessage.includes("marketing")) {
        return "Strategi marketing yang efektif untuk UMKM:\n\n1. Manfaatkan media sosial (Instagram, TikTok, Facebook)\n2. Buat konten yang menarik dan konsisten\n3. Gunakan influencer lokal atau micro-influencer\n4. Ikut event atau bazaar lokal\n5. Program referral untuk customer existing\n\nPlatform mana yang paling cocok untuk target market Anda?";
      }
      if (lowerMessage.includes("brand") || lowerMessage.includes("merek") || lowerMessage.includes("branding")) {
        return "Membangun brand yang kuat:\n\n1. Tentukan positioning yang jelas dan unik\n2. Buat logo dan visual identity yang konsisten\n3. Ceritakan story yang autentik tentang bisnis Anda\n4. Fokus pada customer experience yang memorable\n5. Gunakan packaging yang menarik dan branded\n\nApa yang membuat produk/jasa Anda berbeda dari kompetitor?";
      }
      if (lowerMessage.includes("customer") || lowerMessage.includes("pelanggan") || lowerMessage.includes("pembeli")) {
        return "Strategi menarik dan mempertahankan customer:\n\n1. Pahami kebutuhan dan pain point target market\n2. Berikan value yang lebih dari yang mereka bayar\n3. Bangun relationship melalui komunikasi yang personal\n4. Program loyalty atau membership\n5. Respons cepat terhadap feedback dan komplain\n\nSiapa target customer utama Anda saat ini?";
      }
    }
    
    // General responses
    if (lowerMessage.includes("halo") || lowerMessage.includes("hai") || lowerMessage.includes("hello")) {
      return `Halo! Senang berkenalan dengan Anda. Saya ${consultant.name}, siap membantu mengembangkan bisnis UMKM Anda. Ceritakan lebih lanjut tentang bisnis atau tantangan yang sedang Anda hadapi.`;
    }
    if (lowerMessage.includes("terima kasih") || lowerMessage.includes("thanks") || lowerMessage.includes("makasih")) {
      return "Sama-sama! Saya senang bisa membantu. Jika ada pertanyaan lain atau butuh konsultasi lebih lanjut, jangan ragu untuk bertanya. Semoga bisnis Anda terus berkembang!";
    }
    if (lowerMessage.includes("bantuan") || lowerMessage.includes("help") || lowerMessage.includes("tolong")) {
      return `Tentu! Saya di sini untuk membantu. Sebagai ${consultantSpecialty}, saya bisa membantu dengan:\n\n1. Strategi dan perencanaan bisnis\n2. Solusi untuk masalah spesifik yang Anda hadapi\n3. Best practices dari pengalaman konsultasi sebelumnya\n4. Rekomendasi tools dan resources yang berguna\n\nApa yang paling ingin Anda diskusikan hari ini?`;
    }
    
    // Default response
    const defaultResponses = [
      `Terima kasih atas pertanyaannya. Sebagai ${consultantSpecialty}, saya akan memberikan saran yang praktis dan dapat diterapkan. Bisa ceritakan lebih detail tentang situasi atau tantangan yang sedang Anda hadapi?`,
      `Pertanyaan yang bagus! Untuk memberikan saran yang tepat, saya perlu memahami konteks lebih dalam. Apakah Anda bisa share lebih detail tentang bisnis atau masalah yang sedang dihadapi?`,
      `Saya memahami concern Anda. Mari kita breakdown masalahnya step by step. Sebagai ${consultantSpecialty}, saya akan membantu menemukan solusi yang sesuai dengan kondisi bisnis Anda.`,
      `Terima kasih sudah mempercayai saya. Untuk memberikan rekomendasi yang akurat, bisa share lebih detail tentang:\n\n1. Jenis bisnis yang dijalankan\n2. Masalah atau tantangan spesifik\n3. Target atau goal yang ingin dicapai\n\nDengan informasi ini, saya bisa memberikan saran yang lebih targeted.`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const saveMessageToFirebase = async (text: string, sender: "user" | "consultant", isAI: boolean = false) => {
    if (!currentUser || !consultant) return null;

    try {
      const chatRef = collection(db, "users", currentUser.uid, "consultant_chats", String(consultant.id), "messages");
      const docRef = await addDoc(chatRef, {
        text,
        sender,
        isAI,
        timestamp: serverTimestamp(),
        consultantId: consultant.id,
        consultantName: consultant.name
      });
      return docRef.id;
    } catch (error) {
      console.error("Error saving message:", error);
      return null;
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setIsSending(true);
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      text,
      sender: "user",
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Save user message to Firebase
    await saveMessageToFirebase(text, "user", false);

    // Simulate typing delay
    setTimeout(async () => {
      try {
        // Generate dummy response
        const dummyResponse = getDummyResponse(text, consultant.specialty);
        
        setIsTyping(false);
        
        const consultantMessage: Message = {
          id: `temp-${Date.now() + 1}`,
          text: dummyResponse,
          sender: "consultant",
          timestamp: new Date(),
          isAI: false
        };

        setMessages((prev) => [...prev, consultantMessage]);
        
        // Save consultant response to Firebase
        await saveMessageToFirebase(consultantMessage.text, "consultant", false);
      } catch (error) {
        console.error("Error generating response:", error);
        setIsTyping(false);
        const fallbackMessage: Message = {
          id: `temp-${Date.now() + 1}`,
          text: "Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi saya melalui kontak yang tersedia.",
          sender: "consultant",
          timestamp: new Date(),
          isAI: false
        };
        setMessages((prev) => [...prev, fallbackMessage]);
        await saveMessageToFirebase(fallbackMessage.text, "consultant", false);
      } finally {
        setIsSending(false);
      }
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-to-br from-blue-200/15 to-purple-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => (window.location.href = "/ConsultantPage")}
              className="p-2 rounded-xl hover:bg-orange-50 transition-colors"
              aria-label="Kembali"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="text-slate-700" />
            </motion.button>
            {consultant.avatar && (
              <motion.img
                src={consultant.avatar}
                alt={consultant.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-200"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              />
            )}
            <div>
              <div className="font-bold text-slate-900">
                {consultant.name}
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-3 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Star size={12} className="text-amber-500 fill-amber-500" /> {consultant.rating}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} /> {consultant.responseTime}
                </span>
                <span className="text-slate-500">{consultant.specialty}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              className="p-2 rounded-xl hover:bg-orange-50 transition-colors"
              title="Telepon"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Phone className="text-slate-600" size={18} />
            </motion.button>
            <motion.button
              className="p-2 rounded-xl hover:bg-orange-50 transition-colors"
              title="Video"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Video className="text-slate-600" size={18} />
            </motion.button>
            <motion.button
              className="p-2 rounded-xl hover:bg-orange-50 transition-colors"
              title="Menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreVertical className="text-slate-600" size={18} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Chat */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-orange-600" size={32} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center mb-6">
              <motion.div
                className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-slate-600 shadow-sm border border-orange-100"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {format(new Date(), "EEEE, dd MMMM yyyy")}
              </motion.div>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {m.sender === "consultant" && consultant.avatar && (
                      <img
                        src={consultant.avatar}
                        alt={consultant.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                        m.sender === "user"
                          ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white"
                          : "bg-white border border-slate-200 text-slate-900"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      <div
                        className={`mt-2 text-[10px] ${
                          m.sender === "user" ? "text-white/70" : "text-slate-500"
                        }`}
                      >
                        {format(m.timestamp, "HH:mm")}
                      </div>
                    </div>
                    {m.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {currentUser?.displayName?.[0] || currentUser?.email?.[0] || "U"}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  className="flex justify-start items-end gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {consultant.avatar && (
                    <img
                      src={consultant.avatar}
                      alt={consultant.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>
          </>
        )}
      </main>

      {/* Input */}
      <footer className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-orange-100 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl hover:bg-orange-50 transition-colors"
              title="Lampirkan"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Paperclip className="text-slate-600" size={20} />
            </motion.button>
            <input ref={fileInputRef} type="file" className="hidden" />
            <motion.button
              className="p-2.5 rounded-xl hover:bg-orange-50 transition-colors"
              title="Emoji"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Smile className="text-slate-600" size={20} />
            </motion.button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Tulis pesan..."
              disabled={isSending || isLoading}
              className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:opacity-50"
            />
            <motion.button
              onClick={sendMessage}
              disabled={isSending || isLoading || !input.trim()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSending ? 1 : 1.05 }}
              whileTap={{ scale: isSending ? 1 : 0.95 }}
            >
              {isSending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              <span>Kirim</span>
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
  );
}
