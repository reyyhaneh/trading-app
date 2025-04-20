import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/leaderboard');
        setUsers(res.data.users);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">🏆 Leaderboard</h2>

      <div className="overflow-x-auto">
        <table className="table-auto w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="py-2 px-4">Rank</th>
              <th className="py-2 px-4">Username</th>
              <th className="py-2 px-4">Score (XP)</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const isCurrent = currentUser?.id === user.id;
              return (
                <tr
                  key={user.id}
                  className={`border-b border-gray-800 ${
                    isCurrent ? 'bg-blue-900' : 'hover:bg-gray-800'
                  }`}
                >
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4 font-semibold">{user.username}</td>
                  <td className="py-2 px-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {user.score}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
