"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

export function DisclaimerBanner() {
  return (
    <div className="w-full bg-ink border-b-2 border-divider px-4 py-2 text-xs text-bg/70 flex items-center justify-center gap-2 tracking-wide select-none z-50">
      <ShieldAlert className="w-3.5 h-3.5 text-accent shrink-0" />
      <span>
        <strong className="text-bg font-semibold uppercase tracking-wider">Educational Notice:</strong>{" "}
        {APP_CONFIG.disclaimer.persistent}
      </span>
    </div>
  );
}
