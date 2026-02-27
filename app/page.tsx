import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 md:px-8">
      <section className="grid w-full gap-8 rounded-3xl border border-mosque-100 bg-white/85 p-8 shadow-2xl backdrop-blur lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="inline-block rounded-full bg-mosque-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-mosque-700">
            Community Service Platform
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-mosque-900 md:text-5xl">
            Masjid Ustad Daily
            <br />
            Food Sponsorship System
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-mosque-700">
            Sponsor future meal dates, keep daily food support organized, and let admins manage schedules from one
            clean dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/calendar"
              className="rounded-xl bg-mosque-500 px-6 py-3 font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-mosque-700"
            >
              Open Public Calendar
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-mosque-300 bg-white px-6 py-3 font-semibold text-mosque-700 transition hover:bg-mosque-50"
            >
              Admin Login
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-mosque-700 to-mosque-900 p-6 text-white shadow-xl">
          <h2 className="text-xl font-semibold">How It Works</h2>
          <ul className="mt-4 space-y-3 text-sm text-mosque-50">
            <li>1. Choose a future date from the calendar.</li>
            <li>2. Submit sponsor details and food plan.</li>
            <li>3. Date is instantly marked as booked for everyone.</li>
            <li>4. Admin can review and cancel bookings securely.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
