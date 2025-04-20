import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProgress = () => {
  const [tasks, setTasks] = useState([]);
  const [xp, setXp] = useState({ current: 0, nextLevel: 100 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          setError('User is not authenticated.');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/profile/progress', {
          headers: { 'x-auth-token': user.token },
        });

        // Set the tasks directly since backend now limits to 5
        setTasks(response.data.tasks);
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('Failed to load progress.');
      }
    };

    fetchProgress();
  }, []);

  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-6 text-white">
      <h3 className="text-lg font-semibold mb-4 text-center text-white">User Progress</h3>
  
      {/* Tasks Progress */}
      <div>
        <p className="text-gray-300 font-medium">Challenges</p>
        <ul className="mt-2">
          {tasks.map(task => (
            <li key={task.id} className="mb-4">
              <p className="text-sm text-gray-400">{task.name}</p>
              <div className="w-full bg-gray-700 rounded-full h-3 mt-1">
                <div
                  className={`h-3 rounded-full ${task.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(task.progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {task.progress}% completed {task.completed ? '✅' : ''}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
  
};

export default UserProgress;
