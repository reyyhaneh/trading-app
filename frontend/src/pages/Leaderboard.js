import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/leaderboard');
        setUsers(response.data.users);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-center mb-8">🏆 Leaderboard</h1>
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-600">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2">{user.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
