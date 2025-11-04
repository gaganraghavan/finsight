import { useEffect, useState } from "react";
import { getCategoryBreakdown, getMonthlyTrends } from "../services/api";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend,
} from "chart.js";

ChartJS.register(LineElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function Analytics() {
  const [donut, setDonut] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    (async () => {
      const donuts = await getCategoryBreakdown({ type: "expense" });
      setDonut(donuts.data || []);
      const trend = await getMonthlyTrends({ months: 6 });
      setTrends(trend.data || []);
    })();
  }, []);

  const donutData = {
    labels: donut.map((d) => d.category),
    datasets: [{ data: donut.map((d) => d.amount) }],
  };

  const lineData = {
    labels: trends.map((t) => t.month),
    datasets: [
      { label: "Income", data: trends.map((t) => t.income || 0) },
      { label: "Expense", data: trends.map((t) => t.expense || 0) },
    ],
  };

  return (
    <section className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-700">
          <h2 className="mb-2 font-medium">Spending by Category</h2>
          <Doughnut data={donutData} />
        </div>
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-700">
          <h2 className="mb-2 font-medium">Monthly Trends</h2>
          <Line data={lineData} />
        </div>
      </div>
    </section>
  );
}

export default Analytics;
