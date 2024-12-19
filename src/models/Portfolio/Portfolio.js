import mongoose from "mongoose";
import StockSchema from "../Stock/Stock";
function arrayLimit(val) {
  return val.length <= 5;
}

const PortfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stocks: {
      type: [StockSchema],
      validate: [arrayLimit, "Exceeds the limit of 5 stocks"],
    },
    totalInvestment: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

PortfolioSchema.methods.calculateTotalValue = function () {
  return this.stocks.reduce((total, stock) => {
    return total + stock.quantity * stock.purchasePrice;
  }, 0);
};

PortfolioSchema.pre("save", function (next) {
  this.totalInvestment = this.calculateTotalValue();
  this.lastUpdated = new Date();
  next();
});

const Portfolio = mongoose.model("Portfolio", PortfolioSchema);

export default mongoose.models.Portfolio || Portfolio;
