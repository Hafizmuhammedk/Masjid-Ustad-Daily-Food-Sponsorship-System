import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Masjid Ustad Daily Food Sponsorship",
  description: "Daily sponsorship booking system for Masjid Ustad"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body suppressHydrationWarning className="bg-slate-50 text-slate-800 antialiased selection:bg-emerald-200 selection:text-emerald-900">
        <Script id="strip-fdprocessedid" strategy="beforeInteractive">
          {`
            (function () {
              function strip() {
                var nodes = document.querySelectorAll('[fdprocessedid]');
                for (var i = 0; i < nodes.length; i++) {
                  nodes[i].removeAttribute('fdprocessedid');
                }
              }
              strip();
              new MutationObserver(strip).observe(document.documentElement, {
                attributes: true,
                subtree: true,
                attributeFilter: ['fdprocessedid']
              });
            })();
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
