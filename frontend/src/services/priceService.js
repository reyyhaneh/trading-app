import axios from 'axios';
const API_URL = 'http://localhost:5000/api/price/usd';


const getBitcoinPrice = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    return response.data.price;
  } catch (error) {
    console.error('Error fetching bitcoin price:', error);
    throw error;
  }
};

const priceService = {
  getBitcoinPrice,
};

export default priceService;
