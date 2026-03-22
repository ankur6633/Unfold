"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import { fetchUserOrders } from "@/services/orderApi";
import { getUserToken } from "@/lib/auth";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useMemo(() => getUserToken(), []);

  useEffect(() => {
    async function load() {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.email || !token) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchUserOrders(user.email, token);
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Your Orders</h1>

        {loading ? (
          <div className="mt-10 text-zinc-600 dark:text-zinc-400">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="mt-10 text-center py-12 bg-white rounded-2xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
             <p className="text-zinc-500">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <p className="text-xs font-medium uppercase text-zinc-500 tracking-wider">Order ID</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">#{order._id.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-zinc-500 tracking-wider">Date & Time</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-zinc-500 tracking-wider">Status</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Washed' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'Washing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Pickup' ? 'bg-purple-100 text-purple-800' :
                      'bg-zinc-100 text-zinc-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                   <div>
                    <p className="text-xs font-medium uppercase text-zinc-500 tracking-wider">Total</p>
                    <p className="text-sm font-bold text-blue-600">₹{(order.totalPrice || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {order.items.map((group, gIdx) => (
                    <div key={gIdx} className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                      <p className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                        {group.serviceName} 
                        <span className="ml-2 font-normal text-zinc-400">
                          (₹{group.basePrice}/{group.priceType})
                        </span>
                      </p>
                      <ul className="mt-2 space-y-1">
                        {group.items.map((item, iIdx) => (
                          <li key={iIdx} className="text-sm text-zinc-700 dark:text-zinc-300 flex justify-between">
                            <span>{item.name}</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">× {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 border-t border-zinc-100 pt-2 flex justify-between items-center dark:border-zinc-800">
                        <span className="text-[10px] text-zinc-400 uppercase font-medium">Service Total</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">₹{(group.serviceTotal || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
