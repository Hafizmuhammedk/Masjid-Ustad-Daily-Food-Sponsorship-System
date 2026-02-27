import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ThemeSwitcher from "@/components/theme-switcher";

export const metadata: Metadata = {
  title: "Masjid Ustad Daily Food Sponsorship",
  description: "Daily sponsorship booking system for Masjid Ustad"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
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
        <ThemeSwitcher />
        {children}
      </body>
    </html>
  );
}
