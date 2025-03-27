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


  static async getLatestTaskByType(userId, taskType='make_trades') {
    const query = `
      SELECT * FROM user_tasks
      WHERE user_id = $1 AND task_type = $2 AND completed = FALSE
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [userId, taskType]);
    return rows.length ? rows[0] : null;
  }

  static async createTask(userId, taskType, goal) {
    const query = `
      INSERT INTO user_tasks (user_id, task_type, goal)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, taskType, goal]);
    return rows[0];
  }

  static async updateProgressWithinClient(client, userId) {
    try {
      // 1. Fetch the latest incomplete task of type 'make_trades'
      const fetchQuery = `
        SELECT * FROM user_tasks
        WHERE user_id = $1 AND task_type = 'make_trades' AND completed = FALSE
        ORDER BY created_at DESC
        LIMIT 1;
      `;
  
      const { rows } = await client.query(fetchQuery, [userId]);
      if (!rows.length) {
        console.warn(`⚠️ No active make_trades task found for user ${userId}`);
        return null;
      }
  
      const task = rows[0];
      const { id, progress, goal } = task;
  
      const progressIncrement = 100 / goal;
      const newProgress = Math.min(progress + progressIncrement, 100);
      const completed = newProgress >= 100;
  
      // 2. Update the progress of the task
      const updateQuery = `
        UPDATE user_tasks
        SET progress = $1,
            completed = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING *;
      `;
  
      const { rows: [updatedTask] } = await client.query(updateQuery, [newProgress, completed, id]);
  
      console.log(`📈 Updated Task Progress: ${updatedTask.progress}%`);
  
      // 3. If task completed, assign next one
      if (updatedTask.completed) {
        const nextGoal = goal + 5;
  
        const existsQuery = `
          SELECT 1 FROM user_tasks
          WHERE user_id = $1 AND task_type = 'make_trades' AND goal = $2;
        `;
        const { rowCount } = await client.query(existsQuery, [userId, nextGoal]);
  
        if (rowCount === 0) {
          const insertQuery = `
            INSERT INTO user_tasks (user_id, task_type, goal)
            VALUES ($1, $2, $3);
          `;
          await client.query(insertQuery, [userId, 'make_trades', nextGoal]);
          console.log(`🆕 Assigned new task: Make ${nextGoal} Trades`);
        }
      }
  
      return updatedTask;
    } catch (error) {
      console.error('❌ Error updating task progress within client:', error.message);
      throw new Error('Failed to update task progress'); // This ensures transaction fails
    }
  }

  static formatTaskName(task) {
    switch (task.task_type) {
      case 'make_trades':
        return `Make ${task.goal} Trades`;
      case 'earn_score':
        return `Earn ${task.goal} Points`;
      case 'hold_asset':
        return `Hold ${task.goal} ${task.meta?.symbol || 'tokens'}`; // optional support for meta
      default:
        return `Complete task (${task.task_type})`;
    }
  }
  

  static async getFormattedTasks(userId, limit = 5) {
    const query = `
      SELECT * FROM user_tasks 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2;
    `;
  
    const { rows } = await pool.query(query, [userId, limit]);
  
    return rows.map(task => ({
      id: task.id,
      name: UserTask.formatTaskName(task),
      progress: task.progress,
      completed: task.completed,
      created_at: task.created_at,
      updated_at: task.updated_at,
    }));
  }
  
  
  


    
}

module.exports = UserTask;
