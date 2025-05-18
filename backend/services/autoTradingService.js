// const AutoTradingRule = require('../models/AutoTradingRule');
// const TradeController = require('./tradeController');
// const PriceService = require('./priceService');
// const ProfitService = require('./profitService'); 

// async function processAutoTradingRules() {
//   try {
//     const rules = await AutoTradingRule.getAllActiveRules();

//     for (const rule of rules) {
//       const { id, user_id, stock_symbol, condition_type, target_value, action } = rule;

//       let currentValue;

//       if (condition_type === 'price') {
//         currentValue = await PriceService.getCurrentPrice(stock_symbol);
//       } else if (condition_type === 'profit') {
//         currentValue = await ProfitService.getUserProfit(user_id, stock_symbol);
//       } else {
//         console.warn(`Unknown condition_type for rule ${id}`);
//         continue;
//       }

//       const conditionMet =
//         (action === 'sell' && currentValue >= target_value) ||
//         (action === 'buy' && currentValue <= target_value);

//       if (conditionMet) {
//         console.log(`✅ Rule triggered: User ${user_id} ${action} ${stock_symbol}`);

//         await TradeService.executeTrade({
//           userId: user_id,
//           stockSymbol: stock_symbol,
//           action,
//           source: 'auto'
//         });

//         await AutoTradingRule.deactivateRule(id);
//       }
//     }
//   } catch (err) {
//     console.error('❌ Error in processAutoTradingRules:', err.message || err);
//   }
// }

// module.exports = {
//   processAutoTradingRules,
// };
