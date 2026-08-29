export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { newsService } from "@/services/news";

export async function GET(req: NextRequest) {
  try {
    const ticker = req.nextUrl.searchParams.get("ticker") || undefined;
    const articles = await newsService.getLatestNews(ticker);
    return NextResponse.json({ articles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch news" }, { status: 500 });
  }
}