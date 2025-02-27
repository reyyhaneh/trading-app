const pool = require('../config/db');

const Trade = {

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
  
      const tradeAmount = parseFloat(amount);
      const tradePrice = parseFloat(price);
      const totalValue = tradeAmount * tradePrice;
  
      // Get the current portfolio data for this asset
      const query = `
        SELECT * FROM user_portfolio
        WHERE user_id = $1 AND stock_symbol = $2;
      `;
      const values = [userId, stockSymbol.toUpperCase()];
      const result = await pool.query(query, values);
      const portfolio = result.rows[0] || {
        totalAmount: 0,
        totalSpent: 0,
        totalEarned: 0,
        profitLoss: 0,
        avgCostPerUnit: 0,
      };
  
      let profitLoss = 0;
      if (type.toLowerCase() === 'buy') {
        // Calculate new average cost per unit
        const newAmount = portfolio.totalAmount + tradeAmount;
        const newSpent = portfolio.totalSpent + totalValue;
  
        portfolio.avgCostPerUnit = newSpent / newAmount;
        portfolio.totalAmount = newAmount;
        portfolio.totalSpent = newSpent;
  
        profitLoss = 0; // No realized profit or loss on buy
      } else if (type.toLowerCase() === 'sell') {
        if (tradeAmount > portfolio.totalAmount) {
          throw new Error('Insufficient assets to sell.');
        }
  
        // Calculate profit/loss using the average cost per unit
        const avgCost = portfolio.avgCostPerUnit;
        const costBasis = tradeAmount * avgCost;
        profitLoss = totalValue - costBasis;
  
        // Update portfolio after sale
        portfolio.totalAmount -= tradeAmount;
        portfolio.totalEarned += totalValue;
        portfolio.profitLoss += profitLoss;
      }
  
      // Update user portfolio
      const updateQuery = `
        INSERT INTO user_portfolio (user_id, stock_symbol, total_amount, total_spent, total_earned, avg_cost_per_unit, profit_loss)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, stock_symbol)
        DO UPDATE SET 
          total_amount = EXCLUDED.total_amount,
          total_spent = EXCLUDED.total_spent,
          total_earned = EXCLUDED.total_earned,
          avg_cost_per_unit = EXCLUDED.avg_cost_per_unit,
          profit_loss = EXCLUDED.profit_loss,
          updated_at = NOW();
      `;
      const updateValues = [
        userId,
        stockSymbol.toUpperCase(),
        portfolio.totalAmount,
        portfolio.totalSpent,
        portfolio.totalEarned,
        portfolio.avgCostPerUnit,
        portfolio.profitLoss,
      ];
      await pool.query(updateQuery, updateValues);
  
      // Insert the trade
      const insertQuery = `
        INSERT INTO trades (user_id, date, profit_loss, stock_symbol, type, amount, price)
        VALUES ($1, COALESCE($2, CURRENT_TIMESTAMP), $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const insertValues = [userId, date, profitLoss, stockSymbol.toUpperCase(), type.toLowerCase(), amount, price];
      const tradeResult = await pool.query(insertQuery, insertValues);
  
      return tradeResult.rows[0];
    } catch (error) {
      console.error('Error adding trade:', error.message || error);
      throw error;
    }
  },
  

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
