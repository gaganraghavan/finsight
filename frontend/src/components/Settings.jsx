import { useEffect, useState } from "react";
import { me, createCategory, listCategories } from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { dark, setDark } = useTheme();
  const [user, setUser] = useState(null);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name: "", type: "expense" });

  useEffect(() => {
    (async () => {
      const u = await me();
      setUser(u.data);
      const c = await listCategories();
      setCats(c.data);
    })();
  }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    await createCategory(form);
    setForm({ name: "", type: "expense" });
    const c = await listCategories();
    setCats(c.data);
  };

  return (
    <section className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border">
          <div className="font-medium mb-2">Profile</div>
          {user && (
            <div className="text-sm space-y-1">
              <div><b>Name:</b> {user.name}</div>
              <div><b>Email:</b> {user.email}</div>
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border">
          <div className="font-medium mb-2">Theme</div>
          <button className="btn-primary" onClick={() => setDark((d) => !d)}>
            Toggle {dark ? "Light" : "Dark"} Mode
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border">
        <div className="font-medium mb-3">Custom Categories</div>
        <form onSubmit={addCategory} className="flex flex-wrap gap-2">
          <input className="input" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required/>
          <select className="input" value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}>
            <option value="expense">Expense</option><option value="income">Income</option>
          </select>
          <button className="btn-primary">Add</button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {cats.map((c) => (
            <span key={c._id} className="px-3 py-1 rounded-full text-sm border">
              {c.name} • {c.type}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
