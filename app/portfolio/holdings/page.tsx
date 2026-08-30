"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Trash2, Edit2, Check, X, Layers, TrendingDown, ArrowLeft, Sliders } from "lucide-react";
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
    <div className="flex flex-col gap-6 px-8 py-8 w-full max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-divider pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/portfolio/overview" className="text-ink/50 hover:text-accent">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-heading font-800 text-ink">Holdings Management</h1>
          </div>
          <p className="text-xs text-ink/60 mt-0.5">
            Inspect, edit, or delete individual holdings. Every change updates the net-worth snapshot trend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton assets={assets} liabilities={liabilities} />
          <Link href="/import" className="btn btn-primary">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </Link>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-surface">
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-divider">
          <h3 className="text-base font-heading font-800 text-ink flex items-center gap-2">
            <Layers className="w-4 h-4 text-up" />
            <span>Tracked Assets ({assets.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Sector / Tag</th>
                <th className="text-right">Value (₹)</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const isEditing = editingAssetId === asset.id;
                return (
                  <tr key={asset.id}>
                    <td className="font-semibold text-ink">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editAssetName}
                          onChange={(e) => setEditAssetName(e.target.value)}
                          className="input"
                        />
                      ) : (
                        asset.name
                      )}
                    </td>
                    <td className="text-ink/60 capitalize">
                      {asset.type === "mutual_fund" ? "HFUND" : asset.type.replace("_", " ")}
                    </td>
                    <td className="text-ink/45">{asset.sector || "General"}</td>
                    <td className="font-heading font-700 text-ink text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editAssetValue}
                          onChange={(e) => setEditAssetValue(Number(e.target.value))}
                          className="input text-right"
                        />
                      ) : (
                        `₹${asset.value.toLocaleString("en-IN")}`
                      )}
                    </td>
                    <td className="text-right space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEditAsset(asset.id)}
                            className="p-1 text-up hover:opacity-70"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingAssetId(null)}
                            className="p-1 text-ink/45 hover:text-ink"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/simulator?holdingId=${asset.id}`}
                            className="p-1 text-ink/45 hover:text-accent inline-block"
                            title="Simulate stress testing"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => startEditAsset(asset)}
                            className="p-1 text-ink/45 hover:text-accent"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="p-1 text-ink/45 hover:text-accent"
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
      <div className="bg-surface">
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-divider">
          <h3 className="text-base font-heading font-800 text-ink flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-accent" />
            <span>Liabilities &amp; Debts ({liabilities.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Liability Name</th>
                <th>Type</th>
                <th>Interest Rate</th>
                <th className="text-right">Outstanding (₹)</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {liabilities.map((l) => (
                <tr key={l.id}>
                  <td className="font-semibold text-ink">{l.name}</td>
                  <td className="text-ink/60 capitalize">{l.type.replace("_", " ")}</td>
                  <td className="text-ink/45">{l.interestRate ? `${l.interestRate}%` : "—"}</td>
                  <td className="font-heading font-700 text-accent text-right">
                    ₹{l.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleDeleteLiability(l.id)}
                      className="p-1 text-ink/45 hover:text-accent"
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
