import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const ticketsAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.patch(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  search: (params) => api.get('/tickets/search', { params }),
};

export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getInsights: () => api.get('/analytics/insights'),
};

export const aiAPI = {
  generateSummary: (id) => api.post(`/ai/summary/${id}`),
  getPatterns: () => api.get('/ai/patterns'),
};

export default api;
