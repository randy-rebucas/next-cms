/**
 * plugins/consultation-booking/index.ts
 *
 * Consultation Booking plugin — date/time slot picker for booking a free
 * 30-minute consultation, rendered as a tab inside the Tools Section.
 *
 * Time slots and unavailable periods are hardcoded by default; the admin
 * panel allows editing them, persisted as `bookingConfig` in site settings.
 *
 * Admin panel: src/plugins/consultation-booking/admin.tsx
 * Component:   src/plugins/consultation-booking/Component.tsx
 */
import type { PluginManifest } from "@/core/plugins";

export const consultationBookingPlugin: PluginManifest = {
  id: "consultation-booking",
  register() {
    // UI-only plugin — no data hooks to register.
  },
};

// Re-export component and types for convenience
export { default as ConsultationBooking, defaultConfig } from "./Component";
export type { ConsultationBookingProps, BookingConfig } from "./Component";
