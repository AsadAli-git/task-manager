const { v4: uuidv4 } = require('uuid');

// In-memory store (simulates a database)
let tasks = [
  {
    id: '1',
    title: 'Set up project structure',
    description: 'Initialize the Node.js project with Express',
    status: 'completed',
    priority: 'high',
    userId: 'u1',
    createdAt: '2024-01-01T10:00:00Z',
    dueDate: '2024-01-05T00:00:00Z',
  },
  {
    id: '2',
    title: 'Write API documentation',
    description: 'Document all endpoints using Swagger',
    status: 'in-progress',
    priority: 'medium',
    userId: 'u1',
    createdAt: '2024-01-02T09:00:00Z',
    dueDate: '2024-01-10T00:00:00Z',
  },
  {
    id: '3',
    title: 'Add authentication',
    description: 'Implement JWT-based auth for all protected routes',
    status: 'pending',
    priority: 'high',
    userId: 'u2',
    createdAt: '2024-01-03T08:00:00Z',
    dueDate: '2024-01-08T00:00:00Z',
  },
];

const Task = {
  getAll: () => tasks,

  getById: (id) => tasks.find((t) => t.id === id),

  getByUserId: (userId) => tasks.filter((t) => t.userId === userId),

  create: (data) => {
    if (!data.title || data.title.trim() === '') {
      throw new Error('Title is required and cannot be empty');
    }
    const newTask = {
      id: uuidv4(),
      title: data.title,
      description: data.description || '',
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      userId: data.userId,
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate || null,
    };
    tasks.push(newTask);
    return newTask;
  },

  update: (id, data) => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...data, id };
    return tasks[index];
  },

  delete: (id) => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
  },

  filterByStatus: (status) => {
    return tasks.filter((t) => t.status === status);
  },
};

module.exports = Task;
