import React, { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, MoreVertical, Phone, Video, Paperclip, Smile, Send, Star, Clock } from "lucide-react";

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
  id: number;
  text: string;
  sender: "user" | "consultant";
  timestamp: Date;
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
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: `Halo! Saya ${consultant.name}. Ceritakan singkat tantangan usaha Anda.`, sender: "consultant", timestamp: new Date(Date.now() - 120000) },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const m: Message = { id: Date.now(), text, sender: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, m]);
    setInput("");
    setIsTyping(true);
    // Simulasi balasan konsultan
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "Terima kasih, saya tangkap konteksnya. Kita bisa mulai dari analisis arus kas dan channel pemasaran.", sender: "consultant", timestamp: new Date() },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.href = "/ConsultantPage")}
              className="p-2 rounded-lg hover:bg-orange-50"
              aria-label="Kembali"
            >
              <ArrowLeft />
            </button>
            {consultant.avatar && (
              <img src={consultant.avatar} alt={consultant.name} className="w-10 h-10 rounded-xl object-cover" />
            )}
            <div>
              <div className="font-semibold">{consultant.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="inline-flex items-center gap-1"><Star size={12} className="text-amber-600" /> {consultant.rating}</span>
                <span className="inline-flex items-center gap-1"><Clock size={12} /> Respon {consultant.responseTime}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-orange-50" title="Telepon"><Phone /></button>
            <button className="p-2 rounded-lg hover:bg-orange-50" title="Video"><Video /></button>
            <button className="p-2 rounded-lg hover:bg-orange-50" title="Menu"><MoreVertical /></button>
          </div>
        </div>
      </header>

      {/* Chat */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white px-4 py-1 rounded-full text-xs text-slate-500 shadow-sm border border-orange-100">Hari ini</div>
        </div>

        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2 shadow-sm border ${m.sender === "user" ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white border-transparent" : "bg-white border-slate-200"}`}>
                <p className="text-sm">{m.text}</p>
                <div className={`mt-1 text-[10px] ${m.sender === "user" ? "text-white/80" : "text-slate-500"}`}>{format(m.timestamp, "HH:mm")}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-500 shadow-sm">
                <span className="animate-pulse">Mengetik...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-orange-50" title="Lampirkan"><Paperclip /></button>
            <input ref={fileInputRef} type="file" className="hidden" />
            <button className="p-2 rounded-lg hover:bg-orange-50" title="Emoji"><Smile /></button>
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
              className="flex-1 min-w-[180px] rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <button onClick={sendMessage} className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:brightness-95"
            >
              <Send size={16} /> Kirim
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}