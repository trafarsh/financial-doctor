"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/ui/Navigation";
import { SyncStatus } from "@/components/ui/SyncStatus";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/onboarding"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (isPublic) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <Navigation />
        <main className="flex-1 w-full">{children}</main>
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
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      <Navigation />
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto">
        <main className="flex-1 w-full">{children}</main>
        <footer className="w-full bg-surface border-t-2 border-divider py-6 text-center text-xs text-ink/55 mt-auto">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p className="font-semibold text-ink">
              α-Financial Doctor (finX) — Educational Decision-Support Platform
            </p>
            <p>
              Not a registered investment adviser. Never provides personalized buy/sell directives. All money arithmetic is deterministic.
            </p>
          </div>
        </footer>
      </div>
      <SyncStatus />
    </div>
  );
}
