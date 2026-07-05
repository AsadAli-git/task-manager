const User = require('../models/user');
const jwt = require('jsonwebtoken');
const {
  isValidId,
  validateUserRegister,
  validateUserLogin,
  sendErrors,
} = require('../middleware/validate');

// BUG: secret is hardcoded in source — should be process.env.JWT_SECRET
const JWT_SECRET = 'supersecretkey123';
const JWT_EXPIRES = '7d';

const getAllUsers = (req, res) => {
  const users = User.getAll();
  res.json({ success: true, count: users.length, data: users });
};

const getUserById = (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }

  const user = User.getById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: user });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = validateUserRegister({ name, email, password });
  if (sendErrors(res, errors)) return;

  const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password });
  if (!user) {
    return res.status(409).json({ success: false, message: 'Email already exists' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });

  res.status(201).json({ success: true, token, data: user });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const errors = validateUserLogin({ email, password });
  if (sendErrors(res, errors)) return;

  const user = User.getByEmail(email.trim().toLowerCase());
  const valid = user && await User.verifyPassword(password, user.password);
  if (!user || !valid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });

  res.json({ success: true, token });
};

const deleteUser = (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }

  const isAdmin = req.user && req.user.role === 'admin';
  const isSelf = req.user && req.user.id === req.params.id;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ success: false, message: 'Forbidden: you can only delete your own account' });
  }

  const deleted = User.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, message: 'User deleted' });
};

module.exports = { getAllUsers, getUserById, register, login, deleteUser };
