"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/services/api";
import { getAdminToken } from "@/lib/auth";

export default function MappingMaster() {
  const [services, setServices] = useState([]);
  const [items, setItems] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [formData, setFormData] = useState({ serviceId: "", itemId: "", priceOverride: "" });

  const fetchData = async () => {
    try {
      const apiUrl = API_BASE_URL;
      const token = localStorage.getItem("admin_token");
      
      const [sRes, iRes, mRes] = await Promise.all([
        axios.get(`${apiUrl}/api/services`),
        axios.get(`${apiUrl}/api/services/admin/items`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/api/services/admin/mappings`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setServices(sRes.data);
      setItems(iRes.data);
      setMappings(mRes.data);
      
      if (sRes.data.length > 0) setFormData(f => ({ ...f, serviceId: sRes.data[0]._id }));
      if (iRes.data.length > 0) setFormData(f => ({ ...f, itemId: iRes.data[0]._id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const apiUrl = API_BASE_URL;
      await axios.post(`${apiUrl}/api/services/admin/service-items`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      alert("Mapping created!");
    } catch (err) {
      alert("Error creating mapping (already exists?)");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Service-Item Mapping</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Link items to services (e.g. add Shirt to Wash & Iron).</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Select Service</label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-zinc-200 p-2.5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Select Item</label>
            <select
              value={formData.itemId}
              onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-zinc-200 p-2.5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Price Override (Optional)</label>
            <input
              type="number"
              value={formData.priceOverride}
              onChange={(e) => setFormData({ ...formData, priceOverride: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-zinc-200 p-2.5 dark:border-zinc-800 dark:bg-zinc-900"
              placeholder="e.g. 50"
            />
          </div>
        </div>
        <button type="submit" className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition-colors">
          Link Item to Service
        </button>
      </form>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <th className="px-6 py-4 font-bold">Service</th>
              <th className="px-6 py-4 font-bold">Item</th>
              <th className="px-6 py-4 font-bold">Override</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {mappings.map((m) => (
              <tr key={m._id}>
                <td className="px-6 py-4 font-medium">{m.serviceId?.name}</td>
                <td className="px-6 py-4">{m.itemId?.name}</td>
                <td className="px-6 py-4">{m.priceOverride ? `₹${m.priceOverride}` : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
