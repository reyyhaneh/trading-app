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
const symbolToCoinGeckoId = {
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
    // Convert symbols to CoinGecko's expected IDs
    const coinGeckoIds = symbols
      .map((sym) => symbolToCoinGeckoId[sym.toUpperCase()])
      .filter((id) => id !== undefined); // Remove undefined mappings

    if (coinGeckoIds.length === 0) {
      throw new Error("No valid CoinGecko IDs found for requested symbols.");
    }

    console.log("📡 Requesting prices for:", coinGeckoIds);

    // Fetch prices from CoinGecko
    const response = await axios.get(COINGECKO_API_BASE_URL, {
      params: {
        ids: coinGeckoIds.join(","), // Pass mapped CoinGecko IDs
        vs_currencies: "usd",
      },
    });

    console.log("📥 Raw API Response:", JSON.stringify(response.data, null, 2));

    // Build price response ensuring all symbols are included
    const prices = {};
    symbols.forEach((symbol) => {
      const coinGeckoId = symbolToCoinGeckoId[symbol.toUpperCase()];
      prices[symbol] = response.data[coinGeckoId]?.usd ?? null; // Return null if missing
    });

    console.log("✅ Final Price Mapping:", JSON.stringify(prices, null, 2));

    return prices;
  } catch (error) {
    console.error("❌ Error fetching batch prices from Coingecko:", error.message);
    return {}; 
  }
};



module.exports = {
  getCurrentPrice,
  getCurrentPrices,
};
