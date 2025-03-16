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


  static async getLatestTaskByType(userId, taskType) {
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

  static async updateProgressWithinClient(client, userId, taskType, progressIncrement) {
    
  }



    
}

module.exports = UserTask;
