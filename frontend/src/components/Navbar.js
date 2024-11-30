import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-50 shadow-md py-4 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold text-blue-600">
            TradingApp
          </Link>
          <ul className="flex items-center space-x-4">
            {user ? (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/trade"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Trade
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Profile
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Right Section */}
        {user && (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
