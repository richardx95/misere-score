import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Misère Score Tracker",
  description: "Eenvoudig en foutloos scores bijhouden voor ons traditionele Misère kaartspel",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Misère Score",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="antialiased min-h-screen bg-[#f8f9fa] text-[#111111] selection:bg-neutral-200">
        {children}
      </body>
    </html>
  );
}
