import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/api";

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup(form.name, form.email, form.password);
      localStorage.setItem("token", res.data.token);
      nav("/");
    } catch (e) {
      setErr(e?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm p-6 rounded-2xl border bg-white/60 dark:bg-slate-900/60">
        <h1 className="text-xl font-semibold mb-4">Create account</h1>
        {err && <div className="mb-3 text-sm text-rose-600">{err}</div>}
        <input className="input mb-3" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required/>
        <input className="input mb-3" placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required/>
        <input className="input mb-4" placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required/>
        <button className="btn-primary w-full">Sign up</button>
        <div className="text-sm mt-4">Already have an account? <Link to="/login" className="text-indigo-600">Login</Link></div>
      </form>
    </div>
  );
}
