"use client";

import React, { useState } from "react";
import { Cpu, Send, Sparkles, Paperclip, Terminal, User } from "lucide-react";
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
        "Welcome to your AI Financial Research Copilot. I analyze your portfolio allocations, risk metrics, and official regulatory guidance (SEBI/RBI) to answer financial questions in plain language.\n\nNote: I provide educational decision support and never give personalized buy/sell directives.",
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
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center gap-4 px-8 py-4 border-b-2 border-divider">
        <div className="font-heading font-800 text-base flex items-center gap-2">
          <Cpu className="w-4 h-4 text-accent" />
          Copilot
        </div>
        <div className="flex gap-1.5 ml-4">
          <span className="text-[11px] px-2.5 py-1 border border-divider font-heading font-600 bg-ink text-bg">
            Portfolio context
          </span>
          <span className="text-[11px] px-2.5 py-1 border border-divider font-heading font-600">Filings</span>
          <span className="text-[11px] px-2.5 py-1 border border-divider font-heading font-600">Web</span>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="btn btn-secondary"
          >
            New thread
          </button>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-8 pt-5 flex flex-col gap-2">
        <span className="kicker flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent" />
          Suggested research queries
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs bg-surface hover:bg-accent-100 border border-divider hover:border-accent px-3 py-1.5 text-ink text-left transition-colors font-heading font-600"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="px-8 py-7 flex flex-col gap-6 flex-1 overflow-auto">
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";

          if (!isAssistant) {
            return (
              <div
                key={msg.id}
                className="self-end max-w-[65%] bg-ink text-bg px-4.5 py-3.5 text-sm leading-relaxed"
              >
                {msg.content}
              </div>
            );
          }

          return (
            <div key={msg.id} className="max-w-[80%] flex flex-col gap-2.5">
              <div className="font-heading font-800 text-[10px] tracking-[0.14em] uppercase text-accent flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-accent inline-block" />
                finX Copilot
                {msg.citations && msg.citations.length > 0 && <> &middot; {msg.citations.length} sources</>}
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-line text-ink">{msg.content}</div>

              {/* Factor tags */}
              {msg.factors && msg.factors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {msg.factors.map((f, i) => (
                    <span key={i} className="tag tag-outline">
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {/* Source citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {msg.citations.map((c, i) => (
                    <span
                      key={c.id || i}
                      className="text-[10.5px] font-heading font-600 px-2 py-1 border border-divider bg-bg"
                    >
                      <span className="text-accent mr-1.5">{String(i + 1).padStart(2, "0")}</span>
                      {c.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="max-w-[80%] flex items-center gap-3 text-xs text-ink/60">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span>Consulting deterministic math engine &amp; retrieving regulatory sources...</span>
          </div>
        )}
      </div>

      {/* Suggestions + Input */}
      <div className="border-t-2 border-divider px-8 py-4 bg-surface">
        <div className="flex gap-2 flex-wrap mb-3">
          <span className="text-xs px-3 py-1.5 border border-divider font-heading font-600 cursor-pointer bg-bg text-ink">
            What about tax implications?
          </span>
          <span className="text-xs px-3 py-1.5 border border-divider font-heading font-600 cursor-pointer bg-bg text-ink">
            Show me a rebalancing plan
          </span>
        </div>
        <div className="bg-bg border border-divider px-3.5 py-3 flex flex-col gap-2.5">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a follow-up..."
            className="w-full bg-transparent text-sm text-ink placeholder-ink/40 outline-none"
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-1.5">
              <span className="text-[11px] px-2.5 py-1 border border-divider font-heading font-600 text-ink flex items-center gap-1">
                <Paperclip className="w-3 h-3" /> Attach
              </span>
              <span className="text-[11px] px-2.5 py-1 border border-divider font-heading font-600 text-ink flex items-center gap-1">
                <Terminal className="w-3 h-3" /> Commands
              </span>
            </div>
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputQuery.trim()}
              className="btn btn-primary"
            >
              Send <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
