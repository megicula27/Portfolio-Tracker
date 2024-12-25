"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useScrollAnimation } from "../../utils/animation";
import { cn } from "../../lib/utils";

const cumulativeData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
];

const stocks = [
  { id: 1, name: "AAPL", buyPrice: 150, currentPrice: 170, change: 13.33 },
  { id: 2, name: "GOOGL", buyPrice: 2800, currentPrice: 2750, change: -1.79 },
  { id: 3, name: "AMZN", buyPrice: 3300, currentPrice: 3450, change: 4.55 },
  { id: 4, name: "MSFT", buyPrice: 300, currentPrice: 310, change: 3.33 },
  { id: 5, name: "TSLA", buyPrice: 900, currentPrice: 850, change: -5.56 },
];

export function Dashboard() {
  const { elementRef, isVisible } = useScrollAnimation();
  const [selectedStock, setSelectedStock] = useState<number | null>(null);

  const getStockData = (stockId: number) => {
    return [
      { name: "Jan", value: stocks[stockId - 1].buyPrice },
      { name: "Feb", value: stocks[stockId - 1].buyPrice * 1.05 },
      { name: "Mar", value: stocks[stockId - 1].buyPrice * 1.1 },
      { name: "Apr", value: stocks[stockId - 1].buyPrice * 1.08 },
      { name: "May", value: stocks[stockId - 1].buyPrice * 1.15 },
      { name: "Jun", value: stocks[stockId - 1].currentPrice },
    ];
  };

  return (
    <div className="min-h-screen pt-16">
      <div
        ref={elementRef}
        className={cn(
          "max-w-7xl mx-auto px-4 py-8 space-y-8 transition-all duration-1000",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}
      >
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>

        <div className="bg-card p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">
            Portfolio Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativeData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                activeDot={{
                  r: 8,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Your Stocks
          </h2>
          {stocks.map((stock) => (
            <div
              key={stock.id}
              className="bg-card p-4 rounded-lg shadow-lg cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => setSelectedStock(stock.id)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-card-foreground">
                  {stock.name}
                </h3>
                <button className="bg-destructive text-destructive-foreground px-3 py-1 rounded hover:bg-destructive/90 transition-colors">
                  Sell
                </button>
              </div>
              <div className="mt-2 flex justify-between text-sm text-card-foreground">
                <span>Buy Price: ${stock.buyPrice}</span>
                <span>Current Price: ${stock.currentPrice}</span>
                <span
                  className={
                    stock.change >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedStock && (
          <div className="bg-card p-4 rounded-lg shadow-lg mt-8">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">
              {stocks[selectedStock - 1].name} Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getStockData(selectedStock)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                  activeDot={{
                    r: 8,
                    fill: "hsl(var(--primary))",
                    stroke: "hsl(var(--background))",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
