import { useEffect, useState } from "react";
import { listRecurring, createRecurring, toggleRecurring } from "../services/api";

export default function Recurring() {
  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    name: "",
    type: "expense",
    amount: "",
    category: "",
    frequency: "monthly",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",  // ✅ ADDED
  });

  const load = async () => {
    const res = await listRecurring();
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      frequency: form.frequency,
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,  // ✅ ADDED
    };

    await createRecurring(payload);

    setForm({
      name: "",
      type: "expense",
      amount: "",
      category: "",
      frequency: "monthly",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",  // ✅ ADDED
    });

    load();
  };

  return (
    <section className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-2">Recurring</h1>

      {/* ✅ FORM - Changed to grid-cols-8 */}
      <form
        autoComplete="off"
        onSubmit={submit}
        className="
          grid md:grid-cols-8 gap-3 p-4 rounded-2xl 
          bg-white/70 dark:bg-slate-900/30 
          border border-slate-300 dark:border-slate-700 
          backdrop-blur-xl shadow-sm
        "
      >
        {/* Name */}
        <input
          className="input h-full"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        {/* Type */}
        <select
          className="input h-full"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        {/* Amount */}
        <input
          className="input h-full"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />

        {/* Category */}
        <input
          className="input h-full"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />

        {/* Frequency */}
        <select
          className="input h-full"
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value })}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        {/* Start Date */}
        <input
          className="input h-full"
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          required
        />

        {/* ✅ ADDED - End Date (Optional) */}
        <input
          className="input h-full"
          type="date"
          placeholder="End Date (Optional)"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          min={form.startDate}
        />

        <button className="btn-primary w-full h-full">Add</button>
      </form>

      {/* ✅ TABLE - Added End Date column */}
      <div
        className="
          rounded-2xl overflow-hidden 
          bg-white/70 dark:bg-slate-900/30 
          backdrop-blur-xl shadow-sm border 
          border-slate-300 dark:border-slate-700
        "
      >
        <table className="w-full text-sm">
          <thead
            className="
              text-left border-b 
              border-slate-300 dark:border-slate-700 
              bg-slate-100 dark:bg-slate-800/50
            "
          >
            <tr>
              <th className="p-3">Next Date</th>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">End Date</th>  {/* ✅ ADDED */}
              <th className="p-3">Active</th>
            </tr>
          </thead>

          <tbody>
            {items.map((r) => (
              <tr
                key={r._id}
                className="border-b border-slate-300/60 dark:border-slate-800/40"
              >
                <td className="p-3">
                  {new Date(r.nextDate).toLocaleDateString()}
                </td>
                <td className="p-3">{r.name}</td>
                <td className="p-3 capitalize">{r.type}</td>
                <td className="p-3">{r.category}</td>
                <td className="p-3">₹{r.amount}</td>
                
                {/* ✅ ADDED - Display End Date */}
                <td className="p-3">
                  {r.endDate 
                    ? new Date(r.endDate).toLocaleDateString() 
                    : <span className="text-slate-400">Never</span>
                  }
                </td>
                
                <td className="p-3">
                  <button
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      r.isActive
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-400/20 text-slate-700 dark:text-slate-300"
                    }`}
                    onClick={async () => {
                      await toggleRecurring(r._id);
                      load();
                    }}
                  >
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