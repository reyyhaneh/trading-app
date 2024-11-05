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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Check if there are no trades (profitLoss data is empty or zero values)
  
  const hasTrades = profitLoss.length

  console.log(hasTrades)
  return (
    <div>
      <h2>Profit & Loss</h2>
      {!hasTrades ? (
        <p>No trades found.</p>
      ) : (
        <div>
          <p>Average Cost: ${profitLoss.averageCost.toFixed(2)}</p>
          <p>Current Value: ${profitLoss.currentValue.toFixed(2)}</p>
          <p>Profit/Loss: ${profitLoss.profitLoss.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default ProfitLoss;
