const pool = require('../config/db');

class UserPortfolio {
    static async getPortfolio(userId) {
        try {
            const query = 'SELECT * FROM user_portfolio WHERE user_id = $1;';
            const { rows: portfolio } = await pool.query(query, [userId]);
      
            return portfolio; // Returns an array of portfolio objects
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
        const query = `
          INSERT INTO user_portfolio (user_id, stock_symbol, total_amount, total_spent, total_earned, avg_cost_per_unit, profit_loss)
          VALUES ($1, $2, $3, $4, 0, $5, 0) -- Default total_earned & profit_loss to 0
        `;
        await pool.query(query, [userId, stockSymbol, totalAmount || 0, totalSpent || 0, avgCostPerUnit || 0]);
    }
    static async updatePortfolio(userId, stockSymbol, totalAmount, totalSpent, avgCostPerUnit) {
        const query = `
        UPDATE user_portfolio
        SET total_amount = COALESCE($3, 0), 
            total_spent = COALESCE($4, 0), 
            avg_cost_per_unit = COALESCE($5, 0)
        WHERE user_id = $1 AND stock_symbol = $2
        `;
        await pool.query(query, [userId, stockSymbol, totalAmount || 0, totalSpent || 0, avgCostPerUnit || 0]);
    }

    static async updatePortfolioAfterSell(userId, stockSymbol, totalAmount, totalEarned, profitLoss) {
        const query = `
          UPDATE user_portfolio
          SET total_amount = COALESCE($3, 0),
              total_earned = COALESCE($4, 0),
              profit_loss = COALESCE($5, 0)
          WHERE user_id = $1 AND stock_symbol = $2
        `;
        await pool.query(query, [userId, stockSymbol, totalAmount || 0, totalEarned || 0, profitLoss || 0]);
    }
    
    

    static async deleteAsset(userId, stockSymbol) {
        const query = 'DELETE FROM user_portfolio WHERE user_id = $1 AND stock_symbol = $2';
        await pool.query(query, [userId, stockSymbol]);
    }



    

};
module.exports = UserPortfolio;
