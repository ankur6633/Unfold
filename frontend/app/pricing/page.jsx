"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/services/api";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PricingPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const { addToCart, cart } = useCart();

  useEffect(() => {
    async function fetchServices() {
      try {
        const apiUrl = API_BASE_URL;
        const res = await axios.get(`${apiUrl}/api/services`);
        setServices(res.data);
        
        const initialQtys = {};
        res.data.forEach(service => {
          initialQtys[service._id] = {};
          if (service.items) {
            service.items.forEach(item => {
              initialQtys[service._id][item._id] = 0;
            });
          }
        });
        setQuantities(initialQtys);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const handleQtyChange = (serviceId, itemId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [itemId]: Math.max(0, (prev[serviceId][itemId] || 0) + delta)
      }
    }));
  };

  const handleAddToCart = (service) => {
    // Add the service with 0 items initially. 
    // The user will select items in the Cart page.
    addToCart(service, []); 
    const { showToast } = require("@/lib/alert");
    showToast(`${service.name} added! Go to cart to select items.`);
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black font-sans">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg shadow-blue-500/20"></div>
        <p className="mt-4 text-sm font-bold tracking-widest text-zinc-400 uppercase">Experience Unfolding...</p>
      </div>
    );
  }

  // Define some vibrant gradients for the cards
  const gradients = [
    "from-blue-600 to-indigo-700 shadow-blue-500/30",
    "from-emerald-500 to-teal-700 shadow-emerald-500/30",
    "from-amber-400 to-orange-600 shadow-amber-500/30",
    "from-rose-500 to-red-700 shadow-rose-500/30",
    "from-violet-600 to-purple-800 shadow-purple-500/30",
    "from-sky-400 to-blue-600 shadow-sky-500/30",
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950/20">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative text-center mb-20">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
          <h1 className="text-5xl font-black tracking-tighter text-zinc-900 sm:text-7xl dark:text-white">
            Premium <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-zinc-500 dark:text-zinc-400">
            Professional care for every fabric. Choose a service that matches your needs and unlock enterprise-level quality.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service, index) => (
            <div
              key={service._id}
              className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:hover:border-zinc-700"
            >
              {/* Card Header with Gradient Icon Area */}
              <div className={`h-32 bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center relative overflow-hidden`}>
                 <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                    <svg className="h-full w-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="15" stroke="white" strokeWidth="2" />
                      <circle cx="80" cy="80" r="25" stroke="white" strokeWidth="2" />
                      <path d="M10 90 L90 10" stroke="white" strokeWidth="2" />
                    </svg>
                 </div>
                 <div className="text-4xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                    {/* Extract emoji if present in name, or use default */}
                    {service.name.match(/\p{Emoji}/u)?.[0] || '✨'}
                 </div>
              </div>

              <div className="flex flex-1 flex-col p-8 px-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                    {service.name.replace(/\p{Emoji}/gu, '').trim()}
                  </h2>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-zinc-900 dark:text-white">₹{service.basePrice}</span>
                    <span className="text-sm font-bold text-zinc-400 uppercase tracking-tighter">/ {service.priceType}</span>
                  </div>
                </div>

                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2 min-h-[2.5rem]">
                  {service.description || `Superior ${service.name.toLowerCase()} for your premium garments.`}
                </p>

                <div className="mt-8 flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl">
                    <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Enterprise Standard Guaranteed
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(service)}
                  className={`mt-10 block w-full rounded-2xl py-4 text-center text-sm font-extrabold transition-all transform active:scale-95 shadow-xl ${
                    cart.some(g => g.serviceId === service._id) 
                      ? 'bg-blue-600 text-white shadow-blue-500/25' 
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-zinc-200 dark:shadow-none hover:shadow-zinc-300'
                  }`}
                >
                  {cart.some(g => g.serviceId === service._id) ? 'Selected' : 'Book Service'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
