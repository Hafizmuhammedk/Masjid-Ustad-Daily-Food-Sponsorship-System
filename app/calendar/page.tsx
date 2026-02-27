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
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [foodNote, setFoodNote] = useState("");
  const [mealType, setMealType] = useState<"morning" | "lunch" | "dinner">("morning");
  const [donationAmount, setDonationAmount] = useState("500");
  const [showSupportPanel, setShowSupportPanel] = useState(false);
  const [showZekathPanel, setShowZekathPanel] = useState(false);
  const [cancelFlowActive, setCancelFlowActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBookings() {
    const response = await fetch(`/api/bookings?month=${month}&year=${year}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message ?? "Failed to load bookings");
    }
    setBookings(data);
  }

  useEffect(() => {
    loadBookings().catch((err: Error) => setError(err.message));
  }, [month, year]);

  const todayString = useMemo(() => {
    const today = new Date();
    return new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    ).toISOString().slice(0, 10);
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
      if (!sponsorResponse.ok) {
        throw new Error(sponsorData.message ?? "Sponsor creation failed");
      }

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
      if (!bookingResponse.ok) {
        throw new Error(bookingData.message ?? "Booking failed");
      }

      setSuccess("Sponsorship booked successfully.");
      setFullName("");
      setPhone("");
      setEmail("");
      setFoodNote("");
      setMealType("morning");
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
      if (!response.ok) {
        throw new Error(data.message ?? "Failed to cancel booking");
      }
      setSuccess("Booking cancelled.");
      setCancelFlowActive(false);
      setShowSupportPanel(false);
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function beginCancelFlow() {
    setCancelFlowActive(true);
    setShowSupportPanel(false);
  }

  function handleSkipAndCancel() {
    void performCancelBooking();
  }

  function handlePayAndContinue() {
    setShowSupportPanel(true);
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-mosque-100 bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-mosque-900 md:text-4xl">Daily Sponsorship Calendar</h1>
            <p className="mt-2 text-mosque-700">Click any date to view details or sponsor an available future day.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-mosque-50 p-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-xl border border-mosque-100 bg-white px-3 py-2"
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Date(Date.UTC(2026, index, 1)).toLocaleDateString("en-US", {
                    month: "long",
                    timeZone: "UTC"
                  })}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-28 rounded-xl border border-mosque-100 bg-white px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">Available</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Partially booked</span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">Booked</span>
          <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-700">Past Date</span>
        </div>

        {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p> : null}
        {success ? <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-green-700">{success}</p> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border border-mosque-100 bg-white p-4 shadow">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-mosque-800">{monthTitle}</h2>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-mosque-600">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstWeekday }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateString = toDateString(day);
                const bookedCount = bookedMap.get(dateString)?.length ?? 0;
                const isFullyBooked = bookedCount === 3;
                const isPartiallyBooked = bookedCount > 0 && bookedCount < 3;
                const isFuture = isFutureDate(dateString);
                const isSelected = selectedDate === dateString;
                const baseColor = isFullyBooked
                  ? "bg-red-50 text-red-700 border-red-200"
                  : isPartiallyBooked
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                  : isFuture
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-500 border-gray-200";

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
                    className={`h-14 rounded-xl border text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow ${
                      isSelected ? "ring-2 ring-mosque-500" : ""
                    } ${baseColor}`}
                  >
                    <span>{day}</span>
                    {bookedCount > 0 ? <span className="ml-1 text-[10px]">({bookedCount}/3)</span> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="rounded-2xl border border-mosque-100 bg-white p-5 shadow">
            {!selectedDate ? (
              <div>
                <h3 className="text-lg font-semibold text-mosque-800">Pick a Date</h3>
                <p className="mt-2 text-mosque-700">Select any date on the calendar to view booking status.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-mosque-900">{formatDateLabel(selectedDate)}</h3>

                {selectedDate ? (
                  <div className="mt-4 space-y-2 rounded-xl border border-mosque-100 bg-mosque-50 p-3 text-sm">
                    <p className="font-semibold text-mosque-800">Meal Availability</p>
                    {(["morning", "lunch", "dinner"] as const).map((slot) => {
                      const slotBooking = selectedBookings.find((item) => item.mealType === slot);
                      return (
                        <div key={slot} className="rounded-lg border border-mosque-100 bg-white p-2">
                          <span className="font-medium">{mealLabel(slot)}:</span>{" "}
                          {slotBooking ? (
                            <span>
                              Booked by {slotBooking.sponsorName}
                              {slotBooking.foodNote ? ` (${slotBooking.foodNote})` : ""}
                            </span>
                          ) : (
                            <span className="text-green-700">Available</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {selectedDate && isFutureDate(selectedDate) ? (
                  <div className="mt-3">
                    <label className="mb-1 block text-sm font-medium text-mosque-800">Select Meal Slot</label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value as "morning" | "lunch" | "dinner")}
                      className="w-full rounded-xl border border-mosque-100 px-3 py-2"
                    >
                      <option value="morning">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                ) : null}

                {selectedCanBook ? (
                  <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
                    <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
                      This meal slot is available. Submit details to sponsor.
                    </p>
                    <input
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="rounded-xl border border-mosque-100 px-3 py-2"
                      required
                    />
                    <input
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl border border-mosque-100 px-3 py-2"
                      required
                    />
                    <input
                      placeholder="Email (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl border border-mosque-100 px-3 py-2"
                      type="email"
                    />
                    <textarea
                      placeholder="Food description"
                      value={foodNote}
                      onChange={(e) => setFoodNote(e.target.value)}
                      className="rounded-xl border border-mosque-100 px-3 py-2"
                      rows={4}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl bg-mosque-500 px-4 py-2 font-medium text-white transition hover:bg-mosque-700 disabled:opacity-60"
                    >
                      {loading ? "Submitting..." : "Confirm Sponsorship"}
                    </button>
                  </form>
                ) : selectedDate && selectedSlotBooking ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-mosque-800">
                    <p className="font-semibold text-red-700">Selected slot already booked</p>
                    <p className="mt-1">
                      <span className="font-semibold">Meal:</span> {mealLabel(selectedSlotBooking.mealType)}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Sponsor:</span> {selectedSlotBooking.sponsorName}
                    </p>
                    {!cancelFlowActive ? (
                      <button
                        onClick={beginCancelFlow}
                        disabled={loading}
                        className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Cancel This Booking
                      </button>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handlePayAndContinue}
                          disabled={loading}
                          className="rounded-lg border border-mosque-300 bg-white px-3 py-1.5 font-medium text-mosque-800 hover:bg-mosque-50 disabled:opacity-60"
                        >
                          Pay
                        </button>
                        <button
                          type="button"
                          onClick={handleSkipAndCancel}
                          disabled={loading}
                          className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          Skip & Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl bg-gray-100 px-3 py-3 text-sm text-gray-700">
                    Past dates cannot be booked.
                  </p>
                )}

                {showSupportPanel && cancelFlowActive ? (
                  <div className="mt-5 rounded-xl border border-mosque-100 bg-white p-3">
                    <p className="text-sm font-semibold text-mosque-800">Support Ustad Before Cancel</p>
                    <p className="mt-1 text-xs text-mosque-600">Pay money, then confirm cancellation.</p>
                    <div className="mt-3 flex gap-2">
                      {["200", "500", "1000"].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setDonationAmount(amount)}
                          className={`rounded-lg border px-3 py-1 text-sm ${
                            donationAmount === amount
                              ? "border-mosque-500 bg-mosque-100 text-mosque-800"
                              : "border-mosque-100 bg-white"
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
                      className="mt-3 w-full rounded-lg border border-mosque-100 px-3 py-2 text-sm"
                      placeholder="Enter amount"
                    />
                    <img src={supportQrUrl} alt="Donation QR code" className="mx-auto mt-3 h-52 w-52 rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => void performCancelBooking()}
                      disabled={loading}
                      className="mt-3 w-full rounded-lg bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      Done Payment, Cancel Booking
                    </button>
                  </div>
                ) : null}

                <div className="mt-5 rounded-xl border border-mosque-100 bg-white p-3">
                  <p className="text-sm font-semibold text-mosque-800">Zekath for Ustad</p>
                  <p className="mt-1 text-xs text-mosque-600">
                    This is separate from cancellation. Click button to show zekath QR.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowZekathPanel((prev) => !prev)}
                    className="mt-3 rounded-lg border border-mosque-300 bg-white px-3 py-1.5 font-medium text-mosque-800 hover:bg-mosque-50"
                  >
                    {showZekathPanel ? "Hide Zekath QR" : "Show Zekath QR"}
                  </button>
                  {showZekathPanel ? (
                    <>
                      <input
                        type="number"
                        min={1}
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value || "1")}
                        className="mt-3 w-full rounded-lg border border-mosque-100 px-3 py-2 text-sm"
                        placeholder="Enter amount"
                      />
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                          `${zakatBase} - Amount: ${donationAmount}`
                        )}`}
                        alt="Zekath QR code"
                        className="mx-auto mt-3 h-52 w-52 rounded-lg border"
                      />
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
