"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sprout,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Volume2,
  ExternalLink,
  FileText,
  Sparkles,
  Check,
  RefreshCw
} from "lucide-react";
import { HouseholdProfile, SchemeMatchResult } from "@/lib/types";

const DISTRICTS = [
  "Krishnagiri",
  "Salem",
  "Dharmapuri",
  "Vellore",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Thanjavur"
];

const CROPS = [
  "Mango",
  "Ragi",
  "Rice",
  "Cotton",
  "Sugarcane",
  "Maize",
  "Turmeric",
  "Other/None"
];

const DEFAULT_PROFILE: HouseholdProfile = {
  district: "Krishnagiri",
  landHoldingHa: 1.5,
  primaryCrop: "Mango",
  annualIncome: 120000,
  socialCategory: "OBC",
  familySize: 4,
  existingKcc: false
};

export default function SchemesPage() {
  const [profile, setProfile] = useState<HouseholdProfile>(DEFAULT_PROFILE);
  const [matches, setMatches] = useState<SchemeMatchResult[]>([]);
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track checked documents per scheme ID
  const [checkedDocs, setCheckedDocs] = useState<Record<string, Record<string, boolean>>>({});
  // Track expanded scheme IDs
  const [expandedSchemes, setExpandedSchemes] = useState<Record<string, boolean>>({});

  // Voice simulation state
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  const [voiceText, setVoiceText] = useState<string>("");

  const triggerEvaluation = useCallback(async (currentProfile: HouseholdProfile) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentProfile)
      });
      if (!res.ok) {
        throw new Error("Failed to evaluate schemes");
      }
      const data = await res.json();
      setMatches(data.matches || []);
      setExplanation(data.explanation || "");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce scheme evaluation fetch on profile changes
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerEvaluation(profile);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [profile, triggerEvaluation]);

  // Initial load
  useEffect(() => {
    triggerEvaluation(DEFAULT_PROFILE);
  }, [triggerEvaluation]);

  const handleInputChange = (field: keyof HouseholdProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDoc = (schemeId: string, doc: string) => {
    setCheckedDocs((prev) => {
      const schemeDocs = prev[schemeId] || {};
      return {
        ...prev,
        [schemeId]: {
          ...schemeDocs,
          [doc]: !schemeDocs[doc]
        }
      };
    });
  };

  const toggleExpand = (schemeId: string) => {
    setExpandedSchemes((prev) => ({
      ...prev,
      [schemeId]: !prev[schemeId]
    }));
  };

  // Simulate regional/farmer voice query parsing
  const startVoiceSimulation = () => {
    setVoiceActive(true);
    setVoiceText("Listening...");

    // Simulate speech recognition results sequentially
    setTimeout(() => {
      setVoiceText('"I grow mangoes in Krishnagiri..."');
    }, 1200);

    setTimeout(() => {
      setVoiceText('"I have 1.8 hectares of land and no KCC card..."');
    }, 2800);

    setTimeout(() => {
      const voiceParsedProfile: HouseholdProfile = {
        district: "Krishnagiri",
        landHoldingHa: 1.8,
        primaryCrop: "Mango",
        annualIncome: 140000,
        socialCategory: "OBC",
        familySize: 5,
        existingKcc: false
      };
      setProfile(voiceParsedProfile);
      setVoiceText("Voice query successfully parsed and applied!");
      setVoiceActive(false);
      triggerEvaluation(voiceParsedProfile);
    }, 4500);
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8 md:py-8 w-full max-w-6xl">
      {/* Header */}
      <div className="border-b-2 border-divider pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="kicker">Rural Support Engine</div>
          <h1 className="text-3xl font-heading font-extrabold text-ink m-0 flex items-center gap-2.5 mt-1">
            <Sprout className="w-7 h-7 text-accent" />
            Scheme Eligibility Matcher
          </h1>
        </div>
        <div>
          <button
            onClick={startVoiceSimulation}
            disabled={voiceActive}
            className={`btn flex items-center gap-2 ${
              voiceActive
                ? "bg-accent text-bg animate-pulse"
                : "btn-secondary"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{voiceActive ? "Listening..." : "Simulate Voice Input"}</span>
          </button>
        </div>
      </div>

      {/* Voice status banner */}
      {voiceText && (
        <div className="bg-surface border-2 border-divider px-4 py-3 text-xs font-semibold flex items-center justify-between">
          <span className="text-ink">{voiceText}</span>
          {!voiceActive && (
            <button
              onClick={() => setVoiceText("")}
              className="text-ink hover:text-accent font-bold"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Split view Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Profile configuration Form */}
        <div className="lg:col-span-2 flex flex-col gap-6 bg-surface border-2 border-divider p-6">
          <h2 className="text-lg font-heading font-extrabold text-ink border-b border-divider pb-2 mb-2">
            Household Profile Wizard
          </h2>

          {/* District Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-ink/75 flex items-center gap-1">
              District
              <span className="tooltip cursor-help" title="Determines state-specific scheme eligibility">
                <HelpCircle className="w-3.5 h-3.5 text-muted" />
              </span>
            </label>
            <select
              value={profile.district}
              onChange={(e) => handleInputChange("district", e.target.value)}
              className="form-input bg-bg text-ink"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Land Holding Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-ink/75">
                Land Size (Hectares)
              </label>
              <span className="text-sm font-semibold font-mono bg-bg px-2 py-0.5 border border-divider">
                {profile.landHoldingHa} ha
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={profile.landHoldingHa}
              onChange={(e) => handleInputChange("landHoldingHa", parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-[10px] text-ink/50 font-mono">
              <span>0 ha (Landless)</span>
              <span>2 ha (Marginal)</span>
              <span>4 ha (Small)</span>
              <span>10 ha (Large)</span>
            </div>
          </div>

          {/* Primary Crop */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-ink/75">
              Primary Cultivated Crop
            </label>
            <select
              value={profile.primaryCrop}
              onChange={(e) => handleInputChange("primaryCrop", e.target.value)}
              className="form-input bg-bg text-ink"
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Annual Income Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-ink/75">
                Annual Household Income
              </label>
              <span className="text-sm font-semibold font-mono bg-bg px-2 py-0.5 border border-divider">
                ₹{profile.annualIncome.toLocaleString("en-IN")}
              </span>
            </div>
            <input
              type="range"
              min="30000"
              max="1000000"
              step="10000"
              value={profile.annualIncome}
              onChange={(e) => handleInputChange("annualIncome", parseInt(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-[10px] text-ink/50 font-mono">
              <span>₹30,000</span>
              <span>₹2.0L (PM-KISAN)</span>
              <span>₹5.0L (MUDRA Shishu)</span>
              <span>₹10.0L</span>
            </div>
          </div>

          {/* Grid of minor variables */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-ink/75">
                Category
              </label>
              <select
                value={profile.socialCategory}
                onChange={(e) => handleInputChange("socialCategory", e.target.value)}
                className="form-input bg-bg text-ink text-xs"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-ink/75">
                Family Size
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={profile.familySize}
                onChange={(e) => handleInputChange("familySize", parseInt(e.target.value) || 1)}
                className="form-input bg-bg text-ink text-xs"
              />
            </div>
          </div>

          {/* KCC Checkbox Toggle */}
          <label className="flex items-center gap-3 cursor-pointer py-2 border-t border-divider mt-2">
            <input
              type="checkbox"
              checked={profile.existingKcc}
              onChange={(e) => handleInputChange("existingKcc", e.target.checked)}
              className="w-4.5 h-4.5 accent-accent"
            />
            <div>
              <div className="text-xs font-bold text-ink">Already has Kisan Credit Card (KCC)?</div>
              <div className="text-[10px] text-ink/50">Excludes you from other initial credit lines.</div>
            </div>
          </label>

          <button
            onClick={() => triggerEvaluation(profile)}
            disabled={loading}
            className="btn btn-primary mt-2 flex items-center justify-center gap-2 py-3 text-sm"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Evaluate Schemes</span>
          </button>
        </div>

        {/* Results List */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* AI Explanation Summary */}
          <div className="bg-surface border-2 border-divider p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full pointer-events-none" />
            <div className="kicker-accent flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              AI Analysis & Guidelines
            </div>
            {loading && !explanation ? (
              <div className="mt-3 flex items-center gap-3 text-sm text-ink/60">
                <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                Drafting non-advisory eligibility analysis...
              </div>
            ) : error ? (
              <div className="mt-3 text-sm text-red-600 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Error generating AI guidelines. Using local rule matching results below.</span>
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink leading-relaxed m-0 whitespace-pre-line">
                {explanation || "Adjust the household parameters on the left to review eligible subsidies."}
              </p>
            )}
          </div>

          {/* Schemes Header */}
          <div className="flex items-center justify-between border-b border-divider pb-2">
            <h3 className="text-base font-heading font-extrabold text-ink m-0">
              Evaluated Programs ({matches.length})
            </h3>
            <div className="flex gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />
                Eligible ({matches.filter((m) => m.isEligible).length})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-neutral-400 rounded-full" />
                Ineligible ({matches.filter((m) => !m.isEligible).length})
              </span>
            </div>
          </div>

          {/* Match Lists */}
          {matches.length === 0 && !loading ? (
            <div className="text-center py-12 bg-surface border-2 border-dashed border-divider">
              <FileText className="w-8 h-8 mx-auto text-ink/30 mb-2" />
              <div className="text-sm font-semibold text-ink/60">No schemes matched this profile.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {matches.map((item) => {
                const isEligible = item.isEligible;
                const isExpanded = !!expandedSchemes[item.scheme.id];
                const activeCheckedDocs = checkedDocs[item.scheme.id] || {};
                const checkedCount = Object.values(activeCheckedDocs).filter(Boolean).length;
                const totalDocs = item.scheme.requiredDocuments.length;

                return (
                  <div
                    key={item.scheme.id}
                    className={`bg-surface border-2 transition-all ${
                      isEligible
                        ? "border-divider hover:border-accent"
                        : "border-divider/55 opacity-70"
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpand(item.scheme.id)}
                      className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 border border-divider bg-bg text-ink/70">
                            {item.scheme.agency}
                          </span>
                          {isEligible ? (
                            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Eligible
                            </span>
                          ) : (
                            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-600 border border-neutral-300 flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-neutral-500" />
                              Ineligible
                            </span>
                          )}
                        </div>
                        <h4 className="text-md font-heading font-extrabold text-ink m-0 pt-1">
                          {item.scheme.name}
                        </h4>
                        <p className="text-xs text-ink/65 m-0 pt-1">
                          {item.scheme.benefitDescription}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-ink">Est. Benefit</div>
                        <div className="text-lg font-heading font-extrabold text-accent">
                          ₹{item.scheme.estimatedBenefitAmount.toLocaleString("en-IN")}
                        </div>
                        {isEligible && totalDocs > 0 && (
                          <div className="text-[10px] text-ink/60 font-semibold mt-1">
                            Docs: {checkedCount}/{totalDocs} Ready
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Details Area */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-3 border-t-2 border-divider bg-bg/25">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                          {/* Left Column: Criteria breakdown */}
                          <div className="space-y-3.5">
                            <div>
                              <div className="font-bold text-ink mb-1.5 uppercase tracking-wider text-[10px] opacity-75">
                                Verification Details
                              </div>
                              <table className="w-full text-[11px]">
                                <tbody>
                                  <tr className="border-b border-divider/40">
                                    <td className="py-1 text-ink/65">Last Verified</td>
                                    <td className="py-1 font-semibold text-ink text-right">{item.scheme.lastVerified}</td>
                                  </tr>
                                  <tr>
                                    <td className="py-1 text-ink/65">Source Portal</td>
                                    <td className="py-1 text-right">
                                      <a
                                        href={item.scheme.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent hover:underline flex items-center justify-end gap-1 font-semibold"
                                      >
                                        Visit site
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div>
                              <div className="font-bold text-ink mb-1.5 uppercase tracking-wider text-[10px] opacity-75">
                                Rule Match Evaluation
                              </div>
                              <ul className="space-y-1 pl-0 list-none m-0 text-[11px]">
                                {item.matchingCriteria.map((c, idx) => (
                                  <li key={idx} className="text-emerald-700 flex items-start gap-1.5">
                                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 mt-0.5" />
                                    <span>{c}</span>
                                  </li>
                                ))}
                                {item.failingCriteria.map((c, idx) => (
                                  <li key={idx} className="text-red-700 flex items-start gap-1.5">
                                    <XCircle className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Right Column: Required Documents Checklist */}
                          <div>
                            <div className="font-bold text-ink mb-2.5 uppercase tracking-wider text-[10px] opacity-75">
                              Required Document Checklist
                            </div>
                            {item.scheme.requiredDocuments.length === 0 ? (
                              <div className="text-ink/50 text-xs italic">No documents required.</div>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                {item.scheme.requiredDocuments.map((doc) => {
                                  const isChecked = !!activeCheckedDocs[doc];
                                  return (
                                    <label
                                      key={doc}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      className={`flex items-center gap-2.5 p-2.5 border cursor-pointer select-none transition-colors ${
                                        isChecked
                                          ? "bg-emerald-50/50 border-emerald-300 text-ink"
                                          : "bg-surface border-divider hover:bg-neutral-50"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleDoc(item.scheme.id, doc)}
                                        className="w-4 h-4 accent-emerald-600"
                                      />
                                      <span className="text-[11px] font-medium leading-none">
                                        {doc}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
