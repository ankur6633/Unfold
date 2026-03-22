"use client";

import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/services/api";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const { data: session } = useSession();
  const { cart, updateItemQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]); // All available services from DB
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showProfileComplete, setShowProfileComplete] = useState(false);

  // Scheduling State
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  const today = new Date().toISOString().split('T')[0];

  const totalPrice = cart.reduce((acc, group) => acc + (group.serviceTotal || 0), 0);

  useEffect(() => {
    // If not logged in redirect to login
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token && !session) {
      router.push("/login?redirect=/cart");
    }
  }, [session, router]);

  useEffect(() => {
    fetchProfile();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const apiUrl = API_BASE_URL;
      const res = await axios.get(`${apiUrl}/api/services`);
      setServices(res.data);
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setProfileLoading(false);
      return;
    }

    try {
      const apiUrl = API_BASE_URL;
      const res = await axios.get(`${apiUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      const defaultAddr = res.data.addresses?.find(a => a.isDefault) || res.data.addresses?.[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!token || !user.email) {
      router.push("/login");
      return;
    }

    // Check if profile is complete
    if (!profile?.fullName || !profile?.mobile || !selectedAddressId) {
      setShowProfileComplete(true);
      return;
    }

    const selectedAddress = profile.addresses.find(a => a._id === selectedAddressId);

    setLoading(true);
    try {
      const apiUrl = API_BASE_URL;
      await axios.post(`${apiUrl}/api/orders`, {
        userEmail: user.email,
        items: cart,
        totalPrice,
        pickupAddress: {
          label: selectedAddress.label,
          line1: selectedAddress.line1,
          line2: selectedAddress.line2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode
        },
        customerName: profile.fullName,
        customerPhone: profile.mobile,
        alternatePhone: profile.altMobile,
        pickupDate,
        pickupTime,
        deliveryDate,
        deliveryTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      clearCart();
      const { showSuccess } = require("@/lib/alert");
      showSuccess("Order Placed!", "Your order has been booked successfully.");
      router.push("/orders");
    } catch (err) {
      const { showError } = require("@/lib/alert");
      showError("Checkout Failed", err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Header />
      
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-8">Your Cart</h1>
        

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <section className="lg:col-span-12 xl:col-span-8">
            {loading ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 animate-pulse">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading your order details...</p>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                <div className="bg-zinc-100 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
                <p className="text-zinc-500 font-medium">Your cart is empty.</p>
                <Link href="/" className="mt-4 inline-block px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">Start Shopping</Link>
              </div>
            ) : (
              <ul className="space-y-8">
                {cart.map((group) => {
                  // Find full service details to get ALL available items
                  const serviceMaster = services.find(s => s._id === group.serviceId);
                  const availableItems = serviceMaster?.items || [];
                  
                  return (
                  <li key={group.serviceId} className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-lg">
                    <div className="bg-zinc-50/50 px-8 py-5 flex justify-between items-center border-b border-zinc-200 dark:bg-zinc-800/20 dark:border-zinc-800">
                      <div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                          {group.serviceName}
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-600 text-white uppercase tracking-widest shadow-lg shadow-blue-500/20">
                            ₹{group.basePrice} / {group.priceType}
                          </span>
                        </h3>
                      </div>
                      <button
                        onClick={async () => {
                          const { showConfirm, showToast } = require("@/lib/alert");
                          const result = await showConfirm(
                            "Remove Service?",
                            `Are you sure you want to remove ${group.serviceName} and all its items?`
                          );
                          if (result.isConfirmed) {
                            removeFromCart(group.serviceId);
                            showToast(`${group.serviceName} removed`, "info");
                          }
                        }}
                        className="text-xs font-black text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 uppercase tracking-widest bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-full"
                      >
                       Remove Service
                      </button>
                    </div>

                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {availableItems.map((masterItem) => {
                          const cartItem = group.items.find(i => i.itemId === masterItem._id);
                          const quantity = cartItem?.quantity || 0;
                          const isSelected = quantity > 0;

                          return (
                            <div 
                              key={masterItem._id} 
                              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected ? 'border-blue-500 bg-blue-50/10 shadow-sm' : 'border-zinc-100 dark:border-zinc-800 opacity-60 hover:opacity-100'}`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{masterItem.name}</p>
                                  {isSelected && <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Selected</span>}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 rounded-full shadow-inner border border-zinc-100 dark:border-zinc-700 px-1 py-1">
                                <button 
                                  onClick={() => {
                                    updateItemQuantity(group.serviceId, masterItem._id, -1);
                                  }}
                                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-black text-lg"
                                >-</button>
                                <span className={`text-sm font-black min-w-[1.5rem] text-center ${isSelected ? 'text-blue-600' : 'text-zinc-400'}`}>{quantity}</span>
                                <button 
                                  onClick={() => {
                                    updateItemQuantity(group.serviceId, masterItem._id, 1, { name: masterItem.name });
                                  }}
                                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-black text-lg"
                                >+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Items Selected</p>
                          <p className="text-sm font-bold dark:text-white">{group.items.reduce((sum, i) => sum + i.quantity, 0)} Total</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Service Subtotal</p>
                          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">₹{(group.serviceTotal || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="mt-12 lg:col-span-12 xl:col-span-4 xl:mt-0 space-y-6">
            {/* Address Selection Section */}
            {!profileLoading && profile && (
              <div className="rounded-3xl bg-white p-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Pickup Address</h2>
                  <Link href="/profile" className="text-xs font-bold text-blue-600 hover:underline">Add New</Link>
                </div>
                
                {(!profile.addresses || profile.addresses.length === 0) ? (
                  <div className="text-center py-4 border-2 border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-2">No addresses found.</p>
                    <Link href="/profile" className="text-xs font-bold text-blue-600">Complete Profile</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile.addresses.map((addr) => (
                      <div 
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-blue-600 bg-blue-50/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`h-4 w-4 rounded-full border-4 ${selectedAddressId === addr._id ? 'border-blue-600 bg-white' : 'border-zinc-200 bg-transparent'}`} />
                          <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">{addr.label}</span>
                        </div>
                        <p className="text-[11px] leading-tight text-zinc-600 dark:text-zinc-400">
                          {addr.line1}, {addr.city}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User Info Section */}
            {!profileLoading && profile && (
              <div className="rounded-3xl bg-white p-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Contact Info</h2>
                {!profile.fullName || !profile.mobile ? (
                   <Link href="/profile" className="block text-center py-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-xs font-bold text-blue-600">
                     Update Missing Info
                   </Link>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold dark:text-white">{profile.fullName}</p>
                    <p className="text-xs text-zinc-500">{profile.mobile}</p>
                    {profile.altMobile && <p className="text-[10px] text-zinc-400">Alt: {profile.altMobile}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Scheduling Section */}
            <div className="rounded-3xl bg-white p-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Schedule Pickup & Delivery
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {/* Pickup */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pickup Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Date</label>
                      <input 
                        type="date" 
                        min={today}
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-800 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Time Slot</label>
                      <select 
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-800 outline-none"
                      >
                        <option value="">Select Time</option>
                        <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                        <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</option>
                        <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</option>
                        <option value="06:00 PM - 09:00 PM">06:00 PM - 09:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Delivery Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Date</label>
                      <input 
                        type="date" 
                        min={pickupDate || today}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-800 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Time Slot</label>
                      <select 
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-800 outline-none"
                      >
                        <option value="">Select Time</option>
                        <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                        <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</option>
                        <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</option>
                        <option value="06:00 PM - 09:00 PM">06:00 PM - 09:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="rounded-3xl bg-zinc-900 p-6 sm:p-8 dark:bg-white text-white dark:text-zinc-900 shadow-xl">
              <h2 className="text-xl font-black mb-6">Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 dark:border-zinc-100">
                  <dt className="text-xs font-bold uppercase tracking-widest text-zinc-400">Grand Total</dt>
                  <dd className="text-2xl font-black">₹{(totalPrice || 0).toFixed(2)}</dd>
                </div>
              </div>

              <div className="mt-8">
                <button
                  disabled={cart.length === 0 || loading || profileLoading || !profile?.fullName || !profile?.mobile || !selectedAddressId || !pickupDate || !pickupTime || !deliveryDate || !deliveryTime}
                  onClick={handleCheckout}
                  className="group relative w-full overflow-hidden rounded-full bg-blue-600 px-4 py-4 text-base font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/25 disabled:opacity-50 disabled:grayscale"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? "Processing..." : "Place Order"}
                    {!loading && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
                  </span>
                </button>
                
                {(!profileLoading && profile) && (!profile?.fullName || !profile?.mobile || !selectedAddressId || !pickupDate || !pickupTime || !deliveryDate || !deliveryTime) && (
                  <p className="mt-4 text-center text-[10px] font-bold text-red-400 uppercase tracking-tighter">
                    Please complete profile, select address, and schedule dates
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Basic modal or prompt can be added here if needed, but the UI already handles missing info redirects */}
    </div>
  );
}
