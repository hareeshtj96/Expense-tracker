import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import MonthSelector from "../MonthSelector";

function formatCurrency(n) {
  if (Number.isNaN(Number(n))) return "₹0";
  return `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function monthName(monthNumber) {
  const d = new Date();
  d.setMonth(monthNumber - 1);
  return d.toLocaleString("default", { month: "long" });
}

function toYYYYMM(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

function parseYYYYMM(val) {
  if (!val) return null;
  const [yStr, mStr] = val.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (Number.isNaN(y) || Number.isNaN(m)) return null;
  return { year: y, month: m };
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white/95 border border-gray-200 p-3 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">
          {label}
        </p>

        {/* Budget Row */}
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-gray-600">Budget:</span>
          <span className="font-medium ml-auto text-gray-900">
            {formatCurrency(data.budget)}
          </span>
        </div>

        {/* Spent Row */}
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-3 h-3 rounded-full shadow-sm opacity-70"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-gray-600">Spent:</span>
          <span className="font-medium ml-auto text-gray-900">
            {formatCurrency(data.spent)}
          </span>
        </div>

        {/* Remaining Row  */}
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{
              backgroundColor: data.remaining < 0 ? "#ef4444" : "#10b981",
            }}
          />
          <span className="text-gray-600">Remaining:</span>
          <span
            className={`font-medium ml-auto ${
              data.remaining < 0 ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {formatCurrency(data.remaining)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ReportsPage({ monthValue: propMonthValue }) {
  const location = useLocation();
  const navigate = useNavigate();

  const initial = propMonthValue || location.state?.monthValue || toYYYYMM();

  const stateMonth = location.state?.monthValue;
  const selected = propMonthValue || stateMonth || null;

  const [monthValue, setMonthValue] = useState(initial);

  const parsed = parseYYYYMM(monthValue) || {};
  const year = parsed?.year || new Date().getFullYear();
  const month = parsed?.month || new Date().getMonth() + 1;

  // UI state
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ budget: 0, spent: 0, remaining: 0 });
  const [view, setView] = useState("chart");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [catRes, budRes, expRes] = await Promise.all([
          api.get("/categories"),
          api.get("/budgets", { params: { year, month } }),
          api.get("/expenses", { params: { year, month } }),
        ]);

        const categories = catRes.data || [];
        const budgets = budRes.data || [];
        const expenses = expRes.data || [];

        const budgetByCat = {};
        budgets.forEach((b) => {
          budgetByCat[b.categoryId] = Number(b.limit ?? 0);
        });

        const spentByCat = {};
        expenses.forEach((e) => {
          const id = e.categoryId;
          spentByCat[id] = (spentByCat[id] || 0) + Number(e.amount || 0);
        });

        const chartData = categories.map((c) => {
          const id = c._id;
          const budget = budgetByCat[id] ?? Number(c.budget ?? 0);
          const spent = spentByCat[id] || 0;
          const remaining = budget - spent;
          return {
            id,
            name: c.name,
            budget,
            spent,
            remaining,
            color: c.color || "#8884d8",
          };
        });

        // sort by highest spent
        chartData.sort((a, b) => b.spent - a.spent);

        const totalBudget = chartData.reduce(
          (s, d) => s + Number(d.budget || 0),
          0
        );
        const totalSpent = chartData.reduce(
          (s, d) => s + Number(d.spent || 0),
          0
        );
        const remainingTotal = totalBudget - totalSpent;

        if (!cancelled) {
          setTotals({
            budget: totalBudget,
            spent: totalSpent,
            remaining: remainingTotal,
          });
          setData(chartData);
        }
      } catch (error) {
        console.error("Reports load error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const hasData = data && data.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Reports
            </h1>
            <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
              <span className="font-medium text-gray-700">
                {monthName(month)} {year}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="w-full sm:w-auto">
              <MonthSelector
                value={monthValue}
                onChange={(val) => {
                  setMonthValue(val);
                }}
              />
            </div>

            <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => setView("chart")}
                aria-pressed={view === "chart"}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  view === "chart"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Chart View
              </button>
              <button
                onClick={() => setView("table")}
                aria-pressed={view === "table"}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  view === "table"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        {/* Totals Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">
                Total Budget
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">
              {formatCurrency(totals.budget)}
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">
                Total Spent
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">
              {formatCurrency(totals.spent)}
            </div>
          </div>

          <div
            className={`group rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 lg:p-6 border sm:col-span-2 lg:col-span-1 ${
              totals.remaining < 0
                ? "bg-linear-to-br from-red-50 to-red-100 border-red-200"
                : "bg-linear-to-br from-emerald-50 to-emerald-100 border-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">Remaining</div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  totals.remaining < 0
                    ? "bg-red-200 group-hover:bg-red-300"
                    : "bg-emerald-200 group-hover:bg-emerald-300"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${
                    totals.remaining < 0 ? "text-red-700" : "text-emerald-700"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div
              className={`text-2xl lg:text-3xl font-bold ${
                totals.remaining < 0 ? "text-red-700" : "text-emerald-700"
              }`}
            >
              {formatCurrency(totals.remaining)}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 lg:py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
              <div className="text-gray-500 text-sm">Loading reports...</div>
            </div>
          ) : !hasData ? (
            <div className="flex flex-col items-center justify-center py-16 lg:py-24 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                No Data Available
              </h3>
              <p className="text-gray-500 text-sm text-center">
                There's no data to display for this month yet.
              </p>
            </div>
          ) : (
            <>
              {view === "chart" ? (
                <div className="w-full p-4 lg:p-6">
                  <div className="w-full h-[350px] sm:h-[400px] lg:h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data}
                        margin={{
                          top: 20,
                          right: 10,
                          left: 0,
                          bottom: window.innerWidth < 640 ? 50 : 40,
                        }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: window.innerWidth < 640 ? 10 : 12,
                            fill: "#6b7280",
                          }}
                          interval={0}
                          angle={window.innerWidth < 640 ? -45 : -30}
                          textAnchor="end"
                          height={window.innerWidth < 640 ? 70 : 60}
                        />
                        <YAxis
                          tick={{
                            fontSize: window.innerWidth < 640 ? 10 : 12,
                            fill: "#6b7280",
                          }}
                        />

                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: "transparent" }}
                        />

                        {/* budget bar */}
                        <Bar
                          dataKey="budget"
                          name="Budget"
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                        >
                          {data.map((entry) => (
                            <Cell
                              key={`budget-${entry.id}`}
                              fill={entry.color}
                            />
                          ))}
                        </Bar>

                        {/* spent bar */}
                        <Bar
                          dataKey="spent"
                          name="Spent"
                          fill="#82ca9d"
                          radius={[4, 4, 0, 0]}
                        >
                          {data.map((entry) => (
                            <Cell
                              key={`spent-${entry.id}`}
                              fill={entry.color}
                              fillOpacity={0.7}
                            />
                          ))}
                        </Bar>

                        {/* remaining bar  */}
                        <Bar
                          dataKey="remaining"
                          name="Remaining"
                          radius={[4, 4, 0, 0]}
                        >
                          {data.map((entry) => (
                            <Cell
                              key={`rem-${entry.id}`}
                              fill={entry.remaining < 0 ? "#ef4444" : "#10b981"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Budget
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Spent
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Remaining
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {data.map((d, idx) => (
                        <tr
                          key={d.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                          style={{
                            animation: `fadeIn 0.3s ease-in ${
                              idx * 0.05
                            }s both`,
                          }}
                        >
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-3 shrink-0"
                                style={{ backgroundColor: d.color }}
                              ></div>
                              <span className="text-sm lg:text-base font-medium text-gray-900">
                                {d.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm lg:text-base text-right text-gray-700">
                            {formatCurrency(d.budget)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm lg:text-base text-right text-gray-700">
                            {formatCurrency(d.spent)}
                          </td>
                          <td
                            className={`px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm lg:text-base text-right font-semibold ${
                              d.remaining < 0
                                ? "text-red-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {formatCurrency(d.remaining)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
