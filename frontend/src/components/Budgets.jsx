import { useEffect, useState } from "react";
import { listBudgets, createBudget, deleteBudget, checkBudgetAlerts, listCategories } from "../services/api";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: "", limit: "", period: "monthly" });

  const load = async () => {
    const [b, a, cats] = await Promise.all([
      listBudgets(),
      checkBudgetAlerts(),
      listCategories({ type: "expense" }),
    ]);
    setBudgets(b.data);
    setAlerts(a.data.alerts || []);
    setCategories(cats.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await createBudget(form);
    setForm({ category: "", limit: "", period: "monthly" });
    load();
  };

  return (
    <section className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Budgets</h1>

      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300/50">
          <div className="font-medium mb-2">Alerts</div>
          <ul className="list-disc pl-5">
            {alerts.map((a, i) => (
              <li key={i}>
                {a.message} — <b>{a.budget}</b> (₹{a.spent}/{a.limit})
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={submit} className="grid md:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800">
        <select className="input" required value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})}>
          <option value="">Category</option>
          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <input className="input" type="number" placeholder="Limit" value={form.limit} onChange={(e)=>setForm({...form,limit:+e.target.value})} required/>
        <select className="input" value={form.period} onChange={(e)=>setForm({...form,period:e.target.value})}>
          <option>monthly</option><option>weekly</option><option>yearly</option>
        </select>
        <button className="btn-primary">Add Budget</button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const pct = Math.min(100, Math.round(b.percentage || 0));
          return (
            <div key={b._id} className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="font-medium">{b.category}</div>
                <button className="text-rose-600" onClick={async ()=>{ await deleteBudget(b._id); load(); }}>Delete</button>
              </div>
              <div className="mt-2 text-sm text-slate-500">₹{b.spent} / ₹{b.limit}</div>
              <div className="h-2 mt-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full ${pct>=90?"bg-rose-500":pct>=70?"bg-amber-500":"bg-emerald-500"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
