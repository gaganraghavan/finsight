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
    <div className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800">
      <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub && <div className="text-xs mt-2 text-slate-500">{sub}</div>}
    </div>
  );

  const rupee = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  return (
    <section className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card title="Total Income" value={rupee(summary.totalIncome)} />
        <Card title="Total Expenses" value={rupee(summary.totalExpenses)} />
        <Card title="Balance" value={rupee(summary.balance)} sub={`${summary.transactionCount} transactions`} />
      </div>

      <div className="rounded-2xl border border-slate-200/40 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm bg-white/60 dark:bg-slate-900/60">
          <thead className="text-left border-b border-slate-200/40 dark:border-slate-800">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t) => (
              <tr key={t._id} className="border-b border-slate-100/40 dark:border-slate-800/60">
                <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-3">{t.type}</td>
                <td className="p-3">{t.category}</td>
                <td className="p-3">{rupee(t.amount)}</td>
                <td className="p-3">{t.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
