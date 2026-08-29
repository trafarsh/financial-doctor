"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Trash2, Edit2, Check, X, Layers, TrendingDown, ArrowLeft } from "lucide-react";
import { Asset, Liability, AssetInput, LiabilityInput } from "@/lib/types";
import { ExportButton } from "@/components/ui/ExportButton";

export default function HoldingsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editAssetName, setEditAssetName] = useState("");
  const [editAssetValue, setEditAssetValue] = useState(0);

  const fetchHoldings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio").then((r) => r.json());
      if (res.assets) setAssets(res.assets);
      if (res.liabilities) setLiabilities(res.liabilities);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  const saveUpdatedHoldings = async (newAssets: Asset[], newLiabilities: Liability[]) => {
    try {
      const payloadAssets: AssetInput[] = newAssets.map((a) => ({
        type: a.type,
        name: a.name,
        symbol: a.symbol,
        sector: a.sector,
        value: a.value,
        quantity: a.quantity,
      }));

      const payloadLiabilities: LiabilityInput[] = newLiabilities.map((l) => ({
        type: l.type,
        name: l.name,
        amount: l.amount,
        interestRate: l.interestRate,
      }));

      await fetch("/api/portfolio/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets: payloadAssets, liabilities: payloadLiabilities }),
      });

      setAssets(newAssets);
      setLiabilities(newLiabilities);
    } catch (err) {
      console.warn("Failed to update holdings:", err);
    }
  };

  const handleDeleteAsset = (id: string) => {
    const next = assets.filter((a) => a.id !== id);
    saveUpdatedHoldings(next, liabilities);
  };

  const handleDeleteLiability = (id: string) => {
    const next = liabilities.filter((l) => l.id !== id);
    saveUpdatedHoldings(assets, next);
  };

  const startEditAsset = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setEditAssetName(asset.name);
    setEditAssetValue(asset.value);
  };

  const saveEditAsset = (id: string) => {
    const next = assets.map((a) =>
      a.id === id ? { ...a, name: editAssetName, value: editAssetValue } : a
    );
    saveUpdatedHoldings(next, liabilities);
    setEditingAssetId(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline-dark pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/portfolio/overview" className="text-muted hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-white">Holdings Management</h1>
          </div>
          <p className="text-xs text-muted-strong mt-0.5">
            Inspect, edit, or delete individual holdings. Every change updates the net-worth snapshot trend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton assets={assets} liabilities={liabilities} />
          <Link
            href="/import"
            className="bg-primary hover:bg-primary-active text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </Link>
        </div>
      </div>

      {/* Assets Table */}
      <div className="double-bezel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-trading-up" />
            <span>Tracked Assets ({assets.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-ink text-muted-strong uppercase text-[10px] tracking-wider border-b border-hairline-dark">
              <tr>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Sector / Tag</th>
                <th className="p-3 font-mono text-right">Value (₹)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-dark">
              {assets.map((asset) => {
                const isEditing = editingAssetId === asset.id;
                return (
                  <tr key={asset.id} className="hover:bg-ink/50 transition-colors">
                    <td className="p-3 font-semibold text-white">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editAssetName}
                          onChange={(e) => setEditAssetName(e.target.value)}
                          className="bg-ink border border-primary rounded px-2 py-1 text-xs text-white"
                        />
                      ) : (
                        asset.name
                      )}
                    </td>
                    <td className="p-3 text-muted-strong capitalize">{asset.type.replace("_", " ")}</td>
                    <td className="p-3 text-muted">{asset.sector || "General"}</td>
                    <td className="p-3 font-mono font-bold text-white text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editAssetValue}
                          onChange={(e) => setEditAssetValue(Number(e.target.value))}
                          className="bg-ink border border-primary rounded px-2 py-1 text-xs text-white font-mono text-right"
                        />
                      ) : (
                        `₹${asset.value.toLocaleString("en-IN")}`
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEditAsset(asset.id)}
                            className="p-1 text-trading-up hover:bg-ink rounded"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingAssetId(null)}
                            className="p-1 text-muted hover:bg-ink rounded"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditAsset(asset)}
                            className="p-1 text-muted hover:text-primary"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="p-1 text-muted hover:text-trading-down"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liabilities Table */}
      <div className="double-bezel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-trading-down" />
            <span>Liabilities & Debts ({liabilities.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-ink text-muted-strong uppercase text-[10px] tracking-wider border-b border-hairline-dark">
              <tr>
                <th className="p-3">Liability Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Interest Rate</th>
                <th className="p-3 font-mono text-right">Outstanding (₹)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-dark">
              {liabilities.map((l) => (
                <tr key={l.id} className="hover:bg-ink/50 transition-colors">
                  <td className="p-3 font-semibold text-white">{l.name}</td>
                  <td className="p-3 text-muted-strong capitalize">{l.type.replace("_", " ")}</td>
                  <td className="p-3 text-muted">{l.interestRate ? `${l.interestRate}%` : "—"}</td>
                  <td className="p-3 font-mono font-bold text-trading-down text-right">
                    ₹{l.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteLiability(l.id)}
                      className="p-1 text-muted hover:text-trading-down"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
