import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },

    // Custom fields for your application
    stocks: {
      type: [
        {
          name: { type: String, required: true }, // Stock name
          boughtPrice: { type: Number, required: true }, // Bought price for the stock
          quantity: { type: Number, default: 1 }, // Quantity of stocks bought
          purchasedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    portfolio: {
      type: Number,
      default: 0,
    },

    preferences: {
      currency: {
        type: String,
        default: "USD",
      },
      // notifications: {
      //   type: Boolean,
      //   default: true
      // }
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

//  virtual populate for the user's portfolio

export default mongoose.models.User || mongoose.model("User", UserSchema);
