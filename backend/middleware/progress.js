const UserTask = require('../models/UserTask');

const trackTradeProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all active tasks
    const tasks = await UserTask.getUserTasks(userId);

    // Find the latest trade-related task using regex to match "Make N Trades"
    const tradeTasks = tasks
      .filter(task => /^Make \d+ Trades$/i.test(task.task_name) && !task.completed) // Only incomplete tasks
      .sort((a, b) => b.created_at - a.created_at); // Sort by latest task

    const tradeTask = tradeTasks.length > 0 ? tradeTasks[0] : null; // Get the most recent task


    if (tradeTask && !tradeTask.completed) {
      // Always increment by 20% for each trade
      const progressIncrease = 20;

      // If the task is completed (100% progress), mark it as completed and create a new task
      if (tradeTask.progress + progressIncrease >= 100) {
        
        // Mark the task as completed
        await UserTask.updateProgress(userId, tradeTask.task_name, 100);

        // Create the next task with incremented trades
        const currentTradeGoal = parseInt(tradeTask.task_name.match(/\d+/)[0]);
        const newTradeGoal = currentTradeGoal + 5;
        const newTaskName = `Make ${newTradeGoal} Trades`;

        // Ensure we don't duplicate an already existing task
        const existingTasks = await UserTask.getUserTasks(userId);
        const duplicateTask = existingTasks.find(task => task.task_name === newTaskName);

        if (!duplicateTask) {
          await UserTask.createTask(userId, newTaskName);
        }
      } else {
        // Update task progress without marking it completed
        await UserTask.updateProgress(userId, tradeTask.task_name, tradeTask.progress + progressIncrease);
      }
    }

    next(); // Continue with the trade processing
  } catch (error) {
    console.error('❌ Error tracking trade progress:', error);
    next(); // Proceed even if tracking fails
  }
};

module.exports = { trackTradeProgress };
