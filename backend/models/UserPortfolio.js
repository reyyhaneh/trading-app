const pool = require('../config/db');

class UserPortfolio {
  static async getPortfolio(userId) {
    try {
      const query = 'SELECT * FROM user_portfolio WHERE user_id = $1;';
      const { rows: portfolio } = await pool.query(query, [userId]);
      return portfolio;
    } catch (error) {
      console.error('Error fetching user portfolio:', error.message || error);
      throw error;
    }
  }

  static async getPortfolioBySymbol(userId, stockSymbol) {
    try {
      const query = 'SELECT * FROM user_portfolio WHERE user_id = $1 AND stock_symbol = $2';
      const { rows } = await pool.query(query, [userId, stockSymbol]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching portfolio for ${stockSymbol}:`, error.message || error);
      throw error;
    }
  }

  static async createPortfolio(userId, stockSymbol, totalAmount, totalSpent, avgCostPerUnit) {
    try {
      const query = `
        INSERT INTO user_portfolio (user_id, stock_symbol, total_amount, total_spent, total_earned, avg_cost_per_unit, profit_loss)
        VALUES ($1, $2, $3, $4, 0, $5, 0) -- Default total_earned & profit_loss to 0
      `;
      await pool.query(query, [userId, stockSymbol, totalAmount || 0, totalSpent || 0, avgCostPerUnit || 0]);
    } catch (error) {
      console.error(`Error creating portfolio for ${stockSymbol}:`, error.message || error);
      throw error;
    }
  }

  static async updatePortfolio(userId, stockSymbol, totalAmount, totalSpent, avgCostPerUnit) {
    try {
      const query = `
        INSERT INTO user_portfolio (user_id, stock_symbol, total_amount, total_spent, avg_cost_per_unit)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, stock_symbol)
        DO UPDATE SET 
          total_amount = COALESCE(user_portfolio.total_amount, 0) + COALESCE(EXCLUDED.total_amount, 0),
          total_spent = COALESCE(user_portfolio.total_spent, 0) + COALESCE(EXCLUDED.total_spent, 0),
          avg_cost_per_unit = CASE 
            WHEN (COALESCE(user_portfolio.total_amount, 0) + COALESCE(EXCLUDED.total_amount, 0)) > 0 
            THEN (COALESCE(user_portfolio.total_spent, 0) + COALESCE(EXCLUDED.total_spent, 0)) 
                 / (COALESCE(user_portfolio.total_amount, 0) + COALESCE(EXCLUDED.total_amount, 0))
            ELSE 0 
          END,
          updated_at = NOW();
      `;
      await pool.query(query, [userId, stockSymbol, totalAmount, totalSpent, avgCostPerUnit]);
    } catch (error) {
      console.error(`Error updating portfolio for ${stockSymbol}:`, error.message || error);
      throw error;
    }
  }
  static async updatePortfolioAfterSell(userId, stockSymbol, totalAmount, totalEarned, profitLoss) {
    try {
      const query = `
        UPDATE user_portfolio
        SET total_amount = COALESCE($3, 0),
            total_earned = COALESCE(total_earned, 0) + COALESCE($4, 0),
            profit_loss = COALESCE(profit_loss, 0) + COALESCE($5, 0),
            updated_at = NOW()
        WHERE user_id = $1 AND stock_symbol = $2
      `;
      await pool.query(query, [userId, stockSymbol, totalAmount, totalEarned, profitLoss]);
  
      // If total amount is now 0, remove the asset from portfolio
      if (totalAmount === 0) {
        console.log(`🗑️ Removing ${stockSymbol} from portfolio as amount is zero.`);
        await UserPortfolio.deleteAsset(userId, stockSymbol);
      }
    } catch (error) {
      console.error(`Error updating portfolio after sell for ${stockSymbol}:`, error.message || error);
      throw error;
    }
  }
  

  static async deleteAsset(userId, stockSymbol) {
    try {
      const query = 'DELETE FROM user_portfolio WHERE user_id = $1 AND stock_symbol = $2';
      await pool.query(query, [userId, stockSymbol]);
    } catch (error) {
      console.error(`Error deleting asset ${stockSymbol}:`, error.message || error);
      throw error;
    }
  }
}

module.exports = UserPortfolio;
