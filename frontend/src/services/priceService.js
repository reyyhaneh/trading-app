import axios from 'axios';

const API_URL = 'http://localhost:5000/api/price';


const getCurrentPrice = async (symbol, token) => {
  try {
    const response = await axios.get(`${API_URL}/current/${symbol}`, {
      headers: { 'x-auth-token': token },
    });
    return response.data.price;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.response?.data?.error || error.message);
    throw error;
  }
};

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
