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
import 'bootstrap/dist/css/bootstrap.min.css';
import EmailVerification from './pages/EmailVerification'
import TradingViewWidget from './pages/TradingViewWidget';


function App() {
  return (
    <Router>
      <div className='App.css'>
        <Navbar />

      
        <Routes>
          <Route exact="true" path="/login" element={<Login />} /> 
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute Component={Dashboard} />} />
          <Route path="/profile" element={<PrivateRoute Component={Profile}/>} />
          <Route path="/verify-email" element= {<EmailVerification />} />
          <Route path="/trading-view" element= {<TradingViewWidget />} />

        </Routes>
      </div>
    </Router>


  );
}

export default App;