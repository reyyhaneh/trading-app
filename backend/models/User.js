const pool = require('../config/db');

const User = {
  async findByEmail(email) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0]; // Return the user object if found
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },

  async create(user) {
    try {
      const { username, email, password, verificationToken } = user;
      const result = await pool.query(
        `INSERT INTO users (username, email, password, verification_token, is_email_verified)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [username, email, password, verificationToken, false]
      );
      return result.rows[0]; // Return the newly created user
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async verifyEmail(email) {
    try {
      const result = await pool.query(
        `UPDATE users
         SET is_email_verified = true
         WHERE email = $1
         RETURNING *`,
        [email]
      );
      return result.rows[0]; // Return the updated user
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  },
};

module.exports = User;
