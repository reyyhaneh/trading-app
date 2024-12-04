import React, { useState } from 'react';
import SearchBar from './SearchBar';

const Watchlist = ({ selectedSymbol, onSelect, onAddSymbol }) => {
  const [symbols, setSymbols] = useState(['AAPL', 'GOOG', 'MSFT']); // Sample symbols in watchlist

  const handleAddSymbol = (symbol) => {
    if (!symbols.includes(symbol)) {
      setSymbols((prevSymbols) => [...prevSymbols, symbol]); // Add to local list
      onAddSymbol && onAddSymbol(symbol); // Notify parent if needed
    }
  };

  return (
    <div className="bg-white text-black p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Watchlist</h2>

      {/* Custom SearchBar */}
      <div className="mb-4">
        <SearchBar 
          onSelectSymbol={handleAddSymbol} 
          list={symbols} // Passing the test symbol list to SearchBar
        />
      </div>

      {/* Watchlist */}
      <div className="border border-gray-300 rounded-md p-2 max-h-64 overflow-y-auto">
        {symbols.length > 0 ? (
          <ul>
            {symbols.map((symbol) => (
              <li
                key={symbol}
                onClick={() => onSelect(symbol)}
                className={`cursor-pointer p-2 rounded-md ${
                  symbol === selectedSymbol
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                {symbol}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No symbols added.</p>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
