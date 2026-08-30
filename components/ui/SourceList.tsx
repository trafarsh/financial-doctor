"use client";

import React from "react";
import { ExternalLink, BookOpen } from "lucide-react";
import { Source } from "@/lib/types";

interface SourceListProps {
  sources: Source[];
  title?: string;
}

export function SourceList({ sources, title = "Cited Regulatory Grounding Sources" }: SourceListProps) {
  if (!sources || sources.length === 0) {
    return (
      <div className="p-3 bg-surface border border-divider text-xs text-ink/55">
        No external regulatory citations attached.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 kicker">
        <BookOpen className="w-3.5 h-3.5 text-accent" />
        <span>{title}</span>
      </div>
      <div className="grid gap-2">
        {sources.map((src, idx) => (
          <a
            key={idx}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-bg border border-divider hover:border-accent transition-all group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-800 text-ink group-hover:text-accent transition-colors line-clamp-1">
                {src.title}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-ink/45 group-hover:text-accent shrink-0 ml-2" />
            </div>
            {src.snippet && (
              <p className="text-[11px] text-ink/65 mt-1 line-clamp-2 leading-relaxed">
                "{src.snippet}"
              </p>
            )}
            <span className="text-[10px] font-mono text-ink/45 mt-1.5 block truncate">
              {src.url}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
