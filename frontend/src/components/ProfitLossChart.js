import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Line} from 'react-chartjs-2';


const ProfitLossChart = () => {
    const [chartData, setChartData] = useState({});
    const [hasTrades, setHasTrades] = useState(true); // Track if the user has trades
    const [error, setError] = useState(null);


    useEffect (() => {
        const fetchProfitLossData = async () => {
          try{
            const user = JSON.parse(localStorage.getItem('user'));
          
            const response = await axios.get('http://localhost:5000/api/profile/pl-chart', {
                headers: {
                  'x-auth-token':user.token,
                }
              });
            
            const data = response.data;
            console.log(data.JSON);
            
            if (data.length === 0) {
              // If no trades exist, update state
              setHasTrades(false);
              return;
            }

            const dates = data.map(item => item.data);
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
            }catch(error){
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
}
export default ProfitLossChart;