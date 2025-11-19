import React, { useState, useRef, useEffect } from "react";
import MonthSelector from "./MonthSelector";
import { Plus, BarChart, User, LogOut } from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export default function Header({
  monthValue,
  onMonthChange,
  onOpenAddExpense,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setOpen(false));

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      navigate("/login", { replace: true });
    }
  }

  function handleReports() {
    navigate("/reports", {
      state: { monthValue },
    });
  }

  return (
    <header className="w-full bg-white p-4 sm:p-6 mb-6 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left Side: Title */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Budget Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track spending and manage your monthly budget
        </p>
      </div>

      {/* Right Side: Controls */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
        <MonthSelector value={monthValue} onChange={onMonthChange} />

        {/* Add Expense Button */}
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>

        {/* Reports Button */}
        <button
          onClick={handleReports}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200"
        >
          <BarChart className="h-5 w-5" />
          <span className="hidden sm:inline">Reports</span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((p) => !p)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <User className="h-6 w-6 text-gray-700" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
