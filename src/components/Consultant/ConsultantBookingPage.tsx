import React, { useMemo, useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, addDays, addMinutes, isBefore, isAfter, setHours, setMinutes } from "date-fns";
import { Clock, Calendar, Video, MessageCircle, CheckCircle2, MapPin, Star, Globe, Timer, Check, ChevronRight, ArrowLeft } from "lucide-react";

type MeetingType = "chat" | "zoom";

type ConsultantSummary = {
  id: number;
  name: string;
  specialty: string;
  rating?: number;
  price?: string;
  location?: string;
  avatar?: string;
};

const SAMPLE_CONSULTANTS: ConsultantSummary[] = [
  {
    id: 1,
    name: "Dr. Budi Santoso",
    specialty: "Manajemen Keuangan UMKM",
    rating: 4.9,
    price: "Rp 150.000/sesi",
    location: "Jakarta",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&q=60",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    specialty: "Digital Marketing & Branding",
    rating: 4.8,
    price: "Rp 120.000/sesi",
    location: "Bandung",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&q=60",
  },
];

function useQueryParam(name: string) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setValue(params.get(name));
    }
  }, [name]);
  return value;
}

export default function ConsultantBookingPage() {
  const consultantParam = useQueryParam("consultant");
  const consultant = useMemo(() => {
    const id = consultantParam ? Number(consultantParam) : NaN;
    return SAMPLE_CONSULTANTS.find((c) => c.id === id) ?? SAMPLE_CONSULTANTS[0];
  }, [consultantParam]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<Date | undefined>();
  const [meetingType, setMeetingType] = useState<MeetingType>("zoom");
  const [duration, setDuration] = useState<number>(60);
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta");
  const [notes, setNotes] = useState<string>("");
  const [voucher, setVoucher] = useState<string>("");
  const [voucherApplied, setVoucherApplied] = useState<boolean>(false);
  const [confirming, setConfirming] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const timeslots = useMemo(() => {
    if (!selectedDate) return [] as Date[];
    const start = setHours(setMinutes(selectedDate, 0), 9);
    const end = setHours(setMinutes(selectedDate, 0), 17);
    const slots: Date[] = [];
    let cursor = start;
    while (!isAfter(cursor, end)) {
      slots.push(cursor);
      cursor = addMinutes(cursor, 30);
    }
    return slots;
  }, [selectedDate]);

  const canConfirm = selectedDate && selectedTime && meetingType && !confirming;

  // Pricing computation
  const basePrice = useMemo(() => {
    const raw = consultant?.price ? consultant.price.replace(/\D/g, "") : "0";
    const val = Number(raw) || 0;
    return val;
  }, [consultant]);
  const typeMultiplier = meetingType === "chat" ? 0.7 : 1.2;
  const durationMultiplier = duration <= 30 ? 0.6 : duration <= 60 ? 1.0 : 1.6;
  const subtotal = Math.round(basePrice * typeMultiplier * durationMultiplier);
  const discount = voucherApplied ? Math.round(subtotal * 0.15) : 0;
  const total = Math.max(subtotal - discount, 0);

  const applyVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (code === "UMKMHEBAT" || code === "PROMO15") setVoucherApplied(true);
    else setVoucherApplied(false);
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setConfirming(true);
    // Simulasi pemrosesan booking (mis. panggil API / pembayaran)
    await new Promise((r) => setTimeout(r, 1200));
    setConfirming(false);
    setConfirmed(true);
    // Arahkan ke halaman chat dengan consultant id
    if (typeof window !== "undefined") {
      const id = consultant?.id ?? 0;
      window.location.href = `/ConsultantChat?consultant=${id}`;
    }
  };

  // ICS calendar link
  const calendarICS = useMemo(() => {
    if (!selectedDate || !selectedTime) return "";
    const start = new Date(selectedTime);
    const end = new Date(start.getTime() + duration * 60000);
    const dt = (d: Date) =>
      `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}${String(d.getUTCSeconds()).padStart(2, "0")}Z`;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//UMKMotion//Consultation//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@umkmotion`,
      `DTSTAMP:${dt(new Date())}`,
      `DTSTART:${dt(start)}`,
      `DTEND:${dt(end)}`,
      `SUMMARY:Konsultasi dengan ${consultant?.name ?? "Konsultan"}`,
      `DESCRIPTION:Tipe: ${meetingType.toUpperCase()} | Durasi: ${duration} menit | Zona: ${timezone}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");
    return `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`;
  }, [selectedDate, selectedTime, duration, meetingType, timezone, consultant]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 text-slate-900">
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-orange-300/20 to-amber-300/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-blue-300/15 to-purple-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Back row */}
        <div className="mb-4">
          <button
            onClick={() => (typeof window !== 'undefined' ? window.history.back() : null)}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-orange-700 text-sm"
            aria-label="Kembali"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
        </div>

        <div className="mb-6 text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent break-words">
            Booking Konsultan Pilihan Anda
          </h1>
        </div>

        {/* Consultant Summary - Simple */}
        <div className="rounded-2xl border border-orange-100 bg-white p-4 flex items-center gap-4 mb-8">
          {consultant?.avatar && (
            <img src={consultant.avatar} alt={consultant.name} className="w-16 h-16 rounded-xl object-cover" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{consultant?.name}</h2>
              {typeof consultant?.rating === "number" && (
                <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-semibold">
                  <Star size={14} className="fill-amber-500" />
                  {consultant.rating}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">{consultant?.specialty}</p>
            {consultant?.location && (
              <p className="text-xs text-slate-500 mt-1">{consultant.location}</p>
            )}
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[
              { label: "Jadwal", icon: Calendar, done: !!(selectedDate && selectedTime) },
              { label: "Detail", icon: Clock, done: !!meetingType },
              { label: "Konfirmasi", icon: CheckCircle2, done: confirmed },
            ].map((step, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${step.done ? "bg-orange-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
                  <step.icon size={18} />
                  <span className="font-semibold text-sm">{step.label}</span>
                  {step.done && <Check size={16} />}
                </div>
                {i < 2 && <div className="w-8 h-0.5 mx-2 bg-slate-200" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <section className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-orange-600" />
              <h3 className="font-bold">Pilih Tanggal</h3>
            </div>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={{ before: addDays(new Date(), 1) }}
              weekStartsOn={1}
              className="rounded-xl"
            />

            {/* Timeslots */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-orange-600" />
                <h3 className="font-bold">Pilih Jam</h3>
                {selectedDate && (
                  <span className="text-xs text-slate-500">{format(selectedDate, "EEEE, dd MMM yyyy")}</span>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:max-h-48 overflow-y-auto pr-1">
                {timeslots.map((t, idx) => {
                  const label = format(t, "HH:mm");
                  const active = selectedTime && format(selectedTime, "HH:mm") === label;
                  const disabled = isBefore(t, new Date());
                  return (
                    <button
                      key={idx}
                      disabled={disabled}
                      onClick={() => setSelectedTime(t)}
                      className={
                        "px-3 py-2 text-xs sm:text-sm rounded-xl border transition min-w-[72px] sm:min-w-0 " +
                        (active
                          ? "border-orange-600 bg-orange-50 text-orange-700"
                          : "border-slate-200 hover:border-orange-300") +
                        (disabled ? " opacity-50 cursor-not-allowed" : "")
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meeting type - Chat and Zoom only */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold">Tipe Pertemuan</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setMeetingType("chat")}
                  className={
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm " +
                    (meetingType === "chat" ? "border-orange-600 bg-orange-50 text-orange-700" : "border-slate-200 hover:border-orange-300")
                  }
                >
                  <MessageCircle size={16} /> Chat
                </button>
                <button
                  onClick={() => setMeetingType("zoom")}
                  className={
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm " +
                    (meetingType === "zoom" ? "border-orange-600 bg-orange-50 text-orange-700" : "border-slate-200 hover:border-orange-300")
                  }
                >
                  <Video size={16} /> Zoom Meeting
                </button>
              </div>
            </div>

            {/* Duration & Timezone */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 inline-flex items-center gap-2"><Timer size={16} /> Durasi</label>
                <div className="flex gap-2">
                  {[30, 60, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-4 py-2 rounded-xl border text-sm ${duration === d ? "border-orange-600 bg-orange-50 text-orange-700" : "border-slate-200 hover:border-orange-300"}`}
                    >
                      {d} menit
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 inline-flex items-center gap-2"><Globe size={16} /> Zona Waktu</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                  {["Asia/Jakarta","Asia/Makassar","Asia/Pontianak","Asia/Jayapura","Asia/Singapore","Asia/Bangkok","UTC"].map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-bold mb-2">Catatan (opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Ceritakan singkat masalah usaha Anda, target, dan konteks."
                className="w-full rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Voucher removed as requested */}
          </section>

          {/* Summary & Confirmation */}
          <aside className="lg:col-span-1 rounded-2xl bg-white border border-slate-200 shadow-sm p-4 h-fit sticky top-8">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Ringkasan</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={16} className="text-orange-500" />
                  <span>Tanggal</span>
                </div>
                <span className="font-bold text-slate-900">{selectedDate ? format(selectedDate, "dd MMM yyyy") : "-"}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock size={16} className="text-orange-500" />
                  <span>Waktu</span>
                </div>
                <span className="font-bold text-slate-900">{selectedTime ? format(selectedTime, "HH:mm") : "-"}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-600">
                  <Video size={16} className="text-orange-500" />
                  <span>Tipe</span>
                </div>
                <span className="font-bold text-slate-900 capitalize">{meetingType}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-600">
                  <Timer size={16} className="text-orange-500" />
                  <span>Durasi</span>
                </div>
                <span className="font-bold text-slate-900">{duration} menit</span>
              </div>
            </div>

            {/* Price Summary removed as requested */}

            <button
              disabled={!canConfirm}
              onClick={handleConfirm}
              className={`w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all ${
                canConfirm ? "hover:scale-105 hover:brightness-95" : "opacity-50 cursor-not-allowed"
              }`}
            >
              {confirming ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Booking Sekarang
                </>
              )}
            </button>

            {confirmed && (
              <div className="mt-4 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <p className="text-sm font-semibold text-slate-800 mb-1">Booking Berhasil</p>
                <p className="text-xs text-slate-600 mb-2">Mengalihkan ke halaman chat...</p>
                {calendarICS && (
                  <a 
                    href={calendarICS} 
                    download={`konsultasi-${consultant?.id}.ics`} 
                    className="inline-flex items-center gap-2 text-xs text-orange-700 hover:text-orange-800 font-medium"
                  >
                    <Calendar size={12} /> Tambahkan ke Kalender
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}