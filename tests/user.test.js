const User = require('../src/models/user');

describe('User Model', () => {
  test('getAll does not expose passwords', () => {
    const users = User.getAll();
    users.forEach((u) => {
      expect(u.password).toBeUndefined();
    });
  });

  test('getById returns user without password', () => {
    const user = User.getById('u1');
    expect(user).toBeDefined();
    expect(user.password).toBeUndefined();
    expect(user.name).toBe('Alice Johnson');
  });

  test('getByEmail returns user with password for auth', () => {
    const user = User.getByEmail('alice@example.com');
    expect(user).toBeDefined();
    expect(user.password).toBeDefined();
  });

  test('create registers a new user', async () => {
    const user = await User.create({
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: 'testpass',
    });
    expect(user).not.toBeNull();
    expect(user.email).toBe('charlie@example.com');
    expect(user.password).toBeUndefined();
  });

  test('create rejects duplicate email', async () => {
    const user = await User.create({
      name: 'Duplicate',
      email: 'alice@example.com',
      password: 'anything',
    });
    expect(user).toBeNull();
  });

  test('verifyPassword returns true for correct password', async () => {
    const user = User.getByEmail('alice@example.com');
    const valid = await User.verifyPassword('password123', user.password);
    expect(valid).toBe(true);
  });

  test('verifyPassword returns false for wrong password', async () => {
    const user = User.getByEmail('alice@example.com');
    const valid = await User.verifyPassword('wrongpass', user.password);
    expect(valid).toBe(false);
  });
});
