"use client";

import React, { useState } from "react";
import { Cpu, Send, Sparkles, BookOpen, ShieldAlert, ArrowRight, User, Bot, HelpCircle } from "lucide-react";
import { SourceList } from "@/components/ui/SourceList";
import { AIMessage } from "@/lib/types";

const SAMPLE_QUESTIONS = [
  "Why is my portfolio considered moderate risk?",
  "Explain my technology and equity concentration.",
  "What questions should I ask a SEBI adviser about my debt ratio?",
  "How does my cash buffer protect against market volatility?",
];

export default function CopilotPage() {
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "msg_intro",
      role: "assistant",
      content:
        "Welcome to your AI Financial Research Copilot. I analyze your portfolio allocations, risk metrics, and official regulatory guidance (SEBI/RBI) to answer financial questions in plain language.\n\n*Note: I provide educational decision support and never give personalized buy/sell directives.*",
      citations: [
        {
          id: "cit_intro",
          title: "SEBI Investor Education & Risk Guidance",
          url: "https://www.sebi.gov.in/investor-awareness.html",
          source: "SEBI",
        },
      ],
      timestamp: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (questionToSend?: string) => {
    const query = (questionToSend || inputQuery).trim();
    if (!query || loading) return;

    setInputQuery("");
    const userMsg: AIMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) throw new Error("Copilot response failed");
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content:
            "I encountered a temporary service issue. As an educational reminder, always verify your asset allocation with a licensed SEBI adviser before making portfolio modifications.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-hairline-dark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">AI Research Copilot</h1>
          </div>
          <p className="text-xs text-muted-strong mt-0.5">
            Context-aware financial literacy research assistant with verified regulatory citations.
          </p>
        </div>

        <div className="text-[10px] font-mono text-primary bg-ink px-3 py-1.5 rounded-lg border border-hairline-dark">
          NON-ADVISORY LITERACY ENGINE
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>Suggested Research Queries:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs bg-surface-card hover:bg-surface-elevated border border-hairline-dark hover:border-primary/50 px-3 py-1.5 rounded-lg text-body text-left transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Stream */}
      <div className="space-y-4 min-h-[350px]">
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={`p-5 rounded-xl border transition-all ${
                isAssistant ? "double-bezel" : "bg-ink border-hairline-dark ml-8"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isAssistant ? (
                  <>
                    <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <span className="text-xs font-bold text-white">Financial Doctor Copilot</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-md bg-surface-elevated text-muted-strong flex items-center justify-center">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-body">You</span>
                  </>
                )}
                <span className="text-[10px] font-mono text-muted ml-auto">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="text-xs text-body whitespace-pre-line leading-relaxed">
                {msg.content}
              </div>

              {/* Factors pill list if present */}
              {msg.factors && msg.factors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3">
                  {msg.factors.map((f, i) => (
                    <span key={i} className="text-[10px] bg-ink border border-hairline-dark px-2 py-0.5 rounded text-muted-strong font-mono">
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {/* Verified Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-hairline-dark">
                  <SourceList sources={msg.citations} title="Verified Grounding Citations" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="double-bezel p-5 flex items-center gap-3 text-xs text-muted-strong">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span>Consulting deterministic math engine & retrieving regulatory sources...</span>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <div className="double-bezel p-3 flex items-center gap-2 bg-ink">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question about your portfolio, risk, or regulatory guidance..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-muted outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputQuery.trim()}
          className="bg-primary hover:bg-primary-active disabled:opacity-30 text-primary-foreground p-2.5 rounded-lg font-bold transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
