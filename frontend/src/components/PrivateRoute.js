import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ Component }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.token) {
      setIsAuthenticated(true);
    } 
    setLoading(false); // Once check is done, set loading to false
  }, []); // Empty dependency array ensures it runs only once on mount

  // While loading, don't return anything (you can show a spinner if necessary)
  if (loading) {
    return <div>Loading...</div>; 
  }

  // If authenticated, render the Dashboard component
  return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
