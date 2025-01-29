import React, { useState, useEffect } from 'react';
import tradeService from '../services/TradeService';
import axios from 'axios';

const TradeForm = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [symbolsList, setSymbolsList] = useState(['BTCUSDT', 'ETHUSDT', 'DOGEUSDT']);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      setLoadingPrice(true);
      setPriceError(null);
      try {
        const symbolMapping = {
          BTCUSDT: 'bitcoin',
          ETHUSDT: 'ethereum',
          DOGEUSDT: 'dogecoin',
        };

        const coinId = symbolMapping[symbol];
        if (!coinId) throw new Error('Invalid symbol selected.');

        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: coinId,
            vs_currencies: 'usd',
          },
        });

        const fetchedPrice = response.data[coinId].usd;
        setCurrentPrice(fetchedPrice);
        setPrice((amount * fetchedPrice).toFixed(2));
      } catch (error) {
        console.error('Error fetching price:', error);
        setPriceError('Failed to fetch the current price. Please try again.');
        setCurrentPrice('');
        setPrice('');
      } finally {
        setLoadingPrice(false);
      }
    };

    if (symbol) fetchPrice();
  }, [symbol, amount]);

  const handleSymbolChange = (e) => {
    setSymbol(e.target.value);
    setAmount('');
    setPrice('');
  };

  const handleAmountChange = (e) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    if (currentPrice) {
      const newPrice = (newAmount * currentPrice).toFixed(2);
      setPrice(newPrice);
    }
  };

  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    setPrice(newPrice);
    if (currentPrice) {
      const newAmount = (newPrice / currentPrice).toFixed(6);
      setAmount(newAmount);
    }
  };

  const buy = async () => {
    if (!amount || !price) {
      alert('Please enter valid amount and price.');
      return;
    }

    try {
      await tradeService.buyStock({
        stockSymbol: symbol,
        amount: parseFloat(amount),
        price: parseFloat(price),
      });
      alert('Trade executed successfully');
    } catch (error) {
      console.error('Trade failed', error);
      alert('Trade failed. Please try again.');
    }
  };

  const sell = async () => {
    if (!amount || !price) {
      alert('Please enter valid amount and price.');
      return;
    }

    try {
      await tradeService.sellStock({
        stockSymbol: symbol,
        amount: parseFloat(amount),
        price: parseFloat(price),
      });
      alert('Trade executed successfully');
    } catch (error) {
      console.error('Trade failed', error);
      alert('Trade failed. Please try again.');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-800">Trade Form</h1>
      <form className="space-y-4">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
            Select Symbol
          </label>
          <select
            id="symbol"
            value={symbol}
            onChange={handleSymbolChange}
            className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            {symbolsList.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Price (USD)
          </label>
          {loadingPrice ? (
            <p className="mt-2 text-gray-500">Loading price...</p>
          ) : priceError ? (
            <p className="mt-2 text-red-500">{priceError}</p>
          ) : (
            <p className="mt-2 bg-gray-100 p-2 rounded-md text-lg font-semibold text-gray-800">
              ${currentPrice.toLocaleString()}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={handleAmountChange}
            disabled={!currentPrice}
            className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Total Price (USD)
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={handlePriceChange}
            disabled={!currentPrice}
            className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter total price"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={buy}
            className={`w-full p-3 text-white font-medium rounded-md ${
              amount && price
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-green-300 cursor-not-allowed'
            }`}
            disabled={!amount || !price}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={sell}
            className={`w-full p-3 text-white font-medium rounded-md ${
              amount && price
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-red-300 cursor-not-allowed'
            }`}
            disabled={!amount || !price}
          >
            Sell
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeForm;
