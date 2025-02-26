const pool = require('../config/db');

class UserTask {
  static async getUserTasks(userId) {
    const query = `
      SELECT * FROM user_tasks 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
  

  static async createTask(userId, taskName) {
    const query = `
      INSERT INTO user_tasks (user_id, task_name)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, taskName]);
    return rows[0];
  }
  static async updateProgress(userId, taskName, newProgress) {
    const query = `
      UPDATE user_tasks
      SET progress = LEAST($1, 100),  -- Set new progress, ensuring it does not exceed 100%
          completed = CASE WHEN $1 >= 100 THEN TRUE ELSE completed END,
          updated_at = NOW()
      WHERE user_id = $2 AND task_name = $3 AND completed = FALSE
      RETURNING *;
    `;
  
    const { rows } = await pool.query(query, [newProgress, userId, taskName]);
    const updatedTask = rows[0];
  
    // If task is completed, assign a new task dynamically
    if (updatedTask && updatedTask.completed) {
      console.log(`🎉 Task Completed: ${updatedTask.task_name}`);
  
      const tradeCountMatch = updatedTask.task_name.match(/\d+/);
      if (tradeCountMatch) {
        const nextTradeCount = parseInt(tradeCountMatch[0]) + 5;
        const newTaskName = `Make ${nextTradeCount} Trades`;
  
        // Ensure we don't duplicate an already existing task
        const existingTasks = await UserTask.getUserTasks(userId);
        const duplicateTask = existingTasks.find(task => task.task_name === newTaskName);
  
        if (!duplicateTask) {
          await UserTask.createTask(userId, newTaskName);
          console.log(`🔥 New Task Assigned: ${newTaskName}`);
        }
      }
    }
  
    return updatedTask;
  }
    
}

module.exports = UserTask;
