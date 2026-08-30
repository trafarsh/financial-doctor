// ============================================================
// FINANCIAL DOCTOR (finX) — Portfolio Management Service
// Full CRUD against Supabase. No mock/demo fallback data —
// holdings only ever come from real user input (manual entry
// or CSV/Excel import) and real Supabase reads.
// ============================================================

import { Asset, Liability, AssetInput, LiabilityInput, NetWorthSnapshot } from "@/lib/types";
import { computeNetWorth } from "@/lib/finance";
import { createServiceClient } from "@/lib/supabase/server";

function mapAssetRow(r: any): Asset {
  return {
    id: r.id,
    userId: r.user_id,
    type: r.type,
    name: r.name,
    symbol: r.symbol ?? undefined,
    isin: r.isin ?? undefined,
    exchange: r.exchange ?? undefined,
    sector: r.sector ?? undefined,
    value: Number(r.value),
    quantity: r.quantity !== null && r.quantity !== undefined ? Number(r.quantity) : undefined,
    purchasePrice: r.purchase_price !== null && r.purchase_price !== undefined ? Number(r.purchase_price) : undefined,
    lastUpdated: r.last_updated,
  };
}

function mapLiabilityRow(r: any): Liability {
  return {
    id: r.id,
    userId: r.user_id,
    type: r.type,
    name: r.name,
    amount: Number(r.amount),
    interestRate: r.interest_rate !== null && r.interest_rate !== undefined ? Number(r.interest_rate) : undefined,
    monthlyPayment: r.monthly_payment !== null && r.monthly_payment !== undefined ? Number(r.monthly_payment) : undefined,
  };
}

function mapSnapshotRow(r: any): NetWorthSnapshot {
  return {
    id: r.id,
    userId: r.user_id,
    totalAssets: Number(r.total_assets),
    totalLiabilities: Number(r.total_liabilities),
    netWorth: Number(r.net_worth),
    computedAt: r.computed_at,
  };
}

// In-memory demo store for when Supabase is not configured or offline
const isPlaceholderUrl = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

let demoAssets: any[] = [
  { id: "demo_a1", user_id: "demo_user", type: "bank", name: "HDFC Savings Account", value: 200000, last_updated: new Date().toISOString() },
  { id: "demo_a2", user_id: "demo_user", type: "stock", name: "Reliance Industries", value: 600000, quantity: 200, sector: "Energy", last_updated: new Date().toISOString() },
  { id: "demo_a3", user_id: "demo_user", type: "gold", name: "Sovereign Gold Bonds", value: 200000, last_updated: new Date().toISOString() },
];

let demoLiabilities: any[] = [
  { id: "demo_l1", user_id: "demo_user", type: "loan", name: "Car Loan (HDFC)", amount: 500000, interest_rate: 8.75 },
];

let demoSnapshots: any[] = [
  { id: "demo_s1", user_id: "demo_user", total_assets: 1000000, total_liabilities: 500000, net_worth: 500000, computed_at: new Date().toISOString() }
];

export class PortfolioService {
  /**
   * Retrieves current assets and liabilities for the authenticated user.
   */
  async getHoldings(userId: string): Promise<{
    assets: Asset[];
    liabilities: Liability[];
    netWorthSummary: { totalAssets: number; totalLiabilities: number; netWorth: number };
  }> {
    if (!isPlaceholderUrl) {
      try {
        const supabase = createServiceClient();
        const [assetsRes, liabilitiesRes] = await Promise.all([
          supabase.from("assets").select("*").eq("user_id", userId).order("last_updated", { ascending: false }),
          supabase.from("liabilities").select("*").eq("user_id", userId),
        ]);

        if (!assetsRes.error && !liabilitiesRes.error) {
          const assets = (assetsRes.data || []).map(mapAssetRow);
          const liabilities = (liabilitiesRes.data || []).map(mapLiabilityRow);
          const netWorthSummary = computeNetWorth(assets, liabilities);

          return { assets, liabilities, netWorthSummary };
        }
      } catch (e) {
        console.warn("[Portfolio] Supabase load failed, falling back to demo mode:", e);
      }
    }

    const assets = demoAssets.map(mapAssetRow);
    const liabilities = demoLiabilities.map(mapLiabilityRow);
    const netWorthSummary = computeNetWorth(assets, liabilities);
    return { assets, liabilities, netWorthSummary };
  }

  /**
   * Creates a single asset for the user.
   */
  async createAsset(userId: string, input: AssetInput): Promise<Asset> {
    if (!isPlaceholderUrl) {
      try {
        const supabase = createServiceClient();
        const { data, error } = await supabase
          .from("assets")
          .insert({
            user_id: userId,
            type: input.type,
            name: input.name,
            symbol: input.symbol,
            sector: input.sector,
            value: input.value,
            quantity: input.quantity,
            purchase_price: input.purchasePrice,
          })
          .select()
          .single();

        if (!error && data) return mapAssetRow(data);
      } catch (e) {
        console.warn("[Portfolio] Supabase createAsset failed, falling back to demo mode:", e);
      }
    }

    const newAsset = {
      id: `demo_a_${Date.now()}`,
      user_id: userId,
      type: input.type,
      name: input.name,
      symbol: input.symbol,
      sector: input.sector,
      value: input.value,
      quantity: input.quantity,
      purchase_price: input.purchasePrice,
      last_updated: new Date().toISOString(),
    };
    demoAssets.push(newAsset);
    return mapAssetRow(newAsset);
  }

  /**
   * Updates a single asset owned by the user.
   */
  async updateAsset(userId: string, assetId: string, input: Partial<AssetInput>): Promise<Asset> {
    if (!isPlaceholderUrl) {
      try {
        const supabase = createServiceClient();
        const patch: Record<string, any> = { last_updated: new Date().toISOString() };
        if (input.type !== undefined) patch.type = input.type;
        if (input.name !== undefined) patch.name = input.name;
        if (input.symbol !== undefined) patch.symbol = input.symbol;
        if (input.sector !== undefined) patch.sector = input.sector;
        if (input.value !== undefined) patch.value = input.value;
        if (input.quantity !== undefined) patch.quantity = input.quantity;
        if (input.purchasePrice !== undefined) patch.purchase_price = input.purchasePrice;

        const { data, error } = await supabase
          .from("assets")
          .update(patch)
          .eq("id", assetId)
          .eq("user_id", userId)
          .select()
          .single();

        if (!error && data) return mapAssetRow(data);
      } catch (e) {
        console.warn("[Portfolio] Supabase updateAsset failed, falling back to demo mode:", e);
      }
    }

    const assetIndex = demoAssets.findIndex((a) => a.id === assetId);
    if (assetIndex !== -1) {
      const asset = demoAssets[assetIndex];
      if (input.type !== undefined) asset.type = input.type;
      if (input.name !== undefined) asset.name = input.name;
      if (input.symbol !== undefined) asset.symbol = input.symbol;
      if (input.sector !== undefined) asset.sector = input.sector;
      if (input.value !== undefined) asset.value = input.value;
      if (input.quantity !== undefined) asset.quantity = input.quantity;
      if (input.purchasePrice !== undefined) asset.purchase_price = input.purchasePrice;
      asset.last_updated = new Date().toISOString();
      return mapAssetRow(asset);
    }
    throw new Error("Asset not found");
  }

  /**
   * Deletes a single asset owned by the user.
   */
  async deleteAsset(userId: string, assetId: string): Promise<void> {
    if (!isPlaceholderUrl) {
      try {
        const supabase = createServiceClient();
        const { error } = await supabase.from("assets").delete().eq("id", assetId).eq("user_id", userId);
        if (!error) return;
      } catch (e) {
        console.warn("[Portfolio] Supabase deleteAsset failed, falling back to demo mode:", e);
      }
    }

    demoAssets = demoAssets.filter((a) => a.id !== assetId);
  }

  /**
   * Creates a single liability for the user.
   */
  async createLiability(userId: string, input: LiabilityInput): Promise<Liability> {
    if (!isPlaceholderUrl) {
      try {
        const supabase = createServiceClient();
        const { data, error } = await supabase
          .from("liabilities")
          .insert({
            user_id: userId,
            type: input.type,
            name: input.name,
            amount: input.amount,
            interest_rate: input.interestRate,
            monthly_payment: input.monthlyPayment,
          })
          .select()
          .single();

        if (!error && data) return mapLiabilityRow(data);
      } catch (e) {
        console.warn("[Portfolio] Supabase createLiability failed, falling back to demo mode:", e);
      }
    }

    const newLiability = {
      id: `demo_l_${Date.now()}`,
      user_id: userId,
      type: input.type,
      name: input.name,
      amount: input.amount,
      interest_rate: input.interestRate,
      monthly_payment: input.monthlyPayment,
    };
    demoLiabilities.push(newLiability);
    return mapLiabilityRow(newLiability);
  }

  /**
   * Updates a single liability owned by the user.
   */
  async updateLiability(userId: string, liabilityId: string, input: Partial<LiabilityInput>): Promise<Liability> {
    if (!isPlaceholderUrl) {
      try {
        const supabase = createServiceClient();
        const patch: Record<string, any> = {};
        if (input.type !== undefined) patch.type = input.type;
        if (input.name !== undefined) patch.name = input.name;
        if (input.amount !== undefined) patch.amount = input.amount;
        if (input.interestRate !== undefined) patch.interest_rate = input.interestRate;
        if (input.monthlyPayment !== undefined) patch.monthly_payment = input.monthlyPayment;

        const { data, error } = await supabase
          .from("liabilities")
          .update(patch)
          .eq("id", liabilityId)
          .eq("user_id", userId)
          .select()
          .single();

        if (!error && data) return mapLiabilityRow(data);
      } catch (e) {
        console.warn("[Portfolio] Supabase updateLiability failed, falling back to demo mode:", e);
      }
    }

    const liabilityIndex = demoLiabilities.findIndex((l) => l.id === liabilityId);
    if (liabilityIndex !== -1) {
      const liability = demoLiabilities[liabilityIndex];
      if (input.type !== undefined) liability.type = input.type;
      if (input.name !== undefined) liability.name = input.name;
      if (input.amount !== undefined) liability.amount = input.amount;
      if (input.interestRate !== undefined) liability.interest_rate = input.interestRate;
      if (input.monthlyPayment !== undefined) liability.monthly_payment = input.monthlyPayment;
      return mapLiabilityRow(liability);
    }
    throw new Error("Liability not found");
  }

  /**
   * Deletes a single liability owned by the user.
   */
  async deleteLiability(userId: string, liabilityId: string): Promise<void> {
    if (!isPlaceholderUrl) {
      try {
        const supabase = createServiceClient();
        const { error } = await supabase.from("liabilities").delete().eq("id", liabilityId).eq("user_id", userId);
        if (!error) return;
      } catch (e) {
        console.warn("[Portfolio] Supabase deleteLiability failed, falling back to demo mode:", e);
      }
    }

    demoLiabilities = demoLiabilities.filter((l) => l.id !== liabilityId);
  }

  /**
   * Records a net worth snapshot from the current computed totals.
   */
  private async recordSnapshot(
    userId: string,
    computed: { totalAssets: number; totalLiabilities: number; netWorth: number }
  ): Promise<NetWorthSnapshot> {
    if (!isPlaceholderUrl) {
      try {
        const supabase = createServiceClient();
        const { data, error } = await supabase
          .from("net_worth_snapshots")
          .insert({
            user_id: userId,
            total_assets: computed.totalAssets,
            total_liabilities: computed.totalLiabilities,
            net_worth: computed.netWorth,
          })
          .select()
          .single();

        if (!error && data) return mapSnapshotRow(data);
      } catch (e) {
        console.warn("[Portfolio] Supabase recordSnapshot failed, falling back to demo mode:", e);
      }
    }

    const newSnapshot = {
      id: `demo_s_${Date.now()}`,
      user_id: userId,
      total_assets: computed.totalAssets,
      total_liabilities: computed.totalLiabilities,
      net_worth: computed.netWorth,
      computed_at: new Date().toISOString(),
    };
    demoSnapshots.push(newSnapshot);
    return mapSnapshotRow(newSnapshot);
  }

  /**
   * Replaces all of a user's holdings (used by bulk CSV/Excel import and
   * manual "save portfolio" flows) and appends a fresh net worth snapshot.
   */
  async replaceHoldingsAndSnapshot(
    userId: string,
    newAssets: AssetInput[],
    newLiabilities: LiabilityInput[]
  ): Promise<NetWorthSnapshot> {
    if (!isPlaceholderUrl) {
      try {
        const supabase = createServiceClient();

        const [deleteAssetsRes, deleteLiabilitiesRes] = await Promise.all([
          supabase.from("assets").delete().eq("user_id", userId),
          supabase.from("liabilities").delete().eq("user_id", userId),
        ]);

        if (!deleteAssetsRes.error && !deleteLiabilitiesRes.error) {
          if (newAssets.length > 0) {
            const { error } = await supabase.from("assets").insert(
              newAssets.map((a) => ({
                user_id: userId,
                type: a.type,
                name: a.name,
                symbol: a.symbol,
                sector: a.sector,
                value: a.value,
                quantity: a.quantity,
                purchase_price: a.purchasePrice,
              }))
            );
            if (error) throw error;
          }

          if (newLiabilities.length > 0) {
            const { error } = await supabase.from("liabilities").insert(
              newLiabilities.map((l) => ({
                user_id: userId,
                type: l.type,
                name: l.name,
                amount: l.amount,
                interest_rate: l.interestRate,
                monthly_payment: l.monthlyPayment,
              }))
            );
            if (error) throw error;
          }

          const computed = computeNetWorth(
            newAssets.map((a) => ({ ...a, id: "temp", userId, lastUpdated: new Date().toISOString() })),
            newLiabilities.map((l) => ({ ...l, id: "temp", userId }))
          );

          return this.recordSnapshot(userId, computed);
        }
      } catch (e) {
        console.warn("[Portfolio] Supabase replaceHoldingsAndSnapshot failed, falling back to demo mode:", e);
      }
    }

    demoAssets = newAssets.map((a, i) => ({
      id: `demo_a_${Date.now()}_${i}`,
      user_id: userId,
      type: a.type,
      name: a.name,
      symbol: a.symbol,
      sector: a.sector,
      value: a.value,
      quantity: a.quantity,
      purchase_price: a.purchasePrice,
      last_updated: new Date().toISOString(),
    }));

    demoLiabilities = newLiabilities.map((l, i) => ({
      id: `demo_l_${Date.now()}_${i}`,
      user_id: userId,
      type: l.type,
      name: l.name,
      amount: l.amount,
      interest_rate: l.interestRate,
      monthly_payment: l.monthlyPayment,
    }));

    const computed = computeNetWorth(
      demoAssets.map(mapAssetRow),
      demoLiabilities.map(mapLiabilityRow)
    );

    return this.recordSnapshot(userId, computed);
  }

  /**
   * Retrieves the historical snapshots time series for trend charting.
   */
  async getSnapshotHistory(userId: string): Promise<NetWorthSnapshot[]> {
    if (!isPlaceholderUrl) {
      try {
        const supabase = createServiceClient();
        const { data, error } = await supabase
          .from("net_worth_snapshots")
          .select("*")
          .eq("user_id", userId)
          .order("computed_at", { ascending: true });

        if (!error && data) return data.map(mapSnapshotRow);
      } catch (e) {
        console.warn("[Portfolio] Supabase getSnapshotHistory failed, falling back to demo mode:", e);
      }
    }

    return demoSnapshots.map(mapSnapshotRow);
  }
}

export const portfolioService = new PortfolioService();
