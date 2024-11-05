import React, { useEffect, useState } from 'react';
import priceService from '../services/priceService';

const BitcoinPrice = () => {
  const [price, setPrice] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const bitcoinPrice = await priceService.getBitcoinPrice();
        setPrice(bitcoinPrice);
      } catch (error) {
        setError('Failed to fetch bitcoin price');
      }
    };

    fetchPrice();
  }, []);

  return (
    <div>
      {error ? <p>{error}</p> : <p>Current USD Price: ${price}</p>}
    </div>
  );
};

export default BitcoinPrice;
