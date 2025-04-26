import React from 'react';

const AutoTradingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          🎯 Auto Trading Rules
        </h1>

        <div className="bg-gray-700 p-6 rounded-xl">
          <p className="text-gray-300 text-center">
            Here you can create, view, and manage automatic trading rules based on price or profit/loss conditions.
          </p>

          {/* Later: Form for adding new rules */}
          {/* Later: Table for listing user's rules */}
        </div>

      </div>
    </div>
  );
};

export default AutoTradingPage;
