"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type CalendarBooking = {
  id: number;
  bookingDate: string;
  sponsorName: string;
  foodNote: string | null;
  mealType: "morning" | "lunch" | "dinner";
  status: string;
};

type SponsorPayload = {
  fullName: string;
  phone: string;
  email?: string;
};

function mealLabel(mealType: "morning" | "lunch" | "dinner"): string {
  if (mealType === "morning") return "Breakfast";
  if (mealType === "lunch") return "Lunch";
  return "Dinner";
}

function formatDateLabel(dateString: string): string {
  return new Date(`${dateString}T00:00:00.000Z`).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [foodNote, setFoodNote] = useState("");
  const [mealType, setMealType] = useState<"morning" | "lunch" | "dinner">("morning");

  // Payment state
  const [donationAmount, setDonationAmount] = useState("500");
  const [showSupportPanel, setShowSupportPanel] = useState(false);
  const [showZekathPanel, setShowZekathPanel] = useState(false);
  const [cancelFlowActive, setCancelFlowActive] = useState(false);

  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBookings() {
    const response = await fetch(`/api/bookings?month=${month}&year=${year}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message ?? "Failed to load bookings");
    setBookings(data);
  }

  useEffect(() => {
    loadBookings().catch((err: Error) => setError(err.message));
  }, [month, year]);

  const todayString = useMemo(() => {
    const today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0, 10);
  }, []);

  const bookedMap = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    bookings.forEach((booking) => {
      if (booking.status === "booked") {
        const dateKey = new Date(booking.bookingDate).toISOString().slice(0, 10);
        const list = map.get(dateKey) ?? [];
        list.push(booking);
        map.set(dateKey, list);
      }
    });
    return map;
  }, [bookings]);

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

  const monthTitle = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });

  function toDateString(day: number): string {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function isFutureDate(dateString: string): boolean {
    return dateString > todayString;
  }

  const selectedBookings = selectedDate ? bookedMap.get(selectedDate) ?? [] : [];
  const selectedSlotBooking = selectedBookings.find((item) => item.mealType === mealType) ?? null;
  const selectedCanBook = Boolean(selectedDate && isFutureDate(selectedDate) && !selectedSlotBooking);

  const donationBase = process.env.NEXT_PUBLIC_DONATION_TEXT ?? "Masjid Ustad donation";
  const zakatBase = process.env.NEXT_PUBLIC_ZAKAT_TEXT ?? "Masjid Ustad zekath";
  const supportPayload = `${donationBase} - Amount: ${donationAmount}`;
  const supportQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(supportPayload)}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDate) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const sponsorPayload: SponsorPayload = { fullName, phone };
      if (email.trim()) sponsorPayload.email = email.trim();

      const sponsorResponse = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sponsorPayload)
      });
      const sponsorData = await sponsorResponse.json();
      if (!sponsorResponse.ok) throw new Error(sponsorData.message ?? "Sponsor creation failed");

      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorId: sponsorData.id,
          bookingDate: selectedDate,
          foodNote,
          mealType
        })
      });
      const bookingData = await bookingResponse.json();
      if (!bookingResponse.ok) throw new Error(bookingData.message ?? "Booking failed");

      setSuccess("Your generous sponsorship has been secured. Thank you!");
      setFullName("");
      setPhone("");
      setEmail("");
      setFoodNote("");
      setMealType("morning");
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong processing your request.");
    } finally {
      setLoading(false);
    }
  }

  async function performCancelBooking() {
    if (!selectedSlotBooking) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/${selectedSlotBooking.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Failed to drop booking");
      setSuccess("Booking has been successfully removed.");
      setCancelFlowActive(false);
      setShowSupportPanel(false);
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred dropping the booking.");
    } finally {
      setLoading(false);
    }
  }

  function beginCancelFlow() {
    setCancelFlowActive(true);
    setShowSupportPanel(false);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      {/* Premium Minimal Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-block py-1 px-3 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold tracking-widest uppercase mb-4">
                Public Schedule
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Daily Sponsorship
              </h1>
              <p className="mt-4 text-lg text-slate-500 leading-relaxed">
                Select an available future date from the calendar to pledge a daily meal. Your contribution sustains the community directly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative group w-full sm:w-auto">
                <select
                  value={month}
                  onChange={(e) => {
                    setMonth(Number(e.target.value));
                    setSelectedDate(null);
                  }}
                  className="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-2xl px-5 py-3.5 pr-12 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none cursor-pointer transition-all shadow-sm"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23334155%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1.25rem top 50%", backgroundSize: "12px auto" }}
                >
                  {Array.from({ length: 12 }).map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {new Date(Date.UTC(2026, index, 1)).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  setSelectedDate(null);
                }}
                className="w-full sm:w-28 bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all shadow-sm text-center"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 pt-12 md:px-8">
        {/* Status Toast Container */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
          {error && (
            <div className="animate-in slide-in-from-right-8 fade-in flex items-center gap-3 rounded-2xl bg-white p-4 pr-6 border-l-4 border-red-500 shadow-2xl text-sm font-medium text-slate-700 max-w-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              {error}
            </div>
          )}
          {success && (
            <div className="animate-in slide-in-from-right-8 fade-in flex items-center gap-3 rounded-2xl bg-white p-4 pr-6 border-l-4 border-emerald-500 shadow-2xl text-sm font-medium text-slate-700 max-w-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              {success}
            </div>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] items-start">

          {/* Calendar Grid Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span className="h-3 w-3 rounded-full bg-emerald-100 border border-emerald-200 hidden sm:inline-block"></span>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span className="h-3 w-3 rounded-full bg-amber-100 border border-amber-200 hidden sm:inline-block"></span>
                <span>Partially booked</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span className="h-3 w-3 rounded-full bg-red-100 border border-red-200 hidden sm:inline-block"></span>
                <span>Fully Booked</span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">{monthTitle} {year}</h2>
              </div>

              <div className="grid grid-cols-7 gap-y-4 gap-x-2 sm:gap-x-4 mb-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day}>{day}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {Array.from({ length: firstWeekday }).map((_, idx) => <div key={`empty-${idx}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateString = toDateString(day);
                  const bookedCount = bookedMap.get(dateString)?.length ?? 0;
                  const isFullyBooked = bookedCount === 3;
                  const isPartiallyBooked = bookedCount > 0 && bookedCount < 3;
                  const isFuture = isFutureDate(dateString);
                  const isSelected = selectedDate === dateString;
                  const isToday = dateString === todayString;

                  // Premium interactive aesthetics
                  let cellStyle = "bg-white border-slate-100 hover:border-emerald-300 hover:shadow-md hover:-translate-y-1";
                  let textStyle = "text-slate-700";

                  if (!isFuture && !isToday) {
                    cellStyle = "bg-slate-50/50 border-transparent opacity-60 cursor-not-allowed";
                    textStyle = "text-slate-400";
                  } else if (isFullyBooked) {
                    cellStyle = "bg-red-50/50 border-red-100 hover:border-red-300 hover:shadow-md hover:-translate-y-1";
                    textStyle = "text-red-700";
                  } else if (isPartiallyBooked) {
                    cellStyle = "bg-amber-50/50 border-amber-100 hover:border-amber-300 hover:shadow-md hover:-translate-y-1";
                    textStyle = "text-amber-800";
                  } else if (isFuture || isToday) {
                    cellStyle = "bg-emerald-50/30 border-emerald-100/50 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md hover:-translate-y-1";
                    textStyle = "text-emerald-800";
                  }

                  if (isSelected) {
                    cellStyle = "bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-600/30 scale-[1.03] ring-4 ring-emerald-600/20 z-10 relative";
                    textStyle = "text-white";
                  }

                  return (
                    <button
                      key={dateString}
                      onClick={() => {
                        setSelectedDate(dateString);
                        setCancelFlowActive(false);
                        setShowSupportPanel(false);
                        setError("");
                        setSuccess("");
                      }}
                      className={`group relative flex h-16 sm:h-20 w-full flex-col items-center justify-center rounded-2xl border transition-all duration-300 ${cellStyle}`}
                    >
                      {isToday && !isSelected && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                      )}

                      <span className={`text-lg sm:text-lg font-bold ${textStyle}`}>{day}</span>

                      {bookedCount > 0 && !isSelected && (
                        <div className="absolute bottom-2 flex gap-0.5">
                          {Array.from({ length: 3 }).map((_, slotIdx) => (
                            <div key={slotIdx} className={`h-1.5 w-1.5 rounded-full ${slotIdx < bookedCount ? (isFullyBooked ? 'bg-red-400' : 'bg-amber-400') : 'bg-slate-200'}`} />
                          ))}
                        </div>
                      )}
                      {bookedCount > 0 && isSelected && (
                        <div className="absolute bottom-2 flex gap-0.5">
                          {Array.from({ length: 3 }).map((_, slotIdx) => (
                            <div key={slotIdx} className={`h-1.5 w-1.5 rounded-full ${slotIdx < bookedCount ? 'bg-white' : 'bg-white/30'}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking Panel Side */}
          <aside className="sticky top-28 z-40 transition-all duration-500">
            {!selectedDate ? (
              <div className="rounded-[2rem] border border-slate-200 border-dashed bg-white/50 p-12 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-700">Select a Date</h3>
                <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-[250px] mx-auto">
                  Click any active date on the calendar grid to register or review sponsorship slots.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl shadow-slate-200/50">
                <div className="mb-8 border-b border-slate-100 pb-6 text-center">
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatDateLabel(selectedDate)}</h3>
                  {!isFutureDate(selectedDate) && selectedDate !== todayString && (
                    <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-500">Past Date</span>
                  )}
                  {selectedDate === todayString && (
                    <span className="mt-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700 ring-1 ring-inset ring-emerald-500/20">Today</span>
                  )}
                </div>

                {/* Status List */}
                <div className="space-y-4 mb-8">
                  {(["morning", "lunch", "dinner"] as const).map((slot) => {
                    const slotBooking = selectedBookings.find((item) => item.mealType === slot);
                    const isSelectedMeal = mealType === slot;

                    return (
                      <div
                        key={slot}
                        className={`relative flex items-center justify-between rounded-2xl p-4 transition-all ${isSelectedMeal
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02] z-10"
                          : slotBooking
                            ? "bg-slate-50 border border-slate-100"
                            : "bg-white border border-slate-200 hover:border-emerald-300"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSelectedMeal ? 'bg-white/20 text-white' : slotBooking ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                            {slot === 'morning' && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                            {slot === 'lunch' && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            {slot === 'dinner' && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                          </div>
                          <div>
                            <p className={`font-bold ${isSelectedMeal ? 'text-white' : 'text-slate-800'}`}>{mealLabel(slot)}</p>
                            {slotBooking ? (
                              <p className={`text-xs font-medium ${isSelectedMeal ? 'text-emerald-100' : 'text-slate-500'}`}>Reserved by {slotBooking.sponsorName}</p>
                            ) : (
                              <p className={`text-xs font-medium ${isSelectedMeal ? 'text-emerald-100' : 'text-emerald-600'}`}>Slot Available</p>
                            )}
                          </div>
                        </div>

                        {/* Selection Logic */}
                        {isFutureDate(selectedDate) && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setMealType(slot);
                              setCancelFlowActive(false);
                            }}
                            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelectedMeal ? 'border-white bg-white/20' : 'border-slate-300 bg-white group-hover:border-emerald-400'
                              }`}
                          >
                            {isSelectedMeal && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedCanBook ? (
                  <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs font-bold uppercase tracking-widest text-slate-400">Pledge Details</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <input
                            placeholder="Sponsor Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            required
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <input
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            required
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <input
                            placeholder="Email (Optional)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            type="email"
                          />
                        </div>
                      </div>
                      <textarea
                        placeholder="Any specific food notes? (e.g., Chicken Biryani for 50 people)"
                        value={foodNote}
                        onChange={(e) => setFoodNote(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
                        rows={3}
                      />

                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-60 disabled:hover:translate-y-0"
                      >
                        {loading ? "Processing..." : "Confirm Secure Sponsorship"}
                      </button>
                    </div>
                  </form>
                ) : selectedDate && selectedSlotBooking ? (
                  <div className="animate-in fade-in duration-500">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <p className="font-bold text-slate-800">Slot Unavailable</p>
                      <p className="mt-1 text-sm text-slate-500">This meal has already been pledged by {selectedSlotBooking.sponsorName}.</p>
                    </div>

                    {!cancelFlowActive ? (
                      <button
                        onClick={beginCancelFlow}
                        disabled={loading}
                        className="mt-6 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-red-600 hover:border-red-200 disabled:opacity-60"
                      >
                        Request Cancellation
                      </button>
                    ) : (
                      <div className="mt-6 animate-in slide-in-from-top-4 fade-in">
                        <div className="mb-4 text-center">
                          <p className="text-sm font-bold text-red-600 uppercase tracking-widest">Are you sure?</p>
                          <p className="text-xs text-slate-500 mt-1">Select an action below.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                          <button
                            type="button"
                            onClick={() => setShowSupportPanel(true)}
                            className="w-full rounded-2xl bg-slate-800 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-700"
                          >
                            Pay & Support
                          </button>
                          <button
                            type="button"
                            onClick={() => void performCancelBooking()}
                            disabled={loading}
                            className="w-full rounded-2xl bg-red-500 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-red-600 disabled:opacity-60"
                          >
                            Proceed with Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Optional Financial Panels */}
                {showSupportPanel && cancelFlowActive && (
                  <div className="mt-6 animate-in fade-in slide-in-from-top-4 rounded-2xl border-2 border-slate-900 bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <p className="text-lg font-bold">Donate Support</p>
                      <p className="mt-1 text-xs text-slate-400 mb-5">Provide arbitrary amount before canceling.</p>

                      <div className="flex gap-2 mb-4">
                        {["200", "500", "1000"].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setDonationAmount(amount)}
                            className={`flex-1 rounded-xl border py-2 text-sm font-bold transition-all ${donationAmount === amount
                              ? "border-emerald-400 bg-emerald-500 text-white shadow-lg"
                              : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                              }`}
                          >
                            {amount}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value || "1")}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-white focus:border-emerald-500 outline-none transition-all"
                        placeholder="Custom amount"
                      />
                      <div className="mt-5 bg-white p-4 rounded-2xl mx-auto w-fit shadow-lg shadow-black/50">
                        <img src={supportQrUrl} alt="QR code" className="h-40 w-40 rounded-lg" />
                      </div>
                      <button
                        type="button"
                        onClick={() => void performCancelBooking()}
                        disabled={loading}
                        className="mt-6 w-full rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-slate-900 shadow-md transition-all hover:bg-slate-100 disabled:opacity-60"
                      >
                        Confirmed & Delete Entry
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Give Zekath
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowZekathPanel((prev) => !prev)}
                    className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-widest"
                  >
                    {showZekathPanel ? "Close" : "Open"}
                  </button>
                </div>

                {showZekathPanel && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-4 bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <input
                      type="number"
                      min={1}
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value || "1")}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 focus:border-emerald-500 outline-none transition-all shadow-sm"
                      placeholder="Amount to process"
                    />
                    <div className="mt-4 bg-white p-3 rounded-xl border border-slate-100 mx-auto w-fit shadow-sm">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`${zakatBase} - Amount: ${donationAmount}`)}`}
                        alt="Zekath QR"
                        className="h-32 w-32 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
