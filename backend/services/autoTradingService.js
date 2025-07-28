const request = require('supertest');
const app = require('../app');
const AutoTradingRule = require('../models/AutoTradingRule');
const PriceService = require('./priceService');

async function processAutoTradingRules() {
  try {
    const rules = await AutoTradingRule.getAllActiveRules();

    if (!rules.length) {
      console.log('ℹ️ No active auto-trading rules found.');
      return;
    }

    console.log(`🔍 Found ${rules.length} active auto-trading rule(s)`);

    for (const rule of rules) {
      const { id, user_id, stock_symbol, condition_type, target_value, action, amount } = rule;

      try {
        let currentValue;

        if (condition_type === 'price') {
          currentValue = await PriceService.getCurrentPrice(stock_symbol);
        } else if (condition_type === 'profit') {
          //console.warn(`⚠️ Unknown condition_type "${condition_type}" in rule #${id}`);

          continue;
        }

        const conditionMet =
          (action === 'sell' && currentValue >= target_value) ||
          (action === 'buy' && currentValue <= target_value);

        console.log(`🔎 Rule #${id}: ${action.toUpperCase()} ${stock_symbol} at ${currentValue} (target: ${target_value})`);

        if (!conditionMet) {
          console.log(`🚫 Condition not met for rule #${id}, skipping.`);
          continue;
        }

        console.log(`✅ Rule triggered. Executing ${action} ${amount} ${stock_symbol} for user ${user_id}...`);

        const res = await request(app)
          .post(`/api/trades/${action}`)
          .set('x-internal-call', 'true')
          .set('x-user-id', String(user_id))
          .send({
            stockSymbol: stock_symbol,
            amount,
            price: currentValue,
            type: action
          });

        if (res.status === 201) {
          console.log(`✅ Trade successful for rule #${id}:`, res.body);
          await AutoTradingRule.deactivateRule(id);
          console.log(`🔒 Rule #${id} deactivated.`);
        } else {
          console.error(`❌ Trade failed for rule #${id}:`, res.body);
        }

      } catch (err) {
        console.error(`❌ Error processing rule #${rule.id}:`, err.message || err);
      }
    }

  } catch (err) {
    console.error('❌ Fatal error in processAutoTradingRules:', err.message || err);
  }
}

module.exports = {
  processAutoTradingRules,
};
