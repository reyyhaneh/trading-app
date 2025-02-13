import React, { useState, useEffect } from 'react';
import tradeService from '../services/TradeService';
import priceService from '../services/priceService';  // Import backend price service

const TradeForm = () => {
  const [symbol, setSymbol] = useState('BTC'); // Default symbol
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [symbolsList, setSymbolsList] = useState(['BTC', 'ETH', 'DOGE']); // Available symbols
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState(null);

  // Fetch the current price from backend
  useEffect(() => {
    const fetchPrice = async () => {
      setLoadingPrice(true);
      setPriceError(null);
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          setPriceError('User not authenticated.');
          setLoadingPrice(false);
          return;
        }
        const { token } = user;
        const price = await priceService.getCurrentPrice(symbol, token);
        setCurrentPrice(price);
        setPrice((amount * price).toFixed(2)); // Update price based on amount
      } catch (error) {
        console.error('Error fetching price:', error);
        setPriceError('Failed to fetch the current price. Please try again.');
        setCurrentPrice('');
        setPrice('');
      } finally {
        setLoadingPrice(false);
      }
    };

    if (symbol) {
      fetchPrice();
    }
  }, [symbol, amount]); // Trigger the effect when symbol or amount changes

  // Handle buying
  const buy = async () => {
    if (!amount || !price) {
      alert('Please enter a valid amount and price.');
      return;
    }

    const trade = {
      stockSymbol: symbol,
      amount: parseFloat(amount),
      price: parseFloat(price),
    };

    try {
      await tradeService.buyStock(trade);
      alert('Trade executed successfully');
    } catch (error) {
      console.error('Trade failed', error);
      alert('Trade failed. Please try again.');
    }
  };

  // Handle selling
  const sell = async () => {
    if (!amount || !price) {
      alert('Please enter a valid amount and price.');
      return;
    }

    const trade = {
      stockSymbol: symbol,
      amount: parseFloat(amount),
      price: parseFloat(price),
    };

    try {
      await tradeService.sellStock(trade);
      alert('Trade executed successfully');
    } catch (error) {
      console.error('Trade failed', error);
      alert('Trade failed. Please try again.');
    }
  };

  // Handle symbol change
  const handleSymbolChange = (e) => {
    setSymbol(e.target.value);
    setAmount('');
    setPrice('');
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    if (currentPrice) {
      const newPrice = (newAmount * currentPrice).toFixed(2);
      setPrice(newPrice);
    }
  };

  // Handle price change
  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    setPrice(newPrice);
    if (currentPrice) {
      const newAmount = (newPrice / currentPrice).toFixed(6);
      setAmount(newAmount);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form className="space-y-4">
        {/* Symbol Selection */}
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
            Select Symbol
          </label>
          <select
            id="symbol"
            name="symbol"
            value={symbol}
            onChange={handleSymbolChange}
            className="mt-1 block w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-lg"
          >
            {symbolsList.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
        </div>

        {/* Price Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Price (USD)
          </label>
          {loadingPrice ? (
            <p className="text-gray-500">Loading price...</p>
          ) : priceError ? (
            <p className="text-red-500">{priceError}</p>
          ) : (
            <p className="mt-1 block w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-lg">
              ${currentPrice.toLocaleString()}
            </p>
          )}
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
