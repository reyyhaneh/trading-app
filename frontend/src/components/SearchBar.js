import React, { useState } from 'react';

const SearchBar = ({ onSelectSymbol, list }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Filter suggestions based on user input
    if (value.trim() === '') {
      setSuggestions([]);
    } else {
      const filtered = list.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    }
  };

  const handleSelect = (symbol) => {
    onSelectSymbol(symbol); // Notify parent component
    setSearchTerm(''); // Clear the input field
    setSuggestions([]); // Clear suggestions
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSelect(suggestions[0]); // Add the first suggestion on Enter
    }
  };
  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search Symbol"
        className="w-full p-2 rounded-md border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-gray-800 border border-gray-600 rounded-md shadow-lg w-full max-h-40 overflow-y-auto">
          {suggestions.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className="cursor-pointer p-2 hover:bg-gray-700 text-white"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );  
};

export default SearchBar;
