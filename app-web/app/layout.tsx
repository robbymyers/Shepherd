import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Anton } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const futura = localFont({
  src: "../public/fonts/FuturaCondensedBold.otf",
  variable: "--font-futura",
  display: "swap",
});

// Numerals only (cassette-futurism / athletic look). The repo's Futura
// Condensed Bold has wide geometric digits; Anton gives the bold, condensed
// poster numeral we want. Letters/titles stay Futura. Anton ships a single
// weight (400) — number styles request 400 to avoid faux-bolding.
const numFont = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-num",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shepherd",
  description: "CrossFit + running performance tracker for Rob Myers.",
  // Standalone home-screen launch opens the Events feed (see app/manifest.ts).
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Shepherd" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#171717",
};

// Set the theme attribute before first paint to avoid a flash.
const themeInit = `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',s||m);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${futura.variable} ${numFont.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
