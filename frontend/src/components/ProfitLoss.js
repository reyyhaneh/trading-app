import React, { useState, useEffect } from "react";
import axios from "axios";

const RETRY_DELAY = 3000; // Start with 3 seconds delay
const MAX_RETRY = 5; // Maximum retry attempts

const ProfitLoss = () => {
  const [profitLoss, setProfitLoss] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfitLoss = async (retryCount = 0) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        setError("User is not authenticated.");
        setLoading(false);
        return;
      }

      console.log("📢 Fetching profit/loss data...");

      const response = await axios.get("http://localhost:5000/api/profile/pl", {
        headers: { "x-auth-token": user.token },
      });

      if (response.data?.profitLossResults?.length > 0) {
        console.log("✅ Profit/Loss Data Received:", response.data.profitLossResults);
        setProfitLoss(response.data.profitLossResults);
      } else {
        setError("No trades found.");
        setProfitLoss([]);
      }
    } catch (err) {
      console.error("❌ Error fetching profit/loss:", err);

      // Retry mechanism for 429 error
      if (err.response?.status === 429 && retryCount < MAX_RETRY) {
        const retryAfter = Math.min(RETRY_DELAY * Math.pow(2, retryCount), 60000); // Exponential backoff up to 60s
        console.warn(`⚠️ Rate limit hit, retrying in ${retryAfter / 1000}s...`);
        setTimeout(() => fetchProfitLoss(retryCount + 1), retryAfter);
      } else {
        setError("An error occurred while fetching data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLoss();
    const interval = setInterval(fetchProfitLoss, 60000); // Update prices every 1 minute
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
              <div
                className={`font-medium ${
                  parseFloat(asset.profitLoss) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
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
