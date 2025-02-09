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
    const coingeckoIds = symbols.map(sym => sym.toLowerCase()).join(','); // Convert to lowercase

    const response = await axios.get(`${COINGECKO_API_BASE_URL}/simple/price`, {
      params: {
        ids: coingeckoIds,
        vs_currencies: 'usd',
      },
    });

    const prices = {};
    symbols.forEach(symbol => {
      const coingeckoId = symbol.toLowerCase();
      if (response.data[coingeckoId]) {
        prices[symbol] = response.data[coingeckoId].usd;
      }
    });

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
