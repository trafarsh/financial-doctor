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

export class PortfolioService {
  /**
   * Retrieves current assets and liabilities for the authenticated user.
   * Returns empty arrays (not mock data) when the user has no holdings.
   */
  async getHoldings(userId: string): Promise<{
    assets: Asset[];
    liabilities: Liability[];
    netWorthSummary: { totalAssets: number; totalLiabilities: number; netWorth: number };
  }> {
    const supabase = createServiceClient();
    const [assetsRes, liabilitiesRes] = await Promise.all([
      supabase.from("assets").select("*").eq("user_id", userId).order("last_updated", { ascending: false }),
      supabase.from("liabilities").select("*").eq("user_id", userId),
    ]);

    if (assetsRes.error) throw new Error(`Failed to load assets: ${assetsRes.error.message}`);
    if (liabilitiesRes.error) throw new Error(`Failed to load liabilities: ${liabilitiesRes.error.message}`);

    const assets = (assetsRes.data || []).map(mapAssetRow);
    const liabilities = (liabilitiesRes.data || []).map(mapLiabilityRow);
    const netWorthSummary = computeNetWorth(assets, liabilities);

    return { assets, liabilities, netWorthSummary };
  }

  /**
   * Creates a single asset for the user.
   */
  async createAsset(userId: string, input: AssetInput): Promise<Asset> {
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

    if (error) throw new Error(`Failed to create asset: ${error.message}`);
    return mapAssetRow(data);
  }

  /**
   * Updates a single asset owned by the user.
   */
  async updateAsset(userId: string, assetId: string, input: Partial<AssetInput>): Promise<Asset> {
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

    if (error) throw new Error(`Failed to update asset: ${error.message}`);
    return mapAssetRow(data);
  }

  /**
   * Deletes a single asset owned by the user.
   */
  async deleteAsset(userId: string, assetId: string): Promise<void> {
    const supabase = createServiceClient();
    const { error } = await supabase.from("assets").delete().eq("id", assetId).eq("user_id", userId);
    if (error) throw new Error(`Failed to delete asset: ${error.message}`);
  }

  /**
   * Creates a single liability for the user.
   */
  async createLiability(userId: string, input: LiabilityInput): Promise<Liability> {
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

    if (error) throw new Error(`Failed to create liability: ${error.message}`);
    return mapLiabilityRow(data);
  }

  /**
   * Updates a single liability owned by the user.
   */
  async updateLiability(userId: string, liabilityId: string, input: Partial<LiabilityInput>): Promise<Liability> {
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

    if (error) throw new Error(`Failed to update liability: ${error.message}`);
    return mapLiabilityRow(data);
  }

  /**
   * Deletes a single liability owned by the user.
   */
  async deleteLiability(userId: string, liabilityId: string): Promise<void> {
    const supabase = createServiceClient();
    const { error } = await supabase.from("liabilities").delete().eq("id", liabilityId).eq("user_id", userId);
    if (error) throw new Error(`Failed to delete liability: ${error.message}`);
  }

  /**
   * Records a net worth snapshot from the current computed totals.
   */
  private async recordSnapshot(
    userId: string,
    computed: { totalAssets: number; totalLiabilities: number; netWorth: number }
  ): Promise<NetWorthSnapshot> {
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

    if (error) throw new Error(`Failed to record net worth snapshot: ${error.message}`);
    return mapSnapshotRow(data);
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
    const supabase = createServiceClient();

    const [deleteAssetsRes, deleteLiabilitiesRes] = await Promise.all([
      supabase.from("assets").delete().eq("user_id", userId),
      supabase.from("liabilities").delete().eq("user_id", userId),
    ]);

    if (deleteAssetsRes.error) throw new Error(`Failed to clear existing assets: ${deleteAssetsRes.error.message}`);
    if (deleteLiabilitiesRes.error) throw new Error(`Failed to clear existing liabilities: ${deleteLiabilitiesRes.error.message}`);

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
      if (error) throw new Error(`Failed to insert assets: ${error.message}`);
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
      if (error) throw new Error(`Failed to insert liabilities: ${error.message}`);
    }

    const computed = computeNetWorth(
      newAssets.map((a) => ({ ...a, id: "temp", userId, lastUpdated: new Date().toISOString() })),
      newLiabilities.map((l) => ({ ...l, id: "temp", userId }))
    );

    return this.recordSnapshot(userId, computed);
  }

  /**
   * Retrieves the historical snapshots time series for trend charting.
   * Returns an empty array (not mock data) when none exist yet.
   */
  async getSnapshotHistory(userId: string): Promise<NetWorthSnapshot[]> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("net_worth_snapshots")
      .select("*")
      .eq("user_id", userId)
      .order("computed_at", { ascending: true });

    if (error) throw new Error(`Failed to load net worth history: ${error.message}`);
    return (data || []).map(mapSnapshotRow);
  }
}

export const portfolioService = new PortfolioService();
