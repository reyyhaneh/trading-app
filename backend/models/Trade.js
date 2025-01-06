const pool = require('../config/db');

const Trade = {
  /**
   * Adds a new trade to the database.
   * @param {Object} trade - The trade details.
   * @param {number} trade.userId - The ID of the user making the trade.
   * @param {string} trade.type - The type of trade ('buy' or 'sell').
   * @param {string} trade.stockSymbol - The stock symbol.
   * @param {number} trade.amount - The amount of stock traded.
   * @param {number} trade.price - The price of the stock.
   * @param {string} [trade.date] - The date of the trade (optional).
   * @returns {Object} - The added trade.
   */
  async addTrade(trade) {
    try {
      const { userId, type, stockSymbol, amount, price, date } = trade;

      // Validate inputs
      if (!userId || !type || !stockSymbol || !amount || !price) {
        throw new Error('Missing required fields for adding a trade.');
      }
      if (!['buy', 'sell'].includes(type.toLowerCase())) {
        throw new Error("Trade type must be 'buy' or 'sell'.");
      }

      // Calculate profit/loss
      const profitLoss = type.toLowerCase() === 'sell' ? amount * price : -amount * price;

      // Insert into the database
      const query = `
        INSERT INTO trades (user_id, date, profit_loss, stock_symbol, type, amount, price)
        VALUES ($1, COALESCE($2, CURRENT_TIMESTAMP), $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const values = [userId, date, profitLoss, stockSymbol.toUpperCase(), type.toLowerCase(), amount, price];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error adding trade:', error.message || error);
      throw error;
    }
  },

  /**
   * Fetches all trades for a specific user.
   * @param {number} userId - The ID of the user.
   * @returns {Array} - A list of trades for the user.
   */
  async getTradesByUserId(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required to fetch trades.');
      }

      const query = `
        SELECT * FROM trades
        WHERE user_id = $1
        ORDER BY date DESC;
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching trades:', error.message || error);
      throw error;
    }
  },
};

module.exports = Trade;
