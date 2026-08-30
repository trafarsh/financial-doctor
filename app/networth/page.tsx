"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  Coins,
  Home,
  CreditCard,
  Building,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AssetInput, LiabilityInput } from "@/lib/types";

const STEPS = [
  {
    id: "bank",
    title: "Liquid Savings & Bank Accounts",
    question: "Roughly how much do you keep across savings accounts, fixed deposits, or emergency cash?",
    icon: Wallet,
    category: "asset",
    type: "bank",
    quickChips: [50000, 100000, 250000, 500000],
  },
  {
    id: "equity",
    title: "Stocks, ETFs & HFUNDs",
    question: "What is the approximate market value of your shares, SIPs, and HFUND portfolios?",
    icon: TrendingUp,
    category: "asset",
    type: "stock",
    quickChips: [100000, 300000, 600000, 1500000],
  },
  {
    id: "gold",
    title: "Gold & Sovereign Gold Bonds",
    question: "Estimated value of any physical gold, jewelry, or Sovereign Gold Bonds (SGBs)?",
    icon: Coins,
    category: "asset",
    type: "gold",
    quickChips: [50000, 200000, 500000, 1000000],
  },
  {
    id: "real_estate",
    title: "Real Estate & Land",
    question: "Estimated equity value of any residential property, plots, or commercial real estate?",
    icon: Home,
    category: "asset",
    type: "real_estate",
    quickChips: [0, 2500000, 5000000, 10000000],
  },
  {
    id: "loans",
    title: "Auto, Personal & Education Loans",
    question: "What is your total outstanding balance across vehicle, personal, or education loans?",
    icon: Building,
    category: "liability",
    type: "loan",
    quickChips: [0, 200000, 500000, 1000000],
  },
  {
    id: "credit_card",
    title: "Credit Card Dues & Unpaid Balances",
    question: "Do you have any rolling or unpaid credit card dues this billing cycle?",
    icon: CreditCard,
    category: "liability",
    type: "credit_card",
    quickChips: [0, 25000, 75000, 150000],
  },
];

export default function GuidedNetWorthWizard() {
  const router = useRouter();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({
    bank: 200000,
    equity: 600000,
    gold: 200000,
    real_estate: 0,
    loans: 500000,
    credit_card: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const step = STEPS[currentStepIdx];
  const isLastStep = currentStepIdx === STEPS.length - 1;
  const progressPct = ((currentStepIdx + 1) / STEPS.length) * 100;

  const handleChipClick = (val: number) => {
    setAnswers({ ...answers, [step.id]: val });
  };

  const handleNext = () => {
    if (isLastStep) {
      saveAndFinish();
    } else {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const saveAndFinish = async () => {
    setSubmitting(true);

    const assets: AssetInput[] = [];
    const liabilities: LiabilityInput[] = [];

    if (answers.bank > 0) {
      assets.push({ type: "bank", name: "Savings & Deposits", value: answers.bank });
    }
    if (answers.equity > 0) {
      assets.push({ type: "stock", name: "Equity & HFUNDs", value: answers.equity, sector: "Diversified" });
    }
    if (answers.gold > 0) {
      assets.push({ type: "gold", name: "Gold Holdings", value: answers.gold });
    }
    if (answers.real_estate > 0) {
      assets.push({ type: "real_estate", name: "Real Estate Property", value: answers.real_estate });
    }

    if (answers.loans > 0) {
      liabilities.push({ type: "loan", name: "Outstanding Loans", amount: answers.loans, interestRate: 9.0 });
    }
    if (answers.credit_card > 0) {
      liabilities.push({ type: "credit_card", name: "Credit Card Balance", amount: answers.credit_card });
    }

    try {
      await fetch("/api/portfolio/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets, liabilities }),
      });
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  const Icon = step.icon;

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      {/* Progress Header */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-between text-xs font-heading font-semibold text-ink/65">
          <span>Step {currentStepIdx + 1} of {STEPS.length}</span>
          <span className="text-accent">{Math.round(progressPct)}% Completed</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-300 relative">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step Card */}
      <div className="bg-surface border-2 border-ink p-8 space-y-6">
        <div className="flex items-center gap-3 border-b-2 border-divider pb-4">
          <div className="w-12 h-12 bg-bg border border-divider flex items-center justify-center">
            <Icon className="w-6 h-6 text-accent" />
          </div>
          <div>
            <span className="kicker-accent block mb-1">
              {step.category === "asset" ? "Asset Category" : "Debt Category"}
            </span>
            <h2 className="text-lg">{step.title}</h2>
          </div>
        </div>

        <p className="text-sm text-ink leading-relaxed font-medium">
          {step.question}
        </p>

        {/* Input Field */}
        <div className="field">
          <label>Estimated Amount in Rupees (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-heading font-800 text-lg">₹</span>
            <input
              type="number"
              value={answers[step.id] || ""}
              onChange={(e) => setAnswers({ ...answers, [step.id]: Number(e.target.value) })}
              placeholder="0"
              className="input pl-10 text-lg font-heading font-800"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>

        {/* Quick-Estimate Suggestion Chips */}
        <div className="space-y-2 pt-2">
          <span className="kicker block">
            Quick Estimate Chips:
          </span>
          <div className="flex flex-wrap gap-2">
            {step.quickChips.map((chipVal) => (
              <button
                key={chipVal}
                type="button"
                onClick={() => handleChipClick(chipVal)}
                className={
                  answers[step.id] === chipVal
                    ? "px-3 py-1.5 text-xs font-heading font-semibold border border-accent bg-accent text-bg"
                    : "px-3 py-1.5 text-xs font-heading font-semibold border border-divider bg-bg text-ink/65 hover:text-ink"
                }
              >
                ₹{chipVal.toLocaleString("en-IN")}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleChipClick(0)}
              className="px-3 py-1.5 text-xs font-heading font-semibold bg-bg border border-divider text-ink/55"
            >
              Skip / Zero
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-divider">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIdx === 0}
            className="text-xs font-heading font-semibold text-ink/65 hover:text-ink flex items-center gap-1.5 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="btn btn-primary"
          >
            <span>{isLastStep ? (submitting ? "Computing Analytics..." : "Finish & View Dashboard") : "Next Step"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
