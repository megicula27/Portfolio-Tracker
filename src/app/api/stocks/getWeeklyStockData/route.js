import { NextRequest, NextResponse } from "next/server";
import { getWeeklyStockData } from "@/utils/stockUtils";

export async function GET(reqs) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    const weeklyData = await getWeeklyStockData(symbol);
    return NextResponse.json(weeklyData);
  } catch (error) {
    console.error("Error fetching weekly data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly data" },
      { status: 500 }
    );
  }
}
