import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { buildThemeCss, resolveTheme } from "@/core/themes";
import { getActiveTheme, loadThemeStyles } from "@/core/themes/loader";
import { triggerHook } from "@/core/plugins/hooks";
import "@/plugins/bootstrap";
import "@/themes/bootstrap";

/**
 * Parse raw HTML script strings (from plugins) into renderable React elements.
 * Supports:
 *   - External scripts:  <script async src="https://…"></script>
 *   - Inline scripts:    <script>…content…</script>
 */
function HeadScript({ html, idx }: { html: string; idx: number }) {
  // External script with src attribute
  const srcMatch = html.match(/<script[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (srcMatch) {
    const isDefer = /\bdefer\b/i.test(html);
    return (
      <Script
        key={idx}
        src={srcMatch[1]}
        strategy={isDefer ? "afterInteractive" : "afterInteractive"}
      />
    );
  }
  // Inline script
  const inlineMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (inlineMatch) {
    return (
      <script
        key={idx}
        dangerouslySetInnerHTML={{ __html: inlineMatch[1] }}
      />
    );
  }
  return null;
}

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

async function getThemeCss(): Promise<{ colorCss: string; assetCss: string }> {
  // Skip DB call entirely if setup hasn't been completed yet
  if (process.env.SETUP_COMPLETE !== "true") return { colorCss: "", assetCss: "" };
  try {
    await connectDB();
    const [themeRow, activeThemeName] = await Promise.all([
      Setting.findOne({ key: "siteTheme" }).lean() as Promise<{ value?: unknown } | null>,
      getActiveTheme(),
    ]);
    let parsed: Record<string, unknown> = {};
    if (themeRow?.value) {
      parsed = typeof themeRow.value === "string"
        ? (JSON.parse(themeRow.value) as Record<string, unknown>)
        : (themeRow.value as Record<string, unknown>);
    }
    const [colorCss, assetCss] = await Promise.all([
      Promise.resolve(buildThemeCss(resolveTheme({ siteTheme: parsed }))),
      loadThemeStyles(activeThemeName),
    ]);
    return { colorCss, assetCss };
  } catch {
    return { colorCss: "", assetCss: "" };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isSetupDone = process.env.SETUP_COMPLETE === "true";
  const [{ colorCss, assetCss }, { scripts: headScripts }] = await Promise.all([
    getThemeCss(),
    isSetupDone
      ? triggerHook("filterHeadScripts", { scripts: [] })
      : Promise.resolve({ scripts: [] as string[] }),
  ]);

  return (
    <html lang="en">
      <head>
        {/* Dynamic theme colors (primary, accent, fonts, radius) */}
        {colorCss && (
          <style dangerouslySetInnerHTML={{ __html: colorCss }} />
        )}
        {/* Static theme asset CSS (decorations, utility classes) */}
        {assetCss && (
          <style dangerouslySetInnerHTML={{ __html: assetCss }} />
        )}
        {headScripts.map((script, i) => (
          <HeadScript key={i} html={script} idx={i} />
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
