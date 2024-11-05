import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import btcService from '../services/btcService';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import  getBtcHistoricalPrices from '../services/btcService';
import '../App.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BtcChart = () => {
  const [btcData, setBtcData] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prices = await btcService.getBtcHistoricalPrices(30); // Fetch data for the last 30 days
        const priceData = prices.map((item) => item[1]); // Extract the price
        const labelData = prices.map((item) => {
          const date = new Date(item[0]);
          return date.toLocaleDateString();  // Format timestamp to date
        });
        setBtcData(priceData);
        setLabels(labelData);
      } catch (error) {
        console.error('Error fetching BTC data:', error);
      }
    };

    fetchData();
  }, []);

  const data = {
    labels: labels,  // Dates
    datasets: [
      {
        label: 'BTC Price (USD)',
        data: btcData,  // Prices
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,  // Curve the line
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Bitcoin Price over the Last 30 Days',
      },
    },
  };

  return (
    <div className='btc-chart-wrapper'>
      <Line data={data} options={options} />
    </div>
  );
};

export default BtcChart;
