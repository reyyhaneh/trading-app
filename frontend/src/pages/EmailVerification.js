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
      // Send verification request to the backend
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/verify-email',
        { token, verificationCode }
      );

      // Assuming the backend sends back a token upon successful verification
      const loginResponse = await authService.login({
        email: response.data.email, // Replace with the email from the response
        password: response.data.password, // Replace with the temporary password or actual password
      });

      if (loginResponse) {
        setMessage('Verification successful. Redirecting to your dashboard...');
        navigate('/dashboard'); // Redirect to the dashboard
      }
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
    <div className="flex items-start justify-center h-screen bg-gray-100 pt-16">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Verify Your Email</h2>

        {/* Verification Input */}
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Please enter the verification code sent to your email.
          </p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter verification code"
          />
          <button
            onClick={handleVerification}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Verify and Login
          </button>

          {/* Display Messages */}
          {message && <p className="mt-4 text-center text-green-600">{message}</p>}
          {error && <p className="mt-4 text-center text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
