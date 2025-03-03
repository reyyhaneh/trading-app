import React, { useState, useEffect, useCallback } from 'react';
import tradeService from '../services/TradeService';
import priceService from '../services/priceService';
import { debounce } from 'lodash';

const TradeForm = () => {
  const [symbol, setSymbol] = useState('BTC'); // Default symbol
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [totalCost, setTotalCost] = useState(''); // New state for total cost
  const [currentPrice, setCurrentPrice] = useState('');
  const [symbolsList, setSymbolsList] = useState(['BTC', 'ETH', 'DOGE']); // Available symbols
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState(null);

  /** Fetches price from backend */
  const fetchPrice = useCallback(
    debounce(async (symbol) => {
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
        const fetchedPrice = await priceService.getCurrentPrice(symbol, token);

        setCurrentPrice(parseFloat(fetchedPrice).toFixed(8)); // Ensure 8 decimal places
        setPrice(parseFloat(fetchedPrice).toFixed(8)); // Ensure unit price is float(8)
      } catch (error) {
        setPriceError('Failed to fetch the current price. Please try again.');
        setCurrentPrice('');
        setPrice('');
      } finally {
        setLoadingPrice(false);
      }
    }, 800), // Debounce time = 800ms
  );

  /** Runs once on symbol change */
  useEffect(() => {
    if (symbol) {
      fetchPrice(symbol);
    }
  }, [symbol]); // Fetches price only when symbol changes

  /** Runs every 1 minute to refresh the price */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPrice(symbol);
    }, 60000); // Fetch price every 60 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [symbol]);

  useEffect(() => {
    if (amount && price) {
      setTotalCost((parseFloat(amount) * parseFloat(price)).toFixed(8)); // Float(8) precision
    }
  }, [amount, price]); // Recalculate total cost when amount or price changes


  // Handles symbol change
  const handleSymbolChange = (e) => {
    const newSymbol = e.target.value;
    setSymbol(newSymbol);
    setAmount('');
    setPrice('');
    setTotalCost('');
  };

  // Handles amount change and updates total cost
  const handleAmountChange = (e) => {
    const newAmount = e.target.value;
    setAmount(newAmount);

    if (currentPrice) {
      const newTotalCost = (newAmount * currentPrice).toFixed(2);
      setTotalCost(newTotalCost); // Calculate total cost separately
    }
};


  // Handles manual price change (for flexibility)
  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value).toFixed(8);
    setPrice(newPrice);

    if (currentPrice) {
      const newTotalCost = parseFloat(amount * newPrice).toFixed(2);
      setTotalCost(newTotalCost); // Recalculate total cost
    }
  };

  // Handles buying
  const buy = async () => {
    if (!amount || !price) {
      alert('Please enter a valid amount and price.');
      return;
    }

    const trade = {
      stockSymbol: symbol,
      amount: parseFloat(amount).toFixed(8), // Ensure float(8)
      price: parseFloat(price).toFixed(8), // Ensure float(8)
      type: 'buy',
    };

    try {
      await tradeService.buyStock(trade);
      alert('Trade executed successfully');
    } catch (error) {
      alert('Trade failed. Please try again.');
    }
  };

  // Handles selling
  const sell = async () => {
    if (!amount || !price) {
      alert('Please enter a valid amount and price.');
      return;
    }

    const trade = {
      stockSymbol: symbol,
      amount: parseFloat(amount).toFixed(8), // Ensure float(8)
      price: parseFloat(price).toFixed(8), // Ensure float(8)
      type: 'sell', 
    };

    try {
      await tradeService.sellStock(trade);
      alert('Trade executed successfully');
    } catch (error) {
      alert('Trade failed. Please try again.');
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

        {/* Price Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Unit Price (USD)
          </label>
          <p className="mt-1 block w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-lg">
            ${price}
          </p>
        </div>

        {/* Total Cost Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Cost (USD)
          </label>
          <p className="mt-1 block w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-lg">
            ${totalCost}
          </p>
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
