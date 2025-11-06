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

  if (!user) return null;

  return (
    <section className="max-w-7xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* PROFILE CARD */}
      <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 border flex items-center gap-6">
        <img
          src={user.avatar || "/default-avatar.png"}
          className="w-20 h-20 rounded-full border shadow-md"
        />
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">
            Login Method:{" "}
            <span className="font-semibold">
              {user.googleId ? "Google Account" : "Email & Password"}
            </span>
          </p>
        </div>
      </div>

      {/* THEME */}
      <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 border">
        <div className="font-medium mb-3">Theme</div>
        <button className="btn-primary" onClick={() => setDark((d) => !d)}>
          Toggle {dark ? "Light" : "Dark"} Mode
        </button>
      </div>

      {/* CUSTOM CATEGORIES */}
      <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 border">
        <div className="font-medium mb-3">Custom Categories</div>

        <form onSubmit={addCategory} className="flex flex-wrap gap-2">
          <input
            className="input"
            placeholder="Category Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <button className="btn-primary">Add</button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {cats.map((c) => (
            <span
              key={c._id}
              className="px-3 py-1 rounded-full text-sm border bg-white dark:bg-slate-800"
            >
              {c.name} • {c.type}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
