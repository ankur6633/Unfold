"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function ItemMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ name: "", unitType: "piece" });
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      // We don't have a public GET /items yet, so we'll use a hack or implement it.
      // For now, let's assume we can fetch them via services or implement a new route.
      // I'll implement a simple GET /api/services/admin/items route in the controller next.
      const token = localStorage.getItem("admin_token");
      const res = await axios.get(`${apiUrl}/api/services/admin/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.post(`${apiUrl}/api/services/admin/items`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { showToast } = require("@/lib/alert");
      showToast("Item created successfully!");
      setFormData({ name: "", unitType: "piece" });
      fetchItems();
    } catch (err) {
      const { showError } = require("@/lib/alert");
      showError("Creation Failed", "Error creating item.");
    }
  };

  const handleDelete = async (id) => {
    const { showConfirm, showToast, showError } = require("@/lib/alert");
    const result = await showConfirm("Delete Item", "Are you sure? This will remove the item and all its service mappings.");
    
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("admin_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        await axios.delete(`${apiUrl}/api/services/admin/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Item deleted", "success");
        fetchItems();
      } catch (err) {
        showError("Delete Failed", "Could not delete item.");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Item Master</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Add clothing and household items to the database.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Item Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-zinc-200 p-2.5 dark:border-zinc-800 dark:bg-zinc-900"
              placeholder="e.g. Shirt"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Default Unit</label>
            <select
              value={formData.unitType}
              onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-zinc-200 p-2.5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <option value="piece">Piece</option>
              <option value="pair">Pair</option>
              <option value="kg">KG</option>
              <option value="bundle">Bundle</option>
            </select>
          </div>
        </div>
        <button type="submit" className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition-colors">
          Add Item
        </button>
      </form>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <th className="px-6 py-4 font-bold text-zinc-900 dark:text-white">Item Name</th>
              <th className="px-6 py-4 font-bold text-zinc-900 dark:text-white">Unit Type</th>
              <th className="px-6 py-4 font-bold text-zinc-900 dark:text-white text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.map((i) => (
              <tr key={i._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{i.name}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 uppercase">
                    {i.unitType}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(i._id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                    title="Delete Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
