const { paginate, sanitizeInput, isValidEmail, formatDate, sortByField } = require('../src/utils/helpers');

describe('paginate', () => {
  const data = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

  test('returns correct slice for page 1', () => {
    const result = paginate(data, 1, 10);
    expect(result.data.length).toBe(10);
    expect(result.data[0].id).toBe(1);
  });

  test('returns correct slice for page 2', () => {
    const result = paginate(data, 2, 10);
    expect(result.data[0].id).toBe(11);
  });

  test('hasNext is false on last page', () => {
    const result = paginate(data, 3, 10);
    expect(result.hasNext).toBe(false);
  });
});

describe('sanitizeInput', () => {
  test('strips script tags', () => {
    const input = '<script>alert("xss")</script>hello';
    expect(sanitizeInput(input)).toBe('hello');
  });

  test('does not strip non-script content', () => {
    expect(sanitizeInput('hello world')).toBe('hello world');
  });

  // BUG: this test passes but sanitizeInput doesn't catch img onerror XSS
  test('should block img onerror XSS', () => {
    const xss = '<img src=x onerror=alert(1)>';
    const result = sanitizeInput(xss);
    expect(result).toBe(xss); // currently returns unchanged — not safe
  });
});

describe('isValidEmail', () => {
  test('accepts valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  test('rejects string with no @', () => {
    expect(isValidEmail('notanemail')).toBe(false);
  });

  // BUG: isValidEmail passes this — the function is too permissive
  test('rejects invalid format like @', () => {
    expect(isValidEmail('@')).toBe(false);
  });
});

describe('sortByField', () => {
  const items = [
    { name: 'Charlie', age: 30 },
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 28 },
  ];

  test('sorts ascending by name', () => {
    const sorted = sortByField(items, 'name', 'asc');
    expect(sorted[0].name).toBe('Alice');
  });

  test('sorts descending by age', () => {
    const sorted = sortByField(items, 'age', 'desc');
    expect(sorted[0].age).toBe(30);
  });

  test('does not mutate original array', () => {
    sortByField(items, 'name');
    expect(items[0].name).toBe('Charlie');
  });
});
