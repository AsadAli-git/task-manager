const Task = require('../models/task');
const {
  isValidId,
  VALID_PRIORITIES,
  VALID_STATUSES,
  validateTaskCreate,
  validateTaskUpdate,
  sendErrors,
} = require('../middleware/validate');

const getAllTasks = (req, res) => {
  const { status, priority } = req.query;

  const errors = [];
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  if (sendErrors(res, errors)) return;

  let tasks = Task.getAll();

  if (status) {
    tasks = Task.filterByStatus(status); // BUG: filterByStatus ignores the filter
  }

  if (priority) {
    tasks = tasks.filter((t) => t.priority === priority);
  }

  res.json({ success: true, count: tasks.length, data: tasks });
};

const getTaskById = (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid task id' });
  }

  const task = Task.getById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.json({ success: true, data: task });
};

const createTask = (req, res) => {
  const { title, description, priority, status, dueDate } = req.body;

  const errors = validateTaskCreate({ title, description, priority, status, dueDate });
  if (sendErrors(res, errors)) return;

  try {
    // BUG: userId is hardcoded — should come from req.user (auth middleware)
    const task = Task.create({
      title: title.trim(),
      description: description ? description.trim() : undefined,
      priority,
      status,
      dueDate,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateTask = (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid task id' });
  }

  const task = Task.getById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const { title, description, priority, status, dueDate } = req.body;
  const errors = validateTaskUpdate({ title, description, priority, status, dueDate });
  if (sendErrors(res, errors)) return;

  // Only pass whitelisted fields to prevent arbitrary field injection
  const allowed = {};
  if (title !== undefined) allowed.title = title.trim();
  if (description !== undefined) allowed.description = description ? description.trim() : '';
  if (priority !== undefined) allowed.priority = priority;
  if (status !== undefined) allowed.status = status;
  if (dueDate !== undefined) allowed.dueDate = dueDate;

  const updated = Task.update(req.params.id, allowed);
  res.json({ success: true, data: updated });
};

const deleteTask = (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid task id' });
  }

  const deleted = Task.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.status(204).send();
};

const getMyTasks = (req, res) => {
  // BUG: hardcoded userId instead of using req.user
  const tasks = Task.getByUserId(req.user.id);
  res.json({ success: true, count: tasks.length, data: tasks });
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask, getMyTasks };
