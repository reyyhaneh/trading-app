import React, { useState } from 'react';
import SearchBar from './SearchBar';

const Watchlist = ({ selectedSymbol, onSelect }) => {
  const [symbols, setSymbols] = useState([]); // Symbols added to the watchlist
  const predefinedSymbols = ['BTCUSD', 'ETHUSD']; // Predefined symbols

  const handleAddSymbol = (symbol) => {
    if (!symbols.includes(symbol)) {
      setSymbols((prevSymbols) => [...prevSymbols, symbol]); // Add symbol to watchlist
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Watchlist</h2>
  
      {/* Custom SearchBar */}
      <div className="mb-4">
        <SearchBar 
          onSelectSymbol={handleAddSymbol} 
          list={predefinedSymbols.filter((sym) => !symbols.includes(sym))} // Exclude already added symbols
        />
      </div>
  
      {/* Watchlist */}
      <div className="border border-gray-600 rounded-md p-2 max-h-64 overflow-y-auto bg-gray-700">
        {symbols.length > 0 ? (
          <ul>
            {symbols.map((symbol) => (
              <li
                key={symbol}
                onClick={() => onSelect(symbol)}
                className={`cursor-pointer p-2 rounded-md ${
                  symbol === selectedSymbol
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-600'
                }`}
              >
                {symbol}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center">No symbols added.</p>
        )}
      </div>
    </div>
  );
  
};

export default Watchlist;
