const axios = require('axios');
const symbolMapping = require('../config/symbolMapping'); // Import the symbol mapping

const BINANCE_API_BASE_URL = 'https://api.binance.com/api/v3';

// per-symbol cache
let cachedPrices = {}; // { BINANCE_SYMBOL: { price: number, lastFetched: timestamp } }
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetch current price for a given symbol from Binance.
 * @param {string} symbol - The internal trading pair symbol, e.g., 'BTC'
 * @returns {Promise<number>} - The current price in USD
 */
const getCurrentPrice = async (symbol) => {
  const binanceSymbol = symbolMapping[symbol.toUpperCase()];
  
  if (!binanceSymbol) {
    throw new Error(`Binance symbol not found for internal symbol: ${symbol}`);
  }

  const now = Date.now();

  // Check if price is cached and still valid
  if (
    cachedPrices[binanceSymbol] &&
    (now - cachedPrices[binanceSymbol].lastFetched) < CACHE_DURATION
  ) {
    return cachedPrices[binanceSymbol].price;
  }

  try {
    const response = await axios.get(`${BINANCE_API_BASE_URL}/ticker/price`, {
      params: { symbol: binanceSymbol },
    });

    const { price } = response.data;

    if (!price) {
      throw new Error(`Price not found for symbol: ${binanceSymbol}`);
    }

    const numericPrice = parseFloat(price);

    if (isNaN(numericPrice)) {
      throw new Error(`Invalid price format received for symbol: ${binanceSymbol}`);
    }

    // Update cache for the specific symbol
    cachedPrices[binanceSymbol] = {
      price: numericPrice,
      lastFetched: now,
    };

    return numericPrice;
  } catch (error) {
    console.error(`Error fetching price for ${binanceSymbol}:`, error.message || error);
    throw new Error(`Failed to fetch price for ${symbol}`);
  }
};

/**
 * Fetch current prices for multiple symbols from Binance.
 * @param {Array<string>} symbols - Array of internal trading pair symbols, e.g., ['BTC', 'ETH']
 * @returns {Promise<Object>} - An object mapping internal symbols to their current prices
 */
const getCurrentPrices = async (symbols) => {
  // Map internal symbols to Binance symbols
  const binanceSymbols = symbols.map(sym => symbolMapping[sym.toUpperCase()]).filter(sym => sym);
  
  if (binanceSymbols.length === 0) {
    throw new Error('No valid symbols provided for price fetching.');
  }

  const now = Date.now();
  
  // Determine which symbols need to be fetched
  const symbolsToFetch = binanceSymbols.filter(symbol => {
    return !(
      cachedPrices[symbol] &&
      (now - cachedPrices[symbol].lastFetched) < CACHE_DURATION
    );
  });

  let fetchedPrices = {};

  if (symbolsToFetch.length > 0) {
    try {
      const response = await axios.get(`${BINANCE_API_BASE_URL}/ticker/price`, {
        params: { symbols: JSON.stringify(symbolsToFetch) }, // Binance expects symbols as a JSON array string
      });

      const fetchedData = response.data; // Array of { symbol, price }

      fetchedData.forEach(item => {
        const { symbol, price } = item;
        const numericPrice = parseFloat(price);
        if (!isNaN(numericPrice)) {
          // Find internal symbol from Binance symbol
          const internalSymbol = Object.keys(symbolMapping).find(
            key => symbolMapping[key] === symbol
          );
          if (internalSymbol) {
            fetchedPrices[internalSymbol] = numericPrice;
            // Update cache for the specific symbol
            cachedPrices[symbol] = {
              price: numericPrice,
              lastFetched: now,
            };
          }
        }
      });
    } catch (error) {
      console.error('Error fetching multiple prices from Binance:', error.message || error);
      throw new Error('Failed to fetch multiple prices from Binance');
    }
  }

  // For symbols that were not fetched (already cached), retrieve from cache
  symbols.forEach(sym => {
    const binanceSym = symbolMapping[sym.toUpperCase()];
    if (cachedPrices[binanceSym] && fetchedPrices[sym.toUpperCase()] === undefined) {
      fetchedPrices[sym.toUpperCase()] = cachedPrices[binanceSym].price;
    }
  });

  return fetchedPrices;
};

module.exports = {
  getCurrentPrice,
  getCurrentPrices,
};
