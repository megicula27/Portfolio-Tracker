import { NextRequest, NextResponse } from "next/server";
import { getTrendingStocks } from "@/utils/stockUtils";

export async function GET(req) {
  try {
    const trendingStocks = await getTrendingStocks();
    return NextResponse.json(trendingStocks);
  } catch (error) {
    console.error("Error fetching trending stocks:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending stocks" },
      { status: 500 }
    );
  }
}
