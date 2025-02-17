import React, { useState, useEffect } from "react";
import axios from "axios";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const RETRY_DELAY = 5000; // 5 seconds retry on failure

const UserAssets = () => {
  const [assets, setAssets] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(localStorage.getItem("assetsTimestamp") || 0);

  const fetchAssets = async (retry = false) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      const now = Date.now();
      if (!retry && now - lastUpdated < CACHE_DURATION) {
        console.log("⏳ Using cached asset data.");
        setLoading(false);
        return;
      }

      const { token } = user;

      // Fetch user balance
      const balanceResponse = await axios.get("http://localhost:5000/api/profile/balance", {
        headers: { "x-auth-token": token },
      });
      setBalance(balanceResponse.data.balance);

      // Fetch user assets
      const assetsResponse = await axios.get("http://localhost:5000/api/profile/assets", {
        headers: { "x-auth-token": token },
      });

      const fetchedAssets = assetsResponse.data.assets || [];

      setAssets(fetchedAssets);
      setLastUpdated(now);
      localStorage.setItem("assetsTimestamp", now);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn("⚠️ Rate limit hit, retrying in 5s...");
        setTimeout(() => fetchAssets(true), RETRY_DELAY);
      } else {
        setError("Failed to fetch assets.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    const interval = setInterval(fetchAssets, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center">Loading assets...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Your Assets</h3>

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
                <th className="border-b-2 py-2 px-4 text-gray-700">Amount Owned</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4 text-gray-800">{asset.asset_symbol}</td>
                  <td className="py-2 px-4 text-gray-800">{asset.amount}</td>
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
