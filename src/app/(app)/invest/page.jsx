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

export default function Invest() {
  const { elementRef, isVisible } = useScrollAnimation();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch trending stocks using getTrendingStocks
  useEffect(() => {
    const fetchTrendingStocks = async () => {
      try {
        const res = await axios.get("/api/stocks/getTrendingStocks");
        const trendingStocksData = res.data;
        setTrendingStocks(trendingStocksData);
        setSearchResults(trendingStocksData);
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
      const res = await axios.get(
        `/api/stocks/searchStocks?query=${searchTerm}`
      );
      const searchResultsData = res.data;
      setSearchResults(searchResultsData);
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

    if (!selectedStock || selectedStock.price == null) {
      toast.error("Unable to purchase stock. Price information is missing.");
      return;
    }

    try {
      const response = await axios.post("/api/user/stocks/buy-stock", {
        userId: session.user.id,
        stock: {
          name: selectedStock.symbol,
          boughtPrice: selectedStock.price,
          quantity: 1, // Fixed quantity of 1
        },
      });

      if (response.data.success) {
        toast.success(
          `Successfully purchased 1 share of ${selectedStock.symbol}`
        );
        setIsDialogOpen(false);
        setSelectedStock(null);
      } else if (response.status === 202) {
        toast.error(
          `You already own ${selectedStock.symbol}. Purchase failed.` ||
            response.data.error
        );
      }
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
                        {stock.name || "N/A"}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-lg font-semibold text-card-foreground">
                        {stock.price != null
                          ? `$${stock.price.toFixed(2)}`
                          : "N/A"}
                      </p>
                      {stock.changePercent != null && (
                        <p
                          className={cn(
                            "text-sm",
                            stock.changePercent >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          )}
                        >
                          {stock.changePercent >= 0 ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%
                        </p>
                      )}
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => {
                          setSelectedStock(stock);
                          setIsDialogOpen(true);
                        }}
                        disabled={stock.price == null}
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
              Confirm your purchase of 1 share
            </DialogDescription>
          </DialogHeader>

          {selectedStock && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Stock:</span>
                <span>{selectedStock.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Company:</span>
                <span>{selectedStock.name || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Price per share:</span>
                <span>
                  {selectedStock.price != null
                    ? `$${selectedStock.price.toFixed(2)}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <span>1</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>
                  {selectedStock.price != null
                    ? `$${selectedStock.price.toFixed(2)}`
                    : "N/A"}
                </span>
              </div>
              {selectedStock.changePercent != null && (
                <div className="flex justify-between text-sm">
                  <span>Change:</span>
                  <span
                    className={
                      selectedStock.changePercent >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {selectedStock.changePercent >= 0 ? "+" : ""}
                    {selectedStock.changePercent.toFixed(2)}%
                  </span>
                </div>
              )}
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
