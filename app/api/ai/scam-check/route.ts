import { NextRequest, NextResponse } from "next/server";
import { scamCheckRequestSchema } from "@/lib/validation";
import { scamDetectorService } from "@/services/scam";
import { DEMO_USER_ID } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = scamCheckRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid claim text input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const userId = DEMO_USER_ID;
    const result = await scamDetectorService.evaluateClaim(validation.data.claimText, userId);

    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Scam check failed" }, { status: 500 });
  }
}
