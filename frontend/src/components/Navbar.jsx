import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { LogOut, Moon, Sun } from "lucide-react";
import FinSightLogo from "./FinSightLogo"; // Import the new logo

export default function Navbar() {
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();
  const authed = !!localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b-2 border-slate-200/60 dark:border-slate-800/60 shadow-xl">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="transition-all duration-200 group-hover:scale-110">
              <FinSightLogo size={40} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              FinSight
            </span>
          </Link>

          {/* Navigation */}
          {authed && (
            <nav className="hidden md:flex items-center gap-2 flex-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/transactions"
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
                  }`
                }
              >
                Transactions
              </NavLink>
              <NavLink
                to="/budgets"
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
                  }`
                }
              >
                Budgets
              </NavLink>
              <NavLink
                to="/recurring"
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
                  }`
                }
              >
                Recurring
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
                  }`
                }
              >
                Analytics
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
                  }`
                }
              >
                Settings
              </NavLink>
            </nav>
          )}

          {/* Right Section */}
          <div className="ml-auto flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDark((d) => !d)}
              className="p-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:shadow-lg transition-all duration-200 hover:scale-110"
              title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {dark ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            {/* Auth Buttons */}
            {authed ? (
              <button
                onClick={logout}
                className="px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {authed && (
          <nav className="md:hidden flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              Transactions
            </NavLink>
            <NavLink
              to="/budgets"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              Budgets
            </NavLink>
            <NavLink
              to="/recurring"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              Recurring
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              Analytics
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              Settings
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}