import axios from 'axios';

/*
const getBtcHistoricalPrices = async (days = 30) => {
  try {
    const response = await axios.get(`/api/btc/history?days=${days}`);
    return response.data.prices;  // Ensure this is an array of [timestamp, price]
  } catch (error) {
    console.error('Error fetching Bitcoin historical prices:', error);
    throw error;
  }
};
*/


/*
 btcService is not really a component, it's just a collection of services you want to call. Since you have defined it as a component, 
 the component would have to be instantiated somewhere, which in most cases would mean you used it in another component's template.
 ?????????
*/
export default  {
    async getBtcHistoricalPrices(days){
        try {
            const response = await axios.get(`http://localhost:5000/api/btc/history?days=${days}`);
            return response.data.prices;  // Ensure this is an array of [timestamp, price]
          } catch (error) {
            console.error('Error fetching Bitcoin historical prices:', error);
            throw error;
          }

    }
}
