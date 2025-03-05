const pool = require('../config/db');

class UserPortfolio {
  // ✅ Create a new portfolio entry when a user first trades a stock
  static async createPortfolio(userId, stockSymbol, totalAmount, totalSpent) {
    try {
      const avgCostPerUnit = totalSpent / totalAmount;
      const query = `
        INSERT INTO user_portfolio (user_id, stock_symbol, total_amount, total_spent, total_earned, avg_cost_per_unit, profit_loss, updated_at)
        VALUES ($1, $2, $3, $4, 0, $5, 0, NOW())
        RETURNING *;
      `;
      const values = [userId, stockSymbol, totalAmount, totalSpent, avgCostPerUnit];
      const { rows } = await pool.query(query, values);
      
      console.log(`🆕 Portfolio created for ${stockSymbol}:`, rows[0]);
      return rows[0];
    } catch (error) {
      console.error(`❌ Error creating portfolio for ${stockSymbol}:`, error.message || error);
      throw error;
    }
  }

  // ✅ Retrieve a specific stock's portfolio for a user
  static async getPortfolioBySymbol(userId, stockSymbol) {
    try {
      const query = 'SELECT * FROM user_portfolio WHERE user_id = $1 AND stock_symbol = $2';
      const { rows } = await pool.query(query, [userId, stockSymbol]);
      return rows[0] || null;
    } catch (error) {
      console.error(`❌ Error fetching portfolio for ${stockSymbol}:`, error.message || error);
      throw error;
    }
  }

  // ✅ Retrieve all portfolio records for a user
  static async getPortfolio(userId) {
    try {
      const query = 'SELECT * FROM user_portfolio WHERE user_id = $1';
      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error(`❌ Error fetching user portfolio:`, error.message || error);
      throw error;
    }
  }

  // ✅ Update or create portfolio when a trade occurs
  static async updatePortfolioOnTrade(userId, stockSymbol, tradeType, quantity, price) {
    try {
      let portfolio = await this.getPortfolioBySymbol(userId, stockSymbol);
      const totalValue = quantity * price;

      // 🆕 Create portfolio if it doesn't exist on a buy trade
      if (!portfolio) {
        if (tradeType === 'buy') {
          return await this.createPortfolio(userId, stockSymbol, quantity, totalValue);
        } else {
          throw new Error(`❌ Cannot sell ${stockSymbol} without prior purchase.`);
        }
      }

      let newTotalAmount = parseFloat(portfolio.total_amount) || 0;
      let newTotalSpent = parseFloat(portfolio.total_spent) || 0;
      let newTotalEarned = parseFloat(portfolio.total_earned) || 0;
      let newProfitLoss = parseFloat(portfolio.profit_loss) || 0;
      let newAvgCost = parseFloat(portfolio.avg_cost_per_unit) || 0;

      if (tradeType === 'buy') {
        // 📈 Buying → Increase holdings & recalculate average cost
        newTotalAmount += quantity;
        newTotalSpent += totalValue;
        newAvgCost = newTotalSpent / newTotalAmount;
      } else if (tradeType === 'sell') {
        if (quantity > newTotalAmount) {
          throw new Error(`❌ Not enough ${stockSymbol} to sell.`);
        }

        // 📉 Selling → Reduce holdings, track earnings & profit/loss
        const costBasis = quantity * newAvgCost;
        const profitLoss = totalValue - costBasis;

        newTotalAmount -= quantity;
        newTotalEarned += totalValue;
        newProfitLoss += profitLoss;

        // 🗑️ Remove from portfolio if fully sold
        if (newTotalAmount === 0) {
          console.log(`🗑️ Removing ${stockSymbol} from portfolio as amount is zero.`);
          return await this.deleteAsset(userId, stockSymbol);
        }
      }

      // ✅ Update the portfolio
      await this.updatePortfolio(userId, stockSymbol, newTotalAmount, newTotalSpent, newAvgCost, newTotalEarned, newProfitLoss);
      console.log(`📊 Portfolio updated for ${tradeType.toUpperCase()} - ${stockSymbol}`);
    } catch (error) {
      console.error(`❌ Error updating portfolio for ${stockSymbol}:`, error.message || error);
      throw error;
    }
  }

  // ✅ Update portfolio when an asset is bought/sold
  static async updatePortfolio(userId, stockSymbol, totalAmount, totalSpent, avgCostPerUnit, totalEarned, profitLoss) {
    try {
      const query = `
        UPDATE user_portfolio
        SET total_amount = $3,
            total_spent = $4,
            avg_cost_per_unit = $5,
            total_earned = $6,
            profit_loss = $7,
            updated_at = NOW()
        WHERE user_id = $1 AND stock_symbol = $2
      `;
      await pool.query(query, [userId, stockSymbol, totalAmount, totalSpent, avgCostPerUnit, totalEarned, profitLoss]);
      console.log(`✅ Portfolio updated for ${stockSymbol}`);
    } catch (error) {
      console.error(`❌ Error updating portfolio for ${stockSymbol}:`, error.message || error);
      throw error;
    }
  }

  // ✅ Remove an asset from the portfolio if holdings reach zero
  static async deleteAsset(userId, stockSymbol) {
    try {
      const query = 'DELETE FROM user_portfolio WHERE user_id = $1 AND stock_symbol = $2';
      await pool.query(query, [userId, stockSymbol]);
      console.log(`🗑️ Deleted ${stockSymbol} from user ${userId} portfolio.`);
    } catch (error) {
      console.error(`❌ Error deleting asset ${stockSymbol}:`, error.message || error);
      throw error;
    }
  }
}

module.exports = UserPortfolio;
