"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/ui/Navigation";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/onboarding"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (isPublic) {
    return (
      <>
        <Navigation />
        <main className="flex-1 w-full">{children}</main>
      </>
    );
  }

  return (
    <div className="flex-1 w-full flex">
      <Navigation />
      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}
