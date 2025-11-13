import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  me,
  createCategory,
  listCategories,
  deleteCategory,
  uploadAvatar,
  deleteAccount,
} from "../services/api";

import { useTheme } from "../context/ThemeContext";
import {
  User,
  Mail,
  Tag,
  Plus,
  Trash2,
  Settings as SettingsIcon,
  Palette,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();          // ✅ new
  const { dark, setDark } = useTheme();
  const [user, setUser] = useState(null);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name: "", type: "expense" });
  const [activeSection, setActiveSection] = useState("profile");

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

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "categories", label: "Categories", icon: Tag },
  ];

  const categoryColors = {
    expense: "from-rose-500 to-red-500",
    income: "from-emerald-500 to-teal-500",
  };

  return (
    <section className="max-w-7xl mx-auto p-6 space-y-8 animate-slide-up">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-header">Settings</h1>
          <p className="section-subtitle">Manage your account and preferences</p>
        </div>
        <div className="icon-container animate-float">
          <SettingsIcon className="w-8 h-8" />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="card space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium flex-1 text-left">{section.label}</span>
                  {isActive && <ChevronRight className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3 space-y-6">

          {/* ✅ PROFILE */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              <div className="card-gradient">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-primary-600" /> Profile Information
                </h2>

                <div className="flex flex-col md:flex-row gap-8 items-start">

                  {/* ✅ Avatar Upload */}
                  <div className="relative group cursor-pointer">
                    <img
  src={
    user.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `http://localhost:5001${user.avatar}`
      : user.picture // ✅ fallback for Google OAuth field
      ? user.picture
      : "/default-avatar.png"
  }
  className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 shadow-2xl object-cover"
  alt="Profile"
  onClick={() => document.getElementById("avatarInput").click()}
/>


                    <input
                      id="avatarInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        const res = await uploadAvatar(file);

                        // ✅ refresh UI
                        setUser({ ...user, avatar: res.data.avatar });
                      }}
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Full Name</label>
                      <div className="relative">
                        <input type="text" value={user.name} readOnly className="input pl-12" />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Email Address</label>
                      <div className="relative">
                        <input type="email" value={user.email} readOnly className="input pl-12" />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200/60 dark:border-blue-800/60">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-semibold">Login Method</p>
                        <p className="text-sm opacity-70">
                          {user.googleId ? "Google Account (OAuth)" : "Email & Password"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ DELETE ACCOUNT */}
                {!user.googleId && (
                  <div className="mt-8 p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700">
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">
                      Danger Zone
                    </h3>

                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                      Permanently delete your account and all your data.
                    </p>

                    <button
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition"
                      onClick={async () => {
                        if (!confirm("Are you absolutely sure? This cannot be undone.")) return;

                        await deleteAccount();

                        localStorage.clear();

                        // ✅ redirect to login using react-router
                        navigate("/login");
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ APPEARANCE SECTION */}
          {activeSection === "appearance" && (
            <div className="card-gradient">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Palette className="w-6 h-6 text-primary-600" /> Appearance
              </h2>

              <div className="space-y-6">
                <div
                  className="relative p-2 rounded-2xl bg-white/70 dark:bg-slate-900/40 
                             border border-slate-300 dark:border-slate-700 
                             backdrop-blur-xl shadow-md"
                >
                  <div className="grid grid-cols-2 relative">
                    <span
                      className={`absolute top-2 bottom-2 w-1/2 rounded-xl transition-transform duration-300 
                                  bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg
                                  ${dark ? "translate-x-full" : "translate-x-0"}`}
                    />

                    <button
                      type="button"
                      onClick={() => setDark(false)}
                      className={`relative z-10 py-4 rounded-xl font-medium flex items-center justify-center gap-2 
                                  ${!dark ? "text-white" : "text-slate-700 dark:text-slate-300"}`}
                    >
                      <Sun className="w-5 h-5" /> Light Mode
                    </button>

                    <button
                      type="button"
                      onClick={() => setDark(true)}
                      className={`relative z-10 py-4 rounded-xl font-medium flex items-center justify-center gap-2 
                                  ${dark ? "text-white" : "text-slate-700 dark:text-slate-300"}`}
                    >
                      <Moon className="w-5 h-5" /> Dark Mode
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your theme preference is saved automatically.
                </p>
              </div>
            </div>
          )}

          {/* ✅ CATEGORIES SECTION */}
          {activeSection === "categories" && (
            <div className="card-gradient">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Tag className="w-6 h-6 text-primary-600" /> Custom Categories
              </h2>

              <form onSubmit={addCategory} className="mb-8">
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    className="input md:col-span-2"
                    placeholder="Category Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />

                  <div className="flex gap-2">
                    <select
                      className="input"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>

                    <button type="submit" className="btn-primary">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>

              <div className="grid md:grid-cols-2 gap-3">
                {cats.map((c) => (
                  <div
                    key={c._id}
                    className="group flex items-center justify-between p-4 rounded-xl 
                               bg-white dark:bg-slate-800 
                               border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                          categoryColors[c.type]
                        } flex items-center justify-center text-white`}
                      >
                        <Tag className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs opacity-70 capitalize">{c.type}</p>
                      </div>
                    </div>

                    {!c.isDefault && (
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg 
                                   hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
                        onClick={async () => {
                          await deleteCategory(c._id);
                          const updated = await listCategories();
                          setCats(updated.data);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}
