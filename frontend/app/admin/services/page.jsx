"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/services/api";
import { getAdminToken } from "@/lib/auth";

export default function ServiceMaster() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: "", priceType: "kg", basePrice: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchServices = async () => {
    try {
      const apiUrl = API_BASE_URL;
      const res = await axios.get(`${apiUrl}/api/services`);
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const apiUrl = API_BASE_URL;
      
      if (editingId) {
        await axios.put(`${apiUrl}/api/services/admin/services/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Service updated!");
      } else {
        await axios.post(`${apiUrl}/api/services/admin/services`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Service created!");
      }
      
      setFormData({ name: "", priceType: "kg", basePrice: "", description: "" });
      setEditingId(null);
      setShowModal(false);
      fetchServices();
    } catch (err) {
      alert("Error saving service: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      priceType: service.priceType,
      basePrice: service.basePrice,
      description: service.description || ""
    });
    setEditingId(service._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const apiUrl = API_BASE_URL;
      await axios.delete(`${apiUrl}/api/services/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Service deleted!");
      fetchServices();
    } catch (err) {
      alert("Error deleting service");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Pricing Management</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Manage your laundry services, pricing types, and enterprise-level offerings.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", priceType: "kg", basePrice: "", description: "" });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Service
        </button>
      </div>

      {/* Services List Card */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
        <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="font-bold text-zinc-900 dark:text-white">All Services</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-500 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-6 py-4">Service Details</th>
                <th className="px-6 py-4">Price / Unit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-zinc-500">Loading services...</td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-zinc-500">No services found. Add your first service above.</td>
                </tr>
              ) : services.map((s) => (
                <tr key={s._id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-base text-zinc-900 dark:text-white">{s.name}</span>
                      <span className="text-xs text-zinc-500 mt-0.5">{s.description || 'No description provided'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">₹{s.basePrice}</span>
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-tighter">/ {s.priceType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(s)}
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-all shadow-sm"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(s._id)}
                        className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all shadow-sm"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500">Service Name & Icon</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition-all"
                  placeholder="e.g. 🔹👕 Wash & Fold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-zinc-500">Price Type</label>
                  <select
                    value={formData.priceType}
                    onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                    className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition-all"
                  >
                    <option value="kg">Per KG</option>
                    <option value="piece">Per Piece</option>
                    <option value="pair">Per Pair</option>
                    <option value="bundle">Flat Bundle</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-zinc-500">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition-all"
                    placeholder="35"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 outline-none transition-all resize-none"
                  placeholder="Premium care for your garments..."
                />
              </div>

              <button 
                type="submit" 
                className="w-full rounded-2xl bg-zinc-900 py-4 font-bold text-white shadow-xl hover:bg-zinc-800 active:scale-95 transition-all dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                {editingId ? 'Update Service' : 'Save Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
