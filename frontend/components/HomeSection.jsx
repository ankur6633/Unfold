"use client";

import Link from "next/link";

export default function HomeSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
            Premium Laundry Services <br />
            <span className="text-blue-600">Delivered to Your Door</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Professional garment care with eco-friendly cleaning methods. 
            Experience the luxury of more free time while we handle your laundry.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              href="#products"
              className="rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-500"
            >
              Book a Wash
            </Link>
            <Link
              href="#about"
              className="rounded-full border border-zinc-200 bg-white px-8 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute top-0 -z-10 h-full w-full opacity-10 dark:opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          <div className="h-[600px] w-[600px] rounded-full bg-blue-400 blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}
