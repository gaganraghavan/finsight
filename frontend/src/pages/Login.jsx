import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form.email, form.password);
      localStorage.setItem("token", res.data.token);
      nav("/");
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm p-6 rounded-2xl border bg-white/60 dark:bg-slate-900/60">
        <h1 className="text-xl font-semibold mb-4">Welcome back</h1>
        {err && <div className="mb-3 text-sm text-rose-600">{err}</div>}
        <input className="input mb-3" placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required/>
        <input className="input mb-4" placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required/>
        <button className="btn-primary w-full">Login</button>
        <div className="text-sm mt-4">No account? <Link to="/signup" className="text-indigo-600">Sign up</Link></div>
      </form>
    </div>
  );
}
