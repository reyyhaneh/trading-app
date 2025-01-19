import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ProfitLossChart = () => {
  const [chartData, setChartData] = useState(null);
  const [hasTrades, setHasTrades] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfitLossData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user || !user.token) {
          setError('User is not authenticated.');
          setHasTrades(false);
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/profile/pl-chart', {
          headers: {
            'x-auth-token': user.token,
          },
        });

        const data = response.data;

        if (!data || data.length === 0) {
          setHasTrades(false);
          setLoading(false);
          return;
        }

        const dates = data.map(item => new Date(item.date).toLocaleString()); // Format date as 'MM/DD/YYYY, HH:MM:SS'
        const profits = data.map(item => item.profitLoss);

        const chartData = {
          labels: dates,
          datasets: [
            {
              label: 'Profit/Loss Over Time',
              data: profits,
              fill: false,
              backgroundColor: 'rgb(75, 192, 192)',
              borderColor: 'rgba(75, 192, 192, 0.6)',
              tension: 0.4, // Smooth lines
            },
          ],
        };

        setChartData(chartData);
      } catch (err) {
        console.error('Error fetching profit/loss data:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfitLossData();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!hasTrades) return <p className="text-center text-gray-500">No trades available to display.</p>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">Profit/Loss Over Time</h3>

      {/* Scrollable container for the chart */}
      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{
            minWidth: '600px', // Minimum width for the chart
            height: '400px',
          }}
        >
          {chartData ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          ) : (
            <p className="text-center text-gray-500">No data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitLossChart;
