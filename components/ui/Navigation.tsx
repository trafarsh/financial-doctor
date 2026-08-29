"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  PieChart,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Sliders,
  Bell,
  FileText,
  History,
  Menu,
  X,
  PlusCircle,
  Sparkles,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

const PRIMARY_NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Portfolio", href: "/portfolio/overview", icon: PieChart },
  { name: "Markets", href: "/markets/overview", icon: TrendingUp },
  { name: "AI Copilot", href: "/copilot", icon: Cpu, badge: "AI" },
  { name: "Scam Check", href: "/scam-detector", icon: ShieldCheck },
  { name: "Simulator", href: "/simulator", icon: Sliders },
];

const MORE_NAV_ITEMS = [
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Audit Log", href: "/audit", icon: History },
];

const ALL_NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...MORE_NAV_ITEMS];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isMoreActive = MORE_NAV_ITEMS.some((item) => isActivePath(pathname, item.href));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-canvas-dark border-b border-hairline-dark sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-surface-card border border-hairline-dark flex items-center justify-center group-hover:border-primary transition-colors">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-lg tracking-tight text-white font-mono">FIN</span>
                <span className="font-extrabold text-lg tracking-tight text-primary font-mono">DOCTOR</span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-muted font-semibold -mt-1">
                AI INVESTOR COPILOT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-surface-card text-primary border border-hairline-dark font-semibold"
                      : "text-muted-strong hover:text-white hover:bg-ink border border-transparent"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted"}`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[9px] bg-primary/15 text-primary px-1 py-0.2 rounded font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* More Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isMoreActive || moreOpen
                    ? "bg-surface-card text-primary border border-hairline-dark font-semibold"
                    : "text-muted-strong hover:text-white hover:bg-ink border border-transparent"
                }`}
              >
                <MoreHorizontal className={`w-3.5 h-3.5 ${isMoreActive ? "text-primary" : "text-muted"}`} />
                <span>More</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              {moreOpen && (
                <div className="absolute top-full mt-1.5 right-0 w-48 bg-surface-card border border-hairline-dark rounded-lg shadow-lg py-1.5 z-50">
                  {MORE_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(pathname, item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
                          isActive ? "text-primary bg-ink" : "text-muted-strong hover:text-white hover:bg-ink"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted"}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <Link
              href="/import"
              className="bg-primary hover:bg-primary-active active:scale-[0.98] text-primary-foreground text-xs font-bold px-4 py-2 rounded-md flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Import Portfolio</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-muted-strong hover:text-white hover:bg-surface-card"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-primary" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-canvas-dark border-t border-hairline-dark px-4 pt-3 pb-6 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {ALL_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-surface-card text-primary border border-hairline-dark"
                    : "text-muted-strong hover:text-white hover:bg-ink"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-hairline-dark flex flex-col gap-2">
            <Link
              href="/networth"
              onClick={() => setMobileOpen(false)}
              className="text-center text-xs font-semibold text-body bg-surface-card py-2.5 rounded-md"
            >
              Zero-Asset Guided Wizard
            </Link>
            <Link
              href="/import"
              onClick={() => setMobileOpen(false)}
              className="text-center text-xs font-bold text-primary-foreground bg-primary py-2.5 rounded-md"
            >
              Import Portfolio
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
