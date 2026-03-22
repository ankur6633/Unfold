"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HomeSection from "@/components/HomeSection";
import AboutSection from "@/components/AboutSection";
import axios from "axios";
import Link from "next/link";
import { API_BASE_URL } from "@/services/api";

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const apiUrl = API_BASE_URL;
        const res = await axios.get(`${apiUrl}/api/services`);
        setServices(res.data);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white transition-all dark:bg-black">
      <Header />
      
      <main>
        <HomeSection />
        
        <AboutSection />

        <section id="services" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              Our Cleaning Services
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Professional laundry and dry cleaning services starting at just ₹40/kg.
            </p>
          </div>

          {loading ? (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="mt-12 text-center text-zinc-500">
              No services available at the moment.
            </div>
          ) : (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Link 
                  href="/pricing" 
                  key={service._id}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200 p-8 transition-all hover:border-blue-500 hover:shadow-xl dark:border-zinc-800 dark:hover:border-blue-400"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{service.name}</h3>
                    <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <p className="mt-4 text-zinc-600 dark:text-zinc-400">{service.description || "High-quality professional cleaning."}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-xl font-bold dark:text-white">₹{service.basePrice}</span>
                    <span className="text-sm text-zinc-500">/{service.priceType}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>© 2026 UNFOLD Laundry Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
