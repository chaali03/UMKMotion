import React, { useMemo, useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, addDays, isBefore, isAfter, setHours, setMinutes, differenceInMinutes } from "date-fns";
import { Clock, Calendar, Video, MessageCircle, CheckCircle2, MapPin, Star, Globe, Timer, Check, ChevronRight, ArrowLeft, Bell, BellOff, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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

// Notification permission and reminder system
async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

function scheduleReminder(bookingDate: Date, consultantName: string, meetingType: string) {
  if (!("Notification" in window)) return;

  // Schedule reminder 1 hour before
  const reminderTime = new Date(bookingDate.getTime() - 60 * 60 * 1000);
  const now = new Date();

  if (reminderTime <= now) {
    // If reminder time has passed, schedule for 5 minutes before
    const newReminderTime = new Date(bookingDate.getTime() - 5 * 60 * 1000);
    if (newReminderTime <= now) {
      // If even 5 minutes before has passed, show immediately
      showNotification(consultantName, meetingType, bookingDate);
      return;
    }
    setTimeout(() => {
      showNotification(consultantName, meetingType, bookingDate);
    }, newReminderTime.getTime() - now.getTime());
  } else {
    setTimeout(() => {
      showNotification(consultantName, meetingType, bookingDate);
    }, reminderTime.getTime() - now.getTime());
  }
}

function showNotification(consultantName: string, meetingType: string, bookingDate: Date) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const options: NotificationOptions = {
    body: `Konsultasi ${meetingType === "zoom" ? "Zoom" : "Chat"} dengan ${consultantName} akan dimulai pada ${format(bookingDate, "dd MMM yyyy HH:mm")}`,
    icon: "/favicon_io/favicon-32x32.png",
    badge: "/favicon_io/favicon-32x32.png",
    tag: `consultant-booking-${bookingDate.getTime()}`,
    requireInteraction: false,
  };

  new Notification("Pengingat Konsultasi UMKMotion", options);
}

export default function ConsultantBookingPage() {
  const consultantParam = useQueryParam("consultant");
  const consultant = useMemo(() => {
    const id = consultantParam ? Number(consultantParam) : NaN;
    return SAMPLE_CONSULTANTS.find((c) => c.id === id) ?? SAMPLE_CONSULTANTS[0];
  }, [consultantParam]);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<Date | undefined>();
  const [meetingType, setMeetingType] = useState<MeetingType>("zoom");
  const [duration, setDuration] = useState<number>(60);
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta");
  const [notes, setNotes] = useState<string>("");
  const [confirming, setConfirming] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const timeslots = useMemo(() => {
    if (!selectedDate) return [] as Date[];
    const start = setHours(setMinutes(selectedDate, 0), 9);
    const end = setHours(setMinutes(selectedDate, 0), 17);
    const slots: Date[] = [];
    let cursor = start;
    while (!isAfter(cursor, end)) {
      slots.push(cursor);
      cursor = setMinutes(addDays(cursor, 0), cursor.getMinutes() + 30);
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
  const total = subtotal;

  const handleRequestNotification = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission("granted");
      setSuccess("Izin notifikasi diberikan! Anda akan mendapat pengingat sebelum konsultasi.");
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError("Izin notifikasi ditolak. Anda tidak akan mendapat pengingat.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleConfirm = async () => {
    if (!canConfirm || !currentUser) {
      setError("Silakan login terlebih dahulu untuk melakukan booking.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    setConfirming(true);
    setError(null);
    setSuccess(null);

    try {
      // Combine date and time
      const bookingDateTime = new Date(selectedDate!);
      bookingDateTime.setHours(selectedTime!.getHours());
      bookingDateTime.setMinutes(selectedTime!.getMinutes());
      bookingDateTime.setSeconds(0);
      bookingDateTime.setMilliseconds(0);

      // Check if booking time is in the past
      if (bookingDateTime <= new Date()) {
        throw new Error("Waktu booking tidak boleh di masa lalu");
      }

      // Check for conflicting bookings
      const bookingsRef = collection(db, "users", currentUser.uid, "consultant_bookings");
      const conflictQuery = query(
        bookingsRef,
        where("consultantId", "==", consultant.id),
        where("status", "==", "confirmed")
      );
      const conflictSnap = await getDocs(conflictQuery);
      
      const hasConflict = conflictSnap.docs.some((doc) => {
        const data = doc.data();
        const existingDate = data.bookingDate?.toDate();
        if (!existingDate) return false;
        const timeDiff = Math.abs(differenceInMinutes(existingDate, bookingDateTime));
        return timeDiff < duration;
      });

      if (hasConflict) {
        throw new Error("Anda sudah memiliki booking pada waktu yang sama atau berdekatan");
      }

      // Save booking to Firebase
      const bookingRef = collection(db, "users", currentUser.uid, "consultant_bookings");
      const bookingData = {
        consultantId: consultant.id,
        consultantName: consultant.name,
        consultantSpecialty: consultant.specialty,
        consultantAvatar: consultant.avatar,
        bookingDate: bookingDateTime,
        meetingType,
        duration,
        timezone,
        notes: notes.trim() || null,
        status: "confirmed",
        createdAt: serverTimestamp(),
        price: total,
        reminderSent: false
      };

      const docRef = await addDoc(bookingRef, bookingData);
      
      // Schedule reminder if permission granted
      if (notificationPermission === "granted") {
        scheduleReminder(bookingDateTime, consultant.name, meetingType);
      }

      setConfirmed(true);
      setSuccess("Booking berhasil! Anda akan diarahkan ke halaman chat.");

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = `/ConsultantChat?consultant=${consultant.id}`;
      }, 2000);
    } catch (error: any) {
      console.error("Error confirming booking:", error);
      setError(error.message || "Terjadi kesalahan saat memproses booking. Silakan coba lagi.");
      setConfirming(false);
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
      `DESCRIPTION:Tipe: ${meetingType.toUpperCase()} | Durasi: ${duration} menit | Zona: ${timezone}${notes ? ` | Catatan: ${notes}` : ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");
    return `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`;
  }, [selectedDate, selectedTime, duration, meetingType, timezone, consultant, notes]);

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
          <motion.button
            onClick={() => (typeof window !== 'undefined' ? window.history.back() : null)}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-orange-700 text-sm font-medium"
            aria-label="Kembali"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={16} /> Kembali
          </motion.button>
        </div>

        <div className="mb-6 text-center px-2">
          <motion.h1
            className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent break-words"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Booking Konsultan Pilihan Anda
          </motion.h1>
        </div>

        {/* Notification Permission Banner */}
        {notificationPermission !== "granted" && (
          <motion.div
            className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-amber-50 border border-orange-200 rounded-2xl flex items-center justify-between gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <Bell className="text-orange-600" size={20} />
              <div>
                <p className="font-semibold text-slate-900 text-sm">Aktifkan Pengingat</p>
                <p className="text-xs text-slate-600">Dapatkan notifikasi 1 jam sebelum konsultasi dimulai</p>
              </div>
            </div>
            <motion.button
              onClick={handleRequestNotification}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Aktifkan
            </motion.button>
          </motion.div>
        )}

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-sm text-red-800 flex-1">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CheckCircle2 className="text-green-600" size={20} />
              <p className="text-sm text-green-800 flex-1">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Consultant Summary */}
        <motion.div
          className="rounded-2xl border border-orange-100 bg-white/80 backdrop-blur-sm p-4 flex items-center gap-4 mb-8 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {consultant?.avatar && (
            <img src={consultant.avatar} alt={consultant.name} className="w-16 h-16 rounded-xl object-cover border-2 border-orange-200" />
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
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin size={12} /> {consultant.location}
              </p>
            )}
          </div>
        </motion.div>

        {/* Progress Stepper */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[
              { label: "Jadwal", icon: Calendar, done: !!(selectedDate && selectedTime) },
              { label: "Detail", icon: Clock, done: !!meetingType },
              { label: "Konfirmasi", icon: CheckCircle2, done: confirmed },
            ].map((step, i) => (
              <div key={i} className="flex items-center">
                <motion.div
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    step.done
                      ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg"
                      : "bg-white border border-slate-200 text-slate-600"
                  }`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: step.done ? 1.05 : 1 }}
                >
                  <step.icon size={18} />
                  <span className="font-semibold text-sm">{step.label}</span>
                  {step.done && <Check size={16} />}
                </motion.div>
                {i < 2 && <div className="w-8 h-0.5 mx-2 bg-slate-200" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <section className="lg:col-span-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-orange-600" size={20} />
              <h3 className="font-bold text-lg">Pilih Tanggal</h3>
            </div>
            
            <div className="mb-6">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: addDays(new Date(), 1) }}
                weekStartsOn={1}
                className="rounded-xl"
              />
            </div>

            {/* Timeslots */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="text-orange-600" size={18} />
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
                    <motion.button
                      key={idx}
                      disabled={disabled}
                      onClick={() => setSelectedTime(t)}
                      className={
                        "px-3 py-2 text-xs sm:text-sm rounded-xl border transition min-w-[72px] sm:min-w-0 " +
                        (active
                          ? "border-orange-600 bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md"
                          : "border-slate-200 hover:border-orange-300 bg-white") +
                        (disabled ? " opacity-50 cursor-not-allowed" : "")
                      }
                      whileHover={!disabled ? { scale: 1.05 } : {}}
                      whileTap={!disabled ? { scale: 0.95 } : {}}
                    >
                      {label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Meeting type */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold">Tipe Pertemuan</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                <motion.button
                  onClick={() => setMeetingType("chat")}
                  className={
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all " +
                    (meetingType === "chat"
                      ? "border-orange-600 bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md"
                      : "border-slate-200 hover:border-orange-300 bg-white")
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle size={16} /> Chat
                </motion.button>
                <motion.button
                  onClick={() => setMeetingType("zoom")}
                  className={
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all " +
                    (meetingType === "zoom"
                      ? "border-orange-600 bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md"
                      : "border-slate-200 hover:border-orange-300 bg-white")
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Video size={16} /> Zoom Meeting
                </motion.button>
              </div>
            </div>

            {/* Duration & Timezone */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 inline-flex items-center gap-2">
                  <Timer size={16} /> Durasi
                </label>
                <div className="flex gap-2">
                  {[30, 60, 90].map((d) => (
                    <motion.button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                        duration === d
                          ? "border-orange-600 bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md"
                          : "border-slate-200 hover:border-orange-300 bg-white"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {d} menit
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 inline-flex items-center gap-2">
                  <Globe size={16} /> Zona Waktu
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                >
                  {["Asia/Jakarta", "Asia/Makassar", "Asia/Pontianak", "Asia/Jayapura", "Asia/Singapore", "Asia/Bangkok", "UTC"].map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
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
                className="w-full rounded-xl border-2 border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
              />
            </div>
          </section>

          {/* Summary & Confirmation */}
          <aside className="lg:col-span-1 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm p-4 sm:p-6 h-fit sticky top-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Ringkasan</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={16} className="text-orange-500" />
                  <span className="text-sm font-medium">Tanggal</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedDate ? format(selectedDate, "dd MMM yyyy") : "-"}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock size={16} className="text-orange-500" />
                  <span className="text-sm font-medium">Waktu</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedTime ? format(selectedTime, "HH:mm") : "-"}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Video size={16} className="text-orange-500" />
                  <span className="text-sm font-medium">Tipe</span>
                </div>
                <span className="font-bold text-slate-900 text-sm capitalize">{meetingType}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Timer size={16} className="text-orange-500" />
                  <span className="text-sm font-medium">Durasi</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">{duration} menit</span>
              </div>

              {notificationPermission === "granted" && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                  <Bell className="text-green-600" size={16} />
                  <span className="text-xs text-green-700 font-medium">Pengingat aktif</span>
                </div>
              )}
            </div>

            <motion.button
              disabled={!canConfirm}
              onClick={handleConfirm}
              className={`w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all ${
                canConfirm ? "hover:scale-105 hover:brightness-95" : "opacity-50 cursor-not-allowed"
              }`}
              whileHover={canConfirm ? { scale: 1.02 } : {}}
              whileTap={canConfirm ? { scale: 0.98 } : {}}
            >
              {confirming ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Booking Sekarang
                </>
              )}
            </motion.button>

            {confirmed && (
              <motion.div
                className="mt-4 p-4 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Booking Berhasil!
                </p>
                <p className="text-xs text-green-700 mb-3">Mengalihkan ke halaman chat...</p>
                {calendarICS && (
                  <a
                    href={calendarICS}
                    download={`konsultasi-${consultant?.id}.ics`}
                    className="inline-flex items-center gap-2 text-xs text-orange-700 hover:text-orange-800 font-medium"
                  >
                    <Calendar size={12} /> Tambahkan ke Kalender
                  </a>
                )}
              </motion.div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
