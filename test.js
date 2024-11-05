import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const ProfitLossChart = () => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const fetchProfitLossData = async () => {
      try {
        const response = await axios.get('/api/user/profit-loss'); // Replace with actual endpoint
        const data = response.data;
        

        const dates = data.map(item => item.date);
        const profits = data.map(item => item.profitLoss);

        setChartData({
          labels: dates,
          datasets: [
            {
              label: 'Profit/Loss Over Time',
              data: profits,
              fill: false,
              backgroundColor: 'rgb(75, 192, 192)',
              borderColor: 'rgba(75, 192, 192, 0.2)',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching profit/loss data:', error);
      }
    };

    fetchProfitLossData();
  }, []);

  return (
    <div>
      <h3>Profit/Loss Over Time</h3>
      <Line data={chartData} />
    </div>
  );
};

export default ProfitLossChart;
