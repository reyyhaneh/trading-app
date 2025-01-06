import axios from 'axios';

const API_URL = 'http://localhost:5000/api/trades/';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { 
      'Content-Type': 'application/json',
      'x-auth-token': user.token,
     };
  } else {
    return {};
  }
};


// Using async/await ensures that the request waits for the response before moving on.
const buyStock = async (trade) => {
  console.log("1")
  const response = await axios.post(`${API_URL}buy`, trade, { headers: getAuthHeader() })
  console.log("2")
  return response.data;
}

const sellStock = async (trade) => {
  const response = await axios.post(`${API_URL}sell`, trade, { headers: getAuthHeader() });
  return response.data;
};

const tradeService = {
  buyStock,
  sellStock,
};

export default tradeService;
