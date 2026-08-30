"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_SECTIONS: { label: string; items: { name: string; href: string }[] }[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Portfolio", href: "/portfolio/overview" },
      { name: "Markets", href: "/markets/overview" },
    ],
  },
  {
    label: "AI tools",
    items: [
      { name: "Copilot", href: "/copilot" },
      { name: "Scam detector", href: "/scam-detector" },
      { name: "Simulator", href: "/simulator" },
      { name: "Debt comparison", href: "/debt-compare" },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Reports", href: "/reports" },
      { name: "Alerts", href: "/alerts" },
      { name: "Audit log", href: "/audit" },
      { name: "Settings", href: "/settings" },
    ],
  },
];

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/onboarding"];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation() {
  const pathname = usePathname();

  if (PUBLIC_ROUTES.includes(pathname)) {
    return (
      <nav className="nav bg-bg">
        <Link href="/" className="nav-brand flex items-center gap-2">
          <span className="w-3.5 h-3.5 bg-accent inline-block" />
          finX
        </Link>
        <Link href="/dashboard" className="text-sm">Features</Link>
        <Link href="/dashboard" className="text-sm">Pricing</Link>
        <Link href="/dashboard" className="text-sm">Docs</Link>
        <Link href="/login" className="btn btn-secondary ml-4">Log in</Link>
        <Link href="/signup" className="btn btn-primary">Get started →</Link>
      </nav>
    );
  }

  return (
    <aside className="hidden lg:flex w-[240px] shrink-0 bg-ink text-bg flex-col py-5 border-r-2 border-divider">
      <Link
        href="/dashboard"
        className="px-5 pb-5 font-heading font-extrabold text-xl flex items-center gap-2 border-b-2"
        style={{ borderColor: "color-mix(in srgb, var(--color-bg) 15%, transparent)" }}
      >
        <span className="w-3.5 h-3.5 bg-accent inline-block" />
        finX
      </Link>
      {NAV_SECTIONS.map((section) => (
        <div
          key={section.label}
          className="py-4 border-b"
          style={{ borderColor: "color-mix(in srgb, var(--color-bg) 12%, transparent)" }}
        >
          <div
            className="px-5 pb-2 text-[10px] tracking-widest uppercase font-semibold"
            style={{ color: "color-mix(in srgb, var(--color-bg) 45%, transparent)" }}
          >
            {section.label}
          </div>
          {section.items.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className="block px-5 py-2.5 text-[13px] font-semibold"
                style={
                  active
                    ? { background: "var(--color-accent)", color: "var(--color-bg)" }
                    : { color: "color-mix(in srgb, var(--color-bg) 70%, transparent)" }
                }
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      ))}
      <div
        className="mt-auto px-5 py-3.5 border-t-2 flex items-center gap-2.5 text-xs"
        style={{ borderColor: "color-mix(in srgb, var(--color-bg) 15%, transparent)" }}
      >
        <span className="w-7 h-7 bg-accent text-bg grid place-items-center font-heading font-extrabold text-[11px]">
          AK
        </span>
        <div>
          <div className="font-semibold">Aditi Kumar</div>
          <div className="opacity-50 text-[11px]">Free trial · 12 days left</div>
        </div>
      </div>
    </aside>
  );
}
