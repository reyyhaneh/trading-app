import React, { useState } from 'react';
import tradeService from '../services/TradeService';

const AutoTradingRules = () => {
  const [symbol, setSymbol] = useState('BTC');
  const [conditionType, setConditionType] = useState('price');
  const [actionType, setActionType] = useState('buy');
  const [threshold, setThreshold] = useState('');
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');


  const availableSymbols = ['BTC', 'ETH', 'DOGE'];
  const conditionTypes = ['price', 'profit', 'loss'];
  const actionTypes = ['buy', 'sell'];


  const handleSave = async () => {
    if (!symbol || !threshold) {
      setError('All fields are required!');
      return;
    }
  
    setError('');
  
    try {
      const user = JSON.parse(localStorage.getItem('user')); // assuming userId is stored here
  
      const rule = {
        userId: user.id,
        stockSymbol: symbol,
        conditionType,
        targetValue: parseFloat(threshold),
        action: actionType,
        amount: parseFloat(amount),
      };

      console.log('auto trading rule: ', rule)
  
      const result = await tradeService.addAutoTradingRule(rule);
      console.log('✅ Auto-trading rule saved:', result);
      alert('Rule saved successfully!');
      setThreshold('');
    } catch (err) {
      console.error('❌ Error:', err.message);
      setError('Failed to save rule.');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Auto Trading Rules</h2>
      <div className="space-y-4">
        {/* Symbol Dropdown */}
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium mb-2">Stock Symbol</label>
          <select
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {availableSymbols.map((sym) => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </div>

        {/* Condition Type Dropdown */}
        <div>
          <label htmlFor="conditionType" className="block text-sm font-medium mb-2">Condition Type</label>
          <select
            id="conditionType"
            value={conditionType}
            onChange={(e) => setConditionType(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {conditionTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Action Type Dropdown */}
        <div>
          <label htmlFor="actionType" className="block text-sm font-medium mb-2">Action Type</label>
          <select
            id="actionType"
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {actionTypes.map((action) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        {/* Threshold Input */}
        <div>
          <label htmlFor="threshold" className="block text-sm font-medium mb-2">Threshold Value</label>
          <input
            type="number"
            id="threshold"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter threshold value"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-2">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter amount to buy or sell"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSave}
          className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Save Rule
        </button>
      </div>
    </div>
  );
};

export default AutoTradingRules;