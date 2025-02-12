import React, { useState } from 'react';
import TradingViewWidget from '../components/TradingViewWidget';
import TradeForm from '../components/TradeForm';
import Watchlist from '../components/Watchlist';

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('CME:BTC1!');
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
    <div className="container mx-auto my-10 px-4">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TradingView Widget */}
        <div className="bg-white shadow-md rounded-lg p-6 col-span-2">
          <TradingViewWidget selectedSymbol={selectedSymbol} />
        </div>

        {/* TradeForm & Watchlist */}
        <div className="bg-white shadow-md rounded-lg p-6">
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
