const AutoTradingRule = require('../models/AutoTradingRule');
const PriceService = require('./priceService');

async function processAutoTradingRules() {
  try {
    const rules = await AutoTradingRule.getAllActiveRules();
    console.log(`📄 Total active rules: ${rules.length}`);
    for (const rule of rules) {
      const { id, user_id, stock_symbol, condition_type, target_value, action, amount } = rule;
    
      console.log(`↪️ Processing rule #${id} for user ${user_id}`);
    
      try {
        let currentValue;
    
        if (condition_type === 'price') {
          currentValue = await PriceService.getCurrentPrice(stock_symbol);
        } else if (condition_type === 'profit') {
          currentValue = await ProfitService.getUserProfit(user_id, stock_symbol);
        } else {
          console.warn(`⚠️ Unknown condition_type for rule #${id}`);
          continue;
        }
    
        const conditionMet =
          (action === 'sell' && currentValue >= target_value) ||
          (action === 'buy' && currentValue <= target_value);
    
        if (conditionMet) {
          console.log(`✅ Rule triggered: User ${user_id} ${action} ${stock_symbol}`);
    
          await executeAutoTrade({
            userId: user_id,
            stockSymbol: stock_symbol,
            action,
            amount,
            price: currentValue
          });
    
          await AutoTradingRule.deactivateRule(id);
        } else {
          console.log(`🚫 Condition not met for rule #${id}`);
        }
    
      } catch (err) {
        console.error(`❌ Error processing rule #${id}:`, err.message || err);
        // Do NOT deactivate — just move on
      }
    }
    
  } catch (err) {
    console.error('❌ Error in processAutoTradingRules:', err.message || err);
  }
}

module.exports = {
  processAutoTradingRules,
};


const User = require('../models/User');
const UserAssets = require('../models/UserAssets');
const UserPortfolio = require('../models/UserPortfolio');
const UserTask = require('../models/UserTask');
const Trade = require('../models/Trade');

async function executeAutoTrade({ userId, stockSymbol, action, amount, price }) {
  const parsedAmount = parseFloat(amount);
  const parsedPrice = parseFloat(price);
  const cost = parsedAmount * parsedPrice;

  // Validation (copied from preTradeCheck)
  if (parsedAmount <= 0) throw new Error('Trade amount must be greater than zero');

  if (action === 'buy') {
    const balance = await User.getBalance(userId);
    if (balance < cost) throw new Error('Insufficient funds for auto-buy');
    await Trade.execute(userId, balance - cost, stockSymbol, parsedAmount, Math.round(cost * 0.01), 'buy', parsedAmount, parsedPrice, stockSymbol);
  }

  if (action === 'sell') {
    const assetAmount = await UserAssets.getAssetAmount(userId, stockSymbol);
    if (assetAmount === null || assetAmount < parsedAmount) throw new Error(`Not enough ${stockSymbol} to auto-sell`);
    const balance = await User.getBalance(userId);
    await Trade.execute(userId, balance + cost, stockSymbol, parsedAmount, Math.round(cost * 0.01), 'sell', parsedAmount, parsedPrice, stockSymbol);
  }

  // Update portfolio
  await UserPortfolio.updatePortfolioOnTrade(userId, stockSymbol, action, parsedAmount, parsedPrice);

  // Update task progress
  const tasks = await UserTask.getIncompleteUserTasks(userId);
  const tradeTask = tasks.find(task => /^Make (\d+) Trades$/i.test(task.task_name));
  if (tradeTask) {
    const totalRequired = parseInt(tradeTask.task_name.match(/^Make (\d+) Trades$/i)[1]);
    const progressIncrement = 100 / totalRequired;
    await UserTask.updateProgress(userId, tradeTask.task_name, tradeTask.progress + progressIncrement);
  }

  console.log(`✅ Auto-trade completed: ${action} ${parsedAmount} ${stockSymbol} @ ${parsedPrice}`);
}

