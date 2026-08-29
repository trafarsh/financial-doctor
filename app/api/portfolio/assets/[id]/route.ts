import { NextRequest, NextResponse } from "next/server";
import { assetInputSchema } from "@/lib/validation";
import { portfolioService } from "@/services/portfolio";
import { DEMO_USER_ID } from "@/lib/config";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validation = assetInputSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid asset update payload",
          details: validation.error.errors.map((e) => ({ path: e.path.join("."), reason: e.message })),
        },
        { status: 400 }
      );
    }

    const userId = DEMO_USER_ID;
    const asset = await portfolioService.updateAsset(userId, params.id, validation.data);
    return NextResponse.json({ asset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = DEMO_USER_ID;
    await portfolioService.deleteAsset(userId, params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete asset" }, { status: 500 });
  }
}
