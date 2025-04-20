import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Retrieve the token from the query string
  const navigate = useNavigate();

  const handleVerification = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/verify-email',
        { verificationCode }
      );
  
      // Redirect to the login page with a message
      navigate('/login', { state: { message: response.data.msg } });
    } catch (error) {
      console.error('Verification failed:', error);
      if (error.response && error.response.data && error.response.data.msg) {
        setError(error.response.data.msg);
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };
  
  return (
    <div className="flex items-start justify-center h-screen bg-gray-900 pt-16">
      <div className="bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-md text-white">
        <h2 className="text-2xl font-bold text-center mb-6">Verify Your Email</h2>
  
        {/* Verification Input */}
        <div className="space-y-4">
          <p className="text-gray-300 text-center">
            Please enter the verification code sent to your email.
          </p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 sm:text-sm"
            placeholder="Enter verification code"
          />
          <button
            onClick={handleVerification}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Verify and Login
          </button>
  
          {/* Display Messages */}
          {message && <p className="mt-4 text-center text-green-400">{message}</p>}
          {error && <p className="mt-4 text-center text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
  
};

export default VerifyEmail;
