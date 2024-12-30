import { NextResponse } from "next/server";
import dbConnect from "@/database/mongoDb/db";
import User from "@/models/User/User";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { userId, stock } = body;

    if (!userId || !stock) {
      return NextResponse.json(
        { message: "User ID and stock data are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Check if the stock already exists in the user's portfolio
    const existingStock = user.stocks.find((s) => s.name === stock.name);
    if (existingStock) {
      return NextResponse.json(
        {
          message: `You already own ${stock.name}.`,
          success: false,
          error: "Stock already exists in portfolio.",
        },
        { status: 202 }
      );
    }

    // Add the new stock to the portfolio
    const newStock = {
      name: stock.name,
      boughtPrice: stock.boughtPrice,
      quantity: stock.quantity,
      purchasedAt: new Date(),
    };

    user.portfolio = user.portfolio + stock.boughtPrice * stock.quantity;
    user.stocks.push(newStock);
    await user.save();

    return NextResponse.json(
      {
        message: "Stock purchased successfully.",
        stock: newStock,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error purchasing stock:", error);
    return NextResponse.json(
      { message: "An error occurred while purchasing stock.", success: false },
      { status: 500 }
    );
  }
};
