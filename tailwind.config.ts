import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        mosque: {
          50: "#eef7f1",
          100: "#d8ede0",
          300: "#86c3a1",
          500: "#2e8f5a",
          600: "#24764a",
          700: "#1e6140",
          900: "#103224"
        }
      }
    }
  },
  plugins: []
};

export default config;
