import { useEffect, useState } from "react";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  listCategories,
} from "../services/api";
import { Plus, Edit2, Trash2, DollarSign, Calendar, Tag, FileText, TrendingUp, TrendingDown, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [collapsedMonths, setCollapsedMonths] = useState(new Set());
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const load = async () => {
    const [tRes, cRes] = await Promise.all([
      listTransactions(),
      listCategories({ type: form.type }),
    ]);
    setItems(tRes.data);
    setCategories(cRes.data);
  };

  useEffect(() => { load(); }, []);
  
  useEffect(() => {
    (async () => {
      const cRes = await listCategories({ type: form.type });
      setCategories(cRes.data);
    })();
  }, [form.type]);

  const submit = async (e) => {
    e.preventDefault();
    if (form._id) {
      await updateTransaction(form._id, form);
    } else {
      await createTransaction(form);
    }
    setForm({ type: "expense", amount: "", category: "", description: "", date: new Date().toISOString().slice(0, 10) });
    load();
  };

  const edit = (t) => setForm({
    _id: t._id,
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description || "",
    date: t.date?.slice(0, 10),
  });

  const rupee = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Group transactions by month
  const groupByMonth = (transactions) => {
    const groups = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = {
          transactions: [],
          totalIncome: 0,
          totalExpense: 0,
          date: date
        };
      }
      
      groups[monthYear].transactions.push(transaction);
      if (transaction.type === 'income') {
        groups[monthYear].totalIncome += transaction.amount;
      } else {
        groups[monthYear].totalExpense += transaction.amount;
      }
    });
    
    // Sort by date (newest first)
    return Object.entries(groups).sort((a, b) => b[1].date - a[1].date);
  };

  const groupedTransactions = groupByMonth(filteredItems);

  const toggleMonth = (monthYear) => {
    setCollapsedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monthYear)) {
        newSet.delete(monthYear);
      } else {
        newSet.add(monthYear);
      }
      return newSet;
    });
  };

  return (
    <section className="max-w-7xl mx-auto p-6 space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent mb-2">
            Transactions
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your income and expenses</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      <form onSubmit={submit} className="card-gradient">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30">
            <Plus className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">
            {form._id ? "Edit Transaction" : "Add New Transaction"}
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {/* Type Select */}
          <div className="relative">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="input pl-12 appearance-none cursor-pointer"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            {form.type === "income" ? (
              <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success-600" />
            ) : (
              <TrendingDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-danger-600" />
            )}
          </div>

          {/* Amount Input */}
          <div className="relative">
            <input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: +e.target.value })}
              className="input pl-12"
              required
            />
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
          </div>

          {/* Category Select */}
          <div className="relative">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input pl-12 appearance-none cursor-pointer"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-600" />
          </div>

          {/* Description Input */}
          <div className="relative">
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              className="input pl-12"
            />
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warning-600" />
          </div>

          {/* Date & Submit */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input pl-12"
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success-600" />
            </div>
            <button className={form._id ? "btn-secondary" : "btn-primary"}>
              {form._id ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </form>

      {/* Search and Filter */}
      <div className="card flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>

        <div className="flex gap-2 items-center">
          <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              filterType === "all"
                ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 hover:scale-105"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("income")}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              filterType === "income"
                ? "bg-gradient-to-r from-success-600 to-success-500 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 hover:scale-105"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilterType("expense")}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              filterType === "expense"
                ? "bg-gradient-to-r from-danger-600 to-danger-500 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 hover:scale-105"
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      {/* Grouped Transactions */}
      <div className="space-y-6">
        {groupedTransactions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-lg">No transactions found</p>
          </div>
        ) : (
          groupedTransactions.map(([monthYear, data]) => {
            const isCollapsed = collapsedMonths.has(monthYear);
            const netAmount = data.totalIncome - data.totalExpense;
            
            return (
              <div key={monthYear} className="card-gradient overflow-hidden">
                {/* Month Header */}
                <button
                  onClick={() => toggleMonth(monthYear)}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {monthYear}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {data.transactions.length} transaction{data.transactions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Income</p>
                          <p className="text-lg font-bold text-success-600">
                            +{rupee(data.totalIncome)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Expense</p>
                          <p className="text-lg font-bold text-danger-600">
                            -{rupee(data.totalExpense)}
                          </p>
                        </div>
                        <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Net</p>
                          <p className={`text-lg font-bold ${netAmount >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                            {netAmount >= 0 ? '+' : ''}{rupee(netAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {isCollapsed ? (
                      <ChevronDown className="w-6 h-6 text-slate-400" />
                    ) : (
                      <ChevronUp className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Transactions Table */}
                {!isCollapsed && (
                  <div className="overflow-x-auto border-t-2 border-slate-200/60 dark:border-slate-800/60">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-slate-100/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Date</th>
                          <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Type</th>
                          <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Category</th>
                          <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                          <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Description</th>
                          <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/60 dark:bg-slate-900/60">
                        {data.transactions.map((t, idx) => (
                          <tr key={t._id} className="table-row group border-t border-slate-100/40 dark:border-slate-800/60" style={{ animationDelay: `${idx * 30}ms` }}>
                            <td className="px-6 py-4 font-medium">
                              {new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`badge ${t.type === "income" ? "badge-income" : "badge-expense"}`}>
                                {t.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium">
                                {t.category}
                              </span>
                            </td>
                            <td className={`px-6 py-4 font-bold ${
                              t.type === "income" ? "text-success-600" : "text-danger-600"
                            }`}>
                              {t.type === "income" ? "+" : "-"}{rupee(t.amount)}
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                              {t.description || "-"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => edit(t)}
                                  className="p-2 rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 hover:scale-110 hover:shadow-lg transition-all duration-200"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    await deleteTransaction(t._id);
                                    load();
                                  }}
                                  className="p-2 rounded-lg bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300 hover:scale-110 hover:shadow-lg transition-all duration-200"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}