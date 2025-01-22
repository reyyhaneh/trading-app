const axios = require('axios');

const getBitcoinPrice = async () => {
  try {
    const response = await axios.get('https://openexchangerates.org/api/latest.json?app_id=0789c7f2f9df43bcb371ad15027e0242');
    const usdPrice = response.data.rates.BTC; 
    return usdPrice;
  } catch (error) {
    console.error('Error fetching bitcoin price:', error);
    throw new Error('Failed to fetch bitcoin price');
  }
};

const timeframe = '1h'
const getBtcHistoricalPrices = async (days = 30) => {
  var date = "2010-10-10";
  try {
    // This request works fine.
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days
        }
      }
    );
    


    return response.data.prices;  // Array of [timestamp, price]
  } catch (error) {
    console.error('Error fetching Bitcoin historical prices:', error);
    throw new Error('Failed to fetch Bitcoin historical prices');
  }
};



module.exports = {
  getBtcHistoricalPrices,
  getBitcoinPrice,
};
