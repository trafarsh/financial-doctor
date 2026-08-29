import { NextRequest, NextResponse } from "next/server";
import { liabilityInputSchema } from "@/lib/validation";
import { portfolioService } from "@/services/portfolio";
import { DEMO_USER_ID } from "@/lib/config";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validation = liabilityInputSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid liability update payload",
          details: validation.error.errors.map((e) => ({ path: e.path.join("."), reason: e.message })),
        },
        { status: 400 }
      );
    }

    const userId = DEMO_USER_ID;
    const liability = await portfolioService.updateLiability(userId, params.id, validation.data);
    return NextResponse.json({ liability });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update liability" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = DEMO_USER_ID;
    await portfolioService.deleteLiability(userId, params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete liability" }, { status: 500 });
  }
}
