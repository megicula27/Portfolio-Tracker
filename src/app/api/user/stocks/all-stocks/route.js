import { NextResponse } from "next/server";
import dbConnect from "@/database/mongoDb/db"; // Replace with your DB connection utility
import User from "@/models/User/User"; // Adjust the path to your User model

export const GET = async (req) => {
  try {
    // Establish a database connection
    await dbConnect();

    // Get the userId from the headers
    const userId = req.headers.get("user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch the user and their stocks
    const user = await User.findById(userId, "stocks portfolio").lean(); // Fetch only the stocks field
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the stocks
    return NextResponse.json(
      { stocks: user.stocks, portfolio: user.portfolio },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
