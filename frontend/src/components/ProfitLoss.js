import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfitLoss = () => {
  const [profitLoss, setProfitLoss] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfitLoss = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
          setError("User is not authenticated.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/profile/pl", {
          headers: { "x-auth-token": user.token },
        });

        if (response.data?.profitLossResults?.length > 0) {
          setProfitLoss(response.data.profitLossResults);
        } else {
          setError("No profit/loss data found.");
        }
      } catch (err) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfitLoss();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md">
      {/* Title with Tooltip */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Profit & Loss</h3>
        <div className="relative group">
          <span className="w-4 h-4 flex items-center justify-center bg-gray-300 text-xs text-gray-800 rounded-full cursor-pointer">
            i
          </span>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs p-2 rounded-md shadow-lg text-center">
            Profit/Loss = Current Value - Average Cost
          </div>
        </div>
      </div>

      {/* Minimal View of Profit & Loss Data */}
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
