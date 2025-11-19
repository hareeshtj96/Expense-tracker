import React, { useState } from "react";
import api from "../services/api";

export default function CategoriesList({
  categories = [],
  onAdded,
  onEdit,
  onDelete,
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", color: "#60a5fa", budget: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || form.name.trim() === "") {
      setError("Name is required");
      return;
    }
    const budgetNum = form.budget === "" ? 0 : Number(form.budget);
    if (form.budget !== "" && (isNaN(budgetNum) || budgetNum < 0)) {
      setError("Budget must be a positive number");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        color: form.color || "#60a5fa",
        budget: budgetNum,
      };
      const res = await api.post("/categories", payload);
      const created = res.data;

      // Normalize backend _id to id for UI convenience
      const uiCategory = {
        id: created._id || created.id || Date.now(),
        name: created.name,
        color: created.color,
        budget: Number(created.budget || created.budget || payload.budget || 0),
        // include other fields if needed
      };

      // notify parent
      onAdded && onAdded(uiCategory);

      // reset form
      setForm({ name: "", color: "#60a5fa", budget: "" });
      setAdding(false);
    } catch (err) {
      console.error("Create category failed", err);
      // show backend message if available
      const msg = err?.response?.data?.message || "Could not create category";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (color) => setForm((f) => ({ ...f, color }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Categories</h3>
        <button
          type="button"
          onClick={() => {
            setAdding((v) => !v);
            setError("");
          }}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
        >
          {adding ? "Close" : "Add"}
        </button>
      </div>

      {adding && (
        <form onSubmit={submit} className="space-y-2 mb-3">
          <div>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Category name (e.g. Food)"
              className="w-full px-3 py-2 border rounded"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-12 h-10 p-0 border rounded"
                disabled={loading}
                aria-label="Choose category color"
              />

              <div className="flex gap-2">
                {presetColors.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => handlePresetClick(c)}
                    title={c}
                    className={`w-8 h-8 rounded-full border ${
                      form.color === c
                        ? "ring-2 ring-offset-1 ring-blue-500"
                        : ""
                    }`}
                    style={{ background: c }}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <input
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="Monthly budget (₹)"
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border rounded"
              disabled={loading}
            />
            <div className="text-xs text-gray-400 mt-1">
              Enter budget in rupees (e.g. 500)
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: c.color }}
              />
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">
                  ₹{Number(c.budget || 0).toFixed(2)} / month
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit && onEdit(c.id)}
                className="text-xs px-2 py-1 border rounded"
                aria-label={`Edit ${c.name}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete && onDelete(c.id)}
                className="text-xs px-2 py-1 border rounded text-red-600"
                aria-label={`Delete ${c.name}`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}

        {categories.length === 0 && (
          <li className="text-gray-500 text-sm">No categories yet.</li>
        )}
      </ul>
    </div>
  );
}
