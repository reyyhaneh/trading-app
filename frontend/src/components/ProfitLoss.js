import React, { useState, useEffect } from "react";
import axios from "axios";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration
const RETRY_DELAY = 5000; // 5 seconds retry delay in case of 429 error

const ProfitLoss = () => {
  const [profitLoss, setProfitLoss] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(localStorage.getItem("profitLossTimestamp") || 0);

  const fetchProfitLoss = async (retry = false) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        setError("User is not authenticated.");
        setLoading(false);
        return;
      }

      const now = Date.now();
      if (!retry && now - lastUpdated < CACHE_DURATION) {
        const cachedData = JSON.parse(localStorage.getItem("profitLossData"));
        if (cachedData) {
          console.log("⏳ Using cached profit/loss data.");
          setProfitLoss(cachedData);
          setLoading(false);
          return;
        }
      }

      const response = await axios.get("http://localhost:5000/api/profile/pl", {
        headers: { "x-auth-token": user.token },
      });

      if (response.data?.profitLossResults?.length > 0) {
        setProfitLoss(response.data.profitLossResults);
        setLastUpdated(now);
        localStorage.setItem("profitLossTimestamp", now);
        localStorage.setItem("profitLossData", JSON.stringify(response.data.profitLossResults));
      } else {
        setError("No trades found.");
        setProfitLoss([]);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        console.warn("⚠️ Rate limit hit, retrying in 5s...");
        setTimeout(() => fetchProfitLoss(true), RETRY_DELAY);
      } else {
        setError("An error occurred while fetching data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLoss();
    const interval = setInterval(fetchProfitLoss, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Profit & Loss</h3>

      {profitLoss.length > 0 ? (
        <div className="space-y-3">
          {profitLoss.map((asset, index) => (
            <div key={index} className="flex justify-between items-center p-2 border rounded-md">
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">{asset.assetSymbol}</span>
                <span className="text-xs text-gray-500">${parseFloat(asset.currentPrice).toFixed(2)}</span>
              </div>
              <div className={`font-medium ${parseFloat(asset.profitLoss) >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${parseFloat(asset.profitLoss).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No trades found.</p>
      )}
    </div>
  );
};

export default ProfitLoss;
