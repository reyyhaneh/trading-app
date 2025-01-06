import React, { useState, useEffect } from 'react';
import tradeService from '../services/TradeService';
import axios from 'axios';

const TradeForm = () => {
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [btcPrice, setBtcPrice] = useState('');

  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: 'bitcoin',
            vs_currencies: 'usd',
          },
        });
        setBtcPrice(response.data.bitcoin.usd);
      } catch (error) {
        console.error('Error fetching BTC price:', error);
      }
    };

    fetchBtcPrice();
  }, []);

  async function buy() {
    const trade = {
      stockSymbol: "BTC",
      amount: amount,
      price: price,
    };
  
    try {
      await tradeService.buyStock(trade);
      alert('Trade executed successfully');
    } catch (error) {
      console.error('Trade failed', error);
    }
  }
  
  async function sell() {
    const trade = {
      stockSymbol: "BTC",
      amount: amount,
      price: price,
    };
  
    try {
      await tradeService.sellStock(trade);
      alert('Trade executed successfully');
    } catch (error) {
      console.error('Trade failed', error);
    }
  }
  
  const handleAmountChange = (e) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    if (btcPrice) {
      const newPrice = (newAmount * btcPrice).toFixed(2); // Keep it to 2 decimal places
      setPrice(newPrice);
    }
  };

  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    setPrice(newPrice);
    if (btcPrice) {
      const newAmount = (newPrice / btcPrice).toFixed(6);
      setAmount(newAmount);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form className="space-y-4">
        {/* Price Input */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={price}
            onChange={handlePriceChange}
            className="mt-1 block w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-lg"
            min="0.01"
            step="0.01"
          />
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={handleAmountChange}
            className="mt-1 block w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-lg"
            min="0.01"
            step="0.01"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={buy}
            className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Buy
          </button>
          <button
            type="button"
            onClick={sell}
            className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sell
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeForm;
