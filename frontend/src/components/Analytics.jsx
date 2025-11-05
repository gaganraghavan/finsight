import { useEffect, useState } from "react";
import { getCategoryBreakdown, getMonthlyTrends } from "../services/api";
import { Doughnut, Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [donut, setDonut] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    (async () => {
      const donuts = await getCategoryBreakdown({ type: "expense" });
      setDonut(donuts.data || []);

      const t = await getMonthlyTrends({ months: 6 });
      const data = t.data || [];

      // ✅ Ensure last 6 months always appear
      const now = new Date();
      const filled = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = `${d.getMonth() + 1}/${d.getFullYear()}`;

        const match = data.find((x) => x.month === label);
        filled.push({
          month: label,
          income: match?.income || 0,
          expense: match?.expense || 0,
        });
      }

      setTrends(filled);
    })();
  }, []);

  // 🎨 Donut Chart Colors
  const donutColors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#f59e0b", // amber
    "#10b981", // green
    "#a855f7", // purple
    "#14b8a6", // teal
  ];

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

  // 📈 Line Chart
  const lineData = {
    labels: trends.map((t) => t.month),
    datasets: [
      {
        label: "Income",
        data: trends.map((t) => t.income),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.25)",
        pointBackgroundColor: "#22c55e",
        pointBorderColor: "#22c55e",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Expense",
        data: trends.map((t) => t.expense),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.25)",
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#ef4444",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <section className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div className="p-6 rounded-xl border border-slate-700 bg-slate-900 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          <Doughnut data={donutData} />
        </div>

        {/* Line Chart */}
        <div className="p-6 rounded-xl border border-slate-700 bg-slate-900 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Monthly Trends</h2>
          <Line data={lineData} />
        </div>
      </div>
    </section>
  );
}
