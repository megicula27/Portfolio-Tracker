"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
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
import { useScrollAnimation } from "@/utils/animation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

export function Dashboard() {
  const { data: session } = useSession();
  const { elementRef, isVisible } = useScrollAnimation();
  const [selectedStock, setSelectedStock] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [cumulativeData, setCumulativeData] = useState([]);
  const graphRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sellingStock, setSellingStock] = useState(null);

  // Fetch user's stocks and their data
  const fetchStocksData = async () => {
    try {
      // Get user's stocks from backend
      const { data: userStocks } = await axios.get(
        "/api/user/stocks/all-stocks",
        {
          headers: {
            "user-id": session?.user?.id,
          },
        }
      );

      // Fetch current price and intraday data for each stock
      const stocksWithData = await Promise.all(
        userStocks.stocks.map(async (stock) => {
          // Get intraday data for current price and recent performance
          const intradayResponse = await axios.get(
            `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock.name}&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}`
          );

          const intradayData = Object.entries(
            intradayResponse.data["Time Series (5min)"] || {}
          )
            .slice(0, 60) // Last 5 hours of trading (60 5-minute intervals)
            .reverse()
            .map(([date, values]) => ({
              name: new Date(date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              value: parseFloat(values["4. close"]),
            }));

          const currentPrice =
            intradayData[intradayData.length - 1]?.value || 0;
          const change = (
            ((currentPrice - stock.boughtPrice) / stock.boughtPrice) *
            100
          ).toFixed(2);

          return {
            id: stock.name,
            name: stock.name,
            buyPrice: stock.boughtPrice,
            currentPrice: currentPrice,
            change: parseFloat(change),
            intradayData,
            quantity: stock.quantity,
          };
        })
      );

      setStocks(stocksWithData);

      // Fetch weekly data only for cumulative portfolio chart
      const weeklyDataPromises = userStocks.stocks.map(async (stock) => {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${stock.name}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );

        return {
          name: stock.name,
          quantity: stock.quantity,
          weeklyData: Object.entries(response.data["Weekly Time Series"] || {})
            .slice(0, 6)
            .reverse()
            .map(([date, values]) => ({
              date: new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              value: parseFloat(values["4. close"]),
            })),
        };
      });

      const weeklyDataResults = await Promise.all(weeklyDataPromises);

      // Calculate cumulative portfolio value over time using weekly data
      if (weeklyDataResults.length > 0) {
        const dates = weeklyDataResults[0].weeklyData.map((d) => d.date);
        const portfolioValue = dates.map((date, index) => ({
          name: date,
          value: weeklyDataResults.reduce((sum, stock) => {
            const weekValue = stock.weeklyData[index]?.value || 0;
            return sum + weekValue * stock.quantity;
          }, 0),
        }));
        setCumulativeData(portfolioValue);
      }
    } catch (error) {
      console.error("Error fetching stocks data:", error);
    }
  };

  // Initial fetch and setup interval
  useEffect(() => {
    if (session?.user?.id) {
      fetchStocksData();
      const interval = setInterval(fetchStocksData, 300000); // Update every 5 minutes to match intraday data interval

      return () => clearInterval(interval);
    }
  }, [session]);

  const handleStockClick = (stockId) => {
    setSelectedStock(stockId);
    setTimeout(() => {
      graphRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSellClick = (stock) => {
    setSellingStock(stock);
    setIsDialogOpen(true);
  };

  const handleSellConfirm = async () => {
    if (!sellingStock) return;

    try {
      await axios.post("/api/user/sell-stock", {
        userId: session.user.id,
        stockName: sellingStock.name,
        quantity: 1, // Fixed quantity of 1
      });

      toast.success(`Successfully sold 1 share of ${sellingStock.name}`);
      setIsDialogOpen(false);
      setSellingStock(null);
      fetchStocksData(); // Refresh the stocks data
    } catch (error) {
      console.error("Error selling stock:", error);
      toast.error("Failed to sell stock. Please try again.");
    }
  };

  const EmptyPortfolioMessage = () => (
    <div className="bg-card p-8 rounded-lg shadow-lg dark:shadow-white/10 text-center">
      <h3 className="text-xl font-semibold text-card-foreground mb-4">
        Your portfolio is empty
      </h3>
      <p className="text-muted-foreground mb-6">
        Start building your portfolio by investing in stocks.
      </p>
      <Link href="/invest" passHref>
        <Button size="lg">Go to Invest Page</Button>
      </Link>
    </div>
  );

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

        {stocks.length > 0 ? (
          <>
            {/* Portfolio Performance (Weekly) */}
            <div className="bg-card p-4 rounded-lg shadow-lg dark:shadow-white/10 transition-all duration-300">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">
                Portfolio Performance (Weekly)
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

            {/* Stock List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-card-foreground">
                Your Stocks
              </h2>
              {stocks.map((stock) => (
                <div
                  key={stock.id}
                  className="bg-card p-4 rounded-lg shadow-lg dark:shadow-white/10 cursor-pointer hover:bg-secondary transition-colors"
                  onClick={() => handleStockClick(stock.name)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {stock.name}
                    </h3>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStockClick(stock.name);
                        }}
                      >
                        View Tracker
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSellClick(stock);
                        }}
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-card-foreground">
                    <span>Buy Price: ${stock.buyPrice}</span>
                    <span>Current Price: ${stock.currentPrice.toFixed(2)}</span>
                    <span>Quantity: {stock.quantity}</span>
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
          </>
        ) : (
          <EmptyPortfolioMessage />
        )}

        {/* Individual Stock Performance (Intraday) */}
        {selectedStock && (
          <div
            ref={graphRef}
            className="bg-card p-4 rounded-lg shadow-lg dark:shadow-white/10 mt-8 transition-all duration-300"
          >
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">
              {selectedStock} Performance (Today)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={
                  stocks.find((s) => s.name === selectedStock)?.intradayData ||
                  []
                }
              >
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

        {/* Sell Stock Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sell Stock</DialogTitle>
              <DialogDescription>
                Are you sure you want to sell 1 share of {sellingStock?.name}?
              </DialogDescription>
            </DialogHeader>

            {sellingStock && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Stock:</span>
                  <span>{sellingStock.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current Price:</span>
                  <span>${sellingStock.currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantity:</span>
                  <span>1</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${sellingStock.currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Profit/Loss:</span>
                  <span
                    className={
                      sellingStock.currentPrice - sellingStock.buyPrice >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    $
                    {(
                      sellingStock.currentPrice - sellingStock.buyPrice
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSellConfirm}>Confirm Sale</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
