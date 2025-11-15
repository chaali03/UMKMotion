import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  X,
  User,
  Mail,
  MessageSquare,
  CreditCard,
  Shield,
} from "lucide-react";

type TimeSlot = {
  time: string;
  available: boolean;
};

type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  consultationType: "online" | "offline";
  topic: string;
  notes: string;
};

const ConsultantBookingPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    consultationType: "online",
    topic: "",
    notes: "",
  });

  // Get consultant ID from URL
  const consultantId = typeof window !== "undefined" 
    ? new URLSearchParams(window.location.search).get("consultant") 
    : null;

  // Generate available dates (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split("T")[0];
  });

  // Time slots
  const timeSlots: TimeSlot[] = [
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: false },
    { time: "13:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: false },
    { time: "17:00", available: true },
  ];

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as 1 | 2 | 3);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
  };

  const handleSubmit = () => {
    // In a real app, submit to backend
    console.log("Booking submitted:", formData);
    alert("Booking berhasil! Anda akan menerima konfirmasi via email.");
    window.location.href = "/consultant";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Booking Konsultasi
          </h1>
          <p className="text-slate-600">
            Pilih waktu yang sesuai untuk sesi konsultasi Anda
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s
                        ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step > s ? <CheckCircle size={20} /> : s}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div
                      className={`text-sm font-semibold ${
                        step >= s ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {s === 1 ? "Waktu" : s === 2 ? "Detail" : "Konfirmasi"}
                    </div>
                  </div>
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      step > s ? "bg-orange-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Date & Time Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Pilih Tanggal & Waktu
                  </h2>
                  <p className="text-slate-600">
                    Pilih tanggal dan waktu yang sesuai untuk konsultasi
                  </p>
                </div>

                {/* Consultation Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Tipe Konsultasi
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() =>
                        setFormData({ ...formData, consultationType: "online" })
                      }
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        formData.consultationType === "online"
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-200 hover:border-orange-200"
                      }`}
                    >
                      <Video
                        size={24}
                        className={`mx-auto mb-2 ${
                          formData.consultationType === "online"
                            ? "text-orange-600"
                            : "text-slate-400"
                        }`}
                      />
                      <div className="font-semibold text-slate-900">Online</div>
                      <div className="text-xs text-slate-500">Video Call</div>
                    </button>
                    <button
                      onClick={() =>
                        setFormData({ ...formData, consultationType: "offline" })
                      }
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        formData.consultationType === "offline"
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-200 hover:border-orange-200"
                      }`}
                    >
                      <MapPin
                        size={24}
                        className={`mx-auto mb-2 ${
                          formData.consultationType === "offline"
                            ? "text-orange-600"
                            : "text-slate-400"
                        }`}
                      />
                      <div className="font-semibold text-slate-900">Offline</div>
                      <div className="text-xs text-slate-500">Bertemu Langsung</div>
                    </button>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Pilih Tanggal
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-64 overflow-y-auto">
                    {availableDates.map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          setFormData({ ...formData, date });
                        }}
                        className={`p-3 rounded-xl border-2 transition-all text-sm ${
                          selectedDate === date
                            ? "border-orange-500 bg-orange-50 text-orange-700 font-semibold"
                            : "border-slate-200 hover:border-orange-200"
                        }`}
                      >
                        <div className="text-xs text-slate-500 mb-1">
                          {new Date(date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                        <div className="font-semibold">
                          {new Date(date).toLocaleDateString("id-ID", {
                            weekday: "short",
                          })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Pilih Waktu
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() =>
                            setFormData({ ...formData, time: slot.time })
                          }
                          disabled={!slot.available}
                          className={`p-3 rounded-xl border-2 transition-all text-sm ${
                            formData.time === slot.time
                              ? "border-orange-500 bg-orange-50 text-orange-700 font-semibold"
                              : slot.available
                              ? "border-slate-200 hover:border-orange-200"
                              : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                          }`}
                        >
                          <Clock size={16} className="mx-auto mb-1" />
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNext}
                    disabled={!formData.date || !formData.time}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-3 rounded-2xl font-semibold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    Lanjutkan
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Informasi Kontak
                  </h2>
                  <p className="text-slate-600">
                    Lengkapi data diri Anda untuk konfirmasi booking
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Masukkan nama lengkap"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="email@example.com"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      No. Telepon
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="08xx xxxx xxxx"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Topik Konsultasi
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                      <textarea
                        value={formData.topic}
                        onChange={(e) =>
                          setFormData({ ...formData, topic: e.target.value })
                        }
                        placeholder="Jelaskan topik atau masalah yang ingin dikonsultasikan..."
                        rows={4}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Tambahkan catatan atau pertanyaan khusus..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft size={20} />
                    Kembali
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!formData.name || !formData.email || !formData.phone}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-3 rounded-2xl font-semibold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    Lanjutkan
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Konfirmasi Booking
                  </h2>
                  <p className="text-slate-600">
                    Periksa kembali detail booking Anda
                  </p>
                </div>

                {/* Booking Summary */}
                <div className="bg-orange-50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                        <Calendar className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {formatDate(formData.date)}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-1">
                          <Clock size={14} />
                          {formData.time} WIB
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">Tipe</div>
                      <div className="font-semibold text-slate-900 capitalize">
                        {formData.consultationType === "online" ? (
                          <span className="flex items-center gap-1">
                            <Video size={16} />
                            Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            Offline
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-orange-200 pt-4 space-y-3">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Nama</div>
                      <div className="font-semibold text-slate-900">{formData.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Email</div>
                      <div className="font-semibold text-slate-900">{formData.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Telepon</div>
                      <div className="font-semibold text-slate-900">{formData.phone}</div>
                    </div>
                    {formData.topic && (
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Topik</div>
                        <div className="font-semibold text-slate-900">{formData.topic}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-slate-600 w-5 h-5" />
                      <span className="font-semibold text-slate-900">Biaya Konsultasi</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">Rp 150.000</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield size={14} />
                    <span>Pembayaran aman dan terenkripsi</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft size={20} />
                    Kembali
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-3 rounded-2xl font-semibold hover:brightness-95 transition-all shadow-lg hover:shadow-xl"
                  >
                    <CheckCircle size={20} />
                    Konfirmasi Booking
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ConsultantBookingPage;

