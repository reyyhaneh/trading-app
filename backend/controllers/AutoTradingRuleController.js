// controllers/AutoTradingRuleController.js
const AutoTradingRule = require('../models/AutoTradingRule'); // Model
const User = require('../models/User'); // User model

const AutoTradingRuleController = {

  // Create a new auto-trading rule
  async createRule(req, res) {
    const { stockSymbol, conditionType, targetValue, action } = req.body;
    const userId = req.user.id; // Assuming userId is coming from the JWT token (req.user)

    try {
      const rule = await AutoTradingRule.createRule({ userId, stockSymbol, conditionType, targetValue, action });
      return res.status(201).json({ success: true, rule });
    } catch (error) {
      console.error("❌ Error creating rule:", error.message);
      return res.status(500).json({ error: 'Error creating auto-trading rule' });
    }
  },

  // Get all active auto-trading rules for the user
  async getActiveRules(req, res) {
    const userId = req.user.id;

    try {
      const rules = await AutoTradingRule.getActiveRules(userId);
      return res.status(200).json({ rules });
    } catch (error) {
      console.error("❌ Error fetching active rules:", error.message);
      return res.status(500).json({ error: 'Error fetching active auto-trading rules' });
    }
  },

  // Update an auto-trading rule
  async updateRule(req, res) {
    const ruleId = req.params.id;
    const updates = req.body; // Fields to be updated

    try {
      const updatedRule = await AutoTradingRule.updateRule(ruleId, updates);
      if (!updatedRule) {
        return res.status(404).json({ error: 'Rule not found' });
      }
      return res.status(200).json({ success: true, updatedRule });
    } catch (error) {
      console.error("❌ Error updating rule:", error.message);
      return res.status(500).json({ error: 'Error updating auto-trading rule' });
    }
  },

  // Deactivate a rule
  async deactivateRule(req, res) {
    const ruleId = req.params.id;

    try {
      const deactivatedRule = await AutoTradingRule.deactivateRule(ruleId);
      if (!deactivatedRule) {
        return res.status(404).json({ error: 'Rule not found' });
      }
      return res.status(200).json({ success: true, deactivatedRule });
    } catch (error) {
      console.error("❌ Error deactivating rule:", error.message);
      return res.status(500).json({ error: 'Error deactivating auto-trading rule' });
    }
  },

  // Get all active auto-trading rules (system-wide, admin purpose)
  async getAllActiveRules(req, res) {
    try {
      const rules = await AutoTradingRule.getAllActiveRules();
      return res.status(200).json({ rules });
    } catch (error) {
      console.error("❌ Error fetching all active rules:", error.message);
      return res.status(500).json({ error: 'Error fetching all active auto-trading rules' });
    }
  }
};

module.exports = AutoTradingRuleController;
