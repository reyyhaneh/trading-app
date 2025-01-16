import React, { useState, useEffect } from 'react';

const UserAssets = () => {
  // Default test data
  const defaultAssets = [
    { name: 'Bitcoin', currentPrice: 21653.24, amount: 1.5 },
    { name: 'Ethereum', currentPrice: 1586.32, amount: 10 },
    { name: 'Dogecoin', currentPrice: 0.084, amount: 5000 },
  ];

  const [assets, setAssets] = useState(defaultAssets); // Use default data initially

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) return;

        // Uncomment the lines below to fetch real data from the backend
        /*
        const response = await axios.get('http://localhost:5000/api/profile/assets', {
          headers: { 'x-auth-token': user.token },
        });
        setAssets(response.data.assets || []);
        */
      } catch (error) {
        console.error('Error fetching user assets:', error);
      }
    };

    fetchAssets();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Your Assets</h3>

      {assets.length === 0 ? (
        <p className="text-gray-600 text-center">You don't own any assets yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 py-2 px-4 text-gray-700">Asset</th>
                <th className="border-b-2 py-2 px-4 text-gray-700">Current Price</th>
                <th className="border-b-2 py-2 px-4 text-gray-700">Amount Owned</th>
                <th className="border-b-2 py-2 px-4 text-gray-700">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4 text-gray-800">{asset.name}</td>
                  <td className="py-2 px-4 text-gray-800">${asset.currentPrice.toFixed(2)}</td>
                  <td className="py-2 px-4 text-gray-800">{asset.amount}</td>
                  <td className="py-2 px-4 text-gray-800">
                    ${(asset.currentPrice * asset.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserAssets;
