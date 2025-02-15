const UserTask = require('../models/UserTask');

const trackTradeProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("hello", userId)

    
    const tasks = await UserTask.getUserTasks(userId);

    // Find a trade-related task
    const tradeTask = tasks.find(task => task.task_name.toLowerCase().includes('trades'));

    if (tradeTask && !tradeTask.completed) {
      // Update the task progress
      await UserTask.updateProgress(userId, tradeTask.task_name, 20);

      // Check if task is completed
      if (tradeTask.progress + 20 >= 100) {
        console.log(`🎉 User ${userId} completed the task: ${tradeTask.task_name}`);

        // Assign a new task dynamically (e.g., "Make 10 Trades")
        await UserTask.createTask(userId, `Make ${parseInt(tradeTask.task_name.match(/\d+/)[0]) + 5} Trades`);
      }
    }

    next(); // Continue with the trade processing
  } catch (error) {
    console.error('Error tracking trade progress:', error);
    next(); // Proceed even if tracking fails
  }
};

module.exports = { trackTradeProgress };
