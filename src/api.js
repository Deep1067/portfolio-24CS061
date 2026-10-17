/**
 * api.js – Centralized API service with JWT Authentication for Practical 7
 * Student: Deep Patel (24CS061) | CSPIT, CHARUSAT
 */

export const BASE_URL = 'http://localhost:5000';

// Token Management Helpers (Supplementary Problem)
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

// Auth Headers Helper
const getAuthHeaders = () => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// 1. Register User (POST /register)
export const register = async (email, password, name) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Registration failed (HTTP ${res.status})`);
  }
  return data;
};

// 2. Login User (POST /login)
export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Login failed (HTTP ${res.status})`);
  }
  if (data.token) {
    setToken(data.token);
  }
  return data;
};

// 3. Logout User
export const logout = () => {
  removeToken();
};

// 4. Get Current User Profile (GET /me – Supplementary Problem)
export const getMe = async () => {
  const res = await fetch(`${BASE_URL}/me`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
    }
    throw new Error(data.message || `Failed to fetch profile (HTTP ${res.status})`);
  }
  return data;
};

// 5. Protected Task CRUD operations
export const getTasks = async (query = '') => {
  const url = query ? `${BASE_URL}/tasks?${query}` : `${BASE_URL}/tasks`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
    }
    throw new Error(data.message || `Failed to fetch tasks (HTTP ${res.status})`);
  }
  return data;
};

export const getTaskById = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
    }
    throw new Error(data.message || `Failed to fetch task ${id}`);
  }
  return data;
};

export const createTask = async (taskData) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
    }
    throw new Error(data.message || `Failed to create task (HTTP ${res.status})`);
  }
  return data;
};

export const updateTask = async (id, updateData) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
    }
    throw new Error(data.message || `Failed to update task (HTTP ${res.status})`);
  }
  return data;
};

export const deleteTask = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
    }
    throw new Error(data.message || `Failed to delete task (HTTP ${res.status})`);
  }
  return data;
};

const api = {
  BASE_URL,
  getToken,
  setToken,
  removeToken,
  register,
  login,
  logout,
  getMe,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

export default api;
