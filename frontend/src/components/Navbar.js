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
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <ul className="navbar-nav mr-auto">
        {user ? (
          <>
            <li className="nav-item active">
              <Link className="nav-link" to="/dashboard" >Dashboard </Link>
            </li>
            <li>
              <Link className="nav-link" to="/trade">Trade</Link>
            </li>
            <li>
              <Link className="nav-link" to="/profile">Profile</Link>
            </li>
            <li>
              <button className="btn btn-outline-secondary my-2 my-sm-0" onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item active">
              <Link className="nav-link" to="/login">Login</Link>
            </li>
            <li className="nav-item active">
              <Link className="nav-link" to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
