"use client";

import { useEffect, useState } from "react";

type DashboardBooking = {
  id: number;
  bookingDate: string;
  foodNote: string | null;
  mealType: "morning" | "lunch" | "dinner";
  status: string;
  sponsor: {
    id: number;
    fullName: string;
    phone: string;
    email: string | null;
  } | null;
};

function mealLabel(mealType: "morning" | "lunch" | "dinner"): string {
  if (mealType === "morning") return "Breakfast";
  if (mealType === "lunch") return "Lunch";
  return "Dinner";
}

export default function DashboardPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getUTCMonth() + 1);
  const [year, setYear] = useState(today.getUTCFullYear());
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/bookings?month=${month}&year=${year}`, {
        cache: "no-store"
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Failed to load bookings");
      }
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings().catch(() => undefined);
  }, [month, year]);

  async function cancelBooking(id: number) {
    setError("");
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Cancel failed");
      }
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-mosque-100 bg-white/85 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-mosque-800">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-mosque-600">View monthly sponsorships and cancel bookings when needed.</p>
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

        {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p> : null}
        {loading ? <p className="mt-4 text-sm text-mosque-700">Loading bookings...</p> : null}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-mosque-100 bg-white shadow">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-mosque-50 text-mosque-700">
                <th className="p-3">Date</th>
                <th className="p-3">Sponsor</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Food Note</th>
                <th className="p-3">Meal Time</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b last:border-b-0 hover:bg-mosque-50/60">
                  <td className="p-3 font-medium">{new Date(booking.bookingDate).toISOString().slice(0, 10)}</td>
                  <td className="p-3">{booking.sponsor?.fullName ?? "-"}</td>
                  <td className="p-3">{booking.sponsor?.phone ?? "-"}</td>
                  <td className="p-3">{booking.sponsor?.email ?? "-"}</td>
                  <td className="p-3">{booking.foodNote ?? "-"}</td>
                  <td className="p-3">{mealLabel(booking.mealType)}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-white transition hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-600" colSpan={8}>
                    No bookings found for selected month.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
