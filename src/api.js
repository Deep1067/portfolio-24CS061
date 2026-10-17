/**
 * api.js – Centralized API service for Practical 6
 * Student: Deep Patel (24CS061) | CSPIT, CHARUSAT
 *
 * Provides reusable client-side CRUD methods communicating with the Express/MongoDB backend.
 */

export const BASE_URL = 'http://localhost:5000';

export const getTasks = async (query = '') => {
  const url = query ? `${BASE_URL}/tasks?${query}` : `${BASE_URL}/tasks`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch tasks (HTTP ${res.status})`);
  }
  return data;
};

export const getTaskById = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch task ${id}`);
  }
  return data;
};

export const createTask = async (taskData) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to create task (HTTP ${res.status})`);
  }
  return data;
};

export const updateTask = async (id, updateData) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to update task (HTTP ${res.status})`);
  }
  return data;
};

export const deleteTask = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to delete task (HTTP ${res.status})`);
  }
  return data;
};

const api = {
  BASE_URL,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

export default api;
