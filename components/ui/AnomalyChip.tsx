"use client";

import React from "react";
import { AnomalyFlag } from "@/lib/types";

interface AnomalyChipProps {
  flag: AnomalyFlag;
}

export function AnomalyChip({ flag }: AnomalyChipProps) {
  let badgeClass = "badge-low";
  if (flag.severity === "high") badgeClass = "badge-high";
  else if (flag.severity === "medium") badgeClass = "badge-medium";

  return (
    <div className="grid grid-cols-[auto_1fr] gap-3.5 p-3.5 border border-divider items-start bg-bg">
      <span className={`badge-severity ${badgeClass}`}>{flag.severity}</span>
      <div>
        <div className="font-heading font-800 text-sm mb-1 capitalize">
          {flag.type.replace("_", " ")}
        </div>
        <p className="text-xs text-ink/65 leading-relaxed">{flag.message}</p>
      </div>
    </div>
  );
}
