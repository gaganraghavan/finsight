import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const navItem =
  "px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition";

export default function Navbar() {
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();
  const authed = !!localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/60 dark:bg-slate-900/60 border-b border-slate-200/40 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-lg font-semibold">
          <span className="text-indigo-600 dark:text-indigo-400">Fin</span>Sight
        </Link>

        {authed && (
          <nav className="flex items-center gap-1">
            <NavLink to="/" className={navItem}>Dashboard</NavLink>
            <NavLink to="/transactions" className={navItem}>Transactions</NavLink>
            <NavLink to="/budgets" className={navItem}>Budgets</NavLink>
            <NavLink to="/recurring" className={navItem}>Recurring</NavLink>
            <NavLink to="/analytics" className={navItem}>Analytics</NavLink>
            <NavLink to="/settings" className={navItem}>Settings</NavLink>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setDark((d) => !d)}
            className="px-3 py-2 rounded-lg text-sm border border-slate-300/60 dark:border-slate-700 hover:bg-white/10"
          >
            {dark ? "🌙" : "☀️"}
          </button>
          {authed ? (
            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-3 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
