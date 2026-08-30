"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, AlertOctagon, HelpCircle } from "lucide-react";
import { ScamVerdict } from "@/lib/types";

interface VerdictBadgeProps {
  verdict: ScamVerdict;
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  let label = "Unverifiable Claim";
  let style: React.CSSProperties = { background: "var(--color-neutral-200)", color: "var(--color-text)" };
  let Icon = HelpCircle;

  switch (verdict) {
    case "likely_credible":
      label = "Likely Credible / Consistent with Guidelines";
      style = { background: "#e6f4ec", color: "#0a7c4a" };
      Icon = ShieldCheck;
      break;
    case "likely_misleading":
      label = "Likely Misleading / High Risk";
      style = { background: "var(--color-accent-100)", color: "var(--color-accent-800)" };
      Icon = ShieldAlert;
      break;
    case "likely_scam":
      label = "Potential Scam / Violation of Regulations";
      style = { background: "var(--color-accent)", color: "var(--color-bg)" };
      Icon = AlertOctagon;
      break;
    case "unverifiable":
    default:
      label = "Unverifiable (No Official Regulatory Match)";
      style = { background: "var(--color-neutral-200)", color: "var(--color-text)" };
      Icon = HelpCircle;
      break;
  }

  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-heading font-800 uppercase tracking-wider"
      style={style}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </div>
  );
}
