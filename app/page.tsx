import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-emerald-600">Masjid Ustad</span>
          </div>
          <nav>
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:text-emerald-700"
            >
              Admin Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-20 md:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
              Community Food Sponsorship
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Nourishing our <span className="text-emerald-600">community</span> daily.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Sponsor future meal dates, keep daily food support organized, and easily manage schedules. Your contribution helps us provide regular meals to those in need.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/calendar"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
              >
                Open Calendar
              </Link>
            </div>
          </div>

          {/* Feature Highlight Card */}
          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="absolute -inset-4 rounded-3xl bg-emerald-50 opacity-50 blur-xl"></div>
            <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-6">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Simple Booking Flow</h3>
              <ul className="mt-5 space-y-4">
                <li className="flex items-start">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">1</span>
                  <span className="ml-3 text-sm text-slate-600">Pick an available date from the calendar</span>
                </li>
                <li className="flex items-start">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">2</span>
                  <span className="ml-3 text-sm text-slate-600">Choose meal type</span>
                </li>
                <li className="flex items-start">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">3</span>
                  <span className="ml-3 text-sm text-slate-600">Submit sponsor details</span>
                </li>
                <li className="flex items-start">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">4</span>
                  <span className="ml-3 text-sm text-slate-600">Date acts as booked instantly</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
