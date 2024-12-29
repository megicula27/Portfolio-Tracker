import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/utils/stockUtils";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const searchResults = await searchStocks(query);
    return NextResponse.json(searchResults);
  } catch (error) {
    console.error("Error searching stocks:", error);
    return NextResponse.json(
      { error: "Failed to search stocks" },
      { status: 500 }
    );
  }
}
