"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { getAdminToken } from "@/lib/auth";
import { 
  Users as UsersIcon, 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag,
  ArrowRight,
  X
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = getAdminToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.get(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (email) => {
    setOrdersLoading(true);
    try {
      const token = getAdminToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.get(`${apiUrl}/api/admin/users/${email}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOpenDetails = (user) => {
    setSelectedUser(user);
    fetchUserOrders(user.email);
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-blue-600" />
            User Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">View and manage all registered customers.</p>
        </div>
        
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4 text-center">Orders</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-zinc-100 dark:bg-zinc-800"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-48 rounded bg-zinc-100 dark:bg-zinc-800"></div></td>
                  <td className="px-6 py-4"><div className="mx-auto h-4 w-10 rounded bg-zinc-100 dark:bg-zinc-800"></div></td>
                  <td className="px-6 py-4"><div className="ml-auto h-8 w-8 rounded bg-zinc-100 dark:bg-zinc-800"></div></td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-zinc-500">No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-white">{user.fullName || "Unnamed User"}</div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">ID: {user._id.slice(-6)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                    {user.mobile && (
                      <div className="mt-0.5 flex items-center gap-2 text-zinc-500">
                        <Phone className="h-3 w-3" />
                        {user.mobile}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {user.orderCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenDetails(user)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:border-blue-500 hover:text-blue-600 transition-all dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-blue-400 dark:hover:text-blue-400"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-950 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Basic Info & Addresses */}
                <div className="md:col-span-1 space-y-8">
                  <section>
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">
                      Customer Profile
                    </h3>
                    <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/30">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Full Name</div>
                        <div className="text-sm font-semibold">{selectedUser.fullName || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Email Address</div>
                        <div className="text-sm font-semibold truncate">{selectedUser.email}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Mobile Number</div>
                        <div className="text-sm font-semibold">{selectedUser.mobile || "N/A"}</div>
                      </div>
                      {selectedUser.altMobile && (
                        <div>
                          <div className="text-[10px] uppercase font-bold text-zinc-400">Alternate Phone</div>
                          <div className="text-sm font-semibold">{selectedUser.altMobile}</div>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">
                      Saved Addresses
                    </h3>
                    <div className="space-y-3">
                      {!selectedUser.addresses || selectedUser.addresses.length === 0 ? (
                        <div className="text-xs text-zinc-500 bg-zinc-50 p-4 rounded-xl text-center italic">No addresses saved.</div>
                      ) : (
                        selectedUser.addresses.map((addr, idx) => (
                          <div key={idx} className="flex gap-3 rounded-xl border border-zinc-100 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                            <MapPin className="h-4 w-4 shrink-0 text-zinc-400 mt-1" />
                            <div>
                              <div className="font-bold text-xs uppercase text-blue-600">{addr.type || "Address"}</div>
                              <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{addr.addressLine}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                {/* Right Column: Order History */}
                <div className="md:col-span-2">
                  <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">
                    Order History ({userOrders.length})
                  </h3>
                  
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                  ) : userOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 text-zinc-400">
                      <ShoppingBag className="h-12 w-12 mb-3 opacity-20" />
                      <p>No orders from this customer yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order) => (
                        <div key={order._id} className="group flex items-center justify-between rounded-xl border border-zinc-100 p-4 hover:border-blue-200 transition-all dark:border-zinc-800 dark:hover:border-blue-900/30">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">#{order._id.slice(-8)}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                order.status === "Delivered" ? "bg-green-100 text-green-700" :
                                order.status === "Rejected" ? "bg-red-100 text-red-700" :
                                "bg-blue-100 text-blue-700"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">
                              {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })} • ₹{order.totalPrice}
                            </div>
                          </div>
                          <Link 
                            href={`/admin`} 
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-all dark:bg-zinc-900"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
