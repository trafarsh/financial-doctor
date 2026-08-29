"use client";

import React from "react";

interface ScoreGaugeProps {
  score: number; // 0 to 100
  title: string;
  subtitle?: string;
  type?: "risk" | "diversification";
}

export function ScoreGauge({ score, title, subtitle, type = "risk" }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));

  // Determine color theme based on score and type
  let strokeColor = "#FCD535"; // yellow default
  let badgeText = "Moderate";
  let badgeBg = "bg-primary/15 text-primary border-primary/30";

  if (type === "risk") {
    if (clamped <= 33) {
      strokeColor = "#0ECB81"; // Lower risk = green
      badgeText = "Lower Risk";
      badgeBg = "bg-trading-up/15 text-trading-up border-trading-up/30";
    } else if (clamped >= 67) {
      strokeColor = "#F6465D"; // Higher risk = red
      badgeText = "Higher Risk";
      badgeBg = "bg-trading-down/15 text-trading-down border-trading-down/30";
    }
  } else {
    // Diversification: higher = better (green)
    if (clamped >= 67) {
      strokeColor = "#0ECB81";
      badgeText = "Well Diversified";
      badgeBg = "bg-trading-up/15 text-trading-up border-trading-up/30";
    } else if (clamped <= 33) {
      strokeColor = "#F6465D";
      badgeText = "Concentrated";
      badgeBg = "bg-trading-down/15 text-trading-down border-trading-down/30";
    } else {
      badgeText = "Moderate Spread";
    }
  }

  // Semi-circle gauge calculation
  const radius = 58;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="double-bezel p-5 flex flex-col items-center justify-between text-center relative overflow-hidden">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-xs font-semibold text-muted-strong uppercase tracking-wider">{title}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeBg}`}>
          {badgeText}
        </span>
      </div>

      {/* SVG Arc Gauge */}
      <div className="relative w-40 h-24 flex items-end justify-center my-1">
        <svg className="w-40 h-28 transform -rotate-180" viewBox="0 0 140 80">
          {/* Background Track */}
          <path
            d="M 12 70 A 58 58 0 0 1 128 70"
            fill="none"
            stroke="#2B3139"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Animated Value Arc */}
          <path
            d="M 12 70 A 58 58 0 0 1 128 70"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Numerical readout */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight leading-none">
            {clamped}
          </span>
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest mt-1">
            SCORE / 100
          </span>
        </div>
      </div>

      {subtitle && <p className="text-xs text-muted mt-2 max-w-xs">{subtitle}</p>}
    </div>
  );
}
