import { useEffect, useState } from "react";
import { me, createCategory, listCategories } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import {
  User,
  Mail,
  Shield,
  Moon,
  Sun,
  Tag,
  Plus,
  Trash2,
  Settings as SettingsIcon,
  Bell,
  Lock,
  Palette,
  Globe,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function Settings() {
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
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const categoryColors = {
    expense: "from-rose-500 to-red-500",
    income: "from-emerald-500 to-teal-500",
  };

  return (
    <section className="max-w-7xl mx-auto p-6 space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-header">Settings</h1>
          <p className="section-subtitle">
            Manage your account and preferences
          </p>
        </div>
        <div className="icon-container animate-float">
          <SettingsIcon className="w-8 h-8" />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
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
                  <span className="font-medium flex-1 text-left">
                    {section.label}
                  </span>
                  {isActive && <ChevronRight className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="card-gradient">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-primary-600" />
                  Profile Information
                </h2>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Avatar */}
                  <div className="relative group">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 shadow-2xl"
                      alt="Profile"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center cursor-pointer">
                      <span className="text-white text-sm font-semibold">
                        Change Photo
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={user.name}
                          readOnly
                          className="input pl-12"
                        />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user.email}
                          readOnly
                          className="input pl-12"
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200/60 dark:border-blue-800/60">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          Login Method
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {user.googleId
                            ? "Google Account (OAuth)"
                            : "Email & Password"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="stat-card">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Active
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Account Status
                  </p>
                </div>
                <div className="stat-card">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Member Since
                  </p>
                </div>
                <div className="stat-card">
                  <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    Free
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Current Plan
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <div className="card-gradient">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Palette className="w-6 h-6 text-primary-600" />
                Appearance
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Theme Mode
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDark(false)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                        !dark
                          ? "border-primary-600 bg-gradient-to-br from-primary-50 to-purple-50 shadow-xl"
                          : "border-slate-300 dark:border-slate-700 hover:border-primary-400"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-lg">
                          <Sun className="w-8 h-8" />
                        </div>
                        <span className="font-semibold">Light Mode</span>
                        {!dark && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setDark(true)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                        dark
                          ? "border-primary-600 bg-gradient-to-br from-primary-900/30 to-purple-900/30 shadow-xl"
                          : "border-slate-300 dark:border-slate-700 hover:border-primary-400"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
                          <Moon className="w-8 h-8" />
                        </div>
                        <span className="font-semibold">Dark Mode</span>
                        {dark && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Tip:</strong> Your theme preference is automatically
                    saved and will persist across sessions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Categories Section */}
          {activeSection === "categories" && (
            <div className="card-gradient">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Tag className="w-6 h-6 text-primary-600" />
                Custom Categories
              </h2>

              {/* Add Category Form */}
              <form onSubmit={addCategory} className="mb-8">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <input
                      className="input"
                      placeholder="Category Name (e.g., Groceries, Freelance)"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      className="input flex-1"
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
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

              {/* Categories List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    Your Categories ({cats.length})
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {cats.map((c) => (
                    <div
                      key={c._id}
                      className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                            categoryColors[c.type]
                          } flex items-center justify-center text-white shadow-lg`}
                        >
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {c.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                            {c.type}
                          </p>
                        </div>
                      </div>

                      {!c.isDefault && (
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="space-y-6">
              <div className="card-gradient">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-primary-600" />
                  Security Settings
                </h2>

                <div className="space-y-4">
                  <button className="w-full p-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:shadow-lg transition-all duration-200 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Change Password</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Update your account password
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                  </button>

                  <button className="w-full p-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:shadow-lg transition-all duration-200 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Two-Factor Authentication</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Add an extra layer of security
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                  </button>
                </div>
              </div>

              <div className="card bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 border-2 border-rose-300 dark:border-rose-800">
                <h3 className="text-lg font-bold text-rose-900 dark:text-rose-100 mb-2">
                  Danger Zone
                </h3>
                <p className="text-sm text-rose-700 dark:text-rose-300 mb-4">
                  Irreversible and destructive actions
                </p>
                <button className="btn-danger">
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="card-gradient">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Bell className="w-6 h-6 text-primary-600" />
                Notifications
              </h2>

              <div className="space-y-4">
                {[
                  {
                    title: "Budget Alerts",
                    description: "Get notified when you're close to budget limits",
                    enabled: true,
                  },
                  {
                    title: "Transaction Reminders",
                    description: "Reminders for recurring transactions",
                    enabled: true,
                  },
                  {
                    title: "Weekly Reports",
                    description: "Receive weekly spending summaries",
                    enabled: false,
                  },
                  {
                    title: "Monthly Reports",
                    description: "Monthly financial overview and insights",
                    enabled: true,
                  },
                ].map((notification, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-semibold">{notification.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {notification.description}
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notification.enabled
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notification.enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
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