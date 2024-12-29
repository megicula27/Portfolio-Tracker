import { NextResponse } from "next/server";
import dbConnect from "@/database/mongoDb/db";
import User from "@/models/User/User";

export const POST = async (req) => {
  try {
    // Parse the incoming request body
    const body = await req.json();
    const { userId, stock } = body;

    if (!userId || !stock) {
      return NextResponse.json(
        { message: "User ID and stock data are required." },
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

    // Add stock to the user's portfolio
    const newStock = {
      name: stock.name,
      boughtPrice: stock.boughtPrice,
      quantity: stock.quantity,
      purchasedAt: new Date(), // Add a timestamp for when the stock was purchased
    };

    // Push the stock into the user's stocks array
    user.stocks.push(newStock);
    await user.save();

    return NextResponse.json(
      { message: "Stock purchased successfully.", stock: newStock },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error purchasing stock:", error);
    return NextResponse.json(
      { message: "An error occurred while purchasing stock." },
      { status: 500 }
    );
  }
};
