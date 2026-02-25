/**
 * plugins/analytics/index.ts
 *
 * Analytics plugin — injects a Google Analytics 4 (gtag.js) snippet into
 * every page's <head> when `settings.analyticsId` is configured.
 */
import { registerHook } from "@/core/plugins/hooks";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import type { PluginManifest } from "@/core/plugins";

async function getAnalyticsId(): Promise<string | null> {
  try {
    await connectDB();
    const row = await Setting.findOne({ key: "analyticsId" }).lean() as { value?: string } | null;
    return row?.value?.trim() || null;
  } catch {
    return null;
  }
}

export const analyticsPlugin: PluginManifest = {
  id: "analytics",
  register() {
    registerHook("filterHeadScripts", async (payload) => {
      const id = await getAnalyticsId();
      if (!id) return payload;
      return {
        scripts: [
          ...payload.scripts,
          `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>`,
          `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');</script>`,
        ],
      };
    });
  },
};
