const pool = require('../config/db');

const User = {
  /**
   * Finds a user by email.
   * @param {string} email - The email of the user to find.
   * @returns {Object|null} - The user object if found, otherwise null.
   */
  async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);

      if (result.rows.length === 0) {
        console.warn(`No user found with email: ${email}`);
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error.message || error);
      throw error;
    }
  },

  async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        console.warn(`No user found with ID: ${id}`);
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error.message || error);
      throw error;
    }
  },

  /**
   * Creates a new user in the database.
   * @param {Object} user - The user details.
   * @param {string} user.username - The username of the user.
   * @param {string} user.email - The email of the user.
   * @param {string} user.password - The hashed password of the user.
   * @param {string} user.verificationToken - The email verification token.
   * @returns {Object} - The newly created user.
   */
  async create(user) {
    try {
      const { username, email, password, verificationToken } = user;
      const initialBalance = 10000; // or from config

      const query = `
      INSERT INTO users (username, email, password, verification_token, is_email_verified, balance)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
      const values = [username, email, password, verificationToken, false, initialBalance];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error.message || error);
      throw error;
    }
  },

  /**
   * Verifies a user's email by updating the is_email_verified field.
   * @param {string} email - The email of the user to verify.
   * @returns {Object|null} - The updated user object if successful, otherwise null.
   */
  async verifyEmail(email) {
    try {
      const query = `
        UPDATE users
        SET is_email_verified = true
        WHERE email = $1
        RETURNING *;
      `;

      const result = await pool.query(query, [email]);

      if (result.rows.length === 0) {
        console.warn(`No user found to verify with email: ${email}`);
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error verifying email:', error.message || error);
      throw error;
    }
  },

    // Fetch user's score by ID
  async getScore(userId) {
    try {
      const result = await pool.query('SELECT score FROM users WHERE id = $1', [userId]);

      if (result.rows.length === 0) {
        console.warn(`No user found with ID: ${userId}`);
        return null;
      }

      return result.rows[0].score; // Return the score
    } catch (error) {
      console.error('Error fetching user score:', error);
      throw error;
    }
  },

  async updateScore(userId, scoreChange, reason) {
    try {
      // Update the user's total score in the users table
      await pool.query(
        `UPDATE users SET score = score + $1 WHERE id = $2`,
        [scoreChange, userId]
      );

    } catch (error) {
      console.error('Error updating user score:', error);
      throw error;
    }
  },


  async getBalance(userId) {
    try {
      const query = 'SELECT balance FROM users WHERE id = $1';
      const result = await pool.query(query, [userId]);

      if (result.rows.length === 0) {
        console.warn(`No user found with ID: ${userId}`);
        return null;
      }

      return result.rows[0].balance;
    } catch (error) {
      console.error('Error fetching user balance:', error.message || error);
      throw error;
    }
  },
  async updateBalance(userId, newBalance) {
    try {
      const query = `
        UPDATE users
        SET balance = $2
        WHERE id = $1
        RETURNING *;
      `;
      const result = await pool.query(query, [userId, newBalance]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  },


};




module.exports = User;
