const pool = require('../config/db');

const executeInTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction
    const result = await callback(client); // Execute transaction operations
    await client.query('COMMIT'); // Commit on success
    return result;
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on failure
    throw error;
  } finally {
    client.release();
  }
};

module.exports = executeInTransaction;
