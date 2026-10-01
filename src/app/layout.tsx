import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadPilot | AI-powered lead discovery",
  description: "Tell LeadPilot what businesses to find and where to find them.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-canvas font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
