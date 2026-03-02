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
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/bookings?month=${month}&year=${year}`, {
        cache: "no-store",
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
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* Premium Header */}
      <div className="bg-emerald-700 pb-32 pt-12 relative overflow-hidden shadow-lg">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-600 opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-800 opacity-30 blur-2xl"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 opacity-90 text-emerald-100 text-sm font-semibold tracking-wide uppercase">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure Portal
              </div>
              <h1 className="text-4xl text-white font-extrabold tracking-tight sm:text-5xl">
                Command Center
              </h1>
              <p className="mt-3 text-emerald-100 max-w-xl text-lg">
                Manage all community sponsorships. Review active bookings, contact sponsors, or cancel dates as necessary.
              </p>
            </div>

            <div className="flex flex-row items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="appearance-none bg-white/90 border-transparent text-emerald-900 font-semibold rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none cursor-pointer transition-all shadow-sm"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23065f46%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right .75rem top 50%", backgroundSize: "12px auto" }}
              >
                {Array.from({ length: 12 }).map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {new Date(Date.UTC(2026, index, 1)).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-24 bg-white/90 border-transparent text-emerald-900 font-semibold rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all shadow-sm text-center"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 md:px-8 -mt-24 relative z-20">
        {error ? (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-white p-5 text-sm font-medium text-red-700 shadow-lg shadow-red-100/50">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        ) : null}

        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-24">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-slate-100"></div>
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-6 text-slate-500 font-medium animate-pulse">Syncing bookings database...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 border-8 border-white shadow-inner">
                <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">No Bookings Yet</h3>
              <p className="mt-2 text-slate-500 max-w-sm">There are no food sponsorships registered for this selected month entirely.</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 uppercase tracking-wider text-xs font-bold text-slate-500">
                    <th className="px-6 py-5 rounded-tl-3xl">Date</th>
                    <th className="px-6 py-5">Sponsor Details</th>
                    <th className="px-6 py-5 hidden md:table-cell">Contact</th>
                    <th className="px-6 py-5">Meal Info</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right rounded-tr-3xl">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="group transition-colors hover:bg-slate-50/80">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-slate-900">{new Date(booking.bookingDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span>
                          <span className="text-xs font-semibold text-slate-400 uppercase">{new Date(booking.bookingDate).getFullYear()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                            {booking.sponsor?.fullName.charAt(0).toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{booking.sponsor?.fullName ?? "Unknown Sponsor"}</div>
                            <div className="text-sm text-slate-500 md:hidden">{booking.sponsor?.phone ?? "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell align-middle text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {booking.sponsor?.phone ?? "-"}
                          </span>
                          {booking.sponsor?.email && (
                            <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                              {booking.sponsor.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                            {mealLabel(booking.mealType)}
                          </span>
                          {booking.foodNote && (
                            <span className="mt-1 block max-w-[200px] truncate text-xs text-slate-500 italic" title={booking.foodNote}>
                              "{booking.foodNote}"
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-sm font-semibold text-slate-700 capitalize w-16">{booking.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-red-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-red-50 hover:border-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Drop
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
