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

  let strokeColor = "var(--color-accent)";
  let badgeText = "Moderate";
  let badgeClass = "tag-neutral";

  if (type === "risk") {
    if (clamped <= 33) {
      strokeColor = "#0a7c4a";
      badgeText = "Lower Risk";
      badgeClass = "tag-neutral";
    } else if (clamped >= 67) {
      strokeColor = "var(--color-accent)";
      badgeText = "Higher Risk";
      badgeClass = "tag-accent";
    }
  } else {
    if (clamped >= 67) {
      strokeColor = "#0a7c4a";
      badgeText = "Well Diversified";
      badgeClass = "tag-neutral";
    } else if (clamped <= 33) {
      strokeColor = "var(--color-accent)";
      badgeText = "Concentrated";
      badgeClass = "tag-accent";
    } else {
      badgeText = "Moderate Spread";
    }
  }

  const radius = 58;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="bg-surface p-5 flex flex-col items-center justify-between text-center relative overflow-hidden border border-divider">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="kicker">{title}</span>
        <span className={`tag ${badgeClass}`}>{badgeText}</span>
      </div>

      <div className="relative w-40 h-24 flex items-end justify-center my-1">
        <svg className="w-40 h-28 transform -rotate-180" viewBox="0 0 140 80">
          <path
            d="M 12 70 A 58 58 0 0 1 128 70"
            fill="none"
            stroke="var(--color-neutral-300)"
            strokeWidth="10"
            strokeLinecap="round"
          />
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

        <div className="absolute bottom-3.5 flex flex-col items-center">
          <span className="text-3xl font-heading font-extrabold text-ink tracking-tight leading-none">
            {clamped}
          </span>
          <span className="text-[10px] font-heading text-ink/45 uppercase tracking-widest mt-1">
            SCORE / 100
          </span>
        </div>
      </div>

      {subtitle && <p className="text-xs text-ink/60 mt-2 max-w-xs">{subtitle}</p>}
    </div>
  );
}
