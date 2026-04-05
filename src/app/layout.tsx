// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const runtime = 'edge';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DFS UI - Open-Source Interface for DataForSEO",
  description: "A managed, edge-cached, and open-source dashboard for interacting with the DataForSEO API. Bring your own keys and save on API costs.",
  metadataBase: new URL('https://dfsui.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "DFS UI",
    description: "Open-Source Interface for DataForSEO",
    url: 'https://dfsui.com',
    siteName: 'DFS UI',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-gray-200 text-slate-900 dark:text-slate-50">
        {children}
      </body>
    </html>
  );
}