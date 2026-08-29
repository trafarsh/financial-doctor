import { NextRequest, NextResponse } from "next/server";
import { liabilityInputSchema } from "@/lib/validation";
import { portfolioService } from "@/services/portfolio";
import { DEMO_USER_ID } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = liabilityInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid liability payload",
          details: validation.error.errors.map((e) => ({ path: e.path.join("."), reason: e.message })),
        },
        { status: 400 }
      );
    }

    const userId = DEMO_USER_ID;
    const liability = await portfolioService.createLiability(userId, validation.data);
    return NextResponse.json({ liability }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create liability" }, { status: 500 });
  }
}
