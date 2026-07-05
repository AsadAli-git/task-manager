const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// Public routes (no auth required — BUG: tasks should be protected)
router.get('/', getAllTasks);
router.get('/my', getMyTasks);
router.get('/:id', getTaskById);

// Protected routes
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
