import { NextRequest, NextResponse } from "next/server";
import { portfolioImportSchema } from "@/lib/validation";
import { portfolioService } from "@/services/portfolio";
import { DEMO_USER_ID } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = portfolioImportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid portfolio import payload",
          details: validation.error.errors.map((e) => ({
            path: e.path.join("."),
            reason: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const userId = DEMO_USER_ID;
    const snapshot = await portfolioService.replaceHoldingsAndSnapshot(
      userId,
      validation.data.assets,
      validation.data.liabilities
    );

    return NextResponse.json({ snapshot }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process import" }, { status: 500 });
  }
}
