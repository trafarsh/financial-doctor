export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { householdProfileSchema } from "@/lib/validation";
import { schemesService } from "@/services/schemes";
import { DEMO_USER_ID } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = householdProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const profile = parsed.data;
    const userId = DEMO_USER_ID;

    // 1. Evaluate matching schemes
    const matches = schemesService.evaluateSchemes(profile);

    // 2. Generate LLM explanation of the results
    const explanation = await schemesService.generateExplanation(userId, profile, matches);

    return NextResponse.json({
      profile,
      matches,
      explanation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to match government schemes" },
      { status: 500 }
    );
  }
}
