const UserTask = require('../models/UserTask');
const User = require('../models/User'); // Ensure this model allows fetching the user's balance.
const UserAssets = require('../models/UserAssets');
const UserPortfolio = require('../models/UserPortfolio');
const messages = require('../utils/messages')

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
        return res.status(400).json({ error: messages.TRADE.INSUFFICIENT_FUNDS});
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
    console.log("user id: ", userId)

    if (!stockSymbol || !amount || !price || !type) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }


    const parsedAmount = parseFloat(amount);
    const parsedPrice = parseFloat(price);
    const cost = parsedAmount * parsedPrice;

    if (parsedAmount <= 0) {
      return res.status(400).json({ error: 'Trade amount must be greater than zero.' });
    }
    const portfolio = await UserPortfolio.getPortfolioBySymbol(userId, stockSymbol)
    console.log("user portfolio: ", portfolio)
    if (portfolio) {    
        const assetAmount = await UserAssets.getAssetAmount(userId, stockSymbol);
        const portfolioAmount = portfolio.total_amount

        console.log("asset amount: ", assetAmount);
        console.log("portfolio amount: ", portfolioAmount.total_amount);
        if (assetAmount !== portfolioAmount.total_amount) {
            console.warn(`⚠️ Inconsistency detected for ${stockSymbol}: Assets = ${assetAmount}, Portfolio = ${portfolioAmount}`);
            return res.status(400).json({ error: 'Inconsistency detected for user asstes and portfoilio.'})
          }
    }
    
    console.log(`🔍 Pre-Trade Check - ${type.toUpperCase()} ${parsedAmount} ${stockSymbol} @ ${parsedPrice}`);
    
    if (type === 'buy') {
      const balance = await User.getBalance(userId);
      if (balance < cost) {
        return res.status(400).json({ error: 'Insufficient funds for this trade.' });
      }
    } else if (type === 'sell') {
      const userAssetAmount = await UserAssets.getAssetAmount(userId, stockSymbol);
      if (userAssetAmount === null || userAssetAmount < parsedAmount) {
        return res.status(400).json({ error: `Not enough ${stockSymbol} to sell.` });
      }
    }

    const tradeTask = await UserTask.getLatestTradeTask(userId);
    // const newProgress = 0;
    
    let newProgress = 0;

    if (tradeTask) {
      const match = tradeTask.task_name.match(/\d+/); // Extract N from "Make N Trades"
      if (match) {
        const totalRequiredTrades = parseInt(match[0]); // Extract N
        const progressIncrease = 100 / totalRequiredTrades; // Each trade contributes to progress

        console.log(`📈 Current Task: ${tradeTask.task_name}`);
        console.log(`🔹 Each trade adds ${progressIncrease.toFixed(2)}% progress.`);


        newProgress = tradeTask.progress + progressIncrease;

      }
    } else {
      console.warn(`⚠️ No active trade-related task found for user ${userId}`);
    }

    console.log("calculated new progress = ", newProgress)




    // Store trade data for use in next middleware
    res.locals.tradeData = { userId, stockSymbol, parsedAmount, parsedPrice, cost, type, newProgress };
    next();
  } catch (error) {
    console.error('❌ Pre-Trade Check Error:', error.message);
    res.status(500).json({ error: 'Trade validation failed.' });
  }
};
const postTradeUpdate = async (req, res) => {
  try {
    const { userId, stockSymbol, parsedAmount, parsedPrice, type } = res.locals.tradeData;
    const trade = res.locals.trade;

    console.log(`🔄 Processing post-trade update for ${stockSymbol} - Type: ${type}`);

    // Update or create portfolio entry
    await UserPortfolio.updatePortfolioOnTrade(userId, stockSymbol, type, parsedAmount, parsedPrice);

    console.log(`✅ Portfolio successfully updated for ${stockSymbol}`);

    const tasks = await UserTask.getIncompleteUserTasks(userId);
    const tradeTask = tasks.find(task => /^Make (\d+) Trades$/i.test(task.task_name));

    if (tradeTask) {
      const match = tradeTask.task_name.match(/^Make (\d+) Trades$/i);
      if (match) {
        const totalRequiredTrades = parseInt(match[1]); // Extracts N from "Make N Trades"
        const progressIncrease = 100 / totalRequiredTrades; // Calculate progress per trade

        console.log(`📈 Updating task progress for: ${tradeTask.task_name}`);
        console.log(`📝 Task requires ${totalRequiredTrades} trades. Each trade adds ${progressIncrease.toFixed(2)}% progress.`);

        await UserTask.updateProgress(userId, tradeTask.task_name, tradeTask.progress + progressIncrease);
      }
    }

    res.status(201).json({ msg: 'Trade completed successfully', trade });

  } catch (error) {
    console.error('❌ Error updating portfolio:', error.message);
    res.status(500).json({ error: 'Trade executed, but post-processing failed.' });
  }
};

module.exports = { trackTrade, afterBuyStock, preTradeCheck, postTradeUpdate };
