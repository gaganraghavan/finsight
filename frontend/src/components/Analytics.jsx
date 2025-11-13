import { useEffect, useMemo, useState } from "react";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import API, {
  getCategoryBreakdown,
  getMonthlyTrends,
} from "../services/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  // 'monthly' | 'yearly'
  const [mode, setMode] = useState("monthly");
  const [monthsWindow] = useState(6);

  // datasets
  const [donut, setDonut] = useState([]); // category breakdown (month or year)
  const [trends, setTrends] = useState([]); // income/expense time series
  const [catTrends, setCatTrends] = useState(null); // {labels:[], series:{name:[...]}}
  const [loading, setLoading] = useState(true);

  // Load data on first mount + when mode changes
  useEffect(() => {
    (async () => {
      setLoading(true);

      // 1) Category breakdown
      try {
        if (mode === "monthly") {
          // your current endpoint usually returns the current month by default
          const donuts = await getCategoryBreakdown({ type: "expense" });
          setDonut(donuts.data || []);
        } else {
          // YEARLY breakdown — try an API (if you add one).
          // If not available, we fall back to the monthly one so UI still renders.
          const y = await tryGet("/analytics/category-breakdown", {
            type: "expense",
            period: "year",
          });
          setDonut(y ?? (await getCategoryBreakdown({ type: "expense" })).data ?? []);
        }
      } catch {
        setDonut([]);
      }

      // 2) Trends (income/expense)
      try {
        if (mode === "monthly") {
          // last N months
          const res = await getMonthlyTrends({ months: monthsWindow });
          const data = res.data || [];
          // Fill missing months so X-axis looks consistent
          const now = new Date();
          const filled = [];
          for (let i = monthsWindow - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = `${d.getMonth() + 1}/${d.getFullYear()}`;
            const match = data.find((x) => x.month === label);
            filled.push({
              period: label,
              income: match?.income || 0,
              expense: match?.expense || 0,
            });
          }
          setTrends(filled);
        } else {
          // YEARLY — try an API that returns 12 months (if you add one). Fallback: compose from 12-month trends.
          const y = await tryGet("/analytics/monthly-trends", { months: 12 });
          const src = y ?? (await getMonthlyTrends({ months: 12 })).data ?? [];
          // normalize to 12 months
          const now = new Date();
          const filled = [];
          for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = `${d.getMonth() + 1}/${d.getFullYear()}`;
            const match = src.find((x) => x.month === label);
            filled.push({
              period: label,
              income: match?.income || 0,
              expense: match?.expense || 0,
            });
          }
          setTrends(filled);
        }
      } catch {
        setTrends([]);
      }

      // 3) Category trends (multi-line) — try an API. If missing, hide.
      try {
        // Expected response shape:
        // { labels: ["6/2025","7/2025",...], series: { "Food": [..], "Transport":[..], ... } }
        const params =
          mode === "monthly"
            ? { months: monthsWindow }
            : { months: 12, period: "year" };
        const ct = await tryGet("/analytics/category-trends", params);
        setCatTrends(ct ?? null);
      } catch {
        setCatTrends(null);
      }

      setLoading(false);
    })();
  }, [mode, monthsWindow]);

  // Helper: try GET, return data or null
  const tryGet = async (url, params) => {
    try {
      const res = await API.get(url, { params });
      return res.data;
    } catch {
      return null;
    }
  };

  // ==== Derived KPI stats ====
  const kpis = useMemo(() => {
    if (!trends?.length) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        net: 0,
        topCategory: "-",
      };
    }

    // If monthly mode -> use the **last** period
    // If yearly mode -> sum all periods
    if (mode === "monthly") {
      const last = trends[trends.length - 1];
      const topCat =
        donut?.length > 0
          ? donut.slice().sort((a, b) => b.amount - a.amount)[0].category
          : "-";
      return {
        totalIncome: last.income || 0,
        totalExpense: last.expense || 0,
        net: (last.income || 0) - (last.expense || 0),
        topCategory: topCat,
      };
    } else {
      let ti = 0,
        te = 0;
      trends.forEach((t) => {
        ti += t.income || 0;
        te += t.expense || 0;
      });
      const topCat =
        donut?.length > 0
          ? donut.slice().sort((a, b) => b.amount - a.amount)[0].category
          : "-";
      return {
        totalIncome: ti,
        totalExpense: te,
        net: ti - te,
        topCategory: topCat,
      };
    }
  }, [trends, donut, mode]);

  // ===== COLORS =====
  const donutColors = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#a855f7", "#14b8a6"];

  // ===== CHART DATA =====

  // Donut
  const donutData = {
    labels: donut.map((d) => d.category),
    datasets: [
      {
        data: donut.map((d) => d.amount),
        backgroundColor: donutColors,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  // Area (Line with fill)
  const areaData = {
    labels: trends.map((t) => t.period),
    datasets: [
      {
        label: "Income",
        data: trends.map((t) => t.income),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.25)",
        pointBackgroundColor: "#22c55e",
        pointBorderColor: "#22c55e",
        tension: 0.35,
        fill: true,
      },
      {
        label: "Expense",
        data: trends.map((t) => t.expense),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.25)",
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#ef4444",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  // Stacked Bar
  const stackedBarData = {
    labels: trends.map((t) => t.period),
    datasets: [
      {
        label: "Income",
        data: trends.map((t) => t.income),
        backgroundColor: "rgba(34,197,94,0.7)",
        borderColor: "#22c55e",
        borderWidth: 1,
        stack: "stack-0",
      },
      {
        label: "Expense",
        data: trends.map((t) => t.expense),
        backgroundColor: "rgba(239,68,68,0.7)",
        borderColor: "#ef4444",
        borderWidth: 1,
        stack: "stack-0",
      },
    ],
  };

  // Category trends (multi-line)
  const categoryTrendData = useMemo(() => {
    if (!catTrends?.labels || !catTrends?.series) return null;
    const labels = catTrends.labels;

    // make a palette
    const palette = [
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#a855f7",
      "#14b8a6",
      "#f97316",
      "#22d3ee",
      "#84cc16",
      "#e11d48",
    ];
    const datasets = Object.entries(catTrends.series).map(([name, arr], idx) => ({
      label: name,
      data: arr,
      borderColor: palette[idx % palette.length],
      backgroundColor: "transparent",
      tension: 0.3,
      fill: false,
      pointRadius: 2,
    }));

    return { labels, datasets };
  }, [catTrends]);

  // ===== OPTIONS =====
  const stackedBarOptions = {
    responsive: true,
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, grid: { color: "rgba(148,163,184,0.2)" } },
    },
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
  };

  const areaOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(148,163,184,0.2)" } },
    },
  };

  const donutOptions = {
    plugins: {
      legend: { position: "top" },
    },
    cutout: "60%",
  };

  // currency format
  const rup = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
      n || 0
    );

  return (
    <section className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>

        {/* Monthly / Yearly toggle */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-1 flex">
          <button
            onClick={() => setMode("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === "monthly"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setMode("yearly")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === "yearly"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Income {mode === "monthly" ? "(this month)" : "(last 12 months)"}
          </p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{rup(kpis.totalIncome)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Expense {mode === "monthly" ? "(this month)" : "(last 12 months)"}
          </p>
          <p className="text-2xl font-bold mt-1 text-rose-600">{rup(kpis.totalExpense)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Net</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              kpis.net >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {rup(kpis.net)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Biggest Spending</p>
          <p className="text-2xl font-bold mt-1">{kpis.topCategory}</p>
        </div>
      </div>

      {/* TOP ROW: Donut + Area */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow">
          <h2 className="text-lg font-semibold mb-4">
            {mode === "monthly" ? "Spending by Category (This Month)" : "Spending by Category (Year)"}
          </h2>
          <Doughnut data={donutData} options={donutOptions} />
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow">
          <h2 className="text-lg font-semibold mb-4">
            {mode === "monthly" ? "Monthly Trends" : "Yearly Trends (12 Months)"}
          </h2>
          <Line data={areaData} options={areaOptions} />
        </div>
      </div>

      {/* BOTTOM ROW: Stacked Bar + Category Trends */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow">
          <h2 className="text-lg font-semibold mb-4">
            {mode === "monthly" ? "Income vs Expense (Stacked)" : "Income vs Expense (Year – Stacked)"}
          </h2>
          <Bar data={stackedBarData} options={stackedBarOptions} />
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow">
          <h2 className="text-lg font-semibold mb-4">Category Trends</h2>
          {categoryTrendData ? (
            <Line data={categoryTrendData} options={{ responsive: true, plugins: { legend: { position: "top" }}}} />
          ) : (
            <div className="text-slate-500 dark:text-slate-400">
              Category trend data isn’t available yet. (You can expose
              an endpoint like <code>/analytics/category-trends</code> returning
              {" "}
              <code>{`{ labels: [], series: { [category]: number[] } }`}</code>.)
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-sm text-slate-500 dark:text-slate-400">Loading charts…</div>
      )}
    </section>
  );
}
