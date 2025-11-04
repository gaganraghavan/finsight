import { useEffect, useState } from "react";
import { listRecurring, createRecurring, toggleRecurring } from "../services/api";

export default function Recurring() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "", type: "expense", amount: "", category: "", frequency: "monthly", startDate: new Date().toISOString().slice(0,10)
  });

  const load = async () => {
    const res = await listRecurring();
    setItems(res.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await createRecurring(form);
    setForm({ name:"", type:"expense", amount:"", category:"", frequency:"monthly", startDate:new Date().toISOString().slice(0,10) });
    load();
  };

  return (
    <section className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Recurring</h1>

      <form onSubmit={submit} className="grid md:grid-cols-6 gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border">
        <input className="input" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required/>
        <select className="input" value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}>
          <option value="expense">Expense</option><option value="income">Income</option>
        </select>
        <input className="input" type="number" placeholder="Amount" value={form.amount} onChange={(e)=>setForm({...form,amount:+e.target.value})} required/>
        <input className="input" placeholder="Category" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} required/>
        <select className="input" value={form.frequency} onChange={(e)=>setForm({...form,frequency:e.target.value})}>
          <option>daily</option><option>weekly</option><option>monthly</option><option>yearly</option>
        </select>
        <div className="flex gap-2">
          <input className="input flex-1" type="date" value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value})}/>
          <button className="btn-primary min-w-24">Add</button>
        </div>
      </form>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm bg-white/60 dark:bg-slate-900/60">
          <thead className="text-left border-b">
            <tr>
              <th className="p-3">Next Date</th>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r._id} className="border-b">
                <td className="p-3">{new Date(r.nextDate).toLocaleDateString()}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.type}</td>
                <td className="p-3">{r.category}</td>
                <td className="p-3">₹{r.amount}</td>
                <td className="p-3">
                  <button className={`px-2 py-1 rounded ${r.isActive ? "bg-emerald-500/20 text-emerald-700" : "bg-slate-500/20"}`} onClick={async()=>{ await toggleRecurring(r._id); load(); }}>
                    {r.isActive ? "Active" : "Paused"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
