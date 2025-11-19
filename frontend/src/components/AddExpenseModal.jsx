import React, { useEffect, useRef, useState } from "react";

export default function AddExpenseModal({
  open,
  onClose,
  categories = [],
  onSave,
  defaultCategoryId,
}) {
  const [form, setForm] = useState({
    categoryId: defaultCategoryId || "",
    amount: "",
    date: new Date().toISOString().substring(0, 10),
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (open) {
      setForm((f) => ({
        ...f,
        categoryId:
          defaultCategoryId || f.categoryId || categories[0]?.id || "",
      }));
      setTimeout(() => ref.current?.focus(), 10);
    }
  }, [open, categories, defaultCategoryId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.categoryId || !form.amount || !form.date) return;
    setSaving(true);

    try {
      await onSave({
        categoryId: form.categoryId,
        amount: parseFloat(form.amount),
        date: form.date,
        description: form.description,
      });
      setForm({
        categoryId: defaultCategoryId || categories[0]?.id || "",
        amount: "",
        date: new Date().toISOString().substring(0, 10),
        description: "",
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSave}
        className="w-full max-w-md bg-white rounded-lg shadow p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-3">Add Expense</h3>

        <label className="block text-sm text-gray-700 mb-1">Category</label>
        <select
          ref={ref}
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="block text-sm text-gray-700 mb-1">Amount (Rs)</label>
        <input
          type="number"
          step="0"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />

        <label className="block text-sm text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional"
        />

        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded border text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
