import axios from "axios";

// Finnhub API Configuration
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

if (!FINNHUB_API_KEY) {
  throw new Error(
    "Finnhub API key is missing. Set it in your environment variables."
  );
}

// Axios Instance for Finnhub
const apiClient = axios.create({
  baseURL: FINNHUB_BASE_URL,
  params: {
    token: FINNHUB_API_KEY, // Add token to all requests automatically
  },
});

/**
 * Fetch weekly stock data (closing prices).
 * @param {string} symbol - Stock symbol (e.g., AAPL).
 * @returns {Promise<number[]>} - Weekly closing prices.
 */
export const getWeeklyStockData = async (symbol) => {
  try {
    const oneYearAgo = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 365;
    const currentTime = Math.floor(Date.now() / 1000);

    const response = await apiClient.get("/stock/candle", {
      params: {
        symbol,
        resolution: "W",
        from: oneYearAgo,
        to: currentTime,
      },
    });

    if (response.data.s !== "ok") {
      throw new Error("No data available for the given symbol.");
    }

    return response.data.c; // Return closing prices
  } catch (error) {
    console.error(
      "Error fetching weekly stock data:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch weekly stock data");
  }
};

/**
 * Fetch real-time stock price data.
 * @param {string} symbol - Stock symbol (e.g., AAPL).
 * @returns {Promise<Object>} - Real-time stock data (current price, change, etc.).
 */
export const getRealTimePrice = async (symbol) => {
  try {
    const response = await apiClient.get("/quote", {
      params: { symbol },
    });

    return {
      currentPrice: response.data.c,
      change: response.data.d,
      changePercent: response.data.dp,
      volume: response.data.v,
    };
  } catch (error) {
    console.error(
      "Error fetching real-time price:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch real-time stock data");
  }
};

/**
 * Fetch trending stocks (gainers).
 * @returns {Promise<Object[]>} - Array of trending stocks.
 */
export const getTrendingStocks = async () => {
  try {
    // Fetch all US exchange symbols
    const response = await apiClient.get("/stock/symbol", {
      params: { exchange: "US" },
    });

    // Example logic to select the top 10 stocks
    const topStocks = response.data.slice(0, 10);

    // Fetch price and additional data for each stock using the /quote endpoint
    const trendingStocks = await Promise.all(
      topStocks.map(async (stock) => {
        try {
          const quoteResponse = await apiClient.get("/quote", {
            params: { symbol: stock.symbol },
          });

          return {
            symbol: stock.symbol,
            name: stock.description,
            price: quoteResponse.data.c || null,
            change: quoteResponse.data.d || null,
            changePercent: quoteResponse.data.dp || null,
          };
        } catch (error) {
          console.error(
            `Failed to fetch data for ${stock.symbol}:`,
            error.response?.data || error.message
          );
          return {
            symbol: stock.symbol,
            name: stock.description,
            price: null,
            change: null,
            changePercent: null,
          };
        }
      })
    );

    return trendingStocks;
  } catch (error) {
    console.error(
      "Error fetching trending stocks:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch trending stocks");
  }
};

/**
 * Search stocks by query.
 * @param {string} query - Search term (e.g., "Apple").
 * @returns {Promise<Object[]>} - Search results with symbols and names.
 */
export const searchStocks = async (query) => {
  try {
    if (!query) return [];

    // Fetch search results
    const response = await apiClient.get("/search", {
      params: { q: query },
    });

    const searchResults = response.data.result;

    // Fetch price data for each stock
    const stocksWithPrices = await Promise.all(
      searchResults.map(async (stock) => {
        try {
          const quoteResponse = await apiClient.get("/quote", {
            params: { symbol: stock.symbol },
          });

          return {
            symbol: stock.symbol,
            name: stock.description,
            price: quoteResponse.data.c || null,
            change: quoteResponse.data.d || null,
            changePercent: quoteResponse.data.dp || null,
          };
        } catch (error) {
          console.error(
            `Failed to fetch price for ${stock.symbol}:`,
            error.response?.data || error.message
          );
          return {
            symbol: stock.symbol,
            name: stock.description,
            price: null,
            change: null,
            changePercent: null,
          };
        }
      })
    );

    return stocksWithPrices;
  } catch (error) {
    console.error(
      "Error searching stocks:",
      error.response?.data || error.message
    );
    throw new Error("Failed to search stocks");
  }
};
