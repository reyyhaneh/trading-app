const UserTask = require('../models/UserTask');

const trackTradeProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all active tasks
    const tasks = await UserTask.getUserTasks(userId);

    // Find the **latest** trade-related task using regex to match "Make N Trades"
    const tradeTasks = tasks
      .filter(task => /^Make \d+ Trades$/i.test(task.task_name)) // Only consider tasks like "Make 5 Trades"
      .sort((a, b) => b.created_at - a.created_at); // Sort by latest task

    const tradeTask = tradeTasks.length > 0 ? tradeTasks[0] : null; // Get the most recent task

    console.log("🎯 Latest Trade Task:", tradeTask);

    if (tradeTask && !tradeTask.completed) {
      // Update task progress
      const updatedProgress = Math.min(tradeTask.progress + 20, 100);
      await UserTask.updateProgress(userId, tradeTask.task_name, updatedProgress);

      console.log(`📈 Progress updated for ${tradeTask.task_name}: ${updatedProgress}%`);

      // If task is completed, assign a new one
      if (updatedProgress >= 100) {
        console.log(`🎉 User ${userId} completed: ${tradeTask.task_name}`);
        
        // Extract the current number of trades (e.g., "Make 5 Trades" -> 5)
        const currentTradeGoal = parseInt(tradeTask.task_name.match(/\d+/)[0]);

        // Assign the next level task (incrementing by 5)
        const newTradeGoal = currentTradeGoal + 5;
        const newTaskName = `Make ${newTradeGoal} Trades`;

        console.log(`🆕 Assigning new task: ${newTaskName}`);
        await UserTask.createTask(userId, newTaskName);
      }
    }

    next(); // Continue with the trade processing
  } catch (error) {
    console.error('❌ Error tracking trade progress:', error);
    next(); // Proceed even if tracking fails
  }
};

module.exports = { trackTradeProgress };
