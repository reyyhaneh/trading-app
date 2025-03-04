const UserTask = require('../models/UserTask');
const User = require('../models/User'); // Ensure this model allows fetching the user's balance.
const UserAssets = require('../models/UserAssets');
const UserPortfolio = require('../models/UserPortfolio');

const trackTrade = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const { stockSymbol, amount, price, type } = req.body;

    // Ensure all required trade data is provided
    if (!stockSymbol || !amount || !price) {
      return res.status(400).json({ error: 'Missing required trade fields.' });
    }

    // Retrieve user balance


    if (type == 'buy') {
      const balance = await User.getBalance(userId);
      if (balance === null || balance === undefined) {
        return res.status(500).json({ error: 'Could not retrieve user balance.' });
      }
      const totalCost = parseFloat((amount * price).toFixed(8));
      if (balance < totalCost) {
        console.log('❌ Insufficient Funds:', { balance, totalCost });
        return res.status(400).json({ error: 'Insufficient funds for this trade.' });
      }
    }
    if (type === 'sell') {
      const userAssetAmount = await UserAssets.getAssetAmount(userId, stockSymbol);
      console.log(`🔍 RAW userAssetAmount from DB:`, userAssetAmount);
    
      if (userAssetAmount === null || userAssetAmount === undefined) {
        return res.status(500).json({ error: `Could not retrieve asset ${stockSymbol} for user.` });
      }
      const requestedAmount = parseFloat(amount); // Ensure number
      const availableAmount = parseFloat(userAssetAmount); // Ensure number
      
      console.log(`🔍 user has: ${availableAmount} (${typeof availableAmount}) ${stockSymbol}s`);
      console.log(`🔍 user wants to sell: ${requestedAmount} (${typeof requestedAmount}) ${stockSymbol}s`);
      
      if (requestedAmount > availableAmount) {
        console.log('🔴 DEBUG: Amount Check Failed');
        console.log(`❌ Insufficient Assets to Sell: user has ${availableAmount}, wants to sell ${requestedAmount}`);
        return res.status(400).json({ error: `Not enough ${stockSymbol} to sell.` });
      } else {
        console.log(`✅ Passed: user has enough ${stockSymbol} to sell.`);
      }
    }
    

    

  

    // If the user does not have enough funds, return an error


    // Get user tasks
    const tasks = await UserTask.getUserTasks(userId);

    const tradeTasks = tasks
      .filter(task => /^Make \d+ Trades$/i.test(task.task_name) && !task.completed)
      .sort((a, b) => b.created_at - a.created_at);

    const tradeTask = tradeTasks.length > 0 ? tradeTasks[0] : null;

    if (tradeTask && !tradeTask.completed) {
      const progressIncrease = 20;

      if (tradeTask.progress + progressIncrease >= 100) {
        await UserTask.updateProgress(userId, tradeTask.task_name, 100);
        const currentTradeGoal = parseInt(tradeTask.task_name.match(/\d+/)[0]);
        const newTradeGoal = currentTradeGoal + 5;
        const newTaskName = `Make ${newTradeGoal} Trades`;

        const existingTasks = await UserTask.getUserTasks(userId);
        const duplicateTask = existingTasks.find(task => task.task_name === newTaskName);

        if (!duplicateTask) {
          await UserTask.createTask(userId, newTaskName);
        }
      } else {
        await UserTask.updateProgress(userId, tradeTask.task_name, tradeTask.progress + progressIncrease);
      }
    }

    // Call next to move to the buyStock function if funds are sufficient
    next();
  } catch (error) {
    console.error('❌ Error tracking trade progress:', error);
    res.status(500).json({ error: 'Failed to track trade progress. Please try again later.' });
  }
};
const afterBuyStock = async(req, res) => {
  console.log("hello this is after buystock.")
}
// In progress.js

const preTradeCheck = async (req, res, next) => {
  try {
    const { stockSymbol, amount, price, type } = req.body;
    const userId = req.user.id;

    if (!stockSymbol || !amount || !price || !type) {
      return res.status(400).json({ error: 'Missing required trade fields.' });
    }

    const parsedAmount = parseFloat(amount);
    const parsedPrice = parseFloat(price).toFixed(8);

    if (isNaN(parsedAmount) || parsedAmount <= 0 || isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Invalid amount or price.' });
    }

    const cost = parseFloat((amount * price).toFixed(8));

    const balance = parseFloat(await User.getBalance(req.user.id)); // Ensure Float(8)

    if (type === 'buy') {

      if (balance < cost) {
        console.alert("Insufficient funds!")
        return res.status(400).json({ error: 'Insufficient funds to buy this stock.' });
      }
    } else if (type === 'sell') {
      const userAssetAmount = await UserAssets.getAssetAmount(userId, stockSymbol);
      console.log("user asset amount: ", userAssetAmount)
      if (userAssetAmount < parsedAmount) {
        return res.status(400).json({ error: `Not enough ${stockSymbol} to sell.` });
      }
    }

    res.locals.tradeData = { userId, stockSymbol, parsedAmount, parsedPrice, cost, balance, type };
    next(); 
  } catch (error) {
    console.error('❌ Error in preTradeCheck:', error.message);
    res.status(500).json({ error: 'Trade validation failed. Try again later.' });
  }
};

const postTradeUpdate = async (req, res) => {
  console.log("in postTradeUpdate")
  try {
    const { userId, stockSymbol, parsedAmount, parsedPrice, cost, type } = res.locals.tradeData;
    const trade = res.locals.trade;

    let portfolio = await UserPortfolio.getPortfolioBySymbol(userId, stockSymbol);
    console.log("portfolio: ", portfolio)

    if (type === 'buy') {
      if (portfolio) {
        const newTotalAmount = portfolio.total_amount + parsedAmount;
        const newTotalSpent = portfolio.total_spent + cost;
        const newAvgCost = newTotalSpent / newTotalAmount;
        await UserPortfolio.updatePortfolio(userId, stockSymbol, newTotalAmount, newTotalSpent, newAvgCost);
      } else {
        await UserPortfolio.createPortfolio(userId, stockSymbol, parsedAmount, cost, parsedPrice);
      }
    } else if (type === 'sell') {
      const newTotalAmount = portfolio.total_amount - parsedAmount;
      const newTotalEarned = portfolio.total_earned + cost;
      const newProfitLoss = portfolio.profit_loss + (cost - parsedAmount * portfolio.avg_cost_per_unit);
      await UserPortfolio.updatePortfolioAfterSell(userId, stockSymbol, newTotalAmount, newTotalEarned, newProfitLoss);
    }

    res.status(201).json({ msg: 'Trade completed successfully', trade });
  } catch (error) {
    console.error('❌ Error updating portfolio:', error.message);
    res.status(500).json({ error: 'Trade executed, but post-processing failed.' });
  }
};

module.exports = { trackTrade, afterBuyStock, preTradeCheck, postTradeUpdate };
