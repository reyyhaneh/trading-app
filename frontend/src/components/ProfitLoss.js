import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfitLoss = () => {
  const [profitLoss, setProfitLoss] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfitLoss = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          setError('User is not authenticated.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/profile/pl', {
          headers: {
            'x-auth-token': user.token,
          },
        });

        if (response.data) {
          setProfitLoss(response.data);
        } else {
          setError('No profit/loss data found.');
        }
      } catch (err) {
        console.error('Error fetching profit/loss data:', err);
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfitLoss();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const hasTrades = profitLoss?.averageCost || profitLoss?.currentValue || profitLoss?.profitLoss;

  return (
    <div className="">
      <div className="flex items-center justify-center gap-2 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Profit & Loss
        </h3>
        <div className="z-10 relative group">
          <span className="z-10 w-5 h-5 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs cursor-pointer">
            i
          </span>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-800 text-white text-xs p-3 rounded-lg shadow-lg">
            <p>
              The Profit/Loss metric shows the difference between the current
              value of your portfolio and its average cost.
            </p>
            <p className="mt-1">
              <strong>Formula:</strong> Current Value - Average Cost
            </p>
          </div>
        </div>
      </div>
      {!hasTrades ? (
        <p className="text-center text-gray-500">No trades found.</p>
      ) : (
        <table className="table-auto w-full text-left border border-gray-200">
          <tbody>
            <tr className="border-t">
              <th className="px-4 py-2 font-medium text-gray-600">
                Average Cost
              </th>
              <td className="px-4 py-2 text-gray-800">${profitLoss.averageCost.toFixed(2)}</td>
            </tr>
            <tr className="border-t">
              <th className="px-4 py-2 font-medium text-gray-600">
                Current Value
              </th>
              <td className="px-4 py-2 text-gray-800">${profitLoss.currentValue.toFixed(2)}</td>
            </tr>
            <tr className="border-t">
              <th className="px-4 py-2 font-medium text-gray-600">
                Profit/Loss
              </th>
              <td
                className={`px-4 py-2 ${
                  profitLoss.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                ${profitLoss.profitLoss.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProfitLoss;
