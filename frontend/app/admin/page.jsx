"use client";

import { useEffect, useMemo, useState } from "react";

import { fetchAllOrders, updateOrderStatus } from "@/services/orderApi";
import { getAdminToken } from "@/lib/auth";

const STATUSES = ["Booked", "Pickup", "Washing", "Washed", "Delivered", "Rejected"];

export default function ManagePage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const token = useMemo(() => getAdminToken(), []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!token) return;
      try {
        setLoading(true);
        const data = await fetchAllOrders({ token });
        if (mounted) setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function handleStatusChange(orderId, newStatus) {
    if (!token) return;
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus({ token, id: orderId, status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Manage products and orders.</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold">Orders</h2>
        {loading ? (
          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">
            No orders yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => {
              const isRejected = order.status === "Rejected";
              return (
                <div
                  key={order._id}
                  className={`rounded-xl border p-5 shadow-sm transition-all ${
                    isRejected 
                      ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10" 
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isRejected ? 'text-red-700 dark:text-red-400' : 'text-zinc-900 dark:text-white'}`}>
                          Order #{order._id.slice(-8)}
                        </span>
                        <span className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleString()}</span>
                        {isRejected && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                            REJECTED
                          </span>
                        )}
                      </div>
                    <div className="mt-1 text-zinc-600 dark:text-zinc-400">
                      Customer: <span className="font-medium text-zinc-900 dark:text-zinc-100">{order.userEmail}</span>
                    </div>
                  </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Status
                      </div>
                      <select
                        value={order.status || "Pending"}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingOrderId === order._id}
                        className={`h-10 rounded-lg border px-3 text-sm focus:ring-2 transition-all ${
                          isRejected 
                            ? "border-red-300 bg-white text-red-600 focus:ring-red-500" 
                            : "border-zinc-200 bg-white focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
                        }`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">
                  <div className="font-semibold">Items</div>
                  <ul className="mt-2 list-disc pl-5">
                    {(order.items || []).map((item, idx) => (
                      <li key={`${item.productId || idx}-${idx}`}>
                        {item.name} x {item.quantity} - ${item.price}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 font-semibold">Total: ${order.totalPrice}</div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}

