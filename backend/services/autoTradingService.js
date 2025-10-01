const AutoTradingRule = require('../models/AutoTradingRule');
const PriceService = require('./priceService');
const UserPortfolio = require('../models/UserPortfolio')

const EPSILON = 0.01;

async function processAutoTradingRules() {
  try {
    const rules = await AutoTradingRule.getAllActiveRules();
    console.log(`📄 Total active rules: ${rules.length}`);

    for (const rule of rules) {
      const {
        id, user_id, stock_symbol, condition_type,
        target_value, action, amount,
        use_moving_average, lookback_minutes, variance_threshold
      } = rule;
          
      console.log(`↪️ Processing rule #${id} for user ${user_id}`);
      
      try {
        let currentValue;
        let conditionMet = false;


    
        if (condition_type === 'price') {
          currentValue = await PriceService.getCurrentPrice(stock_symbol);

          conditionMet =
          (action === 'sell' && currentValue >= target_value - EPSILON) ||
          (action === 'buy' && currentValue <= target_value + EPSILON);

        }else if (condition_type === 'profit/loss') {
          const portfolio = await UserPortfolio.getPortfolioBySymbol(user_id, stock_symbol);
          if (!portfolio) {
            console.warn(`⚠️ No portfolio entry found for ${stock_symbol}`);
            continue;
          }
          const currentPrice = await PriceService.getCurrentPrice(stock_symbol);

          const amount = parseFloat(portfolio.total_amount || 0);
          const spent = parseFloat(portfolio.total_spent || 0);
          const earned = parseFloat(portfolio.total_earned || 0);
          const currentValue = amount * currentPrice;
          const calculatedProfitLoss = currentValue + earned - spent;

          console.log(`📉 Calculated Profit/Loss for ${stock_symbol}: ${calculatedProfitLoss.toFixed(2)} (Target: ${target_value})`);
                    
          
          
          
          conditionMet =
            (action === 'sell' && calculatedProfitLoss >= target_value - EPSILON) ||
            (action === 'buy' && calculatedProfitLoss <= target_value + EPSILON);
          
          currentValue = currentPrice

        }else if (condition_type === 'moving_average'){
          const prices = await PriceService.getHistoricalPrices(stock_symbol, rule.lookback_minutes);
          if (!prices.length) {
            console.warn(`⚠️ No historical prices found for rule #${id}`);
            continue;
          }
          console.log(`📊 Historical prices for ${stock_symbol} (last ${rule.lookback_minutes} min):`, prices);

          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
          const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
          const stdDeviation = Math.sqrt(variance);

          console.log(`📈 Moving Avg: ${avg.toFixed(2)}, stdDeviation: ${stdDeviation.toFixed(4)}, Threshold: ${rule.variance_threshold}`);

          conditionMet =
            (action === 'buy' && avg <= target_value+EPSILON && stdDeviation <= rule.variance_threshold) ||
            (action === 'sell' && avg >= target_value-EPSILON && stdDeviation <= rule.variance_threshold);
          
          currentValue = await PriceService.getCurrentPrice(stock_symbol);
          

        } else{
          console.warn(`⚠️ Unknown condition_type for rule #${id}`);
          continue;
        }
    
        
    
        if (conditionMet) {
          console.log(`✅ Rule triggered: ${condition_type} | User ${user_id} ${action} ${stock_symbol} @ ${currentValue}`);
    
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


  console.log(`✅ Auto-trade completed: ${action} ${parsedAmount} ${stockSymbol} @ ${parsedPrice}`);
}

