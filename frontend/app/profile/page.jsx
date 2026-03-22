"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [profile, setProfile] = useState({
    fullName: "",
    mobile: "",
    altMobile: "",
    email: "",
    addresses: []
  });

  const [newAddress, setNewAddress] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false
  });

  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.get(`${apiUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
    const token = localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.put(`${apiUrl}/api/auth/profile`, {
        fullName: profile.fullName,
        mobile: profile.mobile,
        altMobile: profile.altMobile
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { showSuccess } = require("@/lib/alert");
      showSuccess("Profile Updated!");
    } catch (err) {
      const { showError } = require("@/lib/alert");
      showError("Update Failed", "Failed to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const token = localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.post(`${apiUrl}/api/auth/profile/address`, newAddress, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile({ ...profile, addresses: res.data.addresses });
      setNewAddress({
        label: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false
      });
      setShowAddressForm(false);
      const { showToast } = require("@/lib/alert");
      showToast("Address Added!");
    } catch (err) {
      const { showError } = require("@/lib/alert");
      showError("Failed to add address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const { showConfirm } = require("@/lib/alert");
    const result = await showConfirm("Delete Address", "Are you sure you want to remove this address?");
    if (!result.isConfirmed) return;
    
    const token = localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.delete(`${apiUrl}/api/auth/profile/address/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile({ ...profile, addresses: res.data.addresses });
      const { showToast } = require("@/lib/alert");
      showToast("Address Removed", "success");
    } catch (err) {
      const { showError } = require("@/lib/alert");
      showError("Delete Failed", "Failed to delete address.");
    }
  };

  const handleSetDefault = async (addressId) => {
    const token = localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.patch(`${apiUrl}/api/auth/profile/address/${addressId}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile({ ...profile, addresses: res.data.addresses });
      const { showToast } = require("@/lib/alert");
      showToast("Default Address Set!");
    } catch (err) {
      const { showError } = require("@/lib/alert");
      showError("Failed to set default address.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-8">My Profile</h1>
        

        <div className="grid gap-8 md:grid-cols-12">
          {/* Personal Details */}
          <section className="md:col-span-12 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Personal Details</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/50 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-zinc-500">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={profile.mobile}
                    onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    placeholder="Enter mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Alternate Mobile (Optional)</label>
                  <input
                    type="tel"
                    value={profile.altMobile}
                    onChange={(e) => setProfile({ ...profile, altMobile: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    placeholder="Enter alternate number"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="mt-4 rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update Profile"}
              </button>
            </form>
          </section>

          {/* Address Management */}
          <section className="md:col-span-12 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Saved Addresses</h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  + Add New Address
                </button>
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Label (e.g. Home, Office)</label>
                    <input
                      type="text"
                      required
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={newAddress.line1}
                      onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={newAddress.line2}
                      onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="rounded border-zinc-300"
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium">Set as default address</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Add Address
                  </button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {profile.addresses.length === 0 ? (
                <p className="text-zinc-500 text-sm">No addresses saved yet.</p>
              ) : (
                profile.addresses.map((addr) => (
                  <div key={addr._id} className={`p-4 rounded-xl border ${addr.isDefault ? 'border-blue-600 bg-blue-50/10' : 'border-zinc-200 dark:border-zinc-800'} relative`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-zinc-900 dark:text-white uppercase text-xs tracking-wider">{addr.label}</span>
                          {addr.isDefault && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">DEFAULT</span>}
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefault(addr._id)} className="text-xs font-medium text-blue-600 hover:underline">Set Default</button>
                        )}
                        <button onClick={() => handleDeleteAddress(addr._id)} className="text-xs font-medium text-red-600 hover:underline">Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
