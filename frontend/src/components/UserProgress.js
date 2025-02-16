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

        const uniqueTasks = response.data.tasks.reduce((acc, task) => {
          if (!acc.find(t => t.task_name === task.task_name)) acc.push(task);
          return acc;
        }, []);

        setTasks(uniqueTasks);
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('Failed to load progress.');
      }
    };

    fetchProgress();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">User Progress</h3>

      {/* XP Progress Bar */}
      <div className="mb-6">
        <p className="text-gray-700 font-medium">XP Progress</p>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${Math.min((xp.current / xp.nextLevel) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {xp.current} XP / {xp.nextLevel} XP
        </p>
      </div>

      {/* Tasks Progress */}
      <div>
        <p className="text-gray-700 font-medium">Challenges</p>
        <ul className="mt-2">
          {tasks.map((task, index) => (
            <li key={index} className="mb-4">
              <p className="text-sm text-gray-600">{task.task_name}</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
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
