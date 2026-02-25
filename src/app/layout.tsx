import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { buildThemeCss, resolveTheme } from "@/core/themes";
import { triggerHook } from "@/core/plugins/hooks";
import "@/plugins/bootstrap";

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
  keywords:
    "Levi Baligod, Filipino lawyer, anti-corruption, PDAF scam, pork barrel, public interest litigation, criminal law Philippines",
};

async function getThemeCss(): Promise<string> {
  try {
    await connectDB();
    const row = await Setting.findOne({ key: "siteTheme" }).lean() as { value?: unknown } | null;
    let parsed: Record<string, unknown> = {};
    if (row?.value) {
      parsed = typeof row.value === "string"
        ? (JSON.parse(row.value) as Record<string, unknown>)
        : (row.value as Record<string, unknown>);
    }
    return buildThemeCss(resolveTheme({ siteTheme: parsed }));
  } catch {
    return "";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [themeCss, { scripts: headScripts }] = await Promise.all([
    getThemeCss(),
    triggerHook("filterHeadScripts", { scripts: [] }),
  ]);

  return (
    <html lang="en">
      <head>
        {themeCss && (
          <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        )}
        {headScripts.map((script, i) => (
          <div
            key={i}
            dangerouslySetInnerHTML={{ __html: script }}
          />
        ))}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
