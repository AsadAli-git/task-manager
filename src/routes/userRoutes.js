const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  register,
  login,
  deleteUser,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/', protect, adminOnly, getAllUsers);
router.get('/:id', protect, getUserById);
router.delete('/:id', protect, deleteUser); // BUG: missing adminOnly middleware

module.exports = router;
