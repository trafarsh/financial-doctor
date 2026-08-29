import { NextRequest, NextResponse } from "next/server";
import { copilotRequestSchema } from "@/lib/validation";
import { copilotService } from "@/services/ai/copilot";
import { DEMO_USER_ID } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = copilotRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid question format", details: validation.error.format() },
        { status: 400 }
      );
    }

    const userId = DEMO_USER_ID;
    const responseMessage = await copilotService.askCopilot(userId, validation.data.message);

    return NextResponse.json({ message: responseMessage });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Copilot request failed" }, { status: 500 });
  }
}
