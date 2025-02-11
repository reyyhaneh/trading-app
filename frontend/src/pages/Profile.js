import React, { useEffect, useState } from 'react';
import ProfitLoss from '../components/ProfitLoss';
import ProfitLossChart from '../components/ProfitLossChart';
import UserProgress from '../components/UserProgress';
import UserAssets from '../components/UserAssets'; // Import UserAssets component
import axios from 'axios';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState({ current: 120, nextLevel: 500 });
  const [achievements, setAchievements] = useState([
    'First Trade',
    '100 XP Milestone',
    'Beginner Trader',
  ]);
  const [challenges, setChallenges] = useState([
    { name: 'Complete 5 Trades', progress: 60 },
    { name: 'Earn 200 XP', progress: 40 },
    { name: 'Refer a Friend', progress: 10 },
  ]);

  useEffect(() => {
    const fetchScore = async () => {
      if (!user || !user.token) return;

      try {
        const response = await axios.get('http://localhost:5000/api/profile/score', {
          headers: { 'x-auth-token': user.token },
        });

        setScore(response.data.score || 0);
      } catch (error) {
        console.error('Error fetching user score:', error);
      }
    };

    fetchScore();
  }, [user]);

  return (
    <div className="container mx-auto my-10 px-4">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">User Profile</h3>
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
            {user?.email.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-600 mt-4">
            <span className="font-medium">Email:</span> {user?.email || 'N/A'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Joined On:</span> {user?.joined || 'Unknown'}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-700 font-medium text-lg">Your Score</p>
          <span className="text-3xl font-bold text-white bg-blue-500 px-6 py-3 rounded-full shadow-md mt-2">
            {score}
          </span>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 ">
          <ProfitLoss />
        </div>
      </div>

      {/* Middle Section: User Progress and Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <UserProgress achievements={achievements} challenges={challenges} xp={xp} />
        <UserAssets />
      </div>

    </div>
  );
};

export default Profile;
