"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 md:px-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50">
        <div className="bg-emerald-600 p-8 text-center sm:p-10 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500 opacity-50 blur-2xl"></div>
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-emerald-400 opacity-40 blur-xl"></div>

          <Link href="/" className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white shadow-sm">Admin Access</h1>
          <p className="mt-2 text-sm font-medium text-emerald-100">
            Secure connection to Masjid Ustad
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 sm:p-10">
          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-start gap-3">
              <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          ) : null}

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Username</label>
              <input
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
              </div>
              <input
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                type="password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </div>
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
              &larr; Back to Home
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
