import React, { useEffect, useState } from "react";

export default function CategoryEditModal({ open, onClose, category, onSave }) {
  const [form, setForm] = useState({ name: "", color: "#60a5fa", budget: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const presetColors = [
    "#f97316",
    "#3b82f6",
    "#10b981",
    "#a855f7",
    "#ec4899",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
  ];

  useEffect(() => {
    if (open && category) {
      setForm({
        name: category.name || "",
        color: category.color || "#60a5fa",
        budget:
          category.budget !== undefined && category.budget !== null
            ? String(category.budget)
            : "",
      });
      setError("");
    }
    if (!open) {
      setSaving(false);
    }
  }, [open, category]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!form.name || form.name.trim() === "") {
      setError("Name is required");
      return;
    }
    const parsedBudget = form.budget === "" ? 0 : Number(form.budget);
    if (
      form.budget !== "" &&
      (!Number.isFinite(parsedBudget) || parsedBudget < 0)
    ) {
      setError("Budget must be a positive number");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: category.id,
        name: form.name.trim(),
        color: form.color || "#60a5fa",
        budget: parsedBudget,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("save category failed", err);
      setError(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-3">Edit Category</h3>

        <label className="block text-sm text-gray-700 mb-1">Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Category name"
          autoFocus
        />

        <label className="block text-sm text-gray-700 mb-1">Color</label>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-12 h-10 p-0 border rounded"
            aria-label="Pick color"
          />
          <div className="flex gap-2">
            {presetColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className={`w-8 h-8 rounded-full border ${
                  form.color === c ? "ring-2 ring-offset-1 ring-blue-500" : ""
                }`}
                style={{ background: c }}
                aria-label={`Pick ${c}`}
              />
            ))}
          </div>
        </div>

        <label className="block text-sm text-gray-700 mb-1">
          Monthly Budget (₹)
        </label>
        <input
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
          type="number"
          step="0.01"
          min="0"
          className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-3 py-2 border rounded text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
