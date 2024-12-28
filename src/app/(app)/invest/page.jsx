"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/utils/animation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Toaster, toast } from "react-hot-toast";

const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

export default function Invest() {
  const { elementRef, isVisible } = useScrollAnimation();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch top gainers/trending stocks
  useEffect(() => {
    const fetchTrendingStocks = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`
        );

        // Get top 10 gainers
        console.log(response);

        const topGainers = response.data.top_gainers
          .slice(0, 10)
          .map((stock) => ({
            symbol: stock.ticker,
            name: stock.ticker, // Alpha Vantage doesn't provide company names in this endpoint
            price: parseFloat(stock.price),
            change: parseFloat(stock.change_percentage),
          }));

        // Fetch company names for each stock
        const stocksWithNames = await Promise.all(
          topGainers.map(async (stock) => {
            try {
              const symbolInfo = await axios.get(
                `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stock.symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
              );
              return {
                ...stock,
                name: symbolInfo.data.Name || stock.symbol,
              };
            } catch (error) {
              return stock;
            }
          })
        );

        setTrendingStocks(stocksWithNames);
        setSearchResults(stocksWithNames);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trending stocks:", error);
        setLoading(false);
        toast.error("Failed to fetch trending stocks");
      }
    };

    fetchTrendingStocks();
  }, []);

  // Handle stock search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) {
      setSearchResults(trendingStocks);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchTerm}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );

      const matches = response.data.bestMatches || [];
      const stockDetails = await Promise.all(
        matches.slice(0, 10).map(async (match) => {
          try {
            const quote = await axios.get(
              `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${match["1. symbol"]}&apikey=${ALPHA_VANTAGE_API_KEY}`
            );

            return {
              symbol: match["1. symbol"],
              name: match["2. name"],
              price: parseFloat(quote.data["Global Quote"]["05. price"]) || 0,
              change:
                parseFloat(quote.data["Global Quote"]["10. change percent"]) ||
                0,
            };
          } catch (error) {
            return null;
          }
        })
      );

      setSearchResults(stockDetails.filter(Boolean));
    } catch (error) {
      console.error("Error searching stocks:", error);
      toast.error("Failed to search stocks. Please try again.");
    }
    setSearchLoading(false);
  };

  // Handle stock purchase
  const handleBuy = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to purchase stocks.");
      return;
    }

    try {
      await axios.post("/api/user/stocks/buy-stock", {
        userId: session.user.id,
        stock: {
          name: selectedStock.symbol,
          boughtPrice: selectedStock.price,
          quantity: quantity,
        },
      });

      toast.success(
        `Successfully purchased ${quantity} shares of ${selectedStock.symbol}`
      );
      setIsDialogOpen(false);
      setSelectedStock(null);
      setQuantity(1);
    } catch (error) {
      console.error("Error purchasing stock:", error);
      toast.error("Failed to purchase stock. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster position="top-right" />
      <div className="pt-16">
        <div
          ref={elementRef}
          className={cn(
            "max-w-3xl mx-auto px-4 py-8 space-y-8 transition-all duration-1000",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          )}
        >
          <h1 className="text-3xl font-bold text-primary">Invest</h1>
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              type="text"
              placeholder="Search for stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input text-foreground"
            />
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={searchLoading}
            >
              {searchLoading ? "Searching..." : "Search"}
            </Button>
          </form>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading trending stocks...</div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">No stocks found</div>
            ) : (
              searchResults.map((stock) => (
                <div
                  key={stock.symbol}
                  className="bg-card p-4 rounded-lg shadow-lg dark:shadow-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {stock.symbol}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {stock.name}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-lg font-semibold text-card-foreground">
                        ${stock.price.toFixed(2)}
                      </p>
                      <p
                        className={cn(
                          "text-sm",
                          stock.change >= 0 ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {stock.change >= 0 ? "+" : ""}
                        {stock.change.toFixed(2)}%
                      </p>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => {
                          setSelectedStock(stock);
                          setIsDialogOpen(true);
                        }}
                      >
                        Buy
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Stock</DialogTitle>
            <DialogDescription>
              Enter the quantity of shares you want to purchase
            </DialogDescription>
          </DialogHeader>

          {selectedStock && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Stock:</span>
                <span>{selectedStock.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Price per share:</span>
                <span>${selectedStock.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-24"
                />
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${(selectedStock.price * quantity).toFixed(2)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBuy}>Confirm Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
