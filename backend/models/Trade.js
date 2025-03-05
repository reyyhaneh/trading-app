const pool = require('../config/db');
const UserPortfolio = require('./UserPortfolio');

class Trade {
  static async addTrade(trade) {
    try {
      const { userId, type, stockSymbol, amount, price, date } = trade;
  
      // Validate trade inputs
      if (!userId || !type || !stockSymbol || !amount || !price) {
        throw new Error('❌ Missing required fields for adding a trade.');
      }
      if (!['buy', 'sell'].includes(type.toLowerCase())) {
        throw new Error("❌ Trade type must be 'buy' or 'sell'.");
      }
  
      const tradeAmount = parseFloat(amount);
      const tradePrice = parseFloat(price);
      const totalValue = tradeAmount * tradePrice;
  
      console.log(`📌 Processing trade: ${type.toUpperCase()} ${tradeAmount} ${stockSymbol} @ ${tradePrice}`);
  
      // ✅ **Ensure portfolio is updated before inserting trade**
      await UserPortfolio.updatePortfolioOnTrade(userId, stockSymbol, type, tradeAmount, tradePrice);
  
      // ✅ **Insert the trade into the trades table**
      const insertQuery = `
        INSERT INTO trades (user_id, date, profit_loss, stock_symbol, type, amount, price)
        VALUES ($1, COALESCE($2, CURRENT_TIMESTAMP), $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const insertValues = [userId, date, 0, stockSymbol.toUpperCase(), type.toLowerCase(), tradeAmount, tradePrice];
      const tradeResult = await pool.query(insertQuery, insertValues);
  
      console.log(`✅ Trade recorded successfully: ${tradeResult.rows[0].id}`);
      return tradeResult.rows[0];
    } catch (error) {
      console.error('❌ Error adding trade:', error.message || error);
      throw error;
    }
  }
  

  static async getTradesByUserId(userId) {
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
  }
}

module.exports = Trade;
