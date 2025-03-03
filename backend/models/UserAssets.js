const pool = require('../config/db');

const UserAssets = {

  async getAssetsByUserId(userId) {
    const query = `
      SELECT ua.asset_symbol, a.name, ua.amount
      FROM user_assets ua
      JOIN assets a ON ua.asset_symbol = a.symbol
      WHERE ua.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  /**
   * Increase asset amount for a user (or insert new if not exists).
   */
  async addOrUpdateAsset(userId, assetSymbol, amountToAdd) {
    console.log(`
      amount to add: ${amountToAdd}
      
      `)

    // Check if record exists
    const selectQuery = `
      SELECT id, amount FROM user_assets
      WHERE user_id = $1 AND asset_symbol = $2
    `;
    const result = await pool.query(selectQuery, [userId, assetSymbol]);
    console.log("query result: ", result)

    if (result.rows.length > 0) {
      // Update existing record
      const newAmount = (parseFloat(result.rows[0].amount) + parseFloat(amountToAdd)).toFixed(8);
      const updateQuery = `
        UPDATE user_assets
        SET amount = $1, updated_at = NOW()
        WHERE id = $2
      `;
      await pool.query(updateQuery, [newAmount, result.rows[0].id]);
    } else {
      // Insert new record
      const insertQuery = `
        INSERT INTO user_assets (user_id, asset_symbol, amount)
        VALUES ($1, $2, $3)
      `;
      await pool.query(insertQuery, [userId, assetSymbol, amountToAdd]);
    }
  },

  /**
   * Decrease asset amount for a user.
   */
  async reduceAsset(userId, assetSymbol, amountToReduce) {
    const selectQuery = `
      SELECT id, amount FROM user_assets
      WHERE user_id = $1 AND asset_symbol = $2
    `;
    const result = await pool.query(selectQuery, [userId, assetSymbol]);

    if (result.rows.length === 0) {
      throw new Error('Asset record not found for selling');
    }

    let currentAmount = parseFloat(result.rows[0].amount);
    let newAmount = currentAmount - amountToReduce;

    if (newAmount < 0) {
      throw new Error('Insufficient asset amount');
    } else if (newAmount === 0) {
      // Optionally delete record if amount reaches 0
      const deleteQuery = `DELETE FROM user_assets WHERE id = $1`;
      await pool.query(deleteQuery, [result.rows[0].id]);
    } else {
      const updateQuery = `
        UPDATE user_assets
        SET amount = $1, updated_at = NOW()
        WHERE id = $2
      `;
      await pool.query(updateQuery, [newAmount, result.rows[0].id]);
    }
  },
  async getAssetAmount(userId, assetSymbol) {
    const query = `
        SELECT amount 
        FROM user_assets 
        WHERE user_id = $1 AND asset_symbol = $2
    `;

    const result = await pool.query(query, [userId, assetSymbol]);
    return result.rows.length > 0 ? result.rows[0].amount : 0;
}

};

module.exports = UserAssets;
