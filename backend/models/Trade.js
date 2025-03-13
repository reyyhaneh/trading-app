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

  static async execute(
    userId,
    newBalance,
    assetSymbol,
    amountToAdd,
    scoreChange,
    tradeType,
    quantity,
    price,
    stockSymbol,
    taskName,
    newProgress,
  ) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      console.log("🚀 Transaction Started for User:", userId);

      /** 1️⃣ Update User Balance */
      await client.query(
        `UPDATE users SET balance = $2 WHERE id = $1 RETURNING balance;`,
        [userId, newBalance]
      );
      console.log("💰 Balance Updated:", newBalance);

      /** 2️⃣ Update User Asset */

      if (tradeType === 'buy') {
        const assetQuery = `
        INSERT INTO user_assets (user_id, asset_symbol, amount)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, asset_symbol)
        DO UPDATE SET amount = user_assets.amount + EXCLUDED.amount, updated_at = NOW();
      `;
      await client.query(assetQuery, [userId, assetSymbol, amountToAdd]);
      console.log("📊 User Asset Updated:", assetSymbol, amountToAdd);

      } else if (tradeType === 'sell') {
        console.log("sell")
        const sellAssetQuery = `
        UPDATE user_assets
        SET amount = CASE 
                      WHEN amount - $1 <= 0 THEN 0  -- Ensures no negative values
                      ELSE amount - $1 
                    END,
            updated_at = NOW()
        WHERE user_id = $2 AND asset_symbol = $3
        RETURNING amount; -- Get the updated amount
      `;

      const { rows } = await client.query(sellAssetQuery, [Math.abs(amountToAdd), userId, assetSymbol]);

      if (rows.length && parseFloat(rows[0].amount) === 0) {
        await client.query(`DELETE FROM user_assets WHERE user_id = $1 AND asset_symbol = $2;`, [userId, assetSymbol]);
        console.log(`❌ ${assetSymbol} removed (SOLD ALL).`);
      } else {
        console.log(`📉 Asset Updated (SELL): ${assetSymbol}, Remaining: ${rows[0].amount}`);
      }

      }
    
      /** 3️⃣ Update User Score */
      await client.query(`UPDATE users SET score = score + $1 WHERE id = $2;`, [scoreChange, userId]);
      console.log("🏆 Score Updated:", scoreChange);

      /** 4️⃣ Update or Create Portfolio */
      const portfolioQuery = `
        INSERT INTO user_portfolio (user_id, stock_symbol, total_amount, total_spent, total_earned, avg_cost_per_unit)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, stock_symbol)
        DO UPDATE SET 
            total_amount = CASE 
                            WHEN $7 = 'buy' THEN user_portfolio.total_amount + EXCLUDED.total_amount
                            WHEN $7 = 'sell' THEN user_portfolio.total_amount - EXCLUDED.total_amount
                            ELSE user_portfolio.total_amount 
                          END,
            total_spent = CASE 
                            WHEN $7 = 'buy' THEN user_portfolio.total_spent + EXCLUDED.total_spent
                            ELSE user_portfolio.total_spent 
                          END,
            total_earned = CASE 
                            WHEN $7 = 'sell' THEN user_portfolio.total_earned + EXCLUDED.total_earned
                            ELSE user_portfolio.total_earned 
                          END,
            avg_cost_per_unit = CASE 
                                  WHEN user_portfolio.total_amount + EXCLUDED.total_amount > 0 
                                  THEN (user_portfolio.total_spent + EXCLUDED.total_spent) / (user_portfolio.total_amount + EXCLUDED.total_amount)
                                  ELSE 0 
                                END,
            updated_at = NOW();

    `;

    const totalSpent = tradeType === 'buy' ? quantity * price : 0;
    const totalEarned = tradeType === 'sell' ? quantity * price : 0;

    await client.query(portfolioQuery, [
      userId, stockSymbol, quantity, totalSpent, totalEarned, price, tradeType
    ]);

    console.log("📈 Portfolio Updated:", stockSymbol);

      /** 5️⃣ Update Task Progress */
      console.log("new progress value: ", newProgress)
      
      const taskQuery = `
        UPDATE user_tasks
        SET progress = LEAST($1, 100), 
            completed = CASE WHEN $1 >= 100 THEN TRUE ELSE completed END,
            updated_at = NOW()
        WHERE user_id = $2 AND task_name = $3 AND completed = FALSE
        RETURNING completed;
      `;

      const { rows: taskRows } = await client.query(taskQuery, [newProgress, userId, taskName]);
      
      if (taskRows.length && taskRows[0].completed) {
        console.log("🎯 Task Completed:", taskName);
        
        // Assign a new incremented task
        const nextTradeCount = parseInt(taskName.match(/\d+/)[0]) + 5;
        const newTaskName = `Make ${nextTradeCount} Trades`;
        
        // Prevent duplicate task assignment
        const existingTaskQuery = `SELECT 1 FROM user_tasks WHERE user_id = $1 AND task_name = $2;`;
        const { rowCount } = await client.query(existingTaskQuery, [userId, newTaskName]);

        if (rowCount === 0) {
          await client.query(`INSERT INTO user_tasks (user_id, task_name) VALUES ($1, $2);`, [userId, newTaskName]);
          console.log("🆕 New Task Assigned:", newTaskName);
        }
      }

      await client.query('COMMIT');
      console.log("✅ Transaction Committed Successfully");

    } catch (error) {
      await client.query('ROLLBACK');
      console.error("❌ Transaction Rolled Back due to Error:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }


}

module.exports = Trade;
