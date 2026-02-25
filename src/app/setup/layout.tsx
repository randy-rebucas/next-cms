import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup | Installation Wizard",
  description: "Configure your site",
};

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
