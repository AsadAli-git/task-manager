// Utility functions used across the app

const paginate = (array, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: array.slice(start, end),
    total: array.length,
    page,
    totalPages: Math.ceil(array.length / limit),
    hasNext: end < array.length,
    hasPrev: page > 1,
  };
};

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+\s+on\w+\s*=\s*(['"]?).*?\1[^>]*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/<[^>]+>/g, '');
};

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 10);
};

const sortByField = (array, field, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
    if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

module.exports = { paginate, sanitizeInput, isValidEmail, formatDate, sortByField };
