import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState(''); // State for storing error messages
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login({ email, password });
      if (response.data){

        setMessage(response.data.message)

      }
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed', error);

      // Check if the error has a response object from the server
      if (error.response && error.response.data && error.response.data.msg) {
        // Display the error message from the server
        setError(error.response.data.msg);
      } else {
        // If there's no specific server message, display a generic error message
        setError('An error occurred during login. Please try again.');
      }      
    }
  };

  return (
    <div className='form-wrapper'>
      <h2>Login</h2>
        <form onSubmit={handleSubmit} className='trade-form'>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
          </div>
          <button type="submit" className='btn btn-primary'>Login</button>
        </form>
      {message && <p style={{ color: 'red' }}>{message}</p>} 
      {error && <p style={{ color: 'red' }}>{error}</p>} 

    </div>
  );
};

export default Login;
