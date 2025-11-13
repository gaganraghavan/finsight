import { useEffect, useState } from "react";
import {
  listBudgets,
  createBudget,
  deleteBudget,
  checkBudgetAlerts,
  listCategories,
} from "../services/api";
import {
  AlertTriangle,
  Plus,
  Trash2,
  PieChart,
} from "lucide-react";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: "",
    limit: "",
    period: "monthly",
  });

  // ✅ Load data from backend
  const load = async () => {
    try {
      const [b, a, cats] = await Promise.all([
        listBudgets(),
        checkBudgetAlerts(),
        listCategories(),
      ]);
      setBudgets(b.data);
      setAlerts(a.data || []);
      setCategories(cats.data || []);
    } catch (err) {
      console.error("Error loading budgets:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ Submit handler
  const submit = async (e) => {
    e.preventDefault();
    try {
      await createBudget({
        category: form.category,
        limit: Number(form.limit),
        period: form.period,
      });
      setForm({ category: "", limit: "", period: "monthly" });
      load();
    } catch (err) {
      console.error("Error creating budget:", err);
    }
  };

  // ✅ Dynamic progress color utilities
  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "from-danger-500 to-danger-600";
    if (percentage >= 70) return "from-warning-500 to-warning-600";
    return "from-success-500 to-success-600";
  };

  const getProgressBg = (percentage) => {
    if (percentage >= 90) return "bg-danger-500/10 border-danger-500/20";
    if (percentage >= 70) return "bg-warning-500/10 border-warning-500/20";
    return "bg-success-500/10 border-success-500/20";
  };

  return (
    <section className="max-w-7xl mx-auto p-6 space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent mb-2">
            Budget Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track and control your spending limits
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-xl shadow-primary-500/30 animate-float">
          <PieChart className="w-8 h-8" />
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="card bg-warning-100/30 border border-warning-400 dark:bg-warning-900/20 dark:border-warning-700 p-4 rounded-xl">
          <h3 className="text-lg font-bold text-warning-700 dark:text-warning-300 mb-2">
            Budget Alerts
          </h3>
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-3 text-sm mb-2">
              <AlertTriangle className="w-4 h-4 text-warning-600" />
              <span>
                <strong>{a.category}</strong>: You've used ₹
                {a.spent.toLocaleString()} / ₹{a.limit.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Create Form */}
      <form onSubmit={submit} className="card-gradient p-4 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <Plus className="w-5 h-5 text-success-600" />
          <h2 className="text-xl font-bold">Create New Budget</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {/* ✅ Filter only expense categories */}
          <select
            className="input"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories
              .filter((c) => c.type === "expense") // ✅ Show only expense types
              .map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
          </select>

          <input
            className="input"
            type="number"
            required
            placeholder="Budget Limit"
            value={form.limit}
            onChange={(e) => setForm({ ...form, limit: e.target.value })}
          />

          <select
            className="input"
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
          </select>

          <button className="btn-success">Create Budget</button>
        </div>
      </form>

      {/* Budget List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b) => {
          const percentage = Math.min(100, Math.round(b.percent || 0));
          return (
            <div
              key={b._id}
              className={`card border-2 ${getProgressBg(percentage)}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold">{b.category}</h3>
                <button
                  type="button"
                  className="text-danger-600 hover:text-danger-700 transition"
                  onClick={async () => {
                    await deleteBudget(b._id);
                    load();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                ₹{(b.spent || 0).toLocaleString()} / ₹
                {(b.limit || 0).toLocaleString()}
              </p>

              <div className="relative h-3 bg-slate-300/40 rounded-full mt-3">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(
                    percentage
                  )}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-sm mt-2">{percentage}% used</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
