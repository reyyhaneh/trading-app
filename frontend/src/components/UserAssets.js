import React, { useState, useEffect } from 'react';
import axios from 'axios';
import priceService from '../services/priceService';


const UserAssets = () => {
  // Default test data (optional fallback)
  const defaultAssets = [
    { name: 'Bitcoin', asset_symbol: 'BTCUSDT', currentPrice: 0, amount: 1.5 },
    { name: 'Ethereum', asset_symbol: 'ETHUSDT', currentPrice: 0, amount: 10 },
    { name: 'Dogecoin', asset_symbol: 'DOGEUSDT', currentPrice: 0, amount: 5000 },
  ];

  const [assets, setAssets] = useState(defaultAssets); // Initial state
  const [balance, setBalance] = useState(null); // User balance
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchAssetsAndPrices = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          setError('User not authenticated.');
          setLoading(false);
          return;
        }
  
        const { token } = user;
  
        // Fetch user's balance first
        const balanceResponse = await axios.get('http://localhost:5000/api/profile/balance', {
          headers: { 'x-auth-token': token },
        });
        setBalance(balanceResponse.data.balance);
  
        // Fetch user's assets
        const assetsResponse = await axios.get('http://localhost:5000/api/profile/assets', {
          headers: { 'x-auth-token': token },
        });

  
        const fetchedAssets = assetsResponse.data.assets || [];

  
        // Extract unique asset symbols (uppercase)
        const symbols = [...new Set(fetchedAssets.map(asset => asset.asset_symbol.toUpperCase()))];
  
  
        if (symbols.length === 0) {
          setAssets(defaultAssets);
          setLoading(false);
          return;
        }
  
        // Fetch current prices for all symbols from backend
        const prices = await priceService.getCurrentPrices(symbols, token);
  
  
        // Update assets with current prices
        const updatedAssets = fetchedAssets.map(asset => ({
          ...asset,
          currentPrice: prices[asset.asset_symbol.toUpperCase()] || 0,
        }));
  
        setAssets(updatedAssets.length ? updatedAssets : defaultAssets);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user assets or prices:', error.response?.data?.error || error.message);
        setError('Failed to fetch assets or prices.');
        setLoading(false);
      }
    };
  
    fetchAssetsAndPrices();
  }, []);

  // Optional: Periodically update asset prices (e.g., every 5 minutes)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          console.error('User not authenticated.');
          return;
        }

        const { token } = user;

        // Extract unique asset symbols
        const symbols = [...new Set(assets.map(asset => asset.asset_symbol.toUpperCase()))];

        if (symbols.length === 0) return;

        // Fetch current prices for all symbols from backend
        const prices = await priceService.getCurrentPrices(symbols, token);

        // Update assets with new prices
        const updatedAssets = assets.map(asset => ({
          ...asset,
          currentPrice: prices[asset.asset_symbol.toUpperCase()] || asset.currentPrice,
        }));

        setAssets(updatedAssets);
      } catch (error) {
        console.error('Error updating asset prices:', error.response?.data?.error || error.message);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval); // Cleanup on unmount
  }, [assets]); // Depend on assets to get the latest symbols

  if (loading) {
    return <div className="text-center">Loading assets...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Your Assets</h3>

      {/* Display the balance if it's been fetched */}
      {balance !== null && (
        <div className="mb-4 text-center text-xl font-bold text-green-600">
          Current Balance: ${Number(balance).toFixed(2)}
        </div>
      )}

      {assets.length === 0 ? (
        <p className="text-gray-600 text-center">You don't own any assets yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 py-2 px-4 text-gray-700">Asset</th>
                <th className="border-b-2 py-2 px-4 text-gray-700">Current Price</th>
                <th className="border-b-2 py-2 px-4 text-gray-700">Amount Owned</th>
                <th className="border-b-2 py-2 px-4 text-gray-700">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => {
                // Safely handle undefined currentPrice
                const price = asset.currentPrice !== undefined ? Number(asset.currentPrice) : 0;
                return (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4 text-gray-800">{asset.name}</td>
                    <td className="py-2 px-4 text-gray-800">
                      ${price.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 text-gray-800">{asset.amount}</td>
                    <td className="py-2 px-4 text-gray-800">
                      ${(price * asset.amount).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserAssets;
