// Reusable validation helpers used by controllers.
// All functions throw nothing — they return an error string or null.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_STATUSES = ['pending', 'in-progress', 'completed'];

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

function isValidUUID(id) {
  return typeof id === 'string' && UUID_RE.test(id);
}

// Accept both real UUIDs and the short seed IDs used in the in-memory store ('1', 'u1', etc.)
function isValidId(id) {
  return typeof id === 'string' && id.trim().length > 0;
}

function isValidISODate(value) {
  if (typeof value !== 'string') return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

// Returns an array of error strings (empty = valid).
function validateUserRegister({ name, email, password }) {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('name must be at least 2 characters');
  }
  if (name && name.trim().length > 100) {
    errors.push('name must be 100 characters or fewer');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('a valid email address is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('password is required');
  } else {
    if (password.length < 6) errors.push('password must be at least 6 characters');
    if (password.length > 128) errors.push('password must be 128 characters or fewer');
  }

  return errors;
}

function validateUserLogin({ email, password }) {
  const errors = [];
  if (!email || !isValidEmail(email)) errors.push('a valid email address is required');
  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.push('password is required');
  }
  return errors;
}

function validateTaskCreate({ title, description, priority, status, dueDate }) {
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title is required');
  } else {
    if (title.trim().length < 3) errors.push('title must be at least 3 characters');
    if (title.trim().length > 200) errors.push('title must be 200 characters or fewer');
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') errors.push('description must be a string');
    else if (description.length > 1000) errors.push('description must be 1000 characters or fewer');
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (dueDate !== undefined && dueDate !== null && !isValidISODate(dueDate)) {
    errors.push('dueDate must be a valid date string (e.g. 2024-12-31)');
  }

  return errors;
}

function validateTaskUpdate({ title, description, priority, status, dueDate }) {
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      errors.push('title cannot be empty');
    } else {
      if (title.trim().length < 3) errors.push('title must be at least 3 characters');
      if (title.trim().length > 200) errors.push('title must be 200 characters or fewer');
    }
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') errors.push('description must be a string');
    else if (description.length > 1000) errors.push('description must be 1000 characters or fewer');
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (dueDate !== undefined && dueDate !== null && !isValidISODate(dueDate)) {
    errors.push('dueDate must be a valid date string (e.g. 2024-12-31)');
  }

  return errors;
}

// Sends a 400 response with the errors array and returns true if there were errors.
// Usage: if (sendErrors(res, errors)) return;
function sendErrors(res, errors) {
  if (errors.length === 0) return false;
  res.status(400).json({ success: false, message: errors.join('; '), errors });
  return true;
}

module.exports = {
  isValidId,
  isValidEmail,
  isValidISODate,
  VALID_PRIORITIES,
  VALID_STATUSES,
  validateUserRegister,
  validateUserLogin,
  validateTaskCreate,
  validateTaskUpdate,
  sendErrors,
};
