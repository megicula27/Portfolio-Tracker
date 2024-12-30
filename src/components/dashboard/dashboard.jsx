"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
import { StockLoading } from "../loader/loader";

export function Dashboard() {
  const { data: session } = useSession();
  const { elementRef, isVisible } = useScrollAnimation();
  const [selectedStock, setSelectedStock] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [cumulativeData, setCumulativeData] = useState([]);
  const [boughtValue, setBoughtValue] = useState();
  const graphRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sellingStock, setSellingStock] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's stocks and their data
  const fetchStocksData = async () => {
    setIsLoading(true);
    try {
      const { data: userStocks } = await axios.get(
        "/api/user/stocks/all-stocks",
        {
          headers: {
            "user-id": session?.user?.id,
          },
        }
      );
      setBoughtValue(userStocks.portfolio.toFixed(2));
      const stocksWithData = await Promise.all(
        userStocks.stocks.map(async (stock) => {
          // Get real-time price data
          const realTimeData = await axios.get(
            `/api/stocks/getRealTimePrice?symbol=${stock.name}`
          );

          // Get weekly closing prices
          const weeklyPrices = await axios.get(
            `/api/stocks/getWeeklyStockData?symbol=${stock.name}`
          );

          // Map the weekly data to your desired format
          const intradayData = weeklyPrices.data.map((price, index) => ({
            name: price.date, // Use the date from the API response
            value: parseFloat(price.close).toFixed(1), // Use the closing price for the stock value
          }));

          return {
            id: stock.name,
            name: stock.name,
            buyPrice: stock.boughtPrice,
            currentPrice: realTimeData.data.currentPrice,
            change: realTimeData.data.changePercent,
            intradayData, // Set the mapped weekly data
            quantity: stock.quantity,
          };
        })
      );

      setStocks(stocksWithData);

      // Calculate cumulative portfolio value
      if (stocksWithData.length > 0) {
        const portfolioValue = stocksWithData[0].intradayData.map(
          (_, index) => ({
            name: stocksWithData[0].intradayData[index].name,
            value: parseFloat(
              stocksWithData
                .reduce((sum, stock) => {
                  return (
                    sum +
                    (stock.intradayData[index]?.value || 0) * stock.quantity
                  );
                }, 0)
                .toFixed(2) // Fix to two decimal places
            ),
          })
        );

        setCumulativeData(portfolioValue);
      }
    } catch (error) {
      console.error("Error fetching stocks data:", error);
      toast.error("Failed to fetch portfolio data");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and setup interval
  useEffect(() => {
    if (session?.user?.id) {
      fetchStocksData();
      const interval = setInterval(fetchStocksData, 300000); // Update every 5 minutes

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
      const response = await axios.post("/api/user/stocks/sell-stock", {
        userId: session.user.id,
        stock: sellingStock,
        quantity: 1, // Fixed quantity of 1
      });
      if (response.status === 200) {
        toast.success(`Successfully sold 1 share of ${sellingStock.name}`);
        // setTimeout(() => {
        //   fetchStocksData();
        // }, 500); // Delay fetch to let toast display
      }
      setIsDialogOpen(false);
      setSellingStock(null);
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

  const getYAxisDomain = (data) => {
    const values = data.map((item) => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const range = maxValue - minValue;

    // Dynamically adjust the step based on the range
    let step;
    if (range < 1) {
      step = 0.1; // Small values, e.g., 1.12, 1.14
    } else if (range <= 50) {
      step = 5; // Moderate values, e.g., 30, 50
    } else if (range <= 500) {
      step = 50; // Larger values, e.g., 240, 280
    } else {
      step = Math.ceil(range / 10); // Very large values
    }

    const adjustedMin = Math.floor(minValue / step) * step;
    const adjustedMax = Math.ceil(maxValue / step) * step;

    return { domain: [adjustedMin, adjustedMax], step };
  };

  const renderYAxis = (props) => {
    const { domain, step } = props;
    const [min, max] = domain;

    const ticks = [];
    for (let value = min; value <= max; value += step) {
      ticks.push(parseFloat(value.toFixed(2))); // Ensures precision
    }

    return <YAxis {...props} ticks={ticks} />;
  };

  const portfolioSummary = useMemo(() => {
    const totalValue = stocks.reduce(
      (sum, stock) => sum + stock.currentPrice * stock.quantity,
      0
    );

    const totalProfit = totalValue - boughtValue;
    const profitPercentage = (totalProfit / boughtValue) * 100;

    return {
      totalValue: totalValue.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      profitPercentage: profitPercentage.toFixed(2),
    };
  }, [stocks]);

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

        {isLoading ? (
          <StockLoading />
        ) : (
          <>
            {stocks.length > 0 ? (
              <>
                {/* Portfolio Summary */}
                <div className="bg-card p-4 rounded-lg shadow-lg dark:shadow-white/10 transition-all duration-300">
                  <h2 className="text-xl font-semibold mb-4 text-card-foreground">
                    Portfolio Summary
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Bought Value
                      </p>

                      <p className="text-2xl font-bold">${boughtValue}</p>
                      <p className="text-sm text-muted-foreground">
                        Current Value
                      </p>
                      <p className="text-2xl font-bold">
                        ${portfolioSummary.totalValue}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Profit/Loss
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          parseFloat(portfolioSummary.totalProfit) >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        ${portfolioSummary.totalProfit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Profit/Loss Percentage
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          parseFloat(portfolioSummary.profitPercentage) >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {portfolioSummary.profitPercentage}%
                      </p>
                    </div>
                  </div>
                </div>

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
                      {(() => {
                        const { domain, step } = getYAxisDomain(cumulativeData);
                        return renderYAxis({
                          stroke: "hsl(var(--foreground))",
                          padding: { top: 10, bottom: 10 }, // Add padding to Y-axis

                          tick: { fill: "hsl(var(--foreground))" },

                          domain,
                          step,
                        });
                      })()}
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ color: "hsl(var(--foreground))" }}
                      />
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
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                        isAnimationActive={true}
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
                        <span>
                          Current Price: ${stock.currentPrice.toFixed(2)}
                        </span>
                        <span>Quantity: {stock.quantity}</span>
                        <span
                          className={
                            stock.change >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {stock.change >= 0 ? "+" : ""}
                          {stock.change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyPortfolioMessage />
            )}

            {/* Individual Stock Performance */}
            {selectedStock && (
              <div
                ref={graphRef}
                className="bg-card p-4 rounded-lg shadow-lg dark:shadow-white/10 mt-8 transition-all duration-300"
              >
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">
                  {selectedStock} Performance (Recent)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={
                      stocks.find((s) => s.name === selectedStock)
                        ?.intradayData || []
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
                    {renderYAxis({
                      stroke: "hsl(var(--foreground))",
                      padding: { top: 10, bottom: 10 }, // Add padding to Y-axis
                      tick: { fill: "hsl(var(--foreground))" },
                      ...getYAxisDomain(
                        stocks.find((s) => s.name === selectedStock)
                          ?.intradayData || []
                      ),
                    })}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: "hsl(var(--foreground))" }}
                    />
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
                      animationDuration={2000}
                      animationEasing="ease-in-out"
                      isAnimationActive={true}
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
                    Are you sure you want to sell 1 share of{" "}
                    {sellingStock?.name}?
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
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSellConfirm}>Confirm Sale</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
