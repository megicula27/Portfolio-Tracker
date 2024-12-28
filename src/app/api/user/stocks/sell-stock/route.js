import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export const POST = async (req) => {
  try {
    // Parse the incoming request body
    const body = await req.json();
    const { userId, stockName } = body;

    if (!userId || !stockName) {
      return NextResponse.json(
        { message: "User ID and stock name are required." },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Remove the stock with the given name from the user's portfolio
    const updatedStocks = user.stocks.filter(
      (stock) => stock.name !== stockName
    );

    if (updatedStocks.length === user.stocks.length) {
      return NextResponse.json(
        { message: "Stock not found in user portfolio." },
        { status: 404 }
      );
    }

    // Update the user's stocks and save
    user.stocks = updatedStocks;
    await user.save();

    return NextResponse.json(
      { message: "Stock sold successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error selling stock:", error);
    return NextResponse.json(
      { message: "An error occurred while selling the stock." },
      { status: 500 }
    );
  }
};
