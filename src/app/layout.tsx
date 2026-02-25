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
  title: "nextCMS",
  description: "Powered by nextCMS",
};

async function getThemeCss(): Promise<string> {
  // Skip DB call entirely if setup hasn't been completed yet
  if (process.env.SETUP_COMPLETE !== "true") return "";
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
  const isSetupDone = process.env.SETUP_COMPLETE === "true";
  const [themeCss, { scripts: headScripts }] = await Promise.all([
    getThemeCss(),
    isSetupDone
      ? triggerHook("filterHeadScripts", { scripts: [] })
      : Promise.resolve({ scripts: [] as string[] }),
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
