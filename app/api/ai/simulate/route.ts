import { NextRequest, NextResponse } from "next/server";
import { simulationRequestSchema } from "@/lib/validation";
import { portfolioService } from "@/services/portfolio";
import { simulationService } from "@/services/simulation";
import { DEMO_USER_ID } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = simulationRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid simulation assumptions", details: validation.error.format() },
        { status: 400 }
      );
    }

    const userId = DEMO_USER_ID;
    const { netWorthSummary } = await portfolioService.getHoldings(userId);

    const scenario = await simulationService.runScenario(
      userId,
      netWorthSummary.netWorth,
      validation.data.assumptions
    );

    return NextResponse.json({ scenario });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Simulation failed" }, { status: 500 });
  }
}
