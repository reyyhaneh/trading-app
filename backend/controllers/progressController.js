const User = require('../models/User');
const UserTask = require('../models/UserTask');

exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await UserTask.getFormattedTasks(userId);
    res.json( {tasks} );
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addTask = async (req, res) => {
  try {
    const { taskName } = req.body;
    const userId = req.user.id;

    const newTask = await UserTask.createTask(userId, taskName);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateTaskProgress = async (req, res) => {
  try {
    const { taskName, progressIncrease } = req.body;
    const userId = req.user.id;

    const updatedTask = await UserTask.updateProgress(userId, taskName, progressIncrease);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.updateProgressOnTrade = async(req, res) => {
  const userId = req.user.id;

  const task = await UserTask.getUserCurrentTask(userId)
  

  



};
