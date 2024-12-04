import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSelectSymbol, suggestionsList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // If suggestionsList is provided, use it to filter results
  useEffect(() => {
    if (suggestionsList) {
      filterSuggestions(suggestionsList);
    } else if (searchTerm.trim() === '') {
      setSuggestions([]);
    } else {
      fetchSuggestions(searchTerm);
    }
  }, [searchTerm, suggestionsList]);

  const fetchSuggestions = async (searchTerm) => {
    try {
      const response = await fetch('https://scanner.tradingview.com/crypto-coins-screener/scan');
      console.log(response)
      const responseData = await response.json();

      const items = responseData.data || [];
      const filteredSuggestions = items
        .filter((item) => item.s.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((item) => ({ name: item.s }));

      setSuggestions(filteredSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const filterSuggestions = (list) => {
    const filtered = list.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
    setSuggestions(filtered);
  };

  const handleSelect = (symbol) => {
    onSelectSymbol(symbol); // Notify the parent component
    setSearchTerm(''); // Clear the input field
    setSuggestions([]); // Clear suggestions
  };


  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search Symbol"
        className="w-full p-2 rounded-md border border-gray-300"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-md w-full max-h-40 overflow-y-auto">
          {suggestions.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item.name)}
              className="cursor-pointer p-2 hover:bg-gray-200"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
