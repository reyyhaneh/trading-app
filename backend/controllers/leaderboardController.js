const pool = require('../config/db'); // or wherever your pool is defined

// GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const query = `SELECT id, username, score FROM users ORDER BY score DESC LIMIT 50`;
    const { rows } = await pool.query(query);
    res.json({ users: rows });
  } catch (err) {
    console.error('❌ Error fetching leaderboard:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
