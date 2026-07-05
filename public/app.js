// ── Config ────────────────────────────────────────────────────────────────────
const API = 'http://localhost:3000/api';

// ── State ─────────────────────────────────────────────────────────────────────
let state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  tasks: [],
  currentView: 'all',
  editingId: null,
};

// ── API Helpers ───────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
async function login(email, password) {
  const data = await apiFetch('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  state.token = data.token;
  // BUG: user info not returned from login endpoint — faking it from email
  state.user = { email };
  localStorage.setItem('token', state.token);
  localStorage.setItem('user', JSON.stringify(state.user));
  return data;
}

async function register(name, email, password) {
  const data = await apiFetch('/users/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  state.token = data.token;
  state.user = data.data;
  localStorage.setItem('token', state.token);
  localStorage.setItem('user', JSON.stringify(state.user));
  return data;
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showAuthScreen();
}

// ── Tasks API ─────────────────────────────────────────────────────────────────
async function fetchTasks(view) {
  if (view === 'my') {
    return apiFetch('/tasks/my');
  }
  if (['pending', 'in-progress', 'completed'].includes(view)) {
    return apiFetch(`/tasks?status=${view}`);
  }
  return apiFetch('/tasks');
}

async function createTask(payload) {
  return apiFetch('/tasks', { method: 'POST', body: JSON.stringify(payload) });
}

async function updateTask(id, payload) {
  return apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

async function deleteTask(id) {
  return apiFetch(`/tasks/${id}`, { method: 'DELETE' });
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderTasks(tasks) {
  const list = document.getElementById('task-list');
  document.getElementById('task-count').textContent = tasks.length;

  if (!tasks.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No tasks here</h3>
        <p>Create a new task to get started.</p>
      </div>`;
    return;
  }

  list.innerHTML = tasks.map(task => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
    const dueDateStr = task.dueDate
      ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">
           ${isOverdue ? '⚠ ' : ''}Due ${new Date(task.dueDate).toLocaleDateString()}
         </span>`
      : '';

    return `
      <div class="task-card ${task.status === 'completed' ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-check ${task.status === 'completed' ? 'done' : ''}"
             onclick="toggleComplete('${task.id}', '${task.status}')">
          ${task.status === 'completed' ? '✓' : ''}
        </div>
        <div class="task-body">
          <div class="task-title">${escapeHtml(task.title)}</div>
          ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
          <div class="task-meta">
            <span class="pill ${task.priority}">${task.priority}</span>
            <span class="pill ${task.status}">${task.status}</span>
            ${dueDateStr}
          </div>
        </div>
        <div class="task-actions">
          <button class="icon-btn" onclick="openEditModal('${task.id}')" title="Edit">✏️</button>
          <button class="icon-btn delete" onclick="handleDelete('${task.id}')" title="Delete">🗑</button>
        </div>
      </div>`;
  }).join('');
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function loadView(view) {
  state.currentView = view;

  const titles = {
    all: 'All Tasks', my: 'My Tasks',
    pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed',
  };
  document.getElementById('view-title').textContent = titles[view] || 'Tasks';
  document.getElementById('task-list').innerHTML = '<div class="loading">Loading...</div>';

  try {
    const res = await fetchTasks(view);
    state.tasks = res.data || [];
    applyFilters();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function applyFilters() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const priority = document.getElementById('priority-filter').value;

  let filtered = state.tasks;
  if (search) filtered = filtered.filter(t =>
    t.title.toLowerCase().includes(search) ||
    (t.description || '').toLowerCase().includes(search)
  );
  if (priority) filtered = filtered.filter(t => t.priority === priority);
  renderTasks(filtered);
}

async function toggleComplete(id, currentStatus) {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  try {
    const task = state.tasks.find(t => t.id === id);
    await updateTask(id, { ...task, status: newStatus });
    await loadView(state.currentView);
    showToast(newStatus === 'completed' ? 'Task completed!' : 'Marked as pending', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this task?')) return;
  try {
    await deleteTask(id);
    await loadView(state.currentView);
    showToast('Task deleted', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openEditModal(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  state.editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Task';
  document.getElementById('task-id').value = task.id;
  document.getElementById('task-title').value = task.title;
  document.getElementById('task-desc').value = task.description || '';
  document.getElementById('task-priority').value = task.priority;
  document.getElementById('task-status').value = task.status;
  document.getElementById('task-due').value = task.dueDate ? task.dueDate.split('T')[0] : '';
  document.getElementById('task-modal').classList.remove('hidden');
}

function openNewModal() {
  state.editingId = null;
  document.getElementById('modal-title').textContent = 'New Task';
  document.getElementById('task-form').reset();
  document.getElementById('task-id').value = '';
  document.getElementById('task-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('task-error').classList.add('hidden');
}

// ── Screens ───────────────────────────────────────────────────────────────────
function showAuthScreen() {
  document.getElementById('auth-screen').classList.add('active');
  document.getElementById('dashboard-screen').classList.remove('active');
}

function showDashboard() {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('dashboard-screen').classList.add('active');
  document.getElementById('user-info').textContent = state.user?.name || state.user?.email || 'User';
  loadView('all');
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  // BUG: incomplete — misses quotes and other HTML entities
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let toastTimer;
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ── Event Listeners ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Tab switching on auth screen
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
    });
  });

  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    try {
      errEl.classList.add('hidden');
      await login(email, password);
      showDashboard();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });

  // Register form
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errEl = document.getElementById('register-error');
    try {
      errEl.classList.add('hidden');
      await register(name, email, password);
      showDashboard();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });

  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      loadView(item.dataset.view);
    });
  });

  // New task button
  document.getElementById('new-task-btn').addEventListener('click', openNewModal);

  // Task form submit (create or update)
  document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('task-error');
    const payload = {
      title: document.getElementById('task-title').value,
      description: document.getElementById('task-desc').value,
      priority: document.getElementById('task-priority').value,
      status: document.getElementById('task-status').value,
      dueDate: document.getElementById('task-due').value || null,
    };

    try {
      errEl.classList.add('hidden');
      if (state.editingId) {
        await updateTask(state.editingId, payload);
        showToast('Task updated', 'success');
      } else {
        await createTask(payload);
        showToast('Task created', 'success');
      }
      closeModal();
      await loadView(state.currentView);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });

  // Close modal buttons
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-task').addEventListener('click', closeModal);
  document.getElementById('task-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('task-modal')) closeModal();
  });

  // Search + filter
  document.getElementById('search-input').addEventListener('input', applyFilters);
  document.getElementById('priority-filter').addEventListener('change', applyFilters);

  // Logout
  document.getElementById('logout-btn').addEventListener('click', logout);

  // Auto-login if token exists
  if (state.token) {
    showDashboard();
  }
});
