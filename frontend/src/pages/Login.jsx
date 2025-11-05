import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { Mail, Lock, LogIn, AlertCircle, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    
    try {
      const res = await login(form.email, form.password);
      localStorage.setItem("token", res.data.token);
      nav("/");
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: TrendingUp, text: "Track all transactions" },
    { icon: Shield, text: "Secure & private" },
    { icon: Zap, text: "Real-time insights" },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2 gap-8 p-6">
      {/* Left side - Features */}
      <div className="hidden lg:flex flex-col justify-center p-12 animate-slide-up">
        <div className="space-y-8">
          <div className="inline-block">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-2xl shadow-primary-500/30 animate-float">
              <Sparkles className="w-12 h-12" />
            </div>
          </div>
          
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent mb-4">
              Welcome to FinSight
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Your personal finance companion for smarter money management
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-slate-200/60 dark:border-slate-800/60 hover:scale-105 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg">
                  <feature.icon className="w-6 h-6" />
                </div>
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center animate-scale-in">
        <div className="w-full max-w-md">
          <form onSubmit={submit} className="card-gradient space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-xl shadow-primary-500/30 mb-4">
                <LogIn className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to continue to your account
              </p>
            </div>

            {/* Error Message */}
            {err && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-danger-50 dark:bg-danger-950/30 border-2 border-danger-200 dark:border-danger-800 animate-slide-up">
                <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger-700 dark:text-danger-300 font-medium">{err}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  className="input pl-12"
                  placeholder="you@example.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={loading}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  className="input pl-12"
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  disabled={loading}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-medium">
                  New to FinSight?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors group"
              >
                <span>Create an account</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </form>

          {/* Mobile Features */}
          <div className="lg:hidden mt-8 space-y-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60"
              >
                <feature.icon className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}