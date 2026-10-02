import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadPilot | AI Lead Discovery & Autonomous Outreach",
  description: "Autonomous lead intelligence engine powered by Google Places, n8n workflows, and Neon database.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D16] font-sans text-slate-100 antialiased min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Ambient Lighting Gradients */}
          <div className="absolute -top-40 left-1/4 w-[600px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />
          <div className="absolute bottom-10 left-1/3 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[140px]" />
        </div>
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
