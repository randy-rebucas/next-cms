import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atty. Levito 'Levi' Baligod | Anti-Corruption Lawyer Philippines",
  description:
    "Atty. Levito 'Levi' Baligod is a Filipino anti-corruption lawyer and public interest advocate known for representing PDAF scam whistleblowers and filing malversation cases against public officials.",
  keywords: "Levi Baligod, Filipino lawyer, anti-corruption, PDAF scam, pork barrel, public interest litigation, criminal law Philippines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
