import { useEffect, useState } from "react";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  listCategories,
} from "../services/api";

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
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

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { (async () => {
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
    date: t.date?.slice(0,10),
  });

  const rupee = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  return (
    <section className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>

      <form onSubmit={submit} className="grid md:grid-cols-5 gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800">
        <select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})} className="input">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input type="number" placeholder="Amount" value={form.amount} onChange={(e)=>setForm({...form,amount:+e.target.value})} className="input" required />
        <select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} className="input" required>
          <option value="">Category</option>
          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <input value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Description" className="input" />
        <div className="flex gap-2">
          <input type="date" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} className="input flex-1" />
          <button className="btn-primary min-w-24">{form._id ? "Update" : "Add"}</button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200/40 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm bg-white/60 dark:bg-slate-900/60">
          <thead className="text-left border-b border-slate-200/40 dark:border-slate-800">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Description</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id} className="border-b border-slate-100/40 dark:border-slate-800/60">
                <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-3 capitalize">{t.type}</td>
                <td className="p-3">{t.category}</td>
                <td className="p-3">{rupee(t.amount)}</td>
                <td className="p-3">{t.description || "-"}</td>
                <td className="p-3">
                  <button className="text-indigo-600 mr-3" onClick={() => edit(t)}>Edit</button>
                  <button className="text-rose-600" onClick={async () => { await deleteTransaction(t._id); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
