import { useEffect, useState } from "react";
import { getSummary, getRecentTransactions } from "../services/api";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      const s = await getSummary();
      setSummary(s.data);
      const r = await getRecentTransactions({ limit: 8 });
      setRecent(r.data);
    })();
  }, []);

  if (!summary) return null;

  const Card = ({ title, value, sub }) => (
    <div className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>
      <div className="text-2xl font-semibold mt-1 text-slate-800 dark:text-slate-100">
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-2 text-slate-500 dark:text-slate-400">{sub}</div>
      )}
    </div>
  );

  const rupee = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <section className="max-w-7xl mx-auto p-6 space-y-8 animate-slide-up">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent mb-4">
        Overview
      </h1>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card title="Total Income" value={rupee(summary.totalIncome)} />
        <Card title="Total Expenses" value={rupee(summary.totalExpenses)} />
        <Card
          title="Balance"
          value={rupee(summary.balance)}
          sub={`${summary.transactionCount} transactions`}
        />
      </div>

      {/* Recent Transactions Table */}
      <div className="card rounded-xl mt-6 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900/50 transition-colors">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t, i) => (
              <tr
                key={t._id}
                className={`${
                  i % 2 === 0
                    ? "bg-slate-50 dark:bg-slate-900/60"
                    : "bg-white dark:bg-slate-800/50"
                } border-b border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition`}
              >
                <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                  {new Date(t.date).toLocaleDateString()}
                </td>
                <td
                  className={`px-6 py-3 font-medium ${
                    t.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {t.type}
                </td>
                <td className="px-6 py-3 text-slate-700 dark:text-slate-300">
                  {t.category}
                </td>
                <td
                  className={`px-6 py-3 ${
                    t.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}{" "}
                  {rupee(Math.abs(t.amount))}
                </td>
                <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                  {t.description || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
