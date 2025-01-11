import React, {useEffect, useState} from 'react';
import ProfitLoss from '../components/ProfitLoss';
import ProfitLossChart from '../components/ProfitLossChart';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [score, setScore] = useState(0);
  useEffect(() => {
    const fetchScore = async () => {
      if (!user || !user.token) return;

      try {
        const response = await axios.get('http://localhost:5000/api/profile/score', {
          headers: { 'x-auth-token': user.token },
        });

        setScore(response.data.score || 0);
        console.log('score: ', score)
      } catch (error) {
        console.error('Error fetching user score:', error);
      }
    };

    fetchScore();
  }, [user]);

  return (
    <div className="container mx-auto my-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">User Profile</h3>
          <p className="text-gray-600">
            <span className="font-medium">Email:</span> {user?.email || 'N/A'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Joined On:</span> {user?.joined || 'Unknown'}
          </p>
        </div>

        {/* Score Display */}
         <div className="mt-6">
            <p className="text-gray-600 font-medium">Your Score:</p>
            <span className="text-xl font-bold text-white bg-blue-500 px-4 py-2 rounded-full shadow-md">
              {score}
            </span>
          </div>
        

        {/* Profit & Loss Information */}
        <div className="col-span-2 bg-white shadow rounded-lg p-6">
          <ProfitLoss />
        </div>
      </div>

      {/* Profit/Loss Chart */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <ProfitLossChart />
      </div>
    </div>
  );
};

export default Profile;
