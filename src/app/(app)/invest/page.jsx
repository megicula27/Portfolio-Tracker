"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/utils/animation";
import { cn } from "@/lib/utils";

const dummyStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 150.25 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 2750.8 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 3450.0 },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 310.75 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 850.5 },
];

export default function Invest() {
  const { elementRef, isVisible } = useScrollAnimation();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(dummyStocks);

  const handleSearch = (e) => {
    e.preventDefault();
    const results = dummyStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
            >
              Search
            </Button>
          </form>
          <div className="space-y-4">
            {searchResults.map((stock) => (
              <div
                key={stock.symbol}
                className="bg-card p-4 rounded-lg shadow-lg"
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
                  <div className="text-right">
                    <p className="text-lg font-semibold text-card-foreground">
                      ${stock.price.toFixed(2)}
                    </p>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
