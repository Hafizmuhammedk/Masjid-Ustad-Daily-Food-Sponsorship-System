"use client";

import { useEffect, useState } from "react";

type ThemeName = "emerald" | "ocean" | "sand" | "night";

const THEMES: { value: ThemeName; label: string }[] = [
  { value: "emerald", label: "Emerald" },
  { value: "ocean", label: "Ocean" },
  { value: "sand", label: "Sand" },
  { value: "night", label: "Night" }
];

const THEME_KEY = "masjid_theme";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeName>("emerald");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeName | null;
    const initial = saved && THEMES.some((item) => item.value === saved) ? saved : "emerald";
    document.documentElement.setAttribute("data-theme", initial);
    setTheme(initial);
  }, []);

  function handleChange(nextTheme: ThemeName) {
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  return (
    <div className="fixed right-3 top-3 z-50 rounded-xl border border-white/60 bg-white/85 p-2 shadow-lg backdrop-blur md:right-6 md:top-6">
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-mosque-700">Theme</label>
      <select
        value={theme}
        onChange={(event) => handleChange(event.target.value as ThemeName)}
        className="mt-1 rounded-lg border border-mosque-100 bg-white px-2 py-1 text-sm"
      >
        {THEMES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
