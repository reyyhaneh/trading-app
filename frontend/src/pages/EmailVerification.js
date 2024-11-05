import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';



const VerifyEmail = () => {
  //const { token } = useParams();
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); 
  const [error, setError] = useState('');
  const navigate = useNavigate();



  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
        setMessage(response.data.message + ", now please login.");

      } catch (error) {
        console.error('Error:', error);
        if (error.response && error.response.data && error.response.data.msg) {
            // Display the error message from the server
            setError(error.response.data.msg);
          } else {
            // If there's no specific server message, display a generic error message
            setError('An error occurred. Please try again.');
          }    
      }
    };
    verifyEmail();
  }, [token]);


  return (
    <div>
      <h2>Email Verification</h2>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VerifyEmail;
