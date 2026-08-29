"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { AssetInput, LiabilityInput, AssetType, LiabilityType } from "@/lib/types";
import { assetInputSchema, liabilityInputSchema } from "@/lib/validation";

export default function ImportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"manual" | "file">("manual");

  // Manual Tab State — hydrated from the user's actual saved holdings
  const [assets, setAssets] = useState<AssetInput[]>([]);
  const [liabilities, setLiabilities] = useState<LiabilityInput[]>([]);
  const [loadingHoldings, setLoadingHoldings] = useState(true);

  // File Upload State
  const [parsedRows, setParsedRows] = useState<
    {
      rowNumber: number;
      kind: string;
      type: string;
      name: string;
      value: number;
      valid: boolean;
      error?: string;
      raw: any;
    }[]
  >([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load the user's current saved holdings so the form edits real data
  const loadHoldings = async () => {
    setLoadingHoldings(true);
    try {
      const res = await fetch("/api/portfolio").then((r) => r.json());
      if (res.assets) {
        setAssets(
          res.assets.map((a: any) => ({
            type: a.type,
            name: a.name,
            symbol: a.symbol,
            sector: a.sector,
            value: Number(a.value),
            quantity: a.quantity !== undefined && a.quantity !== null ? Number(a.quantity) : undefined,
            purchasePrice:
              a.purchasePrice !== undefined && a.purchasePrice !== null ? Number(a.purchasePrice) : undefined,
          }))
        );
      }
      if (res.liabilities) {
        setLiabilities(
          res.liabilities.map((l: any) => ({
            type: l.type,
            name: l.name,
            amount: Number(l.amount),
            interestRate:
              l.interestRate !== undefined && l.interestRate !== null ? Number(l.interestRate) : undefined,
            monthlyPayment:
              l.monthlyPayment !== undefined && l.monthlyPayment !== null ? Number(l.monthlyPayment) : undefined,
          }))
        );
      }
    } catch (err) {
      console.warn("[Import] Failed to load current holdings:", err);
    } finally {
      setLoadingHoldings(false);
    }
  };

  useEffect(() => {
    loadHoldings();
  }, []);

  // Math Preview
  const totalAssets = assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const netWorthPreview = totalAssets - totalLiabilities;

  // Manual Handlers
  const addAssetRow = () => {
    setAssets([...assets, { type: "stock", name: "", value: 0 }]);
  };

  const removeAssetRow = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const updateAsset = (index: number, field: keyof AssetInput, val: any) => {
    const next = [...assets];
    next[index] = { ...next[index], [field]: val };
    setAssets(next);
  };

  const addLiabilityRow = () => {
    setLiabilities([...liabilities, { type: "loan", name: "", amount: 0 }]);
  };

  const removeLiabilityRow = (index: number) => {
    setLiabilities(liabilities.filter((_, i) => i !== index));
  };

  const updateLiability = (index: number, field: keyof LiabilityInput, val: any) => {
    const next = [...liabilities];
    next[index] = { ...next[index], [field]: val };
    setLiabilities(next);
  };

  // File Upload & Parse Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);
        processParsedRows(jsonRows);
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          processParsedRows(results.data);
        },
      });
    }
  };

  const processParsedRows = (rawRows: any[]) => {
    const processed = rawRows.map((r, idx) => {
      const rowNumber = idx + 2; // header = row 1
      const kind = (r.kind || r.Kind || (r.amount ? "liability" : "asset")).toLowerCase().trim();
      const type = (r.type || r.Type || "other").toLowerCase().trim();
      const name = String(r.name || r.Name || "Unnamed").trim();
      const rawVal = r.value !== undefined ? r.value : r.amount;
      const numVal = Number(rawVal) || 0;

      let valid = false;
      let error: string | undefined = undefined;

      if (kind === "asset") {
        const valRes = assetInputSchema.safeParse({
          type,
          name,
          value: numVal,
          quantity: r.quantity ? Number(r.quantity) : undefined,
          sector: r.sector ? String(r.sector) : undefined,
        });
        valid = valRes.success;
        if (!valid) {
          error = valRes.error?.errors.map((e) => e.message).join(", ");
        }
      } else if (kind === "liability") {
        const valRes = liabilityInputSchema.safeParse({
          type,
          name,
          amount: numVal,
          interestRate: r.interest_rate ? Number(r.interest_rate) : undefined,
        });
        valid = valRes.success;
        if (!valid) {
          error = valRes.error?.errors.map((e) => e.message).join(", ");
        }
      } else {
        error = "Unknown kind: must be 'asset' or 'liability'";
      }

      return {
        rowNumber,
        kind,
        type,
        name,
        value: numVal,
        valid,
        error,
        raw: r,
      };
    });

    setParsedRows(processed);
  };

  // Final Submit Handler
  const handleSubmit = async () => {
    setSubmitting(true);
    setStatusMessage(null);

    let finalAssets: AssetInput[] = [];
    let finalLiabilities: LiabilityInput[] = [];

    if (activeTab === "manual") {
      finalAssets = assets.filter((a) => a.name.trim() !== "" && a.value >= 0);
      finalLiabilities = liabilities.filter((l) => l.name.trim() !== "" && l.amount >= 0);
    } else {
      const validRows = parsedRows.filter((r) => r.valid);
      for (const r of validRows) {
        if (r.kind === "asset") {
          finalAssets.push({
            type: r.type as AssetType,
            name: r.name,
            value: r.value,
            quantity: r.raw.quantity ? Number(r.raw.quantity) : undefined,
            sector: r.raw.sector ? String(r.raw.sector) : undefined,
          });
        } else {
          finalLiabilities.push({
            type: r.type as LiabilityType,
            name: r.name,
            amount: r.value,
            interestRate: r.raw.interest_rate ? Number(r.raw.interest_rate) : undefined,
          });
        }
      }
    }

    try {
      const res = await fetch("/api/portfolio/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets: finalAssets, liabilities: finalLiabilities }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Import failed");
      }

      setStatusMessage("Portfolio imported successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline-dark pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Import Portfolio Data</h1>
          <p className="text-xs text-muted-strong mt-0.5">
            Add your assets and liabilities manually or upload a CSV / Excel spreadsheet.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-surface-card p-1 rounded-lg border border-hairline-dark">
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "manual" ? "bg-primary text-primary-foreground" : "text-muted-strong hover:text-white"
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab("file")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "file" ? "bg-primary text-primary-foreground" : "text-muted-strong hover:text-white"
            }`}
          >
            File Upload (CSV / Excel)
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold ${
            statusMessage.includes("Error")
              ? "bg-trading-down/15 border border-trading-down/40 text-trading-down"
              : "bg-trading-up/15 border border-trading-up/40 text-trading-up"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* MANUAL TAB */}
      {activeTab === "manual" && (
        <div className="space-y-6">
          {/* Live Net Worth Preview Card */}
          <div className="double-bezel p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-muted-strong uppercase tracking-wider">
                  Calculated Net Worth Preview
                </span>
                <button
                  onClick={loadHoldings}
                  title="Reload saved holdings"
                  className="text-muted hover:text-primary transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingHoldings ? "animate-spin text-primary" : ""}`} />
                </button>
              </div>
              <span className="text-2xl font-extrabold font-mono text-primary">
                ₹{netWorthPreview.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-trading-up font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Total Assets: ₹{totalAssets.toLocaleString("en-IN")}
              </span>
              <span className="text-muted">|</span>
              <span className="text-trading-down font-semibold flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Total Debt: ₹{totalLiabilities.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Assets Section */}
          <div className="double-bezel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline-dark pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-trading-up" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tracked Assets</h3>
              </div>
              <button
                onClick={addAssetRow}
                className="text-xs bg-ink hover:bg-surface-elevated text-trading-up font-semibold px-3 py-1.5 rounded border border-hairline-dark flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Asset</span>
              </button>
            </div>

            <div className="space-y-3">
              {assets.map((asset, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-2.5 bg-ink rounded-lg border border-hairline-dark">
                  <div className="sm:col-span-3">
                    <select
                      value={asset.type}
                      onChange={(e) => updateAsset(idx, "type", e.target.value as AssetType)}
                      className="w-full bg-surface-card border border-hairline-dark rounded px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="bank">Bank / Cash</option>
                      <option value="stock">Stock / Equity</option>
                      <option value="etf">ETF</option>
                      <option value="mutual_fund">Mutual Fund</option>
                      <option value="gold">Gold / Commodity</option>
                      <option value="real_estate">Real Estate</option>
                      <option value="other">Other Asset</option>
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Asset Name (e.g. Reliance, HDFC FD)"
                      value={asset.name}
                      onChange={(e) => updateAsset(idx, "name", e.target.value)}
                      className="w-full bg-surface-card border border-hairline-dark rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      placeholder="Value (₹)"
                      value={asset.value || ""}
                      onChange={(e) => updateAsset(idx, "value", Number(e.target.value))}
                      className="w-full bg-surface-card border border-hairline-dark rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-end">
                    <button
                      onClick={() => removeAssetRow(idx)}
                      className="p-1.5 text-muted hover:text-trading-down"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {!loadingHoldings && assets.length === 0 && (
                <p className="text-xs text-muted text-center py-6">
                  No assets saved yet. Click "Add Asset" to enter one, or switch to File Upload to import a spreadsheet.
                </p>
              )}
            </div>
          </div>

          {/* Liabilities Section */}
          <div className="double-bezel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline-dark pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-trading-down" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Liabilities & Debts</h3>
              </div>
              <button
                onClick={addLiabilityRow}
                className="text-xs bg-ink hover:bg-surface-elevated text-trading-down font-semibold px-3 py-1.5 rounded border border-hairline-dark flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Debt</span>
              </button>
            </div>

            <div className="space-y-3">
              {liabilities.map((liability, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-2.5 bg-ink rounded-lg border border-hairline-dark">
                  <div className="sm:col-span-3">
                    <select
                      value={liability.type}
                      onChange={(e) => updateLiability(idx, "type", e.target.value as LiabilityType)}
                      className="w-full bg-surface-card border border-hairline-dark rounded px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="loan">Personal / Auto Loan</option>
                      <option value="credit_card">Credit Card Dues</option>
                      <option value="mortgage">Home Loan / Mortgage</option>
                      <option value="other">Other Debt</option>
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Debt Name (e.g. Car Loan)"
                      value={liability.name}
                      onChange={(e) => updateLiability(idx, "name", e.target.value)}
                      className="w-full bg-surface-card border border-hairline-dark rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      placeholder="Outstanding (₹)"
                      value={liability.amount || ""}
                      onChange={(e) => updateLiability(idx, "amount", Number(e.target.value))}
                      className="w-full bg-surface-card border border-hairline-dark rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-end">
                    <button
                      onClick={() => removeLiabilityRow(idx)}
                      className="p-1.5 text-muted hover:text-trading-down"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {!loadingHoldings && liabilities.length === 0 && (
                <p className="text-xs text-muted text-center py-6">
                  No liabilities saved yet. Click "Add Debt" to enter one.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FILE UPLOAD TAB */}
      {activeTab === "file" && (
        <div className="space-y-6">
          <div className="double-bezel p-8 text-center border-dashed border-2 border-hairline-dark hover:border-primary transition-colors rounded-xl bg-ink/50 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-surface-card border border-hairline-dark flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Upload CSV or Excel Spreadsheet</h3>
              <p className="text-xs text-muted-strong">
                Accepts <code className="text-primary">.csv</code>, <code className="text-primary">.xlsx</code>, and <code className="text-primary">.xls</code> files
              </p>
            </div>

            <label className="inline-flex items-center gap-2 bg-primary hover:bg-primary-active text-primary-foreground font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-all shadow-sm">
              <FileSpreadsheet className="w-4 h-4" />
              <span>{fileName ? `Loaded: ${fileName}` : "Select File"}</span>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="text-[11px] text-muted pt-2">
              Required headers: <code className="text-body">kind,type,name,value,quantity,interest_rate,sector</code>
            </div>
          </div>

          {/* Validation Preview Table */}
          {parsedRows.length > 0 && (
            <div className="double-bezel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  File Ingestion Preview ({parsedRows.length} Rows Detected)
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-trading-up font-semibold">
                    {parsedRows.filter((r) => r.valid).length} Valid
                  </span>
                  <span className="text-trading-down font-semibold">
                    {parsedRows.filter((r) => !r.valid).length} Invalid
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-xs text-left">
                  <thead className="bg-ink text-muted-strong uppercase text-[10px] tracking-wider border-b border-hairline-dark">
                    <tr>
                      <th className="p-2.5">Row</th>
                      <th className="p-2.5">Kind</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5 font-mono">Value (₹)</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline-dark">
                    {parsedRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-ink">
                        <td className="p-2.5 font-mono text-muted">{r.rowNumber}</td>
                        <td className="p-2.5 uppercase font-semibold text-[10px]">{r.kind}</td>
                        <td className="p-2.5 text-muted-strong">{r.type}</td>
                        <td className="p-2.5 font-semibold text-white">{r.name}</td>
                        <td className="p-2.5 font-mono">₹{r.value.toLocaleString("en-IN")}</td>
                        <td className="p-2.5">
                          {r.valid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-trading-up bg-trading-up/15 px-2 py-0.5 rounded font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-trading-down bg-trading-down/15 px-2 py-0.5 rounded font-bold" title={r.error}>
                              <AlertCircle className="w-3 h-3" /> {r.error || "Invalid"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save & Confirm Action Button */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-primary hover:bg-primary-active active:scale-95 text-primary-foreground font-bold text-sm px-8 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
        >
          <span>{submitting ? "Processing & Calculating Snapshots..." : "Save Portfolio & Compute Analysis"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
