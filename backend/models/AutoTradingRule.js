// models/AutoTradingRule.js

const pool = require('../config/db');

const AutoTradingRule = {
  /** Create a new auto-trading rule */
  async createRule({ userId, stockSymbol, conditionType, targetValue, action, amount }) {
    try {
      const query = `
        INSERT INTO auto_trading_rules (user_id, stock_symbol, condition_type, target_value, action, amount, active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        RETURNING *;
      `;
      const values = [userId, stockSymbol, conditionType, targetValue, action, amount];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating auto-trading rule:', error.message || error);
      throw error;
    }
  },

  /** Get all active auto-trading rules for a user */
  async getActiveRules(userId) {
    try {
      const query = `
        SELECT * FROM auto_trading_rules
        WHERE user_id = $1 AND active = true
        ORDER BY created_at DESC;
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching active auto-trading rules:', error.message || error);
      throw error;
    }
  },

  /** Deactivate a rule (soft delete) */
  async deactivateRule(ruleId) {
    try {
      const query = `
        UPDATE auto_trading_rules
        SET active = false, updated_at = NOW()
        WHERE id = $1
        RETURNING *;
      `;
      const result = await pool.query(query, [ruleId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deactivating auto-trading rule:', error.message || error);
      throw error;
    }
  },

  /** Update an existing rule (example: updating target_value or action) */
  async updateRule(ruleId, updates) {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }

      values.push(ruleId);

      const query = `
        UPDATE auto_trading_rules
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${index}
        RETURNING *;
      `;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating auto-trading rule:', error.message || error);
      throw error;
    }
  },

  /** Get all rules (for system-wide background checking for all users) */
  async getAllActiveRules() {
    try {
      const query = `
        SELECT * FROM auto_trading_rules
        WHERE active = true;
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching all active auto-trading rules:', error.message || error);
      throw error;
    }
  }
};

module.exports = AutoTradingRule;
