const pool = require('../config/db');
const UserPortfolio = require('./UserPortfolio');

class Trade {
  static async addTrade(trade) {
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

      // Fetch user's portfolio for this stock
      let portfolio = await UserPortfolio.getPortfolioBySymbol(userId, stockSymbol);

      if (!portfolio) {
        portfolio = {
          totalAmount: 0,
          totalSpent: 0,
          totalEarned: 0,
          profitLoss: 0,
          avgCostPerUnit: 0,
        };
      }

      let profitLoss = 0;

      if (type.toLowerCase() === 'buy') {
        // **BUY: Update portfolio (Add Amount & Cost)**
        const newTotalAmount = portfolio.totalAmount + tradeAmount;
        const newTotalSpent = portfolio.totalSpent + totalValue;
        const newAvgCost = newTotalSpent / newTotalAmount;

        await UserPortfolio.updatePortfolio(userId, stockSymbol, newTotalAmount, newTotalSpent, newAvgCost);
      } 
      else if (type.toLowerCase() === 'sell') {
        // **SELL: Ensure user has enough assets**
        if (tradeAmount > portfolio.totalAmount) {
          throw new Error('Insufficient assets to sell.');
        }

        // Calculate profit/loss using the average cost per unit
        const costBasis = tradeAmount * portfolio.avgCostPerUnit;
        profitLoss = totalValue - costBasis;

        // Update portfolio after sale
        const newTotalAmount = portfolio.totalAmount - tradeAmount;
        const newTotalEarned = portfolio.totalEarned + totalValue;
        const newProfitLoss = portfolio.profitLoss + profitLoss;

        await UserPortfolio.updatePortfolioAfterSell(userId, stockSymbol, newTotalAmount, newTotalEarned, newProfitLoss);
      }

      // **INSERT the Trade into the trades table**
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
