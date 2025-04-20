import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-6">Welcome</h1>
        <p className="text-gray-300 mb-6">
          Trade virtual stocks, cryptocurrencies, and more.  
          Build your skills with real-time prices, portfolio tracking, and educational tools — without any financial risk.
        </p>

        <div className="flex flex-col gap-4">
          <Link 
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-300"
          >
            Get Started
          </Link>

          <Link 
            to="/login"
            className="text-blue-400 hover:underline font-medium"
          >
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Welcome;