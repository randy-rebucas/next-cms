import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import db from "@/lib/db";
import { buildThemeCss, resolveTheme } from "@/lib/theme";

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

// Prepared once at module level — reused on every server render
const _themeStmt = db.prepare("SELECT value FROM settings WHERE key = 'siteTheme'");

function getThemeCss(): string {
  try {
    const row = _themeStmt.get() as { value: string } | undefined;
    const parsed = row?.value ? (JSON.parse(row.value) as Record<string, unknown>) : {};
    return buildThemeCss(resolveTheme({ siteTheme: parsed }));
  } catch {
    return "";
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeCss = getThemeCss();

  return (
    <html lang="en">
      <head>
        {themeCss && (
          <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
