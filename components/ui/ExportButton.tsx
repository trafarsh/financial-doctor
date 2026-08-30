"use client";

import React, { useState } from "react";
import { Download, Check } from "lucide-react";
import * as XLSX from "xlsx";
import { Asset, Liability } from "@/lib/types";

interface ExportButtonProps {
  assets: Asset[];
  liabilities: Liability[];
}

export function ExportButton({ assets, liabilities }: ExportButtonProps) {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    // Standard contract matching the import format: kind,type,name,value,quantity,interest_rate,sector
    const rows = [
      ...assets.map((a) => ({
        kind: "asset",
        type: a.type,
        name: a.name,
        value: a.value,
        quantity: a.quantity || "",
        interest_rate: "",
        sector: a.sector || "",
      })),
      ...liabilities.map((l) => ({
        kind: "liability",
        type: l.type,
        name: l.name,
        value: l.amount,
        quantity: "",
        interest_rate: l.interestRate || "",
        sector: "",
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Holdings");

    XLSX.writeFile(workbook, `FinancialDoctor_Holdings_${new Date().toISOString().split("T")[0]}.xlsx`);

    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <button onClick={handleExport} className="btn btn-secondary">
      {exported ? (
        <>
          <Check className="w-3.5 h-3.5" style={{ color: "#0a7c4a" }} />
          <span style={{ color: "#0a7c4a" }}>Exported!</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          <span>Export to Excel (.xlsx)</span>
        </>
      )}
    </button>
  );
}
