const pool = require('../config/db');

class UserTask {
  static async getUserTasks(userId) {
    const query = 'SELECT * FROM user_tasks WHERE user_id = $1';
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

  static async updateProgress(userId, taskName, progressIncrease) {
    const query = `
      UPDATE user_tasks
      SET progress = progress + $1, 
          completed = CASE WHEN progress + $1 >= 100 THEN TRUE ELSE completed END,
          updated_at = NOW()
      WHERE user_id = $2 AND task_name = $3
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [progressIncrease, userId, taskName]);
    const updatedTask = rows[0];

    // If task is completed, assign a new task dynamically
    if (updatedTask && updatedTask.completed) {
      console.log(`🎉 Task Completed: ${updatedTask.task_name}`);
      
      // If it's a "Make X Trades" task, create a harder task (e.g., "Make 10 Trades")
      const tradeCountMatch = updatedTask.task_name.match(/\d+/);
      if (tradeCountMatch) {
        const nextTradeCount = parseInt(tradeCountMatch[0]) + 5;
        const newTaskName = `Make ${nextTradeCount} Trades`;

        await UserTask.createTask(userId, newTaskName);
        console.log(`🔥 New Task Assigned: ${newTaskName}`);
      }
    }

    return updatedTask;
  }
}

module.exports = UserTask;
