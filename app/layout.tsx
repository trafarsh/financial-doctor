import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/ui/AppShell";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Financial Doctor — AI Investor & Financial Literacy Copilot",
  description:
    "AI-powered portfolio intelligence, deterministic risk modeling, RAG research copilot, scam detector, and what-if simulation engine for retail investors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-ink font-sans min-h-screen flex flex-col antialiased selection:bg-accent-300 selection:text-accent-900">
        <AppShell>{children}</AppShell>
        <footer className="w-full bg-surface border-t-2 border-divider py-8 text-center text-xs text-ink/55">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-semibold text-ink">
              α-Financial Doctor (finX) — Educational Decision-Support Platform
            </p>
            <p>
              Not a registered investment adviser. Never provides personalized buy/sell directives. All money arithmetic is deterministic.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
