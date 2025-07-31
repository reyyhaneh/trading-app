const request = require('supertest');
const app = require('../app');
const AutoTradingRule = require('../models/AutoTradingRule');
const PriceService = require('./priceService');

async function processAutoTradingRules() {
  try {
    const rules = await AutoTradingRule.getAllActiveRules();

    if (!rules.length) {
      return;
    }

    for (const rule of rules) {
      const { id, user_id, stock_symbol, condition_type, target_value, action, amount } = rule;

      try {
        let currentValue;

        if (condition_type === 'price') {
          currentValue = await PriceService.getCurrentPrice(stock_symbol);
        } else {
          console.warn(`⚠️ Unknown condition_type "${condition_type}" in rule #${id}`);
          continue;
        }

        const conditionMet =
          (action === 'sell' && currentValue >= target_value) ||
          (action === 'buy' && currentValue <= target_value);

        console.log(`🔎 Rule #${id}: ${action.toUpperCase()} ${stock_symbol} at ${currentValue} (target: ${target_value})`);

        if (!conditionMet) {
          continue;
        }

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
