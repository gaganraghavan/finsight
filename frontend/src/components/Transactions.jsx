import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Plus,
  DollarSign,
  Tag,
  FileText,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  listCategories,
} from "../services/api";

const currency = (n) =>
  (n ?? 0).toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
const fmtDay = (iso) => {
  try {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch {
    return iso;
  }
};
const monthKey = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};
const monthTitle = (key) => {
  const [y, m] = key.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
};

const iconBase =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5";
const inputBase =
  "h-12 w-full rounded-xl border bg-white dark:bg-slate-900 " +
  "border-slate-200 dark:border-slate-700 px-3 pl-10 text-sm md:text-base " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/60";

function MonthBlock({ title, rows, onEdit, onDelete, collapsed, setCollapsed }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 shadow-sm overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-gradient-to-r from-slate-50 via-slate-50 to-slate-50 dark:from-slate-800/60 dark:via-slate-800/60 dark:to-slate-800/60"
      >
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
        {collapsed ? (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        ) : (
          <ChevronUp className="w-5 h-5 text-slate-500" />
        )}
      </button>

      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left bg-slate-100/70 dark:bg-slate-800/60 border-t border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 md:px-6 py-3">Date</th>
                <th className="px-4 md:px-6 py-3">Type</th>
                <th className="px-4 md:px-6 py-3">Category</th>
                <th className="px-4 md:px-6 py-3">Amount</th>
                <th className="px-4 md:px-6 py-3">Description</th>
                <th className="px-4 md:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr
                  key={t._id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="px-4 md:px-6 py-3">{fmtDay(t.date)}</td>
                  <td
                    className={`px-4 md:px-6 py-3 font-medium ${
                      t.type === "income"
                        ? "text-emerald-600"
                        : "text-rose-500"
                    }`}
                  >
                    {t.type}
                  </td>
                  <td className="px-4 md:px-6 py-3">{t.category}</td>
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                    {t.type === "income" ? "+" : "-"} {currency(t.amount)}
                  </td>
                  <td className="px-4 md:px-6 py-3">{t.description || "—"}</td>
                  <td className="px-4 md:px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(t)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(t._id)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No transactions in this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [collapsed, setCollapsed] = useState({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [t, c] = await Promise.all([listTransactions(), listCategories()]);
    setItems(t.data || []);
    setCats(c.data || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  // ✅ Reset category when type changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, category: "" }));
  }, [form.type]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return;
    await createTransaction({
      ...form,
      amount: Number(form.amount),
      date: new Date(form.date).toISOString(),
    });
    setForm({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
    });
    load();
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    await deleteTransaction(id);
    load();
  };

  const onEdit = async (t) => {
    const amount = prompt("New amount:", t.amount);
    if (!amount) return;
    await updateTransaction(t._id, { amount: Number(amount) });
    load();
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items
      .filter((i) =>
        typeFilter === "all" ? true : i.type === typeFilter.toLowerCase()
      )
      .filter(
        (i) =>
          i.category?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [items, query, typeFilter]);

  const grouped = useMemo(() => {
    const by = {};
    for (const t of filtered) {
      const k = monthKey(t.date);
      if (!by[k]) by[k] = [];
      by[k].push(t);
    }
    return Object.entries(by)
      .sort(([a], [b]) => (a > b ? -1 : 1))
      .map(([k, rows]) => ({ key: k, title: monthTitle(k), rows }));
  }, [filtered]);

  const exportPDF = async () => {
  let jsPDF, autoTable;
  try {
    const mod = await import("jspdf");
    jsPDF = mod.jsPDF || mod.default || mod;
    const auto = await import("jspdf-autotable");
    autoTable = auto.default || auto;
  } catch {
    alert("Please install jspdf and jspdf-autotable.");
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  // === PAGE BACKGROUND ===
  doc.setFillColor(248, 250, 255); // light gray background
  doc.rect(0, 0, 595, 842, "F");

  // === HEADER GRADIENT BAR ===
  const gradientStart = [37, 99, 235]; // blue-600
  const gradientEnd = [147, 51, 234];  // purple-600
  const gradientHeight = 70;

  for (let i = 0; i < gradientHeight; i++) {
    const r = Math.round(
      gradientStart[0] + ((gradientEnd[0] - gradientStart[0]) * i) / gradientHeight
    );
    const g = Math.round(
      gradientStart[1] + ((gradientEnd[1] - gradientStart[1]) * i) / gradientHeight
    );
    const b = Math.round(
      gradientStart[2] + ((gradientEnd[2] - gradientStart[2]) * i) / gradientHeight
    );
    doc.setDrawColor(r, g, b);
    doc.setFillColor(r, g, b);
    doc.rect(0, i, 595, 1, "F");
  }

  // === HEADER TEXT ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255);
  doc.text("FinSight Transactions Report", 40, 45);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 63);

  let y = 100;
  let totalIncome = 0;
  let totalExpense = 0;

  // === TRANSACTIONS ===
  for (const g of grouped) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(g.title, 40, y);
    y += 10;

    const body = g.rows.map((r) => {
      if (r.type === "income") totalIncome += r.amount;
      else totalExpense += r.amount;
      return [
        fmtDay(r.date),
        r.type.toUpperCase(),
        r.category,
        `INR ${r.amount.toLocaleString()}`,
        r.description || "",
      ];
    });

    autoTable(doc, {
      startY: y + 5,
      head: [["Date", "Type", "Category", "Amount", "Description"]],
      body,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 6,
        font: "helvetica",
        lineColor: [230, 230, 230],
      },
      headStyles: {
        fillColor: [59, 130, 246], // blue-500
        textColor: 255,
        halign: "center",
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        3: { halign: "right", font: "courier", fontStyle: "bold" },
        4: { cellWidth: 150 },
      },
      margin: { left: 40, right: 40 },
    });

    y = doc.lastAutoTable.finalY + 30;
  }

  // === SUMMARY ===
  const balance = totalIncome - totalExpense;
  const boxY = y + 20;

  doc.setFillColor(240, 245, 255);
  doc.roundedRect(40, boxY, 520, 130, 8, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("Summary", 50, boxY + 25);

  doc.setFont("courier", "bold");
  doc.setFontSize(12);

  // Income
  doc.setTextColor(16, 185, 129); // green-500
  doc.text(`Total Income:   INR ${totalIncome.toLocaleString()}`, 60, boxY + 60);

  // Expense
  doc.setTextColor(239, 68, 68); // red-500
  doc.text(`Total Expense:  INR ${totalExpense.toLocaleString()}`, 60, boxY + 85);

  // Balance
  if (balance >= 0) doc.setTextColor(59, 130, 246); // blue for positive
  else doc.setTextColor(239, 68, 68); // red for negative
  doc.text(`Net Balance:    INR ${balance.toLocaleString()}`, 60, boxY + 110);

  // === FOOTER ===
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("Generated by FinSight • finsight.ai", 40, 820);

  doc.save("FinSight_Transactions_Report.pdf");
};



  return (
    <section className="max-w-7xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your income and expenses
          </p>
        </div>
        <button
          onClick={exportPDF}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* ADD NEW */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow">
            <Plus className="w-5 h-5" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold">Add New Transaction</h2>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-[220px_1fr_1fr_1.5fr_220px_auto] gap-3"
        >
          {/* Type */}
          <div className="relative">
            {form.type === "expense" ? (
              <TrendingDown
                className={`${iconBase} text-rose-500 dark:text-rose-400`}
              />
            ) : (
              <TrendingUp
                className={`${iconBase} text-emerald-500 dark:text-emerald-400`}
              />
            )}
            <select
              className={`${inputBase} appearance-none`}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          {/* Amount */}
          <div className="relative">
            <DollarSign className={`${iconBase} text-sky-500 dark:text-sky-400`} />
            <input
              type="number"
              className={inputBase}
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          {/* ✅ Category Filtered by Type */}
          <div className="relative">
            <Tag className={`${iconBase} text-purple-500 dark:text-purple-400`} />
            <select
              className={`${inputBase} appearance-none`}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {cats
                .filter((c) => c.type === form.type.toLowerCase())
                .map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Description */}
          <div className="relative">
            <FileText
              className={`${iconBase} text-orange-500 dark:text-orange-400`}
            />
            <input
              className={inputBase}
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Date */}
          <div className="relative">
            <Calendar
              className={`${iconBase} text-emerald-500 dark:text-emerald-400`}
            />
            <input
              type="date"
              className={inputBase}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <button className="h-12 rounded-xl px-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow hover:brightness-95">
            Add
          </button>
        </form>
      </div>

      {/* SEARCH + FILTER */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className={`${iconBase} text-slate-400 dark:text-slate-300`} />
            <input
              className={inputBase}
              placeholder="Search transactions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {["all", "income", "expense"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 rounded-xl text-sm ${
                  typeFilter === type
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TRANSACTIONS */}
      {loading ? (
        <p className="text-center text-slate-500 py-8">Loading...</p>
      ) : grouped.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No transactions yet.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <MonthBlock
              key={g.key}
              title={g.title}
              rows={g.rows}
              onEdit={onEdit}
              onDelete={onDelete}
              collapsed={!!collapsed[g.key]}
              setCollapsed={(fn) =>
                setCollapsed((p) => ({ ...p, [g.key]: fn(p[g.key]) }))
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
