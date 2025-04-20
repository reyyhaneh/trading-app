import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const location = useLocation(); // Get the passed state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
      if (error.response && error.response.data && error.response.data.msg) {
        setError(error.response.data.msg);
      } else {
        setError('Invalid credentials');
      }
    }
  };

  const message = location.state?.message; // Access the passed message
  return (
    <div className="flex items-start justify-center h-screen bg-gray-900 pt-16">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        {message && <p className="text-green-400 text-center mb-4">{message}</p>}
        
        <h2 className="text-3xl font-extrabold text-white text-center mb-8">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Login
            </button>
          </div>
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
};


export default Login;
