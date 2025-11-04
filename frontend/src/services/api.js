import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ----- Auth -----
export const login = (email, password) =>
  API.post("/auth/login", { email, password });
export const signup = (name, email, password) =>
  API.post("/auth/register", { name, email, password });
export const me = () => API.get("/auth/me");

// ----- Dashboard -----
export const getSummary = (params) => API.get("/dashboard/summary", { params });
export const getCategoryBreakdown = (params) =>
  API.get("/dashboard/category-breakdown", { params });
export const getMonthlyTrends = (params) =>
  API.get("/dashboard/monthly-trends", { params });
export const getRecentTransactions = (params) =>
  API.get("/dashboard/recent", { params });

// ----- Transactions -----
export const listTransactions = (params) => API.get("/transactions", { params });
export const createTransaction = (data) => API.post("/transactions", data);
export const updateTransaction = (id, data) =>
  API.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) =>
  API.delete(`/transactions/${id}`);

// ----- Categories -----
export const listCategories = (params) =>
  API.get("/categories", { params });
export const createCategory = (data) => API.post("/categories", data);

// ----- Budgets -----
export const listBudgets = () => API.get("/budgets");
export const createBudget = (data) => API.post("/budgets", data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);
export const checkBudgetAlerts = () => API.get("/budgets/alerts/check");

// ----- Recurring -----
export const listRecurring = (params) => API.get("/recurring", { params });
export const createRecurring = (data) => API.post("/recurring", data);
export const toggleRecurring = (id) => API.patch(`/recurring/${id}/toggle`);

export default API;
