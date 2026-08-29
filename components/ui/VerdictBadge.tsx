"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, AlertOctagon, HelpCircle } from "lucide-react";
import { ScamVerdict } from "@/lib/types";

interface VerdictBadgeProps {
  verdict: ScamVerdict;
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  let label = "Unverifiable Claim";
  let bg = "bg-surface-elevated border-muted/40 text-muted-strong";
  let Icon = HelpCircle;

  switch (verdict) {
    case "likely_credible":
      label = "Likely Credible / Consistent with Guidelines";
      bg = "bg-trading-up/15 border-trading-up/40 text-trading-up";
      Icon = ShieldCheck;
      break;
    case "likely_misleading":
      label = "Likely Misleading / High Risk";
      bg = "bg-primary/15 border-primary/40 text-primary";
      Icon = ShieldAlert;
      break;
    case "likely_scam":
      label = "Potential Scam / Violation of Regulations";
      bg = "bg-trading-down/15 border-trading-down/40 text-trading-down";
      Icon = AlertOctagon;
      break;
    case "unverifiable":
    default:
      label = "Unverifiable (No Official Regulatory Match)";
      bg = "bg-surface-elevated border-muted/40 text-muted-strong";
      Icon = HelpCircle;
      break;
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${bg}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </div>
  );
}
