import React, { useState } from 'react';
import TradingViewWidget from '../components/TradingViewWidget';
import TradeForm from '../components/TradeForm';
import Watchlist from '../components/Watchlist';

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [symbolsGroups, setSymbolsGroups] = useState([
    {
      name: 'Custom Watchlist',
      symbols: [],
    },
  ]);

  const handleAddSymbol = (symbol) => {
    setSymbolsGroups((prevGroups) => {
      const updatedGroups = [...prevGroups];
      const customGroup = updatedGroups.find((group) => group.name === 'Custom Watchlist');
      if (customGroup) {
        customGroup.symbols.push({ name: symbol, displayName: symbol });
      }
      return updatedGroups;
    });
  };
  return (
    <div className="container mx-auto my-10 px-4 bg-gray-900 min-h-screen">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TradingView Widget */}
        <div className="bg-gray-800 shadow-lg rounded-xl p-6 col-span-2 text-white">
          <TradingViewWidget selectedSymbol={selectedSymbol} />
        </div>
  
        {/* TradeForm & Watchlist */}
        <div className="bg-gray-800 shadow-lg rounded-xl p-6 text-white">
          <TradeForm selectedSymbol={selectedSymbol} />
          <div className="mt-4">
            <Watchlist
              selectedSymbol={selectedSymbol}
              onSelect={setSelectedSymbol}
              onAddSymbol={handleAddSymbol}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
