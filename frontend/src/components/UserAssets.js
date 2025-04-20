import React, { useState, useEffect } from "react";
import axios from "axios";

const UserAssets = () => {
  const [assets, setAssets] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user assets and balance
  const fetchAssetsAndBalance = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      const { token } = user;

      // Fetch balance
      const balanceResponse = await axios.get("http://localhost:5000/api/profile/balance", {
        headers: { "x-auth-token": token },
      });
      setBalance(balanceResponse.data.balance);

      // Fetch assets
      const assetsResponse = await axios.get("http://localhost:5000/api/profile/assets", {
        headers: { "x-auth-token": token },
      });

      setAssets(assetsResponse.data.assets || []);
    } catch (error) {
      setError("Failed to fetch assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetsAndBalance();
  }, []);

  if (loading) return <div className="text-center">Loading assets...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-6 text-white">
      <h3 className="text-lg font-semibold mb-4 text-center text-white">Your Assets</h3>
  
      {/* Show balance */}
      {balance !== null && (
        <div className="mb-4 text-center text-xl font-bold text-green-400">
          Balance: ${Number(balance).toFixed(2)}
        </div>
      )}
  
      {/* Show assets */}
      {assets.length === 0 ? (
        <p className="text-gray-400 text-center">You don't own any assets yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 py-2 px-4 text-gray-300">Asset</th>
                <th className="border-b-2 py-2 px-4 text-gray-300">Amount Owned</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr key={index} className="border-b border-gray-600">
                  <td className="py-2 px-4 text-gray-100">{asset.asset_symbol}</td>
                  <td className="py-2 px-4 text-gray-100">{asset.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  
};

export default UserAssets;
