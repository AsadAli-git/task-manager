const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// In-memory store (simulates a database)
let users = [
  {
    id: 'u1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    // password: "password123" hashed
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    role: 'admin',
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    // password: "mypassword" hashed
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'user',
    createdAt: '2024-01-02T08:00:00Z',
  },
];

const User = {
  getAll: () => users.map(({ password, ...u }) => u),

  getById: (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  },

  getByEmail: (email) => users.find((u) => u.email === email),

  create: async (data) => {
    const existing = users.find((u) => u.email === data.email);
    if (existing) return null;

    const hashed = await bcrypt.hash(data.password, 10);
    const newUser = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role || 'user',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    const { password, ...safe } = newUser;
    return safe;
  },

  verifyPassword: async (plaintext, hashed) => {
    return bcrypt.compare(plaintext, hashed);
  },

  delete: (id) => {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  },
};

module.exports = User;
