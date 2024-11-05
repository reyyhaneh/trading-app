import React, { useState } from 'react';
import tradeService from '../services/TradeService';

const Trade = () => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('buy');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (type === 'buy') {
        await tradeService.buyStock({ stockSymbol, quantity, price });
      } else {
        await tradeService.sellStock({ stockSymbol, quantity, price });
      }
      alert('Trade executed successfully');
    } catch (error) {
      console.error('Trade failed', error);
    }
  };

  return (
    <div>
      <h2>Trade Stocks</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Stock Symbol</label>
          <input
            type="text"
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value)}
          />
        </div>
        <div>
          <label>Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div>
          <label>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <button type="submit">Execute Trade</button>
      </form>
    </div>
  );
};

export default Trade;
