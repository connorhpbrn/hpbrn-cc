import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SmoothCursor } from "./smooth-cursor";
import { ThemeKey } from "./theme-key";
import "./globals.css";

// Resolve theme before first paint to avoid a flash: use the stored override
// if present, otherwise follow the system/browser preference.
const THEME_BOOT = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export const metadata: Metadata = {
  title: "connorhpbrn",
  metadataBase: new URL("https://hpbrn.co"),
  openGraph: {
    title: "connorhpbrn",
    url: "https://hpbrn.co",
    siteName: "connorhpbrn",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <SmoothCursor />
        <ThemeKey />
      </body>
    </html>
  );
}
