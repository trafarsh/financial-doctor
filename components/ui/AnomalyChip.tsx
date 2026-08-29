"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { AnomalyFlag } from "@/lib/types";

interface AnomalyChipProps {
  flag: AnomalyFlag;
}

export function AnomalyChip({ flag }: AnomalyChipProps) {
  let containerBg = "bg-surface-card border-hairline-dark";
  let iconColor = "text-muted";
  let badgeColor = "bg-surface-elevated text-muted-strong";
  let Icon = Info;

  if (flag.severity === "high") {
    containerBg = "bg-[#2B1B20] border-trading-down/30";
    iconColor = "text-trading-down";
    badgeColor = "bg-trading-down/20 text-trading-down border border-trading-down/40";
    Icon = AlertTriangle;
  } else if (flag.severity === "medium") {
    containerBg = "bg-[#272115] border-primary/30";
    iconColor = "text-primary";
    badgeColor = "bg-primary/20 text-primary border border-primary/40";
    Icon = AlertCircle;
  }

  return (
    <div className={`p-3.5 rounded-lg border flex items-start gap-3 transition-all ${containerBg}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-white capitalize">{flag.type.replace("_", " ")}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${badgeColor}`}>
            {flag.severity} Priority
          </span>
        </div>
        <p className="text-xs text-muted-strong leading-relaxed">{flag.message}</p>
      </div>
    </div>
  );
}
