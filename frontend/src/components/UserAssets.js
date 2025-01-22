import React, { useState, useEffect } from 'react';
import axios from 'axios';
import priceService from '../services/priceService';  // Import your price service

const UserAssets = () => {
  // Default test data
  const defaultAssets = [
    { name: 'Bitcoin', currentPrice: 0, amount: 1.5 },
    { name: 'Ethereum', currentPrice: 1586.32, amount: 10 },
    { name: 'Dogecoin', currentPrice: 0.084, amount: 5000 },
  ];

  const [assets, setAssets] = useState(defaultAssets); // Use default data initially
  const [balance, setBalance] = useState(null); // State to hold user's balance

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) return;

        // Fetch user's assets
        const assetsResponse = await axios.get('http://localhost:5000/api/profile/assets', {
          headers: { 'x-auth-token': user.token },
        });
        setAssets(assetsResponse.data.assets || defaultAssets);

        // Fetch user's balance
        const balanceResponse = await axios.get('http://localhost:5000/api/profile/balance', {
          headers: { 'x-auth-token': user.token },
        });
        setBalance(balanceResponse.data.balance);
      } catch (error) {
        console.error('Error fetching user assets:', error);
      }
    };

    fetchAssets();
  }, []);

  useEffect(() => {
    const updateBitcoinPrice = async () => {
      // Only proceed if there are assets loaded
      if (!assets || assets.length === 0) return;
      try {
        const btcPrice = await priceService.getBitcoinPrice();
        setAssets(prevAssets =>
          prevAssets.map(asset =>
            asset.name === 'Bitcoin'
              ? { ...asset, currentPrice: btcPrice }
              : asset
          )
        );
      } catch (error) {
        console.error('Error updating Bitcoin price:', error);
      }
    };

    updateBitcoinPrice();
  }, [assets]);

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
