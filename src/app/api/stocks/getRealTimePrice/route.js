import { NextRequest, NextResponse } from "next/server";
import { getRealTimePrice } from "@/utils/stockUtils";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    const realTimePrice = await getRealTimePrice(symbol);
    return NextResponse.json(realTimePrice);
  } catch (error) {
    console.error("Error fetching real-time price:", error);
    return NextResponse.json(
      { error: "Failed to fetch real-time price" },
      { status: 500 }
    );
  }
}
