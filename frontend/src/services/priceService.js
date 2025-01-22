import axios from 'axios';
const API_URL = 'http://localhost:5000/api/price/usd';


const getBitcoinPrice = async () => {
  try {
    console.log(1)
    const response = await axios.get(`${API_URL}`);
    console.log(2)
    return response.data.price;
  } catch (error) {
    console.log(3)
    console.error('Error fetching bitcoin price:', error);
    throw error;
  }
};

const priceService = {
  getBitcoinPrice,
};

export default priceService;
