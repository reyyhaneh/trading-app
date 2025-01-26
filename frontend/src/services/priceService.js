// frontend/src/services/priceService.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/price'; // Adjust base URL as needed

/**
 * Fetch current price for a single symbol
 * @param {string} symbol - The trading pair symbol, e.g., 'BTCUSDT'
 * @param {string} token - User's auth token
 * @returns {Promise<number>} - Current price
 */
const getCurrentPrice = async (symbol, token) => {
  try {
    console.log(1)
    console.log("symbol: ", symbol)
    const response = await axios.get(`${API_URL}/current/${symbol}`, {
      headers: { 'x-auth-token': token },
    });
    console.log(response.data.price)
    return response.data.price;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.response?.data?.error || error.message);
    throw error;
  }
};

/**
 * Fetch current prices for multiple symbols
 * @param {Array<string>} symbols - Array of trading pair symbols, e.g., ['BTCUSDT', 'ETHUSDT']
 * @param {string} token - User's auth token
 * @returns {Promise<Object>} - Object mapping symbols to their current prices
 */
const getCurrentPrices = async (symbols, token) => {
  try {
    const symbolsParam = symbols.join(',');
    const response = await axios.get(`${API_URL}/current`, {
      headers: { 'x-auth-token': token },
      params: { symbols: symbolsParam },
    });
    return response.data.prices;
  } catch (error) {
    console.error('Error fetching multiple prices:', error.response?.data?.error || error.message);
    throw error;
  }
};

const priceService = {
  getCurrentPrice,
  getCurrentPrices,
};

export default priceService;
