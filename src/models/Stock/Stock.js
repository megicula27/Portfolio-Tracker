import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ["BUY", "SELL"],
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  dailyPrices: [
    {
      date: Date,
      price: Number,
      lastUpdated: Date,
    },
  ],
});

export default StockSchema;
