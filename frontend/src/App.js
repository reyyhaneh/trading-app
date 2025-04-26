import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css"
import Login from './pages/Login'
import Register from './pages/Register'
import PrivateRoute from './components/PrivateRoute';
import Dashboard from  './pages/Dashboard'
import BitcoinPrice from './components/BitcoinPrice';
import Navbar from './components/Navbar'
import Profile from './pages/Profile'
import EmailVerification from './pages/EmailVerification'
import Welcome from './pages/Welcome'
import Leaderboard from './pages/Leaderboard'; 
import AutoTrading from './pages/AutoTrading'



function App() {
  return (
    <Router>
      <div className='App'>
        <Navbar />
        <Routes>
          <Route path="/" element={<Welcome />} /> {/* ⬅️ Add this route for homepage */}
          <Route exact="true" path="/login" element={<Login />} /> 
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute Component={Dashboard} />} />
          <Route path="/profile" element={<PrivateRoute Component={Profile}/>} />
          <Route path="/verify-email" element= {<EmailVerification />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/auto-trading" element={<AutoTrading />} />

        </Routes>
      </div>
    </Router>


  );
}

export default App;