import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { Navigation } from "@/components/ui/Navigation";

const inter = Inter({
  subsets: ["latin"],
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
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-canvas-dark text-body font-sans min-h-screen flex flex-col antialiased selection:bg-primary selection:text-primary-foreground">
        <DisclaimerBanner />
        <Navigation />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="w-full bg-surface-card border-t border-hairline-dark py-8 text-center text-xs text-muted">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-semibold text-body">
              Financial Doctor (finX) — Educational Decision-Support Platform
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
