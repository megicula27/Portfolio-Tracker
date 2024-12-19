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
    image: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },

    // Custom fields for your application
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
UserSchema.virtual("portfolio", {
  ref: "Portfolio",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
