import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to handle side menu toggle

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-gray-50 shadow-md border-b border-gray-200">
        <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-6">
          {/* Left Section: Logo */}
          <Link to="/" className="text-xl font-bold text-blue-600">
            TradingApp
          </Link>

          {/* Hamburger Button */}
          <button
            className="block md:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsMenuOpen(true)} // Open the side menu
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <li>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/trade" className="text-gray-700 hover:text-blue-600 transition">
                    Trade
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition">
                    Profile
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 transition">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-700 hover:text-blue-600 transition">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Logout Button for Desktop */}
          {user && (
            <button
              onClick={handleLogout}
              className="hidden md:block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Side Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-700 focus:outline-none"
          onClick={() => setIsMenuOpen(false)} // Close the side menu
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Side Menu Links */}
        <ul className="mt-16 space-y-4 px-6">
          {user ? (
            <>
              <li>
                <Link
                  to="/dashboard"
                  className="block text-gray-700 hover:text-blue-600 transition"
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/trade"
                  className="block text-gray-700 hover:text-blue-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Trade
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="block text-gray-700 hover:text-blue-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-700 hover:text-red-500 transition"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-blue-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="block text-gray-700 hover:text-blue-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Overlay for Side Menu */}
      {isMenuOpen && (
        <div
          className="fixed top-0 right-0 h-full w-64 shadow-lg transform"
          onClick={() => setIsMenuOpen(false)} // Close menu on overlay click
        ></div>
      )}
    </>
  );
};

export default Navbar;
