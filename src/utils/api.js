import axios from 'axios';

// Set REACT_APP_API_URL in .env and .env.production
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ⚠️  No 401 handler here — AuthContext owns logout/redirect exclusively.
// Having two interceptors both react to 401 causes a race (logout fires
// AND window.location nukes the page at the same time).
api.interceptors.response.use(
  res => res,
  err => Promise.reject(err),
);

export const adminApi = {
  getDashboard:     ()                => api.get('/admin/dashboard'),
  getUsers:         ()                => api.get('/admin/users'),
  createUser:       (data)            => api.post('/admin/users', data),
  changeRole:       (id, role)        => api.patch(`/admin/users/${id}/role`, { role }),
  toggleStatus:     (id)              => api.patch(`/admin/users/${id}/toggle`),
  resetPassword:    (id, newPassword) => api.patch(`/admin/users/${id}/password`, { newPassword }),
  hardDelete:       (id)              => api.delete(`/admin/users/${id}`),
  getRevenueReport: ()                => api.get('/admin/reports/revenue'),
  getHealth:        ()                => api.get('/admin/health'),
};

export const aiApi = {
  chat:          (message, sessionId) => api.post('/ai/chat', { message, sessionId }),
  sessions:      ()                   => api.get('/ai/sessions'),
  getSession:    (id)                 => api.get(`/ai/sessions/${id}`),
  deleteSession: (id)                 => api.delete(`/ai/sessions/${id}`),
  insights:      ()                   => api.post('/ai/insights'),
  search:        (query)              => api.post('/ai/search', { query }),
  summary:       (period)             => api.get(`/ai/summary?period=${period}`),
};

export default api;