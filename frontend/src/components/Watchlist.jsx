import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';

const Watchlist = ({ selectedSymbol, onSelect, onAddSymbol }) => {
  const [newSymbol, setNewSymbol] = useState('');
  const [symbols, setSymbols] = useState([]); // Local state to manage added symbols
  const [recommendations, setRecommendations] = useState([]); // Recommended symbols

  // Fetch recommendations based on input
  const fetchRecommendations = async (query) => {
    if (!query) {
      setRecommendations([]);
      return;
    }

    try {
      const response = await axios.get('https://symbol-search-endpoint.com', {
        params: { query }, // Replace with a valid endpoint
      });
      setRecommendations(response.data); // Update recommendations
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Add a symbol directly
  const handleAddSymbol = () => {
    const symbol = newSymbol.trim();

    if (!symbol) {
      alert('Please enter a valid symbol.');
      return;
    }

    // Add to the watchlist if not already present
    if (!symbols.includes(symbol)) {
      setSymbols((prevSymbols) => [...prevSymbols, symbol]);
      onAddSymbol(symbol); // Notify the parent component
    } else {
      alert('Symbol already in the watchlist.');
    }

    setNewSymbol(''); // Clear input
    setRecommendations([]); // Clear recommendations
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewSymbol(value);
    fetchRecommendations(value); // Fetch suggestions if applicable
  };

  // Add symbol with Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSymbol();
    }
  };

  return (
    <div className="bg-white text-black p-4 rounded-lg shadow-md">
  <h2 className="text-lg font-bold mb-4">Watchlist</h2>

  {/* Add Symbol Input */}
  <div className="relative w-full mb-4">
    <SearchBar /> {/* Ensures full width */}
    {recommendations.length > 0 && (
      <ul className="absolute z-10 bg-white border border-gray-300 mt-1 w-full max-h-40 overflow-y-auto shadow-md rounded-md">
        {recommendations.map((rec) => (
          <li
            key={rec.symbol}
            onClick={() => {
              setNewSymbol(rec.symbol);
              setRecommendations([]);
            }}
            className="cursor-pointer p-2 hover:bg-gray-200"
          >
            {rec.symbol} - {rec.description}
          </li>
        ))}
      </ul>
    )}
    <button
      onClick={handleAddSymbol}
      className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"
    >
      Add Symbol
    </button>
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

  )
};

export default Watchlist;
