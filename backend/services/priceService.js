const axios = require('axios');

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';
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
  console.log("symbol:" , symbol)
  try {
    // Convert symbol to Coingecko's expected format (lowercase)
    const coingeckoId = coingeckoSymbolMapping[symbol.toUpperCase()];
    
    console.log("coingecko Id: ", coingeckoId)

    const response = await axios.get(`${COINGECKO_API_BASE_URL}/simple/price`, {
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
    // Map symbols to Coingecko IDs
    const coingeckoIds = symbols
      .map(sym => COINGECKO_IDS[sym.toUpperCase()])
      .filter(id => id !== undefined) // Remove unmapped symbols
      .join(',');

    if (!coingeckoIds) {
      throw new Error("No valid symbols mapped to Coingecko IDs.");
    }

    console.log("Fetching prices for:", coingeckoIds);

    // Fetch prices from Coingecko
    const response = await axios.get(`${COINGECKO_API_BASE_URL}/simple/price`, {
      params: {
        ids: coingeckoIds,
        vs_currencies: 'usd',
      },
    });

    console.log("Coingecko response:", response.data);

    // Map back to original symbols
    const prices = {};
    symbols.forEach(symbol => {
      const coingeckoId = COINGECKO_IDS[symbol.toUpperCase()];
      if (coingeckoId && response.data[coingeckoId]) {
        prices[symbol] = response.data[coingeckoId].usd;
      }
    });

    console.log("Mapped prices:", prices);
    return prices;
  } catch (error) {
    console.error('Error fetching multiple prices from Coingecko:', error.message);
    throw new Error('Failed to fetch multiple prices from Coingecko');
  }
};

module.exports = {
  getCurrentPrice,
  getCurrentPrices,
};
