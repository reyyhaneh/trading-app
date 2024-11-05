// Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfitLoss from '../components/ProfitLoss'
import ProfitLossChart from '../components/ProfitLossChart'


const Profile = () => {
  
  return (
    <div className='container-fluid text-center'>
      <div className='row '>
        <div className='col border'>
        <p>User: ${JSON.parse(localStorage.getItem('user')).email}</p>

        </div>
        <div className='col border'>
        <ProfitLoss />
        </div>
      </div>
    </div>

  );
};

export default Profile;
