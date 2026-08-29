import { NextRequest, NextResponse } from "next/server";
import { assetInputSchema } from "@/lib/validation";
import { portfolioService } from "@/services/portfolio";
import { DEMO_USER_ID } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = assetInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid asset payload",
          details: validation.error.errors.map((e) => ({ path: e.path.join("."), reason: e.message })),
        },
        { status: 400 }
      );
    }

    const userId = DEMO_USER_ID;
    const asset = await portfolioService.createAsset(userId, validation.data);
    return NextResponse.json({ asset }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create asset" }, { status: 500 });
  }
}
