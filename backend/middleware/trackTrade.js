const UserTask = require('../models/UserTask');
const User = require('../models/User'); // Ensure this model allows fetching the user's balance.
const UserAssets = require('../models/UserAssets');

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
      const totalCost = parseFloat((amount * price).toFixed(2));
      if (balance < totalCost) {
        console.log('❌ Insufficient Funds:', { balance, totalCost });
        return res.status(400).json({ error: 'Insufficient funds for this trade.' });
      }
    }

    if (type == 'sell'){
      const userAssetAmount = await UserAssets.getAssetAmount(userId, stockSymbol);
      if (userAssetAmount === null ||  userAssetAmount === undefined) {
        return res.status(500).json({ error: `Could not retrieve asset ${stockSymbol} for user.` });
      }
      if (amount > userAssetAmount) {
        console.log('❌ Insufficient Assets to Sell:', { userAssetAmount, amount })
        return res.status(400).json({ error: `not enough ${stockSymbol} to sell.` });

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

// In progress.js
module.exports = { trackTrade };
