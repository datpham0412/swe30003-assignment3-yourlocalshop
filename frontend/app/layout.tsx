import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

// Configure the main sans-serif font for the application.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure the monospace font for code and technical text.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Application metadata displayed in browser tabs and search results.
export const metadata: Metadata = {
  title: "Your Local Shop",
  description:
    "Your Neighbourhood Store, Now Online! Daily essentials and specialty items delivered city-wide.",
};

// Root layout component that wraps all pages with fonts and global styles.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
