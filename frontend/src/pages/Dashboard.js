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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* TradingView Section */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <TradingViewWidget selectedSymbol={selectedSymbol} />
        </div>

        {/* TradeForm and Watchlist Section */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-4 h-full">
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
    </div>
  );
};

export default Dashboard;
