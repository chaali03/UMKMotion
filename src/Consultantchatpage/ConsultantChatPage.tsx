import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
} from "lucide-react";

type Message = {
  id: number;
  text: string;
  sender: "user" | "consultant";
  timestamp: Date;
};

type Consultant = {
  id: number;
  name: string;
  specialty: string;
  image: string;
  status: "online" | "offline";
};

const ConsultantChatPage: React.FC = () => {
  // Demo consultant data - in real app, this would come from props/router
  const [consultant] = useState<Consultant>({
    id: 1,
    name: "Dr. Budi Santoso",
    specialty: "Manajemen Keuangan UMKM",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=800&fit=crop&q=60",
    status: "online",
  });

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

    // Simulate consultant reply
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

  const goBack = () => {
    // In real app: navigate back to consultant list
    window.history.back();
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
              onClick={goBack}
              className="p-2 rounded-lg hover:bg-orange-50 transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft size={20} className="text-slate-700" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={consultant.image}
                  alt={consultant.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-200"
                />
                {consultant.status === "online" && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                )}
              </div>

              <div>
                <h1 className="font-bold text-slate-900">{consultant.name}</h1>
                <p className="text-xs text-slate-500">{consultant.specialty}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-orange-50 transition-colors"
              aria-label="Panggilan suara"
            >
              <Phone size={20} className="text-slate-600" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-orange-50 transition-colors"
              aria-label="Panggilan video"
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
            <button
              className="p-3 rounded-xl hover:bg-orange-50 transition-colors"
              aria-label="Lampiran"
            >
              <Paperclip size={20} className="text-slate-600" />
            </button>

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
                className="w-full resize-none rounded-2xl border border-orange-200 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-orange-50/30"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <button
                className="absolute right-2 bottom-2 p-2 rounded-xl hover:bg-orange-100 transition-colors"
                aria-label="Emoji"
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

export default ConsultantChatPage;