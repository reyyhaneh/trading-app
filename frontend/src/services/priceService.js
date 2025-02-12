import axios from 'axios';

const API_URL = 'http://localhost:5000/api/price';

/**
 * Get the current price of a single asset from the backend.
 * @param {string} symbol - The asset symbol (e.g., 'BTC')
 * @returns {Promise<number>} - The current price in USD
 */
const getCurrentPrice = async (symbol, token) => {
  try {
    console.log("get current price 1 symbol:", symbol)
    const response = await axios.get(`${API_URL}/current/${symbol}`,{
      headers: {'x-auth-token': token},
    }
    );
    return response.data.price;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.response?.data?.error || error.message);
    throw error;
  }
};

/**
 * Get current prices for multiple assets from the backend.
 * @param {Array<string>} symbols - An array of asset symbols (e.g., ['BTC', 'ETH', 'DOGE'])
 * @returns {Promise<Object>} - A dictionary of prices { BTC: 42675.00, ETH: 3245.50, DOGE: 0.084 }
 */
const getCurrentPrices = async (symbols, token) => {
  try {
    const symbolsParam = symbols.join(',');
    const response = await axios.get(`${API_URL}/current`, {
      headers: {'x-auth-token': token},
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
