const UserAssets = require('../models/UserAssets');

exports.getUserAssets = async (req, res) => {
  try {
    const userId = req.user.id;
    const assets = await UserAssets.getAssetsByUserId(userId);
    res.status(200).json({ assets });
  } catch (err) {
    console.error('Error fetching user assets:', err);
    res.status(500).json({ error: 'Failed to fetch user assets' });
  }
};
