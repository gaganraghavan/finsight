import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const register = (name, email, password) => 
  api.post('/auth/register', { name, email, password });

export const getCurrentUser = () => 
  api.get('/auth/me');

// ==================== TRANSACTIONS ====================
export const getTransactions = (filters) => 
  api.get('/transactions', { params: filters });

export const getTransaction = (id) => 
  api.get(`/transactions/${id}`);

export const createTransaction = (data) => 
  api.post('/transactions', data);

export const updateTransaction = (id, data) => 
  api.put(`/transactions/${id}`, data);

export const deleteTransaction = (id) => 
  api.delete(`/transactions/${id}`);

export const bulkDeleteTransactions = (ids) => 
  api.post('/transactions/bulk-delete', { ids });

// ==================== BUDGETS ====================
export const getBudgets = () => 
  api.get('/budgets');

export const getBudget = (id) => 
  api.get(`/budgets/${id}`);

export const createBudget = (data) => 
  api.post('/budgets', data);

export const updateBudget = (id, data) => 
  api.put(`/budgets/${id}`, data);

export const deleteBudget = (id) => 
  api.delete(`/budgets/${id}`);

export const checkBudgetAlerts = () => 
  api.get('/budgets/alerts/check');

// ==================== RECURRING ====================
export const getRecurringTransactions = (isActive) => 
  api.get('/recurring', { params: { isActive } });

export const getRecurringTransaction = (id) => 
  api.get(`/recurring/${id}`);

export const createRecurring = (data) => 
  api.post('/recurring', data);

export const updateRecurring = (id, data) => 
  api.put(`/recurring/${id}`, data);

export const deleteRecurring = (id) => 
  api.delete(`/recurring/${id}`);

export const toggleRecurring = (id) => 
  api.patch(`/recurring/${id}/toggle`);

export const getUpcomingRecurring = (days) => 
  api.get('/recurring/upcoming/list', { params: { days } });

// ==================== DASHBOARD ====================
export const getSummary = (filters) => 
  api.get('/dashboard/summary', { params: filters });

export const getCategoryBreakdown = (filters) => 
  api.get('/dashboard/category-breakdown', { params: filters });

export const getMonthlyTrends = (months) => 
  api.get('/dashboard/monthly-trends', { params: { months } });

export const getRecentTransactions = (limit) => 
  api.get('/dashboard/recent', { params: { limit } });

export const getTopCategories = (params) => 
  api.get('/dashboard/top-categories', { params });

export const exportCSV = (filters) => 
  api.get('/dashboard/export/csv', { params: filters, responseType: 'blob' });

// ==================== CATEGORIES ====================
export const getCategories = (type) => 
  api.get('/categories', { params: { type } });

export const getCategory = (id) => 
  api.get(`/categories/${id}`);

export const createCategory = (data) => 
  api.post('/categories', data);

export const updateCategory = (id, data) => 
  api.put(`/categories/${id}`, data);

export const deleteCategory = (id) => 
  api.delete(`/categories/${id}`);

export default api;