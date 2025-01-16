import React from 'react';

const UserProgress = ({ achievements = [], challenges = [], xp = { current: 0, nextLevel: 100 } }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">User Progress</h3>

      {/* XP Progress */}
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

      {/* Achievements */}
      <div className="mb-6">
        <p className="text-gray-700 font-medium">Achievements</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {achievements.map((achievement, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full shadow-sm"
            >
              {achievement}
            </span>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div>
        <p className="text-gray-700 font-medium">Challanges</p>
        <ul className="mt-2">
          {challenges.map((task, index) => (
            <li key={index} className="mb-4">
              <p className="text-sm text-gray-600">{task.name}</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${Math.min(task.progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {task.progress}% completed
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserProgress;
