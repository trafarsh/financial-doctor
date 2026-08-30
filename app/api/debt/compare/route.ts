import { NextRequest, NextResponse } from "next/server";
import { debtComparisonRequestSchema } from "@/lib/validation";
import { debtComparisonService } from "@/services/debt";
import { DEMO_USER_ID } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = debtComparisonRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid debt comparison input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const userId = DEMO_USER_ID;
    const result = await debtComparisonService.compare(userId, validation.data);

    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Debt comparison failed" }, { status: 500 });
  }
}
