const axios = require('axios');

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3/simple/price';
const coingeckoSymbolMapping = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  DOGE: 'dogecoin',
  ADA: 'cardano',
  XRP: 'ripple',
  LTC: 'litecoin',
  BNB: 'binancecoin',
  DOT: 'polkadot',
  SOL: 'solana',
  MATIC: 'matic-network',
  BTCUSDT: 'bitcoin',
  ETHUSDT: 'ethereum',
  DOGEUSDT: 'dogecoin',


};
const COINGECKO_IDS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  DOGE: "dogecoin",
  ADA: "cardano",
  // Add more mappings as needed
};
const getCurrentPrice = async (symbol) => {
  try {
    // Convert symbol to Coingecko's expected format (lowercase)
    const coingeckoId = coingeckoSymbolMapping[symbol.toUpperCase()];
    

    const response = await axios.get(COINGECKO_API_BASE_URL, {
      params: {
        ids: coingeckoId,
        vs_currencies: 'usd',
      },
    });

    if (!response.data[coingeckoId]) {
      throw new Error(`Price not found for symbol: ${symbol}`);
    }

    return response.data[coingeckoId].usd;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.message);
    throw new Error(`Failed to fetch price for ${symbol}`);
  }
};


  const getCurrentPrices = async (symbols) => {
    try {
      const symbolsQuery = symbols.map((sym) => sym.toLowerCase()).join(",");

      const response = await axios.get(COINGECKO_API_BASE_URL, {
        params: {
          ids: symbolsQuery, // Pass multiple symbols
          vs_currencies: "usd",
        },
      });

      const prices = {};
      symbols.forEach((symbol) => {
        const lowerSymbol = symbol.toLowerCase();
        if (response.data[lowerSymbol]) {
          prices[symbol] = response.data[lowerSymbol].usd;
        }
      });

      console.log("📉 Batch Prices Fetched:", prices);
      return prices;
    } catch (error) {
      console.error("❌ Error fetching batch prices from Coingecko:", error.message);
      throw new Error("Failed to fetch batch prices from Coingecko");
    }
  }



module.exports = {
  getCurrentPrice,
  getCurrentPrices,
};
