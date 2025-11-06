import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import axios from "axios";

import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Initialize Google Login
  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById("googleLoginBtn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  // ✅ Handle Google Response
  const handleGoogleResponse = async (response) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/google-login", {
        credential: response.credential,
      });

      localStorage.setItem("token", res.data.token);
      nav("/");
    } catch (error) {
      console.error("Google Login Failed:", error);
      setErr("Google login failed. Please try again.");
    }
  };

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
      {/* Left Section - unchanged */}
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

      {/* Right Section - Login Form */}
      <div className="flex items-center justify-center animate-scale-in">
        <div className="w-full max-w-md">
          <form onSubmit={submit} className="card-gradient space-y-6">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-xl shadow-primary-500/30 mb-4">
                <LogIn className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold">Welcome Back</h2>
            </div>

            {/* Error */}
            {err && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {err}
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <input
                className="input pl-12"
                placeholder="you@example.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                className="input pl-12"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
            </div>

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="text-center text-sm text-gray-500 mt-4">OR</div>

            {/* ✅ GOOGLE LOGIN BUTTON */}
            <div id="googleLoginBtn" className="flex justify-center" />

            <div className="text-center mt-6">
              <Link to="/signup" className="text-primary-600 font-semibold">
                Create an account →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
