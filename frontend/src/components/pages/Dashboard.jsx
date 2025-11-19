import React, { useEffect, useMemo, useState } from "react";
import Header from "../Header";
import CategoryCard from "../CategoryCard";
import AddExpenseModal from "../AddExpenseModal";
import CategoryEditModal from "../CategoryEditModal";
import ConfirmDialog from "../ConfirmDialog";
import CategoriesList from "../CategoryList";
import api from "../../services/api";
import Spinner from "../Spinner";
import { toast, ToastContainer } from "react-toastify";
import { useCallback } from "react";

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [monthlyBudgetsForm, setMonthlyBudgetsForm] = useState({});
  const [isSavingBudgets, setIsSavingBudgets] = useState(false);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [modalDefaultCategory, setModalDefaultCategory] = useState(null);
  const [categoryEditOpen, setCategoryEditOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // open modal
  const openCategoryEditModal = (id) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setCategoryToEdit(cat);
    setCategoryEditOpen(true);
  };

  // Load categories
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCategories(true);
      try {
        const res = await api.get("/categories");
        if (!mounted) return;
        const mapped = res.data.map((c) => ({
          id: c._id,
          name: c.name,
          color: c.color,
          budget: Number(c.budget || 0),
        }));
        setCategories(mapped);
      } catch (err) {
        console.error(err);
        setError("Failed to load categories");
        toast.error("Failed to load categories");
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // parse month
  const parseMonth = (yyyymm) => {
    const [y, m] = (yyyymm || "").split("-");
    return { year: Number(y), month: Number(m) };
  };

  // load expenses for month
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingExpenses(true);
      setError(null);
      try {
        const { year, month } = parseMonth(selectedMonth);
        const res = await api.get(`/expenses?year=${year}&month=${month}`);
        if (!mounted) return;
        const mapped = (res.data || []).map((e) => ({
          id: e._id || e.id,
          categoryId: e.categoryId,
          amount: Number(e.amount || 0),
          date: e.date
            ? e.date.substring(0, 10)
            : new Date().toISOString().substring(0, 10),
          description: e.description || "",
        }));
        setExpenses(mapped);
      } catch (err) {
        console.error("Failed to load expenses", err);
        setError("Failed to load expenses");
        toast.error("Failed to load expenses");
        setExpenses([]);
      } finally {
        if (mounted) setLoadingExpenses(false);
      }
    })();
    return () => (mounted = false);
  }, [selectedMonth]);

  // Extract budget
  const fetchBudgetsForMonth = useCallback(async (monthstr) => {
    let mounted = true;
    setLoadingBudgets(true);
    try {
      const { year, month } = parseMonth(monthstr);
      const res = await api.get(`/budgets?year=${year}&month=${month}`);
      setBudgets(res.data || []);
    } catch (error) {
      console.error("Failed to load Budget", error);
      setBudgets([]);
    } finally {
      setLoadingBudgets(false);
    }
    return () => (mounted = false);
  }, []);

  // load budget for selected month
  useEffect(() => {
    fetchBudgetsForMonth(selectedMonth);
  }, [selectedMonth, fetchBudgetsForMonth]);

  useEffect(() => {
    const handler = () => fetchBudgetsForMonth(selectedMonth);
    window.addEventListener("budgets:changed", handler);
    return () => window.removeEventListener("budgets:changed", handler);
  }, [selectedMonth, fetchBudgetsForMonth]);

  const budgetsMap = useMemo(() => {
    const m = {};
    (budgets || []).forEach((b) => {
      m[String(b.categoryId)] = b;
    });
    return m;
  }, [budgets]);

  useEffect(() => {
    const formState = {};
    categories.forEach((c) => {
      const monthlyBudget = budgetsMap[c.id];
      // Use the specific monthly budget if it exists, otherwise the input is blank
      formState[c.id] = monthlyBudget?.limit ?? "";
    });
    setMonthlyBudgetsForm(formState);
  }, [budgetsMap, categories]);

  // spending By Category
  const monthKey = (dateStr) => (dateStr ? dateStr.substring(0, 7) : "");
  const spendingByCategory = useMemo(() => {
    const map = {};
    (expenses || []).forEach((exp) => {
      if (monthKey(exp.date) !== selectedMonth) return;
      map[exp.categoryId] =
        (map[exp.categoryId] || 0) + Number(exp.amount || 0);
    });
    return map;
  }, [expenses, selectedMonth]);

  const handleBudgetInputChange = (categoryId, value) => {
    setMonthlyBudgetsForm((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const onCategoryAdded = (newCat) => {
    setCategories((prev) => [...prev, newCat]);
    toast.success("Category created");
  };

  const handleDeleteCategory = async (id) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    try {
      const id = categoryToDelete;
      setDeleteModalOpen(false);

      await api.delete(`/categories/${id}`);

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setExpenses((prev) => prev.filter((e) => e.categoryId !== id));

      toast.success("Category deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    } finally {
      setCategoryToDelete(null);
    }
  };

  // Save monthly budget
  const handleSaveBudgets = async () => {
    setIsSavingBudgets(true);
    const { year, month } = parseMonth(selectedMonth);
    const promises = [];

    for (const categoryId in monthlyBudgetsForm) {
      const formValue = monthlyBudgetsForm[categoryId];
      const newLimit =
        formValue === "" || isNaN(parseFloat(formValue))
          ? null
          : parseFloat(formValue);

      const originalBudget = budgetsMap[categoryId];
      const originalLimit = originalBudget ? originalBudget.limit : null;

      // Only send a request if the value has changed
      if (newLimit !== originalLimit) {
        const payload = { categoryId, year, month, limit: newLimit };
        promises.push(api.post("/budgets", payload));
      }
    }

    if (promises.length === 0) {
      toast.info("No changes to save.");
      setIsSavingBudgets(false);
      return;
    }

    try {
      await Promise.all(promises);

      await fetchBudgetsForMonth(selectedMonth);

      toast.success("Budgets saved successfully!");
    } catch (err) {
      console.error("Failed to save budgets", err);
      toast.error(err?.response?.data?.message || "Failed to save budgets");
    } finally {
      setIsSavingBudgets(false);
    }
  };

  // Create expense
  const handleCreateExpense = async ({
    categoryId,
    amount,
    date,
    description,
  }) => {
    try {
      const payload = { categoryId, amount: Number(amount), date, description };
      const res = await api.post("/expenses", payload);
      const created = res.data.expense || res.data;
      const createdMapped = {
        id: created._id || created.id || Date.now(),
        categoryId: created.categoryId,
        amount: Number(created.amount || payload.amount),
        date: created.date ? created.date.substring(0, 10) : date,
        description: created.description || description || "",
      };
      if ((createdMapped.date || "").substring(0, 7) === selectedMonth) {
        setExpenses((prev) => [...prev, createdMapped]);
      }
      toast.success("Expense added");
      return res.data;
    } catch (err) {
      console.error("add expense failed", err);
      toast.error(err?.response?.data?.message || "Failed to add expense");
      throw err;
    }
  };

  // Update expense
  const handleEditExpense = async ({
    id,
    categoryId,
    amount,
    date,
    description,
  }) => {
    try {
      const payload = { categoryId, amount: Number(amount), date, description };
      const res = await api.put(`/expenses/${id}`, payload);
      const updated = res.data;
      const mapped = {
        id: updated._id || updated.id || id,
        categoryId: updated.categoryId,
        amount: Number(updated.amount || payload.amount),
        date: updated.date ? updated.date.substring(0, 10) : date,
        description: updated.description || description || "",
      };
      setExpenses((prev) => prev.map((e) => (e.id === mapped.id ? mapped : e)));
      toast.success("Expense updated");
      return res.data;
    } catch (err) {
      console.error("update expense failed", err);
      toast.error(err?.response?.data?.message || "Failed to update expense");
      throw err;
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success("Expense deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete expense");
    }
  };

  const handleCategorySave = async ({ id, name, color, budget }) => {
    try {
      const payload = { name, color, budget };
      const res = await api.put(`/categories/${id}`, payload);
      const updated = res.data;
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                name: updated.name,
                color: updated.color,
                budget: Number(updated.budget || payload.budget),
              }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to update category", err);
      // Pass error back to modal by throwing, modal will display error
      throw err;
    }
  };

  // Modal
  const handleModalSave = async (payload) => {
    if (editingExpense && editingExpense.id) {
      // editing
      return handleEditExpense({ id: editingExpense.id, ...payload });
    }
    return handleCreateExpense(payload);
  };

  // open modal for create or edit
  const openModalForCategory = (category) => {
    setModalDefaultCategory(category?.id || null);
    setEditingExpense(null);
    setModalOpen(true);
  };

  const openModalForEditExpense = (expense) => {
    setEditingExpense(expense);
    setModalDefaultCategory(expense?.categoryId || null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={2500} />
      <div className="max-w-6xl mx-auto">
        <Header
          monthValue={selectedMonth}
          onMonthChange={setSelectedMonth}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setModalOpen(true);
          }}
        />

        {/* Loaders and errors */}
        {(loadingCategories || loadingExpenses) && (
          <div className="mb-4 flex justify-center">
            <Spinner size={32} />
          </div>
        )}
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        {/* category cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              spent={spendingByCategory[category.id] || 0}
              budget={category.budget}
              onOpen={() => openModalForCategory(category)}
            />
          ))}
        </section>

        {/* categories list & monthly summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <CategoriesList
              categories={categories}
              onAdded={onCategoryAdded}
              onDelete={handleDeleteCategory}
              onEdit={openCategoryEditModal}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-3">
                Monthly Summary & Budgets
              </h3>
              <div className="space-y-3">
                {categories.map((c) => {
                  const spent = spendingByCategory[c.id] || 0;

                  const monthlyBudgetInputValue =
                    monthlyBudgetsForm[c.id] ?? "";

                  const monthlyLimit =
                    parseFloat(monthlyBudgetInputValue) >= 0
                      ? parseFloat(monthlyBudgetInputValue)
                      : c.budget;

                  const remaining = monthlyLimit - spent;

                  return (
                    <div
                      key={c.id}
                      className="grid grid-cols-3 items-center gap-4 border-b pb-3 last:border-b-0"
                    >
                      {/* Left Side: Category Name & Spending */}
                      <div className="col-span-1 flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: c.color }}
                        />
                        <div>
                          <div className="text-sm font-medium">{c.name}</div>
                          <div className="text-xs text-gray-500">
                            ₹{spent.toFixed(2)} spent
                          </div>
                        </div>
                      </div>

                      {/* Middle: Budget Input */}
                      <div className="col-span-1 flex items-center gap-2">
                        <span className="text-sm text-gray-500">₹</span>
                        <input
                          type="number"
                          value={monthlyBudgetInputValue}
                          onChange={(e) =>
                            handleBudgetInputChange(c.id, e.target.value)
                          }
                          placeholder={`Default: ${c.budget}`}
                          className="w-full p-1 border rounded-md text-sm text-right"
                        />
                      </div>

                      {/* Right Side: Remaining Amount */}
                      <div className="col-span-1 text-right">
                        <div
                          className={`text-sm ${
                            remaining < 0 ? "text-red-600" : "text-gray-700"
                          } font-semibold`}
                        >
                          {remaining >= 0
                            ? `Remaining ₹${remaining.toFixed(2)}`
                            : `Over by ₹${Math.abs(remaining).toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* NEW: Save Button for Budgets */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveBudgets}
                  disabled={isSavingBudgets}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isSavingBudgets ? "Saving..." : "Save Budgets"}
                </button>
              </div>

              {/* Small expenses list  */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Recent expenses</h4>
                <ul className="space-y-2">
                  {expenses.length === 0 && (
                    <li className="text-sm text-gray-500">
                      No expenses this month.
                    </li>
                  )}
                  {expenses.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-3 border p-2 rounded"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {categories.find((c) => c.id === e.categoryId)
                            ?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {e.date} • ₹{Number(e.amount).toFixed(2)} •{" "}
                          {e.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModalForEditExpense(e)}
                          className="text-xs px-2 py-1 border rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(e.id)}
                          className="text-xs px-2 py-1 border rounded text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <AddExpenseModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingExpense(null);
          }}
          categories={categories}
          defaultCategoryId={modalDefaultCategory}
          initialExpense={editingExpense}
          onSave={handleModalSave}
        />
        <CategoryEditModal
          open={categoryEditOpen}
          onClose={() => {
            setCategoryEditOpen(false);
            setCategoryToEdit(null);
          }}
          category={categoryToEdit}
          onSave={handleCategorySave}
          onDelete={handleDeleteCategory}
        />
        <ConfirmDialog
          open={deleteModalOpen}
          title="Delete Category?"
          message="This will NOT delete related expenses. Continue?"
          confirmText="Yes, Delete"
          cancelText="Cancel"
          onConfirm={confirmDeleteCategory}
          onCancel={() => {
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
          }}
        />
      </div>
    </div>
  );
}
