"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-8 md:px-8">
      <div className="grid w-full overflow-hidden rounded-3xl border border-mosque-100 bg-white/90 shadow-2xl backdrop-blur md:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-mosque-700 to-mosque-900 p-8 text-white md:block">
          <p className="text-sm uppercase tracking-wider text-mosque-100">Masjid Ustad</p>
          <h1 className="mt-3 text-3xl font-bold">Admin Access</h1>
          <p className="mt-3 text-sm text-mosque-100">
            Securely manage daily sponsorship bookings, monitor monthly schedules, and cancel entries if required.
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-mosque-800">Login</h2>
          <p className="mt-1 text-sm text-mosque-600">Use admin credentials to continue.</p>
          {error ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <div className="mt-5 grid gap-3">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border border-mosque-100 px-3 py-2"
              required
            />
            <input
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-mosque-100 px-3 py-2"
              type="password"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-mosque-500 px-4 py-2 font-medium text-white transition hover:bg-mosque-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login to Dashboard"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
